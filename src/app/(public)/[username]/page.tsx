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
        .select("id, username, full_name, bio, avatar_url, email, selected_template, social_links, featured_content")
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
    };

    // In the future, we can switch templates based on typedProfile.selected_template
    // For now, we only have 'simple'
    return <SimpleTemplate profile={typedProfile} />;
}
