import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
} from "lucide-react";
import { getDashboardOverview } from "./actions";

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

export default async function DashboardPage() {
    const { data, error } = await getDashboardOverview();

    const activeCampaigns = data?.activeCampaignsCount ?? 0;
    const monthlyRevenue = data?.monthlyRevenue ?? 0;
    const teamMembers = data?.teamMembers ?? 1;
    const lastCampaigns = data?.lastCampaigns ?? [];

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
            title: "Ingresos del Mes",
            value: formatCurrency(monthlyRevenue),
            description:
                monthlyRevenue > 0
                    ? "Campañas completadas este mes"
                    : "Sin ingresos registrados este mes",
            icon: DollarSign,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            title: "Miembros del Equipo",
            value: String(teamMembers),
            description: teamMembers === 1 ? "Solo tú por ahora" : `${teamMembers} miembros`,
            icon: Users,
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
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
            {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar datos: {error}
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
                            <div className="text-2xl font-bold">{card.value}</div>
                            <CardDescription className="mt-1">
                                {card.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <Card>
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
                        <div className="space-y-3">
                            {lastCampaigns.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {campaign.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">
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
        </div>
    );
}
