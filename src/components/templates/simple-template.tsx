"use client";

import { Instagram, Youtube, Mail } from "lucide-react";
import { TikTokEmbed, InstagramEmbed, YouTubeEmbed } from "react-social-media-embed";
import { ClientOnly } from "@/components/ui/client-only";

// Custom Icon for TikTok (Lucide doesn't have it yet, or use a generic one)
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
    email?: string;
}

export function SimpleTemplate({ profile }: { profile: Profile }) {
    const socials = profile.social_links || {};
    const videos = profile.featured_content || [];

    // Helper to detect video platform
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

                {/* Featured Content Grid */}
                {videos.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Destacados
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {videos.map((url, idx) => (
                                <div key={idx} className="rounded-xl overflow-hidden shadow-sm border bg-card">
                                    <ClientOnly>
                                        {getEmbedComponent(url)}
                                    </ClientOnly>
                                </div>
                            ))}
                        </div>
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
