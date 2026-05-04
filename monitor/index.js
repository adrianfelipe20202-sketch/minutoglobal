require("dotenv").config();
const RSSParser = require("rss-parser");
const Groq = require("groq-sdk");
const { createClient } = require("@supabase/supabase-js");

// --- Configuración ---
const parser = new RSSParser();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const SITE_URL = process.env.SITE_URL || "https://minutoglobal.vercel.app";

// Frecuencia de escaneo RSS (antes: 60s — ahora humano, evita señal de bot)
const SCAN_INTERVAL_MS = 20 * 60 * 1000; // 20 min
const ITEMS_PER_FEED = 2; // antes 5 — calidad sobre cantidad
const MAX_FB_POSTS_PER_DAY = 3;

// Horarios de publicación en FB (hora Colombia, UTC-5)
// Slot 1: 09:00, Slot 2: 14:00, Slot 3: 20:00
const FB_POST_SLOTS = [9, 14, 20];

// Feeds RSS
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

const processedUrls = new Set();
let isScanning = false;
let isPosting = false;

// --- Utilidades ---

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function estimateReadTime(text) {
  const words = text.split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 200));
  return `${minutes} min lectura`;
}

// Hora actual en Colombia (UTC-5, sin DST)
function getColombiaHour() {
  return (new Date().getUTCHours() - 5 + 24) % 24;
}

// Inicio del día colombiano en UTC (00:00 Colombia = 05:00 UTC)
function startOfColombianDayUTC() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0, 0));
  if (now < d) d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

// --- IA: reescritura del artículo web ---

async function rewriteWithAI(title, summary, source) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Eres un periodista profesional de MinutoGlobal. Reescribes noticias con palabras propias. Tono serio, profesional, sin amarillismo. Español colombiano neutro.`,
        },
        {
          role: "user",
          content: `Reescribe esta noticia con tus propias palabras.

Título original: ${title}
Resumen: ${summary}
Fuente: ${source}

Usa EXACTAMENTE este formato (respeta los separadores ===):

TITULO===
Un título reescrito atractivo pero serio
RESUMEN===
Un resumen de 1-2 oraciones
CONTENIDO===
Párrafo 1 del artículo reescrito.

Párrafo 2 del artículo reescrito.

Párrafo 3 del artículo reescrito.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Respuesta vacía de Groq");

    const titleMatch = text.match(/TITULO\s*===\s*([\s\S]*?)\s*RESUMEN\s*===/);
    const summaryMatch = text.match(/RESUMEN\s*===\s*([\s\S]*?)\s*CONTENIDO\s*===/);
    const contentMatch = text.match(/CONTENIDO\s*===\s*([\s\S]*)/);

    if (titleMatch && summaryMatch && contentMatch) {
      return {
        title: titleMatch[1].trim(),
        summary: summaryMatch[1].trim(),
        content: contentMatch[1].trim(),
      };
    }

    const cleanText = text.replace(/={2,}/g, "").replace(/TITULO|RESUMEN|CONTENIDO/gi, "");
    const lines = cleanText.split("\n").filter((l) => l.trim().length > 10);
    if (lines.length >= 3) {
      const fallbackTitle = lines[0].replace(/^[#*\-\d.:\s]+/, "").replace(/["*]/g, "").trim();
      const fallbackSummary = lines[1].replace(/^[#*\-\d.:\s]+/, "").replace(/["*]/g, "").trim();
      const fallbackContent = lines.slice(2).join("\n\n").replace(/["*]/g, "").trim();
      if (fallbackTitle.length > 10 && fallbackContent.length > 50) {
        return {
          title: fallbackTitle.slice(0, 200),
          summary: fallbackSummary.slice(0, 300),
          content: fallbackContent,
        };
      }
    }
    throw new Error("Formato de respuesta no válido");
  } catch (err) {
    console.error("  ❌ Error IA (artículo):", err.message);
    return null;
  }
}

// --- IA: copy para Facebook (4 estilos rotando, siempre con pregunta) ---

const FB_COPY_STYLES = ["pregunta", "dato", "cita", "polemica"];
let fbStyleCounter = 0;

const CATEGORY_HASHTAGS = {
  Colombia: ["#Colombia", "#Noticias", "#Bogotá"],
  Mundo: ["#Mundo", "#Internacional", "#NoticiasDelMundo"],
  "Economía": ["#Economía", "#Finanzas", "#Negocios"],
  "Tecnología": ["#Tecnología", "#IA", "#Innovación"],
  Deportes: ["#Deportes", "#Fútbol", "#Colombia"],
};

const CATEGORY_EMOJI = {
  Colombia: "🇨🇴",
  Mundo: "🌍",
  "Economía": "💰",
  "Tecnología": "🚀",
  Deportes: "⚽",
};

async function generateFacebookCopy(title, summary, content, category) {
  const style = FB_COPY_STYLES[fbStyleCounter % FB_COPY_STYLES.length];
  fbStyleCounter++;

  const styleInstructions = {
    pregunta: "Empieza planteando la noticia de forma intrigante y termina con una pregunta abierta directa al lector.",
    dato: "Empieza con un dato o cifra impactante del artículo (formato '💡 Dato clave:' o similar), luego contexto breve, termina con pregunta al lector.",
    cita: "Comienza con una frase entrecomillada extraída o inspirada en el contenido, luego 1 línea de contexto, termina con pregunta.",
    polemica: "Formula la noticia como afirmación fuerte que invite al debate (sin mentir ni amarillismo), termina con '¿Estás de acuerdo?' o similar.",
  };

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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

    if (copy.length < 30) throw new Error("Copy demasiado corto");

    const emoji = CATEGORY_EMOJI[category] || "📰";
    const hashtags = (CATEGORY_HASHTAGS[category] || []).slice(0, 3).join(" ");
    return `${emoji} ${copy}\n\n${hashtags}`;
  } catch (err) {
    console.error("  ❌ Error IA (FB copy):", err.message);
    // Fallback mínimo pero con pregunta
    const emoji = CATEGORY_EMOJI[category] || "📰";
    const hashtags = (CATEGORY_HASHTAGS[category] || []).slice(0, 3).join(" ");
    return `${emoji} ${title}\n\n${summary}\n\n¿Qué opinas al respecto? 👇\n\n${hashtags}`;
  }
}

// --- Facebook: publicar + link en primer comentario ---

async function postToFacebook(article) {
  if (!FB_PAGE_ID || !FB_PAGE_TOKEN) return null;

  const articleUrl = `${SITE_URL}/noticia/${article.slug}`;
  const message = await generateFacebookCopy(
    article.title,
    article.summary,
    article.content,
    article.category
  );

  let endpoint, body;
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
    if (!postId) {
      console.error("  ⚠️ FB Error:", data.error?.message || "desconocido");
      return null;
    }
    console.log(`  📘 Post publicado: ${postId}`);

    // Link como primer comentario — FB no penaliza posts con enlaces externos si van en comentario
    await postFirstComment(postId, `🔗 Lee la noticia completa aquí:\n${articleUrl}`);
    return postId;
  } catch (err) {
    console.error("  ⚠️ FB Error:", err.message);
    return null;
  }
}

async function postFirstComment(postId, message) {
  try {
    const endpoint = `https://graph.facebook.com/v21.0/${postId}/comments`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: FB_PAGE_TOKEN }),
    });
    const data = await response.json();
    if (data.id) console.log(`  💬 Link en primer comentario: ${data.id}`);
    else console.error("  ⚠️ Error comentario:", data.error?.message);
  } catch (err) {
    console.error("  ⚠️ Error comentario:", err.message);
  }
}

// --- Supabase ---

async function saveToSupabase(article) {
  const { data, error } = await supabase.from("articles").insert([article]).select();
  if (error) {
    if (error.code === "23505") return null;
    console.error("  ❌ Error Supabase:", error.message);
    return null;
  }
  return data?.[0];
}

async function loadProcessedUrls() {
  const { data } = await supabase
    .from("articles")
    .select("source_url")
    .order("created_at", { ascending: false })
    .limit(500);
  if (data) data.forEach((row) => row.source_url && processedUrls.add(row.source_url));
  console.log(`📋 ${processedUrls.size} URLs ya procesadas`);
}

async function ensureSchema() {
  const { error } = await supabase.from("articles").select("fb_post_id").limit(1);
  if (error && /fb_post_id/i.test(error.message || "")) {
    console.error("\n⚠️ MIGRACIÓN REQUERIDA EN SUPABASE");
    console.error("   Ejecuta este SQL en el SQL Editor:");
    console.error("   ALTER TABLE articles ADD COLUMN IF NOT EXISTS fb_post_id TEXT;\n");
    process.exit(1);
  }
}

async function countFbPostsToday() {
  const start = startOfColombianDayUTC().toISOString();
  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .not("fb_post_id", "is", null)
    .gte("published_at", start);
  return count || 0;
}

async function getNextPendingArticle() {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .is("fb_post_id", null)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1);
  return data?.[0] || null;
}

async function markArticleAsFbPosted(slug, postId) {
  await supabase.from("articles").update({ fb_post_id: postId }).eq("slug", slug);
}

// --- Imágenes ---

const CATEGORY_IMAGES = {
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

function getCategoryImage(category) {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Mundo"];
  return images[Math.floor(Math.random() * images.length)];
}

async function isImageValid(url) {
  if (!url || !url.startsWith("http")) return false;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    const contentType = res.headers.get("content-type") || "";
    return res.ok && contentType.startsWith("image");
  } catch {
    return false;
  }
}

function extractImage(item) {
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

// --- RSS ---

async function fetchFeed(feed) {
  try {
    const result = await parser.parseURL(feed.url);
    return result.items.slice(0, ITEMS_PER_FEED).map((item) => ({
      title: item.title || "",
      summary: item.contentSnippet || item.content || item.description || "",
      link: item.link || "",
      pubDate: item.pubDate || new Date().toISOString(),
      category: feed.category,
      source: feed.name,
      imageUrl: extractImage(item),
    }));
  } catch {
    return [];
  }
}

async function processItem(item) {
  if (processedUrls.has(item.link)) return;
  if (!item.title || item.title.length < 15) return;

  console.log(`\n📰 Nueva: ${item.title.slice(0, 60)}...`);
  console.log(`   ${item.source} | ${item.category}`);

  const rewritten = await rewriteWithAI(item.title, item.summary, item.source);
  if (!rewritten) {
    processedUrls.add(item.link);
    return;
  }

  let imageUrl = "";
  if (item.imageUrl && (await isImageValid(item.imageUrl))) {
    imageUrl = item.imageUrl;
    console.log("  🖼️ Imagen RSS válida");
  } else {
    imageUrl = getCategoryImage(item.category);
    console.log(`  🖼️ Fallback categoría (aleatorio): ${item.category}`);
  }

  const article = {
    slug: slugify(rewritten.title) + "-" + Date.now().toString(36),
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
  };

  const saved = await saveToSupabase(article);
  if (saved) {
    console.log(`  ✅ Guardado en web: ${rewritten.title.slice(0, 50)}...`);
    processedUrls.add(item.link);
  }
}

// --- Ciclos ---

async function scanCycle() {
  if (isScanning) return;
  isScanning = true;
  const ts = new Date().toLocaleTimeString("es-CO");
  console.log(`\n⏰ [${ts}] Escaneando RSS...`);

  for (const feed of RSS_FEEDS) {
    const items = await fetchFeed(feed);
    for (const item of items) {
      if (!processedUrls.has(item.link) && item.title.length >= 15) {
        await processItem(item);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
  isScanning = false;
}

// Publica en FB solo si toca slot horario y no se ha superado el cupo diario
async function fbQueueCycle() {
  if (isPosting) return;
  if (!FB_PAGE_ID || !FB_PAGE_TOKEN) return;
  isPosting = true;

  try {
    const hour = getColombiaHour();
    const postsToday = await countFbPostsToday();

    // Determinar cuántos posts DEBERÍAN haberse publicado hasta esta hora
    let targetPosts = 0;
    for (const slot of FB_POST_SLOTS) {
      if (hour >= slot) targetPosts++;
    }
    targetPosts = Math.min(targetPosts, MAX_FB_POSTS_PER_DAY);

    if (postsToday >= targetPosts) {
      isPosting = false;
      return;
    }

    const article = await getNextPendingArticle();
    if (!article) {
      isPosting = false;
      return;
    }

    console.log(`\n📘 [FB Queue] Hora CO: ${hour}:00 · Publicados hoy: ${postsToday}/${targetPosts}`);
    console.log(`   Publicando: ${article.title.slice(0, 60)}...`);
    const postId = await postToFacebook(article);
    if (postId) await markArticleAsFbPosted(article.slug, postId);
  } catch (err) {
    console.error("  ❌ Error FB queue:", err.message);
  } finally {
    isPosting = false;
  }
}

// --- Inicio ---

async function main() {
  console.log("🌐 ══════════════════════════════════════");
  console.log("   MINUTO GLOBAL — Monitor v2");
  console.log("   Scan: cada 20 min · FB: 3/día (9/14/20 CO)");
  console.log("🌐 ══════════════════════════════════════\n");

  await ensureSchema();
  await loadProcessedUrls();

  // Ciclos
  await scanCycle();
  await fbQueueCycle();

  setInterval(scanCycle, SCAN_INTERVAL_MS);        // RSS cada 20 min
  setInterval(fbQueueCycle, 5 * 60 * 1000);        // Check cola FB cada 5 min

  console.log("\n🔄 Monitor activo.");
  console.log("   RSS → cada 20 min");
  console.log("   FB → slots 09:00 / 14:00 / 20:00 Colombia\n");
}

main().catch(console.error);
