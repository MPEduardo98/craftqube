// app/(auth)/login/components/LoginForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/global/context/AuthContext";

/* ────────────────────────────────────────────────────────── */
/*  Campo de formulario                                        */
/* ────────────────────────────────────────────────────────── */
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  icon: string;           // fa class
  suffix?: React.ReactNode;
  onSuffixClick?: () => void;
}

function Field({ label, type = "text", value, onChange, error, autoComplete, placeholder, icon, suffix, onSuffixClick }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
        transition: "color 0.2s",
        fontWeight: 500,
      }}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        {/* Left icon */}
        <i
          className={icon}
          style={{
            position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
            fontSize: "0.8rem",
            color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
            transition: "color 0.2s",
            pointerEvents: "none",
          }}
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "var(--color-cq-surface-2)",
            border: `1.5px solid ${error ? "rgba(239,68,68,0.55)" : focused ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
            borderRadius: "10px",
            padding: `12px ${suffix ? "44px" : "16px"} 12px 40px`,
            fontSize: "0.9rem",
            color: "var(--color-cq-text)",
            fontFamily: "var(--font-body)",
            outline: "none",
            boxShadow: focused ? "0 0 0 3px var(--color-cq-accent-glow)" : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />
        {suffix && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onSuffixClick}
            style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              color: "var(--color-cq-muted)", background: "none", border: "none",
              cursor: "pointer", display: "flex", padding: "4px", borderRadius: "4px",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-cq-text)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-cq-muted)")}
          >
            {suffix}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: "0.78rem", color: "rgba(239,68,68,0.9)", fontFamily: "var(--font-body)", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}
          >
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "0.7rem" }} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Panel izquierdo                                            */
/* ────────────────────────────────────────────────────────── */
const BENEFITS = [
  { icon: "fa-solid fa-box",          label: "Rastrea pedidos en tiempo real" },
  { icon: "fa-solid fa-bolt",         label: "Checkout express con datos guardados" },
  { icon: "fa-solid fa-clock-rotate-left", label: "Historial completo de compras" },
  { icon: "fa-solid fa-bell",         label: "Alertas de stock y precios" },
];

function LeftPanel() {
  return (
    <div style={{
      width: "100%", height: "100%",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
      justifyContent: "space-between",
      padding: "48px 52px",
      background: "linear-gradient(145deg, #0f2394 0%, #1638c8 55%, #2563EB 100%)",
    }}>
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "36px 36px",
      }} />
      {/* Glows */}
      <div style={{
        position: "absolute", top: "-100px", right: "-60px",
        width: "350px", height: "350px", borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(96,165,250,0.22) 0%, transparent 65%)",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", left: "-60px",
        width: "300px", height: "300px", borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(18,36,160,0.4) 0%, transparent 70%)",
      }} />

      {/* Logo blanco */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Link href="/">
          <Image
            src="/Logo.png"
            alt="Craftqube"
            width={160}
            height={36}
            style={{ height: "auto", filter: "brightness(0) invert(1)" }}
            priority
          />
        </Link>
      </motion.div>

      {/* Headline + benefits */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.6rem",
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)", marginBottom: "12px",
        }}>
          Tu cuenta personal
        </p>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(2rem, 3.2vw, 2.8rem)", lineHeight: 1.03,
          textTransform: "uppercase", color: "white",
          margin: "0 0 32px 0",
        }}>
          Todo lo que<br />
          <span style={{ color: "rgba(147,197,253,1)" }}>necesitas</span>
          <br />en un lugar
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: 0.25 + i * 0.08 }}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div style={{
                width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={b.icon} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }} />
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(255,255,255,0.72)" }}>
                {b.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <p style={{
        position: "relative", zIndex: 1,
        fontFamily: "var(--font-mono)", fontSize: "0.58rem",
        letterSpacing: "0.06em", color: "rgba(255,255,255,0.25)",
      }}>
        © 2026 Craftqube · Materiales industriales de calidad
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Export principal                                           */
/* ────────────────────────────────────────────────────────── */
export function LoginForm() {
  const { login }    = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim())                    e.email    = "Ingresa tu correo";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = "Correo no válido";
    if (!password)                        e.password = "Ingresa tu contraseña";
    else if (password.length < 6)         e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      router.push(searchParams.get("redirect") ?? "/");
    } else {
      setApiError(result.error ?? "Credenciales incorrectas");
    }
  }

  return (
    /* Fixed full-screen — tapa header */
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", overflow: "auto",
      background: "var(--color-cq-bg)",
    }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />

      {/* LEFT — solo desktop */}
      <div className="hidden lg:block" style={{ flex: "0 0 44%", maxWidth: "500px" }}>
        <LeftPanel />
      </div>

      {/* RIGHT — form */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 24px", minHeight: "100%",
      }}>

        {/* Mobile logo */}
        <motion.div
          className="flex lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "36px" }}
        >
          <Link href="/">
            <Image src="/Logo.png" alt="Craftqube" width={150} height={34} style={{ height: "auto" }} priority />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: "400px" }}
        >
          {/* Encabezado */}
          <div style={{ marginBottom: "32px" }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "0.62rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--color-cq-accent)", marginBottom: "8px",
            }}>
              Bienvenido de vuelta
            </p>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "2rem", textTransform: "uppercase",
              color: "var(--color-cq-text)", lineHeight: 1.08,
              margin: "0 0 10px 0",
            }}>
              Iniciar sesión
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)" }}>
              ¿No tienes cuenta?{" "}
              <Link href="/registro" style={{ color: "var(--color-cq-accent)", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "none")}
              >
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <Field
              label="Correo electrónico" type="email" icon="fa-solid fa-envelope"
              value={email}
              onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); setApiError(""); }}
              error={errors.email} autoComplete="email" placeholder="tucorreo@empresa.com"
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Field
                label="Contraseña" type={showPass ? "text" : "password"} icon="fa-solid fa-lock"
                value={password}
                onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); setApiError(""); }}
                error={errors.password} autoComplete="current-password" placeholder="••••••••"
                suffix={
                  <i
                    className={showPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
                    style={{ fontSize: "0.85rem" }}
                  />
                }
                onSuffixClick={() => setShowPass((v) => !v)}
              />
              <div style={{ textAlign: "right" }}>
                <Link href="/recuperar-password" style={{
                  fontFamily: "var(--font-body)", fontSize: "0.8rem",
                  color: "var(--color-cq-muted)", textDecoration: "none",
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-accent)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-muted)")}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Error API */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 14px", borderRadius: "10px",
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.22)",
                    color: "rgba(239,68,68,0.9)",
                  }}
                >
                  <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "0.9rem", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem" }}>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.015, boxShadow: "0 8px 28px rgba(29,78,216,0.38)" }}
              whileTap={loading ? {} : { scale: 0.985 }}
              style={{
                width: "100%", height: "52px", borderRadius: "11px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                background: loading ? "var(--color-cq-border)" : "var(--color-cq-primary)",
                color: loading ? "var(--color-cq-muted)" : "white",
                fontFamily: "var(--font-display)", fontSize: "0.875rem",
                fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 18px rgba(29,78,216,0.28)",
                transition: "background 0.2s, box-shadow 0.2s",
                marginTop: "4px",
              }}
            >
              {loading ? (
                <>
                  <motion.i
                    className="fa-solid fa-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block", fontSize: "0.9rem" }}
                  />
                  Verificando...
                </>
              ) : (
                <>
                  Entrar a mi cuenta
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }} />
                </>
              )}
            </motion.button>

          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--color-cq-border)" }} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.58rem",
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--color-cq-muted-2)", whiteSpace: "nowrap",
            }}>
              o continúa como
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--color-cq-border)" }} />
          </div>

          {/* Guest CTA */}
          <motion.div whileHover={{ scale: 1.008 }} whileTap={{ scale: 0.994 }}>
            <Link href="/catalogo" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", height: "46px", borderRadius: "11px",
              background: "var(--color-cq-surface)",
              border: "1.5px solid var(--color-cq-border)",
              color: "var(--color-cq-muted)",
              fontFamily: "var(--font-display)", fontSize: "0.775rem",
              fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              textDecoration: "none", transition: "border-color 0.2s, color 0.2s, background 0.2s",
            }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(37,99,235,0.35)";
                el.style.color = "var(--color-cq-accent)";
                el.style.background = "var(--color-cq-accent-glow)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "var(--color-cq-border)";
                el.style.color = "var(--color-cq-muted)";
                el.style.background = "var(--color-cq-surface)";
              }}
            >
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: "0.85rem" }} />
              Comprar sin cuenta
            </Link>
          </motion.div>

          {/* Legal */}
          <p style={{
            textAlign: "center", marginTop: "22px",
            fontFamily: "var(--font-body)", fontSize: "0.75rem",
            color: "var(--color-cq-muted-2)", lineHeight: 1.65,
          }}>
            Al continuar aceptas nuestros{" "}
            <Link href="/politicas/terminos" style={{ color: "var(--color-cq-muted)", textDecoration: "underline" }}>Términos</Link>
            {" "}y{" "}
            <Link href="/politicas/politica-de-privacidad" style={{ color: "var(--color-cq-muted)", textDecoration: "underline" }}>Privacidad</Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}