"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Phone, UserCircle, DollarSign } from "lucide-react";
import { deleteProvider } from "@/app/(dashboard)/dashboard/directory/actions";
import { toast } from "sonner";
import { Provider } from "@/types/database.types";
import { EditProviderDialog } from "./edit-provider-dialog";
import { AddPaymentDialog } from "./add-payment-dialog";
import { PaymentHistoryDialog } from "./payment-history-dialog";
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

interface Campaign {
    id: string;
    title: string;
    brand_name: string;
}

interface ProviderCardProps {
    provider: Provider;
    totalPaid?: number;
    campaigns?: Campaign[];
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

export function ProviderCard({ provider, totalPaid = 0, campaigns = [] }: ProviderCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const { error } = await deleteProvider(provider.id);
        if (error) {
            toast.error("Error al eliminar el proveedor");
        } else {
            toast.success("Proveedor eliminado");
        }
        setIsDeleting(false);
        setDeleteOpen(false);
    };

    return (
        <>
            <Card className="flex flex-col group transition-all hover:shadow-md h-full relative">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <UserCircle className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-bold leading-tight line-clamp-1">
                                {provider.name}
                            </CardTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                        {provider.role && (
                            <Badge variant="outline" className="text-xs">
                                {provider.role}
                            </Badge>
                        )}
                        {totalPaid > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1 text-destructive bg-destructive/10">
                                <DollarSign className="h-3 w-3" />
                                Total: {formatCurrency(totalPaid)}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 pb-3 space-y-3">
                    {provider.contact_info ? (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{provider.contact_info}</span>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground/60 italic">
                            Sin información de contacto
                        </p>
                    )}

                    {/* Payment Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <AddPaymentDialog
                            providerId={provider.id}
                            providerName={provider.name}
                            campaigns={campaigns}
                        />
                        <PaymentHistoryDialog
                            providerId={provider.id}
                            providerName={provider.name}
                        />
                    </div>
                </CardContent>

                <CardFooter className="pt-0 flex justify-between border-t p-3 border-transparent group-hover:border-border transition-colors">
                    <div className="text-xs text-muted-foreground">
                        {new Date(provider.created_at).toLocaleDateString("es-CO", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditOpen(true)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Proveedor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará &quot;{provider.name}&quot; de tu directorio de forma permanente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditProviderDialog provider={provider} open={editOpen} onOpenChange={setEditOpen} />
        </>
    );
}
