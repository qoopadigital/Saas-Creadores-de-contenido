"use client";

import { useState, useEffect } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Archive, CalendarDays, MoreHorizontal, Pencil } from "lucide-react";
import { toast } from "sonner";

import { archiveCampaign } from "@/app/(dashboard)/dashboard/campaigns/actions";
import { TAG_COLORS } from "@/components/ui/color-tags-input";
import type { Brand } from "@/types/database.types";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed AlertDialog imports

import { EditCampaignDialog } from "./edit-campaign-dialog";

export interface CampaignData {
    id: string;
    title: string;
    brand_name: string;
    budget: number;
    deadline: string;
    status: string;
    tags?: string[];
    platform?: string;
    // Financials
    payment_status?: string;
    invoice_date?: string | null;
    invoice_number?: string | null;
    payment_method?: string | null;
    actual_hours?: number | null;
    total_expenses?: number;
    // Tasks
    tasks_total?: number;
    tasks_completed?: number;
    // Extras
    contract_links?: string[];
    notes?: string | null;
    platforms?: string[];
    // Directory link
    brand_id?: string | null;
}

interface KanbanCardProps {
    campaign: CampaignData;
    index: number;
    onDelete: (id: string) => void;
    brands?: Brand[];
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

import { Clock, DollarSign, FileText, CheckSquare } from "lucide-react"; // Start adding imports

export function KanbanCard({ campaign, index, onDelete, brands = [] }: KanbanCardProps) {
    const [editOpen, setEditOpen] = useState(false);

    const [isArchiving, setIsArchiving] = useState(false);

    async function handleArchive() {
        setIsArchiving(true);
        const result = await archiveCampaign(campaign.id);

        if (result?.error) {
            toast.error("Error al archivar la campaña", {
                description: result.error,
            });
        } else {
            toast.success("Campaña archivada exitosamente");
            // If the parent needs to know, we could call an onArchive prop, 
            // but the board relies on DND and will re-fetch or re-render automatically.
            // Since onDelete removes it from local state, we should probably do the same.
            // But since the server action calls revalidatePath, it should disappear on next render.
            // To be safe and instant, we can call onDelete to remove it from UI immediately.
            onDelete(campaign.id);
        }
        setIsArchiving(false);
    }

    return (
        <>
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
                            <CardHeader className="p-3 pb-0 space-y-2">
                                {/* Row 1: Brand & Actions */}
                                <div className="flex items-start justify-between">
                                    <span className="text-xs text-muted-foreground font-medium truncate pr-2">
                                        {campaign.brand_name}
                                    </span>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0 -mr-2 -mt-1"
                                                onClick={(e) => e.stopPropagation()}
                                                onPointerDown={(e) => e.stopPropagation()}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Opciones</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => setEditOpen(true)}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={handleArchive}
                                                disabled={isArchiving}
                                            >
                                                <Archive className="mr-2 h-4 w-4" />
                                                Archivar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Row 2: Tags */}
                                {campaign.tags && campaign.tags.length > 0 && (
                                    <div className="flex gap-1">
                                        {campaign.tags.map((tagId) => {
                                            const color = TAG_COLORS.find(
                                                (c) => c.id === tagId
                                            )?.color;
                                            if (!color) return null;
                                            return (
                                                <div
                                                    key={tagId}
                                                    className={`h-2 w-2 rounded-full ${color}`}
                                                    title={tagId}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="px-3 py-2">
                                <p className="text-sm font-semibold leading-tight line-clamp-2">
                                    {campaign.title}
                                </p>
                            </CardContent>
                            <CardFooter className="px-3 py-2 pt-0 flex flex-col gap-2 items-start">
                                <div className="flex w-full items-center justify-between">
                                    <span className="text-xs font-medium text-primary">
                                        {formatCurrency(campaign.budget)}
                                    </span>
                                    {campaign.deadline && (
                                        <Badge variant="secondary" className="text-xs gap-1 font-normal">
                                            <CalendarDays className="h-3 w-3" />
                                            {formatDate(campaign.deadline)}
                                        </Badge>
                                    )}
                                </div>

                                {/* Financial Indicators */}
                                <div className="flex items-center gap-2 w-full mt-1 flex-wrap">
                                    {/* Invoice Badge */}
                                    {(campaign.invoice_date || campaign.invoice_number) && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 text-blue-600 border-blue-200 bg-blue-50" title={campaign.invoice_date ? `Facturado: ${formatDate(campaign.invoice_date)}` : "Facturado"}>
                                            <FileText className="h-3 w-3" />
                                            <span>{campaign.invoice_number ? `#${campaign.invoice_number}` : "Facturado"}</span>
                                        </Badge>
                                    )}

                                    {/* Hours Badge */}
                                    {campaign.actual_hours && campaign.actual_hours > 0 && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1 font-normal bg-muted text-muted-foreground hover:bg-muted" title="Horas Reales">
                                            <Clock className="h-3 w-3" />
                                            <span>{campaign.actual_hours}h</span>
                                        </Badge>
                                    )}

                                    {/* Expenses Indicator (Compact) */}
                                    {campaign.total_expenses && campaign.total_expenses > 0 ? (
                                        <div className="flex items-center gap-1 text-[10px] text-destructive font-medium ml-auto" title="Gastos Totales">
                                            <DollarSign className="h-3 w-3" />
                                            <span>-{formatCurrency(campaign.total_expenses)}</span>
                                        </div>
                                    ) : null}

                                    {/* Tasks Progress Badge */}
                                    {campaign.tasks_total && campaign.tasks_total > 0 ? (
                                        <Badge
                                            variant="secondary"
                                            className={`text-[10px] h-5 px-1.5 gap-1 font-normal hover:bg-muted ${campaign.tasks_completed === campaign.tasks_total
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : "bg-muted text-muted-foreground"
                                                }`}
                                            title={`${campaign.tasks_completed}/${campaign.tasks_total} tareas completadas`}
                                        >
                                            <CheckSquare className="h-3 w-3" />
                                            <span>{campaign.tasks_completed}/{campaign.tasks_total}</span>
                                        </Badge>
                                    ) : null}
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </Draggable>

            {/* Edit Dialog */}
            <EditCampaignDialog
                campaign={campaign}
                open={editOpen}
                onOpenChange={setEditOpen}
                brands={brands}
            />


        </>
    );
}
