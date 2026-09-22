// app/api/admin/configuracion/route.ts
// ─────────────────────────────────────────────────────────────
// GET/PUT de la configuración global de la tienda: identidad,
// tema y moneda. Protegido por rol admin (Better Auth), igual
// que el panel.
//
// La validación se repite aquí aunque el formulario ya valide:
// el endpoint es alcanzable sin pasar por la UI, y los colores
// acaban inyectados como variables CSS.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { headers }                   from "next/headers";
import { auth }                       from "@/features/auth/lib/auth";
import {
  getStoreConfig, setStoreConfig,
  type Moneda, type StoreConfig,
}                                     from "@/shared/lib/config/store-config";
import { getUsdToMxnRate }            from "@/shared/lib/currency/store-currency";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);
const MONEDAS = new Set<Moneda>(["MXN", "USD"]);

/** Longitud máxima por campo de texto, para no llenar la columna con basura. */
const MAX_LEN: Record<string, number> = {
  nombre: 100, descripcion: 200, logoUrl: 500, email: 200, telefono: 50,
};

const esColor = (v: string) => /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());

async function requireAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  const rol = (session?.user as { rol?: string } | undefined)?.rol ?? "";
  return !!session && ADMIN_ROLES.has(rol);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }
  const config = await getStoreConfig();
  const usdMxn = await getUsdToMxnRate();
  return NextResponse.json({ success: true, data: { ...config, usdMxn } });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const patch: Partial<StoreConfig> = {};

    // ── Texto ────────────────────────────────────────────────
    for (const campo of ["nombre", "descripcion", "logoUrl", "email", "telefono"] as const) {
      const v = body[campo];
      if (v === undefined) continue;
      if (typeof v !== "string") {
        return NextResponse.json({ success: false, error: `Campo inválido: ${campo}` }, { status: 400 });
      }
      if (v.length > MAX_LEN[campo]) {
        return NextResponse.json(
          { success: false, error: `${campo} excede ${MAX_LEN[campo]} caracteres` }, { status: 400 }
        );
      }
      patch[campo] = v.trim();
    }

    // El nombre rotula el panel: no se permite vaciarlo.
    if (patch.nombre !== undefined && patch.nombre === "") {
      return NextResponse.json(
        { success: false, error: "El nombre de la tienda no puede quedar vacío" }, { status: 400 }
      );
    }

    // ── Colores ──────────────────────────────────────────────
    for (const campo of ["colorPrimario", "colorAcento"] as const) {
      const v = body[campo];
      if (v === undefined) continue;
      if (typeof v !== "string" || !esColor(v)) {
        return NextResponse.json(
          { success: false, error: `${campo} debe ser hexadecimal, por ejemplo #1238a0` }, { status: 400 }
        );
      }
      patch[campo] = v.trim();
    }

    // ── Moneda ───────────────────────────────────────────────
    for (const campo of ["monedaCaptura", "monedaTienda"] as const) {
      const v = body[campo];
      if (v === undefined) continue;
      if (!MONEDAS.has(v as Moneda)) {
        return NextResponse.json({ success: false, error: `${campo} inválida` }, { status: 400 });
      }
      patch[campo] = v as Moneda;
    }

    await setStoreConfig(patch);
    const config = await getStoreConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err) {
    console.error("[PUT /api/admin/configuracion]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
