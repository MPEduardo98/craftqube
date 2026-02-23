export function NewsletterSection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-cq-800) 0%, var(--color-cq-700) 50%, var(--color-cq-800) 100%)",
      }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(30, 77, 183, 0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="section-label justify-center">Newsletter técnico</p>
        <h2
          className="text-display mb-4"
          style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "white" }}
        >
          Recibe novedades de{" "}
          <span style={{ color: "var(--color-cq-accent)" }}>ingeniería industrial</span>
        </h2>
        <p
          className="text-base mb-10"
          style={{ color: "var(--color-cq-steel-300)" }}
        >
          Nuevos productos, guías técnicas, tutoriales de automatización y ofertas exclusivas.
          Sin spam, solo contenido de valor para ingenieros.
        </p>

        {/* Form */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="tu@empresa.com"
            className="flex-1 px-4 py-3 rounded-sm text-sm font-mono outline-none"
            style={{
              background: "rgba(2, 11, 24, 0.8)",
              border: "1px solid var(--color-cq-600)",
              color: "var(--color-cq-100)",
              caretColor: "var(--color-cq-accent)",
            }}
            aria-label="Email para newsletter"
          />
          <button className="btn-primary whitespace-nowrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Suscribirse
          </button>
        </div>

        <p
          className="mt-4 font-mono text-xs"
          style={{ color: "var(--color-cq-steel-500)" }}
        >
          📧 +3,500 ingenieros ya suscritos · Baja cuando quieras
        </p>
      </div>
    </section>
  );
}