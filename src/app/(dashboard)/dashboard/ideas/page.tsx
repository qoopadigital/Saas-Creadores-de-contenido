import { getIdeas } from "./actions";
import { IdeaBankTabs } from "@/components/dashboard/ideas/idea-bank-tabs";
import { Lightbulb } from "lucide-react";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function IdeaBankPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

    const [normalResult, favoritesResult] = await Promise.all([
        getIdeas('normal', page, 12),
        getIdeas('favorites', 1, 50),
    ]);

    const error = normalResult.error || favoritesResult.error;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Lightbulb className="h-8 w-8 text-primary" />
                        Banco de Ideas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tu bóveda creativa. Guarda inspiraciones sueltas o genera nuevos guiones con IA.
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar tus ideas: {error}
                </div>
            )}

            <Suspense fallback={<div className="flex justify-center p-8"><span className="animate-pulse">Cargando ideas...</span></div>}>
                <IdeaBankTabs
                    normalIdeas={normalResult.data || []}
                    favoriteIdeas={favoritesResult.data || []}
                    normalCount={normalResult.count || 0}
                    favoriteCount={favoritesResult.count || 0}
                    currentPage={page}
                />
            </Suspense>
        </div>
    );
}
