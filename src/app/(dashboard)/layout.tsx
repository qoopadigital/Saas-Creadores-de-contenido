import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar — fixed on desktop */}
            <Sidebar />

            {/* Main content — offset by sidebar width */}
            <div className="md:pl-64">
                {/* Header */}
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Panel de Control
                    </h2>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                </header>

                {/* Page content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
