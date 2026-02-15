"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ExternalLink, Smartphone, Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

import { updateProfile } from "@/app/(dashboard)/dashboard/public-profile/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---- Types from DB ----
interface Profile {
    username: string;
    bio: string;
    avatar_url: string;
    full_name: string;
    selected_template?: string;
    social_links?: { [key: string]: string | undefined } | null;
    featured_content?: string[] | null;
}

// ---- Schema ----
const formSchema = z.object({
    username: z
        .string()
        .min(3, "El username debe tener al menos 3 caracteres")
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Solo letras, números, guiones y guiones bajos"
        ),
    bio: z.string().max(160, "Máximo 160 caracteres").optional().or(z.literal("")),
    avatar_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),

    selected_template: z.string(),

    // Social Links
    instagram: z.string().optional().or(z.literal("")),
    tiktok: z.string().optional().or(z.literal("")),
    youtube: z.string().optional().or(z.literal("")),

    // Featured Videos
    featured_videos: z.array(
        z.object({
            url: z.string().url("Debe ser una URL válida")
        })
    ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PublicProfileEditor({ profile }: { profile: Profile }) {
    const [isLoading, setIsLoading] = useState(false);

    // Initial values mapping
    const defaultSocials = profile.social_links || {};
    const defaultVideos = (profile.featured_content || []).map(url => ({ url }));
    // Ensure at least 3 video inputs if empty, or just use existing
    const initialVideos = defaultVideos.length > 0 ? defaultVideos : [{ url: "" }, { url: "" }, { url: "" }];

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            username: profile.username || "",
            bio: profile.bio || "",
            avatar_url: profile.avatar_url || "",
            selected_template: profile.selected_template || "simple",
            instagram: defaultSocials.instagram || "",
            tiktok: defaultSocials.tiktok || "",
            youtube: defaultSocials.youtube || "",
            featured_videos: initialVideos as { url: string }[],
        },
    });

    const { fields: videoFields, append, remove } = useFieldArray({
        control,
        name: "featured_videos",
    });

    const watchTemplate = watch("selected_template");
    const watchAvatarUrl = watch("avatar_url");
    const initials = (profile.full_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    async function onSubmit(data: FormValues) {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("bio", data.bio || "");
        formData.append("avatar_url", data.avatar_url || "");
        formData.append("selected_template", data.selected_template);

        // Prepare Social Links JSON
        const socialLinks: Record<string, string> = {};
        if (data.instagram) socialLinks.instagram = data.instagram;
        if (data.tiktok) socialLinks.tiktok = data.tiktok;
        if (data.youtube) socialLinks.youtube = data.youtube;
        formData.append("social_links", JSON.stringify(socialLinks));

        // Prepare Featured Content Array
        const featuredContent = (data.featured_videos || [])
            .map(v => v.url)
            .filter(url => url.length > 0);
        formData.append("featured_content", JSON.stringify(featuredContent));

        const result = await updateProfile(formData);

        if (result?.error) {
            toast.error("Error al guardar", { description: result.error });
        } else {
            toast.success("Perfil público actualizado correctamente");
        }

        setIsLoading(false);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="flex justify-between items-center">
                <Tabs defaultValue="design" className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList>
                            <TabsTrigger value="design">Diseño</TabsTrigger>
                            <TabsTrigger value="content">Contenido</TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            <Button variant="outline" asChild size="sm" className="hidden sm:flex gap-2">
                                <Link href={`/${profile.username}`} target="_blank">
                                    Ver en vivo
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button type="submit" disabled={isLoading} size="sm">
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Guardar
                            </Button>
                        </div>
                    </div>

                    {/* --- TAB: DESIGN --- */}
                    <TabsContent value="design" className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Template 1: Simple (Free) */}
                            <div
                                className={cn(
                                    "relative group cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-primary",
                                    watchTemplate === "simple" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
                                )}
                                onClick={() => setValue("selected_template", "simple")}
                            >
                                <div className="h-56 overflow-hidden bg-muted rounded-lg w-full mb-4 flex flex-col items-center justify-center p-6 space-y-4">
                                    {/* Schematic Preview */}
                                    <div className="h-12 w-12 rounded-full bg-foreground/10" />
                                    <div className="h-4 w-24 bg-foreground/10 rounded" />
                                    <div className="space-y-2 w-full">
                                        <div className="h-10 w-full bg-foreground/10 rounded" />
                                        <div className="h-10 w-full bg-foreground/10 rounded" />
                                        <div className="h-10 w-full bg-foreground/10 rounded" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Simple</h3>
                                    {watchTemplate === "simple" && <Badge>Seleccionado</Badge>}
                                </div>
                            </div>

                            {/* Template 2: Pro Bento (Locked) */}
                            <div className="relative border rounded-xl p-4 opacity-70 grayscale cursor-not-allowed bg-muted/30">
                                <div className="absolute top-4 right-4 z-10">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="h-56 overflow-hidden bg-muted rounded-lg w-full mb-4 flex p-2 gap-2">
                                    {/* Schematic Bento */}
                                    <div className="flex-1 bg-foreground/5 rounded-lg flex flex-col gap-2 p-1">
                                        <div className="h-1/3 bg-foreground/10 rounded" />
                                        <div className="flex-1 bg-foreground/10 rounded" />
                                    </div>
                                    <div className="flex-1 bg-foreground/5 rounded-lg flex flex-col gap-2 p-1">
                                        <div className="flex-1 bg-foreground/10 rounded" />
                                        <div className="h-1/3 bg-foreground/10 rounded" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-muted-foreground">Pro Bento</h3>
                                    <Badge variant="secondary">Próximamente</Badge>
                                </div>
                            </div>

                            {/* Template 3: Pro Dark (Locked) */}
                            <div className="relative border rounded-xl p-4 opacity-70 grayscale cursor-not-allowed bg-muted/30">
                                <div className="absolute top-4 right-4 z-10">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="h-56 overflow-hidden bg-black rounded-lg w-full mb-4 flex flex-col items-center justify-center p-6 space-y-4 border border-white/10">
                                    <div className="h-12 w-12 rounded-full bg-white/10" />
                                    <div className="h-4 w-24 bg-white/10 rounded" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-muted-foreground">Pro Dark</h3>
                                    <Badge variant="secondary">Próximamente</Badge>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- TAB: CONTENT --- */}
                    <TabsContent value="content" className="space-y-8">

                        {/* 1. Profile Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Perfil</CardTitle>
                                <CardDescription>Datos básicos que aparecerán en tu encabezado.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={watchAvatarUrl} />
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <Label>Avatar URL</Label>
                                        <Input {...register("avatar_url")} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Username</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">@</span>
                                            <Input {...register("username")} className="rounded-l-none" />
                                        </div>
                                        {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
                                    </div>
                                    <div>
                                        <Label>Bio</Label>
                                        <Input {...register("bio")} placeholder="Breve descrición..." />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Social Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Redes Sociales</CardTitle>
                                <CardDescription>Conecta tus perfiles sociales.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Instagram (Usuario)</Label>
                                        <Input {...register("instagram")} placeholder="ej: usuario" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>TikTok (Usuario)</Label>
                                        <Input {...register("tiktok")} placeholder="ej: usuario" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>YouTube (Canal/URL)</Label>
                                        <Input {...register("youtube")} placeholder="URL del canal" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Featured Videos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Videos Destacados</CardTitle>
                                <CardDescription>Muestra tus mejores TikToks, Reels o YouTube Shorts.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {videoFields.map((field, index) => (
                                    <div key={field.id} className="space-y-2">
                                        <Label className="flex justify-between">
                                            <span>Video {index + 1}</span>
                                            {index > 2 && (
                                                <button type="button" onClick={() => remove(index)} className="text-destructive text-xs hover:underline">
                                                    Eliminar
                                                </button>
                                            )}
                                        </Label>
                                        <Input
                                            {...register(`featured_videos.${index}.url` as const)}
                                            placeholder="https://www.tiktok.com/@user/video/..."
                                        />
                                        {errors.featured_videos?.[index]?.url && (
                                            <p className="text-destructive text-sm">{errors.featured_videos[index]?.url?.message}</p>
                                        )}
                                    </div>
                                ))}
                                {videoFields.length < 9 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ url: "" })}
                                        className="mt-2"
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Agregar otro video
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Has alcanzado el límite máximo de 9 videos.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                    </TabsContent>
                </Tabs>
            </div>
        </form>
    );
}
