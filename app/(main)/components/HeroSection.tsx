import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ paddingTop: "88px" }} // offset header
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Deep gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(23, 53, 128, 0.35) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(0, 212, 255, 0.08) 0%, transparent 60%), var(--color-cq-950)",
          }}
        />
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.03) 50%)",
            backgroundSize: "100% 4px",
          }}
        />
      </div>

      {/* Decorative aluminum profile shapes */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block overflow-hidden">
        {/* Large profile silhouette */}
        <svg
          viewBox="0 0 600 800"
          className="absolute right-0 top-0 h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="profileGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2d6be4" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
          {/* Profile cross-sections */}
          <rect x="50" y="100" width="80" height="600" rx="4" fill="url(#profileGrad)" />
          <rect x="150" y="100" width="80" height="600" rx="4" fill="url(#profileGrad)" opacity="0.7" />
          <rect x="30" y="350" width="220" height="80" rx="4" fill="url(#profileGrad)" opacity="0.5" />
          <rect x="30" y="450" width="220" height="80" rx="4" fill="url(#profileGrad)" opacity="0.5" />

          <rect x="300" y="200" width="60" height="500" rx="3" fill="url(#profileGrad)" opacity="0.4" />
          <rect x="380" y="300" width="60" height="350" rx="3" fill="url(#profileGrad)" opacity="0.3" />
          <rect x="280" y="400" width="180" height="50" rx="3" fill="url(#profileGrad)" opacity="0.25" />

          {/* Grid holes detail */}
          <circle cx="90" cy="300" r="8" fill="black" opacity="0.5" />
          <circle cx="90" cy="400" r="8" fill="black" opacity="0.5" />
          <circle cx="90" cy="500" r="8" fill="black" opacity="0.5" />
          <circle cx="190" cy="300" r="8" fill="black" opacity="0.5" />
          <circle cx="190" cy="400" r="8" fill="black" opacity="0.5" />
        </svg>

        {/* Glowing orb */}
        <div
          className="absolute"
          style={{
            right: "15%",
            top: "30%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(30, 77, 183, 0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute"
          style={{
            right: "20%",
            top: "50%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-3xl">
          {/* Label */}
          <div className="section-label opacity-0 animate-fade-up">
            Distribución Industrial Premium
          </div>

          {/* Headline */}
          <h1
            className="text-display opacity-0 animate-fade-up delay-100"
            style={{
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              color: "white",
              marginBottom: "1.5rem",
            }}
          >
            Perfiles de{" "}
            <span
              className="text-glow"
              style={{ color: "var(--color-cq-accent)" }}
            >
              aluminio
            </span>
            <br />
            para construir
            <br />
            el futuro
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg leading-relaxed mb-10 max-w-xl opacity-0 animate-fade-up delay-200"
            style={{ color: "var(--color-cq-steel-300)" }}
          >
            Proveedor líder de perfiles estructurales, tornillería especializada, escuadras
            y sistemas completos de automatización industrial. Precisión suiza, entrega inmediata.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-16 opacity-0 animate-fade-up delay-300">
            <Link href="/catalogo" className="btn-primary text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Ver catálogo
            </Link>
            <Link href="/cotizar" className="btn-secondary text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Solicitar cotización
            </Link>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap gap-8 opacity-0 animate-fade-up delay-400"
          >
            {[
              { value: "+2,500", label: "SKUs en stock" },
              { value: "10+", label: "Años de experiencia" },
              { value: "48h", label: "Entrega estándar" },
              { value: "ISO", label: "9001 Certificado" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="text-display text-3xl"
                  style={{ color: "var(--color-cq-accent)" }}
                >
                  {stat.value}
                </span>
                <span
                  className="font-mono text-xs tracking-wider uppercase mt-1"
                  style={{ color: "var(--color-cq-steel-400)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--color-cq-950))",
        }}
      />
    </section>
  );
}