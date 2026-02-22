"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, CheckSquare } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toggleTaskCompletion } from "@/app/(dashboard)/dashboard/campaigns/actions";
import type { PendingTask } from "@/app/(dashboard)/dashboard/actions";

interface PendingTasksWidgetProps {
    tasks: PendingTask[];
}

export function PendingTasksWidget({ tasks: initialTasks }: PendingTasksWidgetProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const router = useRouter();

    const handleToggle = async (taskId: string) => {
        // Optimistic: remove from list
        setTasks(prev => prev.filter(t => t.id !== taskId));

        const result = await toggleTaskCompletion(taskId, true);
        if (result.error) {
            // Revert
            setTasks(initialTasks);
            toast.error("Error al completar la tarea");
        } else {
            toast.success("Tarea completada ✅");
            router.refresh();
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="rounded-md bg-violet-500/10 p-2">
                        <ListChecks className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Tareas Pendientes</CardTitle>
                        <CardDescription>
                            {tasks.length > 0
                                ? `${tasks.length} tarea${tasks.length !== 1 ? "s" : ""} por hacer`
                                : "Todo al día"
                            }
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="rounded-full bg-emerald-500/10 p-3 mb-2">
                            <CheckSquare className="h-6 w-6 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            ¡No hay tareas pendientes!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Todas tus tareas están completadas.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-start gap-3 p-2.5 rounded-lg border bg-background hover:bg-muted/50 transition-all group"
                            >
                                <Checkbox
                                    className="mt-0.5"
                                    onCheckedChange={() => handleToggle(task.id)}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-tight truncate">
                                        {task.title}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="mt-1 text-[10px] h-4 px-1.5 font-normal text-muted-foreground"
                                    >
                                        {task.campaign_title}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
