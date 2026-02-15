import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicProfileEditor } from "@/components/dashboard/public-profile/editor";

export default async function PublicProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, full_name, selected_template, social_links, featured_content")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return <div>Error loading profile</div>;
    }

    // Adapt profile types for the editor
    const adaptedProfile = {
        username: profile.username || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        full_name: profile.full_name || "",
        selected_template: profile.selected_template || "simple",
        social_links: profile.social_links as Record<string, string> | undefined,
        featured_content: profile.featured_content as string[] | undefined,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Perfil Público
                </h1>
                <p className="text-muted-foreground mt-1">
                    Diseña tu página y gestiona tu contenido público.
                </p>
            </div>

            <PublicProfileEditor profile={adaptedProfile} />
        </div>
    );
}
