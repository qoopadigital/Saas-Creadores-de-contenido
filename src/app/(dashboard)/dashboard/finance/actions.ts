"use server";

import { createClient } from "@/lib/supabase/server";

const MONTH_NAMES = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

interface MonthlyDataPoint {
    name: string;
    total: number;
}

interface CampaignRow {
    id: string;
    title: string;
    brand_name: string;
    budget: number;
    status: string;
    deadline: string;
    created_at: string;
    updated_at: string;
}

export interface FinancialData {
    totalRevenue: number;
    pendingAmount: number;
    pipelineValue: number;
    monthlyData: MonthlyDataPoint[];
    recentTransactions: CampaignRow[];
}

export async function getFinancialData(): Promise<{
    data: FinancialData | null;
    error: string | null;
}> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "No autenticado" };
    }

    const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("influencer_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return { data: null, error: error.message };
    }

    const rows = (campaigns ?? []) as CampaignRow[];

    // ---- Aggregate totals ----
    const { totalRevenue, pendingAmount, pipelineValue } = rows.reduce(
        (acc, c) => {
            const budget = c.budget ?? 0;
            if (c.status === "completed" || c.status === "published") {
                acc.totalRevenue += budget;
            } else if (c.status === "payment_pending") {
                acc.pendingAmount += budget;
            } else if (
                ["negotiation", "creation", "review"].includes(c.status)
            ) {
                acc.pipelineValue += budget;
            }
            return acc;
        },
        { totalRevenue: 0, pendingAmount: 0, pipelineValue: 0 }
    );

    // ---- Monthly revenue chart data ----
    const monthTotals: Record<string, number> = {};
    rows
        .filter((c) => c.status === "completed" || c.status === "published")
        .forEach((c) => {
            const date = new Date(c.updated_at || c.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
            monthTotals[key] = (monthTotals[key] ?? 0) + (c.budget ?? 0);
        });

    // Build last 6 months
    const now = new Date();
    const monthlyData: MonthlyDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
        monthlyData.push({
            name: MONTH_NAMES[d.getMonth()],
            total: monthTotals[key] ?? 0,
        });
    }

    // ---- Recent transactions ----
    const recentTransactions = rows
        .filter(
            (c) => c.status === "completed" || c.status === "payment_pending" || c.status === "published"
        )
        .slice(0, 5);

    return {
        data: {
            totalRevenue,
            pendingAmount,
            pipelineValue,
            monthlyData,
            recentTransactions,
        },
        error: null,
    };
}
