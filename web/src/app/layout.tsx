import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MinutoGlobal — Noticias de Colombia y el Mundo en Tiempo Real",
  description:
    "La noticia satisfactoria al alcance de tus manos. Noticias de Colombia y el mundo en tiempo real, 24/7.",
  keywords: [
    "noticias colombia",
    "noticias hoy",
    "noticias en tiempo real",
    "minuto global",
    "noticias mundo",
    "última hora",
  ],
  openGraph: {
    title: "MinutoGlobal — Noticias en Tiempo Real",
    description:
      "La noticia satisfactoria al alcance de tus manos. Colombia y el mundo 24/7.",
    siteName: "MinutoGlobal",
    type: "website",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinutoGlobal",
    description: "Noticias de Colombia y el Mundo en Tiempo Real",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9237054676634136" crossOrigin="anonymous"></script>
      </head>
      <body className="min-h-screen flex flex-col bg-[#0a1628]">
        <Header />
        <AdBanner position="top" />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
