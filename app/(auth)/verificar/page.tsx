// app/(auth)/verificar/page.tsx
"use client";

import { useEffect, useState, Suspense }  from "react";
import { useSearchParams, useRouter }     from "next/navigation";
import { motion, AnimatePresence }        from "framer-motion";
import Link                               from "next/link";
import Image                              from "next/image";
import { LoadingOverlay }                 from "@/app/global/components/ui/LoadingOverlay";

/* ─────────────────────────────────────────────────────────
   Tipos
───────────────────────────────────────────────────────── */
type Status = "loading" | "success" | "error";

/* ─────────────────────────────────────────────────────────
   Icono de estado (éxito / error)
───────────────────────────────────────────────────────── */
function StatusIcon({ status }: { status: "success" | "error" }) {
  const isSuccess = status === "success";
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      style={{
        width: "72px", height: "72px", borderRadius: "50%",
        background: isSuccess ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
        border: `2px solid ${isSuccess ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <i
        className={isSuccess ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"}
        style={{ fontSize: "2rem", color: isSuccess ? "#10b981" : "#ef4444" }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Contenido principal
───────────────────────────────────────────────────────── */
function VerifyContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token");

  const [status,    setStatus]    = useState<Status>("loading");
  const [message,   setMessage]   = useState("");
  const [countdown, setCountdown] = useState(4);

  /* ── Verificar token al montar ── */
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No se encontró el token de verificación en la URL.");
      return;
    }

    async function verify() {
      try {
        const res  = await fetch("/api/auth/verify", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setMessage("Tu correo ha sido verificado correctamente.");
        } else {
          setStatus("error");
          setMessage(data.error ?? "No fue posible verificar tu correo.");
        }
      } catch {
        setStatus("error");
        setMessage("Error de conexión. Intenta de nuevo.");
      }
    }

    verify();
  }, [token]);

  /* ── Countdown → redirect en éxito ── */
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) { router.push("/"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, router]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", overflow: "auto",
      background: "var(--color-cq-bg)",
    }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />

      {/* ── Panel izquierdo decorativo ── */}
      <div className="hidden lg:flex" style={{
        flex: "0 0 44%", maxWidth: "500px",
        position: "relative", overflow: "hidden",
        flexDirection: "column", justifyContent: "space-between",
        padding: "48px 52px",
        background: "linear-gradient(145deg, #0f2394 0%, #1638c8 55%, #2563EB 100%)",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "36px 36px" }} />
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
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
            <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: "1.6rem", color: "rgba(147,197,253,1)" }} />
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "12px" }}>
            Verificación de cuenta
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05, textTransform: "uppercase", color: "white", margin: "0 0 20px 0" }}>
            Tu acceso,<br />
            <span style={{ color: "rgba(147,197,253,1)" }}>confirmado</span>
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, maxWidth: "320px" }}>
            Una vez verificado tu correo tendrás acceso completo a todos los productos y funciones de Craftqube.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }} style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
            ¿Problemas con la verificación?{" "}
            <Link href="/registro" style={{ color: "rgba(147,197,253,0.8)", textDecoration: "none" }}>Vuelve al registro</Link>
          </p>
        </motion.div>
      </div>

      {/* ── Panel derecho ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px", minWidth: 0,
      }}>
        {/* Logo móvil */}
        <div className="lg:hidden" style={{ marginBottom: "36px" }}>
          <Link href="/">
            <Image src="/Logo.png" alt="Craftqube" width={140} height={32} style={{ height: "auto" }} priority />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: "100%", maxWidth: "420px",
            background: "var(--color-cq-surface)",
            border: "1px solid var(--color-cq-border)",
            borderRadius: "20px",
            padding: "48px 40px",
            textAlign: "center",
            position: "relative",   /* requerido para LoadingOverlay mode="fill" */
            overflow: "hidden",
            minHeight: "320px",
          }}
        >
          {/* ── LoadingOverlay global (mode fill cubre la card) ── */}
          <LoadingOverlay
            visible={status === "loading"}
            message="Verificando correo..."
            mode="fill"
          />

          <AnimatePresence mode="wait">

            {/* ── Éxito ── */}
            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <StatusIcon status="success" />
                </div>

                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#10b981", marginBottom: "8px" }}>
                  Cuenta activada
                </p>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.9rem", textTransform: "uppercase", color: "var(--color-cq-text)", lineHeight: 1.08, margin: "0 0 12px 0" }}>
                  ¡Verificación<br />exitosa!
                </h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)", lineHeight: 1.65, marginBottom: "32px" }}>
                  {message}
                </p>

                {/* Barra countdown */}
                <div style={{ width: "100%", height: "3px", borderRadius: "2px", background: "var(--color-cq-border)", marginBottom: "16px", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    style={{ height: "100%", background: "#10b981", borderRadius: "2px" }}
                  />
                </div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.05em", marginBottom: "28px" }}>
                  Redirigiendo en {countdown}s…
                </p>

                <Link href="/" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", height: "50px", borderRadius: "11px",
                  background: "var(--color-cq-primary)", color: "white",
                  fontFamily: "var(--font-display)", fontSize: "0.875rem",
                  fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  textDecoration: "none", boxShadow: "0 4px 18px rgba(29,78,216,0.28)",
                }}>
                  Ir al inicio
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }} />
                </Link>
              </motion.div>
            )}

            {/* ── Error ── */}
            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <StatusIcon status="error" />
                </div>

                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#ef4444", marginBottom: "8px" }}>
                  Enlace inválido
                </p>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.9rem", textTransform: "uppercase", color: "var(--color-cq-text)", lineHeight: 1.08, margin: "0 0 12px 0" }}>
                  No se pudo<br />verificar
                </h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)", lineHeight: 1.65, marginBottom: "28px" }}>
                  {message}
                </p>

                <div style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)", marginBottom: "24px", textAlign: "left", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { icon: "fa-solid fa-rotate-right", text: "El enlace puede haber expirado (válido 24h)" },
                    { icon: "fa-solid fa-link-slash",   text: "El enlace ya fue utilizado anteriormente" },
                  ].map(({ icon, text }, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <i className={icon} style={{ fontSize: "0.8rem", color: "var(--color-cq-muted-2)", width: "16px", flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-cq-muted)", lineHeight: 1.5 }}>{text}</span>
                    </div>
                  ))}
                </div>

                <Link href="/registro" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", height: "50px", borderRadius: "11px",
                  background: "var(--color-cq-primary)", color: "white",
                  fontFamily: "var(--font-display)", fontSize: "0.875rem",
                  fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  textDecoration: "none", boxShadow: "0 4px 18px rgba(29,78,216,0.28)",
                  marginBottom: "12px",
                }}>
                  Volver al registro
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }} />
                </Link>

                <Link href="/login"
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-accent)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-muted)")}
                >
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} />
                  Ir al login
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Page export con Suspense boundary
───────────────────────────────────────────────────────── */
export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-cq-bg)", position: "relative" }}>
        <LoadingOverlay visible message="Cargando..." mode="fixed" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}