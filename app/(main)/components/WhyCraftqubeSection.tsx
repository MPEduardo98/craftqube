const values = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "Calidad Certificada",
    desc: "Todos nuestros productos cumplen con estándares ISO 9001:2015 y normativas internacionales DIN/ISO.",
    metric: "ISO 9001",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Entrega Express",
    desc: "Stock permanente en más de 2,500 SKUs. Envíos en 24-48h a toda la República Mexicana.",
    metric: "48h max",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Soporte de Ingeniería",
    desc: "Equipo de ingenieros industriales disponibles para asesoría técnica, diseño de proyectos y cotizaciones.",
    metric: "24/7",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Precisión Industrial",
    desc: "Tolerancias de fabricación ±0.1mm. Materiales trazables con certificado de análisis químico.",
    metric: "±0.1mm",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Plataforma Digital",
    desc: "Pedidos online, seguimiento en tiempo real, historial de compras y acceso a planos CAD/DXF.",
    metric: "100% Digital",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Cobertura Nacional",
    desc: "Oficinas en CDMX, Monterrey y Guadalajara. Red de distribución en 32 estados.",
    metric: "32 estados",
  },
];

export function WhyCraftqubeSection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "var(--color-cq-950)" }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-cq-700), transparent)",
        }}
      />

      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(23, 53, 128, 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label justify-center">
            ¿Por qué Craftqube?
          </p>
          <h2
            className="text-display mx-auto"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "white",
              maxWidth: "600px",
            }}
          >
            La diferencia está en los{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>detalles</span>
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "var(--color-cq-steel-400)" }}
          >
            No solo vendemos perfiles. Somos su socio tecnológico para proyectos de ingeniería de precisión.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((val, idx) => (
            <div
              key={val.title}
              className="card-surface group p-6 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon + metric */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center"
                  style={{
                    background: "rgba(30, 77, 183, 0.15)",
                    border: "1px solid rgba(30, 77, 183, 0.3)",
                    color: "var(--color-cq-accent)",
                  }}
                >
                  {val.icon}
                </div>
                <span
                  className="font-mono text-xs font-bold px-2 py-1 rounded-sm"
                  style={{
                    background: "rgba(0, 212, 255, 0.08)",
                    color: "var(--color-cq-accent)",
                    border: "1px solid rgba(0, 212, 255, 0.2)",
                  }}
                >
                  {val.metric}
                </span>
              </div>

              <h3
                className="text-display text-lg mb-3"
                style={{ color: "white" }}
              >
                {val.title}
              </h3>

              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-cq-steel-400)" }}
              >
                {val.desc}
              </p>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-16 transition-all duration-500 rounded-r-full"
                style={{ background: "var(--color-cq-accent)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}