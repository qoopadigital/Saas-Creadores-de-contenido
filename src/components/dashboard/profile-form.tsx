"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ExternalLink } from "lucide-react";
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
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
    profile: {
        username: string;
        bio: string;
        avatar_url: string;
        full_name: string; // Needed for Avatar fallback
    };
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: profile.username,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
        },
    });

    const watchAvatarUrl = watch("avatar_url");

    const initials = (profile.full_name || "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    async function onSubmit(data: FormValues) {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("bio", data.bio || "");
        formData.append("avatar_url", data.avatar_url || "");

        const result = await updateProfile(formData);

        if (result?.error) {
            toast.error("Error al guardar", { description: result.error });
        } else {
            toast.success("Perfil público actualizado");
        }

        setIsLoading(false);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            {/* View Live Profile Link */}
            <div className="flex justify-end">
                <Button variant="outline" asChild className="gap-2">
                    <Link href={`/${profile.username}`} target="_blank">
                        Ver mi perfil en vivo
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Avatar */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Foto de Perfil</CardTitle>
                    <CardDescription>
                        Esta imagen te representará en la plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={watchAvatarUrl || undefined} alt="Avatar" />
                            <AvatarFallback className="text-lg font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="avatar_url">URL del Avatar</Label>
                            <Input
                                id="avatar_url"
                                placeholder="https://ejemplo.com/foto.jpg"
                                disabled={isLoading}
                                {...register("avatar_url")}
                            />
                            {errors.avatar_url && (
                                <p className="text-sm text-destructive">
                                    {errors.avatar_url.message}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Username + Bio */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Detalles Públicos</CardTitle>
                    <CardDescription>
                        Configura cómo te ven los demás.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Nombre de Usuario</Label>
                        <div className="flex">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                creatoros.com/
                            </span>
                            <Input
                                id="username"
                                placeholder="usuario"
                                className="rounded-l-none"
                                disabled={isLoading}
                                {...register("username")}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-sm text-destructive">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="bio">Bio</Label>
                            <span className="text-xs text-muted-foreground">
                                {(watch("bio") || "").length}/160
                            </span>
                        </div>
                        <Textarea
                            id="bio"
                            placeholder="Cuéntale al mundo quién eres..."
                            rows={3}
                            disabled={isLoading}
                            {...register("bio")}
                        />
                        {errors.bio && (
                            <p className="text-sm text-destructive">{errors.bio.message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="px-8">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar Cambios
                </Button>
            </div>
        </form>
    );
}
