"use client";

import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
    name: string;
    income: number;
    expenses: number;
}

interface RevenueChartProps {
    data: DataPoint[];
}

function formatCurrency(value: number) {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value}`;
}

export function RevenueChart({ data }: RevenueChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-base">Finanzas (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
                {!mounted ? (
                    <div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                                width={50}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    fontSize: 13,
                                }}
                                formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, ""]}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                name="Ingresos"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fill="url(#colorIncome)"
                                stackId="1"
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                name="Gastos"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#colorExpenses)"
                                stackId="2"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
