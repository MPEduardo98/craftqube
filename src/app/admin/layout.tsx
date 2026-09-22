// app/admin/layout.tsx
// ─────────────────────────────────────────────────────────────
// Capa 2 de autenticación + shell del panel admin.
// No hereda Header/Footer porque app/(main)/layout.tsx
// los inyecta solo para rutas dentro de (main)/.
//
// La identidad (nombre, logo, colores) sale de `configuracion`,
// no del código: el mismo panel sirve a cualquier tienda sin
// tocar archivos. Los colores se inyectan como variables CSS en
// el contenedor raíz, de modo que todo lo que ya usa
// --color-cq-* los toma sin cambios.
// ─────────────────────────────────────────────────────────────
import { notFound }       from "next/navigation";
import { headers }        from "next/headers";
import { auth }           from "@/features/auth/lib/auth";
import { getStoreConfig } from "@/shared/lib/config/store-config";
import { AdminSidebar }   from "@/features/admin/components/AdminSidebar";
import { AdminTopbar }    from "@/features/admin/components/AdminTopbar";
import { UserButton }     from "@/shared/components/header/UserButton";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

export async function generateMetadata() {
  const { nombre } = await getStoreConfig();
  return {
    title: {
      default:  `Admin — ${nombre}`,
      template: "%s — Admin",
    },
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Auth Capa 2: sesión real + rol (Better Auth) ─────────
  const session = await auth.api.getSession({ headers: await headers() });
  const rol = (session?.user as { rol?: string } | undefined)?.rol ?? "";

  if (!session || !ADMIN_ROLES.has(rol)) notFound();

  const { nombre, logoUrl, colorPrimario, colorAcento } = await getStoreConfig();

  // ── Shell visual ─────────────────────────────────────────
  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{
        // Tema de la tienda: sobreescribe los tokens globales
        // sólo dentro del panel.
        "--color-cq-blue-900": colorPrimario,
        "--color-cq-accent":   colorAcento,
        background: "var(--color-cq-bg, #f8fafc)",
        color:      "var(--color-cq-text, #0f172a)",
        fontFamily: "var(--font-dm-sans, system-ui, sans-serif)",
      } as React.CSSProperties}
    >
      <AdminSidebar nombre={nombre} logoUrl={logoUrl} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* El botón de cuenta depende de la sesión y el tema de esta
            tienda, así que lo pone el proyecto y no el núcleo. */}
        <AdminTopbar userButton={<UserButton />} />
        <main className="admin-shell flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
