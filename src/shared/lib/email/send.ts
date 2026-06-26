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
   Logo optimizado para email
   
   Reglas:
   - Display en HTML:  width="140"  (lo que el usuario ve)
   - Archivo fuente:   280px ancho  (2× para pantallas retina)
   - Formato:          WebP         (60-80% más ligero que PNG)
   - Objetivo:         < 10 KB
   - Cache:            en memoria tras la primera llamada
─────────────────────────────────────────────────────────────── */
type LogoAttachment = { content: string; filename: string; contentId: string };

let _logoCache: LogoAttachment | null | undefined = undefined;

async function getLogoAttachment(): Promise<LogoAttachment | null> {
  if (_logoCache !== undefined) return _logoCache;

  try {
    const logoPath = path.join(process.cwd(), "public", "logo_email.png");
    const raw      = fs.readFileSync(logoPath);
    const rawKB    = Math.round(raw.length / 1024);

    try {
      const sharp = (await import("sharp")).default;

      const buffer = await sharp(raw)
        .resize({
          width:              280,         // 2× el display de 140px → retina
          withoutEnlargement: true,        // no agrandar si el original es menor
        })
        .webp({
          quality:    82,                  // buen balance calidad/peso para logos
          lossless:   false,
          smartSubsample: true,
        })
        .toBuffer();

      const finalKB = Math.round(buffer.length / 1024);
      console.log(`[email] Logo: ${rawKB}KB PNG → ${finalKB}KB WebP (280px)`);

      _logoCache = {
        content:   buffer.toString("base64"),
        filename:  "Logo.webp",
        contentId: "craftqube-logo",
      };

    } catch {
      // sharp no disponible — fallback a PNG sin transformar
      console.warn(`[email] sharp no disponible, usando logo original (${rawKB}KB)`);
      _logoCache = {
        content:   raw.toString("base64"),
        filename:  "Logo.png",
        contentId: "craftqube-logo",
      };
    }

    return _logoCache;

  } catch {
    console.warn("[email] No se pudo leer public/Logo.png — el logo no aparecerá");
    _logoCache = null;
    return null;
  }
}

/* ── Welcome ───────────────────────────────────────────────── */
export async function sendWelcomeEmail(
  to:          string,
  nombre:      string,
  verifyToken: string
): Promise<EmailResult> {
  try {
    const verifyUrl = `${BASE_URL}/verificar?token=${verifyToken}`;
    const logo      = await getLogoAttachment();
    const html      = await render(React.createElement(WelcomeEmail, { nombre, verifyUrl }));

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

/* ── Reenvío de verificación ───────────────────────────────── */
export async function sendVerificationEmail(
  to:          string,
  nombre:      string,
  verifyToken: string
): Promise<EmailResult> {
  try {
    const verifyUrl = `${BASE_URL}/verificar?token=${verifyToken}`;
    const logo      = await getLogoAttachment();
    const html      = await render(React.createElement(VerifyEmail, { nombre, verifyUrl }));

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

/* ── Reset de contraseña ───────────────────────────────────── */
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

/* ── Confirmación de pedido ────────────────────────────────── */
export async function sendOrderConfirmationEmail(
  to:   string,
  data: OrderConfirmationProps
): Promise<EmailResult> {
  try {
    const logo = await getLogoAttachment();
    const html = await render(React.createElement(OrderConfirmationEmail, data));

    const subjectMetodo =
      data.metodo === "transferencia" ? "Datos de transferencia SPEI" :
      data.metodo === "oxxo"          ? "Código de pago OXXO"         :
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