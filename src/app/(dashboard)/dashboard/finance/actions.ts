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

import { calculateHourlyRate, FinancialCampaign, Expense } from "@/lib/utils/finance";

// ... (existing imports)

export interface FinancialData {
    totalRevenue: number;
    totalExpenses: number;
    providerExpenses: number;
    netProfit: number;
    pendingAmount: number;
    pipelineValue: number;
    monthlyData: MonthlyDataPoint[];
    recentTransactions: CampaignRow[];
    expensesByCategory: { name: string; value: number; fill: string }[];
    incomeByPlatform: { name: string; value: number; fill: string }[];
    topBrands: { name: string; value: number; fill: string }[];
    averageHourlyRate: number;
    recentInvoices: {
        id: string;
        brand_name: string;
        amount: number | null;
        date: string | null;
        status: string | undefined;
    }[];
    campaigns: CampaignRow[];
    expenses: {
        id: string;
        description: string;
        amount: number;
        category: string;
        date: string;
    }[];
}

// ... (existing helper functions)

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export async function getFinancialData(year?: number, month?: number): Promise<{
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

    // Parallel fetch: Campaigns, Expenses & Provider Payments
    const [campaignsResult, expensesResult, providerPaymentsResult] = await Promise.all([
        supabase
            .from("campaigns")
            .select("*")
            .eq("influencer_id", user.id)
            .order("created_at", { ascending: false }),

        supabase
            .from("expenses")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false }),

        supabase
            .from("provider_payments")
            .select("*, providers(name)")
            .eq("user_id", user.id)
            .order("payment_date", { ascending: false }),
    ]);

    if (campaignsResult.error) return { data: null, error: campaignsResult.error.message };
    if (expensesResult.error) return { data: null, error: expensesResult.error.message };

    const allCampaigns = campaignsResult.data as CampaignRow[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allExpenses = expensesResult.data as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allProviderPayments = (providerPaymentsResult.data || []) as any[];

    // Filter by Date (Year/Month) if provided
    // Default: If no year provided, maybe show all? Or current year?
    // Let's filter if provided.
    const campaigns = allCampaigns.filter(c => {
        if (!year && month === undefined) return true;
        const d = new Date(c.updated_at || c.created_at);
        const y = d.getFullYear();
        const m = d.getMonth(); // 0-11
        if (year && y !== year) return false;
        if (month !== undefined && m !== (month - 1)) return false;
        return true;
    });

    const expenses = allExpenses.filter(e => {
        if (!year && month === undefined) return true;
        const d = new Date(e.date);
        const y = d.getFullYear();
        const m = d.getMonth();
        if (year && y !== year) return false;
        if (month !== undefined && m !== (month - 1)) return false;
        return true;
    });

    const providerPayments = allProviderPayments.filter(p => {
        if (!year && month === undefined) return true;
        const d = new Date(p.payment_date);
        const y = d.getFullYear();
        const m = d.getMonth();
        if (year && y !== year) return false;
        if (month !== undefined && m !== (month - 1)) return false;
        return true;
    });

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

    const campaignExpensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const providerExpensesTotal = providerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = campaignExpensesTotal + providerExpensesTotal;
    const netProfit = totalRevenue - totalExpenses;

    // Helper for grouping
    const groupData = (data: { name: string; value: number }[]) => {
        const sorted = data.sort((a, b) => b.value - a.value);
        if (sorted.length <= 5) {
            return sorted.map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));
        }
        const top4 = sorted.slice(0, 4).map((item, index) => ({ ...item, fill: COLORS[index] }));
        const othersValue = sorted.slice(4).reduce((sum, item) => sum + item.value, 0);
        return [...top4, { name: "Otros", value: othersValue, fill: "#e5e7eb" }];
    };

    // ---- Expense Breakdown ----
    const expensesByCategoryMap: Record<string, number> = {};
    expenses.forEach((e) => {
        const cat = e.category || "other";
        expensesByCategoryMap[cat] = (expensesByCategoryMap[cat] || 0) + Number(e.amount);
    });
    // Add provider payments as "Proveedores" category
    if (providerExpensesTotal > 0) {
        expensesByCategoryMap["Proveedores"] = (expensesByCategoryMap["Proveedores"] || 0) + providerExpensesTotal;
    }

    const expensesByCategory = groupData(
        Object.entries(expensesByCategoryMap).map(([name, value]) => ({ name, value }))
    );

    // ---- Income by Platform ----
    const incomeByPlatformMap: Record<string, number> = {};
    campaigns.forEach((c) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((c as any).payment_status === "paid") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawPlatforms = (c as any).platforms || [];

            // Purge "Otro" and empty strings, clean whitespace
            const validPlatforms = Array.isArray(rawPlatforms)
                ? rawPlatforms
                    .map(p => typeof p === 'string' ? p.trim() : '')
                    .filter(p => p !== '' && p.toLowerCase() !== 'otro')
                : [];

            if (validPlatforms.length > 0) {
                // Split budget equally among platforms
                const splitBudget = (c.budget || 0) / validPlatforms.length;
                validPlatforms.forEach((p: string) => {
                    const capitalizedPlatform = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
                    incomeByPlatformMap[capitalizedPlatform] = (incomeByPlatformMap[capitalizedPlatform] || 0) + splitBudget;
                });
            } else {
                incomeByPlatformMap["Otro"] = (incomeByPlatformMap["Otro"] || 0) + (c.budget || 0);
            }
        }
    });

    const incomeByPlatform = groupData(
        Object.entries(incomeByPlatformMap).map(([name, value]) => ({ name, value }))
    );

    // ---- Top Brands (Income) ----
    const incomeByBrandMap: Record<string, number> = {};
    campaigns.forEach((c) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((c as any).payment_status === "paid") {
            const brand = c.brand_name || "Desconocido";
            incomeByBrandMap[brand] = (incomeByBrandMap[brand] || 0) + (c.budget || 0);
        }
    });

    const topBrands = groupData(
        Object.entries(incomeByBrandMap).map(([name, value]) => ({ name, value }))
    );


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

    // Include provider payments in monthly expenses
    providerPayments.forEach((p) => {
        const date = new Date(p.payment_date);
        const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
        monthExpenses[key] = (monthExpenses[key] ?? 0) + Number(p.amount);
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

    // 4. Calculate Efficiency (Hourly Rate) using SHARED LOGIC
    // Transform campaigns to FinancialCampaign type if needed, but they share extracted interface partially
    // We cast to any or compatible type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const averageHourlyRate = calculateHourlyRate(campaigns as any[], expenses as any[]);

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

    // Build combined expenses list (campaign expenses + provider payments)
    const providerPaymentExpenses = providerPayments.map((p: any) => ({
        id: p.id,
        description: `🔧 ${p.providers?.name || "Proveedor"}: ${p.description}`,
        amount: Number(p.amount),
        category: "Proveedores",
        date: p.payment_date,
    }));

    const allExpenseItems = [
        ...expenses.map((e: any) => ({
            id: e.id,
            description: e.description,
            amount: Number(e.amount),
            category: e.category || "other",
            date: e.date,
        })),
        ...providerPaymentExpenses,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
        data: {
            totalRevenue,
            pendingAmount,
            pipelineValue,
            totalExpenses,
            providerExpenses: providerExpensesTotal,
            netProfit,
            monthlyData,
            expensesByCategory,
            incomeByPlatform,
            topBrands,
            recentTransactions,
            averageHourlyRate,
            recentInvoices,
            campaigns,
            expenses: allExpenseItems,
        },
        error: null,
    };
}
