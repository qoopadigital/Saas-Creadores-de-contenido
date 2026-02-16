"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MetricsListProps {
    title: string;
    data: { name: string; value: number; fill?: string }[];
    currency?: boolean;
}

export function MetricsList({ title, data, currency = true }: MetricsListProps) {
    // Basic verification
    if (!data || data.length === 0) {
        return (
            <Card className="h-full col-span-1 border-none shadow-none bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No hay datos registrados.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <Card className="h-full col-span-1 border-none shadow-none bg-muted/20">
            <CardHeader>
                <CardTitle className="text-lg font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.map((item, index) => {
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                        <div key={`${item.name}-${index}`} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium capitalize truncate pr-2" title={item.name}>
                                    {item.name === 'other' ? 'Otros' : item.name}
                                </span>
                                <span className="text-muted-foreground whitespace-nowrap">
                                    {currency ? `$${item.value.toLocaleString()}` : item.value}
                                    <span className="ml-1 text-xs">({percentage.toFixed(0)}%)</span>
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: item.fill || '#3b82f6', // Usa el color del ítem o azul por defecto
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
