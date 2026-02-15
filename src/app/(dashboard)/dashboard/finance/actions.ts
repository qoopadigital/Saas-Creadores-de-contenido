"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MONTH_NAMES = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

interface MonthlyDataPoint {
    name: string;
    income: number;
    expenses: number;
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
    // Financial fields (optional as they might be null)
    actual_hours?: number;
    invoice_date?: string;
    payment_status?: string;
}

export interface FinancialData {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingAmount: number;
    pipelineValue: number;
    monthlyData: MonthlyDataPoint[];
    recentTransactions: CampaignRow[];
    expensesByCategory: { name: string; value: number }[]; // Changed from Record<string, number>
    averageHourlyRate: number;
    recentInvoices: {
        id: string;
        brand_name: string;
        amount: number | null;
        date: string | null;
        status: string | undefined;
    }[];
}

// ... (Zod Schema remains the same) ...

// ... (createExpense, deleteExpense, getCampaignExpenses remain the same) ...

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

    // Parallel fetch: Campaigns & Expenses
    const [campaignsResult, expensesResult] = await Promise.all([
        supabase
            .from("campaigns")
            .select("*")
            .eq("influencer_id", user.id)
            .order("created_at", { ascending: false }),

        supabase
            .from("expenses")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
    ]);

    if (campaignsResult.error) return { data: null, error: campaignsResult.error.message };
    if (expensesResult.error) return { data: null, error: expensesResult.error.message };

    const campaigns = campaignsResult.data as CampaignRow[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expenses = expensesResult.data as any[];

    // ---- Aggregate totals ----
    const { totalRevenue, pendingAmount, pipelineValue } = campaigns.reduce(
        (acc, c) => {
            const budget = c.budget ?? 0;

            // Strict Financial Logic
            // Revenue: Only if payment_status is 'paid'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((c as any).payment_status === "paid") {
                acc.totalRevenue += budget;
            }

            // Pending: If payment_status is 'pending' or 'invoiced'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (["pending", "invoiced"].includes((c as any).payment_status)) {
                acc.pendingAmount += budget;
            }

            // Pipeline: Negotiation, Creation, Review
            if (["negotiation", "creation", "review"].includes(c.status)) {
                acc.pipelineValue += budget;
            }
            return acc;
        },
        { totalRevenue: 0, pendingAmount: 0, pipelineValue: 0 }
    );

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    // ---- Expense Breakdown ----
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
        const cat = e.category || "other";
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(e.amount);
    });

    // ---- Monthly Chart Data (Income vs Expenses) ----
    const monthIncome: Record<string, number> = {};
    const monthExpenses: Record<string, number> = {};

    campaigns
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((c) => ["completed", "published", "payment_pending", "invoiced", "paid"].includes(c.status as any))
        .forEach((c) => {
            const date = new Date(c.updated_at || c.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
            monthIncome[key] = (monthIncome[key] ?? 0) + (c.budget ?? 0);
        });

    expenses.forEach((e) => {
        const date = new Date(e.date);
        const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
        monthExpenses[key] = (monthExpenses[key] ?? 0) + Number(e.amount);
    });

    // Build last 6 months
    const now = new Date();
    const monthlyData: MonthlyDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
        monthlyData.push({
            name: MONTH_NAMES[d.getMonth()],
            income: monthIncome[key] ?? 0,
            expenses: monthExpenses[key] ?? 0,
        });
    }

    // ---- Recent transactions (Expense focused or recent campaigns) ----
    // Let's show recent campaigns for now as before
    const recentTransactions = campaigns
        .filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (c) => ["completed", "payment_pending", "published", "invoiced", "paid"].includes(c.status as any)
        )
        .slice(0, 5);

    // 4. Calculate Efficiency (Hourly Rate)
    // Filter campaigns that have actual_hours > 0
    const campaignsWithHours = campaigns.filter(c => (c.actual_hours || 0) > 0);
    const totalHours = campaignsWithHours.reduce((sum, c) => sum + (c.actual_hours || 0), 0);

    // Calculate Net Profit for these specific campaigns to get a real efficiency rate
    // We need expenses for these campaigns. We have all expenses.
    // Efficiency = (Sum of revenue of these campaigns - Sum of expenses of these campaigns) / Total Hours
    // Revenue = budget (assuming paid/invoiced/pending all count for "value produced", or strictly paid? 
    // The prompt says "Valor de tu Hora". Usually implies value generated vs time spent. Let's use budget.)
    const efficiencyRevenue = campaignsWithHours.reduce((sum, c) => sum + (c.budget || 0), 0);

    // Expenses for these campaigns
    const efficiencyExpenses = expenses
        .filter(e => campaignsWithHours.some(c => c.id === e.campaign_id))
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const efficiencyNetProfit = efficiencyRevenue - efficiencyExpenses;
    const averageHourlyRate = totalHours > 0 ? efficiencyNetProfit / totalHours : 0;

    // 5. Recent Invoices
    const recentInvoices = campaigns
        .filter(c => c.invoice_date)
        .sort((a, b) => new Date(b.invoice_date!).getTime() - new Date(a.invoice_date!).getTime())
        .slice(0, 5)
        .map(c => ({
            id: c.id,
            brand_name: c.brand_name,
            amount: c.budget || 0, // Ensure number
            date: c.invoice_date || null, // Ensure string | null
            status: c.payment_status || undefined // Ensure string | undefined
        }));

    return {
        data: {
            totalRevenue,
            pendingAmount,
            pipelineValue, // Keeping this for backward compat if needed, or remove
            totalExpenses,
            netProfit,
            monthlyData,
            expensesByCategory: Object.entries(expensesByCategory).map(([name, value]) => ({ name, value })),
            recentTransactions,
            averageHourlyRate,
            recentInvoices,
        },
        error: null,
    };
}
