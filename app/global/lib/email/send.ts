// app/global/lib/email/send.ts
import { resend, FROM_EMAIL, BASE_URL } from "./resend";
import { WelcomeEmail } from "./templates/WelcomeEmail";
import { VerifyEmail } from "./templates/VerifyEmail";
import { render } from "@react-email/components";
import React from "react";

/**
 * Envía email de bienvenida con link de verificación
 */
export async function sendWelcomeEmail(
  to: string,
  nombre: string,
  verifyToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const verifyUrl = `${BASE_URL}/verificar?token=${verifyToken}`;
    
    const html = await render(
      React.createElement(WelcomeEmail, { nombre, verifyUrl })
    );
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "¡Bienvenido a Craftqube! Verifica tu correo",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("[sendWelcomeEmail] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al enviar email" 
    };
  }
}

/**
 * Envía email de verificación standalone (reenvío)
 */
export async function sendVerificationEmail(
  to: string,
  nombre: string,
  verifyToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const verifyUrl = `${BASE_URL}/verificar?token=${verifyToken}`;
    
    const html = await render(
      React.createElement(VerifyEmail, { nombre, verifyUrl })
    );
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Verifica tu correo - Craftqube",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("[sendVerificationEmail] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al enviar email" 
    };
  }
}