// app/(main)/checkout/pago/page.tsx
import type { Metadata } from "next";
import { PasoPago } from "@/features/checkout/components/pasos/PasoPago";

export const metadata: Metadata = {
  title: "Pago — Checkout · Craftqube",
};

export default function PagoPage() {
  return <PasoPago />;
}
