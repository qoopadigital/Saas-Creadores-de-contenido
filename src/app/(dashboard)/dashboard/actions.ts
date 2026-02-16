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

import { calculateHourlyRate, FinancialCampaign, Expense } from "@/lib/utils/finance";

// ... (existing imports)

export interface DashboardOverview {
    activeCampaignsCount: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    netProfit: number;
    hourlyRate: number;
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
        .select("id, title, brand_name, budget, status, updated_at, created_at, payment_status, actual_hours")
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
        .select("id, amount, date, campaign_id") // Added fields for shared logic
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

    // Calculate Hourly Rate using SHARED LOGIC
    // Allow logic to look at ALL campaigns/expenses to determine efficiency, 
    // OR restrict to this month? Prompt said "Promedio de Tarifa Horaria del mes actual" in first request,
    // but in Step 2: "Hourly Rate = Sum(Beneficio Neto de campañas Pagadas) / Sum(Horas Reales)".
    // It didn't explicitly say "del mes" in Step 2, but implied consistency.
    // However, usually Hourly Rate is a general metric or monthly?
    // Let's stick to the shared logic which effectively calculates efficiency of PAID campaigns.
    // If we want it for the MONTH, we should filter campaigns/expenses first if we want consistency with the Finance page which shows "Promedio basado en campañas finalizadas este mes" in the screenshot/text?
    // Wait, Finance page text says: "Promedio basado en campañas finalizadas este mes."
    // So we should filter campaigns by month before passing to shared logic IF shared logic doesn't filter.
    // Shared logic takes list of campaigns.
    // Let's filter campaigns to only those updated/paid THIS MONTH if we want "this month's efficiency".
    // Or we pass all and let the user decide?
    // The previous implementation in dashboard/actions.ts calculated `monthlyHours` and `netProfit` (monthly).
    // `netProfit` passed to formula was `monthlyRevenue - monthlyExpenses`.
    // So it was definitely monthly.
    // Let's filter campaigns for the shared logic to be "Current Month".

    // We need to pass campaigns that are "paid" and in this month.
    const monthlyCampaigns = (campaigns || []).filter(c => {
        const updated = new Date(c.updated_at);
        return updated >= monthStart && updated <= monthEnd;
    });

    // We pass ALL expenses because shared logic filters expenses by campaign ID for net profit calculation of those campaigns.
    // BUT `netProfit` passed to shared logic isn't used, logic calculates it internally.
    // Logic: `Sum(Revenue of these campaigns) - Sum(Expenses of these campaigns)`.
    // It does NOT look at "general monthly expenses" (tax, rent) unless they are linked to the campaign.
    // This is "Project Efficiency". 
    // The Dashboard "Net Profit" (KPI card) includes ALL expenses (rent, etc). 
    // The "Hourly Rate" (Efficiency) should probably be based on Project Profitability (Campaign budget - Campaign expenses).
    // So passing "monthlyCampaigns" and "all expenses" (to find matches) is correct for "Project Efficiency in this Month".

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hourlyRate = calculateHourlyRate(monthlyCampaigns as any[], expenses as any[] || []);

    return {
        data: {
            activeCampaignsCount,
            monthlyRevenue,
            monthlyExpenses,
            netProfit,
            hourlyRate,
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
