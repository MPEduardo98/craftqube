// app/global/lib/email/resend.ts
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY no está configurada");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@craftqube.com";
export const BASE_URL   = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";