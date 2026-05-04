import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiénes Somos — MinutoGlobal",
  description: "Conoce a MinutoGlobal, tu portal de noticias de Colombia y el mundo en tiempo real.",
};

export default function QuienesSomos() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Quiénes Somos</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#94a3b8]">
        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">Nuestra Misión</h2>
          <p>
            MinutoGlobal es un medio digital de noticias nacido en Colombia con visión global. Nuestra
            misión es llevar información veraz, oportuna y sin amarillismo a todos los rincones de
            habla hispana.
          </p>
          <p>
            Creemos en el periodismo directo y sin rodeos. Cada noticia que publicamos busca informar
            con claridad, respetando siempre la inteligencia de nuestros lectores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">Qué Hacemos</h2>
          <p>
            Monitoreamos las principales fuentes de información nacionales e internacionales las 24
            horas del día, los 7 días de la semana, para traerte lo más relevante del acontecer
            noticioso en las siguientes categorías:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-white">Colombia:</strong> Política, sociedad y acontecimientos nacionales.</li>
            <li><strong className="text-white">Mundo:</strong> Noticias internacionales que impactan la región.</li>
            <li><strong className="text-white">Economía:</strong> Mercados, finanzas y desarrollo económico.</li>
            <li><strong className="text-white">Tecnología:</strong> Innovación, ciencia y tendencias digitales.</li>
            <li><strong className="text-white">Deportes:</strong> Fútbol colombiano, ligas internacionales y más.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">Nuestros Valores</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white">Veracidad:</strong> Información contrastada y verificada.</li>
            <li><strong className="text-white">Oportunidad:</strong> Noticias en tiempo real, cuando importan.</li>
            <li><strong className="text-white">Independencia:</strong> Sin sesgos políticos ni empresariales.</li>
            <li><strong className="text-white">Accesibilidad:</strong> Contenido gratuito para todos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">Contacto</h2>
          <p>
            Valoramos la opinión de nuestros lectores. Si tienes sugerencias, comentarios o quieres
            reportar un error, visita nuestra{" "}
            <a href="/contacto" className="text-[#f44336] hover:underline">página de contacto</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
