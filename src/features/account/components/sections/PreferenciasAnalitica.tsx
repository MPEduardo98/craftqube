// features/account/components/sections/PreferenciasAnalitica.tsx
// ─────────────────────────────────────────────────────────────
// Control permanente para aceptar o revocar la analítica y, si
// está aceptada, la encuesta opcional de edad y género (sólo
// mayores de edad, declarada por el cliente, nunca inferida).
// Revocar detiene envíos futuros; no borra eventos anteriores.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useSyncExternalStore } from "react";
import { analyticsConsent, setAnalyticsConsent, track } from "@mpeduardo98/commerce-core/analytics/client";
import { EDADES, GENEROS } from "@mpeduardo98/commerce-core/analytics/events";

const ETIQUETA_GENERO: Record<(typeof GENEROS)[number], string> = {
  mujer:             "Mujer",
  hombre:            "Hombre",
  no_binario:        "No binario",
  otro:              "Otro",
  prefiero_no_decir: "Prefiero no decir",
};

const estiloSelect: React.CSSProperties = {
  background:   "var(--color-cq-bg)",
  border:       "1px solid var(--color-cq-border)",
  color:        "var(--color-cq-text)",
  fontSize:     "0.88rem",
};

function suscribir(avisar: () => void) {
  window.addEventListener("cc-analytics-consent", avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener("cc-analytics-consent", avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function PreferenciasAnalitica() {
  const aceptada              = useSyncExternalStore(suscribir, analyticsConsent, () => false);
  const sinDnt                = useSyncExternalStore(suscribir, () => navigator.doNotTrack !== "1", () => true);
  const [enviada, setEnviada] = useState(false);
  const [edad, setEdad]       = useState("");
  const [genero, setGenero]   = useState("");

  const compartir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edad && !genero) return;
    track("demographics", { age: edad || undefined, gender: genero || undefined });
    setEnviada(true);
  };

  return (
    <div className="rounded-xl p-6" style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)", margin: 0 }}>
            Analítica del sitio
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--color-cq-muted)" }}>
            Visitas, clics y uso del carrito, de forma anónima
          </p>
        </div>
        {sinDnt && (
          <button
            type="button"
            className={aceptada ? "btn-secondary" : "btn-primary"}
            onClick={() => setAnalyticsConsent(!aceptada)}
          >
            {aceptada ? "Revocar permiso" : "Permitir analítica"}
          </button>
        )}
      </div>

      {!sinDnt ? (
        <p className="text-sm" style={{ color: "var(--color-cq-muted)" }}>
          Tu navegador tiene activado «No rastrear», así que no medimos tu visita.
        </p>
      ) : !aceptada ? (
        <p className="text-sm" style={{ color: "var(--color-cq-muted)" }}>
          No estamos midiendo tu navegación. Puedes permitirlo cuando quieras.
        </p>
      ) : enviada ? (
        <p className="text-sm" style={{ color: "var(--color-cq-text-2)" }}>
          <i className="fa-solid fa-check mr-2" style={{ color: "var(--color-cq-accent)" }} />
          Gracias por compartir estos datos opcionales.
        </p>
      ) : (
        <form onSubmit={compartir} className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--color-cq-muted)" }}>
            Encuesta opcional para mayores de 18 años. No se vincula con tu cuenta y puedes omitir cualquier respuesta.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs" style={{ color: "var(--color-cq-muted)" }}>
              Rango de edad
              <select value={edad} onChange={e => setEdad(e.target.value)} className="w-full rounded-lg px-4 py-3" style={estiloSelect}>
                <option value="">No compartir</option>
                {EDADES.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs" style={{ color: "var(--color-cq-muted)" }}>
              Género
              <select value={genero} onChange={e => setGenero(e.target.value)} className="w-full rounded-lg px-4 py-3" style={estiloSelect}>
                <option value="">No compartir</option>
                {GENEROS.map(x => <option key={x} value={x}>{ETIQUETA_GENERO[x]}</option>)}
              </select>
            </label>
          </div>
          <div>
            <button type="submit" className="btn-primary" disabled={!edad && !genero}>
              Compartir datos opcionales
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
