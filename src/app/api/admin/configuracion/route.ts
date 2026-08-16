// app/api/admin/configuracion/route.ts
// ─────────────────────────────────────────────────────────────
// GET/PUT de la configuración global de la tienda (moneda, …).
// Protegido por rol admin (Better Auth), igual que el panel.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { headers }                   from "next/headers";
import { auth }                       from "@/features/auth/lib/auth";
import {
  getStoreConfig, setStoreConfig, type Moneda,
}                                     from "@/shared/lib/config/store-config";
import { getUsdToMxnRate }            from "@/shared/lib/currency/store-currency";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);
const MONEDAS = new Set<Moneda>(["MXN", "USD"]);

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
    const monedaCaptura = body.monedaCaptura as Moneda | undefined;
    const monedaTienda  = body.monedaTienda  as Moneda | undefined;

    if (monedaCaptura && !MONEDAS.has(monedaCaptura)) {
      return NextResponse.json({ success: false, error: "Moneda de captura inválida" }, { status: 400 });
    }
    if (monedaTienda && !MONEDAS.has(monedaTienda)) {
      return NextResponse.json({ success: false, error: "Moneda de tienda inválida" }, { status: 400 });
    }

    await setStoreConfig({ monedaCaptura, monedaTienda });
    const config = await getStoreConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err) {
    console.error("[PUT /api/admin/configuracion]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
