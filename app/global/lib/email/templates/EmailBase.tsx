// app/global/lib/email/templates/EmailBase.tsx
// ─────────────────────────────────────────────────────────────
// Base de todos los correos transaccionales de Craftqube.
//
// Reglas HTML email que aplica este archivo:
//   - bgcolor en <td> (no background CSS) para fondos sólidos
//   - Tablas anidadas para el botón CTA (email-safe button)
//   - Sin gradientes CSS (Outlook los ignora, usa color sólido)
//   - Imágenes con width explícito y alt text
// ─────────────────────────────────────────────────────────────

interface ButtonProps {
  href:  string;
  label: string;
}

/** Botón CTA email-safe. Usa tabla con bgcolor en lugar de CSS background. */
export function EmailButton({ href, label }: ButtonProps) {
  return (
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      style={{ marginBottom: "36px" }}
    >
      <tr>
        <td align="center">
          <table cellPadding="0" cellSpacing="0" role="presentation">
            <tr>
              <td
                align="center"
                bgcolor="#1D4ED8"
                style={{
                  borderRadius:    "10px",
                  backgroundColor: "#1D4ED8",
                }}
              >
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
                    // Fuerza el color blanco incluso si el cliente
                    // sobreescribe colores de links
                    WebkitTextFillColor: "#ffffff",
                  }}
                >
                  {label}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
}

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
        <meta name="x-apple-disable-message-reformatting" />
        <title>{titulo} — Craftqube</title>
        <style>{`
          body { margin: 0; padding: 0; }
          img  { border: 0; display: block; }
          a    { color: #2563EB; }
        `}</style>
      </head>
      <body style={{
        margin:                0,
        padding:               0,
        backgroundColor:       "#f1f5f9",
        fontFamily:            "'Helvetica Neue', Arial, sans-serif",
        WebkitTextSizeAdjust:  "100%",
        MozTextSizeAdjust:     "100%",
        msTextSizeAdjust:      "100%",
      }}>

        {/* ── Wrapper externo ── */}
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          role="presentation"
          bgcolor="#f1f5f9"
          style={{ backgroundColor: "#f1f5f9", minHeight: "100vh" }}
        >
          <tr>
            <td align="center" style={{ padding: "48px 16px" }}>

              {/* ── Card contenedor ── */}
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
                style={{
                  maxWidth:        "540px",
                  borderRadius:    "16px",
                  overflow:        "hidden",
                  boxShadow:       "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >

                {/* ══════════════════════════════
                    HEADER AZUL
                    bgcolor en el td es la única
                    forma confiable en todos los
                    clientes de correo
                ══════════════════════════════ */}
                <tr>
                  <td
                    align="center"
                    bgcolor="#1638c8"
                    style={{
                      backgroundColor: "#1638c8",
                      padding:         "36px 40px 32px",
                      textAlign:       "center",
                    }}
                  >
                    {/* Logo */}
                    <img
                      src="cid:craftqube-logo"
                      alt="Craftqube"
                      width="140"
                      style={{
                        display:   "block",
                        margin:    "0 auto 24px auto",
                        maxWidth:  "140px",
                        height:    "auto",
                      }}
                    />

                    {/* Subtítulo */}
                    <p style={{
                      margin:         "0 0 6px 0",
                      fontSize:       "10px",
                      letterSpacing:  "0.25em",
                      textTransform:  "uppercase",
                      color:          "rgba(255,255,255,0.6)",
                      fontWeight:     500,
                      fontFamily:     "'Helvetica Neue', Arial, sans-serif",
                    }}>
                      {subtitulo}
                    </p>

                    {/* Título principal */}
                    <h1 style={{
                      margin:        0,
                      fontSize:      "24px",
                      fontWeight:    800,
                      color:         "#ffffff",
                      letterSpacing: "0.01em",
                      lineHeight:    1.2,
                      textTransform: "uppercase",
                      fontFamily:    "'Helvetica Neue', Arial, sans-serif",
                    }}>
                      {titulo}
                    </h1>
                  </td>
                </tr>

                {/* ══════════════════════════════
                    CUERPO — contenido dinámico
                ══════════════════════════════ */}
                <tr>
                  <td
                    bgcolor="#ffffff"
                    style={{
                      padding:         "40px 40px 32px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {children}
                  </td>
                </tr>

                {/* ══════════════════════════════
                    FOOTER
                ══════════════════════════════ */}
                <tr>
                  <td
                    bgcolor="#f8fafc"
                    align="center"
                    style={{
                      padding:         "22px 40px",
                      borderTop:       "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                      textAlign:       "center",
                    }}
                  >
                    <p style={{
                      margin:     "0 0 5px 0",
                      fontSize:   "12px",
                      color:      "#94a3b8",
                      lineHeight: 1.6,
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    }}>
                      {footerText}
                    </p>
                    <p style={{
                      margin:     0,
                      fontSize:   "11px",
                      color:      "#cbd5e1",
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    }}>
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