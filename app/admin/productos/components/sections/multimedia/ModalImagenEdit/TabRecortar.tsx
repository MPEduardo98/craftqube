// app/admin/productos/components/sections/multimedia/ModalImagenEdit/TabRecortar.tsx
"use client";

interface TabRecortarProps {
  cropRatio: string | null;
  handleCropRatio: (ratio: string | null) => void;
  handleApplyCrop: () => void;
}

const cropRatios = [
  { ratio: "1:1", label: "Cuadrado" },
  { ratio: "3:2", label: "3:2" },
  { ratio: "5:4", label: "5:4" },
  { ratio: "7:5", label: "7:5" },
  { ratio: "16:9", label: "16:9" },
];

export function TabRecortar({
  cropRatio,
  handleCropRatio,
  handleApplyCrop,
}: TabRecortarProps) {
  return (
    <>
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "var(--color-cq-text)" }}
        >
          Relación de aspecto
        </label>
        <div className="grid grid-cols-3 gap-2">
          {cropRatios.map((item) => (
            <button
              key={item.ratio}
              type="button"
              onClick={() => handleCropRatio(item.ratio)}
              className="px-3 py-2 text-xs font-medium rounded border transition"
              style={{
                background:
                  cropRatio === item.ratio
                    ? "var(--color-cq-accent-glow)"
                    : "var(--color-cq-surface)",
                borderColor:
                  cropRatio === item.ratio
                    ? "var(--color-cq-primary)"
                    : "var(--color-cq-border)",
                color:
                  cropRatio === item.ratio
                    ? "var(--color-cq-primary)"
                    : "var(--color-cq-text)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => handleCropRatio(null)}
          className="w-full mt-2 px-3 py-2 text-xs font-medium rounded border transition"
          style={{
            background: "var(--color-cq-surface)",
            borderColor: "var(--color-cq-border)",
            color: "var(--color-cq-text)",
          }}
        >
          Formato libre
        </button>
      </div>

      <button
        type="button"
        onClick={handleApplyCrop}
        className="btn-primary w-full justify-center"
      >
        Aplicar recorte
      </button>
    </>
  );
}