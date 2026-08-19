// app/(main)/checkout/layout.tsx
// ─────────────────────────────────────────────────────────────
// Marco compartido por los cuatro pasos. Al vivir en el layout,
// Next lo conserva entre /checkout/contacto, /envio, /pago y
// /confirmacion: el estado del pedido no se pierde al navegar.
// ─────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import { CheckoutShell } from "@/features/checkout/components/CheckoutShell";

export const metadata: Metadata = {
  title:       "Checkout — Craftqube",
  description: "Finaliza tu compra de manera segura.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutShell>{children}</CheckoutShell>;
}
