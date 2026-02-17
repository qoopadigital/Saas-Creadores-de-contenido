"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    userEmail?: string;
    onMenuClick: () => void;
}

export function Header({ userEmail, onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 md:px-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onMenuClick} className="-ml-2">
                    <Menu className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
                <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
                    Panel de Control
                </h2>
            </div>
            <span className="text-sm text-muted-foreground">{userEmail}</span>
        </header>
    );
}
