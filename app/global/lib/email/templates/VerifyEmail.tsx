// app/global/lib/email/templates/VerifyEmail.tsx
import * as React from "react";

interface VerifyEmailProps {
  nombre: string;
  verifyUrl: string;
}

export function VerifyEmail({ nombre, verifyUrl }: VerifyEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#0a0a0a"
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: "#0a0a0a" }}>
          <tr>
            <td align="center" style={{ padding: "40px 20px" }}>
              <table width="600" cellPadding="0" cellSpacing="0" style={{ 
                backgroundColor: "#111111",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                {/* Header */}
                <tr>
                  <td style={{ padding: "48px 40px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>
                    <div style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                      marginBottom: "8px"
                    }}>
                      CRAFTQUBE
                    </div>
                    <div style={{
                      fontSize: "11px",
                      color: "#666666",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: "monospace"
                    }}>
                      Verificación de Correo
                    </div>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: "48px 40px" }}>
                    <h1 style={{
                      margin: "0 0 24px 0",
                      fontSize: "28px",
                      fontWeight: "600",
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.3"
                    }}>
                      Verifica tu correo
                    </h1>
                    
                    <p style={{
                      margin: "0 0 24px 0",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      color: "#a3a3a3"
                    }}>
                      Hola {nombre},
                    </p>

                    <p style={{
                      margin: "0 0 32px 0",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      color: "#a3a3a3"
                    }}>
                      Haz clic en el botón de abajo para verificar tu dirección de correo electrónico y activar tu cuenta en Craftqube.
                    </p>

                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center">
                          <a href={verifyUrl} style={{
                            display: "inline-block",
                            padding: "14px 32px",
                            backgroundColor: "#ffffff",
                            color: "#0a0a0a",
                            textDecoration: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "600",
                            letterSpacing: "0.02em",
                            transition: "all 0.2s"
                          }}>
                            VERIFICAR CORREO
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style={{
                      margin: "32px 0 0 0",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: "#737373",
                      textAlign: "center"
                    }}>
                      O copia y pega este enlace en tu navegador:
                    </p>
                    
                    <p style={{
                      margin: "8px 0 0 0",
                      fontSize: "12px",
                      lineHeight: "1.5",
                      color: "#525252",
                      wordBreak: "break-all",
                      textAlign: "center",
                      fontFamily: "monospace"
                    }}>
                      {verifyUrl}
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ 
                    padding: "32px 40px",
                    borderTop: "1px solid #1a1a1a",
                    backgroundColor: "#0a0a0a"
                  }}>
                    <p style={{
                      margin: "0 0 12px 0",
                      fontSize: "13px",
                      color: "#666666",
                      lineHeight: "1.5"
                    }}>
                      Este enlace expira en 24 horas.
                    </p>
                    
                    <p style={{
                      margin: "0",
                      fontSize: "12px",
                      color: "#525252",
                      lineHeight: "1.5"
                    }}>
                      Si no solicitaste esta verificación, puedes ignorar este correo.
                    </p>
                  </td>
                </tr>
              </table>

              {/* Legal */}
              <table width="600" cellPadding="0" cellSpacing="0" style={{ marginTop: "24px" }}>
                <tr>
                  <td style={{ textAlign: "center" }}>
                    <p style={{
                      margin: "0",
                      fontSize: "11px",
                      color: "#404040",
                      lineHeight: "1.5"
                    }}>
                      © {new Date().getFullYear()} Craftqube. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}