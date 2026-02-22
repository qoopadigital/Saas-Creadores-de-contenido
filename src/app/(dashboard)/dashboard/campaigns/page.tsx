import Link from "next/link";
import { Archive } from "lucide-react";
import { getCampaigns } from "./actions";
import { getBrands } from "@/app/(dashboard)/dashboard/directory/actions";
import { CreateCampaignDialog } from "@/components/dashboard/create-campaign-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/dashboard/kanban/board";
import { CampaignCalendar } from "@/components/dashboard/kanban/campaign-calendar";

export default async function CampaignsPage() {
    const [{ data: campaigns, error }, brandsResult] = await Promise.all([
        getCampaigns(),
        getBrands(),
    ]);

    const brands = brandsResult.data || [];

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
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/campaigns/archived">
                        <Button variant="outline" className="gap-2">
                            <Archive className="h-4 w-4" />
                            Archivo
                        </Button>
                    </Link>
                    <CreateCampaignDialog brands={brands} />
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar campañas: {error}
                </div>
            )}

            <Tabs defaultValue="board" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="board">Tablero Kanban</TabsTrigger>
                    <TabsTrigger value="calendar">Calendario</TabsTrigger>
                </TabsList>

                <TabsContent value="board" className="mt-0 outline-none">
                    {/* Kanban Board */}
                    <KanbanBoard initialCampaigns={campaigns ?? []} brands={brands} />
                </TabsContent>

                <TabsContent value="calendar" className="mt-0 outline-none">
                    <CampaignCalendar campaigns={campaigns ?? []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
