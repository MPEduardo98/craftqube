// proxy.ts (antes middleware.ts — Next.js 16 renombró la convención)
// ─────────────────────────────────────────────────────────────
// Proxy propio de craftqube: la protección de /cuenta y /admin
// viene del núcleo (`protegerRutas`); aquí sólo se agrega lo que
// es de esta tienda.
//
// No lleva la marca de "generado", así que `commerce-core instalar`
// lo respeta y no lo pisa.
// ─────────────────────────────────────────────────────────────
import type { NextRequest } from "next/server";
import { NextResponse }     from "next/server";
import { protegerRutas }    from "@mpeduardo98/commerce-core/rutas/proxy";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Limpieza de /categoria/<slug>?cat=… ────────────────────
  // El redirect de next.config.ts (/catalogo?cat=X → /categoria/X)
  // arrastra el `cat` de origen al destino, dejándolo duplicado en
  // la URL final. Lo quitamos con otro 301 para que la URL canónica
  // quede limpia. `cat` no tiene ningún significado en esta ruta:
  // la categoría ya viene en el path.
  if (pathname.startsWith("/categoria/") && req.nextUrl.searchParams.has("cat")) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("cat");
    return NextResponse.redirect(url, 301);
  }

  return protegerRutas(req) ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/cuenta/:path*",
    "/admin/:path*",
    "/admin",
    // Sólo para limpiar el `?cat=` sobrante del redirect; no
    // protege nada. Las categorías son públicas.
    "/categoria/:path*",
  ],
};
