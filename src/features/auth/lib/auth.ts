// features/auth/lib/auth.ts
// ─────────────────────────────────────────────────────────────
// Instancia central de Better Auth.
//
// - Conexión: reutiliza el pool singleton de MySQL (shared/lib/db/pool).
// - IDs numéricos (generateId: "serial") → compatibles con las FKs
//   `usuario_id INT` de pedidos/direcciones.
// - Tabla de usuario mapeada a `usuarios` con columnas en español.
// - Emails (verificación / reset) reusan los templates Resend existentes.
// ─────────────────────────────────────────────────────────────
import { betterAuth }  from "better-auth";
import { nextCookies }  from "better-auth/next-js";
import { pool }         from "@/shared/lib/db/pool";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/shared/lib/email/send";

export const auth = betterAuth({
  database: pool,

  advanced: {
    database: {
      // IDs auto-incrementales numéricos (no UUID string)
      generateId: "serial",
    },
  },

  emailAndPassword: {
    enabled:           true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url }) => {
      const nombre = (user as { nombre?: string }).nombre ?? user.name;
      await sendPasswordResetEmail(user.email, nombre, url);
    },
  },

  emailVerification: {
    sendOnSignUp:            true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const nombre = (user as { nombre?: string }).nombre ?? user.name;
      await sendWelcomeEmail(user.email, nombre, url);
    },
  },

  user: {
    modelName: "usuarios",
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (
        { user, url }: { user: { email: string; name: string; nombre?: string }; url: string },
      ) => {
        const nombre = user.nombre ?? user.name;
        // Enlace de aprobación al correo actual (Better Auth solo lo envía
        // cuando el correo actual está verificado).
        await sendVerificationEmail(user.email, nombre, url);
      },
    },
    fields: {
      emailVerified: "email_verificado",
      image:         "avatar_url",
      createdAt:     "created_at",
      updatedAt:     "updated_at",
    },
    additionalFields: {
      nombre:       { type: "string", required: true },
      apellido:     { type: "string", required: true },
      telefono:     { type: "string", required: false },
      rol: {
        type:         ["cliente", "vendedor", "admin", "superadmin"],
        required:     false,
        defaultValue: "cliente",
        input:        false, // controlado por el servidor, no por el cliente
      },
      estado: {
        type:         ["activo", "inactivo", "suspendido", "pendiente_verificacion"],
        required:     false,
        defaultValue: "pendiente_verificacion",
        input:        false,
      },
      rfc:          { type: "string", required: false },
      razon_social: { type: "string", required: false },
    },
  },

  // nextCookies() debe ir SIEMPRE al final del array de plugins.
  plugins: [nextCookies()],
});
