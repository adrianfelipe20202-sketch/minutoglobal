import { supabase, DBArticle } from "./supabase";

export async function getArticles(
  category?: string,
  limit = 20
): Promise<DBArticle[]> {
  let query = supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    return [];
  }
  return data || [];
}

export async function getArticleBySlug(
  slug: string
): Promise<DBArticle | null> {
  // Sanitizar slug: solo letras, números, guiones
  const safeSlug = slug.replace(/[^a-z0-9\-_]/gi, "").slice(0, 200);
  if (!safeSlug) return null;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", safeSlug)
    .eq("is_published", true)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function getRelatedArticles(
  currentId: string,
  category: string,
  limit = 3
): Promise<DBArticle[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .eq("category", category)
    .neq("id", currentId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  return date.toLocaleDateString("es-CO");
}

export async function getTrendingTopics(limit = 8): Promise<string[]> {
  // Obtener los artículos más recientes para extraer temas
  const { data, error } = await supabase
    .from("articles")
    .select("title, category")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) return [];

  // Extraer palabras clave relevantes de los títulos
  const stopWords = new Set([
    "el", "la", "los", "las", "de", "del", "en", "un", "una", "que", "por",
    "con", "para", "se", "su", "al", "es", "y", "a", "no", "más", "como",
    "ha", "han", "fue", "ser", "son", "está", "este", "esta", "tras", "ante",
    "sobre", "entre", "sin", "hay", "ya", "muy", "o", "pero", "le", "lo",
    "sus", "nos", "qué", "cómo", "nuevo", "nueva", "nuevos", "nuevas",
  ]);

  // Contar frecuencia de palabras significativas (3+ chars)
  const wordCount: Record<string, number> = {};
  for (const row of data) {
    const words = row.title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length >= 4 && !stopWords.has(w));
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }

  // Tomar las palabras más frecuentes y armar temas con el título original
  const trending = data
    .map((row) => {
      // Acortar título a algo conciso
      const short = row.title.length > 50 ? row.title.slice(0, 47) + "..." : row.title;
      return short;
    })
    .filter((title, i, arr) => arr.indexOf(title) === i) // únicos
    .slice(0, limit);

  return trending;
}

export function dbToArticle(db: DBArticle) {
  return {
    id: db.id,
    slug: db.slug,
    title: db.title,
    summary: db.summary,
    category: db.category,
    imageUrl: db.image_url,
    source: db.source,
    publishedAt: formatTimeAgo(db.published_at),
    readTime: db.read_time,
  };
}
