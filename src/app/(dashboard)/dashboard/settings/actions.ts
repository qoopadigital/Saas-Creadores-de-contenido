"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ---- Schema ----
const profileSchema = z.object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    username: z
        .string()
        .min(3, "El username debe tener al menos 3 caracteres")
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Solo se permiten letras, números, guiones y guiones bajos"
        ),
    bio: z
        .string()
        .max(160, "La bio no puede superar los 160 caracteres")
        .optional()
        .or(z.literal("")),
    avatar_url: z
        .string()
        .url("Debe ser una URL válida")
        .optional()
        .or(z.literal("")),
});

export async function getProfile() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "No autenticado" };
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, username, full_name, bio, avatar_url, role")
        .eq("id", user.id)
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autenticado" };
    }

    // Validate
    const parsed = profileSchema.safeParse({
        full_name: formData.get("full_name"),
        username: formData.get("username"),
        bio: formData.get("bio"),
        avatar_url: formData.get("avatar_url"),
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Build update payload — only include avatar_url if provided
    const updateData: Record<string, string> = {
        full_name: parsed.data.full_name,
        username: parsed.data.username,
        bio: parsed.data.bio || "",
    };

    if (parsed.data.avatar_url) {
        updateData.avatar_url = parsed.data.avatar_url;
    }

    // Update
    const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

    if (error) {
        // PostgreSQL unique violation (code 23505)
        if (error.code === "23505") {
            return { error: "Este nombre de usuario ya está en uso" };
        }
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath(`/${parsed.data.username}`);
    return { success: true };
}
