"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface DashboardLayoutProps {
    children: React.ReactNode;
    user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Default collapse on smaller desktop screens if desired, or just start expanded
        // keeping consistent with initial server render which assumes expanded/hidden based on CSS
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false); // Close mobile drawer if resizing to desktop
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-background" />; // Prevent hydration mismatch
    }

    const toggleSidebar = () => {
        if (window.innerWidth >= 768) {
            setIsCollapsed(!isCollapsed);
        } else {
            setIsMobileOpen(!isMobileOpen);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                onCloseMobile={() => setIsMobileOpen(false)}
            />

            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:pl-16" : "md:pl-64"
                )}
            >
                <Header
                    userEmail={user.email}
                    onMenuClick={toggleSidebar}
                />
                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
