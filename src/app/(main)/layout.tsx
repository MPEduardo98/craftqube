// app/(main)/layout.tsx
// ─────────────────────────────────────────────────────────────
// Layout exclusivo del sitio público.
// Solo las rutas dentro de app/(main)/ renderizan Header y Footer.
// /admin, /auth, etc. quedan completamente limpios.
// ─────────────────────────────────────────────────────────────
import { Header }    from "@/shared/components/header/Header";
import { Footer }    from "@/shared/components/footer/Footer";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { getCategorias } from "@/features/categories/lib/getCategorias";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categorias = await getCategorias().catch(() => []);

  return (
    <>
      <Header initialCategorias={categorias} />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  );
}