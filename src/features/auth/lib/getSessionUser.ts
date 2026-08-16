// features/auth/lib/getSessionUser.ts
// ─────────────────────────────────────────────────────────────
// Helper de servidor: devuelve el usuario de la sesión activa de
// Better Auth (o null). Reemplaza al antiguo verify de JWT.
//
// El objeto devuelto incluye los campos core de Better Auth
// (id, email, name, emailVerified, image, …) más los campos
// adicionales mapeados (nombre, apellido, telefono, rol, estado,
// rfc, razon_social).
// ─────────────────────────────────────────────────────────────
import { headers }  from "next/headers";
import { redirect } from "next/navigation";
import { auth }     from "./auth";

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/**
 * Para páginas de invitado (login, registro, …): si hay una sesión
 * REAL y válida, redirige a `to`. Verifica contra la BD (no solo la
 * presencia de cookie), de modo que una cookie vieja/inválida NO
 * provoca un loop de redirección con la Capa 2.
 */
export async function redirectIfAuthenticated(to = "/cuenta") {
  const user = await getSessionUser();
  if (user) redirect(to);
}
