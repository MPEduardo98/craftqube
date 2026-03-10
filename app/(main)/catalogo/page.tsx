// app/(main)/catalogo/page.tsx
import { Suspense }      from "react";
import type { Metadata } from "next";
import { CatalogClient } from "./components/CatalogClient";

export const metadata: Metadata = {
  title:       "Catálogo — CraftQube | Perfiles de Aluminio y Accesorios",
  description: "Explora nuestro catálogo completo de perfiles de aluminio, tornillería industrial y accesorios. Filtros por categoría, marca y disponibilidad.",
};

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogClient />
    </Suspense>
  );
}