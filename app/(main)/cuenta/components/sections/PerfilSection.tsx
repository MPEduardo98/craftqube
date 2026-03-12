// app/(main)/cuenta/components/sections/PerfilSection.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/global/context/AuthContext";
import { useAlert }        from "@/app/global/context/AlertContext";
import { LoadingOverlay }  from "@/app/global/components/ui/LoadingOverlay";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function Field({
  label, value, editing, type = "text", onChange, placeholder,
}: {
  label: string; value: string; editing: boolean; type?: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <p style={{
        fontFamily: "var(--font-mono)", fontSize: "0.56rem",
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--color-cq-muted-2)", marginBottom: 6,
      }}>
        {label}
      </p>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg px-4 py-3"
          style={{
            background: "var(--color-cq-bg)",
            border: "1px solid var(--color-cq-border)",
            color: "var(--color-cq-text)",
            fontFamily: "var(--font-body)", fontSize: "0.875rem",
            outline: "none",
          }}
        />
      ) : (
        <p style={{
          fontFamily: "var(--font-body)", fontSize: "0.875rem",
          color: value ? "var(--color-cq-text)" : "var(--color-cq-muted-2)",
          padding: "12px 16px",
          background: "var(--color-cq-surface-2)",
          borderRadius: 8,
          border: "1px solid var(--color-cq-border)",
        }}>
          {value || "—"}
        </p>
      )}
    </div>
  );
}

function Card({
  title, description, onEdit, editing, loading, optional, children,
}: {
  title: string; description: string; onEdit: () => void;
  editing: boolean; loading?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ position: "relative", background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
    >
      <LoadingOverlay visible={!!loading} message="Guardando..." />
      <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)", margin: 0 }}>
            {title}
            {optional && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 400, color: "var(--color-cq-muted)", marginLeft: 8 }}>
                (opcional)
              </span>
            )}
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-cq-muted)", margin: "2px 0 0" }}>
            {description}
          </p>
        </div>
        {!editing && (
          <motion.button
            onClick={onEdit}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-lg px-4 py-2"
            style={{ background: "var(--color-cq-primary)", color: "white", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600 }}
          >
            <i className="fa-solid fa-pen" style={{ fontSize: "0.68rem" }} />
            Editar
          </motion.button>
        )}
      </div>
      {children}
    </div>
  );
}

function SaveRow({ loading, onSave, onCancel }: { loading: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
      style={{ borderTop: "1px solid var(--color-cq-border)", marginTop: 32, paddingTop: 24 }}
    >
      <motion.button
        onClick={onSave} disabled={loading}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 rounded-lg px-5 py-2.5"
        style={{ background: "var(--color-cq-primary)", color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, opacity: loading ? 0.6 : 1 }}
      >
        <i className="fa-solid fa-check" style={{ fontSize: "0.72rem" }} />
        Guardar cambios
      </motion.button>
      <motion.button
        onClick={onCancel} disabled={loading}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className="rounded-lg px-5 py-2.5"
        style={{ background: "transparent", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-text)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500 }}
      >
        Cancelar
      </motion.button>
    </motion.div>
  );
}

export function PerfilSection() {
  const { usuario, refreshUser } = useAuth();
  const alert = useAlert();
  const [editingPersonal,    setEditingPersonal]    = useState(false);
  const [editingFacturacion, setEditingFacturacion] = useState(false);
  const [loading,            setLoading]            = useState(false);

  const [resending,    setResending]    = useState(false);
  const [resendSent,   setResendSent]   = useState(false);

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail,     setNewEmail]     = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const [form, setForm] = useState({
    nombre:       usuario?.nombre       ?? "",
    apellido:     usuario?.apellido     ?? "",
    telefono:     usuario?.telefono     ?? "",
    rfc:          usuario?.rfc          ?? "",
    razon_social: usuario?.razon_social ?? "",
  });

  const handleSave = async (section: "personal" | "facturacion") => {
    setLoading(true);
    try {
      const res  = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert.success("Información actualizada correctamente");
        if (section === "personal")    setEditingPersonal(false);
        if (section === "facturacion") setEditingFacturacion(false);
        await refreshUser?.();
      } else {
        alert.error(data.error || "Error al actualizar");
      }
    } catch {
      alert.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (section: "personal" | "facturacion") => {
    setForm({
      nombre:       usuario?.nombre       ?? "",
      apellido:     usuario?.apellido     ?? "",
      telefono:     usuario?.telefono     ?? "",
      rfc:          usuario?.rfc          ?? "",
      razon_social: usuario?.razon_social ?? "",
    });
    if (section === "personal")    setEditingPersonal(false);
    if (section === "facturacion") setEditingFacturacion(false);
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const res  = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario?.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendSent(true);
        alert.success("Correo de verificación enviado");
      } else {
        alert.error(data.error || "No se pudo enviar el correo");
      }
    } catch {
      alert.error("Error de conexión");
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setLoadingEmail(true);
    try {
      const res  = await fetch("/api/users/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert.success("Correo actualizado. Revisa tu bandeja para verificarlo.");
        setEditingEmail(false);
        setNewEmail("");
        await refreshUser?.();
      } else {
        alert.error(data.error || "No se pudo actualizar el correo");
      }
    } catch {
      alert.error("Error de conexión");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── 1. Datos personales ── */}
      <Card
        title="Datos personales"
        description="Nombre y teléfono de contacto"
        onEdit={() => setEditingPersonal(true)}
        editing={editingPersonal}
        loading={loading}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre"   value={form.nombre}   editing={editingPersonal}
            onChange={(v) => setForm({ ...form, nombre: v })}   placeholder="Tu nombre" />
          <Field label="Apellido" value={form.apellido} editing={editingPersonal}
            onChange={(v) => setForm({ ...form, apellido: v })} placeholder="Tu apellido" />
          <Field label="Teléfono" value={form.telefono} editing={editingPersonal}
            onChange={(v) => setForm({ ...form, telefono: v })} placeholder="10 dígitos" type="tel" />
        </div>
        {editingPersonal && <SaveRow loading={loading} onSave={() => handleSave("personal")} onCancel={() => handleCancel("personal")} />}
      </Card>

      {/* ── 2. Correo electrónico ── */}
      <div className="rounded-xl p-6" style={{ position: "relative", background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
        <LoadingOverlay visible={loadingEmail} message="Guardando..." />
        <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)", margin: 0 }}>
              Correo electrónico
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-cq-muted)", margin: "3px 0 0" }}>
              Usado para iniciar sesión y notificaciones
            </p>
          </div>
          {!editingEmail && (
            <motion.button
              onClick={() => { setEditingEmail(true); setNewEmail(usuario?.email ?? ""); }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{ background: "var(--color-cq-primary)", color: "white", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, flexShrink: 0 }}
            >
              <i className="fa-solid fa-pen" style={{ fontSize: "0.68rem" }} />
              Editar
            </motion.button>
          )}
        </div>

        {editingEmail ? (
          <>
            <div className="mb-2">
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-cq-muted-2)", marginBottom: 6 }}>
                Nuevo correo electrónico
              </p>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nuevo@correo.com"
                className="w-full rounded-lg px-4 py-3"
                style={{ background: "var(--color-cq-bg)", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-text)", fontFamily: "var(--font-body)", fontSize: "0.875rem", outline: "none" }}
              />
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-cq-muted)", marginTop: 6 }}>
                Tendrás que verificar el nuevo correo antes de poder usarlo.
              </p>
            </div>
            <div className="flex items-center gap-3" style={{ borderTop: "1px solid var(--color-cq-border)", marginTop: 24, paddingTop: 20 }}>
              <motion.button
                onClick={handleChangeEmail} disabled={loadingEmail || !newEmail.trim()}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-lg px-5 py-2.5"
                style={{ background: "var(--color-cq-primary)", color: "white", border: "none", cursor: loadingEmail ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, opacity: loadingEmail ? 0.6 : 1 }}
              >
                <i className="fa-solid fa-check" style={{ fontSize: "0.72rem" }} />
                Guardar correo
              </motion.button>
              <motion.button
                onClick={() => { setEditingEmail(false); setNewEmail(""); }}
                disabled={loadingEmail}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="rounded-lg px-5 py-2.5"
                style={{ background: "transparent", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-text)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Cancelar
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", fontWeight: 600, color: "var(--color-cq-text)", marginBottom: 10 }}>
              {usuario?.email}
            </p>
            {usuario?.email_verificado ? (
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check" style={{ fontSize: "0.75rem", color: "#10b981" }} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#10b981", fontWeight: 500 }}>
                  Correo verificado
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "0.72rem", color: "#f59e0b" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#f59e0b", fontWeight: 500 }}>
                    Pendiente de verificación
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-cq-muted)", lineHeight: 1.5 }}>
                  Verifica tu correo para acceder a todas las funciones de tu cuenta.
                </p>
                {!resendSent && (
                  <motion.button
                    onClick={handleResendVerification} disabled={resending}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-cq-primary)", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: resending ? "not-allowed" : "pointer", opacity: resending ? 0.6 : 1, width: "fit-content" }}
                  >
                    <i className="fa-solid fa-paper-plane" style={{ fontSize: "0.65rem" }} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600 }}>
                      Reenviar verificación
                    </span>
                  </motion.button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── 3. Datos de facturación ── */}
      <Card
        title="Datos de facturación"
        description="RFC y razón social para tus facturas"
        onEdit={() => setEditingFacturacion(true)}
        editing={editingFacturacion}
        loading={loading}
        optional
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="RFC"          value={form.rfc}          editing={editingFacturacion}
            onChange={(v) => setForm({ ...form, rfc: v })}          placeholder="XAXX010101000" />
          <Field label="Razón social" value={form.razon_social} editing={editingFacturacion}
            onChange={(v) => setForm({ ...form, razon_social: v })} placeholder="Empresa S.A. de C.V." />
        </div>
        {editingFacturacion && <SaveRow loading={loading} onSave={() => handleSave("facturacion")} onCancel={() => handleCancel("facturacion")} />}
      </Card>

      {/* ── 4. Meta info ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-px rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--color-cq-border)" }}
      >
        {[
          { label: "Cuenta creada", value: formatDate(usuario?.created_at ?? null) },
          { label: "Último acceso", value: formatDate(usuario?.ultimo_login ?? null) },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "16px 20px", background: "var(--color-cq-surface-2)",
            borderRight: i === 0 ? "1px solid var(--color-cq-border)" : undefined,
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-cq-muted-2)", marginBottom: 6 }}>
              {item.label}
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-text)" }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}