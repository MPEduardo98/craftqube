"use client";
// features/admin/categorias/components/CrearCategoriaButton.tsx
// Botón del encabezado que abre el modal de nueva categoría.
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModalCategoria } from "./ModalCategoria";
import type { CategoriaRow } from "../types";

export function CrearCategoriaButton({ categorias }: { categorias: CategoriaRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [opciones, setOpciones] = useState(categorias);

  useEffect(() => { setOpciones(categorias); }, [categorias]);

  /** La página sólo envía la primera tanda: trae la lista completa para el
      selector de categoría padre al abrir el modal. */
  const abrir = async () => {
    setOpen(true);
    try {
      const res  = await fetch("/api/admin/categorias?limit=100&sort=nombre_asc");
      const json = await res.json();
      if (json.success) setOpciones(json.data);
    } catch { /* se conserva la lista inicial */ }
  };

  return (
    <>
      <button onClick={abrir} className="btn-primary text-[11px] inline-flex items-center gap-2 shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Agregar categoría
      </button>

      <ModalCategoria
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => router.refresh()}
        categoria={null}
        categorias={opciones}
      />
    </>
  );
}
