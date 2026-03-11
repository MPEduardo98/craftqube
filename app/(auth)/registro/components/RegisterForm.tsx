// app/(auth)/registro/components/RegisterForm.tsx
"use client";

import { useState }               from "react";
import Link                       from "next/link";
import Image                      from "next/image";
import { useRouter }              from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth }                from "@/app/global/context/AuthContext";
import { useAlert }               from "@/app/global/context/AlertContext";
import { useTheme }               from "@/app/global/context/ThemeContext";
import { LoadingOverlay }         from "@/app/global/components/ui/LoadingOverlay";

/* ────────────────────────────────────────────────────────── */
/*  LeftPanel                                                  */
/* ────────────────────────────────────────────────────────── */
const BENEFITS = [
  { icon: "fa-solid fa-truck-fast",       label: "Envíos a todo México" },
  { icon: "fa-solid fa-tag",              label: "Precios exclusivos para miembros" },
  { icon: "fa-solid fa-clock-rotate-left",label: "Historial de pedidos centralizado" },
  { icon: "fa-solid fa-shield-halved",    label: "Datos protegidos con cifrado" },
];

function LeftPanel() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div style={{
      height: "100%", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
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
        width: "350px", height: "350px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Link href="/">
          <Image src="/Logo.png" alt="Craftqube" width={150} height={34} style={{ height: "auto", filter: "brightness(10)" }} priority />
        </Link>
      </motion.div>

      {/* Copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.6rem",
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)", marginBottom: "12px",
        }}>
          Craftqube · Cuenta gratuita
        </p>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(1.8rem, 3vw, 2.6rem)", textTransform: "uppercase",
          color: "white", lineHeight: 1.05, marginBottom: "20px",
        }}>
          Tu cuenta,<br />tu catálogo.
        </h2>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: "0.9rem",
          color: "rgba(255,255,255,0.6)", lineHeight: 1.65, maxWidth: "320px",
        }}>
          Gestiona pedidos, accede a precios especiales y lleva el control de tus compras industriales.
        </p>

        <div style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {BENEFITS.map((b) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
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

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <p style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "0.58rem",
          letterSpacing: "0.06em",
          color:         "rgba(255,255,255,0.25)",
          margin:        0,
        }}>
          © 2026 Craftqube · Materiales industriales de calidad
        </p>

        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.18)" }}
          whileTap={{ scale: 0.92 }}
          aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
          style={{
            width:          "34px",
            height:         "34px",
            borderRadius:   "9px",
            border:         "1px solid rgba(255,255,255,0.15)",
            background:     "rgba(255,255,255,0.08)",
            color:          "rgba(255,255,255,0.7)",
            cursor:         "pointer",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.svg
                key="moon"
                initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                exit={{    opacity: 0, rotate:  20, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                width="14" height="14" viewBox="0 0 24 24"
                fill="currentColor" stroke="none"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </motion.svg>
            ) : (
              <motion.svg
                key="sun"
                initial={{ opacity: 0, rotate:  20, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                exit={{    opacity: 0, rotate: -20, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1"  x2="12" y2="3"  />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1"  y1="12" x2="3"  y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
                <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Field                                                      */
/* ────────────────────────────────────────────────────────── */
interface FieldProps {
  label:         string;
  type?:         string;
  value:         string;
  onChange:      (v: string) => void;
  hasError?:     boolean;
  autoComplete?: string;
  placeholder?:  string;
  icon:          string;
  suffix?:       React.ReactNode;
  onSuffixClick?: () => void;
  optional?:     boolean;
}

function Field({
  label, type = "text", value, onChange, hasError,
  autoComplete, placeholder, icon, suffix, onSuffixClick, optional,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "0.62rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color:         focused ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
          transition:    "color 0.2s",
          fontWeight:    500,
        }}>
          {label}
        </label>
        {optional && (
          <span style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "0.55rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:         "var(--color-cq-muted-2)",
          }}>
            Opcional
          </span>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <i className={icon} style={{
          position:     "absolute",
          left:         "14px",
          top:          "50%",
          transform:    "translateY(-50%)",
          fontSize:     "0.8rem",
          color:        focused ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
          transition:   "color 0.2s",
          pointerEvents:"none",
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
            width:        "100%",
            background:   "var(--color-cq-surface-2)",
            border:       `1.5px solid ${hasError ? "rgba(239,68,68,0.45)" : focused ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
            borderRadius: "10px",
            padding:      `12px ${suffix ? "44px" : "14px"} 12px 40px`,
            fontFamily:   "var(--font-body)",
            fontSize:     "0.875rem",
            color:        "var(--color-cq-text)",
            outline:      "none",
            transition:   "border-color 0.2s",
          }}
        />
        {suffix && (
          <button
            type="button"
            onClick={onSuffixClick}
            style={{
              position:  "absolute",
              right:     "14px",
              top:       "50%",
              transform: "translateY(-50%)",
              background:"none",
              border:    "none",
              cursor:    "pointer",
              color:     "var(--color-cq-muted-2)",
              padding:   "4px",
            }}
          >
            {suffix}
          </button>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  PasswordStrength                                           */
/* ────────────────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const score = Math.min(
    4,
    [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)]
      .filter(Boolean).length + (password.length >= 6 ? 1 : 0)
  );

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Muy débil", "Débil", "Regular", "Fuerte"];

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
        fontFamily:    "var(--font-mono)",
        fontSize:      "0.58rem",
        letterSpacing: "0.08em",
        color:         colors[score - 1] ?? "var(--color-cq-muted-2)",
        textTransform: "uppercase",
      }}>
        {labels[score - 1] ?? ""}
      </p>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  RegisterForm                                               */
/* ────────────────────────────────────────────────────────── */
type ErrorFields = Partial<Record<"nombre" | "apellido" | "email" | "telefono" | "password" | "confirmar", boolean>>;

export function RegisterForm() {
  const { register } = useAuth();
  const alert        = useAlert();
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
  const [errors,    setErrors]    = useState<ErrorFields>({});

  function clearError(key: keyof ErrorFields) {
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function validate() {
    const e: ErrorFields = {};
    const msgs: string[] = [];

    if (!nombre.trim())                                            { e.nombre    = true; msgs.push("Ingresa tu nombre"); }
    if (!apellido.trim())                                          { e.apellido  = true; msgs.push("Ingresa tu apellido"); }
    if (!email.trim())                                             { e.email     = true; msgs.push("Ingresa tu correo"); }
    else if (!/\S+@\S+\.\S+/.test(email))                         { e.email     = true; msgs.push("Correo no válido"); }
    if (telefono && !/^\d{10}$/.test(telefono.replace(/\s|-/g, ""))) { e.telefono = true; msgs.push("Teléfono: 10 dígitos requeridos"); }
    if (!password)                                                 { e.password  = true; msgs.push("Ingresa una contraseña"); }
    else if (password.length < 6)                                  { e.password  = true; msgs.push("La contraseña necesita mínimo 6 caracteres"); }
    if (!confirmar)                                                { e.confirmar = true; msgs.push("Confirma tu contraseña"); }
    else if (confirmar !== password)                               { e.confirmar = true; msgs.push("Las contraseñas no coinciden"); }

    setErrors(e);

    if (msgs.length > 0) {
      alert.warning(msgs[0], msgs.length > 1 ? `${msgs.length} campos por corregir` : "Campo requerido");
    }

    return msgs.length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await register({
      nombre:   nombre.trim(),
      apellido: apellido.trim(),
      email:    email.trim(),
      password,
      telefono: telefono.trim() || undefined,
    });
    setLoading(false);

    if (result.ok) {
      alert.success("¡Bienvenido a Craftqube! Tu cuenta fue creada.", "Cuenta creada");
      router.push("/");
    } else {
      alert.error(result.error ?? "No se pudo crear la cuenta. Intenta de nuevo.", "Error al registrarse");
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

        {/* Logo mobile */}
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
          style={{ width: "100%", maxWidth: "420px", position: "relative" }}
        >
          <LoadingOverlay visible={loading} message="Creando tu cuenta..." />
          {/* Encabezado */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "0.62rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color:         "var(--color-cq-accent)",
              marginBottom:  "8px",
            }}>
              Registro gratuito
            </p>
            <h1 style={{
              fontFamily:    "var(--font-display)",
              fontWeight:    800,
              fontSize:      "2rem",
              textTransform: "uppercase",
              color:         "var(--color-cq-text)",
              lineHeight:    1.08,
              margin:        "0 0 10px 0",
            }}>
              Crear cuenta
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)" }}>
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                style={{ color: "var(--color-cq-accent)", fontWeight: 600, textDecoration: "none" }}
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
                hasError={errors.nombre} autoComplete="given-name" placeholder="Juan"
              />
              <Field
                label="Apellido" icon="fa-solid fa-user"
                value={apellido}
                onChange={(v) => { setApellido(v); clearError("apellido"); }}
                hasError={errors.apellido} autoComplete="family-name" placeholder="García"
              />
            </div>

            <Field
              label="Correo electrónico" type="email" icon="fa-solid fa-envelope"
              value={email}
              onChange={(v) => { setEmail(v); clearError("email"); }}
              hasError={errors.email} autoComplete="email" placeholder="tucorreo@empresa.com"
            />

            <Field
              label="Teléfono" type="tel" icon="fa-solid fa-phone" optional
              value={telefono}
              onChange={(v) => { setTelefono(v); clearError("telefono"); }}
              hasError={errors.telefono} autoComplete="tel" placeholder="55 1234 5678"
            />

            {/* Contraseña */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Field
                label="Contraseña" type={showPass ? "text" : "password"} icon="fa-solid fa-lock"
                value={password}
                onChange={(v) => { setPassword(v); clearError("password"); }}
                hasError={errors.password} autoComplete="new-password" placeholder="Mínimo 6 caracteres"
                suffix={<i className={showPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} style={{ fontSize: "0.85rem" }} />}
                onSuffixClick={() => setShowPass((v) => !v)}
              />
              <PasswordStrength password={password} />
            </div>

            <Field
              label="Confirmar contraseña" type={showConf ? "text" : "password"} icon="fa-solid fa-lock-open"
              value={confirmar}
              onChange={(v) => { setConfirmar(v); clearError("confirmar"); }}
              hasError={errors.confirmar} autoComplete="new-password" placeholder="Repite tu contraseña"
              suffix={<i className={showConf ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} style={{ fontSize: "0.85rem" }} />}
              onSuffixClick={() => setShowConf((v) => !v)}
            />

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.015, boxShadow: "0 8px 28px rgba(29,78,216,0.38)" }}
              whileTap={loading ? {} : { scale: 0.985 }}
              style={{
                width:          "100%",
                height:         "52px",
                borderRadius:   "11px",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            "8px",
                background:     "var(--color-cq-primary)",
                color:          "white",
                fontFamily:     "var(--font-display)",
                fontSize:       "0.875rem",
                fontWeight:     700,
                letterSpacing:  "0.12em",
                textTransform:  "uppercase",
                border:         "none",
                cursor:         loading ? "not-allowed" : "pointer",
                boxShadow:      loading ? "none" : "0 4px 18px rgba(29,78,216,0.28)",
                transition:     "background 0.2s, box-shadow 0.2s",
                marginTop:      "4px",
              }}
            >
              Crear mi cuenta
              <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }} />
            </motion.button>
          </form>

          {/* Legal */}
          <p style={{
            textAlign:   "center",
            marginTop:   "20px",
            fontFamily:  "var(--font-body)",
            fontSize:    "0.75rem",
            color:       "var(--color-cq-muted-2)",
            lineHeight:  1.65,
          }}>
            Al crear tu cuenta aceptas nuestros{" "}
            <Link href="/politicas/terminos" style={{ color: "var(--color-cq-muted)", textDecoration: "underline" }}>
              Términos
            </Link>
            {" "}y{" "}
            <Link href="/politicas/politica-de-privacidad" style={{ color: "var(--color-cq-muted)", textDecoration: "underline" }}>
              Privacidad
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}