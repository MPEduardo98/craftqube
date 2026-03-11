// app/global/lib/email/templates/EmailBase.tsx

interface Props {
  /** Subtítulo pequeño sobre el h1 (ej: "Seguridad de cuenta") */
  subtitulo:  string;
  /** Título principal del header (ej: "Restablecer contraseña") */
  titulo:     string;
  /** Texto del footer inferior */
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
      </head>
      <body style={{
        margin: 0, padding: 0,
        backgroundColor: "#f1f5f9",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        WebkitTextSizeAdjust: "100%",
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          style={{ backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
          <tr>
            <td align="center" style={{ padding: "48px 16px" }}>

              {/* ── Card ── */}
              <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                style={{
                  maxWidth: "540px",
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}>

                {/* ── Header azul ── */}
                <tr>
                  <td style={{
                    background: "linear-gradient(135deg, #0f2394 0%, #1638c8 60%, #2563EB 100%)",
                    padding: "36px 40px 32px",
                    textAlign: "center",
                  }}>
                    <img
                      src="cid:craftqube-logo"
                      alt="Craftqube"
                      width="150"
                      style={{ display: "block", margin: "0 auto 28px auto", maxWidth: "150px", height: "auto" }}
                    />
                    <p style={{
                      margin: "0 0 6px 0",
                      fontSize: "10px", letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.55)", fontWeight: 500,
                    }}>
                      {subtitulo}
                    </p>
                    <h1 style={{
                      margin: 0, fontSize: "22px", fontWeight: 800,
                      color: "#ffffff", letterSpacing: "0.01em", lineHeight: 1.2,
                      textTransform: "uppercase",
                    }}>
                      {titulo}
                    </h1>
                  </td>
                </tr>

                {/* ── Body (contenido dinámico) ── */}
                <tr>
                  <td style={{ padding: "40px 40px 32px", backgroundColor: "#ffffff" }}>
                    {children}
                  </td>
                </tr>

                {/* ── Footer ── */}
                <tr>
                  <td style={{
                    padding: "22px 40px",
                    borderTop: "1px solid #f1f5f9",
                    backgroundColor: "#f8fafc",
                    textAlign: "center",
                  }}>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                      {footerText}
                    </p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#cbd5e1" }}>
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