"use client";

import { useState, useEffect } from "react";
import { Loader2, History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getProviderPayments, deleteProviderPayment } from "@/app/(dashboard)/dashboard/directory/actions";
import type { ProviderPayment } from "@/types/database.types";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-CO", { month: "short", day: "numeric", year: "numeric" });

interface PaymentHistoryDialogProps {
    providerId: string;
    providerName: string;
}

export function PaymentHistoryDialog({ providerId, providerName }: PaymentHistoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [payments, setPayments] = useState<ProviderPayment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (open) {
            loadPayments();
        }
    }, [open]);

    const loadPayments = async () => {
        setIsLoading(true);
        const result = await getProviderPayments(providerId);
        if (result.data) {
            setPayments(result.data);
        }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const result = await deleteProviderPayment(deleteTarget);
        if (result.error) {
            toast.error("Error al eliminar el pago");
        } else {
            toast.success("Pago eliminado");
            setPayments((prev) => prev.filter((p) => p.id !== deleteTarget));
        }
        setIsDeleting(false);
        setDeleteTarget(null);
    };

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                        <History className="h-3.5 w-3.5" />
                        Ver historial
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            Historial de Pagos
                        </DialogTitle>
                        <DialogDescription>
                            Pagos realizados a <strong>{providerName}</strong>
                            {totalPaid > 0 && (
                                <span className="block mt-1 text-base font-bold text-destructive">
                                    Total: {formatCurrency(totalPaid)}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No hay pagos registrados para este proveedor.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Campaña</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {formatDate(payment.payment_date)}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm max-w-[180px] truncate">
                                            {payment.description}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                                            {payment.campaign_title || "—"}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-destructive text-sm whitespace-nowrap">
                                            -{formatCurrency(Number(payment.amount))}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => setDeleteTarget(payment.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Pago?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Este pago se eliminará permanentemente y se actualizarán las finanzas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
