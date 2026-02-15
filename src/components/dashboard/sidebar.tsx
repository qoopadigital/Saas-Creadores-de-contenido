"use client";

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
} from "lucide-react";

import { signOut } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    agencyOnly?: boolean;
}

const mainNavItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Campañas",
        href: "/dashboard/campaigns",
        icon: Kanban,
    },
    {
        label: "Finanzas",
        href: "/dashboard/finance",
        icon: DollarSign,
    },
    {
        label: "Equipo",
        href: "/dashboard/team",
        icon: Users,
        agencyOnly: true,
    },
    {
        label: "Perfil Público",
        href: "/dashboard/public-profile",
        icon: LayoutTemplate,
    },
];

const footerNavItems: NavItem[] = [
    {
        label: "Configuración",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

interface SidebarProps {
    userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();

    const filteredMainItems = mainNavItems.filter(
        (item) => !item.agencyOnly || userRole === "agency"
    );

    return (
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    C
                </div>
                <span className="text-lg font-semibold tracking-tight">CreatorOS</span>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {filteredMainItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Navigation (Settings & Sign Out) */}
            <div className="mt-auto border-t border-border p-3 space-y-1">
                {footerNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}

                <form action={signOut}>
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </form>
            </div>
        </aside>
    );
}
