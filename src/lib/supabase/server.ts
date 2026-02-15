import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `❌ Missing environment variable: ${name}. Check your .env.local file.`
        );
    }
    return value;
}

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
        getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method is called from a Server Component where
                        // cookies cannot be set. This can be safely ignored if you have
                        // middleware refreshing user sessions.
                    }
                },
            },
        }
    );
}
