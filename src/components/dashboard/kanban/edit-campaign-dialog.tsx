"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateCampaign } from "@/app/(dashboard)/dashboard/campaigns/actions";
import { ColorTagsInput } from "@/components/ui/color-tags-input";
import type { CampaignData } from "./card";

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

// ---- Schema ----
const formSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    brand_name: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
    budget: z.string().min(1, "El presupuesto es requerido"),
    deadline: z.string().min(1, "La fecha límite es requerida"),
    tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCampaignDialogProps {
    campaign: CampaignData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({
    campaign,
    open,
    onOpenChange,
}: EditCampaignDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: campaign.title,
            brand_name: campaign.brand_name,
            budget: String(campaign.budget),
            deadline: campaign.deadline
                ? new Date(campaign.deadline).toISOString().split("T")[0]
                : "",
            tags: campaign.tags || [],
        },
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("id", campaign.id);
        formData.append("title", data.title);
        formData.append("brand_name", data.brand_name);
        formData.append("budget", data.budget);
        formData.append("deadline", data.deadline);
        formData.append("status", campaign.status);
        formData.append("tags", JSON.stringify(data.tags || []));

        const result = await updateCampaign(formData);

        if (result?.error) {
            toast.error("Error al actualizar la campaña", {
                description: result.error,
            });
        } else {
            toast.success("Campaña actualizada exitosamente");
            onOpenChange(false);
        }

        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Editar Campaña</DialogTitle>
                    <DialogDescription>
                        Modifica los datos de la campaña.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Título de la Campaña</Label>
                        <Input
                            id="edit-title"
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
                        <Label htmlFor="edit-brand_name">Marca</Label>
                        <Input
                            id="edit-brand_name"
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
                        <Label htmlFor="edit-budget">Presupuesto ($)</Label>
                        <Input
                            id="edit-budget"
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
                        <Label htmlFor="edit-deadline">Fecha Límite</Label>
                        <Input
                            id="edit-deadline"
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



                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Etiquetas de Color</Label>
                        <Controller
                            control={control}
                            name="tags"
                            render={({ field }) => (
                                <ColorTagsInput
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
