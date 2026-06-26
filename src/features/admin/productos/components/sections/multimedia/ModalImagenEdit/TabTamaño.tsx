// app/admin/productos/components/sections/multimedia/ModalImagenEdit/TabTamaño.tsx
"use client";

interface TabTamañoProps {
  resizeW: string;
  resizeH: string;
  setResizeW: (val: string) => void;
  setResizeH: (val: string) => void;
  handleApplyResize: () => void;
}

export function TabTamaño({
  resizeW,
  resizeH,
  setResizeW,
  setResizeH,
  handleApplyResize,
}: TabTamañoProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-xs font-medium mb-2"
            style={{ color: "var(--color-cq-text)" }}
          >
            Ancho (px)
          </label>
          <input
            type="number"
            value={resizeW}
            onChange={(e) => setResizeW(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 transition"
            style={{
              background: "var(--color-cq-surface)",
              borderColor: "var(--color-cq-border)",
              color: "var(--color-cq-text)",
            }}
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-2"
            style={{ color: "var(--color-cq-text)" }}
          >
            Alto (px)
          </label>
          <input
            type="number"
            value={resizeH}
            onChange={(e) => setResizeH(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 transition"
            style={{
              background: "var(--color-cq-surface)",
              borderColor: "var(--color-cq-border)",
              color: "var(--color-cq-text)",
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleApplyResize}
        className="btn-primary w-full justify-center"
      >
        Aplicar tamaño
      </button>
    </>
  );
}