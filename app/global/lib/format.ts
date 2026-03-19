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