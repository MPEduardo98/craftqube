// middleware.ts
// ─────────────────────────────────────────────────────────────
// Edge Runtime — corre ANTES de cualquier render.
//
// Dos tipos de rutas:
//
//   PROTEGIDAS (/cuenta, /admin)
//     → requieren sesión activa
//     → sin cookies válidas → redirect /login
//
//   DE INVITADO (/login, /registro, /recuperar-password, /reset-password)
//     → solo accesibles sin sesión
//     → con access token válido → redirect /cuenta
//
// La verificación de FIRMA y ROL ocurre en la Capa 2 (layouts).
// ─────────────────────────────────────────────────────────────
import type { NextRequest } from "next/server";
import { NextResponse }     from "next/server";

const ACCESS_COOKIE  = "cq_access";
const REFRESH_COOKIE = "cq_refresh";

/** Rutas que requieren estar autenticado */
const PROTECTED: string[] = ["/cuenta", "/admin"];

/** Rutas que NO deben ser accesibles si ya hay sesión */
const GUEST_ONLY: string[] = [
  "/login",
  "/registro",
  "/recuperar-password",
  "/reset-password",
];

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

function isTokenActive(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (payload.exp === undefined) return true;
  return payload.exp > Math.floor(Date.now() / 1000);
}

// ─── Helpers ─────────────────────────────────────────────────

function redirectToLogin(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectToCuenta(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/cuenta";
  url.search   = "";
  return NextResponse.redirect(url);
}

// ─── Middleware ───────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken  = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  // ── Rutas de invitado ─────────────────────────────────────
  // Si el access token existe y no ha expirado → redirect /cuenta.
  // No necesitamos verificar firma aquí; la Capa 2 lo hace.
  const isGuestOnly = GUEST_ONLY.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isGuestOnly) {
    if (accessToken && isTokenActive(accessToken)) {
      return redirectToCuenta(req);
    }
    return NextResponse.next();
  }

  // ── Rutas protegidas ──────────────────────────────────────
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

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

    // Expirado sin refresh → login
    if (expired && !refreshToken) return redirectToLogin(req);

    // Expirado con refresh, o activo → pasa (Capa 2 valida firma + rol)
    return NextResponse.next();
  }

  // Solo refresh token → dejar pasar para renovación
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cuenta/:path*",
    "/admin/:path*",
    "/admin",
    "/login",
    "/registro",
    "/recuperar-password",
    "/reset-password",
  ],
};