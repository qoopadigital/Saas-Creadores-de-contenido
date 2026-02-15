"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const TAG_COLORS = [
    { id: "red", color: "bg-red-500", label: "Rojo" },
    { id: "orange", color: "bg-orange-500", label: "Naranja" },
    { id: "yellow", color: "bg-yellow-500", label: "Amarillo" },
    { id: "green", color: "bg-green-500", label: "Verde" },
] as const;

interface ColorTagsInputProps {
    value?: string[];
    onChange: (tags: string[]) => void;
    className?: string;
}

export function ColorTagsInput({
    value = [],
    onChange,
    className,
}: ColorTagsInputProps) {
    const handleToggle = (colorId: string) => {
        const newTags = value.includes(colorId)
            ? value.filter((t) => t !== colorId)
            : [...value, colorId];
        onChange(newTags);
    };

    return (
        <div className={cn("flex items-center gap-3", className)}>
            {TAG_COLORS.map((tag) => {
                const isSelected = value.includes(tag.id);
                return (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggle(tag.id)}
                        className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            tag.color,
                            isSelected ? "ring-2 ring-offset-2 ring-foreground" : "opacity-80 hover:opacity-100"
                        )}
                        title={tag.label}
                        aria-label={`Seleccionar color ${tag.label}`}
                        aria-pressed={isSelected}
                    >
                        {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                    </button>
                );
            })}
        </div>
    );
}
