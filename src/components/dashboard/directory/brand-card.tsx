"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Edit2, Phone, FileText } from "lucide-react";
import { deleteBrand } from "@/app/(dashboard)/dashboard/directory/actions";
import { toast } from "sonner";
import { Brand } from "@/types/database.types";
import { EditBrandDialog } from "./edit-brand-dialog";
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

interface BrandCardProps {
    brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const { error } = await deleteBrand(brand.id);
        if (error) {
            toast.error("Error al eliminar la marca");
        } else {
            toast.success("Marca eliminada");
        }
        setIsDeleting(false);
        setDeleteOpen(false);
    };

    const renderStars = (rating: number | null) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < (rating || 0)
                        ? "fill-yellow-400 text-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
            />
        ));
    };

    return (
        <>
            <Card className="flex flex-col group transition-all hover:shadow-md h-full relative">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-bold leading-tight line-clamp-1">
                            {brand.name}
                        </CardTitle>
                        {brand.payment_terms && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                                {brand.payment_terms}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                        {renderStars(brand.rating)}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 pb-4 space-y-3">
                    {brand.contact_info && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{brand.contact_info}</span>
                        </div>
                    )}
                    {brand.guidelines && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-3">{brand.guidelines}</span>
                        </div>
                    )}
                    {!brand.contact_info && !brand.guidelines && (
                        <p className="text-sm text-muted-foreground/60 italic">
                            Sin información adicional
                        </p>
                    )}
                </CardContent>

                <CardFooter className="pt-0 flex justify-between border-t p-3 border-transparent group-hover:border-border transition-colors">
                    <div className="text-xs text-muted-foreground">
                        {new Date(brand.created_at).toLocaleDateString("es-CO", { month: "short", day: "numeric", year: "numeric" })}
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
                        <AlertDialogTitle>¿Eliminar Marca?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará &quot;{brand.name}&quot; de tu directorio. Las campañas vinculadas perderán la referencia.
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

            <EditBrandDialog brand={brand} open={editOpen} onOpenChange={setEditOpen} />
        </>
    );
}
