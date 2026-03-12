// app/global/lib/email/templates/EmailBase.tsx
import React from "react";

/* ── Botón CTA ─────────────────────────────────────────────── */
interface ButtonProps {
  href:  string;
  label: string;
}

export function EmailButton({ href, label }: ButtonProps) {
  return (
    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ marginBottom: "36px" }}>
      <tr>
        <td align="center">
          <a
            href={href}
            style={{
              display:         "inline-block",
              padding:         "15px 40px",
              backgroundColor: "#1D4ED8",
              color:           "#ffffff",
              textDecoration:  "none",
              borderRadius:    "10px",
              fontSize:        "13px",
              fontWeight:      700,
              letterSpacing:   "0.1em",
              textTransform:   "uppercase",
              fontFamily:      "'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {label}
          </a>
        </td>
      </tr>
    </table>
  );
}

/* ── Base ──────────────────────────────────────────────────── */
interface Props {
  subtitulo:  string;
  titulo:     string;
  footerText: string;
  children:   React.ReactNode;
}

export function EmailBase({ subtitulo, titulo, footerText, children }: Props) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{titulo} — Craftqube</title>
        <style>{`body { margin: 0; padding: 0; } img { border: 0; display: block; }`}</style>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f1f5f9", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
          <tr>
            <td align="center" style={{ padding: "48px 16px" }}>

              <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ maxWidth: "540px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

                {/* Header */}
                <tr>
                  <td align="center" style={{ backgroundColor: "#1638c8", padding: "36px 40px 32px", textAlign: "center" }}>
                    <img src="cid:craftqube-logo" alt="Craftqube" width="140" style={{ display: "block", margin: "0 auto 24px auto", maxWidth: "140px", height: "auto" }} />
                    <p style={{ margin: "0 0 6px 0", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontWeight: 500, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                      {subtitulo}
                    </p>
                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.01em", lineHeight: 1.2, textTransform: "uppercase", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                      {titulo}
                    </h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: "40px 40px 32px", backgroundColor: "#ffffff" }}>
                    {children}
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td align="center" style={{ padding: "22px 40px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", textAlign: "center" }}>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#94a3b8", lineHeight: 1.6, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                      {footerText}
                    </p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#cbd5e1", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                      © {new Date().getFullYear()} Craftqube · Todos los derechos reservados
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