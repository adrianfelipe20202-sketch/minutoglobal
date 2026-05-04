require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const Groq = require("groq-sdk");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateTitle(summary, content) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres un editor de noticias. Genera un título periodístico conciso y atractivo basado en el resumen y contenido. Solo responde con el título, nada más.",
        },
        {
          role: "user",
          content: `Resumen: ${summary.slice(0, 300)}\n\nContenido: ${content.slice(0, 500)}\n\nGenera un título periodístico:`,
        },
      ],
      temperature: 0.5,
      max_tokens: 100,
    });
    let title = response.choices[0]?.message?.content?.trim();
    // Limpiar comillas y caracteres extra
    title = title.replace(/^["']+|["']+$/g, "").trim();
    return title || null;
  } catch (err) {
    console.error("  Error Groq:", err.message);
    return null;
  }
}

async function restore() {
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, summary, content")
    .eq("title", "HACKED")
    .order("published_at", { ascending: false });

  console.log(`Restaurando ${articles.length} títulos...\n`);

  let fixed = 0;
  for (const article of articles) {
    // Generar título con IA desde el resumen y contenido
    const newTitle = await generateTitle(article.summary, article.content);

    if (newTitle && newTitle.length > 5) {
      const { error } = await supabase
        .from("articles")
        .update({ title: newTitle })
        .eq("id", article.id);

      if (!error) {
        fixed++;
        console.log(`✅ ${fixed}/${articles.length} — ${newTitle.slice(0, 60)}...`);
      }
    } else {
      // Fallback: generar título desde el slug
      const titleFromSlug = article.slug
        .replace(/-mn[a-z0-9]+$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      await supabase.from("articles").update({ title: titleFromSlug }).eq("id", article.id);
      fixed++;
      console.log(`🔄 ${fixed}/${articles.length} — (desde slug) ${titleFromSlug.slice(0, 60)}...`);
    }

    // Pausa para no saturar Groq
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n✅ ${fixed} títulos restaurados`);
}

restore();
