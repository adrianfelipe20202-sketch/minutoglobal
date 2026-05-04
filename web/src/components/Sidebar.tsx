import AdBanner from "./AdBanner";
import { getTrendingTopics } from "@/lib/articles";

export default async function Sidebar() {
  const trending = await getTrendingTopics(8);

  return (
    <aside className="space-y-6">
      {/* Ad */}
      <AdBanner position="sidebar" />

      {/* Tendencias */}
      <div className="bg-[#111d32] border border-[#1e3a5f] rounded-lg p-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#f44336] rounded-full" />
          Tendencias
        </h3>
        <ul className="space-y-3">
          {trending.length > 0 ? (
            trending.map((topic, i) => (
              <li key={i} className="flex items-start gap-3 group cursor-pointer">
                <span className="text-lg font-black text-[#1e3a5f] group-hover:text-[#f44336] transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-[#94a3b8] group-hover:text-white transition-colors leading-tight">
                  {topic}
                </span>
              </li>
            ))
          ) : (
            <li className="text-sm text-[#64748b]">Cargando tendencias...</li>
          )}
        </ul>
      </div>

      {/* CTA Facebook */}
      <a
        href="https://www.facebook.com/profile.php?id=1082086091650883"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-5 hover:from-blue-500 hover:to-blue-700 transition-all group"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm">MinutoGlobal.co</span>
        </div>
        <p className="text-white/90 text-sm leading-snug mb-3">
          No te pierdas ninguna noticia. Sigue nuestra pagina en Facebook y enterate primero de todo lo que pasa.
        </p>
        <div className="bg-white/20 rounded-md py-2 px-4 text-center group-hover:bg-white/30 transition-colors">
          <span className="text-white font-bold text-sm">Seguir en Facebook</span>
        </div>
      </a>

      {/* Redes */}
      <div className="bg-[#111d32] border border-[#1e3a5f] rounded-lg p-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#f44336] rounded-full" />
          Redes Sociales
        </h3>
        <div className="space-y-2">
          <a
            href="https://twitter.com/MinutoGlobal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 rounded hover:bg-[#162847] transition-colors"
          >
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white text-sm font-bold">
              𝕏
            </div>
            <div>
              <p className="text-sm text-white font-medium">X (Twitter)</p>
              <p className="text-xs text-[#64748b]">@MinutoGlobal</p>
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
}
