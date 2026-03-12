// app/global/lib/email/templates/VerifyEmail.tsx
import { EmailBase, EmailButton } from "./EmailBase";

interface Props {
  nombre:    string;
  verifyUrl: string;
}

export function VerifyEmail({ nombre, verifyUrl }: Props) {
  return (
    <EmailBase
      subtitulo="Verificación de cuenta"
      titulo="Verifica tu correo"
      footerText="Recibiste este correo porque alguien solicitó verificar esta dirección en Craftqube."
    >
      {/* Saludo */}
      <p style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#1e293b", lineHeight: 1.6, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        Hola, <strong style={{ color: "#0f172a" }}>{nombre}</strong>
      </p>
      <p style={{ margin: "0 0 32px 0", fontSize: "15px", color: "#475569", lineHeight: 1.7, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        Haz clic en el botón de abajo para verificar tu dirección de correo
        y activar tu cuenta en Craftqube.
      </p>

      {/* CTA email-safe */}
      <EmailButton href={verifyUrl} label="Verificar correo →" />

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 28px 0" }} />

      {/* Info */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "28px" }}>
        <tr>
          <td
            bgcolor="#f8fafc"
            style={{
              padding:         "14px 16px",
              backgroundColor: "#f8fafc",
              borderRadius:    "8px",
              borderLeft:      "3px solid #2563EB",
            }}
          >
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#475569", lineHeight: 1.6, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              Este enlace expira en <strong style={{ color: "#1e293b" }}>24 horas.</strong>
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.6, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              Si no solicitaste esta verificación, puedes ignorar este correo de forma segura.
            </p>
          </td>
        </tr>
      </table>

      {/* URL fallback */}
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td
            bgcolor="#f8fafc"
            style={{
              padding:         "16px 18px",
              backgroundColor: "#f8fafc",
              border:          "1px solid #e2e8f0",
              borderRadius:    "10px",
            }}
          >
            <p style={{ margin: "0 0 6px 0", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              O copia este enlace en tu navegador
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#2563EB", wordBreak: "break-all", fontFamily: "monospace", lineHeight: 1.6 }}>
              {verifyUrl}
            </p>
          </td>
        </tr>
      </table>
    </EmailBase>
  );
}