"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateProfile } from "@/app/(dashboard)/dashboard/settings/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// ---- Schema ----
// Only validating full_name here
const formSchema = z.object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
    profile: {
        full_name: string;
        email: string;
    };
}

export function SettingsForm({ profile }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: profile.full_name,
        },
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("full_name", data.full_name);

        const result = await updateProfile(formData);

        if (result?.error) {
            toast.error("Error al guardar", { description: result.error });
        } else {
            toast.success("Información personal actualizada");
        }

        setIsLoading(false);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            {/* Personal Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Información de Cuenta</CardTitle>
                    <CardDescription>
                        Datos privados de tu cuenta en CreatorOS.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            placeholder="Tu nombre completo"
                            disabled={isLoading}
                            {...register("full_name")}
                        />
                        {errors.full_name && (
                            <p className="text-sm text-destructive">
                                {errors.full_name.message}
                            </p>
                        )}
                    </div>

                    {/* Email (readonly) */}
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profile.email} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">
                            El email no se puede cambiar desde aquí.
                        </p>
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
