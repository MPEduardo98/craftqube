// app/global/lib/format.ts

export function formatPrice(n: number): string {
  return (
    new Intl.NumberFormat("es-MX", {
      style:                 "currency",
      currency:              "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n) + " MXN"
  );
}