import { differenceInDays, isSameMonth, isSameYear } from "date-fns";

export interface FinancialCampaign {
    id: string;
    budget: number;
    status: string;
    payment_status?: string;
    actual_hours?: number;
    updated_at: string;
    created_at: string;
    invoice_date?: string;
    platform?: string;
}

export interface Expense {
    id: string;
    amount: number | string;
    date: string;
    category?: string;
    campaign_id?: string;
}

/**
 * Calculates the Average Hourly Rate based on Net Profit / Actual Hours
 * formula: Sum(Net Profit of Paid Campaigns) / Sum(Actual Hours)
 */
export function calculateHourlyRate(campaigns: FinancialCampaign[], expenses: Expense[]): number {
    // Filter campaigns that have actual_hours > 0
    // AND are effectively "realized" revenue (paid/invoiced/completed? Prompt said "Beneficio Neto de campañas del mes" but also "Paid campaigns" in other context)
    // The user prompt in step 2 says: "Hourly Rate = Sum(Beneficio Neto de campañas Pagadas) / Sum(Horas Reales)."

    const relevantCampaigns = campaigns.filter(c =>
        (c.actual_hours || 0) > 0 &&
        (c.payment_status === 'paid' || c.status === 'paid') // robust check
    );

    if (relevantCampaigns.length === 0) return 0;

    const totalHours = relevantCampaigns.reduce((sum, c) => sum + (c.actual_hours || 0), 0);

    if (totalHours === 0) return 0;

    // Calculate Revenue for these campaigns
    const totalRevenue = relevantCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

    // Calculate Expenses linked to these campaigns
    const relevantCampaignIds = new Set(relevantCampaigns.map(c => c.id));
    const totalCampaignExpenses = expenses
        .filter(e => e.campaign_id && relevantCampaignIds.has(e.campaign_id))
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const netProfit = totalRevenue - totalCampaignExpenses;

    return netProfit / totalHours;
}

/**
 * Calculates financial metrics for a specific time period (month/year)
 * or overall if no period specified.
 */
export function calculateFinancialMetrics(
    campaigns: FinancialCampaign[],
    expenses: Expense[],
    period?: { month?: number, year?: number }
) {
    // Filter by period if provided
    let filteredCampaigns = campaigns;
    let filteredExpenses = expenses;

    if (period) {
        const { month, year } = period;

        // Filter campaigns: typically based on updated_at or invoice_date for revenue recognition
        filteredCampaigns = campaigns.filter(c => {
            const date = new Date(c.updated_at || c.created_at); // simplistic, improve if invoice_date is preferred
            const matchesYear = year ? date.getFullYear() === year : true;
            const matchesMonth = month !== undefined ? date.getMonth() === month : true;
            return matchesYear && matchesMonth;
        });

        // Filter expenses: based on expense date
        filteredExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            const matchesYear = year ? date.getFullYear() === year : true;
            const matchesMonth = month !== undefined ? date.getMonth() === month : true;
            return matchesYear && matchesMonth;
        });
    }

    // Calculate Hourly Rate using the shared logic
    const hourlyRate = calculateHourlyRate(filteredCampaigns, expenses); // Pass ALL expenses to let the function filter by campaign_id correctly? 
    // actually calculateHourlyRate logic filters expenses by campaign_id of the passed campaigns.
    // So passing 'expenses' (all expenses) or 'filteredExpenses' (period expenses) matters?
    // If we want "Net Profit of THESE campaigns", we should look for expenses OF THESE campaigns, 
    // regardless of when the expense happened? OR expenses that happened in that month?
    // Usually profitability of a campaign includes ALL its expenses.
    // Let's pass ALL expenses to calculateHourlyRate so it can find all relevant expenses for the filtered campaigns.

    return {
        hourlyRate
    };
}
