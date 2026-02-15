import { getFinancialData } from "./actions";
import { KpiCards } from "@/components/dashboard/finance/kpi-cards";
import { RevenueChart } from "@/components/dashboard/finance/revenue-chart";
import { RecentTransactions } from "@/components/dashboard/finance/recent-transactions";

export default async function FinancePage() {
    const { data, error } = await getFinancialData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
                <p className="text-muted-foreground mt-1">
                    Resumen de ingresos, cobros pendientes y pipeline de tu negocio.
                </p>
            </div>

            {/* Error state */}
            {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar datos financieros: {error}
                </div>
            )}

            {data && (
                <>
                    {/* Row 1: KPI Cards */}
                    <KpiCards
                        totalRevenue={data.totalRevenue}
                        pendingAmount={data.pendingAmount}
                        pipelineValue={data.pipelineValue}
                    />

                    {/* Row 2: Chart (2/3) + Transactions (1/3) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <RevenueChart data={data.monthlyData} />
                        <RecentTransactions transactions={data.recentTransactions} />
                    </div>
                </>
            )}
        </div>
    );
}
