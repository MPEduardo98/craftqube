// app/(main)/cuenta/layout.tsx
// ─────────────────────────────────────────────────────────────
// Capa 2 de autenticación: Server Component.
// Corre en el servidor DESPUÉS del middleware pero ANTES de
// renderizar cualquier hijo. Verifica el JWT con firma real.
//
// El middleware (capa 1) ya bloqueó los casos más obvios;
// este layout añade defensa en profundidad: si alguien
// manipuló la cookie o el token expiró entre el middleware
// y este render, redirige desde el servidor sin exponer HTML.
// ─────────────────────────────────────────────────────────────
import { redirect }       from "next/navigation";
import { headers }        from "next/headers";
import type { Metadata }  from "next";
import { auth }           from "@/features/auth/lib/auth";
import { AccountLayout }  from "@/features/account/components/AccountLayout";

export const metadata: Metadata = {
  title: "Mi Cuenta — Craftqube",
  description: "Gestiona tu perfil, pedidos, favoritos y direcciones de envío",
};

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Capa 2: verificación real de sesión en el servidor (Better Auth).
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?redirect=/cuenta");
  }

  return <AccountLayout>{children}</AccountLayout>;
}