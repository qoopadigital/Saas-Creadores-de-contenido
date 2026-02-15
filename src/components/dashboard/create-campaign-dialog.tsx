"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { createCampaign } from "@/app/(dashboard)/dashboard/campaigns/actions";

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

// ---- Schema ----
const formSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    brand_name: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
    budget: z.string().min(1, "El presupuesto es requerido"),
    deadline: z.string().min(1, "La fecha límite es requerida"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("brand_name", data.brand_name);
        formData.append("budget", data.budget);
        formData.append("deadline", data.deadline);

        const result = await createCampaign(formData);

        if (result?.error) {
            toast.error("Error al crear la campaña", {
                description: result.error,
            });
        } else {
            toast.success("Campaña creada exitosamente");
            reset();
            setOpen(false);
        }

        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Campaña
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Campaña</DialogTitle>
                    <DialogDescription>
                        Completa los datos para registrar una nueva campaña.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título de la Campaña</Label>
                        <Input
                            id="title"
                            placeholder="Ej: Campaña de Verano"
                            disabled={isLoading}
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Brand */}
                    <div className="space-y-2">
                        <Label htmlFor="brand_name">Marca</Label>
                        <Input
                            id="brand_name"
                            placeholder="Ej: Nike"
                            disabled={isLoading}
                            {...register("brand_name")}
                        />
                        {errors.brand_name && (
                            <p className="text-sm text-destructive">
                                {errors.brand_name.message}
                            </p>
                        )}
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                        <Label htmlFor="budget">Presupuesto ($)</Label>
                        <Input
                            id="budget"
                            type="number"
                            placeholder="1000"
                            disabled={isLoading}
                            {...register("budget")}
                        />
                        {errors.budget && (
                            <p className="text-sm text-destructive">
                                {errors.budget.message}
                            </p>
                        )}
                    </div>

                    {/* Deadline */}
                    <div className="space-y-2">
                        <Label htmlFor="deadline">Fecha Límite</Label>
                        <Input
                            id="deadline"
                            type="date"
                            disabled={isLoading}
                            {...register("deadline")}
                        />
                        {errors.deadline && (
                            <p className="text-sm text-destructive">
                                {errors.deadline.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Crear Campaña
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
