"use client";
// features/admin/productos/components/BulkEditContext.tsx
import { createContext, useContext, useState } from "react";

interface BulkEditCtx {
  editMode:    boolean;
  setEditMode: (v: boolean) => void;
}

const Ctx = createContext<BulkEditCtx>({ editMode: false, setEditMode: () => {} });

export const useBulkEdit = () => useContext(Ctx);

/** Provee el estado de "editar masivamente" a la página (header, stats) y a la tabla. */
export function BulkEditProvider({ children }: { children: React.ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  return <Ctx.Provider value={{ editMode, setEditMode }}>{children}</Ctx.Provider>;
}

/** Oculta a sus hijos mientras el modo de edición masiva esté activo. */
export function HideOnBulkEdit({ children }: { children: React.ReactNode }) {
  const { editMode } = useBulkEdit();
  if (editMode) return null;
  return <>{children}</>;
}
