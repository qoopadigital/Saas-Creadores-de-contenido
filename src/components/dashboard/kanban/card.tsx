"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCampaign } from "@/app/(dashboard)/dashboard/campaigns/actions";
import { TAG_COLORS } from "@/components/ui/color-tags-input";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { EditCampaignDialog } from "./edit-campaign-dialog";

export interface CampaignData {
    id: string;
    title: string;
    brand_name: string;
    budget: number;
    deadline: string;
    status: string;
    tags?: string[];
    // Financials
    payment_status?: string;
    invoice_date?: string | null;
    invoice_number?: string | null;
    payment_method?: string | null;
    actual_hours?: number | null;
    total_expenses?: number;
}

interface KanbanCardProps {
    campaign: CampaignData;
    index: number;
    onDelete: (id: string) => void;
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

import { Clock, DollarSign, FileText } from "lucide-react"; // Start adding imports

export function KanbanCard({ campaign, index, onDelete }: KanbanCardProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        const result = await deleteCampaign(campaign.id);

        if (result?.error) {
            toast.error("Error al eliminar la campaña", {
                description: result.error,
            });
        } else {
            toast.success("Campaña eliminada exitosamente");
            onDelete(campaign.id);
        }
        setIsDeleting(false);
        setDeleteOpen(false);
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
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => setDeleteOpen(true)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
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
            />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
