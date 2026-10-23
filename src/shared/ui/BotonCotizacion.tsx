"use client";

import { enlaceWhatsApp } from "@mpeduardo98/commerce-core/venta/whatsapp";
import { useVenta } from "@/shared/context/ContextoVenta";

export function BotonCotizacion({ producto, slug, detalle = "", className = "" }: { producto: string; slug: string; detalle?: string; className?: string }) {
  const venta = useVenta();
  const url = `${venta.sitioUrl.replace(/\/$/, "")}/producto/${slug}`;
  const whatsapp = enlaceWhatsApp(venta, { producto: `${producto}${detalle ? ` (${detalle})` : ""}`, url });
  const href = whatsapp ?? (venta.telefono ? `tel:${venta.telefono}` : venta.email ? `mailto:${venta.email}?subject=${encodeURIComponent(`Cotizaci?n: ${producto}`)}&body=${encodeURIComponent(`${detalle}\n${url}`)}` : "/contacto");
  return (
    <a href={href} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${className}`}
      style={{ background: "var(--color-cq-accent)", color: "white", textDecoration: "none" }}>
      <i className={whatsapp ? "fa-brands fa-whatsapp" : "fa-solid fa-comment"} aria-hidden="true" />
      Cotizar
    </a>
  );
}
