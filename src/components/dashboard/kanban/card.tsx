"use client";

import { Draggable } from "@hello-pangea/dnd";
import { CalendarDays } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CampaignData {
    id: string;
    title: string;
    brand_name: string;
    budget: number;
    deadline: string;
    status: string;
}

interface KanbanCardProps {
    campaign: CampaignData;
    index: number;
}

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

export function KanbanCard({ campaign, index }: KanbanCardProps) {
    return (
        <Draggable draggableId={campaign.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-2 transition-transform ${snapshot.isDragging ? "rotate-2 scale-105" : ""
                        }`}
                >
                    <Card
                        className={`cursor-grab active:cursor-grabbing ${snapshot.isDragging
                                ? "shadow-lg ring-2 ring-primary/20"
                                : "shadow-sm hover:shadow-md"
                            }`}
                    >
                        <CardHeader className="px-3 py-2 pb-0">
                            <span className="text-xs text-muted-foreground font-medium truncate">
                                {campaign.brand_name}
                            </span>
                        </CardHeader>
                        <CardContent className="px-3 py-2">
                            <p className="text-sm font-semibold leading-tight line-clamp-2">
                                {campaign.title}
                            </p>
                        </CardContent>
                        <CardFooter className="px-3 py-2 pt-0 flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-primary">
                                {formatCurrency(campaign.budget)}
                            </span>
                            {campaign.deadline && (
                                <Badge variant="secondary" className="text-xs gap-1 font-normal">
                                    <CalendarDays className="h-3 w-3" />
                                    {formatDate(campaign.deadline)}
                                </Badge>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Draggable>
    );
}
