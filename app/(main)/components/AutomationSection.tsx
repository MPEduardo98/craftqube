import Link from "next/link";

const automationItems = [
  {
    title: "Estructuras para CNC",
    desc: "Frames robustos de aluminio para máquinas CNC de fresado, corte y grabado. Diseño modular para cualquier configuración.",
    href: "/automatizacion/cnc",
    accent: "#2d6be4",
  },
  {
    title: "Sistemas de Movimiento Lineal",
    desc: "Guías de perfil, rieles redondos, husillos de bola y sistemas de desplazamiento de alta precisión.",
    href: "/automatizacion/guias",
    accent: "#00d4ff",
  },
  {
    title: "Proyectos Llave en Mano",
    desc: "Desde el diseño conceptual hasta la puesta en marcha. Nuestros ingenieros diseñan y construyen su solución.",
    href: "/automatizacion/proyectos",
    accent: "#4d8ef5",
  },
];

export function AutomationSection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--color-cq-900) 0%, var(--color-cq-950) 100%)",
      }}
    >
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Glow effect */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "-200px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: content */}
          <div>
            <p className="section-label">Automatización Industrial</p>
            <h2
              className="text-display mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "white" }}
            >
              Soluciones para la{" "}
              <span style={{ color: "var(--color-cq-accent)" }}>
                industria 4.0
              </span>
            </h2>
            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: "var(--color-cq-steel-400)", maxWidth: "480px" }}
            >
              Combinamos la versatilidad del perfil de aluminio con componentes de automatización
              de precisión para crear sistemas robustos, escalables y de alto rendimiento.
            </p>

            {/* Items */}
            <div className="flex flex-col gap-4 mb-10">
              {automationItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-4 p-4 rounded-md transition-all duration-200"
                  style={{
                    background: "var(--color-cq-900)",
                    border: "1px solid var(--color-cq-800)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-700)";
                    (e.currentTarget as HTMLElement).style.background = "var(--color-cq-800)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-800)";
                    (e.currentTarget as HTMLElement).style.background = "var(--color-cq-900)";
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                    style={{ background: item.accent }}
                  />
                  <div className="flex-1">
                    <h4
                      className="text-sm font-bold mb-1 transition-colors"
                      style={{ color: "var(--color-cq-100)" }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--color-cq-steel-400)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="flex-shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: "var(--color-cq-steel-500)" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            <Link href="/automatizacion" className="btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Ver soluciones de automatización
            </Link>
          </div>

          {/* Right: abstract tech visualization */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div
              className="relative w-96 h-96 animate-pulse-border"
              style={{
                background: "var(--color-cq-900)",
                border: "1px solid rgba(0, 212, 255, 0.3)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {/* Internal grid */}
              <div className="absolute inset-0 bg-grid-pattern" />

              {/* CNC frame visualization */}
              <svg
                viewBox="0 0 400 400"
                className="absolute inset-0 w-full h-full p-8"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="cncGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2d6be4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.5" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Frame perimeter */}
                <rect x="40" y="40" width="320" height="320" rx="4" stroke="url(#cncGrad)" strokeWidth="8" fill="none" filter="url(#glow)" />

                {/* Horizontal guide */}
                <rect x="40" y="175" width="320" height="50" rx="2" fill="url(#cncGrad)" opacity="0.4" />
                <line x1="200" y1="40" x2="200" y2="360" stroke="#00d4ff" strokeWidth="2" opacity="0.3" strokeDasharray="8,8" />

                {/* Spindle head */}
                <circle cx="200" cy="200" r="20" fill="url(#cncGrad)" filter="url(#glow)" />
                <circle cx="200" cy="200" r="8" fill="#00d4ff" opacity="0.9" filter="url(#glow)" />

                {/* Corner joints */}
                {[[40, 40], [360, 40], [40, 360], [360, 360]].map(([x, y], i) => (
                  <g key={i}>
                    <rect x={x - 8} y={y - 8} width="16" height="16" rx="2" fill="#2d6be4" opacity="0.8" />
                    <circle cx={x} cy={y} r="4" fill="#00d4ff" opacity="0.9" />
                  </g>
                ))}

                {/* Dimension lines */}
                <line x1="40" y1="385" x2="360" y2="385" stroke="#2d6be4" strokeWidth="1" opacity="0.4" />
                <text x="200" y="398" textAnchor="middle" fill="#2d6be4" fontSize="10" fontFamily="monospace" opacity="0.7">500mm</text>
                <line x1="385" y1="40" x2="385" y2="360" stroke="#2d6be4" strokeWidth="1" opacity="0.4" />
                <text x="392" y="205" textAnchor="start" fill="#2d6be4" fontSize="10" fontFamily="monospace" opacity="0.7" transform="rotate(90, 392, 205)">500mm</text>
              </svg>

              {/* Overlay label */}
              <div
                className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
              >
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-cq-accent)", opacity: 0.7 }}
                >
                  CNC Frame 500×500mm
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-cq-steel-500)" }}
                >
                  SKU: CQ-KIT-CNC3
                </span>
              </div>
            </div>

            {/* Floating spec cards */}
            <div
              className="absolute -right-4 top-12 card-surface p-3 text-xs animate-float"
              style={{ animationDelay: "0s" }}
            >
              <p className="font-mono text-xs mb-1" style={{ color: "var(--color-cq-accent)" }}>PRECISIÓN</p>
              <p className="font-bold text-white">±0.01mm</p>
            </div>
            <div
              className="absolute -left-4 bottom-16 card-surface p-3 text-xs animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <p className="font-mono text-xs mb-1" style={{ color: "var(--color-cq-accent)" }}>MATERIAL</p>
              <p className="font-bold text-white">AL 6063-T5</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}