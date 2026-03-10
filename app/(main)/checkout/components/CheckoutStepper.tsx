// app/(main)/checkout/components/CheckoutStepper.tsx
"use client";

import { motion } from "framer-motion";
import { STEPS, type CheckoutStep } from "../types";

/* Icono FA por step */
const STEP_ICONS: Record<string, string> = {
  contacto:     "fa-solid fa-user",
  envio:        "fa-solid fa-location-dot",
  pago:         "fa-solid fa-credit-card",
  confirmacion: "fa-solid fa-check",
};

interface Props {
  currentStep: CheckoutStep;
}

export function CheckoutStepper({ currentStep }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    /* Contenedor centrado — ocupa todo el ancho disponible */
    <div className="flex items-start justify-center w-full">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive    = idx === currentIndex;
        const isLast      = idx === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-start"
            style={{ flex: isLast ? "0 0 auto" : 1, minWidth: 0 }}>

            {/* ── Nodo + label ── */}
            <div className="flex flex-col items-center gap-2" style={{ flexShrink: 0 }}>

              {/* Círculo */}
              <motion.div
                animate={{
                  background: isCompleted || isActive
                    ? "var(--color-cq-primary)"
                    : "var(--color-cq-surface-2)",
                  borderColor: isCompleted || isActive
                    ? "var(--color-cq-accent)"
                    : "var(--color-cq-border)",
                  scale: isActive ? 1.08 : 1,
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(37,99,235,0.15)"
                    : "none",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 40, height: 40,
                  border: "2px solid",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {isCompleted ? (
                  /* Check animado */
                  <motion.i
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="fa-solid fa-check"
                    style={{ fontSize: "0.75rem", color: "white" }}
                  />
                ) : (
                  /* Icono del step */
                  <motion.i
                    key={step.id}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={STEP_ICONS[step.id]}
                    style={{
                      fontSize: "0.8rem",
                      color: isActive ? "white" : "var(--color-cq-muted-2)",
                    }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  color: isActive
                    ? "var(--color-cq-accent)"
                    : isCompleted
                    ? "var(--color-cq-muted)"
                    : "var(--color-cq-muted-2)",
                  fontWeight: isActive ? 600 : 400,
                }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {step.shortLabel}
              </motion.span>
            </div>

            {/* ── Línea conectora ── */}
            {!isLast && (
              <div className="relative"
                style={{ flex: 1, height: 2, margin: "19px 8px 0", minWidth: 16 }}>
                {/* Track */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "var(--color-cq-border)",
                  borderRadius: 2,
                }} />
                {/* Progress */}
                <motion.div
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    position: "absolute", inset: 0,
                    background: "var(--color-cq-accent)",
                    borderRadius: 2,
                    transformOrigin: "left",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}