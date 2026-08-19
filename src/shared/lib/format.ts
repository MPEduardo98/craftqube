// app/global/lib/format.ts

export function formatPrice(n: number, currency: "MXN" | "USD" = "MXN"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style:                 "currency",
      currency:              "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n * 0.052) + " USD";
  }
  return new Intl.NumberFormat("es-MX", {
    style:                 "currency",
    currency:              "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + " MXN";
}

/**
 * Formatea un monto que YA está en la moneda indicada.
 *
 * A diferencia de `formatPrice`, no aplica ninguna conversión: se usa
 * para los importes que vienen calculados del servidor (totales de
 * pedido, cobros de Stripe), donde convertir otra vez mostraría una
 * cifra distinta a la que se cobra.
 */
export function formatMoneda(n: number, moneda: string = "MXN"): string {
  const codigo = moneda.toUpperCase() === "USD" ? "USD" : "MXN";
  return new Intl.NumberFormat(codigo === "USD" ? "en-US" : "es-MX", {
    style:                 "currency",
    currency:              codigo,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ` ${codigo}`;
}
