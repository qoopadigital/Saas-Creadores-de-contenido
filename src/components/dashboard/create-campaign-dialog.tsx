"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, Link as LinkIcon, X } from "lucide-react";
import { toast } from "sonner";

import { createCampaign } from "@/app/(dashboard)/dashboard/campaigns/actions";
import { ColorTagsInput } from "@/components/ui/color-tags-input";
import type { Brand } from "@/types/database.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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

// ---- Schema ----
const formSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    brand_id: z.string().min(1, "Debes seleccionar una marca"),
    brand_name: z.string().default(""),
    budget: z.string().min(1, "El presupuesto es requerido"),
    deadline: z.string().min(1, "La fecha límite es requerida"),
    tags: z.array(z.string()).default([]),
    contract_links: z.array(z.string()).default([]),
    notes: z.string().optional(),
    platforms: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCampaignDialogProps {
    brands: Brand[];
}

export function CreateCampaignDialog({ brands }: CreateCampaignDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Platform selection state
    const platformOptions = ["Instagram", "TikTok", "YouTube", "Twitch", "Facebook"];
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    // Custom Platforms (Max 5)
    const [customPlatforms, setCustomPlatforms] = useState<string[]>([]);
    const [currentCustomPlatform, setCurrentCustomPlatform] = useState("");

    // Contract Links (Max 5)
    const [contractLinks, setContractLinks] = useState<string[]>([]);
    const [currentContractLink, setCurrentContractLink] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        // @ts-ignore
        resolver: zodResolver(formSchema),
        defaultValues: { tags: [], contract_links: [], notes: "", platforms: [], brand_id: "", brand_name: "" },
    });

    // Sync state to forms
    useEffect(() => {
        setValue("contract_links", contractLinks);
    }, [contractLinks, setValue]);

    useEffect(() => {
        setValue("platforms", [...selectedPlatforms, ...customPlatforms]);
    }, [selectedPlatforms, customPlatforms, setValue]);

    // Helper functions for dynamic lists
    const handleAddContractLink = () => {
        if (contractLinks.length >= 5) return;
        if (!currentContractLink) return;

        // Simple URL validation before adding
        try {
            new URL(currentContractLink);
            if (!contractLinks.includes(currentContractLink)) {
                setContractLinks([...contractLinks, currentContractLink]);
                setCurrentContractLink("");
            } else {
                toast.error("Este enlace ya ha sido añadido");
            }
        } catch (_) {
            toast.error("Por favor, introduce una URL válida");
        }
    };

    const handleRemoveContractLink = (linkToRemove: string) => {
        setContractLinks(contractLinks.filter(link => link !== linkToRemove));
    };

    const handleAddCustomPlatform = () => {
        if (customPlatforms.length >= 5) return;
        if (!currentCustomPlatform.trim()) return;

        const cleanPlatform = currentCustomPlatform.trim();
        // Check if it already exists in predefined or custom
        if (!selectedPlatforms.includes(cleanPlatform) && !customPlatforms.includes(cleanPlatform)) {
            setCustomPlatforms([...customPlatforms, cleanPlatform]);
            setCurrentCustomPlatform("");
        } else {
            toast.error("Esta plataforma ya está en la lista");
        }
    };

    const handleRemoveCustomPlatform = (platformToRemove: string) => {
        setCustomPlatforms(customPlatforms.filter(p => p !== platformToRemove));
    };

    async function onSubmit(data: FormValues) {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("brand_name", data.brand_name);
        formData.append("brand_id", data.brand_id);
        formData.append("budget", data.budget);
        formData.append("deadline", data.deadline);
        formData.append("tags", JSON.stringify(data.tags || []));

        if (contractLinks.length > 0) formData.append("contract_links", JSON.stringify(contractLinks));
        if (data.notes) formData.append("notes", data.notes);

        // Combine platforms
        const rawPlatforms = [...selectedPlatforms, ...customPlatforms];
        const finalPlatforms = rawPlatforms.filter(p => !!p && p.trim() !== "" && p.toLowerCase() !== "otro");
        formData.append("platforms", JSON.stringify(finalPlatforms));

        const result = await createCampaign(formData);

        if (result?.error) {
            toast.error("Error al crear la campaña", {
                description: result.error,
            });
        } else {
            toast.success("Campaña creada exitosamente");
            reset();
            setSelectedPlatforms([]);
            setCustomPlatforms([]);
            setCurrentCustomPlatform("");
            setContractLinks([]);
            setCurrentContractLink("");
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

            <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Campaña</DialogTitle>
                    <DialogDescription>
                        Completa los datos para registrar una nueva campaña.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 py-2">
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

                    {/* Brand Select */}
                    <div className="space-y-2">
                        <Label>Marca *</Label>
                        <Controller
                            control={control}
                            name="brand_id"
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        const selected = brands.find(b => b.id === val);
                                        if (selected) setValue("brand_name", selected.name);
                                    }}
                                    defaultValue={field.value}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar marca..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.length === 0 ? (
                                            <SelectItem value="__empty" disabled>
                                                No hay marcas — créalas en Directorio
                                            </SelectItem>
                                        ) : (
                                            brands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.brand_id && (
                            <p className="text-sm text-destructive">
                                {errors.brand_id.message}
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

                    {/* Platforms (Múltiples Redes Sociales) */}
                    <div className="space-y-3">
                        <Label>Redes Sociales</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {platformOptions.map((platform) => (
                                <div key={platform} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`platform-${platform}`}
                                        checked={selectedPlatforms.includes(platform)}
                                        onCheckedChange={(checked: boolean) => {
                                            if (checked) {
                                                setSelectedPlatforms([...selectedPlatforms, platform]);
                                            } else {
                                                setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                                            }
                                        }}
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor={`platform-${platform}`} className="font-normal cursor-pointer text-sm">
                                        {platform}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        {/* Custom Platforms Input (Max 5) */}
                        <div className="space-y-2 mt-2">
                            <Label className="text-xs text-muted-foreground">Plataformas extras ({customPlatforms.length}/5)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Añadir red social custom..."
                                    value={currentCustomPlatform}
                                    onChange={(e) => setCurrentCustomPlatform(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomPlatform();
                                        }
                                    }}
                                    disabled={isLoading || customPlatforms.length >= 5}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleAddCustomPlatform}
                                    disabled={isLoading || customPlatforms.length >= 5 || !currentCustomPlatform.trim()}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Badges for custom platforms */}
                            {customPlatforms.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {customPlatforms.map((platform) => (
                                        <Badge key={platform} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                            {platform}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                                onClick={() => handleRemoveCustomPlatform(platform)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contract Links (Max 5) */}
                    <div className="space-y-3">
                        <Label htmlFor="current_contract_link">Links de Contrato ({contractLinks.length}/5)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="current_contract_link"
                                type="url"
                                placeholder="https://drive.google.com/..."
                                disabled={isLoading || contractLinks.length >= 5}
                                value={currentContractLink}
                                onChange={(e) => setCurrentContractLink(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddContractLink();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleAddContractLink}
                                disabled={isLoading || contractLinks.length >= 5 || !currentContractLink.trim()}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {errors.contract_links && (
                            <p className="text-sm text-destructive">
                                {errors.contract_links.message}
                            </p>
                        )}

                        {/* Contract Links List */}
                        {contractLinks.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {contractLinks.map((link, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 text-sm border rounded-md bg-muted/30 group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-blue-600 dark:text-blue-400">
                                                {link}
                                            </a>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={() => handleRemoveContractLink(link)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ej: No usar color rojo..."
                            disabled={isLoading}
                            {...register("notes")}
                        />
                        {errors.notes && (
                            <p className="text-sm text-destructive">
                                {errors.notes.message}
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
