// app/api/paypal/create-order/route.ts
import { NextResponse } from "next/server";

const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("PayPal auth failed");
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { amount, currency = "MXN" } = await req.json();

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization:       `Bearer ${accessToken}`,
        "Content-Type":      "application/json",
        "PayPal-Request-Id": `cq-order-${Date.now()}`,
        /* Requerido para Hosted Fields / Advanced Card Payments */
        Prefer:              "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value:         Number(amount).toFixed(2),
            },
          },
        ],
        /* Habilita Advanced Card Payments (campos propios) */
        payment_source: {
          card: {
            attributes: {
              verification: { method: "SCA_WHEN_REQUIRED" },
            },
          },
        },
      }),
    });

    const order = await res.json();

    if (!res.ok) {
      console.error("[PayPal] create-order error:", order);
      return NextResponse.json(
        { error: order?.message ?? "Failed to create order" },
        { status: res.status }
      );
    }

    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("[PayPal] create-order exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}