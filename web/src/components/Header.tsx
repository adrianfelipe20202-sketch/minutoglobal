"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const categories = [
  { name: "Colombia", key: "colombia" },
  { name: "Mundo", key: "mundo" },
  { name: "Economía", key: "economia" },
  { name: "Tecnología", key: "tecnologia" },
  { name: "Deportes", key: "deportes" },
];

function HeaderNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("cat") || "";

  return (
    <header className="sticky top-0 z-50 bg-[#0a1628]/95 backdrop-blur-md border-b border-[#1e3a5f]">
      {/* Barra superior */}
      <div className="bg-[#f44336] text-white text-xs py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-semibold tracking-wider uppercase">
              EN VIVO 24/7
            </span>
          </div>
          <div className="hidden sm:block text-white/80">
            La noticia satisfactoria al alcance de tus manos
          </div>
        </div>
      </div>

      {/* Logo y nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide leading-none">
              MINUTO<span className="text-[#f44336]">.</span>GLOBAL
            </h1>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-2 text-sm rounded transition-colors uppercase tracking-wider font-medium ${
              !activeCat
                ? "text-white bg-[#f44336]"
                : "text-[#94a3b8] hover:text-white hover:bg-[#162847]"
            }`}
          >
            Inicio
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/?cat=${cat.key}`}
              className={`px-3 py-2 text-sm rounded transition-colors uppercase tracking-wider font-medium ${
                activeCat === cat.key
                  ? "text-white bg-[#f44336]"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#162847]"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Menú"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-[#1e3a5f] bg-[#0d1f3c]">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`block px-4 py-3 text-sm uppercase tracking-wider font-medium border-b border-[#1e3a5f]/50 ${
              !activeCat ? "text-white bg-[#f44336]/20" : "text-[#94a3b8] hover:text-white hover:bg-[#162847]"
            }`}
          >
            Inicio
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/?cat=${cat.key}`}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 text-sm uppercase tracking-wider font-medium border-b border-[#1e3a5f]/50 ${
                activeCat === cat.key ? "text-white bg-[#f44336]/20" : "text-[#94a3b8] hover:text-white hover:bg-[#162847]"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export default function Header() {
  return (
    <Suspense>
      <HeaderNav />
    </Suspense>
  );
}
