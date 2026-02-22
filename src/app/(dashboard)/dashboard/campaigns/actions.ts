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
    tags: z.array(z.string()).optional().default([]),
    contract_links: z.array(z.string()).optional().default([]),
    notes: z.string().optional(),
    platforms: z.array(z.string()).optional().default([]),
    brand_id: z.string().uuid().optional().nullable(),
});

// ---- Get Campaigns ----
export async function getCampaigns() {
    const supabase = await createClient();

    const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*, expenses(amount), provider_payments(amount), campaign_tasks(is_completed)")
        .neq("is_archived", true)
        .order("created_at", { ascending: false });

    if (error) {
        return { error: error.message, data: null };
    }

    // Process campaigns to add total_expenses and task counts
    const processedCampaigns = campaigns.map(campaign => {
        const tasks = campaign.campaign_tasks || [];
        return {
            ...campaign,
            total_expenses:
                (campaign.expenses?.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0) || 0) +
                (campaign.provider_payments?.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0) || 0),
            tasks_total: tasks.length,
            tasks_completed: tasks.filter((t: { is_completed: boolean }) => t.is_completed).length,
        };
    });

    return { data: processedCampaigns, error: null };
}

// ---- Create Campaign ----
export async function createCampaign(formData: FormData) {
    const supabase = await createClient();

    // Safely parse JSON arrays
    const parseArray = (key: string) => {
        const val = formData.get(key);
        if (!val) return [];
        try {
            const parsed = JSON.parse(val as string);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    // Validate with Zod
    const brandId = formData.get("brand_id") as string || null;
    const parsed = campaignSchema.safeParse({
        title: formData.get("title"),
        brand_name: formData.get("brand_name"),
        budget: formData.get("budget"),
        deadline: formData.get("deadline"),
        status: "negotiation",
        tags: parseArray("tags"),
        contract_links: parseArray("contract_links"),
        notes: formData.get("notes") as string || undefined,
        platforms: parseArray("platforms"),
        brand_id: brandId || undefined,
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
    const updates: { status: string; payment_status?: string; invoice_date?: string } = { status: newStatus };

    // Fetch current campaign to check previous status and data
    const { data: currentCampaign, error: fetchError } = await supabase
        .from("campaigns")
        .select("status, payment_status, invoice_date")
        .eq("id", id)
        .eq("influencer_id", user.id)
        .single();

    if (fetchError || !currentCampaign) return { error: "Campaña no encontrada" };

    // 1. Moving TO 'paid'
    if (newStatus === "paid") {
        updates.payment_status = "paid";
        // Auto-set invoice date if missing
        if (!currentCampaign.invoice_date) {
            updates.invoice_date = new Date().toISOString();
        }
    }
    // 2. Moving FROM 'paid' (revert financial status)
    else if (currentCampaign.status === "paid" && newStatus !== "paid") {
        // Revert to 'pending' as requested (or 'invoiced' if we want to be specific, but 'pending' is safer generic)
        // User asked: "Actualiza payment_status a 'pending' (o 'invoiced' si tiene fecha)"
        // Let's check invoice_date
        updates.payment_status = currentCampaign.invoice_date ? "invoiced" : "pending";
    }

    const { error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .eq("influencer_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/finance"); // Important: refresh finances
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
    revalidatePath("/dashboard/campaigns/archived");
    revalidatePath("/dashboard/finance");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { success: true };
}

// ==== ARCHIVE SYSTEM ====

export async function getArchivedCampaigns() {
    const supabase = await createClient();

    const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*, expenses(amount), provider_payments(amount), campaign_tasks(is_completed)")
        .eq("is_archived", true)
        .order("created_at", { ascending: false });

    if (error) {
        return { error: error.message, data: null };
    }

    const processedCampaigns = campaigns.map(campaign => {
        const tasks = campaign.campaign_tasks || [];
        return {
            ...campaign,
            total_expenses:
                (campaign.expenses?.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0) || 0) +
                (campaign.provider_payments?.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0) || 0),
            tasks_total: tasks.length,
            tasks_completed: tasks.filter((t: { is_completed: boolean }) => t.is_completed).length,
        };
    });

    return { data: processedCampaigns, error: null };
}

export async function archiveCampaign(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    const { error } = await supabase
        .from("campaigns")
        .update({ is_archived: true })
        .eq("id", id)
        .eq("influencer_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/campaigns/archived");
    return { success: true };
}

export async function restoreCampaign(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    const { error } = await supabase
        .from("campaigns")
        .update({ is_archived: false })
        .eq("id", id)
        .eq("influencer_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/campaigns/archived");
    return { success: true };
}

export async function deleteCampaignPermanently(id: string) {
    // This replicates the hard delete to match the user's specific function request name
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id)
        .eq("influencer_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/campaigns/archived");
    revalidatePath("/dashboard/finance");
    return { success: true };
}

// ---- Update Campaign ----
export async function updateCampaign(formData: FormData) {
    const supabase = await createClient();

    const id = formData.get("id") as string;
    if (!id) {
        return { error: "ID de campaña requerido" };
    }

    // Safely parse JSON arrays
    const parseArray = (key: string) => {
        const val = formData.get(key);
        if (!val) return [];
        try {
            const parsed = JSON.parse(val as string);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const brandId = formData.get("brand_id") as string || null;
    const parsed = campaignSchema.safeParse({
        title: formData.get("title"),
        brand_name: formData.get("brand_name"),
        budget: formData.get("budget"),
        deadline: formData.get("deadline"),
        status: formData.get("status") || "negotiation",
        tags: parseArray("tags"),
        contract_links: parseArray("contract_links"),
        notes: formData.get("notes") as string || undefined,
        platforms: parseArray("platforms"),
        brand_id: brandId || undefined,
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

    // Extract extra financial fields manually (as they are optional/nullable and not in main schema)
    // Extract extra financial fields
    const paymentStatus = formData.get("payment_status") as string || "pending";
    const financialUpdates: {
        actual_hours: number | null;
        payment_status: string;
        invoice_date: string | null;
        invoice_number: string | null;
        payment_method: string | null;
        platform: string | null;
        status?: string; // We might update status too
    } = {
        actual_hours: formData.get("actual_hours") ? Number(formData.get("actual_hours")) : null,
        payment_status: paymentStatus,
        invoice_date: formData.get("invoice_date") as string || null,
        invoice_number: formData.get("invoice_number") as string || null,
        payment_method: formData.get("payment_method") as string || null,
        platform: formData.get("platform") as string || null,
    };

    // Cleanup Logic: If not paid/invoiced, clear invoice data? 
    // User requested: "si cambio de 'Pagado' a 'Pendiente', se limpien los campos de fecha, número y método de pago"
    if (paymentStatus === "pending" || paymentStatus === "negotiation") {
        financialUpdates.invoice_date = null;
        financialUpdates.invoice_number = null;
        financialUpdates.payment_method = null;
    }
    // If invoiced, we keep invoice data but maybe clear payment method if not paid?
    // User specifically asked about 'Paid' -> 'Pending'. 
    // Let's also ensure 'Invoiced' doesn't necessarily have payment method yet.
    if (paymentStatus === "invoiced") {
        financialUpdates.payment_method = null;
    }

    // --- Bidirectional Sync Logic for Edit Modal ---

    // 1. If user selects 'paid' in Form -> Force Kanban status to 'paid'
    if (paymentStatus === "paid") {
        financialUpdates.status = "paid";
        // Also ensure parsed data uses 'paid' if we are overriding it
        // But wait, parsed.data has 'status' too. We need to respect the finance tab override over the general tab if they conflict?
        // Usually finance tab is more specific about payment.
        // Let's override parsed.data.status if needed.
    }
    // 2. If user selects 'pending'/'invoiced' AND current status was 'paid' -> Revert to 'published'
    else {
        // We need to know current status to decide if we should revert. 
        // Fetch current campaign.
        const { data: currentCampaign } = await supabase
            .from("campaigns")
            .select("status")
            .eq("id", id)
            .single();

        if (currentCampaign?.status === "paid" && paymentStatus !== "paid") {
            // Move out of 'paid' column. 'published' is a safe fallback.
            financialUpdates.status = "published";
        }
    }


    const { error } = await supabase
        .from("campaigns")
        .update({
            ...parsed.data, // Original form data
            ...financialUpdates, // Financial overrides (including status sync)
            updated_at: new Date().toISOString(), // Force refresh for Activity feed
        })
        .eq("id", id)
        .eq("influencer_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/finance");
    return { success: true };
}

// ---- Campaign Expenses Actions ----

export async function getCampaignExpenses(campaignId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

    if (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }
    return data;
}

export async function createCampaignExpense(
    campaignId: string,
    description: string,
    amount: number | string,
    category: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return { error: "El monto debe ser un número válido mayor a 0" };
    }

    if (!campaignId) {
        return { error: "ID de campaña requerido" };
    }

    const { data, error } = await supabase.from("expenses").insert({
        user_id: user.id,
        campaign_id: campaignId,
        description,
        amount: numericAmount,
        category: category || "other",
        date: new Date().toISOString(),
    }).select().single();

    if (error) return { error: error.message };

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/finance");
    return { success: true, expense: data };
}

export async function deleteCampaignExpense(expenseId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/finance");
    return { success: true };
}

// ---- Get Provider Payments linked to a Campaign ----
export async function getCampaignProviderPayments(campaignId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("provider_payments")
        .select("id, amount, description, payment_date, providers(name)")
        .eq("campaign_id", campaignId)
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

    if (error) {
        console.error("Error fetching campaign provider payments:", error);
        return [];
    }

    // Flatten provider name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        description: p.description,
        payment_date: p.payment_date,
        provider_name: p.providers?.name || "Proveedor",
    }));
}

// ============================================
// CAMPAIGN TASKS (Checklist)
// ============================================

export async function getCampaignTasks(campaignId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("campaign_tasks")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching campaign tasks:", error);
        return [];
    }
    return data || [];
}

export async function addCampaignTask(campaignId: string, title: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "No autorizado" };

    if (!title.trim()) return { data: null, error: "El título es obligatorio" };

    const { data, error } = await supabase
        .from("campaign_tasks")
        .insert({
            campaign_id: campaignId,
            user_id: user.id,
            title: title.trim(),
            is_completed: false,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating campaign task:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    return { data, error: null };
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autorizado" };

    const { error } = await supabase
        .from("campaign_tasks")
        .update({ is_completed: isCompleted })
        .eq("id", taskId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error toggling task:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    return { error: null };
}

export async function deleteCampaignTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autorizado" };

    const { error } = await supabase
        .from("campaign_tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting task:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/campaigns");
    return { error: null };
}
