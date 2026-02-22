import { DollarSign, Clock, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardsProps {
    totalRevenue: number;
    pendingAmount: number;
    totalExpenses: number;
    providerExpenses: number;
    netProfit: number;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(amount);
}

export function KpiCards({
    totalRevenue,
    pendingAmount,
    totalExpenses,
    providerExpenses,
    netProfit,
}: KpiCardsProps) {
    const campaignExpenses = totalExpenses - providerExpenses;
    const cards = [
        {
            title: "Ingresos Cobrados",
            value: totalRevenue,
            icon: Wallet,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            title: "Gastos Totales",
            value: totalExpenses,
            icon: TrendingDown,
            color: "text-rose-500",
            bgColor: "bg-rose-500/10",
        },
        {
            title: "Beneficio Neto",
            value: netProfit,
            icon: DollarSign,
            color: "text-emerald-700",
            bgColor: "bg-emerald-500/20",
            isBold: true,
        },
        {
            title: "Pendiente de Cobro",
            value: pendingAmount,
            icon: Clock,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
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
                        <div className={`text-2xl font-bold ${card.isBold ? "text-emerald-900 dark:text-emerald-400" : ""}`}>
                            {formatCurrency(card.value)}
                        </div>
                        {card.title === "Gastos Totales" && providerExpenses > 0 && (
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Campañas</span>
                                    <span>{formatCurrency(campaignExpenses)}</span>
                                </div>
                                <div className="flex justify-between text-destructive font-medium">
                                    <span>Proveedores</span>
                                    <span>{formatCurrency(providerExpenses)}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
