"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
    name: string;
    value: number;
    fill: string;
}

interface TopBrandsChartProps {
    data: DataPoint[];
}

export function TopBrandsChart({ data }: TopBrandsChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-1 h-full">
                <CardHeader>
                    <CardTitle className="text-base">Mejores Clientes (Top Brands)</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                    No hay datos suficientes
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 h-full">
            <CardHeader>
                <CardTitle className="text-base">Mejores Clientes (Top Brands)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 0, left: 0, bottom: 50 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="font-medium text-foreground">{payload[0].payload.name}</span>
                                                    <span className="font-mono font-bold text-foreground">
                                                        ${(payload[0].value as number).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
