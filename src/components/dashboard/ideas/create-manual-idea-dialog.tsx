"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { createManualIdea } from "@/app/(dashboard)/dashboard/ideas/actions";

const formSchema = z.object({
    title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(255, "Máximo 255 caracteres"),
    description: z.string().min(5, "Añade un poco más de detalle a la idea").max(5000, "El guion no puede superar los 5000 caracteres"),
    platforms: z.array(z.string()).default([]),
    color: z.string().default("default"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateManualIdeaDialog() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Platform selection state
    const platformOptions = ["Instagram", "TikTok", "YouTube", "Twitch", "Facebook"];
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [customPlatforms, setCustomPlatforms] = useState<string[]>([]);
    const [currentCustomPlatform, setCurrentCustomPlatform] = useState("");

    // Color options
    const colorOptions = [
        { name: "default", bg: "bg-muted" },
        { name: "red", bg: "bg-red-500" },
        { name: "orange", bg: "bg-orange-500" },
        { name: "yellow", bg: "bg-yellow-500" },
        { name: "green", bg: "bg-emerald-500" },
        { name: "blue", bg: "bg-blue-500" },
        { name: "purple", bg: "bg-purple-500" },
        { name: "pink", bg: "bg-pink-500" },
    ];
    const [selectedColor, setSelectedColor] = useState("default");

    const form = useForm<FormValues>({
        // @ts-ignore
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            platforms: [],
            color: "default",
        },
    });

    useEffect(() => {
        form.setValue("platforms", [...selectedPlatforms, ...customPlatforms]);
    }, [selectedPlatforms, customPlatforms, form]);

    useEffect(() => {
        form.setValue("color", selectedColor);
    }, [selectedColor, form]);

    const handleAddCustomPlatform = () => {
        if (customPlatforms.length >= 5) return;
        if (!currentCustomPlatform.trim()) return;

        const cleanPlatform = currentCustomPlatform.trim();
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
        setIsSubmitting(true);
        const result = await createManualIdea(data);

        if (result?.error) {
            toast.error("Error al guardar la idea", {
                description: result.error,
            });
        } else {
            toast.success("Idea guardada exitosamente");
            form.reset();
            setSelectedPlatforms([]);
            setCustomPlatforms([]);
            setCurrentCustomPlatform("");
            setSelectedColor("default");
            setOpen(false);
        }
        setIsSubmitting(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Idea <span className="text-muted-foreground font-normal">(Manual)</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nueva Idea Manual</DialogTitle>
                    <DialogDescription>
                        Anota tu idea antes de que se te olvide. Guardaremos esto en tus notas.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                        <FormField
                            // @ts-ignore
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título de la idea</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Challenge de baile 90s..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3">
                            <FormLabel>Plataformas (Opcional)</FormLabel>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {platformOptions.map((platform) => (
                                    <div key={platform} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`idea-platform-${platform}`}
                                            checked={selectedPlatforms.includes(platform)}
                                            onCheckedChange={(checked: boolean) => {
                                                if (checked) {
                                                    setSelectedPlatforms([...selectedPlatforms, platform]);
                                                } else {
                                                    setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                                                }
                                            }}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor={`idea-platform-${platform}`} className="font-normal cursor-pointer text-sm">
                                            {platform}
                                        </Label>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 mt-2">
                                <Label className="text-xs text-muted-foreground">Otras plataformas ({customPlatforms.length}/5)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Twitch, Podcast..."
                                        value={currentCustomPlatform}
                                        onChange={(e) => setCurrentCustomPlatform(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddCustomPlatform();
                                            }
                                        }}
                                        disabled={isSubmitting || customPlatforms.length >= 5}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleAddCustomPlatform}
                                        disabled={isSubmitting || customPlatforms.length >= 5 || !currentCustomPlatform.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

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

                        <FormField
                            // @ts-ignore
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción o Guion</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                placeholder="Detalla cómo sería la estructura, la música, etc..."
                                                className="min-h-[120px] resize-none pb-6"
                                                maxLength={5000}
                                                {...field}
                                            />
                                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
                                                {field.value?.length || 0} / 5000
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Color Picker */}
                        <div className="space-y-2 pt-2 border-t">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                                Etiqueta de Color
                            </FormLabel>
                            <div className="flex gap-2 items-center flex-wrap">
                                {colorOptions.map((co) => (
                                    <button
                                        key={co.name}
                                        type="button"
                                        title={`Color ${co.name}`}
                                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${co.bg} ${selectedColor === co.name
                                            ? "ring-2 ring-offset-2 ring-primary scale-110"
                                            : "opacity-70 hover:opacity-100 ring-1 ring-border shadow-sm"
                                            }`}
                                        onClick={() => setSelectedColor(co.name)}
                                    />
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-4 mt-2 border-t">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Guardar Idea"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
