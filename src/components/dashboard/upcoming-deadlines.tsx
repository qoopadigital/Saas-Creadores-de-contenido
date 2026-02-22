"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock } from "lucide-react";

// Reusing CampaignData structure
interface CampaignData {
    id: string;
    title: string;
    brand_name: string;
    deadline?: string;
    status: string;
    payment_status?: string;
}

interface UpcomingDeadlinesProps {
    campaigns: CampaignData[];
}

export function UpcomingDeadlines({ campaigns }: UpcomingDeadlinesProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    // Filter logic
    const activeCampaigns = campaigns.filter(
        c => c.status !== "completed" && c.status !== "paid" && c.payment_status !== "paid"
    );

    const overdue = activeCampaigns.filter(c => {
        if (!c.deadline) return false;
        const deadlineDate = new Date(c.deadline);
        // Correct timezone shifts by appending time if string is date-only (or resetting hours)
        // Usually Supabase timestamps are ISO, resetting hours is sufficient:
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate < today;
    }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    const upcoming = activeCampaigns.filter(c => {
        if (!c.deadline) return false;
        const deadlineDate = new Date(c.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        // Is between today and next 7 days (inclusive)
        return deadlineDate >= today && deadlineDate <= next7Days;
    }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("es-CO", {
            month: "short",
            day: "numeric",
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl">Entregas de Campañas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Overdue Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-destructive font-medium border-b pb-1">
                        <AlertCircle className="h-4 w-4" />
                        <h3 className="text-sm uppercase tracking-wider">Atrasados</h3>
                    </div>
                    {overdue.length > 0 ? (
                        <ul className="space-y-2">
                            {overdue.map(c => (
                                <li key={c.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-destructive/10 border border-destructive/20">
                                    <div className="flex gap-2 items-center flex-1 min-w-0">
                                        <span className="font-semibold text-destructive shrink-0">{formatDate(c.deadline!)}</span>
                                        <span className="truncate">{c.title} <span className="text-muted-foreground text-xs font-normal">({c.brand_name})</span></span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground px-2">No hay campañas atrasadas.</p>
                    )}
                </div>

                {/* Upcoming Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary font-medium border-b pb-1">
                        <Clock className="h-4 w-4" />
                        <h3 className="text-sm uppercase tracking-wider">Próximos 7 días</h3>
                    </div>
                    {upcoming.length > 0 ? (
                        <ul className="space-y-2">
                            {upcoming.map(c => (
                                <li key={c.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50 border">
                                    <div className="flex gap-2 items-center flex-1 min-w-0">
                                        <span className="font-semibold text-primary shrink-0">{formatDate(c.deadline!)}</span>
                                        <span className="truncate">{c.title} <span className="text-muted-foreground text-xs font-normal">({c.brand_name})</span></span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground px-2">No hay entregas próximas en la semana.</p>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
