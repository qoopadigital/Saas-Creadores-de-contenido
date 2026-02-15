"use client";

import { useState, useEffect } from "react";
import {
    DragDropContext,
    Droppable,
    type DropResult,
} from "@hello-pangea/dnd";
import { toast } from "sonner";

import { updateCampaignStatus } from "@/app/(dashboard)/dashboard/campaigns/actions";
import { KanbanCard, type CampaignData } from "./card";

// ---- Column definitions ----
const COLUMNS = [
    { id: "negotiation", label: "Negociación" },
    { id: "creation", label: "Creación" },
    { id: "review", label: "Revisión" },
    { id: "published", label: "Publicado" },
    { id: "payment_pending", label: "Pago Pendiente" },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

interface KanbanBoardProps {
    initialCampaigns: CampaignData[];
}

function groupByStatus(
    campaigns: CampaignData[]
): Record<ColumnId, CampaignData[]> {
    const groups: Record<string, CampaignData[]> = {};
    for (const col of COLUMNS) {
        groups[col.id] = [];
    }
    for (const c of campaigns) {
        if (groups[c.status]) {
            groups[c.status].push(c);
        } else {
            // Unknown status — default to first column
            groups[COLUMNS[0].id].push(c);
        }
    }
    return groups as Record<ColumnId, CampaignData[]>;
}

export function KanbanBoard({ initialCampaigns }: KanbanBoardProps) {
    const [columns, setColumns] = useState(() =>
        groupByStatus(initialCampaigns)
    );
    const [mounted, setMounted] = useState(false);

    // Avoid SSR hydration issues with DnD
    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync when server data changes
    useEffect(() => {
        setColumns(groupByStatus(initialCampaigns));
    }, [initialCampaigns]);

    async function onDragEnd(result: DropResult) {
        const { source, destination, draggableId } = result;

        // Dropped outside
        if (!destination) return;

        // Same position
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        )
            return;

        const sourceCol = source.droppableId as ColumnId;
        const destCol = destination.droppableId as ColumnId;

        // Optimistic update
        setColumns((prev) => {
            const next = { ...prev };
            const sourceItems = [...next[sourceCol]];
            const [moved] = sourceItems.splice(source.index, 1);
            const updated = { ...moved, status: destCol };

            const destItems =
                sourceCol === destCol ? sourceItems : [...next[destCol]];
            destItems.splice(destination.index, 0, updated);

            next[sourceCol] = sourceItems;
            next[destCol] = destItems;

            return next;
        });

        // Persist to DB
        if (sourceCol !== destCol) {
            const result = await updateCampaignStatus(draggableId, destCol);
            if (result?.error) {
                toast.error("Error al actualizar el estado", {
                    description: result.error,
                });
                // Revert optimistic update
                setColumns(groupByStatus(initialCampaigns));
            }
        }
    }

    if (!mounted) {
        return (
            <div className="grid grid-cols-5 gap-4">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            {col.label}
                        </h3>
                        <div className="rounded-lg border border-dashed border-border bg-muted/30 min-h-[200px] p-2" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="space-y-2">
                        {/* Column header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                {col.label}
                            </h3>
                            <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">
                                {columns[col.id].length}
                            </span>
                        </div>

                        {/* Droppable zone */}
                        <Droppable droppableId={col.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`rounded-lg border border-dashed min-h-[200px] p-2 transition-colors ${snapshot.isDraggingOver
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-muted/30"
                                        }`}
                                >
                                    {columns[col.id].map((campaign, index) => (
                                        <KanbanCard
                                            key={campaign.id}
                                            campaign={campaign}
                                            index={index}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
