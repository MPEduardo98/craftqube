// app/api/paypal/capture-order/route.ts
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
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `cq-cap-${Date.now()}`,
      },
    });

    const capture = await res.json();

    if (!res.ok) {
      console.error("[PayPal] capture-order error:", capture);
      return NextResponse.json(
        { error: capture?.message ?? "Failed to capture order" },
        { status: res.status }
      );
    }

    const captureUnit = capture?.purchase_units?.[0]?.payments?.captures?.[0];
    const status = captureUnit?.status ?? capture.status;

    if (status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Unexpected capture status: ${status}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderID: capture.id,
      captureID: captureUnit?.id,
      status,
    });
  } catch (err) {
    console.error("[PayPal] capture-order exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}