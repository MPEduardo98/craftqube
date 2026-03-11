// app/global/lib/email/send.ts
import { resend, FROM_EMAIL, BASE_URL } from "./resend";
import { WelcomeEmail }                 from "./templates/WelcomeEmail";
import { VerifyEmail }                  from "./templates/VerifyEmail";
import { ResetPasswordEmail }           from "./templates/ResetPasswordEmail";
import { OrderConfirmationEmail }       from "./templates/OrderConfirmationEmail";
import type { OrderConfirmationProps }  from "./templates/OrderConfirmationEmail";
import { render }                       from "@react-email/components";
import React                            from "react";
import fs                               from "fs";
import path                             from "path";

interface EmailResult {
  success: boolean;
  error?:  string;
}

/* ─────────────────────────────────────────────────────────────
   Logo optimizado — se cachea en memoria tras la primera llamada
───────────────────────────────────────────────────────────── */
let _logoCache: string | null | undefined = undefined;

async function getLogoAttachment(): Promise<{ content: string; filename: string; contentId: string } | null> {
  if (_logoCache !== undefined) {
    return _logoCache
      ? { content: _logoCache, filename: "Logo.png", contentId: "craftqube-logo" }
      : null;
  }

  try {
    const logoPath = path.join(process.cwd(), "public", "Logo.png");
    const raw      = fs.readFileSync(logoPath);

    try {
      const sharp     = (await import("sharp")).default;
      const optimized = await sharp(raw)
        .resize({ width: 300, withoutEnlargement: true })
        .png({ compressionLevel: 9, quality: 80 })
        .toBuffer();

      console.log(`[email] Logo: ${Math.round(raw.length / 1024)}KB → ${Math.round(optimized.length / 1024)}KB`);
      _logoCache = optimized.toString("base64");
    } catch {
      console.warn("[email] sharp no disponible, usando logo sin optimizar");
      _logoCache = raw.toString("base64");
    }

    return { content: _logoCache, filename: "Logo.png", contentId: "craftqube-logo" };
  } catch {
    console.warn("[email] No se pudo leer public/Logo.png — el logo no aparecerá");
    _logoCache = null;
    return null;
  }
}

/* ── Welcome ───────────────────────────────────────────── */
export async function sendWelcomeEmail(
  to:          string,
  nombre:      string,
  verifyToken: string
): Promise<EmailResult> {
  try {
    const verifyUrl  = `${BASE_URL}/verificar?token=${verifyToken}`;
    const logo       = await getLogoAttachment();
    const html       = await render(React.createElement(WelcomeEmail, { nombre, verifyUrl }));

    await resend.emails.send({
      from:        FROM_EMAIL,
      to,
      subject:     "¡Bienvenido a Craftqube! Verifica tu correo",
      html,
      attachments: logo ? [logo] : [],
    });

    return { success: true };
  } catch (error) {
    console.error("[sendWelcomeEmail]", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al enviar email" };
  }
}

/* ── Reenvío de verificación ───────────────────────────── */
export async function sendVerificationEmail(
  to:          string,
  nombre:      string,
  verifyToken: string
): Promise<EmailResult> {
  try {
    const verifyUrl  = `${BASE_URL}/verificar?token=${verifyToken}`;
    const logo       = await getLogoAttachment();
    const html       = await render(React.createElement(VerifyEmail, { nombre, verifyUrl }));

    await resend.emails.send({
      from:        FROM_EMAIL,
      to,
      subject:     "Verifica tu correo — Craftqube",
      html,
      attachments: logo ? [logo] : [],
    });

    return { success: true };
  } catch (error) {
    console.error("[sendVerificationEmail]", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al enviar email" };
  }
}

/* ── Reset de contraseña ───────────────────────────────── */
export async function sendPasswordResetEmail(
  to:         string,
  nombre:     string,
  resetToken: string
): Promise<EmailResult> {
  try {
    const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;
    const logo     = await getLogoAttachment();
    const html     = await render(React.createElement(ResetPasswordEmail, { nombre, resetUrl }));

    await resend.emails.send({
      from:        FROM_EMAIL,
      to,
      subject:     "Restablece tu contraseña — Craftqube",
      html,
      attachments: logo ? [logo] : [],
    });

    return { success: true };
  } catch (error) {
    console.error("[sendPasswordResetEmail]", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al enviar email" };
  }
}

/* ── Confirmación de pedido ────────────────────────────── */
export async function sendOrderConfirmationEmail(
  to:   string,
  data: OrderConfirmationProps
): Promise<EmailResult> {
  try {
    const logo = await getLogoAttachment();
    const html = await render(React.createElement(OrderConfirmationEmail, data));

    const subjectMetodo =
      data.metodo === "transferencia" ? "Datos de transferencia SPEI" :
      data.metodo === "oxxo"          ? "Código de pago OXXO" :
      "Pedido confirmado";

    await resend.emails.send({
      from:        FROM_EMAIL,
      to,
      subject:     `${subjectMetodo} — Pedido ${data.orderNumber} · Craftqube`,
      html,
      attachments: logo ? [logo] : [],
    });

    return { success: true };
  } catch (error) {
    console.error("[sendOrderConfirmationEmail]", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al enviar email" };
  }
}