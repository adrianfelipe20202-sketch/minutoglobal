import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto — MinutoGlobal",
  description: "Ponte en contacto con el equipo de MinutoGlobal.",
};

export default function Contacto() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Contacto</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#94a3b8]">
        <p>
          En MinutoGlobal valoramos la comunicación con nuestros lectores. Si tienes preguntas,
          sugerencias o quieres reportar un contenido, no dudes en escribirnos.
        </p>

        <section className="bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Escríbenos</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Correo electrónico</h3>
              <a href="mailto:minutoglobal157@gmail.com" className="text-[#f44336] hover:underline">
                minutoglobal157@gmail.com
              </a>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Redes sociales</h3>
              <div className="flex gap-4 mt-2">
                <a
                  href="https://www.facebook.com/profile.php?id=1082086091650883"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f44336] hover:underline"
                >
                  Facebook
                </a>
                <a
                  href="https://twitter.com/MinutoGlobal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f44336] hover:underline"
                >
                  X (Twitter)
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-white mb-3">Información Adicional</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white">Correcciones:</strong> Si encuentras un error en alguna de nuestras publicaciones, escríbenos y lo corregiremos lo antes posible.</li>
            <li><strong className="text-white">Colaboraciones:</strong> Si eres periodista o creador de contenido y deseas colaborar con MinutoGlobal, contáctanos.</li>
            <li><strong className="text-white">Publicidad:</strong> Para consultas sobre espacios publicitarios, escríbenos al correo indicado.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
