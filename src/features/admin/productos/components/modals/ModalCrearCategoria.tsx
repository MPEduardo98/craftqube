// features/admin/productos/components/modals/ModalCrearCategoria.tsx
// ─────────────────────────────────────────────────────────────
// Modal para crear una categoría al vuelo desde el formulario de
// producto. Usa el Modal global y POST /api/admin/categorias.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Loader } from "@/shared/components/ui/Loader";
import { inputCls, slugify, type Categoria } from "../producto-form-types";

interface Props {
  open:      boolean;
  onClose:   () => void;
  onCreated: (categoria: Categoria) => void;
}

export function ModalCrearCategoria({ open, onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const reset = () => { setNombre(""); setError(""); setSaving(false); };

  const handleClose = () => {
    if (saving) return; // no cerrar a medio guardar
    reset();
    onClose();
  };

  const handleCreate = async () => {
    const value = nombre.trim();
    if (!value) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categorias", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ nombre: value, slug: slugify(value) }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Error al crear la categoría");
        return;
      }
      onCreated({ id: json.data.id, nombre: json.data.nombre, slug: json.data.slug });
      reset();
      onClose();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nueva categoría"
      maxWidth="26rem"
      closeOnBackdrop={!saving}
      footer={saving ? undefined : (
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: "transparent",
              border:     "1px solid var(--color-cq-border)",
              color:      "var(--color-cq-muted)",
              cursor:     "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!nombre.trim()}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: "var(--color-cq-accent)",
              border:     "none",
              color:      "#fff",
              cursor:     !nombre.trim() ? "not-allowed" : "pointer",
              opacity:    !nombre.trim() ? 0.6 : 1,
            }}
          >
            Crear categoría
          </button>
        </>
      )}
    >
      {saving ? (
        <div className="py-6">
          <Loader text="Creando categoría…" />
        </div>
      ) : (
      <>
      <label className="flex flex-col gap-1.5">
        <span
          style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "0.68rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         "var(--color-cq-muted)",
          }}
        >
          Nombre de la categoría
        </span>
        <input
          autoFocus
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreate(); } }}
          placeholder="Ej. Herramientas"
          className={inputCls}
        />
      </label>

      {nombre.trim() && (
        <p className="text-xs text-slate-400">
          Slug: <span className="font-mono">{slugify(nombre)}</span>
        </p>
      )}

      {error && (
        <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
      )}
      </>
      )}
    </Modal>
  );
}
