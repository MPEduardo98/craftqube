// app/(main)/cuenta/components/sections/DireccionesSection.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Direccion {
  id: number;
  alias: string | null;
  nombre: string;
  apellido: string;
  empresa: string | null;
  telefono: string | null;
  calle: string;
  numero_ext: string;
  numero_int: string | null;
  colonia: string;
  ciudad: string;
  municipio: string | null;
  estado: string;
  codigo_postal: string;
  pais: string;
  referencias: string | null;
  es_predeterminada: boolean;
  tipo: string;
}

type FormData = {
  alias: string; nombre: string; apellido: string; empresa: string;
  telefono: string; calle: string; numero_ext: string; numero_int: string;
  colonia: string; ciudad: string; municipio: string; estado: string;
  codigo_postal: string; pais: string; referencias: string;
  es_predeterminada: boolean; tipo: string;
};

const EMPTY: FormData = {
  alias: "", nombre: "", apellido: "", empresa: "",
  telefono: "", calle: "", numero_ext: "", numero_int: "",
  colonia: "", ciudad: "", municipio: "", estado: "",
  codigo_postal: "", pais: "MX", referencias: "",
  es_predeterminada: false, tipo: "envio",
};

function InputField({ label, value, onChange, placeholder, required, span2 }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; span2?: boolean;
}) {
  return (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
      <label style={{
        display: "block", marginBottom: 5,
        fontFamily: "var(--font-mono)", fontSize: "0.55rem",
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--color-cq-muted-2)",
      }}>
        {label}{required && <span style={{ color: "var(--color-cq-accent)" }}> *</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-4 py-3"
        style={{
          background: "var(--color-cq-bg)",
          border: "1px solid var(--color-cq-border)",
          color: "var(--color-cq-text)",
          fontFamily: "var(--font-body)", fontSize: "0.875rem",
          outline: "none",
        }}
      />
    </div>
  );
}

export function DireccionesSection() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [deletingId,  setDeletingId]  = useState<number | null>(null);
  const [message,     setMessage]     = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form,        setForm]        = useState<FormData>({ ...EMPTY });

  const f = (k: keyof FormData) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const fetchDirecciones = async () => {
    try {
      const res = await fetch("/api/users/addresses", { credentials: "include" });
      const d   = await res.json();
      if (d.success) setDirecciones(d.data ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDirecciones(); }, []);

  const openNew = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
    setShowForm(true);
    setMessage(null);
  };

  const openEdit = (dir: Direccion) => {
    setForm({
      alias: dir.alias ?? "", nombre: dir.nombre, apellido: dir.apellido,
      empresa: dir.empresa ?? "", telefono: dir.telefono ?? "",
      calle: dir.calle, numero_ext: dir.numero_ext, numero_int: dir.numero_int ?? "",
      colonia: dir.colonia, ciudad: dir.ciudad, municipio: dir.municipio ?? "",
      estado: dir.estado, codigo_postal: dir.codigo_postal, pais: dir.pais,
      referencias: dir.referencias ?? "", es_predeterminada: dir.es_predeterminada,
      tipo: dir.tipo,
    });
    setEditingId(dir.id);
    setShowForm(true);
    setMessage(null);
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm({ ...EMPTY }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url    = editingId ? `/api/users/addresses/${editingId}` : "/api/users/addresses";
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setMessage({ type: "success", text: editingId ? "Dirección actualizada" : "Dirección guardada" });
        cancelForm();
        fetchDirecciones();
      } else {
        setMessage({ type: "error", text: d.error || "Error al guardar" });
      }
    } catch { setMessage({ type: "error", text: "Error de conexión" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta dirección?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/addresses/${id}`, { method: "DELETE", credentials: "include" });
      const d   = await res.json();
      if (res.ok && d.success) {
        setMessage({ type: "success", text: "Dirección eliminada" });
        fetchDirecciones();
      } else {
        setMessage({ type: "error", text: d.error || "Error al eliminar" });
      }
    } catch { setMessage({ type: "error", text: "Error de conexión" }); }
    finally { setDeletingId(null); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid var(--color-cq-border)", borderTopColor: "var(--color-cq-accent)" }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Mensaje */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl p-4"
            style={{
              background: message.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}
          >
            <i className={message.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-exclamation"}
              style={{ color: message.type === "success" ? "#10b981" : "#ef4444", fontSize: "0.82rem" }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-text)", flex: 1 }}>{message.text}</p>
            <button onClick={() => setMessage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cq-muted)", padding: 2 }}>
              <i className="fa-solid fa-xmark" style={{ fontSize: "0.72rem" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón agregar */}
      {!showForm && (
        <motion.button
          onClick={openNew} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="self-start flex items-center gap-2 rounded-lg px-5 py-2.5"
          style={{ background: "var(--color-cq-primary)", color: "white", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600 }}
        >
          <i className="fa-solid fa-plus" style={{ fontSize: "0.72rem" }} />
          Agregar dirección
        </motion.button>
      )}

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-xl p-6"
            style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
          >
            <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                {editingId ? "Editar dirección" : "Nueva dirección"}
              </h3>
              <button onClick={cancelForm} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cq-muted)", padding: 4 }}>
                <i className="fa-solid fa-xmark" style={{ fontSize: "0.9rem" }} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <InputField label="Alias"          value={form.alias}         onChange={f("alias")}         placeholder="Casa, Oficina..." />
              <InputField label="Empresa"        value={form.empresa}       onChange={f("empresa")}       placeholder="Opcional" />
              <InputField label="Nombre"         value={form.nombre}        onChange={f("nombre")}        placeholder="Nombre" required />
              <InputField label="Apellido"       value={form.apellido}      onChange={f("apellido")}      placeholder="Apellido" required />
              <InputField label="Calle"          value={form.calle}         onChange={f("calle")}         placeholder="Calle" required span2 />
              <InputField label="Núm. exterior"  value={form.numero_ext}    onChange={f("numero_ext")}    placeholder="Ej. 22" required />
              <InputField label="Núm. interior"  value={form.numero_int}    onChange={f("numero_int")}    placeholder="Opcional" />
              <InputField label="Colonia"        value={form.colonia}       onChange={f("colonia")}       placeholder="Colonia" required />
              <InputField label="Ciudad"         value={form.ciudad}        onChange={f("ciudad")}        placeholder="Ciudad" required />
              <InputField label="Municipio"      value={form.municipio}     onChange={f("municipio")}     placeholder="Opcional" />
              <InputField label="Estado"         value={form.estado}        onChange={f("estado")}        placeholder="Estado" required />
              <InputField label="Código postal"  value={form.codigo_postal} onChange={f("codigo_postal")} placeholder="72000" required />
              <InputField label="Teléfono"       value={form.telefono}      onChange={f("telefono")}      placeholder="10 dígitos" />
            </div>

            <div className="mb-4">
              <label style={{ display: "block", marginBottom: 5, fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
                Referencias
              </label>
              <textarea value={form.referencias} onChange={(e) => setForm((p) => ({ ...p, referencias: e.target.value }))} rows={2}
                placeholder="Entre calles, señas particulares..." className="w-full rounded-lg px-4 py-3"
                style={{ background: "var(--color-cq-bg)", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-text)", fontFamily: "var(--font-body)", fontSize: "0.875rem", resize: "none", outline: "none" }} />
            </div>

            <label className="flex items-center gap-3 mb-5 cursor-pointer">
              <input type="checkbox" checked={form.es_predeterminada}
                onChange={(e) => setForm((p) => ({ ...p, es_predeterminada: e.target.checked }))} className="w-4 h-4" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-text)" }}>
                Usar como dirección predeterminada
              </span>
            </label>

            <div className="flex gap-3">
              <motion.button onClick={handleSave} disabled={saving}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-lg px-5 py-2.5"
                style={{ background: "var(--color-cq-primary)", color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, opacity: saving ? 0.65 : 1 }}
              >
                {saving
                  ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                  : <i className="fa-solid fa-check" style={{ fontSize: "0.72rem" }} />
                }
                {editingId ? "Guardar cambios" : "Guardar dirección"}
              </motion.button>
              <button onClick={cancelForm} style={{ background: "transparent", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-text)", cursor: "pointer", borderRadius: 8, padding: "10px 20px", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vacío */}
      {direcciones.length === 0 && !showForm && (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
          <div className="flex items-center justify-center rounded-full mx-auto mb-4"
            style={{ width: 64, height: 64, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
            <i className="fa-solid fa-location-dot" style={{ fontSize: "1.5rem", color: "var(--color-cq-muted-2)" }} />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-cq-text)", marginBottom: 5 }}>
            No tienes direcciones guardadas
          </h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-muted)" }}>
            Agrega una para agilizar tus compras
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {direcciones.map((dir, i) => (
            <motion.div
              key={dir.id} layout
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl p-5"
              style={{
                background: "var(--color-cq-surface)",
                border: dir.es_predeterminada ? "1.5px solid var(--color-cq-accent)" : "1px solid var(--color-cq-border)",
                opacity: deletingId === dir.id ? 0.4 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {/* Header card */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  {dir.es_predeterminada && (
                    <span className="px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "rgba(37,99,235,0.1)", color: "var(--color-cq-accent)", fontFamily: "var(--font-mono)", fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Predeterminada
                    </span>
                  )}
                  {dir.alias && (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                      {dir.alias}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <motion.button onClick={() => openEdit(dir)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Editar"
                    style={{ width: 30, height: 30, borderRadius: 6, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)", cursor: "pointer", color: "var(--color-cq-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-pen" style={{ fontSize: "0.62rem" }} />
                  </motion.button>
                  <motion.button onClick={() => handleDelete(dir.id)} disabled={deletingId === dir.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Eliminar"
                    style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", cursor: deletingId === dir.id ? "not-allowed" : "pointer", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-trash" style={{ fontSize: "0.6rem" }} />
                  </motion.button>
                </div>
              </div>

              {/* Datos */}
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-text)", lineHeight: 1.7 }}>
                {dir.nombre} {dir.apellido}
                {dir.empresa && <><br /><span style={{ color: "var(--color-cq-muted)" }}>{dir.empresa}</span></>}
                <br />{dir.calle} {dir.numero_ext}{dir.numero_int ? ` Int. ${dir.numero_int}` : ""}
                <br />{dir.colonia}, {dir.ciudad}
                <br />{dir.estado}, C.P. {dir.codigo_postal}
                {dir.telefono && <><br /><span style={{ color: "var(--color-cq-muted)" }}>Tel: {dir.telefono}</span></>}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}