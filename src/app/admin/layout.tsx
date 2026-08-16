// app/admin/layout.tsx
// ─────────────────────────────────────────────────────────────
// Capa 2 de autenticación + shell del panel admin.
// No hereda Header/Footer porque app/(main)/layout.tsx
// los inyecta solo para rutas dentro de (main)/.
// ─────────────────────────────────────────────────────────────
import { notFound }       from "next/navigation";
import { headers }        from "next/headers";
import { auth }           from "@/features/auth/lib/auth";
import { AdminSidebar }   from "@/features/admin/components/AdminSidebar";
import { AdminTopbar }    from "@/features/admin/components/AdminTopbar";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

export const metadata = {
  title: {
    default:  "Admin — CraftQube",
    template: "%s — Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Auth Capa 2: sesión real + rol (Better Auth) ─────────
  const session = await auth.api.getSession({ headers: await headers() });
  const rol = (session?.user as { rol?: string } | undefined)?.rol ?? "";

  if (!session || !ADMIN_ROLES.has(rol)) notFound();

  // ── Shell visual ─────────────────────────────────────────
  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "#f8fafc", fontFamily: "var(--font-dm-sans, system-ui, sans-serif)" }}
    >
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}