// app/api/exchange-rate/route.ts
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const res  = await fetch("https://open.er-api.com/v6/latest/MXN", { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.result !== "success") throw new Error("API error");

    return NextResponse.json({ usd: data.rates.USD });
  } catch {
    return NextResponse.json({ usd: 0.052 });
  }
}