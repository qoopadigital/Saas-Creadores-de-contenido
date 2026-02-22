"use client";

import { Instagram, Youtube, Mail } from "lucide-react";
import { TikTokEmbed, InstagramEmbed, YouTubeEmbed } from "react-social-media-embed";
import { ClientOnly } from "@/components/ui/client-only";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom Icon for TikTok
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
    );
}

interface Profile {
    username: string;
    full_name: string;
    bio: string;
    avatar_url: string;
    social_links?: { [key: string]: string | undefined } | null;
    featured_content?: string[] | null;
    portfolio_videos?: { tiktok: string[]; instagram: string[]; youtube: string[] } | null;
    portfolio_text_1?: string | null;
    portfolio_text_2?: string | null;
    portfolio_text_3?: string | null;
    email?: string;
}

export function SimpleTemplate({ profile }: { profile: Profile }) {
    const socials = profile.social_links || {};

    // Per-platform videos (prefer portfolio_videos, fallback to featured_content auto-detect)
    const pv = profile.portfolio_videos || { tiktok: [], instagram: [], youtube: [] };

    // If portfolio_videos is empty but featured_content has data, auto-categorize
    const hasPlatformVideos = pv.tiktok.length > 0 || pv.instagram.length > 0 || pv.youtube.length > 0;
    let tiktokVideos = pv.tiktok;
    let instagramVideos = pv.instagram;
    let youtubeVideos = pv.youtube;

    if (!hasPlatformVideos && profile.featured_content && profile.featured_content.length > 0) {
        tiktokVideos = profile.featured_content.filter(u => u.includes("tiktok.com"));
        instagramVideos = profile.featured_content.filter(u => u.includes("instagram.com"));
        youtubeVideos = profile.featured_content.filter(u => u.includes("youtube.com") || u.includes("youtu.be"));
    }

    const platformTabs = [
        { key: "tiktok", label: "TikTok", icon: <TikTokIcon className="w-4 h-4" />, videos: tiktokVideos },
        { key: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" />, videos: instagramVideos },
        { key: "youtube", label: "YouTube", icon: <Youtube className="w-4 h-4" />, videos: youtubeVideos },
    ].filter(tab => tab.videos.length > 0);

    const getEmbedComponent = (url: string) => {
        if (url.includes("tiktok.com")) {
            return <TikTokEmbed url={url} width="100%" />;
        }
        if (url.includes("instagram.com")) {
            return <InstagramEmbed url={url} width="100%" captioned />;
        }
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            return <YouTubeEmbed url={url} width="100%" />;
        }
        return (
            <div className="p-4 border rounded bg-muted text-center text-sm">
                <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                    Ver Video
                </a>
            </div>
        );
    };

    // Find the first platform with videos for the default tab
    const defaultTab = platformTabs.length > 0 ? platformTabs[0].key : "tiktok";

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 pt-10 px-4">
                    <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden ring-2 ring-border">
                        <img
                            src={profile.avatar_url || "/placeholder-user.jpg"}
                            alt={profile.full_name}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                        <p className="text-muted-foreground">@{profile.username}</p>
                    </div>
                    {profile.bio && (
                        <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed max-w-md mx-auto">
                            {profile.bio}
                        </p>
                    )}
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-4 flex-wrap">
                    {socials.instagram && (
                        <a
                            href={`https://instagram.com/${socials.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-6 h-6" />
                        </a>
                    )}
                    {socials.tiktok && (
                        <a
                            href={`https://tiktok.com/@${socials.tiktok}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                            aria-label="TikTok"
                        >
                            <TikTokIcon className="w-6 h-6" />
                        </a>
                    )}
                    {socials.youtube && (
                        <a
                            href={socials.youtube.startsWith("http") ? socials.youtube : `https://youtube.com/${socials.youtube}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                            aria-label="YouTube"
                        >
                            <Youtube className="w-6 h-6" />
                        </a>
                    )}
                </div>

                {/* Portfolio Text 1 — Top */}
                {profile.portfolio_text_1 && (
                    <div className="text-center max-w-2xl mx-auto px-4">
                        <p className="text-sm sm:text-base text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                            {profile.portfolio_text_1}
                        </p>
                    </div>
                )}

                {/* Featured Content — Platform Tabs */}
                {platformTabs.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Portfolio
                        </h2>
                        <Tabs defaultValue={defaultTab} className="w-full">
                            <TabsList className={`grid w-full grid-cols-${platformTabs.length} max-w-md mx-auto`}>
                                {platformTabs.map((tab) => (
                                    <TabsTrigger key={tab.key} value={tab.key} className="gap-2">
                                        {tab.icon}
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {platformTabs.map((tab) => (
                                <TabsContent key={tab.key} value={tab.key}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        {tab.videos.map((url, idx) => (
                                            <div key={idx} className="rounded-xl overflow-hidden shadow-sm border bg-card">
                                                <ClientOnly>
                                                    {getEmbedComponent(url)}
                                                </ClientOnly>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                )}

                {/* Portfolio Text 2 — Middle */}
                {profile.portfolio_text_2 && (
                    <div className="text-center max-w-2xl mx-auto px-4">
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {profile.portfolio_text_2}
                        </p>
                    </div>
                )}

                {/* Portfolio Text 3 — Above CTA */}
                {profile.portfolio_text_3 && (
                    <div className="text-center max-w-2xl mx-auto px-4">
                        <p className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap">
                            {profile.portfolio_text_3}
                        </p>
                    </div>
                )}

                {/* Footer Action */}
                <div className="pt-8 pb-12 text-center">
                    {profile.email && (
                        <a
                            href={`mailto:${profile.email}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                        >
                            <Mail className="w-4 h-4" />
                            Contactar
                        </a>
                    )}
                </div>
            </main>

            <footer className="py-6 text-center text-xs text-muted-foreground border-t">
                Creado con <span className="font-bold">CreatorOS</span>
            </footer>
        </div>
    );
}
