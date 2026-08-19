"use client";
// features/admin/cupones/components/CrearCuponButton.tsx
// Botón del encabezado que abre el modal de nuevo cupón.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModalCupon } from "./ModalCupon";

export function CrearCuponButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-[11px] inline-flex items-center gap-2 shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Agregar cupón
      </button>

      <ModalCupon
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => router.refresh()}
        cupon={null}
      />
    </>
  );
}
