import { getFinancialData } from "./actions";
import { KpiCards } from "@/components/dashboard/finance/kpi-cards";
import { RevenueChart } from "@/components/dashboard/finance/revenue-chart";
import { RecentTransactions } from "@/components/dashboard/finance/recent-transactions";
import { ExpensesBreakdown } from "@/components/dashboard/finance/expenses-breakdown";
import { FinancialData } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { CircleDollarSign, FileText, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinanceFilters } from "@/components/dashboard/finance/filters";
import { CategoryPieChart } from "@/components/dashboard/finance/category-pie-chart";
import { MetricsList } from "@/components/dashboard/finance/metrics-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper for formatting
const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-CO", { month: "short", day: "numeric", year: "numeric" });
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FinancePage({ searchParams }: PageProps) {
    const params = await searchParams;
    const year = params.year ? Number(params.year) : undefined;
    const month = params.month ? Number(params.month) : undefined;
    const filterKey = `${year || "all"}-${month || "all"}`;

    // Pass filters to action
    const { data, error } = await getFinancialData(year, month);

    if (error || !data) {
        return (
            <div className="p-6">
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar datos financieros: {error || "No data received"}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
                    <p className="text-muted-foreground mt-1">
                        Control total de tus ingresos y gastos.
                    </p>
                </div>
                <FinanceFilters />
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="income">Ingresos</TabsTrigger>
                    <TabsTrigger value="expenses">Gastos</TabsTrigger>
                </TabsList>

                {/* TAB 1: OVERVIEW */}
                <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* KPI Cards */}
                    <KpiCards
                        key={filterKey}
                        totalRevenue={data.totalRevenue}
                        pendingAmount={data.pendingAmount}
                        totalExpenses={data.totalExpenses}
                        netProfit={data.netProfit}
                    />

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <RevenueChart key={filterKey} data={data.monthlyData} />
                        </div>
                        <div className="space-y-6">
                            {/* Hourly Value Widget */}
                            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-md">
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
                                        Calculado: (Beneficio Neto / Horas Reales)
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Expenses Summary */}
                            <ExpensesBreakdown data={data.expensesByCategory} />
                        </div>
                    </div>

                    {/* Recent Transactions & Invoices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RecentTransactions key={filterKey} transactions={data.recentTransactions} />

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-medium flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" /> Facturas Recientes
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
                                                        {formatDate(invoice.date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                        {invoice.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                                    </Badge>
                                                    <span className="font-medium text-sm">
                                                        {formatCurrency(invoice.amount || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2: INCOME */}
                <TabsContent value="income" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[400px]">
                            <CategoryPieChart key={filterKey} title="Ingresos por Plataforma" data={data.incomeByPlatform} />
                        </div>
                        <div className="h-auto">
                            <MetricsList key={filterKey} title="Mejores Clientes (Top Brands)" data={data.topBrands} />
                        </div>
                        <div className="md:col-span-2">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Detalle de Ingresos</CardTitle>
                                    <CardDescription>Campañas pagadas en el periodo seleccionado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Campaña</TableHead>
                                                <TableHead>Marca</TableHead>
                                                <TableHead>Plataforma</TableHead>
                                                <TableHead>Fecha Pago</TableHead>
                                                <TableHead className="text-right">Monto</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.campaigns
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                .filter((c: any) => c.payment_status === "paid")
                                                .map((campaign) => (
                                                    <TableRow key={campaign.id}>
                                                        <TableCell className="font-medium">{campaign.title}</TableCell>
                                                        <TableCell>{campaign.brand_name}</TableCell>
                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                        <TableCell className="capitalize">{(campaign as any).platform || "-"}</TableCell>
                                                        <TableCell>{formatDate(campaign.updated_at)}</TableCell>
                                                        <TableCell className="text-right font-bold text-green-600">
                                                            +{formatCurrency(campaign.budget)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            {data.campaigns.filter((c: any) => c.payment_status === "paid").length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No hay ingresos en este periodo.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 3: EXPENSES */}
                <TabsContent value="expenses" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 h-auto">
                            <MetricsList key={filterKey} title="Gastos por Categoría" data={data.expensesByCategory} />
                        </div>
                        <div className="md:col-span-2">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Registro de Gastos</CardTitle>
                                    <CardDescription>Todos los gastos registrados en el periodo.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Concepto</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead className="text-right">Monto</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.expenses.map((expense) => (
                                                <TableRow key={expense.id}>
                                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                                    <TableCell className="capitalize">{expense.category}</TableCell>
                                                    <TableCell>{formatDate(expense.date)}</TableCell>
                                                    <TableCell className="text-right font-medium text-destructive">
                                                        -{formatCurrency(expense.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {data.expenses.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        No hay gastos en este periodo.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
