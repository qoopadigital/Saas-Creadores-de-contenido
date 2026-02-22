"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateIdeaWithAI } from "@/app/(dashboard)/dashboard/ideas/actions";
import { ContentIdea } from "@/types/database.types";

interface AiGeneratorFormProps {
    onGoToNotes?: () => void;
}

export function AiGeneratorForm({ onGoToNotes }: AiGeneratorFormProps) {
    const [topic, setTopic] = useState("");
    const [platform, setPlatform] = useState("tiktok");
    const [tone, setTone] = useState("engaging");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedIdea, setGeneratedIdea] = useState<ContentIdea | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error("Por favor ingresa un tema.");
            return;
        }

        setIsGenerating(true);
        toast.info("Conectando con la IA...");

        const result = await generateIdeaWithAI({
            topic: topic.trim(),
            platform,
            tone,
        });

        if (result?.error) {
            toast.error(result?.error);
        } else if (result?.data) {
            toast.success("¡Magia lista! Creado tu guion exitosamente.");
            setGeneratedIdea(result.data as ContentIdea);
            setTopic("");
        }

        setIsGenerating(false);
    };

    if (generatedIdea) {
        return (
            <Card className="max-w-2xl mx-auto border-indigo-200 shadow-sm relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-transparent">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -z-10 blur-2xl" />
                <CardContent className="pt-12 pb-8 flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold">¡Idea generada con éxito!</h2>
                    <p className="text-muted-foreground max-w-sm">
                        Hemos guardado tu nuevo guion en el Banco de Ideas.
                    </p>

                    <div className="bg-white border rounded-lg p-4 w-full text-left my-4 shadow-sm">
                        <p className="font-semibold text-sm line-clamp-2">✨ {generatedIdea.title}</p>
                    </div>

                    <div className="flex gap-3 w-full justify-center pt-2">
                        <Button variant="outline" onClick={() => setGeneratedIdea(null)}>
                            Generar otra
                        </Button>
                        <Button onClick={onGoToNotes} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            👀 Ver mi idea
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto border-indigo-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -z-10 blur-2xl" />
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    Cofre Creativo <Sparkles className="h-5 w-5 text-indigo-500" />
                </CardTitle>
                <CardDescription>
                    ¿Bloqueo de escritor? Cuéntanos de qué quieres hablar y nosotros generaremos un guion estructurado para ti.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="topic">Tema o Producto</Label>
                    <div className="relative">
                        <Textarea
                            id="topic"
                            placeholder="Ej: Protector solar para piel mixta, Vlogs de viaje, Tips de finanzas..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isGenerating}
                            className="min-h-[100px] resize-none pb-6"
                            maxLength={1000}
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
                            {topic.length} / 1000
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="platform">Plataforma</Label>
                        <Select value={platform} onValueChange={setPlatform} disabled={isGenerating}>
                            <SelectTrigger id="platform">
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="instagram">Reels (Instagram)</SelectItem>
                                <SelectItem value="youtube">YouTube Shorts</SelectItem>
                                <SelectItem value="twitter">Hilo de Twitter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tone">Tono de voz</Label>
                        <Select value={tone} onValueChange={setTone} disabled={isGenerating}>
                            <SelectTrigger id="tone">
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="engaging">Atrapante / Retención rápida</SelectItem>
                                <SelectItem value="educational">Educativo / Tutorial</SelectItem>
                                <SelectItem value="humor">Humor / Comedia</SelectItem>
                                <SelectItem value="vlog">Estilo Vlog / Casero</SelectItem>
                                <SelectItem value="sales">Venta Directa / CTA Fuerte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-4 flex justify-end px-6">
                <Button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generando magia...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Generar Guion con IA
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
