"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// BRANDS CRUD
// ============================================

export async function getBrands() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { data: null, error: "No autorizado" };

    const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching brands:", error);
        return { data: null, error: error.message };
    }
    return { data, error: null };
}

export async function createBrand(input: {
    name: string;
    contact_info?: string;
    payment_terms?: string;
    guidelines?: string;
    rating?: number;
}) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { data: null, error: "No autorizado" };

    const { data, error } = await supabase
        .from("brands")
        .insert({
            user_id: user.id,
            name: input.name,
            contact_info: input.contact_info || null,
            payment_terms: input.payment_terms || null,
            guidelines: input.guidelines || null,
            rating: input.rating || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating brand:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/directory");
    return { data, error: null };
}

export async function updateBrand(id: string, input: {
    name: string;
    contact_info?: string;
    payment_terms?: string;
    guidelines?: string;
    rating?: number;
}) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { data: null, error: "No autorizado" };

    const { data, error } = await supabase
        .from("brands")
        .update({
            name: input.name,
            contact_info: input.contact_info || null,
            payment_terms: input.payment_terms || null,
            guidelines: input.guidelines || null,
            rating: input.rating || null,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating brand:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/directory");
    revalidatePath("/dashboard/campaigns");
    return { data, error: null };
}

export async function deleteBrand(id: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "No autorizado" };

    const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting brand:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/directory");
    return { error: null };
}

// ============================================
// PROVIDERS CRUD
// ============================================

export async function getProviders() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { data: null, error: "No autorizado" };

    const { data, error } = await supabase
        .from("providers")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching providers:", error);
        return { data: null, error: error.message };
    }
    return { data, error: null };
}

export async function createProvider(input: {
    name: string;
    role?: string;
    contact_info?: string;
}) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { data: null, error: "No autorizado" };

    const { data, error } = await supabase
        .from("providers")
        .insert({
            user_id: user.id,
            name: input.name,
            role: input.role || null,
            contact_info: input.contact_info || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating provider:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/directory");
    return { data, error: null };
}

export async function updateProvider(id: string, input: {
    name: string;
    role?: string;
    contact_info?: string;
}) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { data: null, error: "No autorizado" };

    const { data, error } = await supabase
        .from("providers")
        .update({
            name: input.name,
            role: input.role || null,
            contact_info: input.contact_info || null,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating provider:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/directory");
    return { data, error: null };
}

export async function deleteProvider(id: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "No autorizado" };

    const { error } = await supabase
        .from("providers")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting provider:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/directory");
    return { error: null };
}

// ============================================
// PROVIDER PAYMENTS
// ============================================

export async function addProviderPayment(input: {
    provider_id: string;
    campaign_id?: string;
    amount: number;
    description: string;
    payment_date: string;
}) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { data: null, error: "No autorizado" };

    if (!input.amount || input.amount <= 0) return { data: null, error: "El monto debe ser mayor a 0" };
    if (!input.description.trim()) return { data: null, error: "La descripción es obligatoria" };

    const { data, error } = await supabase
        .from("provider_payments")
        .insert({
            user_id: user.id,
            provider_id: input.provider_id,
            campaign_id: input.campaign_id || null,
            amount: input.amount,
            description: input.description.trim(),
            payment_date: input.payment_date || new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating provider payment:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/directory");
    revalidatePath("/dashboard/finance");
    revalidatePath("/dashboard");
    return { data, error: null };
}

export async function getProviderPayments(providerId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { data: null, error: "No autorizado" };

    const { data, error } = await supabase
        .from("provider_payments")
        .select("*, campaigns(title)")
        .eq("provider_id", providerId)
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

    if (error) {
        console.error("Error fetching provider payments:", error);
        return { data: null, error: error.message };
    }

    // Flatten joined campaign title
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payments = (data || []).map((p: any) => ({
        ...p,
        campaign_title: p.campaigns?.title || null,
        campaigns: undefined,
    }));

    return { data: payments, error: null };
}

export async function deleteProviderPayment(paymentId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "No autorizado" };

    const { error } = await supabase
        .from("provider_payments")
        .delete()
        .eq("id", paymentId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting provider payment:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/directory");
    revalidatePath("/dashboard/finance");
    revalidatePath("/dashboard");
    return { error: null };
}

/** Returns a map of provider_id → total paid */
export async function getProvidersTotalPaid(): Promise<Record<string, number>> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return {};

    const { data, error } = await supabase
        .from("provider_payments")
        .select("provider_id, amount")
        .eq("user_id", user.id);

    if (error || !data) return {};

    const totals: Record<string, number> = {};
    data.forEach((p) => {
        totals[p.provider_id] = (totals[p.provider_id] || 0) + Number(p.amount);
    });
    return totals;
}
