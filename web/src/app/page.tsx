import NewsCard from "@/components/NewsCard";
import BreakingTicker from "@/components/BreakingTicker";
import Sidebar from "@/components/Sidebar";
import AdBanner from "@/components/AdBanner";
import { getArticles, dbToArticle } from "@/lib/articles";
import { mockArticles } from "@/lib/mock-data";

export const revalidate = 30; // Revalidar cada 30 segundos

// Mapeo de query param a categoría en BD
const CAT_MAP: Record<string, string> = {
  colombia: "Colombia",
  mundo: "Mundo",
  economia: "Economía",
  tecnologia: "Tecnología",
  deportes: "Deportes",
  opinion: "Opinión",
};

interface HomeProps {
  searchParams: Promise<{ cat?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { cat } = await searchParams;
  // Solo aceptar categorías válidas — previene inyección
  const category = (cat && CAT_MAP[cat.toLowerCase()]) || undefined;

  const dbArticles = await getArticles(category);

  // Si hay artículos en Supabase, usar esos. Si no, mostrar mock
  const articles =
    dbArticles.length > 0
      ? dbArticles.map(dbToArticle)
      : category
        ? mockArticles.filter((a) => a.category === category)
        : mockArticles;

  const featured = articles[0];
  const rest = articles.slice(1);
  const sectionTitle = category || "Última Hora";

  return (
    <>
      <BreakingTicker />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Noticia destacada */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 bg-[#f44336] rounded-full" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  {sectionTitle}
                </h2>
              </div>
              {featured && <NewsCard article={featured} featured />}
            </section>

            {/* Ad entre secciones */}
            <AdBanner position="inline" />

            {/* Más noticias */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 bg-[#f44336] rounded-full" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  Más Noticias
                </h2>
              </div>
              <div className="space-y-4">
                {rest.map((article, index) => (
                  <div key={article.id}>
                    <NewsCard article={article} />
                    {(index + 1) % 3 === 0 && index < rest.length - 1 && (
                      <div className="mt-4">
                        <AdBanner position="inline" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <AdBanner position="bottom" />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
