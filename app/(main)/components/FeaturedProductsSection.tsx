import Link from "next/link";

const products = [
  {
    id: "p1",
    sku: "CQ-AL-2020",
    name: "Perfil Aluminio 20×20",
    series: "Serie 20",
    price: 145,
    unit: "m",
    stock: "En stock",
    rating: 4.9,
    reviews: 128,
    tags: ["Más vendido"],
    specs: ["20×20mm", "Ranura 6mm", "6063-T5"],
  },
  {
    id: "p2",
    sku: "CQ-AL-4040",
    name: "Perfil Aluminio 40×40",
    series: "Serie 40",
    price: 285,
    unit: "m",
    stock: "En stock",
    rating: 4.8,
    reviews: 94,
    tags: ["Premium"],
    specs: ["40×40mm", "Ranura 8mm", "Anodizado"],
  },
  {
    id: "p3",
    sku: "CQ-TNT-M5",
    name: "T-Nut M5 Deslizante",
    series: "Tornillería",
    price: 4.5,
    unit: "pz",
    stock: "En stock",
    rating: 5.0,
    reviews: 312,
    tags: ["Top rated"],
    specs: ["M5 Rosca", "Acero inox", "Ranura 6-8mm"],
  },
  {
    id: "p4",
    sku: "CQ-ESQ-90",
    name: "Escuadra Interior 90°",
    series: "Accesorios",
    price: 38,
    unit: "pz",
    stock: "En stock",
    rating: 4.7,
    reviews: 67,
    tags: [],
    specs: ["Al-380", "4 orificios", "M5 compatible"],
  },
  {
    id: "p5",
    sku: "CQ-AL-3030L",
    name: "Perfil Ligero 30×30",
    series: "Serie 30",
    price: 198,
    unit: "m",
    stock: "Bajo stock",
    rating: 4.8,
    reviews: 43,
    tags: ["Nuevo"],
    specs: ["30×30mm", "Doble ranura", "Ultraligero"],
  },
  {
    id: "p6",
    sku: "CQ-KIT-CNC3",
    name: "Kit Marco CNC 3-Ejes",
    series: "Automatización",
    price: 4850,
    unit: "kit",
    stock: "Bajo stock",
    rating: 4.9,
    reviews: 21,
    tags: ["Kit completo"],
    specs: ["500×500mm", "Incluye hardware", "Manual técnico"],
  },
];

export function FeaturedProductsSection() {
  return (
    <section
      className="py-24 relative"
      style={{ background: "var(--color-cq-900)" }}
    >
      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-grid-pattern-sm opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="section-label">Productos destacados</p>
            <h2
              className="text-display"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "white" }}
            >
              Los más{" "}
              <span style={{ color: "var(--color-cq-accent)" }}>solicitados</span>
            </h2>
          </div>
          <Link href="/catalogo" className="btn-ghost text-xs tracking-widest self-start sm:self-auto">
            Ver todos →
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="card-surface group transition-all duration-300"
            >
              {/* Product image placeholder - geometric */}
              <div
                className="relative h-48 overflow-hidden flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--color-cq-800) 0%, var(--color-cq-700) 100%)",
                  borderBottom: "1px solid var(--color-cq-700)",
                }}
              >
                {/* Abstract product visualization */}
                <svg
                  viewBox="0 0 200 140"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id={`g-${product.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2d6be4" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {product.series.includes("Serie") && (
                    <>
                      <rect x="60" y="20" width="30" height="100" rx="2" fill={`url(#g-${product.id})`} />
                      <rect x="100" y="20" width="30" height="100" rx="2" fill={`url(#g-${product.id})`} opacity="0.7" />
                      <rect x="50" y="55" width="100" height="30" rx="2" fill={`url(#g-${product.id})`} opacity="0.4" />
                    </>
                  )}
                  {product.series.includes("Tornillería") && (
                    <>
                      <circle cx="100" cy="70" r="35" fill="none" stroke="#2d6be4" strokeWidth="3" opacity="0.5" />
                      <polygon points="100,20 112,55 88,55" fill="#2d6be4" opacity="0.7" />
                      <polygon points="100,120 112,85 88,85" fill="#2d6be4" opacity="0.7" />
                      <polygon points="55,70 78,58 78,82" fill="#2d6be4" opacity="0.7" />
                      <polygon points="145,70 122,58 122,82" fill="#2d6be4" opacity="0.7" />
                      <circle cx="100" cy="70" r="12" fill="#00d4ff" opacity="0.6" />
                    </>
                  )}
                  {product.series.includes("Accesorios") && (
                    <>
                      <path d="M60 110 L60 50 L120 50" stroke="#2d6be4" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.7" />
                      <rect x="60" y="50" width="25" height="25" rx="2" fill="#2d6be4" opacity="0.4" />
                    </>
                  )}
                  {product.series.includes("Automatización") && (
                    <>
                      <rect x="30" y="55" width="140" height="30" rx="3" fill={`url(#g-${product.id})`} opacity="0.6" />
                      <circle cx="50" cy="70" r="12" fill="#00d4ff" opacity="0.6" />
                      <circle cx="150" cy="70" r="12" fill="#00d4ff" opacity="0.6" />
                      <rect x="80" y="45" width="40" height="50" rx="2" stroke="#2d6be4" strokeWidth="2" fill="none" opacity="0.5" />
                    </>
                  )}
                </svg>

                {/* Tags */}
                {product.tags.length > 0 && (
                  <div className="absolute top-3 left-3 flex gap-1">
                    {product.tags.map((tag) => (
                      <span key={tag} className="badge text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stock indicator */}
                <div className="absolute top-3 right-3">
                  <span
                    className="font-mono text-xs px-2 py-1 rounded-sm"
                    style={{
                      background: product.stock === "En stock"
                        ? "rgba(34, 197, 94, 0.15)"
                        : "rgba(234, 179, 8, 0.15)",
                      color: product.stock === "En stock" ? "#4ade80" : "#facc15",
                      border: `1px solid ${product.stock === "En stock" ? "rgba(34, 197, 94, 0.3)" : "rgba(234, 179, 8, 0.3)"}`,
                    }}
                  >
                    {product.stock}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* SKU + series */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--color-cq-steel-500)" }}
                  >
                    {product.sku}
                  </span>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded-sm"
                    style={{
                      background: "var(--color-cq-800)",
                      color: "var(--color-cq-steel-300)",
                    }}
                  >
                    {product.series}
                  </span>
                </div>

                {/* Name */}
                <h3
                  className="font-display text-lg font-bold mb-2 transition-colors duration-200 group-hover:text-cq-accent"
                  style={{
                    color: "white",
                    fontFamily: "var(--font-barlow, sans-serif)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {product.name}
                </h3>

                {/* Specs */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.specs.map((spec) => (
                    <span
                      key={spec}
                      className="font-mono text-xs px-2 py-0.5 rounded-sm"
                      style={{
                        background: "rgba(23, 53, 128, 0.15)",
                        color: "var(--color-cq-300)",
                        border: "1px solid rgba(23, 53, 128, 0.3)",
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill={i < Math.floor(product.rating) ? "#facc15" : "none"}
                        stroke="#facc15"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--color-cq-steel-400)" }}
                  >
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price + action */}
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="text-display text-2xl"
                      style={{ color: "var(--color-cq-accent)" }}
                    >
                      ${product.price.toLocaleString("es-MX")}
                    </span>
                    <span
                      className="font-mono text-xs ml-1"
                      style={{ color: "var(--color-cq-steel-500)" }}
                    >
                      MXN/{product.unit}
                    </span>
                  </div>
                  <button
                    className="btn-primary py-2 px-4 text-xs"
                    aria-label={`Agregar ${product.name} al carrito`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Agregar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}