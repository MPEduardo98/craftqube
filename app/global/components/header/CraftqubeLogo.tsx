export function CraftqubeLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon mark */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Cube / profile cross-section geometric mark */}
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="4"
          fill="var(--color-cq-800)"
          stroke="var(--color-cq-600)"
          strokeWidth="1"
        />
        {/* Aluminum profile cross-section */}
        <rect x="7" y="7" width="8" height="18" rx="1" fill="var(--color-cq-500)" opacity="0.9" />
        <rect x="17" y="7" width="8" height="18" rx="1" fill="var(--color-cq-400)" opacity="0.7" />
        <rect x="7" y="13" width="18" height="6" rx="1" fill="var(--color-cq-accent)" opacity="0.9" />
        {/* Accent dots */}
        <circle cx="11" cy="9" r="1" fill="white" opacity="0.5" />
        <circle cx="21" cy="9" r="1" fill="white" opacity="0.5" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          style={{
            fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)",
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "white",
            lineHeight: 1,
          }}
        >
          Craft<span style={{ color: "var(--color-cq-accent)" }}>qube</span>
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains, monospace)",
            fontSize: "0.5rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-cq-steel-400)",
            lineHeight: 1,
            marginTop: "2px",
          }}
        >
          INDUSTRIAL TECH
        </span>
      </div>
    </div>
  );
}