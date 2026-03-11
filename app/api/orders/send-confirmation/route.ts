// app/api/orders/send-confirmation/route.ts
import { NextResponse }               from "next/server";
import { sendOrderConfirmationEmail } from "@/app/global/lib/email/send";
import type { CartItem }              from "@/app/global/types/cart";

interface EnvioPayload {
  calle:        string;
  numeroExt:    string;
  numeroInt?:   string;
  colonia:      string;
  ciudad:       string;
  municipio?:   string;
  estado:       string;
  codigoPostal: string;
  pais:         string;
}

interface RequestBody {
  orderNumber: string;
  email:       string;
  nombre:      string;
  total:       number;
  items:       CartItem[];
  envio:       EnvioPayload;
  metodo:      "tarjeta" | "transferencia" | "oxxo";
  spei?: {
    clabe:                 string | null;
    banco:                 string;
    referencia:            string | null;
    monto:                 number;
    hostedInstructionsUrl: string | null;
  };
  oxxo?: {
    numero:           string;
    expira:           number;
    hostedVoucherUrl: string | null;
  };
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { email, orderNumber, nombre, total, items, envio, metodo, spei, oxxo } = body;

    if (!email || !orderNumber || !nombre || !total || !items?.length || !envio || !metodo) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const result = await sendOrderConfirmationEmail(email, {
      orderNumber,
      nombre,
      email,
      total,
      items,
      envio,
      metodo,
      spei,
      oxxo,
    });

    if (!result.success) {
      console.error("[send-confirmation] Resend error:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno";
    console.error("[send-confirmation]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}