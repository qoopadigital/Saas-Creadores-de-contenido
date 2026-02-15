"use server";

import { createClient } from "@/lib/supabase/server";

interface RecentCampaign {
    id: string;
    title: string;
    brand_name: string;
    budget: number;
    status: string;
    updated_at: string;
}

export interface DashboardOverview {
    activeCampaignsCount: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    netProfit: number;
    teamMembers: number;
    lastCampaigns: RecentCampaign[];
}

export async function getDashboardOverview(): Promise<{
    data: DashboardOverview | null;
    error: string | null;
}> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "No autenticado" };
    }

    // Single efficient query — only the columns we need
    const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("id, title, brand_name, budget, status, updated_at, payment_status")
        .eq("influencer_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) {
        return { data: null, error: error.message };
    }

    const rows = (campaigns ?? []) as RecentCampaign[];

    // ---- Current month boundaries ----
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // ---- Aggregations ----
    let activeCampaignsCount = 0;
    let monthlyRevenue = 0;

    for (const c of rows) {
        // Active = anything not completed/cancelled/paid
        if (c.status !== "completed" && c.status !== "cancelled" && c.status !== "paid") {
            activeCampaignsCount++;
        }

        // Monthly revenue = STRICTLY 'paid' campaigns updated this month
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((c as any).payment_status === "paid") {
            const updated = new Date(c.updated_at);
            if (updated >= monthStart && updated <= monthEnd) {
                monthlyRevenue += c.budget ?? 0;
            }
        }
    }

    // Last 3 campaigns for activity feed
    const lastCampaigns = rows.slice(0, 3);

    // ---- Expenses (Current Month) ----
    const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, date")
        .eq("user_id", user.id);

    let monthlyExpenses = 0;
    if (expenses) {
        expenses.forEach((e) => {
            const expenseDate = new Date(e.date);
            if (expenseDate >= monthStart && expenseDate <= monthEnd) {
                monthlyExpenses += Number(e.amount);
            }
        });
    }

    const netProfit = monthlyRevenue - monthlyExpenses;

    return {
        data: {
            activeCampaignsCount,
            monthlyRevenue,
            monthlyExpenses,
            netProfit,
            teamMembers: 1, // Placeholder until team module exists
            lastCampaigns,
        },
        error: null,
    };
}

export interface RecentExpense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
}

export async function getRecentExpenses(): Promise<RecentExpense[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from("expenses")
        .select("id, description, amount, category, date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5);

    return (data as RecentExpense[]) || [];
}
