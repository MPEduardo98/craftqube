// app/(main)/cuenta/perfil/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/global/context/AuthContext";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PerfilPage() {
  const { usuario, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    nombre: usuario?.nombre ?? "",
    apellido: usuario?.apellido ?? "",
    telefono: usuario?.telefono ?? "",
    rfc: usuario?.rfc ?? "",
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
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Perfil actualizado correctamente" });
        setEditing(false);
        await refreshUser?.();
      } else {
        setMessage({ type: "error", text: data.error || "Error al actualizar perfil" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: usuario?.nombre ?? "",
      apellido: usuario?.apellido ?? "",
      telefono: usuario?.telefono ?? "",
      rfc: usuario?.rfc ?? "",
      razon_social: usuario?.razon_social ?? "",
    });
    setEditing(false);
    setMessage(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Card principal */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{
          background: "var(--color-cq-surface)",
          border: "1px solid var(--color-cq-border)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-cq-text)",
              }}
            >
              Información personal
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                color: "var(--color-cq-muted)",
                marginTop: 4,
              }}
            >
              Actualiza tus datos personales y de facturación
            </p>
          </div>

          {!editing && (
            <motion.button
              onClick={() => setEditing(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{
                background: "var(--color-cq-primary)",
                color: "white",
                border: "none",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <i className="fa-solid fa-pen" style={{ fontSize: "0.75rem" }} />
              Editar
            </motion.button>
          )}
        </div>

        {/* Mensaje */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl p-4"
            style={{
              background: message.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}
          >
            <i
              className={message.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"}
              style={{
                fontSize: "1rem",
                color: message.type === "success" ? "#10b981" : "#ef4444",
              }}
            />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)" }}>
              {message.text}
            </p>
          </motion.div>
        )}

        {/* Campos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-cq-muted)",
                marginBottom: 8,
              }}
            >
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              disabled={!editing}
              className="w-full rounded-lg px-4 py-3"
              style={{
                background: editing ? "var(--color-cq-bg)" : "var(--color-cq-surface-2)",
                border: "1px solid var(--color-cq-border)",
                color: "var(--color-cq-text)",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-cq-muted)",
                marginBottom: 8,
              }}
            >
              Apellido
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              disabled={!editing}
              className="w-full rounded-lg px-4 py-3"
              style={{
                background: editing ? "var(--color-cq-bg)" : "var(--color-cq-surface-2)",
                border: "1px solid var(--color-cq-border)",
                color: "var(--color-cq-text)",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-cq-muted)",
                marginBottom: 8,
              }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              value={usuario?.email ?? ""}
              disabled
              className="w-full rounded-lg px-4 py-3"
              style={{
                background: "var(--color-cq-surface-2)",
                border: "1px solid var(--color-cq-border)",
                color: "var(--color-cq-muted-2)",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                cursor: "not-allowed",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-cq-muted)",
                marginBottom: 8,
              }}
            >
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              disabled={!editing}
              placeholder="222 123 4567"
              className="w-full rounded-lg px-4 py-3"
              style={{
                background: editing ? "var(--color-cq-bg)" : "var(--color-cq-surface-2)",
                border: "1px solid var(--color-cq-border)",
                color: "var(--color-cq-text)",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Datos de facturación */}
        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--color-cq-border)" }}>
          <h3
            className="mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-cq-text)",
            }}
          >
            Datos de facturación <span style={{ color: "var(--color-cq-muted-2)", fontSize: "0.85rem", fontWeight: 400 }}>(opcional)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-cq-muted)",
                  marginBottom: 8,
                }}
              >
                RFC
              </label>
              <input
                type="text"
                value={formData.rfc}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                disabled={!editing}
                placeholder="XAXX010101000"
                maxLength={13}
                className="w-full rounded-lg px-4 py-3"
                style={{
                  background: editing ? "var(--color-cq-bg)" : "var(--color-cq-surface-2)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  outline: "none",
                  textTransform: "uppercase",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-cq-muted)",
                  marginBottom: 8,
                }}
              >
                Razón social
              </label>
              <input
                type="text"
                value={formData.razon_social}
                onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                disabled={!editing}
                placeholder="Empresa S.A. de C.V."
                className="w-full rounded-lg px-4 py-3"
                style={{
                  background: editing ? "var(--color-cq-bg)" : "var(--color-cq-surface-2)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mt-6"
          >
            <motion.button
              onClick={handleSave}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 flex-1 sm:flex-initial"
              style={{
                background: "var(--color-cq-primary)",
                color: "white",
                border: "none",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                    }}
                  />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check" style={{ fontSize: "0.8rem" }} />
                  Guardar cambios
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleCancel}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg px-6 py-3"
              style={{
                background: "transparent",
                color: "var(--color-cq-text)",
                border: "1px solid var(--color-cq-border)",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Cancelar
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Info adicional */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl p-6"
        style={{
          background: "var(--color-cq-surface-2)",
          border: "1px solid var(--color-cq-border)",
        }}
      >
        <div>
          <p
            className="uppercase tracking-wider mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--color-cq-muted-2)",
            }}
          >
            Cuenta creada
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)" }}>
            {formatDate(usuario?.created_at ?? null)}
          </p>
        </div>

        <div>
          <p
            className="uppercase tracking-wider mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--color-cq-muted-2)",
            }}
          >
            Último acceso
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)" }}>
            {formatDate(usuario?.ultimo_login ?? null)}
          </p>
        </div>

        <div>
          <p
            className="uppercase tracking-wider mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--color-cq-muted-2)",
            }}
          >
            Email verificado
          </p>
          <div className="flex items-center gap-2">
            <i
              className={usuario?.email_verificado ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"}
              style={{
                fontSize: "0.85rem",
                color: usuario?.email_verificado ? "#10b981" : "#ef4444",
              }}
            />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)" }}>
              {usuario?.email_verificado ? "Verificado" : "Pendiente"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}