// app/(main)/checkout/page.tsx
import type { Metadata } from "next";
import { CheckoutClient } from "@/features/checkout/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — Craftqube",
  description: "Finaliza tu compra de manera segura.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}