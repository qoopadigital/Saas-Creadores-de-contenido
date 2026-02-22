"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getIdeas(
    tabType: 'normal' | 'favorites' = 'normal',
    page: number = 1,
    limit: number = 12
) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: null, count: 0, error: "No autorizado" };
    }

    let query = supabase
        .from("content_ideas")
        .select("*", { count: "exact" });

    if (tabType === 'favorites') {
        query = query.eq('status', 'favorite');
    } else {
        query = query.neq('status', 'favorite');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
        .order("created_at", { ascending: false })
        .range(from, to);

    const { data: ideas, error, count } = await query;

    if (error) {
        console.error("Error fetching ideas:", error);
        return { data: null, count: 0, error: error.message };
    }

    return { data: ideas, count: count || 0, error: null };
}

export async function createManualIdea(data: {
    title: string;
    description: string;
    platforms: string[];
    color: string;
}) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: null, error: "No autorizado" };
    }

    const { data: idea, error } = await supabase
        .from("content_ideas")
        .insert([{
            user_id: user.id,
            title: data.title,
            description: data.description,
            platforms: data.platforms || [],
            color: data.color || 'default',
            is_ai_generated: false,
            status: 'draft'
        }])
        .select()
        .single();

    if (error) {
        console.error("Error creating idea:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/ideas");
    return { data: idea, error: null };
}

export async function updateIdea(id: string, data: {
    title: string;
    description: string;
    platforms: string[];
    color: string;
}) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: null, error: "No autorizado" };
    }

    const { data: idea, error } = await supabase
        .from("content_ideas")
        .update({
            title: data.title,
            description: data.description,
            platforms: data.platforms || [],
            color: data.color || 'default',
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating idea:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/ideas");
    return { data: idea, error: null };
}

export async function generateIdeaWithAI(data: { topic: string; platform: string; tone: string }) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return { data: null, error: "La API key de Gemini no está configurada." };
    }

    const { topic, platform, tone } = data;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `Eres un experto estratega de contenido. 

CRÍTICO: Analiza el tema proporcionado. Si consideras que el tema NO tiene sentido, es un texto aleatorio tecleado al azar (ej: "asdsadasd"), es incomprensible o claramente no es una idea válida para generar contenido, debes abortar la generación y responder ÚNICA y EXCLUSIVAMENTE con la palabra exacta: INVALID_TOPIC

Si el tema es medianamente lógico y sirve para crear contenido, genera una idea para un vídeo sobre el tema: '${topic}'. La plataforma es '${platform}' y el tono debe ser '${tone}'. Devuelve el resultado con este formato exacto:

TÍTULO: [Un título atractivo]

GANCHOS (Hooks):
[3 opciones de frases para los primeros 3 segundos]

GUION/ESTRUCTURA:
[Breve resumen de los puntos a tratar]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Check for gibberish rejection
        if (responseText.trim() === "INVALID_TOPIC") {
            return { data: null, error: "¿Revisas tu idea? La IA te ayudará mucho más si estructuras mejor la misma." };
        }

        // Extraer el título y la descripción
        const titleMatch = responseText.match(/TÍTULO:\s*(.*)/i);
        // El título puede contener asteriscos de formato markdown, los limpiamos opcionalmente
        const generatedTitle = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : `Draft: ${topic}`;

        // Remove the TÍTULO line from the description, leaving only hooks and script
        const generatedDescription = responseText.replace(/TÍTULO:\s*(.*)/i, '').trim();

        // Guardar en Supabase
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { data: null, error: "No autorizado" };
        }

        const { data: idea, error: dbError } = await supabase
            .from("content_ideas")
            .insert({
                user_id: user.id,
                title: generatedTitle,
                description: generatedDescription,
                platforms: [platform],
                color: "default",
                status: "draft",
                is_ai_generated: true,
            })
            .select()
            .single();

        if (dbError) {
            console.error("DB Error generating idea:", dbError);
            return { data: null, error: "Error al guardar la idea generada." };
        }

        revalidatePath("/dashboard/ideas");
        return { data: idea, error: null };

    } catch (error: any) {
        console.error("Gemini AI API Error:", error);
        // Handle Rate Limiting gracefully
        if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
            return { data: null, error: "Hay mucha demanda en este momento (Límite de API superado). Por favor, espera unos segundos e intenta de nuevo." };
        }
        return { data: null, error: "Error al comunicarse con la IA." };
    }
}

export async function toggleFavoriteIdea(id: string, currentStatus: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: null, error: "No autorizado" };
    }

    const newStatus = currentStatus === "favorite" ? "draft" : "favorite";

    const { error } = await supabase
        .from("content_ideas")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating idea status:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/ideas");
    return { data: null, error: null };
}

export async function deleteIdea(id: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: null, error: "No autorizado" };
    }

    const { error } = await supabase
        .from("content_ideas")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting idea:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/ideas");
    return { data: null, error: null };
}
