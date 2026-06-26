// app/(auth)/recuperar-password/components/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function ForgotPasswordForm() {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState("");
  const [fieldErr,  setFieldErr]  = useState("");
  const [focused,   setFocused]   = useState(false);

  function validate() {
    if (!email.trim())                   { setFieldErr("Ingresa tu correo"); return false; }
    if (!/\S+@\S+\.\S+/.test(email))     { setFieldErr("Correo no válido");  return false; }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/recuperar-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSent(true);
      } else {
        setError(json.error ?? "No se pudo enviar el correo");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
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

        {/* Central copy */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Ícono grande */}
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "24px",
          }}>
            <i className="fa-solid fa-lock-open" style={{ fontSize: "1.6rem", color: "rgba(147,197,253,1)" }} />
          </div>

          <p style={{
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)", marginBottom: "12px",
          }}>
            Recupera tu acceso
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05,
            textTransform: "uppercase", color: "white",
            margin: "0 0 20px 0",
          }}>
            Sin contraseña,<br />
            <span style={{ color: "rgba(147,197,253,1)" }}>sin problema</span>
          </h2>

          <p style={{
            fontFamily: "var(--font-body)", fontSize: "0.9rem",
            color: "rgba(255,255,255,0.6)", lineHeight: 1.65,
            maxWidth: "320px",
          }}>
            Te enviaremos un enlace seguro para que puedas restablecer tu contraseña en menos de 2 minutos.
          </p>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "28px" }}>
            {[
              { n: "01", text: "Ingresa tu correo registrado" },
              { n: "02", text: "Revisa tu bandeja de entrada" },
              { n: "03", text: "Crea una nueva contraseña" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.08 }}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                  letterSpacing: "0.1em", color: "rgba(147,197,253,0.7)",
                  fontWeight: 700, flexShrink: 0,
                }}>
                  {s.n}
                </span>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "0.84rem",
                  color: "rgba(255,255,255,0.65)",
                }}>
                  {s.text}
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

      {/* ── RIGHT — form ─────────────────────────────────── */}
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

          <AnimatePresence mode="wait">

            {/* ── Estado: formulario ── */}
            {!sent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                {/* Back link */}
                <Link href="/login" style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--color-cq-muted)", textDecoration: "none",
                  marginBottom: "28px", transition: "color 0.18s",
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-accent)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-muted)")}
                >
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.7rem" }} />
                  Volver al login
                </Link>

                <div style={{ marginBottom: "32px" }}>
                  <p style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "var(--color-cq-accent)", marginBottom: "8px",
                  }}>
                    Recuperar acceso
                  </p>
                  <h1 style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: "2rem", textTransform: "uppercase",
                    color: "var(--color-cq-text)", lineHeight: 1.08,
                    margin: "0 0 10px 0",
                  }}>
                    Olvidé mi<br />contraseña
                  </h1>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.875rem",
                    color: "var(--color-cq-muted)", lineHeight: 1.6,
                  }}>
                    Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para restablecerla.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Campo email */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
                      transition: "color 0.2s", fontWeight: 500,
                    }}>
                      Correo electrónico
                    </label>
                    <div style={{ position: "relative" }}>
                      <i className="fa-solid fa-envelope" style={{
                        position: "absolute", left: "14px", top: "50%",
                        transform: "translateY(-50%)", fontSize: "0.8rem",
                        color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
                        transition: "color 0.2s", pointerEvents: "none",
                      }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFieldErr(""); setError(""); }}
                        autoComplete="email"
                        placeholder="tucorreo@empresa.com"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        style={{
                          width: "100%",
                          background: "var(--color-cq-surface-2)",
                          border: `1.5px solid ${fieldErr ? "rgba(239,68,68,0.55)" : focused ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                          borderRadius: "10px",
                          padding: "12px 16px 12px 40px",
                          fontSize: "0.9rem",
                          color: "var(--color-cq-text)",
                          fontFamily: "var(--font-body)",
                          outline: "none",
                          boxShadow: focused ? "0 0 0 3px var(--color-cq-accent-glow)" : "none",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                      />
                    </div>
                    <AnimatePresence>
                      {fieldErr && (
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
                          {fieldErr}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error API */}
                  <AnimatePresence>
                    {error && (
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
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem" }}>{error}</span>
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
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar enlace
                        <i className="fa-solid fa-paper-plane" style={{ fontSize: "0.85rem" }} />
                      </>
                    )}
                  </motion.button>

                </form>

                <p style={{
                  textAlign: "center", marginTop: "20px",
                  fontFamily: "var(--font-body)", fontSize: "0.8rem",
                  color: "var(--color-cq-muted-2)",
                }}>
                  ¿No tienes cuenta?{" "}
                  <Link href="/registro" style={{ color: "var(--color-cq-accent)", fontWeight: 600, textDecoration: "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "none")}
                  >
                    Regístrate gratis
                  </Link>
                </p>
              </motion.div>

            ) : (

              /* ── Estado: enviado ── */
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0" }}
              >
                {/* Ícono éxito */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                  style={{
                    width: "72px", height: "72px", borderRadius: "20px",
                    background: "linear-gradient(135deg, var(--color-cq-primary), var(--color-cq-blue-400))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 28px rgba(29,78,216,0.3)",
                    marginBottom: "28px",
                  }}
                >
                  <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: "1.8rem", color: "white" }} />
                </motion.div>

                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "var(--color-cq-accent)", marginBottom: "10px",
                }}>
                  Correo enviado
                </p>
                <h2 style={{
                  fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: "1.75rem", textTransform: "uppercase",
                  color: "var(--color-cq-text)", lineHeight: 1.1,
                  margin: "0 0 14px 0",
                }}>
                  Revisa tu bandeja
                </h2>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "0.9rem",
                  color: "var(--color-cq-muted)", lineHeight: 1.65,
                  marginBottom: "8px",
                }}>
                  Enviamos un enlace de recuperación a
                </p>
                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.85rem",
                  color: "var(--color-cq-accent)", fontWeight: 600,
                  marginBottom: "32px",
                }}>
                  {email}
                </p>

                {/* Info extra */}
                <div style={{
                  width: "100%", padding: "16px", borderRadius: "12px",
                  background: "var(--color-cq-surface)",
                  border: "1px solid var(--color-cq-border)",
                  display: "flex", flexDirection: "column", gap: "10px",
                  marginBottom: "28px", textAlign: "left",
                }}>
                  {[
                    { icon: "fa-solid fa-clock",       text: "El enlace expira en 30 minutos" },
                    { icon: "fa-solid fa-inbox",        text: "Revisa también tu carpeta de spam" },
                    { icon: "fa-solid fa-rotate-right", text: "¿No llegó? Vuelve a intentarlo" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <i className={item.icon} style={{ fontSize: "0.75rem", color: "var(--color-cq-muted-2)", flexShrink: 0, width: "14px", textAlign: "center" }} />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reenviar */}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  style={{
                    width: "100%", height: "46px", borderRadius: "11px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    background: "var(--color-cq-surface)",
                    border: "1.5px solid var(--color-cq-border)",
                    color: "var(--color-cq-muted)",
                    fontFamily: "var(--font-display)", fontSize: "0.775rem",
                    fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
                    marginBottom: "16px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-cq-accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-cq-border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-cq-muted)";
                  }}
                >
                  <i className="fa-solid fa-rotate-right" style={{ fontSize: "0.8rem" }} />
                  Intentar con otro correo
                </button>

                <Link href="/login" style={{
                  fontFamily: "var(--font-body)", fontSize: "0.85rem",
                  color: "var(--color-cq-muted)", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: "6px",
                  transition: "color 0.18s",
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-accent)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-muted)")}
                >
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} />
                  Volver al login
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}