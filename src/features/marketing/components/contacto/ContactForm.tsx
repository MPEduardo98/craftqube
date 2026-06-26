// app/contacto/components/ContactForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  });

  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simular envío (aquí iría la integración con tu backend)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 rounded-2xl text-center"
        style={{
          background: "var(--color-cq-accent-glow)",
          border: "1px solid rgba(37, 99, 235, 0.2)",
          minHeight: "500px",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--color-cq-accent)" }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3
          className="text-display text-2xl mb-3"
          style={{ color: "var(--color-cq-text)" }}
        >
          ¡Mensaje enviado!
        </h3>
        <p className="text-sm mb-8" style={{ color: "var(--color-cq-muted)" }}>
          Gracias por contactarnos. Te responderemos en menos de 24 horas.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setSubmitted(false);
            setFormData({
              nombre: "",
              email: "",
              telefono: "",
              asunto: "",
              mensaje: "",
            });
          }}
          className="px-6 py-3 rounded-lg text-sm font-bold"
          style={{
            background: "var(--color-cq-accent)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.05em",
          }}
        >
          Enviar otro mensaje
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-2xl"
      style={{
        background: "var(--color-cq-surface)",
        border: "1px solid var(--color-cq-border)",
      }}
    >
      <h2
        className="text-display text-2xl mb-6"
        style={{ color: "var(--color-cq-text)" }}
      >
        Envíanos un mensaje
      </h2>

      <div className="space-y-5">
        {/* Nombre */}
        <div>
          <label
            htmlFor="nombre"
            className="block text-xs font-bold mb-2"
            style={{
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Nombre completo
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--color-cq-bg)",
              border: "1.5px solid var(--color-cq-border)",
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-cq-accent)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--color-cq-border)")
            }
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold mb-2"
            style={{
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--color-cq-bg)",
              border: "1.5px solid var(--color-cq-border)",
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-cq-accent)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--color-cq-border)")
            }
          />
        </div>

        {/* Teléfono */}
        <div>
          <label
            htmlFor="telefono"
            className="block text-xs font-bold mb-2"
            style={{
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--color-cq-bg)",
              border: "1.5px solid var(--color-cq-border)",
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-cq-accent)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--color-cq-border)")
            }
          />
        </div>

        {/* Asunto */}
        <div>
          <label
            htmlFor="asunto"
            className="block text-xs font-bold mb-2"
            style={{
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Asunto
          </label>
          <select
            id="asunto"
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--color-cq-bg)",
              border: "1.5px solid var(--color-cq-border)",
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-cq-accent)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--color-cq-border)")
            }
          >
            <option value="">Selecciona una opción</option>
            <option value="cotizacion">Solicitar cotización</option>
            <option value="asesoria">Asesoría técnica</option>
            <option value="soporte">Soporte / Garantía</option>
            <option value="distribuidor">Ser distribuidor</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Mensaje */}
        <div>
          <label
            htmlFor="mensaje"
            className="block text-xs font-bold mb-2"
            style={{
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Mensaje
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all resize-none"
            style={{
              background: "var(--color-cq-bg)",
              border: "1.5px solid var(--color-cq-border)",
              color: "var(--color-cq-text)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-cq-accent)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--color-cq-border)")
            }
          />
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={sending}
          whileHover={!sending ? { scale: 1.02 } : {}}
          whileTap={!sending ? { scale: 0.98 } : {}}
          className="w-full px-6 py-4 rounded-lg text-sm font-bold tracking-wide"
          style={{
            background: sending
              ? "var(--color-cq-muted-2)"
              : "var(--color-cq-accent)",
            color: "white",
            border: "none",
            cursor: sending ? "not-allowed" : "pointer",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            boxShadow: sending ? "none" : "0 4px 20px rgba(37, 99, 235, 0.3)",
          }}
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Enviando...
            </span>
          ) : (
            "Enviar mensaje"
          )}
        </motion.button>
      </div>

      <p
        className="text-xs mt-4 text-center"
        style={{
          color: "var(--color-cq-muted-2)",
          fontFamily: "var(--font-mono)",
        }}
      >
        Al enviar este formulario aceptas nuestra política de privacidad
      </p>
    </motion.form>
  );
}