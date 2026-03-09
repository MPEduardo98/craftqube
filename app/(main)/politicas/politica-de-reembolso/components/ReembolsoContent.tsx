// app/(main)/politica-de-reembolso/components/ReembolsoContent.tsx
"use client";

import { PolicyLayout } from "@/app/global/components/legal/PolicyLayout";
import {
  PolicySection,
  PolicyNote,
  PolicyList,
} from "@/app/global/components/legal/PolicySection";

const SECTIONS = [
  { id: "general", title: "1. Carácter general" },
  { id: "excepcion", title: "2. Excepción aplicable" },
  { id: "requisitos", title: "3. Requisitos de procedencia" },
  { id: "procedimiento", title: "4. Procedimiento" },
  { id: "exclusiones", title: "5. Exclusiones" },
  { id: "responsabilidad", title: "6. Responsabilidad del cliente" },
];

export function ReembolsoContent() {
  return (
    <PolicyLayout
      badge="Devoluciones y Reembolsos"
      title="Política de Reembolso"
      subtitle="Conoce los términos y condiciones bajo los cuales CraftQube gestiona devoluciones y reembolsos."
      lastUpdated="2025"
      sections={SECTIONS}
    >
      <PolicyNote variant="warning">
        Por regla general, no se aceptan devoluciones ni reembolsos. Solo aplica
        en casos específicos donde el producto entregado no corresponda al
        adquirido. Revisa cuidadosamente tu pedido antes de confirmar la compra.
      </PolicyNote>

      <PolicySection id="general" number="01" title="Carácter general">
        <p>
          Por regla general, <strong style={{ color: "var(--color-cq-text)" }}>no se aceptan devoluciones ni se realizan reembolsos</strong> sobre
          las compras efectuadas en este portal. El cliente reconoce y acepta
          que, una vez confirmado el pedido y entregado el producto, no
          procederá cancelación, devolución ni reembolso alguno, salvo en los
          casos expresamente previstos en esta política.
        </p>
      </PolicySection>

      <PolicySection id="excepcion" number="02" title="Excepción aplicable">
        <p>
          Únicamente procederá una devolución o reembolso cuando el producto
          entregado <strong style={{ color: "var(--color-cq-text)" }}>no corresponda al adquirido</strong> por el cliente,
          lo cual se entenderá en los siguientes supuestos:
        </p>
        <PolicyList
          items={[
            "Diferencias en la denominación o identificación del producto.",
            "Variaciones en las características técnicas, materiales, acabados o color.",
            "Dimensiones distintas a las especificadas en la orden de compra.",
            "Cualquier otra discrepancia objetiva y comprobable entre el producto solicitado y el recibido.",
          ]}
        />
      </PolicySection>

      <PolicySection id="requisitos" number="03" title="Requisitos de procedencia">
        <p>
          Para que un reclamo de devolución o reembolso sea admitido, el cliente
          deberá cumplir con las siguientes condiciones:
        </p>
        <PolicyList
          items={[
            "Presentar el comprobante de compra emitido por CraftQube México.",
            "Entregar el producto en su estado original, sin haber sido utilizado, alterado o manipulado.",
            "Reportar el caso en un plazo no mayor a cinco (5) días hábiles contados a partir de la recepción del pedido.",
            "Permitir la inspección y verificación física del producto por parte del equipo de CraftQube México.",
          ]}
        />
        <PolicyNote variant="warning">
          El plazo de 5 días hábiles es improrrogable. Reclamos presentados
          fuera de este periodo no serán admitidos.
        </PolicyNote>
      </PolicySection>

      <PolicySection id="procedimiento" number="04" title="Procedimiento">
        <p>Para iniciar un proceso de devolución o reembolso, sigue estos pasos:</p>

        <div className="space-y-4 mt-4">
          {[
            {
              step: "01",
              title: "Envía tu solicitud",
              desc: "Escribe a legal@craftqube.com.mx adjuntando el número de pedido, fotografías del producto y descripción detallada del error.",
            },
            {
              step: "02",
              title: "Revisión de evidencia",
              desc: "CraftQube México revisará la información y podrá requerir documentación adicional para validar el reclamo.",
            },
            {
              step: "03",
              title: "Resolución",
              desc: "Confirmada la discrepancia, a elección del cliente se gestionará el reemplazo por el artículo correcto o el reembolso del importe pagado por el mismo medio de pago original.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{
                background: "var(--color-cq-surface)",
                border: "1px solid var(--color-cq-border)",
              }}
            >
              <span
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"
                style={{
                  background: "var(--color-cq-accent-glow)",
                  color: "var(--color-cq-accent)",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid rgba(37,99,235,0.15)",
                }}
              >
                {s.step}
              </span>
              <div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--color-cq-text)" }}
                >
                  {s.title}
                </p>
                <p className="text-sm" style={{ color: "var(--color-cq-muted)" }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection id="exclusiones" number="05" title="Exclusiones">
        <p>
          No se aceptarán devoluciones, cambios ni reembolsos en los siguientes
          casos:
        </p>
        <PolicyList
          items={[
            "Productos que presenten signos de uso, daños, alteraciones o manipulación por parte del cliente.",
            "Artículos que no conserven su empaque, accesorios o condiciones originales de entrega.",
            "Reclamos presentados fuera del plazo de 5 días hábiles establecido.",
            "Situaciones derivadas de errores de interpretación del cliente respecto a características, medidas o descripciones publicadas en el sitio.",
          ]}
        />
      </PolicySection>

      <PolicySection id="responsabilidad" number="06" title="Responsabilidad del cliente">
        <p>
          Es responsabilidad del cliente verificar cuidadosamente la información
          del producto antes de realizar la compra, así como revisar el estado
          del pedido en el momento de su recepción.
        </p>
        <p>
          El incumplimiento de estas disposiciones limitará la procedencia de
          cualquier reclamo posterior.
        </p>
        <PolicyNote variant="info">
          Para dudas o consultas sobre esta política, escríbenos a{" "}
          <a
            href="mailto:legal@craftqube.com.mx"
            style={{ color: "var(--color-cq-accent)" }}
          >
            legal@craftqube.com.mx
          </a>
        </PolicyNote>
      </PolicySection>
    </PolicyLayout>
  );
}