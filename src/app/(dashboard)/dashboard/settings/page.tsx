import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch current profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, username, full_name, bio, avatar_url")
        .eq("id", user.id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Configuración del Perfil
                </h1>
                <p className="text-muted-foreground mt-1">
                    Actualiza tu información pública y personaliza tu Media Kit.
                </p>
            </div>

            <SettingsForm
                profile={{
                    full_name: profile?.full_name ?? "",
                    email: profile?.email ?? user.email ?? "",
                }}
            />
        </div>
    );
}
