// app/(main)/cuenta/components/sections/PerfilSection.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/global/context/AuthContext";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function Field({
  label, value, editing, type = "text", onChange, placeholder, colSpan = 1,
}: {
  label: string; value: string; editing: boolean; type?: string;
  onChange: (v: string) => void; placeholder?: string; colSpan?: number;
}) {
  return (
    <div style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined }}>
      <p style={{
        fontFamily: "var(--font-mono)", fontSize: "0.56rem",
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--color-cq-muted-2)", marginBottom: 6,
      }}>
        {label}
      </p>
      {editing ? (
        <input
          type={type}
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
      ) : (
        <p style={{
          fontFamily: "var(--font-body)", fontSize: "0.875rem",
          color: value ? "var(--color-cq-text)" : "var(--color-cq-muted-2)",
          padding: "12px 16px",
          background: "var(--color-cq-surface-2)",
          borderRadius: 8,
          border: "1px solid var(--color-cq-border)",
        }}>
          {value || "—"}
        </p>
      )}
    </div>
  );
}

export function PerfilSection() {
  const { usuario, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    nombre:       usuario?.nombre ?? "",
    apellido:     usuario?.apellido ?? "",
    telefono:     usuario?.telefono ?? "",
    rfc:          usuario?.rfc ?? "",
    razon_social: usuario?.razon_social ?? "",
  });

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Perfil actualizado correctamente" });
        setEditing(false);
        await refreshUser?.();
      } else {
        setMessage({ type: "error", text: data.error || "Error al actualizar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      nombre:       usuario?.nombre ?? "",
      apellido:     usuario?.apellido ?? "",
      telefono:     usuario?.telefono ?? "",
      rfc:          usuario?.rfc ?? "",
      razon_social: usuario?.razon_social ?? "",
    });
    setEditing(false);
    setMessage(null);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Card principal */}
      <div
        className="rounded-xl p-6"
        style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-6 pb-5" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
              Información personal
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted)", marginTop: 2 }}>
              Nombre, contacto y datos de facturación
            </p>
          </div>
          {!editing && (
            <motion.button
              onClick={() => setEditing(true)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{
                background: "var(--color-cq-primary)", color: "white",
                border: "none", cursor: "pointer",
                fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600,
              }}
            >
              <i className="fa-solid fa-pen" style={{ fontSize: "0.72rem" }} />
              Editar
            </motion.button>
          )}
        </div>

        {/* Mensaje */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl p-4 mb-5"
            style={{
              background: message.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}
          >
            <i
              className={message.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-exclamation"}
              style={{ color: message.type === "success" ? "#10b981" : "#ef4444", fontSize: "0.85rem" }}
            />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-text)" }}>
              {message.text}
            </p>
          </motion.div>
        )}

        {/* Datos personales */}
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.16em",
          textTransform: "uppercase", color: "var(--color-cq-accent)", marginBottom: 14,
        }}>
          Datos personales
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="Nombre" value={form.nombre} editing={editing}
            onChange={(v) => setForm({ ...form, nombre: v })} placeholder="Tu nombre" />
          <Field label="Apellido" value={form.apellido} editing={editing}
            onChange={(v) => setForm({ ...form, apellido: v })} placeholder="Tu apellido" />
          <Field label="Correo electrónico" value={usuario?.email ?? ""} editing={false}
            onChange={() => {}} />
          <Field label="Teléfono" value={form.telefono} editing={editing}
            onChange={(v) => setForm({ ...form, telefono: v })} placeholder="10 dígitos" type="tel" />
        </div>

        {/* Facturación */}
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.16em",
          textTransform: "uppercase", color: "var(--color-cq-muted-2)", marginBottom: 14,
        }}>
          Datos de facturación <span style={{ color: "var(--color-cq-muted-2)", fontStyle: "normal", opacity: 0.6 }}>(opcional)</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="RFC" value={form.rfc} editing={editing}
            onChange={(v) => setForm({ ...form, rfc: v })} placeholder="XAXX010101000" />
          <Field label="Razón social" value={form.razon_social} editing={editing}
            onChange={(v) => setForm({ ...form, razon_social: v })} placeholder="Empresa S.A. de C.V." />
        </div>

        {/* Acciones edición */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mt-6 pt-5"
            style={{ borderTop: "1px solid var(--color-cq-border)" }}
          >
            <motion.button
              onClick={handleSave}
              disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-lg px-5 py-3"
              style={{
                background: "var(--color-cq-primary)", color: "white",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }}
                />
              ) : <i className="fa-solid fa-check" style={{ fontSize: "0.75rem" }} />}
              Guardar cambios
            </motion.button>
            <motion.button
              onClick={handleCancel}
              disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="rounded-lg px-5 py-3"
              style={{
                background: "transparent", border: "1px solid var(--color-cq-border)",
                color: "var(--color-cq-text)", cursor: "pointer",
                fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500,
              }}
            >
              Cancelar
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Meta info */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--color-cq-border)" }}
      >
        {[
          { label: "Cuenta creada",    value: formatDate(usuario?.created_at ?? null) },
          { label: "Último acceso",    value: formatDate(usuario?.ultimo_login ?? null) },
          { label: "Email verificado", value: null, verified: usuario?.email_verificado },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: "16px 20px",
              background: "var(--color-cq-surface-2)",
              borderRight: i < 2 ? "1px solid var(--color-cq-border)" : undefined,
            }}
          >
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "0.55rem",
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--color-cq-muted-2)", marginBottom: 6,
            }}>
              {item.label}
            </p>
            {item.verified !== undefined ? (
              <div className="flex items-center gap-2">
                <i
                  className={item.verified ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"}
                  style={{ fontSize: "0.8rem", color: item.verified ? "#10b981" : "#ef4444" }}
                />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-text)" }}>
                  {item.verified ? "Verificado" : "Pendiente"}
                </p>
              </div>
            ) : (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-text)" }}>
                {item.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}