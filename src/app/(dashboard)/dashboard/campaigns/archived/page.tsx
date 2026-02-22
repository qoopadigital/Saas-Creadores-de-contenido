import { getArchivedCampaigns } from "../actions";
import { ArchivedList } from "@/components/dashboard/kanban/archived-list";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ArchivedCampaignsPage() {
    const { data: campaigns, error } = await getArchivedCampaigns();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Archivo de Campañas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Campañas pagadas o en histórico que salieron del tablero activo.
                    </p>
                </div>
                <Link href="/dashboard/campaigns">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Activas
                    </Button>
                </Link>
            </div>

            {/* Error state */}
            {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar campañas archivadas: {error}
                </div>
            )}

            {/* Archived List component */}
            <ArchivedList initialCampaigns={campaigns ?? []} />
        </div>
    );
}
