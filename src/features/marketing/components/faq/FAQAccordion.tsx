// app/(main)/faq/components/FAQAccordion.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    category: "Productos",
    items: [
      {
        q: "¿Qué tipos de perfiles modulares de aluminio ofrecen?",
        a: "Ofrecemos perfiles de aluminio de alta calidad ideales para estructuras de máquinas, zonas de trabajo, estantes o vallas de protección, con planificación sencilla y entrega rápida.",
      },
      {
        q: "¿Cuáles son las marcas principales con las que trabajan?",
        a: "Trabajamos con Bosch Rexroth, sin embargo no somos distribuidores certificados de ninguna marca.",
      },
      {
        q: "¿Ofrecen opciones de personalización en los productos?",
        a: "Sí, la mayoría de los productos se pueden configurar en medidas, acabados y otras opciones según tus necesidades.",
      },
      {
        q: "¿Cómo garantizan la calidad de los productos que venden?",
        a: "Los productos se adquieren de proveedores certificados y cuidamos el embalaje para asegurar que lleguen en perfectas condiciones.",
      },
    ],
  },
  {
    category: "Pedidos y Pagos",
    items: [
      {
        q: "¿Cómo puedo realizar un pedido a través de la tienda en línea?",
        a: "Solo selecciona tu producto, configúralo a tu gusto, indica la cantidad, realiza tu pago y listo.",
      },
      {
        q: "¿Cuáles son las opciones de pago disponibles?",
        a: "Aceptamos tarjetas de crédito, débito, PayPal y transferencias bancarias.",
      },
      {
        q: "¿Tienen descuentos para compras al mayoreo?",
        a: "Sí, ofrecemos descuentos en compras grandes; consulta las promociones disponibles en la sección de ofertas.",
      },
    ],
  },
  {
    category: "Envíos y Entregas",
    items: [
      {
        q: "¿Ofrecen envíos a toda la República Mexicana?",
        a: "Sí, hacemos envíos a todas las regiones del país a través de Paquetexpress, Estafeta y JT Express.",
      },
      {
        q: "¿Cuánto tiempo tarda la entrega de un pedido?",
        a: "El tiempo de entrega varía según disponibilidad y ubicación. Para accesorios pequeños: 3 a 5 días hábiles. Para perfiles estructurales: 5 a 8 días hábiles.",
      },
    ],
  },
  {
    category: "Servicios y Soporte",
    items: [
      {
        q: "¿Qué servicios adicionales ofrecen además de la venta de productos?",
        a: "Además de venta, ofrecemos asesoría técnica, diseño de soluciones personalizadas, ensamblaje de estructuras básicas y proyectos llave en mano enfocados en automatización.",
      },
      {
        q: "¿Puedo recibir asesoría técnica para un proyecto específico?",
        a: "Sí, ofrecemos asesoría para ayudarte a encontrar soluciones adecuadas. Puedes contactarnos en la sección de contacto.",
      },
      {
        q: "¿Cuál es el proceso de devolución o cambio de productos?",
        a: "No contamos con políticas de devolución generales. Solo aplica en casos donde el producto recibido no corresponde al solicitado. Revisa tu pedido y todas sus características cuidadosamente antes de pagar.",
      },
    ],
  },
];

interface AccordionItemProps {
  q: string;
  a: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ q, a, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: isOpen
          ? "var(--color-cq-surface-2)"
          : "var(--color-cq-surface)",
        border: isOpen
          ? "1px solid rgba(37,99,235,0.25)"
          : "1px solid var(--color-cq-border)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span
          className="text-sm font-semibold leading-snug"
          style={{ color: "var(--color-cq-text)" }}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg"
          style={{
            background: isOpen
              ? "var(--color-cq-accent-glow)"
              : "var(--color-cq-border)",
            color: isOpen ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
            border: isOpen
              ? "1px solid rgba(37,99,235,0.2)"
              : "1px solid transparent",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-5 pb-5 text-sm leading-relaxed"
              style={{ color: "var(--color-cq-muted)" }}
            >
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQAccordion() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "var(--color-cq-bg)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {FAQ_ITEMS.map((cat, ci) => (
          <motion.div
            key={cat.category}
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: ci * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className="h-px flex-1"
                style={{ background: "var(--color-cq-border)" }}
              />
              <p
                className="text-xs uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-cq-accent)",
                }}
              >
                {cat.category}
              </p>
              <span
                className="h-px flex-1"
                style={{ background: "var(--color-cq-border)" }}
              />
            </div>

            {/* Accordion items */}
            <div className="flex flex-col gap-2">
              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`;
                return (
                  <AccordionItem
                    key={key}
                    q={item.q}
                    a={item.a}
                    index={ii}
                    isOpen={!!openMap[key]}
                    onToggle={() => toggle(key)}
                  />
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <motion.div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{
            background: "var(--color-cq-surface)",
            border: "1px solid var(--color-cq-border)",
          }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-cq-accent)",
            }}
          >
            ¿No encontraste tu respuesta?
          </p>
          <h3
            className="text-xl font-bold mb-2"
            style={{
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-display)",
            }}
          >
            Contáctanos directamente
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--color-cq-muted)" }}
          >
            Nuestro equipo está listo para ayudarte con cualquier duda o proyecto.
          </p>
          <a
            href="/contacto"
            className="btn-primary inline-flex"
          >
            Ir a Contacto →
          </a>
        </motion.div>
      </div>
    </section>
  );
}