// middleware.ts
// ─────────────────────────────────────────────────────────────
// Capa 1 — Edge Runtime. Corre ANTES de cualquier render.
//
// Estrategia:
//   /cuenta → cualquier usuario autenticado
//   /admin  → solo verifica que haya cookies; el rol se valida
//             en la Capa 2 (layout) con notFound() para no
//             revelar que la ruta existe.
//
//   - Sin cookies             → /login
//   - JWT malformado          → /login
//   - JWT expirado + refresh  → pasa (AuthContext renueva)
//   - JWT activo              → pasa
//
// La verificación de FIRMA y ROL ocurre en la Capa 2:
//   /cuenta → app/(main)/cuenta/layout.tsx
//   /admin  → app/admin/layout.tsx  (usa notFound si falla)
// ─────────────────────────────────────────────────────────────
import type { NextRequest } from "next/server";
import { NextResponse }     from "next/server";

const ACCESS_COOKIE  = "cq_access";
const REFRESH_COOKIE = "cq_refresh";

/** Rutas que requieren estar autenticado */
const PROTECTED: string[] = ["/cuenta", "/admin"];

// ─── Decodificación ligera (sin verificar firma) ─────────────

interface JwtPayloadDecoded {
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayloadDecoded | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded  = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return JSON.parse(atob(padded)) as JwtPayloadDecoded;
  } catch {
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function redirectToLogin(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// ─── Middleware ───────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtected) return NextResponse.next();

  const accessToken  = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  // Sin ninguna cookie → login
  if (!accessToken && !refreshToken) {
    return redirectToLogin(req);
  }

  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);

    // Token malformado → login
    if (!payload) return redirectToLogin(req);

    const now     = Math.floor(Date.now() / 1000);
    const expired = payload.exp !== undefined && payload.exp < now;

    if (expired && !refreshToken) return redirectToLogin(req);

    // Expirado con refresh, o token activo → pasa.
    // Para /admin la Capa 2 verifica firma + rol y llama
    // notFound() si algo falla, sin revelar que la ruta existe.
    return NextResponse.next();
  }

  // Solo refresh token → dejar pasar para renovación
  return NextResponse.next();
}

export const config = {
  matcher: ["/cuenta/:path*", "/admin/:path*", "/admin"],
};