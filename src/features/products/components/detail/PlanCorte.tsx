// features/products/components/detail/PlanCorte.tsx
// Plan de corte para productos que se venden por tramos: resumen en la
// ficha y configurador en un modal.
"use client";

import { useCallback, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import type { ConfigTramos } from "@mpeduardo98/commerce-core/personalizacion/types";
import {
  formatoMedida, textoTramos, type EstadoPlanCorte,
} from "@/features/products/hooks/usePlanCorte";

interface Props {
  config:         ConfigTramos;
  estado:         EstadoPlanCorte;
  /** Precio de la pieza sin cortes, para el total del modal */
  precioBase:     number;
  mostrarPrecios: boolean;
  format:         (n: number) => string;
}

const etiqueta = {
  fontFamily:    "var(--font-mono)",
  fontSize:      "0.65rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color:         "var(--color-cq-muted)",
};

/** Barra proporcional: tramos, cortes y sobrante sobre la pieza. */
function BarraPieza({ config, estado }: { config: ConfigTramos; estado: EstadoPlanCorte }) {
  const u = config.unidad;
  const valores = estado.medidas.map((m) => Number(m.replace(",", "."))).filter((n) => Number.isFinite(n) && n > 0);
  const cortes  = estado.borrador.plan ? estado.borrador.plan.cortes : valores.length;
  const uso     = valores.reduce((s, n) => s + n, 0) + cortes * config.ancho_corte;
  const escala  = Math.max(config.longitud, uso);
  const excede  = uso > config.longitud + 0.005;
  const sobrante = Math.max(0, config.longitud - uso);
  const pct = (n: number) => `${(n / escala) * 100}%`;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="relative flex h-10 w-full overflow-hidden rounded-lg"
        style={{
          background: "var(--color-cq-surface-2)",
          border: `1.5px solid ${excede ? "rgba(239,68,68,0.6)" : "var(--color-cq-border)"}`,
        }}
        role="img"
        aria-label={
          valores.length
            ? `Pieza de ${formatoMedida(config.longitud)} ${u} cortada en ${valores.map(formatoMedida).join(", ")} ${u}`
            : `Pieza de ${formatoMedida(config.longitud)} ${u}`
        }
      >
        {valores.map((v, i) => {
          const conCorte = i < cortes;
          return (
            <div key={i} className="flex h-full shrink-0" style={{ width: pct(v + (conCorte ? config.ancho_corte : 0)) }}>
              <div
                className="flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden"
                style={{
                  background: i % 2 === 0 ? "var(--color-cq-accent)" : "color-mix(in srgb, var(--color-cq-accent) 72%, var(--color-cq-surface))",
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  fontWeight: 600,
                }}
                title={`Tramo ${i + 1}: ${formatoMedida(v)} ${u}`}
              >
                {v / escala > 0.09 && <span className="truncate px-1">{formatoMedida(v)}</span>}
              </div>
              {conCorte && (
                <div className="h-full shrink-0" style={{ width: pct(config.ancho_corte), minWidth: 2, background: "var(--color-cq-text)" }} />
              )}
            </div>
          );
        })}
        {excede && (
          <div className="absolute inset-y-0" style={{ left: pct(config.longitud), right: 0, background: "rgba(239,68,68,0.35)" }} />
        )}
      </div>
      <div className="flex justify-between" style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--color-cq-muted-2)" }}>
        <span>0</span>
        {valores.length > 0 && !excede && sobrante > 0 && (
          <span>Sobrante {formatoMedida(sobrante)} {u}</span>
        )}
        {excede && <span style={{ color: "#EF4444" }}>Excede por {formatoMedida(uso - config.longitud)} {u}</span>}
        <span>{formatoMedida(config.longitud)} {u}</span>
      </div>
    </div>
  );
}

/** Cuerpo del modal: medidas, reglas y estado del borrador. */
function Configurador({ config, estado, mostrarPrecios, format }: Omit<Props, "precioBase">) {
  const u = config.unidad;
  const { borrador } = estado;
  const reglas = [
    config.tramo_minimo > 0 && `Mínimo ${formatoMedida(config.tramo_minimo)} ${u} por tramo`,
    `hasta ${config.max_tramos} tramos`,
    config.ancho_corte > 0 && `cada corte consume ${formatoMedida(config.ancho_corte)} ${u}`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="-mx-1 flex max-h-[calc(100dvh-15rem)] flex-col gap-4 overflow-y-auto px-1">
      <p className="text-sm" style={{ color: "var(--color-cq-muted)" }}>
        Pieza de {formatoMedida(config.longitud)} {u}. Escribe la medida de cada tramo en el orden en que los necesitas.
      </p>

      <BarraPieza config={config} estado={estado} />

      <ol className="flex flex-col gap-2">
        {estado.medidas.map((m, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0" style={{ ...etiqueta, fontSize: "0.62rem" }}>Tramo {i + 1}</span>
            <label className="flex h-11 min-w-0 flex-1 items-center rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500/40"
              style={{ border: "1.5px solid var(--color-cq-border)", background: "var(--color-cq-bg)" }}>
              <input
                type="text"
                inputMode="decimal"
                aria-label={`Medida del tramo ${i + 1} en ${u}`}
                value={m}
                autoFocus={i === estado.medidas.length - 1 && m === ""}
                onChange={(e) => estado.cambiar(i, e.target.value.replace(/[^\d.,]/g, ""))}
                placeholder={config.tramo_minimo > 0 ? formatoMedida(config.tramo_minimo) : "0"}
                className="min-w-0 flex-1 bg-transparent text-base tabular-nums outline-none"
                style={{ color: "var(--color-cq-text)", fontFamily: "var(--font-mono)" }}
              />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-cq-muted-2)" }}>{u}</span>
            </label>
            <button type="button" onClick={() => estado.quitar(i)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-red-500/10 hover:text-red-500"
              style={{ border: "1px solid var(--color-cq-border)", color: "var(--color-cq-muted-2)", background: "none", cursor: "pointer" }}
              aria-label={`Quitar tramo ${i + 1}`}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>

      <button type="button" onClick={estado.agregar} disabled={!estado.puedeAgregar}
        className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors hover:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ border: "1.5px dashed var(--color-cq-border)", color: "var(--color-cq-accent)", background: "none", cursor: "pointer" }}>
        <i className="fa-solid fa-plus text-xs" aria-hidden="true" />
        Agregar tramo
      </button>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-cq-muted-2)" }}>{reglas}</p>

      <div aria-live="polite">
        {borrador.error ? (
          <p className="flex gap-2 rounded-xl px-3 py-2.5 text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
            <i className="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true" />
            {borrador.error}
          </p>
        ) : borrador.plan ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-xl px-3 py-2.5 text-sm sm:grid-cols-3"
            style={{ background: "var(--color-cq-surface-2)", color: "var(--color-cq-text)" }}>
            <div>
              <dt style={etiqueta}>Cortes</dt>
              <dd className="font-semibold tabular-nums">{borrador.plan.cortes}</dd>
            </div>
            <div>
              <dt style={etiqueta}>Sobrante</dt>
              <dd className="font-semibold tabular-nums">
                {borrador.plan.sobrante > 0 ? `${formatoMedida(borrador.plan.sobrante)} ${u}` : "Ninguno"}
              </dd>
              {borrador.plan.sobrante > 0 && (
                <dd className="text-xs" style={{ color: "var(--color-cq-muted)" }}>
                  {config.sobrante === "enviar" ? "Te lo enviamos" : "Se descarta"}
                </dd>
              )}
            </div>
            {mostrarPrecios && config.cargo_corte > 0 && (
              <div>
                <dt style={etiqueta}>Cargo por corte</dt>
                <dd className="font-semibold tabular-nums">
                  {borrador.cargo > 0 ? `+${format(borrador.cargo)}` : "Sin cargo"}
                </dd>
                <dd className="text-xs" style={{ color: "var(--color-cq-muted)" }}>
                  {borrador.plan.cortes} × {format(config.cargo_corte)}
                </dd>
              </div>
            )}
          </dl>
        ) : null}
      </div>
    </div>
  );
}

export function PlanCorte({ config, estado, precioBase, mostrarPrecios, format }: Props) {
  const [abierto, setAbierto] = useState(false);
  const { plan, borrador, aplicar, descartar } = estado;
  const u = config.unidad;

  const cancelar = useCallback(() => {
    descartar();
    setAbierto(false);
  }, [descartar]);

  const usarPlan = () => {
    aplicar();
    setAbierto(false);
  };

  return (
    <section
      aria-labelledby="titulo-plan-corte"
      className="flex flex-col gap-3 rounded-2xl p-4"
      style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span id="titulo-plan-corte" style={etiqueta}>
            <i className="fa-solid fa-ruler-horizontal mr-2" aria-hidden="true" />
            Plan de corte
          </span>
          {plan ? (
            <>
              <p className="font-semibold tabular-nums" style={{ color: "var(--color-cq-text)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
                {textoTramos(plan.tramos, u)}
              </p>
              <p className="text-xs" style={{ color: "var(--color-cq-muted)" }}>
                {plan.cortes} {plan.cortes === 1 ? "corte" : "cortes"}
                {" · "}
                {plan.sobrante > 0
                  ? `sobrante ${formatoMedida(plan.sobrante)} ${u} (${config.sobrante === "enviar" ? "te lo enviamos" : "se descarta"})`
                  : "sin sobrante"}
                {mostrarPrecios && estado.cargo > 0 && ` · +${format(estado.cargo)}`}
              </p>
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--color-cq-muted)" }}>
              Pieza completa de {formatoMedida(config.longitud)} {u}. También te la cortamos a la medida.
            </p>
          )}
        </div>
        {plan && (
          <button type="button" onClick={estado.quitarPlan}
            className="shrink-0 text-xs font-semibold hover:underline"
            style={{ color: "var(--color-cq-muted)", background: "none", border: "none", cursor: "pointer" }}>
            Pieza completa
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors hover:bg-blue-500/5"
        style={{ border: "1.5px solid var(--color-cq-accent)", color: "var(--color-cq-accent)", background: "none", cursor: "pointer", fontFamily: "var(--font-display)" }}
        aria-haspopup="dialog"
        data-analytics-click="plan_corte_abrir"
      >
        <i className={`fa-solid ${plan ? "fa-pen" : "fa-scissors"} text-xs`} aria-hidden="true" />
        {plan ? "Editar plan de corte" : "Cortar a medida"}
      </button>

      <Modal
        open={abierto}
        onClose={cancelar}
        title="Plan de corte"
        icon={<i className="fa-solid fa-ruler-horizontal mt-1" style={{ color: "var(--color-cq-accent)" }} aria-hidden="true" />}
        maxWidth="34rem"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-cq-muted)" }}>
              {mostrarPrecios && precioBase > 0 && borrador.plan && (
                <>Por pieza <strong style={{ color: "var(--color-cq-text)" }}>{format(precioBase + borrador.cargo)}</strong></>
              )}
            </span>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={cancelar}
                className="h-10 rounded-xl px-4 text-sm font-semibold"
                style={{ border: "1px solid var(--color-cq-border)", background: "none", color: "var(--color-cq-text)", cursor: "pointer" }}>
                Cancelar
              </button>
              <button type="button" onClick={usarPlan} disabled={!borrador.plan}
                className="h-10 rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "var(--color-cq-accent)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "var(--font-display)" }}
                data-analytics-click="plan_corte_aplicar">
                Usar este plan
              </button>
            </div>
          </div>
        }
      >
        <Configurador config={config} estado={estado} mostrarPrecios={mostrarPrecios} format={format} />
      </Modal>
    </section>
  );
}
