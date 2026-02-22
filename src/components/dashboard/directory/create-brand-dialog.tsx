"use client";

import { useState } from "react";
import { Loader2, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { createBrand } from "@/app/(dashboard)/dashboard/directory/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function CreateBrandDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [paymentTerms, setPaymentTerms] = useState("");
    const [guidelines, setGuidelines] = useState("");
    const [rating, setRating] = useState<number>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        setIsLoading(true);
        const { error } = await createBrand({
            name: name.trim(),
            contact_info: contactInfo || undefined,
            payment_terms: paymentTerms || undefined,
            guidelines: guidelines || undefined,
            rating: rating > 0 ? rating : undefined,
        });

        if (error) {
            toast.error("Error al crear la marca", { description: error });
        } else {
            toast.success("Marca creada exitosamente");
            setName("");
            setContactInfo("");
            setPaymentTerms("");
            setGuidelines("");
            setRating(0);
            setOpen(false);
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Marca
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Añadir Marca</DialogTitle>
                    <DialogDescription>
                        Registra una marca o cliente en tu directorio.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="brand-name">Nombre *</Label>
                        <Input id="brand-name" placeholder="Ej: Nike" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brand-contact">Contacto</Label>
                        <Input id="brand-contact" placeholder="Ej: contact@nike.com / +34 600..." value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} disabled={isLoading} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Términos de Pago</Label>
                            <Select value={paymentTerms} onValueChange={setPaymentTerms} disabled={isLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="immediate">Inmediato</SelectItem>
                                    <SelectItem value="Net-15">Net-15</SelectItem>
                                    <SelectItem value="Net-30">Net-30</SelectItem>
                                    <SelectItem value="Net-60">Net-60</SelectItem>
                                    <SelectItem value="Net-90">Net-90</SelectItem>
                                    <SelectItem value="upon-delivery">Al entregar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Rating</Label>
                            <div className="flex items-center gap-1 pt-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setRating(i + 1 === rating ? 0 : i + 1)}
                                        className="p-0.5 hover:scale-110 transition-transform"
                                        disabled={isLoading}
                                    >
                                        <Star
                                            className={`h-5 w-5 cursor-pointer ${i < rating
                                                    ? "fill-yellow-400 text-yellow-500"
                                                    : "text-muted-foreground/30 hover:text-yellow-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brand-guidelines">Notas / Guidelines</Label>
                        <Textarea
                            id="brand-guidelines"
                            placeholder="Ej: No usar el logo en rojo. Requieren aprobación previa..."
                            value={guidelines}
                            onChange={(e) => setGuidelines(e.target.value)}
                            disabled={isLoading}
                            className="min-h-[80px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Marca
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
