// app/(main)/checkout/components/FormField.tsx
"use client";

import { motion } from "framer-motion";
import { useState, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

interface BaseProps {
  label:       string;
  error?:      string;
  required?:   boolean;
  className?:  string;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: "input" };
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & {
  as: "select";
  options: string[];
  placeholder?: string;
};

type FormFieldProps = InputProps | SelectProps;

export function FormField(props: FormFieldProps) {
  const { label, error, required, className, as = "input", ...rest } = props;
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "#EF4444"
    : focused
    ? "var(--color-cq-accent)"
    : "var(--color-cq-border)";

  const baseStyle: React.CSSProperties = {
    width: "100%",
    height: 44,
    padding: "0 12px",
    borderRadius: 8,
    border: `1.5px solid ${borderColor}`,
    background: "var(--color-cq-surface)",
    color: "var(--color-cq-text)",
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s ease",
    boxShadow: focused ? `0 0 0 3px ${error ? "rgba(239,68,68,0.12)" : "rgba(37,99,235,0.12)"}` : "none",
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-cq-muted)",
        fontWeight: 500,
      }}>
        {label}
        {required && (
          <span style={{ color: "var(--color-cq-accent)", marginLeft: 2 }}>*</span>
        )}
      </label>

      {as === "select" ? (
        <select
          {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
          style={{ ...baseStyle, cursor: "pointer", appearance: "none" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {(props as SelectProps).placeholder && (
            <option value="">{(props as SelectProps).placeholder}</option>
          )}
          {(props as SelectProps).options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          style={baseStyle}
          onFocus={(e) => { setFocused(true); (rest as InputProps).onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); (rest as InputProps).onBlur?.(e); }}
        />
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            color: "#EF4444",
          }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}