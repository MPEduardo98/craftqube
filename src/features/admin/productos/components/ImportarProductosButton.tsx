"use client";
// features/admin/productos/components/ImportarProductosButton.tsx
// ─────────────────────────────────────────────────────────────
// Botón + modal para alta masiva de productos vía JSON.
// Pega/sube un JSON con { "productos": [...] } y lo envía a
// POST /api/admin/productos/importar, mostrando un resumen por
// producto (creado / error).
// ─────────────────────────────────────────────────────────────
import { useState, useRef } from "react";

const EJEMPLO = `{
  "productos": [
    {
      "titulo": "Perfil de aluminio 20x20",
      "estado": "activo",
      "marca": "Item",
      "categorias": ["Perfiles", "Aluminio"],
      "descripcion": "Perfil estructural de aluminio serie 20.",
      "envio": { "es_fisico": true, "largo": 100, "ancho": 2, "alto": 2, "peso": 0.6 },
      "imagenes": [{ "url": "https://ejemplo.com/imagen.jpg", "alt": "Perfil 20x20", "orden": 0 }],
      "variantes": [
        {
          "nombre": "1 metro",
          "sku": "PA-2020-1M",
          "precio_original": 250,
          "precio_final": 199,
          "costo": 120,
          "stock": 50,
          "es_default": true,
          "atributos": [{ "nombre": "Longitud", "valor": "1m" }]
        }
      ]
    }
  ]
}`;

interface ResultadoImport {
  index:   number;
  titulo:  string;
  success: boolean;
  id?:     number;
  error?:  string;
}

export function ImportarProductosButton() {
  const [open,      setOpen]      = useState(false);
  const [json,      setJson]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadoImport[] | null>(null);
  const [showEjemplo, setShowEjemplo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setJson("");
    setError(null);
    setResultados(null);
    setShowEjemplo(false);
  };

  const close = () => {
    const huboCreados = (resultados?.filter(r => r.success).length ?? 0) > 0;
    setOpen(false);
    reset();
    if (huboCreados) window.location.reload();
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    setJson(text);
    setError(null);
  };

  const handleImport = async () => {
    setError(null);
    setResultados(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("El texto no es un JSON válido.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/admin/productos/importar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(parsed),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Error al importar.");
        return;
      }

      setResultados(data.data.resultados);
    } catch {
      setError("Error de red al importar.");
    } finally {
      setLoading(false);
    }
  };

  const creados  = resultados?.filter(r => r.success).length ?? 0;
  const fallidos = resultados ? resultados.length - creados : 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] inline-flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-lg font-semibold transition-colors"
        style={{
          border:     "1px solid var(--color-cq-border, #e2e8f0)",
          background: "var(--color-cq-surface, #fff)",
          color:      "var(--color-cq-text, #0f172a)",
          cursor:     "pointer",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Importar JSON
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={close}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col overflow-hidden"
            style={{
              background: "var(--color-cq-surface, #fff)",
              border:     "1px solid var(--color-cq-border, #e2e8f0)",
              boxShadow:  "0 20px 60px rgba(0,0,0,0.18)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}>
              <div>
                <p className="text-[15px] font-bold" style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-display, sans-serif)" }}>
                  Importar productos (JSON)
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--color-cq-muted, #64748b)" }}>
                  Pega o sube un archivo con {"{ \"productos\": [ ... ] }"}
                </p>
              </div>
              <button onClick={close} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cq-muted, #64748b)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 flex flex-col gap-3 overflow-y-auto">

              {!resultados && (
                <>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="text-[12px] font-semibold inline-flex items-center gap-1.5"
                      style={{ color: "var(--color-cq-accent, #2563eb)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Subir archivo .json
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
                    />
                    <button
                      onClick={() => setShowEjemplo(v => !v)}
                      className="text-[12px] font-semibold"
                      style={{ color: "var(--color-cq-muted, #64748b)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      {showEjemplo ? "Ocultar ejemplo" : "Ver ejemplo"}
                    </button>
                  </div>

                  {showEjemplo && (
                    <pre
                      className="text-[11px] rounded-lg p-3 overflow-x-auto"
                      style={{ background: "var(--color-cq-surface-2, #f8fafc)", border: "1px solid var(--color-cq-border, #e2e8f0)", color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-mono, monospace)" }}
                    >
                      {EJEMPLO}
                    </pre>
                  )}

                  <textarea
                    value={json}
                    onChange={e => setJson(e.target.value)}
                    placeholder='{ "productos": [ ... ] }'
                    rows={14}
                    className="w-full rounded-lg px-3 py-2.5 text-[12px] resize-none"
                    style={{
                      background:  "var(--color-cq-surface-2, #f8fafc)",
                      border:      "1px solid var(--color-cq-border, #e2e8f0)",
                      color:       "var(--color-cq-text, #0f172a)",
                      fontFamily:  "var(--font-mono, monospace)",
                      outline:     "none",
                    }}
                  />

                  {error && (
                    <p className="text-[12px] px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
                      {error}
                    </p>
                  )}
                </>
              )}

              {resultados && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: "rgba(5,150,105,0.08)", color: "#065f46" }}>
                      {creados} creado{creados !== 1 ? "s" : ""}
                    </span>
                    {fallidos > 0 && (
                      <span className="text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
                        {fallidos} con error
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto">
                    {resultados.map(r => (
                      <div
                        key={r.index}
                        className="flex items-start gap-2.5 px-3 py-2 rounded-lg text-[12px]"
                        style={{
                          background: r.success ? "rgba(5,150,105,0.05)" : "rgba(239,68,68,0.05)",
                          border: `1px solid ${r.success ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.15)"}`,
                        }}
                      >
                        <span style={{ color: r.success ? "#059669" : "#ef4444", flexShrink: 0 }}>
                          {r.success ? "✓" : "✕"}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold truncate" style={{ color: "var(--color-cq-text, #0f172a)" }}>{r.titulo}</p>
                          {!r.success && <p style={{ color: "#dc2626" }}>{r.error}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4" style={{ borderTop: "1px solid var(--color-cq-border, #e2e8f0)" }}>
              {resultados ? (
                <>
                  <button onClick={reset} className="px-4 py-2.5 rounded-xl text-[13px] font-semibold" style={{ border: "1px solid var(--color-cq-border, #e2e8f0)", background: "var(--color-cq-surface-2, #f8fafc)", color: "var(--color-cq-muted, #64748b)", cursor: "pointer" }}>
                    Importar otro
                  </button>
                  <button onClick={close} className="px-4 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: "var(--color-cq-accent, #2563eb)", color: "#fff", border: "none", cursor: "pointer" }}>
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={close} disabled={loading} className="px-4 py-2.5 rounded-xl text-[13px] font-semibold" style={{ border: "1px solid var(--color-cq-border, #e2e8f0)", background: "var(--color-cq-surface-2, #f8fafc)", color: "var(--color-cq-muted, #64748b)", cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading || !json.trim()}
                    className="px-4 py-2.5 rounded-xl text-[13px] font-semibold"
                    style={{
                      background: loading || !json.trim() ? "rgba(37,99,235,0.5)" : "var(--color-cq-accent, #2563eb)",
                      color: "#fff", border: "none",
                      cursor: loading || !json.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Importando…" : "Importar"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
