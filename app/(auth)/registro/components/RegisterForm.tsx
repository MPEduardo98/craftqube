// app/(auth)/registro/components/RegisterForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/global/context/AuthContext";

/* ────────────────────────────────────────────────────────── */
/*  Campo                                                      */
/* ────────────────────────────────────────────────────────── */
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  icon: string;
  suffix?: React.ReactNode;
  onSuffixClick?: () => void;
  optional?: boolean;
}

function Field({
  label, type = "text", value, onChange, error,
  autoComplete, placeholder, icon, suffix, onSuffixClick, optional,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
        {optional && (
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-cq-muted-2)",
          }}>
            Opcional
          </span>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <i className={icon} style={{
          position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
          fontSize: "0.8rem",
          color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
          transition: "color 0.2s",
          pointerEvents: "none",
        }} />
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
          <button type="button" tabIndex={-1} onClick={onSuffixClick}
            style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              color: "var(--color-cq-muted)", background: "none", border: "none",
              cursor: "pointer", display: "flex", padding: "4px",
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
            style={{
              fontSize: "0.78rem", color: "rgba(239,68,68,0.9)",
              fontFamily: "var(--font-body)", margin: 0,
              display: "flex", alignItems: "center", gap: "5px",
            }}
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
const PERKS = [
  { icon: "fa-solid fa-truck-fast",        label: "Seguimiento de envíos en tiempo real" },
  { icon: "fa-solid fa-tags",              label: "Precios exclusivos para clientes registrados" },
  { icon: "fa-solid fa-clock-rotate-left", label: "Historial completo de pedidos" },
  { icon: "fa-solid fa-heart",             label: "Guarda tus productos favoritos" },
  { icon: "fa-solid fa-location-dot",      label: "Guarda múltiples direcciones de envío" },
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
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "36px 36px",
      }} />
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

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Link href="/">
          <Image
            src="/Logo.png" alt="Craftqube"
            width={160} height={36}
            style={{ height: "auto", filter: "brightness(0) invert(1)" }}
            priority
          />
        </Link>
      </motion.div>

      {/* Copy + perks */}
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
          Únete a Craftqube
        </p>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05,
          textTransform: "uppercase", color: "white",
          margin: "0 0 28px 0",
        }}>
          Crea tu cuenta<br />
          <span style={{ color: "rgba(147,197,253,1)" }}>gratis</span>{" "}
          en segundos
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {PERKS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: 0.25 + i * 0.07 }}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={p.icon} style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.85)" }} />
              </div>
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.84rem",
                color: "rgba(255,255,255,0.72)",
              }}>
                {p.label}
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
/*  Indicador de fortaleza de contraseña                       */
/* ────────────────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Muy débil", "Débil", "Regular", "Fuerte"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: "5px" }}
    >
      <div style={{ display: "flex", gap: "4px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "2px",
            background: i < score ? colors[score - 1] : "var(--color-cq-border)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{
        fontFamily: "var(--font-mono)", fontSize: "0.58rem",
        letterSpacing: "0.08em", color: colors[score - 1] ?? "var(--color-cq-muted-2)",
        textTransform: "uppercase",
      }}>
        {labels[score - 1] ?? ""}
      </p>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Export principal                                           */
/* ────────────────────────────────────────────────────────── */
type Errors = Partial<Record<"nombre" | "apellido" | "email" | "telefono" | "password" | "confirmar", string>>;

export function RegisterForm() {
  const { register } = useAuth();
  const router       = useRouter();

  const [nombre,    setNombre]    = useState("");
  const [apellido,  setApellido]  = useState("");
  const [email,     setEmail]     = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [password,  setPassword]  = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState("");
  const [errors,    setErrors]    = useState<Errors>({});

  function clearError(key: keyof Errors) {
    setErrors((p) => ({ ...p, [key]: undefined }));
    setApiError("");
  }

  function validate() {
    const e: Errors = {};
    if (!nombre.trim())                     e.nombre    = "Ingresa tu nombre";
    if (!apellido.trim())                   e.apellido  = "Ingresa tu apellido";
    if (!email.trim())                      e.email     = "Ingresa tu correo";
    else if (!/\S+@\S+\.\S+/.test(email))   e.email     = "Correo no válido";
    if (telefono && !/^\d{10}$/.test(telefono.replace(/\s|-/g, "")))
                                            e.telefono  = "10 dígitos requeridos";
    if (!password)                          e.password  = "Ingresa una contraseña";
    else if (password.length < 6)           e.password  = "Mínimo 6 caracteres";
    if (!confirmar)                         e.confirmar = "Confirma tu contraseña";
    else if (confirmar !== password)        e.confirmar = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    const result = await register({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      password,
      telefono: telefono.trim() || undefined,
    });
    setLoading(false);
    if (result.ok) {
      router.push("/");
    } else {
      setApiError(result.error ?? "Error al crear cuenta");
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", overflow: "auto",
      background: "var(--color-cq-bg)",
    }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />

      {/* LEFT */}
      <div className="hidden lg:block" style={{ flex: "0 0 44%", maxWidth: "500px" }}>
        <LeftPanel />
      </div>

      {/* RIGHT */}
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
          style={{ marginBottom: "32px" }}
        >
          <Link href="/">
            <Image src="/Logo.png" alt="Craftqube" width={150} height={34} style={{ height: "auto" }} priority />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: "420px" }}
        >
          {/* Encabezado */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "0.62rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--color-cq-accent)", marginBottom: "8px",
            }}>
              Registro gratuito
            </p>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "2rem", textTransform: "uppercase",
              color: "var(--color-cq-text)", lineHeight: 1.08,
              margin: "0 0 10px 0",
            }}>
              Crear cuenta
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)" }}>
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" style={{ color: "var(--color-cq-accent)", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "none")}
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Nombre + Apellido */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field
                label="Nombre" icon="fa-solid fa-user"
                value={nombre}
                onChange={(v) => { setNombre(v); clearError("nombre"); }}
                error={errors.nombre} autoComplete="given-name" placeholder="Juan"
              />
              <Field
                label="Apellido" icon="fa-solid fa-user"
                value={apellido}
                onChange={(v) => { setApellido(v); clearError("apellido"); }}
                error={errors.apellido} autoComplete="family-name" placeholder="García"
              />
            </div>

            <Field
              label="Correo electrónico" type="email" icon="fa-solid fa-envelope"
              value={email}
              onChange={(v) => { setEmail(v); clearError("email"); }}
              error={errors.email} autoComplete="email" placeholder="tucorreo@empresa.com"
            />

            <Field
              label="Teléfono" type="tel" icon="fa-solid fa-phone" optional
              value={telefono}
              onChange={(v) => { setTelefono(v); clearError("telefono"); }}
              error={errors.telefono} autoComplete="tel" placeholder="55 1234 5678"
            />

            {/* Contraseña */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Field
                label="Contraseña" type={showPass ? "text" : "password"} icon="fa-solid fa-lock"
                value={password}
                onChange={(v) => { setPassword(v); clearError("password"); }}
                error={errors.password} autoComplete="new-password" placeholder="Mínimo 6 caracteres"
                suffix={<i className={showPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} style={{ fontSize: "0.85rem" }} />}
                onSuffixClick={() => setShowPass((v) => !v)}
              />
              <PasswordStrength password={password} />
            </div>

            <Field
              label="Confirmar contraseña" type={showConf ? "text" : "password"} icon="fa-solid fa-lock-open"
              value={confirmar}
              onChange={(v) => { setConfirmar(v); clearError("confirmar"); }}
              error={errors.confirmar} autoComplete="new-password" placeholder="Repite tu contraseña"
              suffix={<i className={showConf ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} style={{ fontSize: "0.85rem" }} />}
              onSuffixClick={() => setShowConf((v) => !v)}
            />

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
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear mi cuenta
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }} />
                </>
              )}
            </motion.button>

          </form>

          {/* Legal */}
          <p style={{
            textAlign: "center", marginTop: "20px",
            fontFamily: "var(--font-body)", fontSize: "0.75rem",
            color: "var(--color-cq-muted-2)", lineHeight: 1.65,
          }}>
            Al crear tu cuenta aceptas nuestros{" "}
            <Link href="/politicas/terminos" style={{ color: "var(--color-cq-muted)", textDecoration: "underline" }}>Términos</Link>
            {" "}y{" "}
            <Link href="/politicas/politica-de-privacidad" style={{ color: "var(--color-cq-muted)", textDecoration: "underline" }}>Privacidad</Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}