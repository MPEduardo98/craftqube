// app/(main)/cuenta/direcciones/page.tsx
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

export default function DireccionesPage() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    alias: "",
    nombre: "",
    apellido: "",
    empresa: "",
    telefono: "",
    calle: "",
    numero_ext: "",
    numero_int: "",
    colonia: "",
    ciudad: "",
    municipio: "",
    estado: "",
    codigo_postal: "",
    pais: "MX",
    referencias: "",
    es_predeterminada: false,
    tipo: "envio",
  });

  useEffect(() => {
    fetchDirecciones();
  }, []);

  const fetchDirecciones = async () => {
    try {
      const res = await fetch("/api/users/addresses", { credentials: "include" });
      const data = await res.json();

      if (res.ok && data.success) {
        setDirecciones(data.data || []);
      }
    } catch (err) {
      console.error("Error al cargar direcciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/users/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Dirección guardada correctamente" });
        setShowForm(false);
        resetForm();
        fetchDirecciones();
      } else {
        setMessage({ type: "error", text: data.error || "Error al guardar dirección" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  const resetForm = () => {
    setFormData({
      alias: "",
      nombre: "",
      apellido: "",
      empresa: "",
      telefono: "",
      calle: "",
      numero_ext: "",
      numero_int: "",
      colonia: "",
      ciudad: "",
      municipio: "",
      estado: "",
      codigo_postal: "",
      pais: "MX",
      referencias: "",
      es_predeterminada: false,
      tipo: "envio",
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "3px solid var(--color-cq-border)",
            borderTopColor: "var(--color-cq-accent)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-cq-muted)" }}>
          {direcciones.length} {direcciones.length === 1 ? "dirección" : "direcciones"}
        </p>

        {!showForm && (
          <motion.button
            onClick={() => setShowForm(true)}
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
            <i className="fa-solid fa-plus" style={{ fontSize: "0.75rem" }} />
            Nueva dirección
          </motion.button>
        )}
      </div>

      {/* Mensaje */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl p-4"
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
      </AnimatePresence>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-6"
            style={{
              background: "var(--color-cq-surface)",
              border: "1px solid var(--color-cq-border)",
            }}
          >
            <h3
              className="mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--color-cq-text)",
              }}
            >
              Nueva dirección
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Alias (Casa, Oficina, etc.)"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Nombre *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Apellido *"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="tel"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Calle *"
                value={formData.calle}
                onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Número exterior *"
                value={formData.numero_ext}
                onChange={(e) => setFormData({ ...formData, numero_ext: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Número interior"
                value={formData.numero_int}
                onChange={(e) => setFormData({ ...formData, numero_int: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Colonia *"
                value={formData.colonia}
                onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Ciudad *"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Estado *"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <input
                type="text"
                placeholder="Código postal *"
                value={formData.codigo_postal}
                onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                className="rounded-lg px-4 py-3"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              />

              <textarea
                placeholder="Referencias"
                value={formData.referencias}
                onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                rows={3}
                className="rounded-lg px-4 py-3 sm:col-span-2"
                style={{
                  background: "var(--color-cq-bg)",
                  border: "1px solid var(--color-cq-border)",
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  resize: "none",
                }}
              />
            </div>

            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.es_predeterminada}
                onChange={(e) => setFormData({ ...formData, es_predeterminada: e.target.checked })}
                className="w-4 h-4"
              />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)" }}>
                Usar como dirección predeterminada
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg px-6 py-3"
                style={{
                  background: "var(--color-cq-primary)",
                  color: "white",
                  border: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Guardar dirección
              </button>

              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg px-6 py-3"
                style={{
                  background: "transparent",
                  color: "var(--color-cq-text)",
                  border: "1px solid var(--color-cq-border)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de direcciones */}
      {direcciones.length === 0 && !showForm && (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "var(--color-cq-surface)",
            border: "1px solid var(--color-cq-border)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full mx-auto mb-6"
            style={{
              width: 80,
              height: 80,
              background: "var(--color-cq-surface-2)",
              border: "1px solid var(--color-cq-border)",
            }}
          >
            <i className="fa-solid fa-location-dot" style={{ fontSize: "2rem", color: "var(--color-cq-muted-2)" }} />
          </div>
          <h3
            className="mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "var(--color-cq-text)",
            }}
          >
            No tienes direcciones guardadas
          </h3>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              color: "var(--color-cq-muted)",
            }}
          >
            Agrega una dirección para agilizar tus compras
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {direcciones.map((dir, i) => (
            <motion.div
              key={dir.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-5"
              style={{
                background: "var(--color-cq-surface)",
                border: dir.es_predeterminada ? "2px solid var(--color-cq-accent)" : "1px solid var(--color-cq-border)",
              }}
            >
              {dir.es_predeterminada && (
                <span
                  className="inline-block px-3 py-1 rounded-full mb-3"
                  style={{
                    background: "rgba(37,99,235,0.1)",
                    color: "var(--color-cq-accent)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Predeterminada
                </span>
              )}

              {dir.alias && (
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--color-cq-text)",
                  }}
                >
                  {dir.alias}
                </p>
              )}

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "var(--color-cq-text)",
                  lineHeight: 1.6,
                }}
              >
                {dir.nombre} {dir.apellido}
                <br />
                {dir.calle} {dir.numero_ext}
                {dir.numero_int && ` Int. ${dir.numero_int}`}
                <br />
                {dir.colonia}, {dir.ciudad}
                <br />
                {dir.estado}, C.P. {dir.codigo_postal}
                <br />
                {dir.pais}
                {dir.telefono && (
                  <>
                    <br />
                    Tel: {dir.telefono}
                  </>
                )}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}