"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ExternalLink, Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
    portfolio_videos?: { tiktok: string[]; instagram: string[]; youtube: string[] } | null;
    portfolio_text_1?: string;
    portfolio_text_2?: string;
    portfolio_text_3?: string;
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

    // Portfolio text blocks
    portfolio_text_1: z.string().max(500).optional().or(z.literal("")),
    portfolio_text_2: z.string().max(500).optional().or(z.literal("")),
    portfolio_text_3: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

// Platform video config
const PLATFORMS = [
    { key: "tiktok" as const, label: "TikTok", placeholder: "https://www.tiktok.com/@user/video/...", max: 6 },
    { key: "instagram" as const, label: "Instagram", placeholder: "https://www.instagram.com/reel/...", max: 6 },
    { key: "youtube" as const, label: "YouTube", placeholder: "https://www.youtube.com/watch?v=...", max: 6 },
];

export function PublicProfileEditor({ profile }: { profile: Profile }) {
    const [isLoading, setIsLoading] = useState(false);

    // Video state per platform
    const defaultVideos = profile.portfolio_videos || { tiktok: [], instagram: [], youtube: [] };
    const [platformVideos, setPlatformVideos] = useState<{ tiktok: string[]; instagram: string[]; youtube: string[] }>({
        tiktok: defaultVideos.tiktok.length > 0 ? defaultVideos.tiktok : [""],
        instagram: defaultVideos.instagram.length > 0 ? defaultVideos.instagram : [""],
        youtube: defaultVideos.youtube.length > 0 ? defaultVideos.youtube : [""],
    });

    // Initial values mapping
    const defaultSocials = profile.social_links || {};

    const {
        register,
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
            portfolio_text_1: profile.portfolio_text_1 || "",
            portfolio_text_2: profile.portfolio_text_2 || "",
            portfolio_text_3: profile.portfolio_text_3 || "",
        },
    });

    const watchTemplate = watch("selected_template");
    const watchAvatarUrl = watch("avatar_url");
    const initials = (profile.full_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    // Video helpers
    function updateVideoUrl(platform: "tiktok" | "instagram" | "youtube", index: number, value: string) {
        setPlatformVideos(prev => ({
            ...prev,
            [platform]: prev[platform].map((v, i) => i === index ? value : v),
        }));
    }

    function addVideoSlot(platform: "tiktok" | "instagram" | "youtube") {
        setPlatformVideos(prev => ({
            ...prev,
            [platform]: [...prev[platform], ""],
        }));
    }

    function removeVideoSlot(platform: "tiktok" | "instagram" | "youtube", index: number) {
        setPlatformVideos(prev => ({
            ...prev,
            [platform]: prev[platform].filter((_, i) => i !== index),
        }));
    }

    async function onSubmit(data: FormValues) {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("bio", data.bio || "");
        formData.append("avatar_url", data.avatar_url || "");
        formData.append("selected_template", data.selected_template);

        // Social Links
        const socialLinks: Record<string, string> = {};
        if (data.instagram) socialLinks.instagram = data.instagram;
        if (data.tiktok) socialLinks.tiktok = data.tiktok;
        if (data.youtube) socialLinks.youtube = data.youtube;
        formData.append("social_links", JSON.stringify(socialLinks));

        // Portfolio Videos (per-platform, cleaned)
        const cleanVideos = {
            tiktok: platformVideos.tiktok.filter(u => u.trim().length > 0),
            instagram: platformVideos.instagram.filter(u => u.trim().length > 0),
            youtube: platformVideos.youtube.filter(u => u.trim().length > 0),
        };
        formData.append("portfolio_videos", JSON.stringify(cleanVideos));

        // Also save as flat featured_content for backwards compatibility
        const allUrls = [...cleanVideos.tiktok, ...cleanVideos.instagram, ...cleanVideos.youtube];
        formData.append("featured_content", JSON.stringify(allUrls));

        // Portfolio texts
        formData.append("portfolio_text_1", data.portfolio_text_1 || "");
        formData.append("portfolio_text_2", data.portfolio_text_2 || "");
        formData.append("portfolio_text_3", data.portfolio_text_3 || "");

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
                                        <Input {...register("bio")} placeholder="Breve descripción..." />
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

                        {/* 3. Portfolio Texts */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Textos del Portfolio</CardTitle>
                                <CardDescription>
                                    Bloques de texto que aparecerán en tu Media Kit para guiar a las marcas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Texto Superior</Label>
                                    <Textarea
                                        {...register("portfolio_text_1")}
                                        placeholder="Ej: ¡Hola! Soy creadora de contenido especializada en lifestyle y moda..."
                                        className="min-h-[80px]"
                                    />
                                    <p className="text-xs text-muted-foreground">Aparece debajo de tu bio, antes de los videos.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Texto Intermedio</Label>
                                    <Textarea
                                        {...register("portfolio_text_2")}
                                        placeholder="Ej: Mi comunidad es altamente comprometida con tasas de engagement del 5%..."
                                        className="min-h-[80px]"
                                    />
                                    <p className="text-xs text-muted-foreground">Aparece después de los videos destacados.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Texto de Cierre</Label>
                                    <Textarea
                                        {...register("portfolio_text_3")}
                                        placeholder="Ej: ¿Interesado en colaborar? Escríbeme y hablemos del proyecto perfecto..."
                                        className="min-h-[80px]"
                                    />
                                    <p className="text-xs text-muted-foreground">Aparece justo antes del botón de contacto.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Videos por Plataforma */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Videos Destacados</CardTitle>
                                <CardDescription>
                                    Organiza tus videos por plataforma. Máximo 6 por red social.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="tiktok" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="tiktok">
                                            TikTok
                                            {platformVideos.tiktok.filter(u => u.trim()).length > 0 && (
                                                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                                                    {platformVideos.tiktok.filter(u => u.trim()).length}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="instagram">
                                            Instagram
                                            {platformVideos.instagram.filter(u => u.trim()).length > 0 && (
                                                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                                                    {platformVideos.instagram.filter(u => u.trim()).length}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="youtube">
                                            YouTube
                                            {platformVideos.youtube.filter(u => u.trim()).length > 0 && (
                                                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                                                    {platformVideos.youtube.filter(u => u.trim()).length}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>

                                    {PLATFORMS.map((platform) => (
                                        <TabsContent key={platform.key} value={platform.key} className="space-y-3">
                                            {platformVideos[platform.key].map((url, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <Input
                                                        value={url}
                                                        onChange={(e) => updateVideoUrl(platform.key, index, e.target.value)}
                                                        placeholder={platform.placeholder}
                                                        className="flex-1"
                                                    />
                                                    {platformVideos[platform.key].length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => removeVideoSlot(platform.key, index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {platformVideos[platform.key].length < platform.max && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addVideoSlot(platform.key)}
                                                    className="mt-2"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" /> Agregar video
                                                </Button>
                                            )}
                                            {platformVideos[platform.key].length >= platform.max && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Has alcanzado el máximo de {platform.max} videos para {platform.label}.
                                                </p>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </CardContent>
                        </Card>

                    </TabsContent>
                </Tabs>
            </div>
        </form>
    );
}
