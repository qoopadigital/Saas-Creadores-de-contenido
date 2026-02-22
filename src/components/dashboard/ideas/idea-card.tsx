"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Edit2, Sparkles, Youtube, Instagram, Twitter, Music2 } from "lucide-react";
import { toggleFavoriteIdea, deleteIdea } from "@/app/(dashboard)/dashboard/ideas/actions";
import { toast } from "sonner";
import { ContentIdea } from "@/types/database.types";
import { EditIdeaDialog } from "@/components/dashboard/ideas/edit-idea-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IdeaCardProps {
    idea: ContentIdea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [isPivotingFavorite, setIsPivotingFavorite] = useState(false);

    const isFavorite = idea.status === "favorite";

    const handleToggleFavorite = async () => {
        setIsPivotingFavorite(true);
        const { error } = await toggleFavoriteIdea(idea.id, idea.status);
        if (error) {
            toast.error("Error al actualizar la idea");
        }
        setIsPivotingFavorite(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const { error } = await deleteIdea(idea.id);
        if (error) {
            toast.error("Error al eliminar la idea");
        } else {
            toast.success("Idea eliminada");
        }
        setIsDeleting(false);
        setDeleteOpen(false);
    };

    const getPlatformIcon = (platform: string | null) => {
        if (!platform) return null;
        switch (platform.toLowerCase()) {
            case "youtube": return <Youtube className="h-4 w-4" />;
            case "instagram": return <Instagram className="h-4 w-4" />;
            case "tiktok": return <Music2 className="h-4 w-4" />;
            case "twitter": return <Twitter className="h-4 w-4" />;
            default: return null;
        }
    };

    const getColorClass = (color: string) => {
        switch (color) {
            case "red": return "border-l-red-500";
            case "orange": return "border-l-orange-500";
            case "yellow": return "border-l-yellow-500";
            case "green": return "border-l-emerald-500";
            case "blue": return "border-l-blue-500";
            case "purple": return "border-l-purple-500";
            case "pink": return "border-l-pink-500";
            default: return "border-l-transparent";
        }
    };

    const colorClass = getColorClass(idea.color || "default");

    return (
        <>
            <Card className={`flex flex-col group transition-all hover:shadow-md h-full relative border-l-4 ${colorClass}`}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div className="space-y-1 pr-6">
                        <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
                            {idea.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                            {idea.platforms && idea.platforms.length > 0 && idea.platforms.map(platform => (
                                <Badge key={platform} variant="secondary" className="gap-1 px-2 py-0 text-xs">
                                    {getPlatformIcon(platform)}
                                    <span className="capitalize">{platform}</span>
                                </Badge>
                            ))}
                            {idea.is_ai_generated && (
                                <Badge variant="default" className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 hover:text-indigo-700 gap-1 px-2 py-0 border-indigo-200">
                                    <Sparkles className="h-3 w-3" />
                                    IA
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                        {idea.description}
                    </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between border-t p-3 border-transparent group-hover:border-border transition-colors">
                    <div className="text-xs text-muted-foreground mt-1">
                        {new Date(idea.created_at).toLocaleDateString("es-CO", { month: "short", day: "numeric" })}
                    </div>

                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
                            onClick={handleToggleFavorite}
                            disabled={isPivotingFavorite}
                        >
                            <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-500" : ""}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setEditOpen(true)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Idea?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Perderás este guion de forma permanente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditIdeaDialog
                idea={idea}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
