import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dominios permitidos para cargar imágenes externas
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "imagenes2.eltiempo.com" },
      { protocol: "https", hostname: "i.blogs.es" },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevenir clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevenir MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Protección XSS
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Referrer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permisos del navegador
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // Forzar HTTPS
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://pagead2.googlesyndication.com",
              "frame-src https://googleads.g.doubleclick.net https://www.google.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Bloquear rutas sensibles / ataques comunes
  async redirects() {
    return [
      // Bloquear intentos de acceso a archivos sensibles
      { source: "/.env", destination: "/", permanent: false },
      { source: "/.env.local", destination: "/", permanent: false },
      { source: "/.git/:path*", destination: "/", permanent: false },
      // Bloquear ataques de WordPress/PHP
      { source: "/wp-admin", destination: "/", permanent: false },
      { source: "/wp-admin/:path*", destination: "/", permanent: false },
      { source: "/wp-login.php", destination: "/", permanent: false },
      { source: "/xmlrpc.php", destination: "/", permanent: false },
      { source: "/phpmyadmin", destination: "/", permanent: false },
      { source: "/phpmyadmin/:path*", destination: "/", permanent: false },
      { source: "/admin", destination: "/", permanent: false },
      { source: "/.htaccess", destination: "/", permanent: false },
      { source: "/server-status", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
