import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#060e1a] border-t border-[#1e3a5f] mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌐</span>
              <span className="text-xl font-black text-white tracking-wide">
                MINUTO<span className="text-[#f44336]">.</span>GLOBAL
              </span>
            </div>
            <p className="text-[#64748b] text-sm leading-relaxed max-w-md">
              MinutoGlobal es un medio digital de noticias nacido en Colombia
              con visión global. Información en tiempo real, sin rodeos y sin
              amarillismo.
            </p>
          </div>

          {/* Secciones */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Secciones
            </h3>
            <ul className="space-y-2">
              {["Colombia", "Mundo", "Economía", "Tecnología", "Deportes"].map(
                (s) => (
                  <li key={s}>
                    <Link
                      href={`/?cat=${s.toLowerCase()}`}
                      className="text-sm text-[#64748b] hover:text-[#f44336] transition-colors"
                    >
                      {s}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/quienes-somos"
                  className="text-sm text-[#64748b] hover:text-[#f44336] transition-colors"
                >
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-privacidad"
                  className="text-sm text-[#64748b] hover:text-[#f44336] transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-[#64748b] hover:text-[#f44336] transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1e3a5f] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#64748b]">
            © {new Date().getFullYear()} MinutoGlobal. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=1082086091650883"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#64748b] hover:text-[#f44336] transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/MinutoGlobal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#64748b] hover:text-[#f44336] transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
