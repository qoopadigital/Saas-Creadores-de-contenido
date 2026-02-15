"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ---- Schema ----
const profileSchema = z.object({
    username: z
        .string()
        .min(3, "El username debe tener al menos 3 caracteres")
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Solo se permiten letras, números, guiones y guiones bajos"
        )
        .optional(),
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

    // New fields
    selected_template: z.literal("simple").optional(),
    social_links: z.record(z.string(), z.string().optional()).optional(), // { instagram: 'user', ... }
    featured_content: z.array(z.string().url("Debe ser una URL válida")).optional(),
});

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autenticado" };
    }

    // Prepare data for validation
    const rawData: Record<string, unknown> = {};
    if (formData.has("username")) rawData.username = formData.get("username");
    if (formData.has("bio")) rawData.bio = formData.get("bio");
    if (formData.has("avatar_url")) rawData.avatar_url = formData.get("avatar_url");
    if (formData.has("selected_template")) rawData.selected_template = formData.get("selected_template");

    // Parse JSON fields
    if (formData.has("social_links")) {
        try {
            rawData.social_links = JSON.parse(formData.get("social_links") as string);
        } catch {
            return { error: "Formato de redes sociales inválido" };
        }
    }

    if (formData.has("featured_content")) {
        try {
            rawData.featured_content = JSON.parse(formData.get("featured_content") as string);
        } catch {
            return { error: "Formato de contenido destacado inválido" };
        }
    }

    // Validate
    const parsed = profileSchema.safeParse(rawData);

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Build update payload
    const updateData: Record<string, any> = {};
    if (parsed.data.username !== undefined) updateData.username = parsed.data.username;
    if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio || "";
    if (parsed.data.avatar_url !== undefined) updateData.avatar_url = parsed.data.avatar_url || "";

    if (parsed.data.selected_template !== undefined) updateData.selected_template = parsed.data.selected_template;
    if (parsed.data.social_links !== undefined) updateData.social_links = parsed.data.social_links;
    if (parsed.data.featured_content !== undefined) updateData.featured_content = parsed.data.featured_content;

    if (Object.keys(updateData).length === 0) {
        return { success: true };
    }

    // Update
    const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

    if (error) {
        if (error.code === "23505") {
            return { error: "Este nombre de usuario ya está en uso" };
        }
        return { error: error.message };
    }

    revalidatePath("/dashboard/public-profile");
    if (parsed.data.username) {
        revalidatePath(`/${parsed.data.username}`);
    }

    return { success: true };
}
