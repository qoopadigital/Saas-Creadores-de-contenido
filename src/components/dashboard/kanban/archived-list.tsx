"use client";

import { useState } from "react";
import { restoreCampaign, deleteCampaignPermanently } from "@/app/(dashboard)/dashboard/campaigns/actions";
import { toast } from "sonner";
import { CalendarDays, ArchiveRestore, Trash2, DollarSign } from "lucide-react";
import type { CampaignData } from "./card"; // Reusing the same data structure typed earlier

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TAG_COLORS } from "@/components/ui/color-tags-input";
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

export function ArchivedList({ initialCampaigns }: { initialCampaigns: CampaignData[] }) {
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [isProcessing, setIsProcessing] = useState(false);

    // Delete Confirmation State
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

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
            year: "numeric"
        });
    }

    async function handleRestore(id: string) {
        setIsProcessing(true);
        const result = await restoreCampaign(id);
        if (result?.error) {
            toast.error("Error al restaurar la campaña");
        } else {
            toast.success("Campaña restaurada al tablero activo");
            setCampaigns(campaigns.filter((c) => c.id !== id));
        }
        setIsProcessing(false);
    }

    async function handleDeleteConfirmed() {
        if (!campaignToDelete) return;
        setIsProcessing(true);
        const result = await deleteCampaignPermanently(campaignToDelete);

        if (result?.error) {
            toast.error("Error al eliminar permanentemente");
        } else {
            toast.success("Campaña destruida definitivamente");
            setCampaigns(campaigns.filter((c) => c.id !== campaignToDelete));
        }
        setIsProcessing(false);
        setDeleteOpen(false);
        setCampaignToDelete(null);
    }

    if (campaigns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 mt-8 border border-dashed rounded-lg bg-muted/20">
                <p className="text-muted-foreground">Tu archivo está vacío.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((c) => (
                    <Card key={c.id} className="opacity-90 grayscale-[0.3]">
                        <CardHeader className="p-4 pb-2 space-y-2">
                            <div className="flex items-start justify-between">
                                <span className="text-xs text-muted-foreground font-medium truncate pr-2">
                                    {c.brand_name}
                                </span>
                                {c.tags && c.tags.length > 0 && (
                                    <div className="flex gap-1 shrink-0">
                                        {c.tags.map((tagId) => {
                                            const color = TAG_COLORS.find((t) => t.id === tagId)?.color;
                                            if (!color) return null;
                                            return <div key={tagId} className={`h-2 w-2 rounded-full ${color}`} title={tagId} />;
                                        })}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm font-semibold leading-tight line-clamp-2">
                                {c.title}
                            </p>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-2 flex flex-col gap-4">
                            <div className="flex w-full items-center justify-between">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                    {formatCurrency(c.budget)}
                                </span>
                                {c.deadline && (
                                    <Badge variant="secondary" className="text-xs gap-1 font-normal bg-background/50">
                                        <CalendarDays className="h-3 w-3" />
                                        {formatDate(c.deadline)}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-row items-center justify-between pt-2 border-t gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-2"
                                    disabled={isProcessing}
                                    onClick={() => handleRestore(c.id)}
                                >
                                    <ArchiveRestore className="w-4 h-4" /> Restaurar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="px-3"
                                    disabled={isProcessing}
                                    onClick={() => {
                                        setCampaignToDelete(c.id);
                                        setDeleteOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Permanent Deletion Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Destrucción Irreversible</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de borrar definitivamente esta campaña.
                            <br /><br />
                            <strong className="text-destructive">⚠️ Alerta Financiera:</strong> Cualquier ingreso o gastos atados a esta tarjeta dejarán de contabilizarse en tu panel de Finanzas. Esta acción NO se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirmed}
                            disabled={isProcessing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isProcessing ? "Eliminando..." : "Sí, borrar definitivamente"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
