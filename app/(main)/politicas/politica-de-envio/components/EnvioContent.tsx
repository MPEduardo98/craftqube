// app/(main)/politica-de-envio/components/EnvioContent.tsx
"use client";

import { PolicyLayout } from "@/app/global/components/legal/PolicyLayout";
import {
  PolicySection,
  PolicyNote,
  PolicyList,
} from "@/app/global/components/legal/PolicySection";

const SECTIONS = [
  { id: "cobertura", title: "1. Cobertura de envíos" },
  { id: "modalidad", title: "2. Modalidad y tiempos" },
  { id: "procesamiento", title: "3. Procesamiento de pedidos" },
  { id: "costos", title: "4. Costos de envío" },
  { id: "intentos", title: "5. Intentos de entrega" },
  { id: "revision", title: "6. Revisión al recibir" },
  { id: "seguro", title: "7. Seguro de envío" },
  { id: "exoneracion", title: "8. Exoneración de responsabilidad" },
];

export function EnvioContent() {
  return (
    <PolicyLayout
      badge="Envíos"
      title="Política de Envíos"
      subtitle="Todo lo que necesitas saber sobre el despacho y entrega de tus pedidos en CraftQube México."
      lastUpdated="2025"
      sections={SECTIONS}
    >
      <PolicyNote variant="info">
        Al realizar una compra en CraftQube México, el cliente acepta plenamente
        los términos establecidos en esta Política de Envíos.
      </PolicyNote>

      <PolicySection id="cobertura" number="01" title="Cobertura de envíos">
        <p>
          CraftQube México realiza envíos a todo el territorio de los Estados
          Unidos Mexicanos, siempre que la dirección de entrega se encuentre
          dentro de las zonas cubiertas por nuestras empresas de mensajería
          asociadas:
        </p>
        <PolicyList
          items={[
            "Paquetexpress",
            "Estafeta",
            "JT Express",
          ]}
        />
        <p className="mt-3">
          En caso de que la dirección del cliente no se encuentre dentro de la
          cobertura de dichas empresas, se notificará oportunamente al comprador
          para coordinar alternativas.
        </p>
      </PolicySection>

      <PolicySection id="modalidad" number="02" title="Modalidad y tiempos de entrega">
        <p>Todos los envíos se realizan en la modalidad <strong style={{ color: "var(--color-cq-text)" }}>estándar</strong>. El tiempo estimado varía según el tipo de producto:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--color-cq-surface)",
              border: "1px solid var(--color-cq-border)",
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-cq-accent)",
              }}
            >
              Accesorios pequeños
            </p>
            <p
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-cq-text)",
              }}
            >
              3 – 5
            </p>
            <p style={{ color: "var(--color-cq-muted)" }}>días hábiles</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-cq-muted)" }}>
              Ej. piezas Bosch Rexroth
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--color-cq-surface)",
              border: "1px solid var(--color-cq-border)",
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-cq-accent)",
              }}
            >
              Perfiles estructurales
            </p>
            <p
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-cq-text)",
              }}
            >
              5 – 8
            </p>
            <p style={{ color: "var(--color-cq-muted)" }}>días hábiles</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-cq-muted)" }}>
              Barras de 5 metros o más
            </p>
          </div>
        </div>
        <p className="mt-4">
          Los plazos son estimativos y pueden variar por causas logísticas,
          ubicación geográfica del cliente o factores externos ajenos al control
          de CraftQube México.
        </p>
      </PolicySection>

      <PolicySection id="procesamiento" number="03" title="Procesamiento de pedidos">
        <p>
          Todo pedido confirmado será preparado y entregado a la paquetería en
          un plazo de <strong style={{ color: "var(--color-cq-text)" }}>1 a 2 días hábiles</strong> posteriores a la confirmación del pago.
        </p>
        <PolicyNote variant="warning">
          Los pedidos realizados en fines de semana o días festivos se
          procesarán a partir del día hábil siguiente.
        </PolicyNote>
      </PolicySection>

      <PolicySection id="costos" number="04" title="Costos de envío">
        <p>
          Los costos de envío se calculan con base en el peso y volumen de los
          productos adquiridos.
        </p>
        <PolicyList
          items={[
            "Para perfiles de aluminio estructural, el costo se calcula conforme a la tarifa vigente hasta alcanzar un límite de 113 kg, a partir del cual el costo deja de escalar.",
            "Se ofrece envío gratuito en accesorios pequeños cuando el monto de compra es igual o superior a $2,500 MXN y el peso total del pedido no excede los 5 kg.",
          ]}
        />
      </PolicySection>

      <PolicySection id="intentos" number="05" title="Intentos de entrega y recolección en sucursal">
        <p>
          La empresa de mensajería realizará hasta <strong style={{ color: "var(--color-cq-text)" }}>dos (2) intentos</strong> de entrega en el domicilio señalado.
        </p>
        <p>
          En caso de no localizar al destinatario, el paquete permanecerá
          disponible en la sucursal más cercana de la paquetería para su
          recolección personal en el plazo que determine la empresa de mensajería.
        </p>
        <PolicyNote variant="warning">
          Si el cliente no recoge el pedido en el plazo indicado, CraftQube
          México no será responsable por la devolución, almacenamiento ni
          custodia del paquete.
        </PolicyNote>
      </PolicySection>

      <PolicySection id="revision" number="06" title="Revisión del producto al recibir">
        <p>
          Es obligación del cliente revisar el paquete y el producto al momento
          de la entrega, <strong style={{ color: "var(--color-cq-text)" }}>antes de firmar de recibido</strong>.
        </p>
        <PolicyNote variant="warning">
          Una vez firmado el comprobante de entrega, no se aceptarán
          reclamaciones por daños físicos, faltantes o irregularidades
          atribuibles al manejo de la paquetería.
        </PolicyNote>
      </PolicySection>

      <PolicySection id="seguro" number="07" title="Seguro de envío">
        <p>
          Todos los envíos cuentan con un seguro básico contratado al momento
          de la generación de la guía, el cual cubre el valor declarado del
          producto conforme a las condiciones de la empresa de mensajería.
        </p>
        <p>
          La responsabilidad de CraftQube México se limita a la contratación del
          seguro correspondiente, quedando cualquier reclamación sujeta a los
          términos y condiciones de la paquetería.
        </p>
      </PolicySection>

      <PolicySection id="exoneracion" number="08" title="Exoneración de responsabilidad">
        <p>
          CraftQube México no será responsable por retrasos, pérdidas o
          incidencias derivadas de causas ajenas a su control, incluyendo:
        </p>
        <PolicyList
          items={[
            "Fallas logísticas de las empresas de mensajería.",
            "Factores climáticos o de fuerza mayor.",
            "Bloqueos, incidentes en ruta o restricciones locales de entrega.",
          ]}
        />
      </PolicySection>
    </PolicyLayout>
  );
}