import Link from "next/link";
import NewsImage from "./NewsImage";

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  readTime: string;
}

interface NewsCardProps {
  article: Article;
  featured?: boolean;
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const categoryColors: Record<string, string> = {
    colombia: "bg-[#f44336]",
    mundo: "bg-blue-600",
    economia: "bg-green-600",
    tecnologia: "bg-purple-600",
    deportes: "bg-orange-500",
    opinion: "bg-yellow-600",
  };

  const badgeColor =
    categoryColors[article.category.toLowerCase()] || "bg-[#f44336]";

  if (featured) {
    return (
      <Link href={`/noticia/${article.slug}`} className="block group">
        <article className="relative rounded-lg overflow-hidden bg-[#111d32] border border-[#1e3a5f] hover:border-[#f44336]/50 transition-all">
          <div className="aspect-[16/9] bg-[#162847] relative overflow-hidden">
            <NewsImage
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
            <span
              className={`absolute top-4 left-4 ${badgeColor} text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider`}
            >
              {article.category}
            </span>
          </div>
          <div className="p-5">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-[#f44336] transition-colors line-clamp-3">
              {article.title}
            </h2>
            <p className="text-[#94a3b8] text-sm mt-2 line-clamp-2">
              {article.summary}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-[#64748b]">
              <span>{article.source}</span>
              <span>•</span>
              <span>{article.publishedAt}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/noticia/${article.slug}`} className="block group">
      <article className="flex gap-4 rounded-lg bg-[#111d32] border border-[#1e3a5f] hover:border-[#f44336]/50 transition-all p-3">
        <div className="w-28 h-20 sm:w-36 sm:h-24 flex-shrink-0 rounded overflow-hidden bg-[#162847]">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <span
              className={`${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider`}
            >
              {article.category}
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-white mt-1 leading-snug group-hover:text-[#f44336] transition-colors line-clamp-2">
              {article.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#64748b]">
            <span>{article.source}</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
