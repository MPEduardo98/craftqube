// app/contacto/components/ContactInfo.tsx
"use client";

import { motion } from "framer-motion";

const contactMethods = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: "Email",
    value: "contacto@craftqube.com",
    href: "mailto:contacto@craftqube.com",
    description: "Respuesta en menos de 24 horas",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: "Teléfono",
    value: "+52 (222) 123-4567",
    href: "tel:+522221234567",
    description: "Lun - Vie, 9:00 - 18:00",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Ubicación",
    value: "Puebla, México",
    href: null,
    description: "Envíos a toda la República",
  },
];

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/craftqube",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/craftqube",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@craftqube",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
];

export function ContactInfo() {
  return (
    <div>
      <motion.h2
        className="text-display text-2xl mb-6"
        style={{ color: "var(--color-cq-text)" }}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Canales de contacto
      </motion.h2>

      <motion.p
        className="text-sm leading-relaxed mb-10"
        style={{ color: "var(--color-cq-muted)" }}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Elige el medio que prefieras. Nuestro equipo está listo para atenderte.
      </motion.p>

      {/* Contact methods */}
      <div className="space-y-6 mb-12">
        {contactMethods.map((method, index) => (
          <motion.div
            key={method.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
          >
            {method.href ? (
              <a
                href={method.href}
                className="flex gap-4 p-4 rounded-xl transition-all duration-200"
                style={{
                  background: "var(--color-cq-surface)",
                  border: "1px solid var(--color-cq-border)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-cq-accent)";
                  e.currentTarget.style.background = "var(--color-cq-accent-glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-cq-border)";
                  e.currentTarget.style.background = "var(--color-cq-surface)";
                }}
              >
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                  style={{
                    background: "var(--color-cq-accent-glow)",
                    color: "var(--color-cq-accent)",
                  }}
                >
                  {method.icon}
                </div>
                <div>
                  <h3
                    className="text-sm font-bold mb-1"
                    style={{ color: "var(--color-cq-text)" }}
                  >
                    {method.title}
                  </h3>
                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: "var(--color-cq-accent)" }}
                  >
                    {method.value}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--color-cq-muted-2)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {method.description}
                  </p>
                </div>
              </a>
            ) : (
              <div
                className="flex gap-4 p-4 rounded-xl"
                style={{
                  background: "var(--color-cq-surface)",
                  border: "1px solid var(--color-cq-border)",
                }}
              >
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                  style={{
                    background: "var(--color-cq-accent-glow)",
                    color: "var(--color-cq-accent)",
                  }}
                >
                  {method.icon}
                </div>
                <div>
                  <h3
                    className="text-sm font-bold mb-1"
                    style={{ color: "var(--color-cq-text)" }}
                  >
                    {method.title}
                  </h3>
                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: "var(--color-cq-text)" }}
                  >
                    {method.value}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--color-cq-muted-2)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {method.description}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Social links */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3
          className="text-sm font-bold mb-4"
          style={{
            color: "var(--color-cq-text)",
            fontFamily: "var(--font-display)",
          }}
        >
          Síguenos en redes
        </h3>
        <div className="flex gap-3">
          {socialLinks.map((social) => (
            <motion.a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center w-11 h-11 rounded-lg"
              style={{
                background: "var(--color-cq-surface)",
                border: "1px solid var(--color-cq-border)",
                color: "var(--color-cq-muted)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-cq-accent)";
                e.currentTarget.style.color = "var(--color-cq-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-cq-border)";
                e.currentTarget.style.color = "var(--color-cq-muted)";
              }}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}