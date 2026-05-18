"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { createBrand } from "@/app/(dashboard)/dashboard/directory/actions";
import type { Brand } from "@/types/database.types";

interface BrandComboboxProps {
    brands: Brand[];
    value: string; // brand_id
    onSelect: (brandId: string, brandName: string) => void;
    disabled?: boolean;
}

export function BrandCombobox({ brands: initialBrands, value, onSelect, disabled }: BrandComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [brands, setBrands] = useState(initialBrands);
    const [isCreating, setIsCreating] = useState(false);

    const selectedBrand = brands.find(b => b.id === value);

    // Filter brands by search
    const filtered = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    // Check if search matches any existing brand exactly
    const exactMatch = brands.some(b =>
        b.name.toLowerCase() === search.trim().toLowerCase()
    );

    async function handleCreateBrand() {
        const name = search.trim();
        if (!name) return;

        setIsCreating(true);
        const result = await createBrand({ name });

        if (result.error || !result.data) {
            toast.error("Error al crear la marca", { description: result.error || "Error desconocido" });
            setIsCreating(false);
            return;
        }

        // Add to local state
        const newBrand = result.data as Brand;
        setBrands(prev => [...prev, newBrand]);

        // Auto-select
        onSelect(newBrand.id, newBrand.name);
        toast.success(`Marca "${newBrand.name}" creada`);

        setSearch("");
        setIsCreating(false);
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                    disabled={disabled}
                >
                    <span className="truncate">
                        {selectedBrand ? selectedBrand.name : "Buscar o crear marca..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar o crear marca..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty className="py-2 px-3 text-sm text-muted-foreground">
                            No se encontraron marcas.
                        </CommandEmpty>
                        <CommandGroup>
                            {filtered.map((brand) => (
                                <CommandItem
                                    key={brand.id}
                                    value={brand.name}
                                    onSelect={() => {
                                        onSelect(brand.id, brand.name);
                                        setSearch("");
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === brand.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {brand.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        {/* Create inline option */}
                        {search.trim().length > 0 && !exactMatch && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={handleCreateBrand}
                                        disabled={isCreating}
                                        className="text-primary"
                                    >
                                        {isCreating ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="mr-2 h-4 w-4" />
                                        )}
                                        Crear marca &quot;{search.trim()}&quot;
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
