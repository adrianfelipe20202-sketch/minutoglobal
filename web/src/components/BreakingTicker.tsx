"use client";

import { useEffect, useState } from "react";

const breakingNews = [
  "Dólar hoy en Colombia: cotización actualizada en tiempo real",
  "Gobierno presenta nueva reforma tributaria ante el Congreso",
  "Selección Colombia convocados para eliminatorias 2026",
  "ONU alerta sobre cambio climático en cumbre extraordinaria",
  "Tecnología: OpenAI anuncia nuevo modelo de inteligencia artificial",
];

export default function BreakingTicker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % breakingNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0d1f3c] border-b border-[#1e3a5f]">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="flex-shrink-0 bg-[#f44336] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest animate-pulse">
          Última Hora
        </span>
        <p className="text-sm text-[#94a3b8] truncate">
          {breakingNews[current]}
        </p>
      </div>
    </div>
  );
}
