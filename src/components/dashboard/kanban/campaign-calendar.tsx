"use client";

import { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    startOfDay
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Type matches CampaignData
interface CampaignData {
    id: string;
    title: string;
    brand_name: string;
    deadline?: string;
    status: string;
    payment_status?: string;
}

interface CampaignCalendarProps {
    campaigns: CampaignData[];
}

export function CampaignCalendar({ campaigns }: CampaignCalendarProps) {
    const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Generate days for grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const today = startOfDay(new Date());

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }

    // Handlers
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const onDateClick = (dayEvent: Date) => {
        const campaignsForDay = campaigns.filter(
            c => c.deadline && isSameDay(new Date(c.deadline), dayEvent)
        );
        if (campaignsForDay.length > 0) {
            setSelectedDate(dayEvent);
            setIsDialogOpen(true);
        }
    };

    // Selected Day Data
    const campaignsForSelectedDay = selectedDate
        ? campaigns.filter(c => c.deadline && isSameDay(new Date(c.deadline), selectedDate))
        : [];

    return (
        <Card className="min-h-[600px]">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-primary" />
                        <span className="capitalize">{format(currentDate, "MMMM yyyy", { locale: es })}</span>
                    </h2>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(today)}>
                            Hoy
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d, i) => (
                        <div key={i} className="text-center text-sm font-medium text-muted-foreground py-2">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {days.map((dayItem, index) => {
                        const isCurrentMonth = isSameMonth(dayItem, monthStart);
                        const isToday = isSameDay(dayItem, today);

                        // Find campaigns for THIS day
                        const dayCampaigns = campaigns.filter(c => c.deadline && isSameDay(new Date(c.deadline), dayItem));
                        const hasCampaigns = dayCampaigns.length > 0;
                        const hasOverdue = dayCampaigns.some(c => c.status !== "completed" && c.status !== "paid" && isBefore(new Date(c.deadline!), today));

                        return (
                            <div
                                key={dayItem.toString()}
                                onClick={() => onDateClick(dayItem)}
                                className={`
                                    min-h-[100px] p-2 border rounded-md transition-colors relative flex flex-col
                                    ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-card"}
                                    ${isToday ? "ring-2 ring-primary ring-inset" : ""}
                                    ${hasCampaigns ? "cursor-pointer hover:bg-muted/50" : "cursor-default"}
                                `}
                            >
                                <span className={`text-sm font-semibold mb-1 ${isToday ? "text-primary" : ""}`}>
                                    {format(dayItem, "d")}
                                </span>

                                {/* Campaign Indicators */}
                                <div className="flex flex-col gap-1 overflow-hidden mt-1">
                                    {dayCampaigns.slice(0, 3).map(c => (
                                        <div
                                            key={c.id}
                                            className={`text-[10px] truncate px-1.5 py-0.5 rounded-sm font-medium ${c.status === "completed" || c.status === "paid"
                                                    ? "bg-emerald-500/10 text-emerald-600"
                                                    : isBefore(new Date(c.deadline!), today) && !isSameDay(new Date(c.deadline!), today)
                                                        ? "bg-destructive/10 text-destructive"
                                                        : "bg-primary/10 text-primary"
                                                }`}
                                        >
                                            {c.brand_name}
                                        </div>
                                    ))}
                                    {dayCampaigns.length > 3 && (
                                        <div className="text-[10px] text-muted-foreground text-center font-medium mt-0.5">
                                            +{dayCampaigns.length - 3} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            {/* Campaign Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Entregas: {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {campaignsForSelectedDay.map(c => (
                            <div key={c.id} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
                                <div>
                                    <h4 className="font-semibold text-sm">{c.title}</h4>
                                    <p className="text-xs text-muted-foreground">{c.brand_name}</p>
                                </div>
                                <Badge variant={c.status === "completed" || c.status === "paid" ? "secondary" : "outline"}>
                                    {c.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

// Inline helper local to prevent missing import
function isBefore(date1: Date, date2: Date) {
    return date1.getTime() < date2.getTime();
}
