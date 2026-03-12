// middleware.ts
// ─────────────────────────────────────────────────────────────
// Capa 1 — Edge Runtime. Corre ANTES de cualquier render.
//
// No importa jose ni ninguna librería externa para evitar
// problemas de compatibilidad con el Edge Runtime.
//
// Estrategia:
//   - Sin cookies             → /login (redirige inmediato)
//   - JWT expirado + refresh  → pasa (AuthContext renueva)
//   - JWT activo              → pasa
//   - JWT corrupto/malformado → /login
//
// La verificación de FIRMA real ocurre en la Capa 2
// (app/(main)/cuenta/layout.tsx — Node.js Server Component).
// ─────────────────────────────────────────────────────────────
import type { NextRequest } from "next/server";
import { NextResponse }     from "next/server";

const ACCESS_COOKIE  = "cq_access";
const REFRESH_COOKIE = "cq_refresh";

const PROTECTED: string[] = ["/cuenta"];

/** Decodifica el payload de un JWT sin verificar firma (solo base64). */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → base64 estándar
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded  = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtected) return NextResponse.next();

  const accessToken  = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  // Sin ninguna cookie → login directo
  if (!accessToken && !refreshToken) {
    return redirectToLogin(req);
  }

  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);

    // Token malformado (no tiene estructura JWT válida)
    if (!payload) return redirectToLogin(req);

    const now     = Math.floor(Date.now() / 1000);
    const expired = payload.exp !== undefined && payload.exp < now;

    if (expired && refreshToken) {
      // Expirado pero hay refresh → dejar pasar, AuthContext renueva
      return NextResponse.next();
    }

    if (expired && !refreshToken) {
      // Expirado sin posibilidad de renovar
      return redirectToLogin(req);
    }

    // Token con estructura válida y no expirado → pasa
    // La firma se verifica en la Capa 2 (layout Server Component)
    return NextResponse.next();
  }

  // Solo hay refresh token → dejar pasar para renovación
  if (refreshToken) {
    return NextResponse.next();
  }

  return redirectToLogin(req);
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/cuenta/:path*"],
};