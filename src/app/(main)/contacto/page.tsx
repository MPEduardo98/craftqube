// app/contacto/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContactoPublico } from "@mpeduardo98/commerce-core/contacto";
import { getStoreConfig } from "@mpeduardo98/commerce-core/config";
import { ContactForm } from "@/features/marketing/components/contacto/ContactForm";
import { ContactInfo } from "@/features/marketing/components/contacto/ContactInfo";
import { ContactHero } from "@/features/marketing/components/contacto/ContactHero";

export const metadata: Metadata = {
  title: "Contacto — Craftqube",
  description:
    "Contáctanos para cotizaciones, asesoría técnica o cualquier consulta sobre perfiles de aluminio y accesorios industriales.",
};

export const dynamic = "force-dynamic";

export default async function ContactoPage() {
  const [config, tienda] = await Promise.all([getContactoPublico(), getStoreConfig()]);
  if (!config.activo) notFound();
  return (
    <>
      <ContactHero titulo={config.titulo} descripcion={config.descripcion} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <ContactInfo email={tienda.email} telefono={tienda.telefono} />
          <ContactForm config={config} />
        </div>
      </div>
    </>
  );
}