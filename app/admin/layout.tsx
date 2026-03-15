// app/admin/layout.tsx
// ─────────────────────────────────────────────────────────────
// Capa 2 de autenticación + shell del panel admin.
// No hereda Header/Footer porque app/(main)/layout.tsx
// los inyecta solo para rutas dentro de (main)/.
// ─────────────────────────────────────────────────────────────
import { notFound }       from "next/navigation";
import { cookies }        from "next/headers";
import { jwtVerify }      from "jose";
import { AdminSidebar }   from "./components/AdminSidebar";
import { AdminTopbar }    from "./components/AdminTopbar";

const ACCESS_COOKIE = "cq_access";
const ADMIN_ROLES   = new Set(["admin", "superadmin"]);
const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me"
);

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
  // ── Auth Capa 2 ──────────────────────────────────────────
  const jar         = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;

  if (!accessToken) notFound();

  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
    const rol = (payload as { rol?: string }).rol ?? "";
    if (!ADMIN_ROLES.has(rol)) notFound();
  } catch (err: unknown) {
    const isExpired =
      err instanceof Error &&
      (err.message.includes("exp") || err.message.includes("JWTExpired"));
    if (!isExpired) notFound();
  }

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