// app/global/lib/email/templates/OrderConfirmationEmail.tsx
import { EmailBase } from "./EmailBase";
import type { CartItem } from "@/app/global/types/cart";

export interface OrderConfirmationProps {
  orderNumber: string;
  nombre:      string;
  email:       string;
  total:       number;
  items:       CartItem[];
  envio: {
    calle:       string;
    numeroExt:   string;
    numeroInt?:  string;
    colonia:     string;
    ciudad:      string;
    municipio?:  string;
    estado:      string;
    codigoPostal:string;
    pais:        string;
  };
  metodo: "tarjeta" | "transferencia" | "oxxo";
  spei?: {
    clabe:                 string | null;
    banco:                 string;
    referencia:            string | null;
    monto:                 number;
    hostedInstructionsUrl: string | null;
  };
  oxxo?: {
    numero:           string;
    expira:           number; // unix timestamp
    hostedVoucherUrl: string | null;
  };
}

function fmt(n: number) {
  return (
    new Intl.NumberFormat("es-MX", {
      style: "currency", currency: "MXN", maximumFractionDigits: 0,
    }).format(n) + " MXN"
  );
}

function fmtFecha(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/* ── Sección de método de pago ─────────────────────────── */
function PagoTarjeta() {
  return (
    <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 28 }}>
      <tr>
        <td style={{
          padding: "16px 18px",
          backgroundColor: "#f0fdf4",
          borderRadius: 10,
          borderLeft: "3px solid #22c55e",
        }}>
          <p style={{ margin: "0 0 6px 0", fontSize: 13, fontWeight: 700, color: "#15803d" }}>
            ✓ Pago procesado con tarjeta
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
            Tu pago fue autorizado exitosamente. Te notificaremos por correo cuando tu pedido sea enviado.
          </p>
        </td>
      </tr>
    </table>
  );
}

function PagoSpei({ spei }: { spei: NonNullable<OrderConfirmationProps["spei"]> }) {
  return (
    <>
      {/* Instrucciones */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 16 }}>
        <tr>
          <td style={{
            padding: "14px 16px",
            backgroundColor: "#eff6ff",
            borderRadius: 10,
            borderLeft: "3px solid #2563EB",
          }}>
            <p style={{ margin: "0 0 6px 0", fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
              Realiza tu transferencia SPEI
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
              Tu pedido se confirmará <strong>automáticamente</strong> al recibir el pago.
              El monto debe ser exacto.
            </p>
          </td>
        </tr>
      </table>

      {/* Datos de transferencia */}
      <table width="100%" cellPadding="0" cellSpacing="0"
        style={{ marginBottom: 16, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <tr style={{ backgroundColor: "#f8fafc" }}>
          <td style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 2px 0", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>
              CLABE interbancaria
            </p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "monospace", letterSpacing: "0.06em" }}>
              {spei.clabe ?? "—"}
            </p>
          </td>
        </tr>
        <tr style={{ backgroundColor: "#ffffff" }}>
          <td style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 2px 0", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>
              Banco
            </p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
              {spei.banco}
            </p>
          </td>
        </tr>
        {spei.referencia && (
          <tr style={{ backgroundColor: "#f8fafc" }}>
            <td style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 2px 0", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>
                Referencia
              </p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1e293b", fontFamily: "monospace" }}>
                {spei.referencia}
              </p>
            </td>
          </tr>
        )}
        <tr style={{ backgroundColor: "#ffffff" }}>
          <td style={{ padding: "10px 16px" }}>
            <p style={{ margin: "0 0 2px 0", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>
              Monto exacto a transferir
            </p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#2563EB" }}>
              {fmt(spei.monto)}
            </p>
          </td>
        </tr>
      </table>

      {spei.hostedInstructionsUrl && (
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 16 }}>
          <tr>
            <td align="center">
              <a href={spei.hostedInstructionsUrl} style={{
                display: "inline-block", padding: "11px 28px",
                background: "#2563EB", color: "#ffffff",
                textDecoration: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 600,
              }}>
                Ver instrucciones completas →
              </a>
            </td>
          </tr>
        </table>
      )}

      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 28 }}>
        <tr>
          <td style={{ padding: "12px 14px", backgroundColor: "#fff7ed", borderRadius: 8, borderLeft: "3px solid #f97316" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#9a3412", lineHeight: 1.6 }}>
              ⚠️ Transfiere el monto <strong>exacto</strong>. Diferencias en centavos pueden retrasar la confirmación de tu pedido.
            </p>
          </td>
        </tr>
      </table>
    </>
  );
}

function PagoOxxo({ oxxo }: { oxxo: NonNullable<OrderConfirmationProps["oxxo"]> }) {
  return (
    <>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 16 }}>
        <tr>
          <td style={{
            padding: "14px 16px",
            backgroundColor: "#eff6ff",
            borderRadius: 10,
            borderLeft: "3px solid #2563EB",
          }}>
            <p style={{ margin: "0 0 6px 0", fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
              Paga en cualquier sucursal OXXO
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
              Muestra el código de referencia en caja. Tu pedido se confirmará cuando el pago sea procesado.
            </p>
          </td>
        </tr>
      </table>

      {/* Código de referencia */}
      <table width="100%" cellPadding="0" cellSpacing="0"
        style={{ marginBottom: 16, borderRadius: 10, border: "1px solid #e2e8f0" }}>
        <tr style={{ backgroundColor: "#f8fafc" }}>
          <td align="center" style={{ padding: "20px 16px" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>
              Número de referencia OXXO
            </p>
            <p style={{ margin: "0 0 4px 0", fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "monospace", letterSpacing: "0.1em" }}>
              {oxxo.numero}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
              Válido hasta: {fmtFecha(oxxo.expira)}
            </p>
          </td>
        </tr>
      </table>

      {oxxo.hostedVoucherUrl && (
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 16 }}>
          <tr>
            <td align="center">
              <a href={oxxo.hostedVoucherUrl} style={{
                display: "inline-block", padding: "11px 28px",
                background: "#2563EB", color: "#ffffff",
                textDecoration: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 600,
              }}>
                Ver / descargar voucher →
              </a>
            </td>
          </tr>
        </table>
      )}

      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 28 }}>
        <tr>
          <td style={{ padding: "12px 14px", backgroundColor: "#fff7ed", borderRadius: 8, borderLeft: "3px solid #f97316" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#9a3412", lineHeight: 1.6 }}>
              ⚠️ Este código expira el <strong>{fmtFecha(oxxo.expira)}</strong>. Después de esa fecha el pedido será cancelado automáticamente.
            </p>
          </td>
        </tr>
      </table>
    </>
  );
}

/* ── Template principal ────────────────────────────────── */
export function OrderConfirmationEmail({
  orderNumber, nombre, total, items, envio, metodo, spei, oxxo,
}: OrderConfirmationProps) {

  const metodoSubtitulo =
    metodo === "tarjeta"       ? "Pago con tarjeta" :
    metodo === "transferencia" ? "Transferencia SPEI" :
    "Pago OXXO";

  return (
    <EmailBase
      subtitulo={metodoSubtitulo}
      titulo="Confirmación de pedido"
      footerText="Recibiste este correo porque realizaste una compra en Craftqube. Si no fuiste tú, contáctanos de inmediato."
    >
      {/* Saludo */}
      <p style={{ margin: "0 0 6px 0", fontSize: 16, color: "#1e293b", lineHeight: 1.6 }}>
        Hola, <strong style={{ color: "#0f172a" }}>{nombre}</strong>
      </p>
      <p style={{ margin: "0 0 28px 0", fontSize: 15, color: "#475569", lineHeight: 1.7 }}>
        Recibimos tu pedido y está siendo procesado. A continuación encontrarás todos los detalles.
      </p>

      {/* Número de pedido */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 28 }}>
        <tr>
          <td align="center" style={{ padding: "18px 20px", backgroundColor: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>
              Número de pedido
            </p>
            <p style={{ margin: "0 0 4px 0", fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              {orderNumber}
            </p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#2563EB" }}>
              {fmt(total)}
            </p>
          </td>
        </tr>
      </table>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 28px 0" }} />

      {/* ── Sección de pago ── */}
      <p style={{ margin: "0 0 14px 0", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
        Instrucciones de pago
      </p>

      {metodo === "tarjeta"       && <PagoTarjeta />}
      {metodo === "transferencia" && spei && <PagoSpei spei={spei} />}
      {metodo === "oxxo"          && oxxo && <PagoOxxo oxxo={oxxo} />}

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 28px 0" }} />

      {/* ── Productos ── */}
      <p style={{ margin: "0 0 14px 0", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
        Resumen del pedido
      </p>

      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        {items.map((item, i) => (
          <tr key={item.varianteId} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff" }}>
            <td style={{ padding: "12px 16px", borderBottom: i < items.length - 1 ? "1px solid #e2e8f0" : "none" }}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td>
                    <p style={{ margin: "0 0 2px 0", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                      {item.titulo}
                    </p>
                    {item.atributos.length > 0 && (
                      <p style={{ margin: "0 0 2px 0", fontSize: 11, color: "#64748b" }}>
                        {item.atributos.map((a) => `${a.atributo}: ${a.valor}`).join(" · ")}
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                      SKU: {item.sku} · Qty: {item.cantidad}
                    </p>
                  </td>
                  <td align="right" style={{ whiteSpace: "nowrap", paddingLeft: 12 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      {fmt(item.precio * item.cantidad)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        ))}

        {/* Total */}
        <tr style={{ backgroundColor: "#eff6ff" }}>
          <td style={{ padding: "14px 16px" }}>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Total</p>
                </td>
                <td align="right">
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#2563EB" }}>
                    {fmt(total)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "28px 0" }} />

      {/* ── Dirección de envío ── */}
      <p style={{ margin: "0 0 14px 0", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
        Dirección de envío
      </p>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 28 }}>
        <tr>
          <td style={{ padding: "14px 16px", backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
              {envio.calle} {envio.numeroExt}{envio.numeroInt ? ` Int. ${envio.numeroInt}` : ""}<br />
              {envio.colonia}{envio.municipio ? `, ${envio.municipio}` : ""}<br />
              {envio.ciudad}, {envio.estado}, C.P. {envio.codigoPostal}<br />
              {envio.pais}
            </p>
          </td>
        </tr>
      </table>
    </EmailBase>
  );
}