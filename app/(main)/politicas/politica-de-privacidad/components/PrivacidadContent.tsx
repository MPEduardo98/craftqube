// app/(main)/politica-de-privacidad/components/PrivacidadContent.tsx
"use client";

import { PolicyLayout } from "@/app/global/components/legal/PolicyLayout";
import {
  PolicySection,
  PolicyNote,
  PolicyList,
} from "@/app/global/components/legal/PolicySection";

const SECTIONS = [
  { id: "responsable", title: "1. Responsable del tratamiento" },
  { id: "datos", title: "2. Datos que recopilamos" },
  { id: "finalidad", title: "3. Finalidad del tratamiento" },
  { id: "transferencia", title: "4. Transferencia de datos" },
  { id: "derechos", title: "5. Derechos ARCO" },
  { id: "cookies", title: "6. Cookies y rastreo" },
  { id: "seguridad", title: "7. Seguridad de datos" },
  { id: "cambios", title: "8. Cambios a esta política" },
  { id: "contacto", title: "9. Contacto" },
];

export function PrivacidadContent() {
  return (
    <PolicyLayout
      badge="Privacidad"
      title="Política de Privacidad"
      subtitle="En CraftQube México, la protección de tus datos personales es una prioridad. Conoce cómo recopilamos, usamos y protegemos tu información."
      lastUpdated="2025"
      sections={SECTIONS}
    >
      <PolicyNote variant="info">
        Esta Política de Privacidad cumple con lo establecido en la Ley Federal
        de Protección de Datos Personales en Posesión de los Particulares
        (LFPDPPP) y su Reglamento, vigentes en los Estados Unidos Mexicanos.
      </PolicyNote>

      <PolicySection id="responsable" number="01" title="Responsable del tratamiento">
        <p>
          <strong style={{ color: "var(--color-cq-text)" }}>CraftQube México</strong> es el responsable del tratamiento de los
          datos personales que el usuario proporcione a través de este sitio web.
        </p>
        <PolicyList
          items={[
            "Razón social: Craftqube S.A. de C.V.",
            "Correo de contacto: legal@craftqube.com.mx",
            "Domicilio fiscal: Puebla, Puebla, México",
          ]}
        />
      </PolicySection>

      <PolicySection id="datos" number="02" title="Datos que recopilamos">
        <p>
          Recopilamos los datos personales que nos proporcionas voluntariamente,
          así como aquellos generados durante tu navegación:
        </p>
        <PolicyList
          items={[
            "Datos de identificación: nombre completo, correo electrónico, número telefónico.",
            "Datos de ubicación: dirección de envío, ciudad, estado, código postal.",
            "Datos de pago: procesados de forma segura por Shopify Payments o PayPal; CraftQube no almacena datos financieros.",
            "Datos de navegación: dirección IP, tipo de dispositivo, páginas visitadas, tiempo de sesión (mediante cookies).",
            "Datos de cuenta: historial de pedidos, preferencias y comunicaciones.",
          ]}
        />
      </PolicySection>

      <PolicySection id="finalidad" number="03" title="Finalidad del tratamiento">
        <p>Tus datos serán utilizados para las siguientes finalidades:</p>
        <div className="mt-3 space-y-3">
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-cq-accent)",
              }}
            >
              Finalidades necesarias
            </p>
            <PolicyList
              items={[
                "Procesar y gestionar tus pedidos y pagos.",
                "Coordinar el envío y entrega de productos.",
                "Proporcionar soporte y atención al cliente.",
                "Cumplir con obligaciones legales y fiscales.",
              ]}
            />
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-cq-muted)",
              }}
            >
              Finalidades secundarias (puedes oponerte)
            </p>
            <PolicyList
              items={[
                "Envío de comunicaciones comerciales, promociones y novedades.",
                "Realización de encuestas de satisfacción.",
                "Análisis estadístico y mejora del servicio.",
              ]}
            />
          </div>
        </div>
      </PolicySection>

      <PolicySection id="transferencia" number="04" title="Transferencia de datos">
        <p>
          CraftQube México podrá compartir tus datos con terceros únicamente en
          los siguientes supuestos:
        </p>
        <PolicyList
          items={[
            "Empresas de mensajería (Paquetexpress, Estafeta, JT Express) para la entrega de pedidos.",
            "Plataformas de pago (Shopify Payments, PayPal) para el procesamiento de transacciones.",
            "Autoridades competentes cuando sea requerido por ley.",
          ]}
        />
        <p className="mt-3">
          En ningún caso venderemos ni cederemos tus datos personales a
          terceros con fines comerciales propios.
        </p>
      </PolicySection>

      <PolicySection id="derechos" number="05" title="Derechos ARCO">
        <p>
          De conformidad con la LFPDPPP, tienes derecho a:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { letter: "A", name: "Acceso", desc: "Conocer qué datos tenemos sobre ti." },
            { letter: "R", name: "Rectificación", desc: "Corregir datos inexactos o incompletos." },
            { letter: "C", name: "Cancelación", desc: "Solicitar la eliminación de tus datos." },
            { letter: "O", name: "Oposición", desc: "Oponerte al tratamiento de tus datos." },
          ].map((d) => (
            <div
              key={d.letter}
              className="rounded-xl p-4 text-center"
              style={{
                background: "var(--color-cq-surface)",
                border: "1px solid var(--color-cq-border)",
              }}
            >
              <span
                className="text-2xl font-bold block mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-cq-accent)",
                }}
              >
                {d.letter}
              </span>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "var(--color-cq-text)" }}
              >
                {d.name}
              </p>
              <p className="text-xs" style={{ color: "var(--color-cq-muted)" }}>
                {d.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4">
          Para ejercer tus derechos ARCO, envía tu solicitud a{" "}
          <a
            href="mailto:legal@craftqube.com.mx"
            style={{ color: "var(--color-cq-accent)" }}
          >
            legal@craftqube.com.mx
          </a>{" "}
          indicando tu nombre, el derecho que deseas ejercer y la información
          que corresponda. Atenderemos tu solicitud en un plazo máximo de
          20 días hábiles.
        </p>
      </PolicySection>

      <PolicySection id="cookies" number="06" title="Cookies y rastreo">
        <p>
          Este sitio utiliza cookies propias y de terceros para mejorar la
          experiencia de navegación, analizar el tráfico y personalizar
          contenido.
        </p>
        <PolicyList
          items={[
            "Cookies técnicas: necesarias para el funcionamiento del sitio (sesión, carrito de compras).",
            "Cookies analíticas: recopilan información anónima sobre el uso del sitio.",
            "Cookies de marketing: permiten mostrar publicidad relevante.",
          ]}
        />
        <p className="mt-3">
          El usuario puede desactivar las cookies desde la configuración de su
          navegador. Ten en cuenta que algunas funcionalidades del sitio podrían
          no estar disponibles en ese caso.
        </p>
      </PolicySection>

      <PolicySection id="seguridad" number="07" title="Seguridad de datos">
        <p>
          Implementamos medidas de seguridad técnicas, administrativas y físicas
          adecuadas para proteger tus datos personales contra pérdida,
          acceso no autorizado, divulgación, alteración o destrucción.
        </p>
        <p>
          Toda la información de pago es procesada mediante protocolos de
          cifrado SSL/TLS a través de las plataformas de pago correspondientes.
          CraftQube México no almacena ni tiene acceso directo a datos financieros.
        </p>
      </PolicySection>

      <PolicySection id="cambios" number="08" title="Cambios a esta política">
        <p>
          CraftQube México se reserva el derecho de modificar esta Política de
          Privacidad en cualquier momento. Los cambios serán publicados en esta
          misma página con indicación de la fecha de actualización.
        </p>
        <p>
          El uso continuado del sitio tras la publicación de modificaciones
          implica la aceptación de los nuevos términos.
        </p>
      </PolicySection>

      <PolicySection id="contacto" number="09" title="Contacto">
        <p>
          Para cualquier consulta relacionada con el tratamiento de tus datos
          personales, puedes contactarnos en:
        </p>
        <PolicyNote variant="info">
          <strong style={{ color: "var(--color-cq-text)" }}>
            legal@craftqube.com.mx
          </strong>
          <br />
          CraftQube México — Puebla, Pue., México
        </PolicyNote>
      </PolicySection>
    </PolicyLayout>
  );
}