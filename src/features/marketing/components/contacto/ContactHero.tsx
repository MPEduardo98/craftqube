export function ContactHero({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return <section className="py-14 sm:py-20" style={{ background: "var(--color-cq-surface)" }}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <p className="section-label justify-center mb-4">Contacto</p>
      <h1 className="text-display mb-6 break-words" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--color-cq-text)" }}>{titulo}</h1>
      <p className="text-base leading-relaxed max-w-2xl mx-auto whitespace-pre-wrap break-words" style={{ color: "var(--color-cq-muted)" }}>{descripcion}</p>
    </div>
  </section>;
}
