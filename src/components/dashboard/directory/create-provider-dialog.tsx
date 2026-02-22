"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createProvider } from "@/app/(dashboard)/dashboard/directory/actions";

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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function CreateProviderDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [contactInfo, setContactInfo] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        setIsLoading(true);
        const { error } = await createProvider({
            name: name.trim(),
            role: role || undefined,
            contact_info: contactInfo || undefined,
        });

        if (error) {
            toast.error("Error al crear el proveedor", { description: error });
        } else {
            toast.success("Proveedor creado exitosamente");
            setName("");
            setRole("");
            setContactInfo("");
            setOpen(false);
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proveedor
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Añadir Proveedor</DialogTitle>
                    <DialogDescription>
                        Registra un miembro de tu equipo o colaborador externo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="provider-name">Nombre *</Label>
                        <Input id="provider-name" placeholder="Ej: Juan García" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
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
                        <Label htmlFor="provider-contact">Contacto</Label>
                        <Input id="provider-contact" placeholder="Ej: juan@email.com / +34 600..." value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} disabled={isLoading} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Proveedor
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
