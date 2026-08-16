// proxy.ts (antes middleware.ts — Next.js 16 renombró la convención)
// ─────────────────────────────────────────────────────────────
// Edge Runtime — corre ANTES de cualquier render.
//
// Capa 1 (optimista): solo PROTEGE rutas privadas comprobando la
// PRESENCIA de la cookie de sesión de Better Auth (sin validar firma
// ni consultar la BD; eso lo hace la Capa 2 en los layouts).
//
//   PROTEGIDAS (/cuenta, /admin)
//     → sin cookie de sesión → redirect /login
//
// El redirect de "invitado" (sacar a usuarios YA logueados de
// /login, /registro, …) NO se hace aquí: una cookie vieja/inválida
// pasaría el chequeo optimista y entraría en loop con la Capa 2.
// En su lugar, esas páginas usan `redirectIfAuthenticated()`, que
// valida la sesión REAL contra la BD.
// ─────────────────────────────────────────────────────────────
import type { NextRequest } from "next/server";
import { NextResponse }     from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/** Rutas que requieren estar autenticado */
const PROTECTED: string[] = ["/cuenta", "/admin"];

function redirectToLogin(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtected) return NextResponse.next();

  // Sin cookie de sesión → login. La Capa 2 valida firma + rol.
  if (!getSessionCookie(req)) return redirectToLogin(req);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cuenta/:path*",
    "/admin/:path*",
    "/admin",
  ],
};
