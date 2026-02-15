import { getFinancialData } from "./actions";
import { KpiCards } from "@/components/dashboard/finance/kpi-cards";
import { RevenueChart } from "@/components/dashboard/finance/revenue-chart";
import { RecentTransactions } from "@/components/dashboard/finance/recent-transactions";
import { ExpensesBreakdown } from "@/components/dashboard/finance/expenses-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, FileText } from "lucide-react";

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
                        totalExpenses={data.totalExpenses}
                        netProfit={data.netProfit}
                    />

                    {/* Row 2: Chart (2/3) + Expenses & Transactions (1/3) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <RevenueChart data={data.monthlyData} />
                        </div>
                        <div className="space-y-6">
                            <ExpensesBreakdown data={data.expensesByCategory} />
                            <RecentTransactions transactions={data.recentTransactions} />
                        </div>
                    </div>
                </>
            )}

            {data && (
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-4">Eficiencia y Facturación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Hourly Value Widget */}
                        <div className="md:col-span-1">
                            <Card className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                                        <CircleDollarSign className="w-4 h-4" /> Valor de tu Hora
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold">
                                        ${data.averageHourlyRate.toFixed(0)}<span className="text-xl text-white/60">/h</span>
                                    </div>
                                    <p className="text-xs text-white/60 mt-2">
                                        Promedio basado en campañas finalizadas este mes.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. Recent Invoices Table */}
                        <div className="md:col-span-2">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" /> Historial de Facturas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.recentInvoices.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">No hay facturas recientes</p>
                                        ) : (
                                            data.recentInvoices.map((invoice) => (
                                                <div key={invoice.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                                    <div className="grid gap-1">
                                                        <span className="font-medium text-sm">{invoice.brand_name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'Sin fecha'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                            {invoice.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                                        </Badge>
                                                        <span className="font-medium text-sm">
                                                            ${(invoice.amount || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
