// app/(auth)/verificar/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter }    from "next/navigation";
import { motion }                        from "framer-motion";
import { CheckCircle2, XCircle, Loader } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no proporcionado");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setMessage("¡Email verificado exitosamente!");
          setTimeout(() => router.push("/"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Error al verificar el email");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Error de conexión");
      }
    }

    verify();
  }, [token, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-cq-bg)",
      padding: "24px"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--color-cq-surface)",
          border: "1px solid var(--color-cq-border)",
          borderRadius: "12px",
          padding: "48px 32px",
          textAlign: "center"
        }}
      >
        {status === "loading" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block", marginBottom: "24px" }}
            >
              <Loader size={48} color="var(--color-cq-accent)" />
            </motion.div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "var(--color-cq-text)",
              marginBottom: "12px",
              letterSpacing: "-0.02em"
            }}>
              Verificando...
            </h1>
            <p style={{
              fontSize: "14px",
              color: "var(--color-cq-muted)",
              lineHeight: "1.6"
            }}>
              Estamos verificando tu correo electrónico
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{ marginBottom: "24px" }}
            >
              <CheckCircle2 size={48} color="#10b981" style={{ display: "inline-block" }} />
            </motion.div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "var(--color-cq-text)",
              marginBottom: "12px",
              letterSpacing: "-0.02em"
            }}>
              ¡Verificación exitosa!
            </h1>
            <p style={{
              fontSize: "14px",
              color: "var(--color-cq-muted)",
              lineHeight: "1.6",
              marginBottom: "24px"
            }}>
              {message}
            </p>
            <p style={{
              fontSize: "12px",
              color: "var(--color-cq-muted-2)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em"
            }}>
              Redirigiendo en 3 segundos...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{ marginBottom: "24px" }}
            >
              <XCircle size={48} color="#ef4444" style={{ display: "inline-block" }} />
            </motion.div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "var(--color-cq-text)",
              marginBottom: "12px",
              letterSpacing: "-0.02em"
            }}>
              Error en la verificación
            </h1>
            <p style={{
              fontSize: "14px",
              color: "var(--color-cq-muted)",
              lineHeight: "1.6",
              marginBottom: "32px"
            }}>
              {message}
            </p>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "12px 24px",
                background: "var(--color-cq-text)",
                color: "var(--color-cq-bg)",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Volver al inicio
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-cq-bg)"
      }}>
        <Loader size={32} color="var(--color-cq-accent)" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}