// app/contacto/page.tsx
import type { Metadata } from "next";
import { ContactForm } from "@/features/marketing/components/contacto/ContactForm";
import { ContactInfo } from "@/features/marketing/components/contacto/ContactInfo";
import { ContactHero } from "@/features/marketing/components/contacto/ContactHero";

export const metadata: Metadata = {
  title: "Contacto — Craftqube",
  description:
    "Contáctanos para cotizaciones, asesoría técnica o cualquier consulta sobre perfiles de aluminio y accesorios industriales.",
};

export default function ContactoPage() {
  return (
    <>
      <ContactHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </>
  );
}