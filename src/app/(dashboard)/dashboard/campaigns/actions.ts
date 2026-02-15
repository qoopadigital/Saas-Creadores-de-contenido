"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ---- Schema ----
const campaignSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    brand_name: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
    budget: z.coerce.number().positive("El presupuesto debe ser positivo"),
    deadline: z.string().min(1, "La fecha límite es requerida"),
    status: z.string().default("negotiation"),
    tags: z.array(z.string()).optional(),
});

// ---- Get Campaigns ----
export async function getCampaigns() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return { error: error.message, data: null };
    }

    return { data, error: null };
}

// ---- Create Campaign ----
export async function createCampaign(formData: FormData) {
    const supabase = await createClient();

    // Validate with Zod
    const parsed = campaignSchema.safeParse({
        title: formData.get("title"),
        brand_name: formData.get("brand_name"),
        budget: formData.get("budget"),
        deadline: formData.get("deadline"),
        status: "negotiation",
        tags: formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [],
    });

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        return { error: firstError.message };
    }

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autenticado" };
    }

    // Insert
    const { error } = await supabase.from("campaigns").insert({
        ...parsed.data,
        influencer_id: user.id,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/finance");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { success: true };
}
export async function updateCampaignStatus(id: string, newStatus: string) {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autenticado" };
    }

    // Verify ownership and update
    const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("influencer_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    return { success: true };
}

// ---- Delete Campaign ----
export async function deleteCampaign(id: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autenticado" };
    }

    const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id)
        .eq("influencer_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/finance");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { success: true };
}

// ---- Update Campaign ----
export async function updateCampaign(formData: FormData) {
    const supabase = await createClient();

    const id = formData.get("id") as string;
    if (!id) {
        return { error: "ID de campaña requerido" };
    }

    const parsed = campaignSchema.safeParse({
        title: formData.get("title"),
        brand_name: formData.get("brand_name"),
        budget: formData.get("budget"),
        deadline: formData.get("deadline"),
        status: formData.get("status") || "negotiation",
        tags: formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [],
    });

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        return { error: firstError.message };
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autenticado" };
    }

    const { error } = await supabase
        .from("campaigns")
        .update(parsed.data)
        .eq("id", id)
        .eq("influencer_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    return { success: true };
}
