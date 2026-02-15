import { getCampaigns } from "./actions";
import { CreateCampaignDialog } from "@/components/dashboard/create-campaign-dialog";
import { KanbanBoard } from "@/components/dashboard/kanban/board";

export default async function CampaignsPage() {
    const { data: campaigns, error } = await getCampaigns();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Gestión de Campañas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Arrastra las tarjetas para cambiar el estado de cada campaña.
                    </p>
                </div>
                <CreateCampaignDialog />
            </div>

            {/* Error state */}
            {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar campañas: {error}
                </div>
            )}

            {/* Kanban Board */}
            <KanbanBoard initialCampaigns={campaigns ?? []} />
        </div>
    );
}
