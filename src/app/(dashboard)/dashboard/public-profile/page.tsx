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
        .select("id, username, bio, avatar_url, full_name, selected_template, social_links, featured_content, portfolio_videos, portfolio_text_1, portfolio_text_2, portfolio_text_3")
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
        portfolio_videos: profile.portfolio_videos as { tiktok: string[]; instagram: string[]; youtube: string[] } | undefined,
        portfolio_text_1: (profile.portfolio_text_1 as string) || "",
        portfolio_text_2: (profile.portfolio_text_2 as string) || "",
        portfolio_text_3: (profile.portfolio_text_3 as string) || "",
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
