// app/(main)/layout.tsx
// ─────────────────────────────────────────────────────────────
// Layout exclusivo del sitio público.
// Solo las rutas dentro de app/(main)/ renderizan Header y Footer.
// /admin, /auth, etc. quedan completamente limpios.
// ─────────────────────────────────────────────────────────────
import { Header }    from "@/app/global/components/header/Header";
import { Footer }    from "@/app/global/components/footer/Footer";
import { CartDrawer } from "@/app/global/components/cart/CartDrawer";
import { getCategorias } from "@/app/global/lib/db/getCategorias";

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