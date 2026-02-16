"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Definimos los meses de forma estática para evitar errores y asegurar mayúsculas
const MONTHS = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
];

export function FinanceFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    // Obtener valores de la URL o usar fecha actual por defecto
    const currentYear = searchParams.get("year") || new Date().getFullYear().toString();
    const currentMonth = searchParams.get("month") || (new Date().getMonth() + 1).toString();

    useEffect(() => {
        setMounted(true);
    }, []);

    const updateFilters = (key: string, value: string) => {
        // Usamos searchParams.toString() para clonar los parámetros actuales
        // Así si cambias el mes, no pierdes el año seleccionado (y viceversa)
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);

        // Forzar una navegación limpia sin scroll
        router.push(`/dashboard/finance?${params.toString()}`, { scroll: false });
    };

    const clearFilters = () => {
        router.push("/dashboard/finance");
    };

    if (!mounted) {
        return <div className="h-10 w-[270px] animate-pulse rounded-md bg-muted" />; // Placeholder para evitar saltos
    }

    return (
        <div className="flex items-center gap-2">
            {/* Year Selector */}
            <Select value={currentYear} onValueChange={(val) => updateFilters("year", val)}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                    {/* Genera dinámicamente el año actual y los 4 anteriores */}
                    {Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i)).map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Month Selector */}
            <Select value={currentMonth} onValueChange={(val) => updateFilters("month", val)}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                    {MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                            {month.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Botón para limpiar filtros */}
            <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                title="Restablecer filtros"
                className="h-9 w-9"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}