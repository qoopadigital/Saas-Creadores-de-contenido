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
        .select("id, title, brand_name, budget, status, updated_at")
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
        // Active = anything not completed/cancelled
        if (c.status !== "completed" && c.status !== "cancelled") {
            activeCampaignsCount++;
        }

        // Monthly revenue = completed/published campaigns updated this month
        if (c.status === "completed" || c.status === "published") {
            const updated = new Date(c.updated_at);
            if (updated >= monthStart && updated <= monthEnd) {
                monthlyRevenue += c.budget ?? 0;
            }
        }
    }

    // Last 3 campaigns for activity feed
    const lastCampaigns = rows.slice(0, 3);

    return {
        data: {
            activeCampaignsCount,
            monthlyRevenue,
            teamMembers: 1, // Placeholder until team module exists
            lastCampaigns,
        },
        error: null,
    };
}
