import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — MinutoGlobal",
  description: "Política de privacidad y tratamiento de datos personales de MinutoGlobal.",
};

export default function PoliticaPrivacidad() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Política de Privacidad</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#94a3b8]">
        <p className="text-sm text-[#64748b]">Última actualización: abril de 2026</p>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">1. Información General</h2>
          <p>
            MinutoGlobal (en adelante, "el Sitio") es un portal de noticias digital operado desde Colombia.
            Nos comprometemos a proteger la privacidad de nuestros usuarios y a cumplir con la legislación
            vigente en materia de protección de datos personales, incluyendo la Ley 1581 de 2012 y el
            Decreto 1377 de 2013 de Colombia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">2. Datos que Recopilamos</h2>
          <p>El Sitio puede recopilar los siguientes tipos de información:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-white">Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas, tiempo de permanencia y datos de referencia. Esta información se recopila de forma automática mediante cookies y tecnologías similares.</li>
            <li><strong className="text-white">Cookies de terceros:</strong> utilizamos servicios de terceros como Google AdSense y Google Analytics que pueden instalar cookies en su dispositivo para personalizar anuncios y analizar el tráfico del sitio.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">3. Uso de la Información</h2>
          <p>La información recopilada se utiliza para:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Mejorar la experiencia del usuario en el Sitio.</li>
            <li>Generar estadísticas de uso y tráfico.</li>
            <li>Mostrar publicidad relevante a través de Google AdSense.</li>
            <li>Garantizar el correcto funcionamiento del Sitio.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Google AdSense y Publicidad</h2>
          <p>
            Este sitio utiliza Google AdSense para mostrar anuncios. Google utiliza cookies para mostrar
            anuncios basados en las visitas previas del usuario a este sitio o a otros sitios web.
            El uso de cookies publicitarias permite a Google y a sus socios mostrar anuncios basados en
            las visitas del usuario. Los usuarios pueden inhabilitar la publicidad personalizada en la{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#f44336] hover:underline">
              configuración de anuncios de Google
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Cookies</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita
            nuestro sitio. Utilizamos cookies propias y de terceros para:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Recordar sus preferencias de navegación.</li>
            <li>Analizar el tráfico del sitio.</li>
            <li>Mostrar publicidad personalizada.</li>
          </ul>
          <p className="mt-3">
            Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la
            funcionalidad del Sitio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Derechos del Usuario</h2>
          <p>
            De acuerdo con la legislación colombiana, usted tiene derecho a conocer, actualizar, rectificar
            y solicitar la supresión de sus datos personales. Para ejercer estos derechos, puede
            contactarnos a través de nuestra página de contacto.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">7. Cambios en esta Política</h2>
          <p>
            MinutoGlobal se reserva el derecho de modificar esta política de privacidad en cualquier
            momento. Los cambios serán publicados en esta misma página con la fecha de actualización
            correspondiente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">8. Contacto</h2>
          <p>
            Si tiene preguntas sobre esta política de privacidad, puede contactarnos a través de
            nuestra{" "}
            <a href="/contacto" className="text-[#f44336] hover:underline">página de contacto</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
