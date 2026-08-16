// app/(auth)/reset-password/components/ResetPasswordForm.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/features/auth/lib/auth-client";
import { useAlert } from "@/shared/context/AlertContext";
import { LoadingOverlay } from "@/shared/components/ui/LoadingOverlay";

/* ────────────────────────────────────────────────────────── */
/*  Campo password                                             */
/* ────────────────────────────────────────────────────────── */
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  hasError?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

function PasswordField({ label, value, onChange, show, onToggle, hasError, placeholder, autoComplete }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontFamily: "var(--font-mono)", fontSize: "0.62rem",
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
        transition: "color 0.2s", fontWeight: 500,
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <i className="fa-solid fa-lock" style={{
          position: "absolute", left: "14px", top: "50%",
          transform: "translateY(-50%)", fontSize: "0.8rem",
          color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
          transition: "color 0.2s", pointerEvents: "none",
        }} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "var(--color-cq-surface-2)",
            border: `1.5px solid ${hasError ? "rgba(239,68,68,0.55)" : focused ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
            borderRadius: "10px",
            padding: "12px 44px 12px 40px",
            fontSize: "0.9rem",
            color: "var(--color-cq-text)",
            fontFamily: "var(--font-body)",
            outline: "none",
            boxShadow: focused ? "0 0 0 3px var(--color-cq-accent-glow)" : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />
        <button type="button" tabIndex={-1} onClick={onToggle}
          style={{
            position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
            color: "var(--color-cq-muted)", background: "none", border: "none",
            cursor: "pointer", display: "flex", padding: "4px",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-cq-text)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-cq-muted)")}
        >
          <i className={show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} style={{ fontSize: "0.85rem" }} />
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Fortaleza de contraseña                                    */
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "2px",
            background: i < score ? colors[score - 1] : "var(--color-cq-border)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em", color: colors[score - 1] ?? "var(--color-cq-muted-2)", textTransform: "uppercase" }}>
        {labels[score - 1] ?? ""}
      </p>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Export principal                                           */
/* ────────────────────────────────────────────────────────── */
type Status = "validating" | "valid" | "invalid" | "success";

type ErrorFields = Partial<Record<"password" | "confirmar", boolean>>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const alert        = useAlert();
  const token        = searchParams.get("token") ?? "";

  const [status,     setStatus]     = useState<Status>("validating");
  const [password,   setPassword]   = useState("");
  const [confirmar,  setConfirmar]  = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<ErrorFields>({});

  /* Better Auth valida el token al redirigir aquí; si el enlace era
     inválido/expirado llega con ?error=... — en caso contrario, válido. */
  useEffect(() => {
    const err = searchParams.get("error");
    if (!token || err) { setStatus("invalid"); return; }
    setStatus("valid");
  }, [token, searchParams]);

  function clearError(key: keyof ErrorFields) {
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function validate() {
    const e: ErrorFields = {};
    const msgs: string[] = [];

    if (!password)                   { e.password  = true; msgs.push("Ingresa una contraseña"); }
    else if (password.length < 6)    { e.password  = true; msgs.push("La contraseña necesita mínimo 6 caracteres"); }
    if (!confirmar)                  { e.confirmar = true; msgs.push("Confirma tu contraseña"); }
    else if (confirmar !== password) { e.confirmar = true; msgs.push("Las contraseñas no coinciden"); }

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
    try {
      const { error: err } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (err) {
        alert.error(err.message ?? "No se pudo actualizar la contraseña", "Error al guardar");
      } else {
        setStatus("success");
      }
    } catch {
      alert.error("Error de conexión. Intenta de nuevo.", "Sin conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", overflow: "auto",
      background: "var(--color-cq-bg)",
    }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />

      {/* ── LEFT panel ───────────────────────────────────── */}
      <div className="hidden lg:flex" style={{
        flex: "0 0 44%", maxWidth: "500px",
        position: "relative", overflow: "hidden",
        flexDirection: "column", justifyContent: "space-between",
        padding: "48px 52px",
        background: "linear-gradient(145deg, #0f2394 0%, #1638c8 55%, #2563EB 100%)",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
        }} />
        <div style={{ position: "absolute", top: "-100px", right: "-60px", width: "350px", height: "350px", borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(96,165,250,0.22) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(18,36,160,0.4) 0%, transparent 70%)" }} />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ position: "relative", zIndex: 1 }}>
          <Link href="/">
            <Image src="/Logo.png" alt="Craftqube" width={160} height={36} style={{ height: "auto", filter: "brightness(0) invert(1)" }} priority />
          </Link>
        </motion.div>

        {/* Copy */}
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "24px",
          }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: "1.6rem", color: "rgba(147,197,253,1)" }} />
          </div>

          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "12px" }}>
            Seguridad de cuenta
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05,
            textTransform: "uppercase", color: "white", margin: "0 0 20px 0",
          }}>
            Nueva contraseña<br />
            <span style={{ color: "rgba(147,197,253,1)" }}>segura</span>
          </h2>

          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, maxWidth: "320px", marginBottom: "28px" }}>
            Elige una contraseña robusta para proteger tu cuenta y todos tus pedidos.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: "fa-solid fa-check", text: "Mínimo 6 caracteres" },
              { icon: "fa-solid fa-check", text: "Incluye mayúsculas y números" },
              { icon: "fa-solid fa-check", text: "Usa caracteres especiales para más seguridad" },
            ].map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.3 + i * 0.08 }}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <i className={tip.icon} style={{ fontSize: "0.65rem", color: "rgba(147,197,253,0.7)", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.84rem", color: "rgba(255,255,255,0.65)" }}>{tip.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p style={{ position: "relative", zIndex: 1, fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.06em", color: "rgba(255,255,255,0.25)" }}>
          © 2026 Craftqube · Materiales industriales de calidad
        </p>
      </div>

      {/* ── RIGHT ────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 24px", minHeight: "100%",
      }}>

        {/* Mobile logo */}
        <motion.div className="flex lg:hidden" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "36px" }}>
          <Link href="/">
            <Image src="/Logo.png" alt="Craftqube" width={150} height={34} style={{ height: "auto" }} priority />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: "400px", position: "relative" }}
        >
          <LoadingOverlay visible={loading} message="Guardando contraseña..." />

          <AnimatePresence mode="wait">

            {/* ── Validando token ── */}
            {status === "validating" && (
              <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "32px 0" }}
              >
                <motion.i
                  className="fa-solid fa-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                  style={{ fontSize: "1.8rem", color: "var(--color-cq-accent)" }}
                />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                  Verificando enlace...
                </p>
              </motion.div>
            )}

            {/* ── Token inválido / expirado ── */}
            {status === "invalid" && (
              <motion.div key="invalid" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0" }}
              >
                <div style={{
                  width: "72px", height: "72px", borderRadius: "20px",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px",
                }}>
                  <i className="fa-solid fa-link-slash" style={{ fontSize: "1.6rem", color: "rgba(239,68,68,0.8)" }} />
                </div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(239,68,68,0.8)", marginBottom: "10px" }}>
                  Enlace inválido
                </p>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem", textTransform: "uppercase", color: "var(--color-cq-text)", lineHeight: 1.1, margin: "0 0 14px 0" }}>
                  Enlace expirado
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-cq-muted)", lineHeight: 1.65, marginBottom: "32px" }}>
                  Este enlace ya fue usado o expiró. Solicita uno nuevo desde la página de recuperación.
                </p>
                <Link href="/recuperar-password" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", height: "52px", borderRadius: "11px",
                  background: "var(--color-cq-primary)", color: "white",
                  fontFamily: "var(--font-display)", fontSize: "0.875rem",
                  fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  textDecoration: "none", boxShadow: "0 4px 18px rgba(29,78,216,0.28)",
                  marginBottom: "14px",
                }}>
                  Solicitar nuevo enlace
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }} />
                </Link>
                <Link href="/login" style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-accent)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-muted)")}
                >
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} />
                  Volver al login
                </Link>
              </motion.div>
            )}

            {/* ── Formulario ── */}
            {status === "valid" && (
              <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                <div style={{ marginBottom: "32px" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-cq-accent)", marginBottom: "8px" }}>
                    Casi listo
                  </p>
                  <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", textTransform: "uppercase", color: "var(--color-cq-text)", lineHeight: 1.08, margin: "0 0 10px 0" }}>
                    Nueva contraseña
                  </h1>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)", lineHeight: 1.6 }}>
                    Elige una contraseña segura para proteger tu cuenta.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <PasswordField
                      label="Nueva contraseña"
                      value={password}
                      onChange={(v) => { setPassword(v); clearError("password"); }}
                      show={showPass} onToggle={() => setShowPass((v) => !v)}
                      hasError={errors.password} placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                    />
                    <PasswordStrength password={password} />
                  </div>

                  <PasswordField
                    label="Confirmar contraseña"
                    value={confirmar}
                    onChange={(v) => { setConfirmar(v); clearError("confirmar"); }}
                    show={showConf} onToggle={() => setShowConf((v) => !v)}
                    hasError={errors.confirmar} placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                  />

                  <motion.button type="submit" disabled={loading}
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
                      transition: "background 0.2s, box-shadow 0.2s", marginTop: "4px",
                    }}
                  >
                    Guardar contraseña
                    <i className="fa-solid fa-floppy-disk" style={{ fontSize: "0.85rem" }} />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── Éxito ── */}
            {status === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                  style={{
                    width: "72px", height: "72px", borderRadius: "20px",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 28px rgba(34,197,94,0.3)", marginBottom: "28px",
                  }}
                >
                  <i className="fa-solid fa-check" style={{ fontSize: "1.8rem", color: "white" }} />
                </motion.div>

                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#22c55e", marginBottom: "10px" }}>
                  ¡Listo!
                </p>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem", textTransform: "uppercase", color: "var(--color-cq-text)", lineHeight: 1.1, margin: "0 0 14px 0" }}>
                  Contraseña actualizada
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-cq-muted)", lineHeight: 1.65, marginBottom: "32px" }}>
                  Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>

                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} style={{ width: "100%", marginBottom: "14px" }}>
                  <Link href="/login" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    width: "100%", height: "52px", borderRadius: "11px",
                    background: "var(--color-cq-primary)", color: "white",
                    fontFamily: "var(--font-display)", fontSize: "0.875rem",
                    fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                    textDecoration: "none", boxShadow: "0 4px 18px rgba(29,78,216,0.28)",
                  }}>
                    Iniciar sesión
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }} />
                  </Link>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}