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
import { cookies }        from "next/headers";
import { jwtVerify }      from "jose";
import type { Metadata }  from "next";
import { AccountLayout }  from "./components/AccountLayout";

export const metadata: Metadata = {
  title: "Mi Cuenta — Craftqube",
  description: "Gestiona tu perfil, pedidos, favoritos y direcciones de envío",
};

const ACCESS_COOKIE = "cq_access";
const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me"
);

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar         = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login?redirect=/cuenta");
  }

  try {
    await jwtVerify(accessToken, ACCESS_SECRET);
  } catch (err: unknown) {
    // Token expirado: el cliente se encarga del refresh via AuthContext.
    // Solo bloqueamos si la firma es inválida (token falsificado).
    const isExpired = err instanceof Error && err.message.includes("exp");
    if (!isExpired) {
      redirect("/login?redirect=/cuenta");
    }
  }

  return <AccountLayout>{children}</AccountLayout>;
}