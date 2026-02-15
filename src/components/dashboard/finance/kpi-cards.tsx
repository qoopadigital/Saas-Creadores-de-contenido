import { DollarSign, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardsProps {
    totalRevenue: number;
    pendingAmount: number;
    pipelineValue: number;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(amount);
}

const cards = [
    {
        key: "revenue" as const,
        title: "Ingresos Totales",
        icon: DollarSign,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
    {
        key: "pending" as const,
        title: "Pendiente de Cobro",
        icon: Clock,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
    {
        key: "pipeline" as const,
        title: "En Pipeline",
        icon: TrendingUp,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
];

export function KpiCards({
    totalRevenue,
    pendingAmount,
    pipelineValue,
}: KpiCardsProps) {
    const values: Record<string, number> = {
        revenue: totalRevenue,
        pending: pendingAmount,
        pipeline: pipelineValue,
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
                <Card key={card.key}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <div className={`rounded-md p-2 ${card.bgColor}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(values[card.key])}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
