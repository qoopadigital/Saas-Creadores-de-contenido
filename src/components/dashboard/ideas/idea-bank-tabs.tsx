"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, MessageSquareText, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateManualIdeaDialog } from "@/components/dashboard/ideas/create-manual-idea-dialog";
import { IdeaCard } from "@/components/dashboard/ideas/idea-card";
import { AiGeneratorForm } from "@/components/dashboard/ideas/ai-generator-form";
import { ContentIdea } from "@/types/database.types";

interface IdeaBankTabsProps {
    normalIdeas: ContentIdea[];
    favoriteIdeas: ContentIdea[];
    normalCount: number;
    favoriteCount: number;
    currentPage: number;
}

export function IdeaBankTabs({
    normalIdeas,
    favoriteIdeas,
    normalCount,
    favoriteCount,
    currentPage,
}: IdeaBankTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState("notes");

    const totalPages = Math.ceil(normalCount / 12);

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
                <TabsTrigger value="notes">Mis Notas</TabsTrigger>
                <TabsTrigger value="ai-generator" className="gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Generador IA
                </TabsTrigger>
            </TabsList>

            {/* 1. Mis Notas — with inner sub-tabs: Ideas / Favoritas */}
            <TabsContent value="notes" className="mt-0 outline-none space-y-6">
                <div className="flex items-center justify-between">
                    <div /> {/* Spacer */}
                    <CreateManualIdeaDialog />
                </div>

                <Tabs defaultValue="normal" className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
                        <TabsTrigger value="normal">
                            Mis Ideas
                            {normalCount > 0 && (
                                <span className="ml-1.5 text-xs text-muted-foreground">
                                    ({normalCount})
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="gap-1.5">
                            <Star className="h-3.5 w-3.5" />
                            Favoritas
                            {favoriteCount > 0 && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                    ({favoriteCount})
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Sub-tab: Mis Ideas (normal) */}
                    <TabsContent value="normal" className="mt-0 outline-none">
                        {normalIdeas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 text-center">
                                <MessageSquareText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold">Tu banco de ideas está vacío</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                    Anota esas chispas creativas antes de que se escapen, o usa la pestaña superior para pedirle sugerencias a la IA.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {normalIdeas.map((idea) => (
                                        <IdeaCard key={idea.id} idea={idea} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage <= 1}
                                            onClick={() => {
                                                router.push(`${pathname}?page=${currentPage - 1}`, { scroll: false });
                                                router.refresh();
                                            }}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                                        </Button>
                                        <span className="text-sm text-muted-foreground font-medium">
                                            Página {currentPage} de {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage >= totalPages}
                                            onClick={() => {
                                                router.push(`${pathname}?page=${currentPage + 1}`, { scroll: false });
                                                router.refresh();
                                            }}
                                        >
                                            Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Sub-tab: Favoritas */}
                    <TabsContent value="favorites" className="mt-0 outline-none">
                        {favoriteIdeas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 text-center">
                                <Star className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold">No tienes ideas favoritas</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                    Marca una idea con la ⭐ para guardarla aquí y no perderla de vista.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {favoriteIdeas.map((idea) => (
                                    <IdeaCard key={idea.id} idea={idea} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </TabsContent>

            {/* 2. Generador IA */}
            <TabsContent value="ai-generator" className="mt-0 outline-none">
                <AiGeneratorForm onGoToNotes={() => {
                    setActiveTab("notes");
                    router.push(`${pathname}?page=1`, { scroll: false });
                    router.refresh();
                }} />
            </TabsContent>
        </Tabs>
    );
}
