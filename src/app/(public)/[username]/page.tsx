import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Mail, Briefcase, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        .select("id, username, full_name, bio, avatar_url, email")
        .eq("username", username)
        .single();

    if (!profile) {
        notFound();
    }

    // 2. Fetch public campaigns — NEVER expose budget!
    const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, brand_name, title, description")
        .eq("influencer_id", profile.id)
        .in("status", ["completed", "published"])
        .order("updated_at", { ascending: false });

    const publicCampaigns = campaigns ?? [];
    const displayName = profile.full_name || `@${profile.username}`;
    const initials = (profile.full_name || profile.username || "?")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="mx-auto max-w-2xl px-4 py-12">
                {/* ---- Header ---- */}
                <header className="flex flex-col items-center text-center mb-10">
                    {/* Avatar */}
                    {profile.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={displayName}
                            className="h-28 w-28 rounded-full object-cover ring-4 ring-background shadow-lg"
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold ring-4 ring-background shadow-lg">
                            {initials}
                        </div>
                    )}

                    {/* Name & Username */}
                    <h1 className="text-2xl font-bold mt-4">{displayName}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        @{profile.username}
                    </p>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground mt-4 max-w-md leading-relaxed">
                        {profile.bio ||
                            "Creador de contenido digital. Colaborando con las mejores marcas."}
                    </p>

                    {/* Contact CTA */}
                    <a href={`mailto:${profile.email}`} className="mt-6">
                        <Button size="lg" className="gap-2 px-8">
                            <Mail className="h-4 w-4" />
                            Contactar
                        </Button>
                    </a>
                </header>

                {/* ---- Portfolio ---- */}
                {publicCampaigns.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Portafolio</h2>
                            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                {publicCampaigns.length}
                            </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {publicCampaigns.map((campaign) => (
                                <Card
                                    key={campaign.id}
                                    className="group hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                                                    {campaign.brand_name}
                                                </p>
                                                <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                                                    {campaign.title}
                                                </h3>
                                                {campaign.description && (
                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                        {campaign.description}
                                                    </p>
                                                )}
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 mt-0.5 shrink-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* ---- Empty state ---- */}
                {publicCampaigns.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">
                            Este creador aún no tiene campañas publicadas.
                        </p>
                    </div>
                )}

                {/* ---- Footer ---- */}
                <footer className="mt-16 text-center text-xs text-muted-foreground">
                    <p>
                        Perfil creado con{" "}
                        <span className="font-semibold text-foreground">CreatorOS</span>
                    </p>
                </footer>
            </div>
        </div>
    );
}
