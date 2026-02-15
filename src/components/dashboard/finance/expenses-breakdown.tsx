"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ExpensesBreakdownProps {
    data: { name: string; value: number }[];
}

const CATEGORY_LABELS: Record<string, string> = {
    production: "Producción",
    travel: "Viajes",
    agency_fee: "Agencia",
    software: "Software",
    equipment: "Equipo",
    tax: "Impuestos",
    other: "Otros",
};

const CATEGORY_COLORS: Record<string, string> = {
    production: "bg-blue-500",
    travel: "bg-orange-500",
    agency_fee: "bg-purple-500",
    software: "bg-cyan-500",
    equipment: "bg-emerald-500",
    tax: "bg-red-500",
    other: "bg-gray-500",
};

export function ExpensesBreakdown({ data }: ExpensesBreakdownProps) {
    // If no data or empty array
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-1 border-none shadow-none bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Desglose de Gastos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No hay gastos registrados.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <Card className="col-span-1 border-none shadow-none bg-muted/20">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Desglose de Gastos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {sortedData.map((item) => {
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                        <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium capitalize">
                                    {CATEGORY_LABELS[item.name] || item.name}
                                </span>
                                <span className="text-muted-foreground">
                                    ${item.value.toLocaleString()} ({percentage.toFixed(0)}%)
                                </span>
                            </div>
                            <Progress
                                value={percentage}
                                className="h-2"
                                indicatorClassName={CATEGORY_COLORS[item.name] || "bg-primary"}
                            />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
