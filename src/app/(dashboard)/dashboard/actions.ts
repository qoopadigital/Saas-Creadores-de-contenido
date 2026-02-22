"use server";

import { createClient } from "@/lib/supabase/server";

interface RecentCampaign {
    id: string;
    title: string;
    brand_name: string;
    budget: number;
    status: string;
    updated_at: string;
    deadline?: string;
    payment_status?: string;
}

import { calculateHourlyRate, FinancialCampaign, Expense } from "@/lib/utils/finance";

// ... (existing imports)

export interface DashboardOverview {
    activeCampaignsCount: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyProviderPayments: number;
    netProfit: number;
    hourlyRate: number;
    lastCampaigns: RecentCampaign[];
    allCampaigns: RecentCampaign[];
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
        .select("id, title, brand_name, budget, status, updated_at, created_at, payment_status, actual_hours, deadline")
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

    // Last 3 campaigns for activity feed (already ordered by updated_at DESC)
    const lastCampaigns = rows.slice(0, 3);

    // ---- Parallel fetch: Expenses + Provider Payments (Current Month) ----
    const [expensesResult, providerPaymentsResult] = await Promise.all([
        supabase
            .from("expenses")
            .select("id, amount, date, campaign_id")
            .eq("user_id", user.id),
        supabase
            .from("provider_payments")
            .select("id, amount, payment_date, description, providers(name)")
            .eq("user_id", user.id),
    ]);

    const expenses = expensesResult.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const providerPayments = (providerPaymentsResult.data || []) as any[];

    let monthlyExpenses = 0;
    expenses.forEach((e) => {
        const expenseDate = new Date(e.date);
        if (expenseDate >= monthStart && expenseDate <= monthEnd) {
            monthlyExpenses += Number(e.amount);
        }
    });

    let monthlyProviderPayments = 0;
    providerPayments.forEach((p) => {
        const paymentDate = new Date(p.payment_date);
        if (paymentDate >= monthStart && paymentDate <= monthEnd) {
            monthlyProviderPayments += Number(p.amount);
        }
    });

    // Net Profit = Revenue - Campaign Expenses - Provider Payments
    const netProfit = monthlyRevenue - monthlyExpenses - monthlyProviderPayments;

    // Monthly campaigns for hourly rate calculation
    const monthlyCampaigns = (campaigns || []).filter(c => {
        const updated = new Date(c.updated_at);
        return updated >= monthStart && updated <= monthEnd;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hourlyRate = calculateHourlyRate(monthlyCampaigns as any[], expenses as any[] || []);

    return {
        data: {
            activeCampaignsCount,
            monthlyRevenue,
            monthlyExpenses: monthlyExpenses + monthlyProviderPayments,
            monthlyProviderPayments,
            netProfit,
            hourlyRate,
            lastCampaigns,
            allCampaigns: rows,
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

    // Fetch both campaign expenses and provider payments in parallel
    const [expensesResult, providerPaymentsResult] = await Promise.all([
        supabase
            .from("expenses")
            .select("id, description, amount, category, date")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(6),
        supabase
            .from("provider_payments")
            .select("id, amount, description, payment_date, providers(name)")
            .eq("user_id", user.id)
            .order("payment_date", { ascending: false })
            .limit(6),
    ]);

    const campaignExpenses: RecentExpense[] = ((expensesResult.data as RecentExpense[]) || []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const providerExpenses: RecentExpense[] = ((providerPaymentsResult.data || []) as any[]).map((p) => ({
        id: p.id,
        description: `Pago a ${p.providers?.name || "Proveedor"} (${p.description})`,
        amount: Number(p.amount),
        category: "provider",
        date: p.payment_date,
    }));

    // Combine, sort by date DESC, return top 6
    const combined = [...campaignExpenses, ...providerExpenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);

    return combined;
}
