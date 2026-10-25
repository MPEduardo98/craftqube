"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { CAMPOS_CONTACTO, type ContactoPublico } from "@mpeduardo98/commerce-core/contacto/types";

export function ContactForm({ config }: { config: ContactoPublico }) {
  const ocupado = useRef(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ocupado.current) return;
    ocupado.current = true;
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    setSending(true); setError("");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "No pudimos enviar tu mensaje. Inténtalo de nuevo.");
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.");
    } finally { ocupado.current = false; setSending(false); }
  }

  if (!config.activo) return null;
  if (submitted) return (
    <div role="status" className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl text-center" style={{ background: "var(--color-cq-accent-glow)", border: "1px solid var(--color-cq-border)", minHeight: 400 }}>
      <i aria-hidden="true" className="fa-solid fa-circle-check text-5xl mb-6" style={{ color: "var(--color-cq-accent)" }} />
      <h2 className="text-display text-2xl mb-3">¡Recibimos tu mensaje!</h2>
      <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--color-cq-muted)" }}>Gracias por contactarnos. Te enviaremos una confirmación por correo y nuestro equipo revisará tu consulta para responderte.</p>
      <button type="button" onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-lg text-sm font-bold" style={{ background: "var(--color-cq-accent)", color: "white" }}>Enviar otro mensaje</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-8 rounded-2xl min-w-0" style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }} aria-busy={sending}>
      <h2 className="text-display text-2xl mb-3">Envíanos un mensaje</h2>
      <p className="text-xs mb-6" style={{ color: "var(--color-cq-muted)" }}>Los campos con * son obligatorios.</p>
      <fieldset disabled={sending} className="space-y-5 border-0 p-0 m-0 min-w-0">
        {CAMPOS_CONTACTO.filter(c => config.campos[c.id] !== "oculto").map(c => {
          const requerido = config.campos[c.id] === "obligatorio";
          const props = {
            id: `contacto-${c.id}`, name: c.id, required: requerido, maxLength: c.max,
            className: "w-full px-4 py-3 rounded-lg text-base sm:text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 disabled:opacity-60",
            style: { background: "var(--color-cq-bg)", border: "1.5px solid var(--color-cq-border)", color: "var(--color-cq-text)", fontFamily: "var(--font-body)" },
          };
          return <div key={c.id}>
            <label htmlFor={props.id} className="block text-xs font-bold uppercase tracking-wide mb-2">{c.etiqueta}{requerido ? " *" : " (opcional)"}</label>
            {c.tipo === "textarea" ? <textarea {...props} rows={6} className={`${props.className} resize-y`} /> :
              <input {...props} type={c.tipo} autoComplete={c.id === "nombre" ? "name" : c.id === "email" ? "email" : c.id === "telefono" ? "tel" : c.id === "empresa" ? "organization" : "off"} />}
          </div>;
        })}
        <div aria-hidden="true" className="absolute w-px h-px overflow-hidden" style={{ clipPath: "inset(50%)" }}>
          <label htmlFor="contacto-website">Deja este campo vacío</label><input id="contacto-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {error && <p role="alert" className="text-sm rounded-lg p-3 text-red-800 bg-red-50">{error}</p>}
        <button type="submit" disabled={sending} className="w-full px-6 py-4 rounded-lg text-sm font-bold uppercase tracking-wide disabled:opacity-60 disabled:cursor-wait" style={{ background: "var(--color-cq-accent)", color: "white", fontFamily: "var(--font-display)" }}>{sending ? "Enviando…" : "Enviar mensaje"}</button>
      </fieldset>
      <p className="text-xs mt-5 text-center leading-relaxed" style={{ color: "var(--color-cq-muted)" }}>Consulta cómo tratamos tus datos en nuestra <Link href="/politicas/politica-de-privacidad" className="underline">política de privacidad</Link>.</p>
    </form>
  );
}
