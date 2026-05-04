import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import RSSParser from "rss-parser";
import Groq from "groq-sdk";

// --- Config ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const parser = new RSSParser();

const SITE_URL = process.env.SITE_URL || "https://minutoglobal.co";
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

const DAILY_ARTICLE_BUDGET = 150;  // artículos web/día
const MAX_FB_POSTS_PER_DAY = 3;
const FB_POST_SLOTS = [9, 14, 20]; // hora Colombia (UTC-5)

// --- Feeds ---
const RSS_FEEDS = [
  { url: "https://www.eltiempo.com/rss/colombia.xml", category: "Colombia", name: "El Tiempo" },
  { url: "https://www.eltiempo.com/rss/politica.xml", category: "Colombia", name: "El Tiempo" },
  { url: "https://www.elespectador.com/arc/outboundfeeds/rss/?outputType=xml", category: "Colombia", name: "El Espectador" },
  { url: "https://www.semana.com/rss", category: "Colombia", name: "Semana" },
  { url: "https://feeds.bbci.co.uk/mundo/rss.xml", category: "Mundo", name: "BBC Mundo" },
  { url: "https://www.france24.com/es/rss", category: "Mundo", name: "France24" },
  { url: "https://www.portafolio.co/rss", category: "Economía", name: "Portafolio" },
  { url: "https://www.eltiempo.com/rss/economia.xml", category: "Economía", name: "El Tiempo" },
  { url: "https://www.xataka.com/feedburner.xml", category: "Tecnología", name: "Xataka" },
  { url: "https://www.eltiempo.com/rss/deportes.xml", category: "Deportes", name: "El Tiempo" },
  { url: "https://as.com/rss/tags/colombia/a.xml", category: "Deportes", name: "AS Colombia" },
];

const FALLBACK_FEEDS = [
  { url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada", category: "Mundo", name: "El País" },
  { url: "https://cnnespanol.cnn.com/feed/", category: "Mundo", name: "CNN en Español" },
  { url: "https://www.dw.com/rss/es/s-30684", category: "Mundo", name: "DW Español" },
  { url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada", category: "Economía", name: "El País" },
  { url: "https://www.infobae.com/feeds/rss/", category: "Mundo", name: "Infobae" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "Mundo", name: "NYT World" },
  { url: "https://hipertextual.com/feed", category: "Tecnología", name: "Hipertextual" },
  { url: "https://www.marca.com/rss/portada.xml", category: "Deportes", name: "Marca" },
];

const CATEGORY_IMAGES: Record<string, string[]> = {
  Colombia: [
    "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
    "https://images.unsplash.com/photo-1533699224246-6dc3b3ed3071?w=800&q=80",
    "https://images.unsplash.com/photo-1536532184021-da5392b55da1?w=800&q=80",
  ],
  Mundo: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80",
  ],
  "Economía": [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  ],
  "Tecnología": [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
  ],
  Deportes: [
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    "https://images.unsplash.com/photo-1461896836934-bd45ba8a0aef?w=800&q=80",
  ],
};

const CATEGORY_EMOJI: Record<string, string> = {
  Colombia: "🇨🇴",
  Mundo: "🌍",
  "Economía": "💰",
  "Tecnología": "🚀",
  Deportes: "⚽",
};

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  Colombia: ["#Colombia", "#Noticias", "#Bogotá"],
  Mundo: ["#Mundo", "#Internacional", "#NoticiasDelMundo"],
  "Economía": ["#Economía", "#Finanzas", "#Negocios"],
  "Tecnología": ["#Tecnología", "#IA", "#Innovación"],
  Deportes: ["#Deportes", "#Fútbol", "#Colombia"],
};

// --- Utils ---

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function estimateReadTime(text: string) {
  const words = text.split(/\s+/).length;
  return `${Math.max(2, Math.ceil(words / 200))} min lectura`;
}

function getCategoryImage(category: string) {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Mundo"];
  return images[Math.floor(Math.random() * images.length)];
}

function extractImage(item: Record<string, any>) {
  const candidates = [
    item.enclosure?.url,
    item["media:content"]?.$.url,
    item["media:thumbnail"]?.$.url,
  ];
  const htmlContent = item.content || item["content:encoded"] || "";
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) candidates.push(imgMatch[1]);

  for (const url of candidates) {
    if (
      url && url.startsWith("http") &&
      !url.includes("tracking") && !url.includes("pixel") &&
      !url.includes("icon") && !url.includes("logo") &&
      !url.includes("avatar") && !url.includes("1x1") && !url.includes("badge")
    ) return url;
  }
  return "";
}

async function isImageValid(url: string) {
  if (!url || !url.startsWith("http")) return false;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
    const ct = res.headers.get("content-type") || "";
    return res.ok && ct.startsWith("image");
  } catch {
    return false;
  }
}

function getColombiaHour() {
  return (new Date().getUTCHours() - 5 + 24) % 24;
}

function startOfColombianDayUTC() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0, 0));
  if (now < d) d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

// --- IA: reescritura web ---

async function rewriteWithAI(title: string, summary: string, source: string) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Eres un periodista provocador de MinutoGlobal. Reescribes noticias con palabras propias. Tono directo, contundente y polémico. Usas titulares que generen impacto y curiosidad. En política no tienes bando: criticas con la misma dureza a izquierda y derecha, señalas contradicciones, escándalos y promesas incumplidas de todos. No inventas datos, pero sí les das un ángulo picante y sin filtro. Español colombiano, lenguaje que la gente real usa.",
        },
        {
          role: "user",
          content: `Reescribe esta noticia con tus propias palabras.\n\nTítulo original: ${title}\nResumen: ${summary}\nFuente: ${source}\n\nUsa EXACTAMENTE este formato:\n\nTITULO===\nUn título reescrito atractivo pero serio\nRESUMEN===\nUn resumen de 1-2 oraciones\nCONTENIDO===\nPárrafo 1.\n\nPárrafo 2.\n\nPárrafo 3.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) return null;

    const titleMatch = text.match(/TITULO\s*===\s*([\s\S]*?)\s*RESUMEN\s*===/);
    const summaryMatch = text.match(/RESUMEN\s*===\s*([\s\S]*?)\s*CONTENIDO\s*===/);
    const contentMatch = text.match(/CONTENIDO\s*===\s*([\s\S]*)/);
    const clean = (s: string) => s.replace(/\*{2,}/g, "").replace(/^[\s"]+|[\s"]+$/g, "").trim();

    if (titleMatch && summaryMatch && contentMatch) {
      return {
        title: clean(titleMatch[1]),
        summary: clean(summaryMatch[1]),
        content: clean(contentMatch[1]),
      };
    }

    const cleanText = text.replace(/={2,}/g, "").replace(/TITULO|RESUMEN|CONTENIDO/gi, "");
    const lines = cleanText.split("\n").filter((l) => l.trim().length > 10);
    if (lines.length >= 3) {
      return {
        title: lines[0].replace(/^[#*\-\d.:\s]+/, "").replace(/["*]/g, "").trim().slice(0, 200),
        summary: lines[1].replace(/^[#*\-\d.:\s]+/, "").replace(/["*]/g, "").trim().slice(0, 300),
        content: lines.slice(2).join("\n\n").replace(/["*]/g, "").trim(),
      };
    }
    return null;
  } catch (err: any) {
    return { _error: err?.message || "unknown" } as any;
  }
}

// --- IA: copy Facebook (4 estilos rotando) ---

const FB_COPY_STYLES = ["pregunta", "dato", "cita", "polemica"];

async function generateFacebookCopy(
  title: string, summary: string, content: string, category: string, slotIndex: number
) {
  const style = FB_COPY_STYLES[slotIndex % FB_COPY_STYLES.length];
  const styleInstructions: Record<string, string> = {
    pregunta: "Empieza planteando la noticia de forma intrigante y termina con una pregunta abierta directa al lector.",
    dato: "Empieza con un dato o cifra impactante (formato '💡 Dato clave:' o similar), luego contexto breve, termina con pregunta al lector.",
    cita: "Comienza con una frase entrecomillada extraída o inspirada en el contenido, luego 1 línea de contexto, termina con pregunta.",
    polemica: "Formula la noticia como afirmación fuerte que invite al debate (sin mentir ni amarillismo), termina con '¿Estás de acuerdo?' o similar.",
  };

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Eres community manager experto en Facebook. Creas copys cortos (máx 500 caracteres), naturales, que generan comentarios. Nunca incluyes URLs ni '👉 Lee aquí'. Español colombiano neutro.",
        },
        {
          role: "user",
          content: `Crea un post de Facebook para esta noticia.

Título: ${title}
Resumen: ${summary}
Contenido: ${content.slice(0, 600)}

Estilo obligatorio: ${styleInstructions[style]}

Reglas estrictas:
- Máximo 500 caracteres (sin contar hashtags).
- Tiene que terminar SIEMPRE con una pregunta al lector en línea aparte.
- NO incluyas enlaces, NO digas "lee aquí", NO menciones MinutoGlobal.
- Devuelve SOLO el texto del post, sin comillas ni etiquetas.`,
        },
      ],
      temperature: 0.85,
      max_tokens: 400,
    });

    let copy = response.choices[0]?.message?.content?.trim() || "";
    copy = copy.replace(/^["']|["']$/g, "").replace(/https?:\/\/\S+/g, "").trim();
    if (copy.length < 30) throw new Error("copy corto");

    const emoji = CATEGORY_EMOJI[category] || "📰";
    const hashtags = (CATEGORY_HASHTAGS[category] || []).slice(0, 3).join(" ");
    return `${emoji} ${copy}\n\n${hashtags}`;
  } catch {
    const emoji = CATEGORY_EMOJI[category] || "📰";
    const hashtags = (CATEGORY_HASHTAGS[category] || []).slice(0, 3).join(" ");
    return `${emoji} ${title}\n\n${summary}\n\n¿Qué opinas al respecto? 👇\n\n${hashtags}`;
  }
}

// --- Facebook: post + primer comentario con link ---

async function postToFacebook(
  article: { title: string; summary: string; content: string; category: string; image_url: string; slug: string },
  slotIndex: number
): Promise<string | null> {
  if (!FB_PAGE_ID || !FB_PAGE_TOKEN) return null;
  const articleUrl = `${SITE_URL}/noticia/${article.slug}`;

  const message = await generateFacebookCopy(
    article.title, article.summary, article.content, article.category, slotIndex
  );

  let endpoint: string, body: Record<string, string>;
  if (article.image_url && article.image_url.startsWith("http")) {
    endpoint = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos`;
    body = { message, url: article.image_url, access_token: FB_PAGE_TOKEN };
  } else {
    endpoint = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/feed`;
    body = { message, access_token: FB_PAGE_TOKEN };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const postId = data.post_id || data.id;
    if (!postId) return null;

    // Link como primer comentario
    try {
      await fetch(`https://graph.facebook.com/v21.0/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `🔗 Lee la noticia completa aquí:\n${articleUrl}`,
          access_token: FB_PAGE_TOKEN,
        }),
      });
    } catch { /* ignorar */ }

    return postId;
  } catch {
    return null;
  }
}

// --- Handler ---

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // === 1. Cargar estado ===
    const { data: existing } = await supabase
      .from("articles")
      .select("source_url, created_at, fb_post_id")
      .order("created_at", { ascending: false })
      .limit(500);

    const processedUrls = new Set(existing?.map((r) => r.source_url) || []);
    const lastArticleTime = existing?.[0]?.created_at ? new Date(existing[0].created_at) : null;
    const minutesSinceLastArticle = lastArticleTime
      ? (Date.now() - lastArticleTime.getTime()) / 60000
      : 999;

    const colombiaDayStart = startOfColombianDayUTC();
    const publishedToday = existing?.filter((r) => new Date(r.created_at) >= colombiaDayStart).length || 0;
    const remainingBudget = DAILY_ARTICLE_BUDGET - publishedToday;

    // === 2. Scraping RSS → web (siempre) ===
    let processed = 0;
    const results: string[] = [];
    const errors: string[] = [];
    let usedFallback = false;

    if (remainingBudget > 0) {
      const horaCO = getColombiaHour();
      const horasRestantes = 24 - new Date().getUTCHours();
      let maxPerRun = horaCO >= 6 && horaCO < 22
        ? Math.min(5, Math.ceil(remainingBudget / (horasRestantes * 6)))
        : Math.min(2, Math.ceil(remainingBudget / (horasRestantes * 6)));
      maxPerRun = Math.max(1, Math.min(maxPerRun, remainingBudget));

      const newItems: Array<{ title: string; summary: string; link: string; category: string; source: string; imageUrl: string }> = [];

      for (const feed of RSS_FEEDS) {
        try {
          const result = await parser.parseURL(feed.url);
          for (const item of result.items.slice(0, 3)) {
            const link = item.link || "";
            if (link && !processedUrls.has(link) && (item.title?.length || 0) >= 15) {
              newItems.push({
                title: item.title || "",
                summary: item.contentSnippet || item.content || item.description || "",
                link, category: feed.category, source: feed.name,
                imageUrl: extractImage(item as Record<string, any>),
              });
            }
          }
        } catch { /* feed inaccesible */ }
      }

      if (newItems.length === 0 && minutesSinceLastArticle > 30) {
        usedFallback = true;
        for (const feed of FALLBACK_FEEDS) {
          try {
            const result = await parser.parseURL(feed.url);
            for (const item of result.items.slice(0, 3)) {
              const link = item.link || "";
              if (link && !processedUrls.has(link) && (item.title?.length || 0) >= 15) {
                newItems.push({
                  title: item.title || "",
                  summary: item.contentSnippet || item.content || item.description || "",
                  link, category: feed.category, source: feed.name,
                  imageUrl: extractImage(item as Record<string, any>),
                });
              }
            }
          } catch { /* ignorar */ }
        }
      }

      for (const item of newItems.slice(0, maxPerRun)) {
        const rewritten = await rewriteWithAI(item.title, item.summary, item.source);
        if (!rewritten || rewritten._error) {
          errors.push(`AI fail: ${item.title.slice(0, 40)}`);
          continue;
        }

        let imageUrl = "";
        if (item.imageUrl && (await isImageValid(item.imageUrl))) imageUrl = item.imageUrl;
        if (!imageUrl) imageUrl = getCategoryImage(item.category);

        const slug = slugify(rewritten.title) + "-" + Date.now().toString(36);
        const { error } = await supabase.from("articles").insert([{
          slug,
          title: rewritten.title,
          summary: rewritten.summary,
          content: rewritten.content,
          category: item.category,
          image_url: imageUrl,
          source: "MinutoGlobal",
          source_url: item.link,
          read_time: estimateReadTime(rewritten.content),
          is_published: true,
          published_at: new Date().toISOString(),
        }]);

        if (!error) {
          processed++;
          results.push(rewritten.title.slice(0, 50));
        } else {
          errors.push(`DB fail: ${error.message}`);
        }
      }
    }

    // === 3. Cola Facebook — solo publica en slots ===
    let fbPublished: string | null = null;
    let fbSkipReason: string | null = null;

    if (FB_PAGE_ID && FB_PAGE_TOKEN) {
      const horaCO = getColombiaHour();
      const fbPostsToday = existing?.filter(
        (r) => r.fb_post_id && new Date(r.created_at) >= colombiaDayStart
      ).length || 0;

      // Cuántos DEBERÍAN haberse publicado ya según la hora
      let targetByNow = 0;
      for (const slot of FB_POST_SLOTS) if (horaCO >= slot) targetByNow++;
      targetByNow = Math.min(targetByNow, MAX_FB_POSTS_PER_DAY);

      if (fbPostsToday >= targetByNow) {
        fbSkipReason = `No toca slot (hora CO ${horaCO}h, publicados ${fbPostsToday}/${targetByNow})`;
      } else {
        const { data: pending } = await supabase
          .from("articles")
          .select("*")
          .is("fb_post_id", null)
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(1);

        const article = pending?.[0];
        if (!article) {
          fbSkipReason = "No hay artículos pendientes";
        } else {
          const slotIndex = fbPostsToday; // 0, 1, 2 → rota estilos
          const postId = await postToFacebook(article, slotIndex);
          if (postId) {
            await supabase.from("articles").update({ fb_post_id: postId }).eq("slug", article.slug);
            fbPublished = `${article.title.slice(0, 50)} (slot ${fbPostsToday + 1}/${MAX_FB_POSTS_PER_DAY})`;
          } else {
            fbSkipReason = "Error al publicar en FB";
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      processed,
      usedFallback,
      publishedToday: publishedToday + processed,
      remainingBudget: remainingBudget - processed,
      fbPublished,
      fbSkipReason,
      horaColombia: getColombiaHour(),
      articles: results,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
