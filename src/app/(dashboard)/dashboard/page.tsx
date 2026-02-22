import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Kanban,
    DollarSign,
    Users,
    ArrowRight,
    Plus,
    Clock,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Timer,
} from "lucide-react";
import { getDashboardOverview, getRecentExpenses, getGlobalPendingTasks } from "./actions";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { PendingTasksWidget } from "@/components/dashboard/pending-tasks-widget";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-CO", {
        month: "short",
        day: "numeric",
    });
}

const statusLabels: Record<string, string> = {
    negotiation: "Negociación",
    creation: "Creación",
    review: "Revisión",
    published: "Publicado",
    payment_pending: "Pago Pendiente",
    completed: "Completado",
};

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
    negotiation: "outline",
    creation: "secondary",
    review: "secondary",
    published: "default",
    payment_pending: "outline",
    completed: "default",
};

const CATEGORY_ICONS: Record<string, any> = {
    production: "🎥",
    travel: "✈️",
    agency_fee: "🏢",
    software: "💻",
    equipment: "📸",
    tax: "🏦",
    provider: "🔧",
    other: "📦",
};

export default async function DashboardPage() {
    const { data: overviewData, error: overviewError } = await getDashboardOverview();
    const recentExpenses = await getRecentExpenses();
    const pendingTasks = await getGlobalPendingTasks();

    const activeCampaigns = overviewData?.activeCampaignsCount ?? 0;
    const monthlyRevenue = overviewData?.monthlyRevenue ?? 0;
    const monthlyExpenses = overviewData?.monthlyExpenses ?? 0;
    const netProfit = overviewData?.netProfit ?? 0;
    const hourlyRate = overviewData?.hourlyRate ?? 0;
    const lastCampaigns = overviewData?.lastCampaigns ?? [];
    const allCampaigns = overviewData?.allCampaigns ?? [];

    const summaryCards = [
        {
            title: "Campañas Activas",
            value: String(activeCampaigns),
            description:
                activeCampaigns > 0
                    ? `${activeCampaigns} campaña${activeCampaigns !== 1 ? "s" : ""} en progreso`
                    : "Ninguna campaña activa aún",
            icon: Kanban,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Beneficio Neto (Mes)",
            value: formatCurrency(netProfit),
            description: null,
            footer: (
                <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                    <span className="flex items-center text-emerald-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {formatCurrency(monthlyRevenue)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center text-rose-600">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {formatCurrency(monthlyExpenses)}
                    </span>
                </div>
            ),
            icon: DollarSign,
            color: netProfit >= 0 ? "text-emerald-500" : "text-rose-500",
            bgColor: netProfit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
            valueColor: netProfit < 0 ? "text-rose-600" : undefined,
        },
        {
            title: "Valor de tu Hora",
            value: `$${hourlyRate.toFixed(2)}/h`,
            description: "Basado en tus horas registradas",
            icon: Timer,
            color: hourlyRate > 0 ? "text-violet-500" : "text-muted-foreground",
            bgColor: hourlyRate > 0 ? "bg-violet-500/10" : "bg-muted",
            valueColor: hourlyRate > 0 ? "text-violet-600" : undefined,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Bienvenido a CreatorOS
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Aquí tienes un resumen rápido de tu actividad.
                    </p>
                </div>
                <Link href="/dashboard/campaigns">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Campaña
                    </Button>
                </Link>
            </div>

            {/* Error */}
            {overviewError && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar datos: {overviewError}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {summaryCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={`rounded-md p-2 ${card.bgColor}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.valueColor || ""}`}>
                                {card.value}
                            </div>
                            {card.description && (
                                <CardDescription className="mt-1">
                                    {card.description}
                                </CardDescription>
                            )}
                            {card.footer && card.footer}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Activity & Expenses Split */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

                {/* Recent Activity (4/7) */}
                <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Actividad Reciente</CardTitle>
                            <CardDescription>
                                Últimas campañas actualizadas
                            </CardDescription>
                        </div>
                        <Link href="/dashboard/campaigns">
                            <Button variant="ghost" size="sm" className="gap-1">
                                Ver todas
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {lastCampaigns.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="rounded-full bg-muted p-3 mb-3">
                                    <Kanban className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    No hay campañas aún
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">
                                    Crea tu primera campaña para empezar a rastrear tu actividad
                                </p>
                                <Link href="/dashboard/campaigns">
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Crear Campaña
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lastCampaigns.map((campaign) => (
                                    <div
                                        key={campaign.id}
                                        className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {campaign.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {campaign.brand_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">·</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(campaign.updated_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <span className="text-sm font-medium">
                                                {formatCurrency(campaign.budget)}
                                            </span>
                                            <Badge variant={statusColors[campaign.status] ?? "outline"}>
                                                {statusLabels[campaign.status] ?? campaign.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Expenses (3/7) */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base">Gastos Recientes</CardTitle>
                        <Link href="/dashboard/finance">
                            <Button variant="ghost" size="sm" className="h-8 text-xs">
                                Ver todo
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentExpenses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                No hay gastos recientes
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentExpenses.map((expense) => (
                                    <div key={expense.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-base">
                                                {CATEGORY_ICONS[expense.category] || "📦"}
                                            </div>
                                            <div className="truncate">
                                                <p className="font-medium truncate">{expense.description}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                                            </div>
                                        </div>
                                        <span className="font-medium text-destructive whitespace-nowrap ml-2">
                                            -{formatCurrency(expense.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Grid: Deadlines + Pending Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <UpcomingDeadlines campaigns={allCampaigns} />
                <PendingTasksWidget tasks={pendingTasks} />
            </div>
        </div>
    );
}
