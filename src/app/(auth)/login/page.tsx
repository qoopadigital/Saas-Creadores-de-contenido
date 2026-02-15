"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { login, signup } from "../actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// ---- Zod Schema ----
const authSchema = z.object({
    email: z.string().email("Ingresa un email válido"),
    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type AuthFormValues = z.infer<typeof authSchema>;

// ---- Login Form ----
function LoginForm() {
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [serverError, setServerError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
    });

    async function onSubmit(data: AuthFormValues) {
        setIsLoading(true);
        setServerError(null);

        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);

        const result =
            mode === "login" ? await login(formData) : await signup(formData);

        if (result?.error) {
            setServerError(result.error);
        }

        setIsLoading(false);
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    CreatorOS
                </CardTitle>
                <CardDescription>
                    {mode === "login"
                        ? "Inicia sesión en tu cuenta"
                        : "Crea una cuenta nueva"}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {/* Success message from signup redirect */}
                {message && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                        {message}
                    </div>
                )}

                {/* Server error */}
                {serverError && (
                    <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            autoComplete="email"
                            disabled={isLoading}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete={
                                mode === "login" ? "current-password" : "new-password"
                            }
                            disabled={isLoading}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
                {/* Toggle mode */}
                <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                        setMode(mode === "login" ? "signup" : "login");
                        setServerError(null);
                    }}
                >
                    {mode === "login"
                        ? "¿No tienes cuenta? Regístrate"
                        : "¿Ya tienes cuenta? Inicia sesión"}
                </button>

                <Link
                    href="/"
                    className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
                >
                    Volver al inicio
                </Link>
            </CardFooter>
        </Card>
    );
}

// ---- Page ----
export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Suspense
                fallback={
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando...
                    </div>
                }
            >
                <LoginForm />
            </Suspense>
        </div>
    );
}
