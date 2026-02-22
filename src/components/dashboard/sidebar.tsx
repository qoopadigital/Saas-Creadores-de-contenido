"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Kanban,
    DollarSign,
    Users,
    Settings,
    LogOut,
    LayoutTemplate,
    Lightbulb,
    BookUser,
    X,
} from "lucide-react";

import { signOut } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    agencyOnly?: boolean;
}

const mainNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Banco de Ideas", href: "/dashboard/ideas", icon: Lightbulb },
    { label: "Campañas", href: "/dashboard/campaigns", icon: Kanban },
    { label: "Directorio", href: "/dashboard/directory", icon: BookUser },
    { label: "Finanzas", href: "/dashboard/finance", icon: DollarSign },
    { label: "Equipo", href: "/dashboard/team", icon: Users, agencyOnly: true },
    { label: "Perfil Público", href: "/dashboard/public-profile", icon: LayoutTemplate },
];

const footerNavItems: NavItem[] = [
    { label: "Configuración", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
    userRole?: string;
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
}

export function Sidebar({ userRole, isCollapsed, isMobileOpen, onCloseMobile }: SidebarProps) {
    const pathname = usePathname();

    const filteredMainItems = mainNavItems.filter(
        (item) => !item.agencyOnly || userRole === "agency"
    );

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        onCloseMobile();
    }, [pathname, onCloseMobile]);

    return (
        <>
            {/* Overlay para móvil */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={onCloseMobile}
                />
            )}

            {/* Contenedor del Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:w-16" : "md:w-64",
                    isMobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className={cn(
                    "flex h-16 items-center border-b border-border transition-all duration-300",
                    isCollapsed ? "justify-center px-2" : "gap-2 px-6 justify-between"
                )}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
                        C
                    </div>
                    {!isCollapsed && (
                        <>
                            <span className="text-lg font-semibold tracking-tight truncate">CreatorOS</span>
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={onCloseMobile}>
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>

                {/* Navegación Principal */}
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
                    {filteredMainItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-lg py-2 transition-all duration-300 group relative",
                                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                    isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                                )}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer (Configuración y Logout) */}
                <div className="mt-auto border-t border-border p-3 space-y-1">
                    {footerNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-lg py-2 transition-all duration-300 group relative",
                                pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                            )}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                        </Link>
                    ))}

                    <ModeToggle isCollapsed={isCollapsed} />

                    <form action={signOut}>
                        <Button
                            type="submit"
                            variant="ghost"
                            className={cn(
                                "w-full text-muted-foreground hover:text-destructive transition-all duration-300",
                                isCollapsed ? "justify-center px-0" : "justify-start gap-3"
                            )}
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            {!isCollapsed && <span>Cerrar Sesión</span>}
                        </Button>
                    </form>
                </div>
            </aside>
        </>
    );
}