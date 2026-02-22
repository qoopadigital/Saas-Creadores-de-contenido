"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProvider } from "@/app/(dashboard)/dashboard/directory/actions";
import { Provider } from "@/types/database.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditProviderDialogProps {
    provider: Provider;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProviderDialog({ provider, open, onOpenChange }: EditProviderDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(provider.name);
    const [role, setRole] = useState(provider.role || "");
    const [contactInfo, setContactInfo] = useState(provider.contact_info || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        setIsLoading(true);
        const { error } = await updateProvider(provider.id, {
            name: name.trim(),
            role: role || undefined,
            contact_info: contactInfo || undefined,
        });

        if (error) {
            toast.error("Error al actualizar", { description: error });
        } else {
            toast.success("Proveedor actualizado");
            onOpenChange(false);
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Editar Proveedor</DialogTitle>
                    <DialogDescription>
                        Modifica la información de {provider.name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="edit-provider-name">Nombre *</Label>
                        <Input id="edit-provider-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                    </div>

                    <div className="space-y-2">
                        <Label>Rol</Label>
                        <Select value={role} onValueChange={setRole} disabled={isLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Asistente">Asistente</SelectItem>
                                <SelectItem value="Fotógrafo">Fotógrafo</SelectItem>
                                <SelectItem value="Videógrafo">Videógrafo</SelectItem>
                                <SelectItem value="Community Manager">Community Manager</SelectItem>
                                <SelectItem value="Diseñador">Diseñador</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-provider-contact">Contacto</Label>
                        <Input id="edit-provider-contact" placeholder="Ej: juan@email.com" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} disabled={isLoading} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
