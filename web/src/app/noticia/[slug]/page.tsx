import { getArticleBySlug, getRelatedArticles, dbToArticle, formatTimeAgo } from "@/lib/articles";
import { mockArticles } from "@/lib/mock-data";
import Sidebar from "@/components/Sidebar";
import AdBanner from "@/components/AdBanner";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;

  // Intentar Supabase primero, fallback a mock
  const dbArticle = await getArticleBySlug(slug);

  if (dbArticle) {
    const dbRelated = await getRelatedArticles(dbArticle.id, dbArticle.category);
    const related = dbRelated.map(dbToArticle);

    return (
      <ArticleView
        title={dbArticle.title}
        summary={dbArticle.summary}
        content={dbArticle.content}
        category={dbArticle.category}
        imageUrl={dbArticle.image_url}
        source={dbArticle.source}
        publishedAt={formatTimeAgo(dbArticle.published_at)}
        readTime={dbArticle.read_time}
        related={related}
      />
    );
  }

  // Fallback a mock
  const mockArticle = mockArticles.find((a) => a.slug === slug);
  if (!mockArticle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Noticia no encontrada</h1>
        <Link href="/" className="text-[#f44336] hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const related = mockArticles.filter((a) => a.id !== mockArticle.id).slice(0, 3);

  return (
    <ArticleView
      title={mockArticle.title}
      summary={mockArticle.summary}
      content=""
      category={mockArticle.category}
      imageUrl={mockArticle.imageUrl}
      source={mockArticle.source}
      publishedAt={mockArticle.publishedAt}
      readTime={mockArticle.readTime}
      related={related}
    />
  );
}

function ArticleView({
  title, summary, content, category, imageUrl, source, publishedAt, readTime, related,
}: {
  title: string; summary: string; content: string; category: string;
  imageUrl: string; source: string; publishedAt: string; readTime: string;
  related: { id: string; slug: string; title: string; summary: string; category: string; imageUrl: string; source: string; publishedAt: string; readTime: string }[];
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="lg:col-span-2">
          <nav className="flex items-center gap-2 text-sm text-[#64748b] mb-4">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-[#f44336]">{category}</span>
          </nav>

          <span className="inline-block bg-[#f44336] text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-3">
            {category}
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
            {title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-[#64748b] mb-6 pb-4 border-b border-[#1e3a5f]">
            <span className="font-medium text-[#94a3b8]">{source}</span>
            <span>•</span>
            <span>{publishedAt}</span>
            <span>•</span>
            <span>{readTime}</span>
          </div>

          <div className="aspect-video rounded-lg overflow-hidden bg-[#162847] mb-6">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>

          <AdBanner position="inline" />

          <div className="prose prose-invert max-w-none mt-6 space-y-4">
            <p className="text-lg text-[#94a3b8] font-medium leading-relaxed">{summary}</p>
            {content ? (
              content.split("\n\n").map((p, i) => (
                <p key={i} className="text-[#94a3b8] leading-relaxed">{p}</p>
              ))
            ) : (
              <p className="text-[#94a3b8] leading-relaxed">
                MinutoGlobal trabaja con fuentes verificadas y reconocidas para ofrecer información confiable.
              </p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[#1e3a5f]">
            <p className="text-sm text-[#64748b] mb-3 uppercase tracking-wider font-medium">Compartir</p>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
              <button className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors border border-zinc-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
              </button>
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                WhatsApp
              </button>
            </div>
          </div>

          <AdBanner position="bottom" />

          <section className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-[#f44336] rounded-full" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Noticias Relacionadas</h2>
            </div>
            <div className="space-y-4">
              {related.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        </article>

        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
