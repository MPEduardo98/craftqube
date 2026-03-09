// app/global/components/products/ProductCardSkeleton.tsx

export function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden animate-pulse"
      style={{
        background: "var(--color-cq-surface)",
        border: "1px solid var(--color-cq-border)",
      }}
    >
      {/* Imagen 1:1 */}
      <div style={{ aspectRatio: "1 / 1", background: "var(--color-cq-surface-2)" }} />

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="h-2 rounded" style={{ background: "var(--color-cq-border)", width: "40%" }} />
        <div className="h-4 rounded" style={{ background: "var(--color-cq-border)", width: "85%" }} />
        <div className="h-3 rounded" style={{ background: "var(--color-cq-border)", width: "65%" }} />
        <div
          className="h-4 w-16 rounded-md"
          style={{ background: "var(--color-cq-accent-glow)" }}
        />
        <div
          className="flex flex-col gap-2 pt-2"
          style={{ borderTop: "1px solid var(--color-cq-border)" }}
        >
          <div className="h-5 rounded" style={{ background: "var(--color-cq-border)", width: "45%" }} />
          <div className="h-8 rounded-lg" style={{ background: "var(--color-cq-accent-glow)" }} />
        </div>
      </div>
    </div>
  );
}