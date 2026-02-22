import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SimpleTemplate } from "@/components/templates/simple-template";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    return {
        title: `@${username} — CreatorOS`,
        description: `Perfil público y portafolio de @${username}`,
    };
}

export default async function MediaKitPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const supabase = await createClient();

    // 1. Find profile by username
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name, bio, avatar_url, email, selected_template, social_links, featured_content, portfolio_videos, portfolio_text_1, portfolio_text_2, portfolio_text_3")
        .eq("username", username)
        .single();

    if (!profile) {
        notFound();
    }

    // Cast types for the template
    const typedProfile = {
        ...profile,
        social_links: profile.social_links as { [key: string]: string | undefined } | null,
        featured_content: profile.featured_content as string[] | null,
        portfolio_videos: profile.portfolio_videos as { tiktok: string[]; instagram: string[]; youtube: string[] } | null,
        portfolio_text_1: (profile.portfolio_text_1 as string) || null,
        portfolio_text_2: (profile.portfolio_text_2 as string) || null,
        portfolio_text_3: (profile.portfolio_text_3 as string) || null,
    };

    return <SimpleTemplate profile={typedProfile} />;
}
