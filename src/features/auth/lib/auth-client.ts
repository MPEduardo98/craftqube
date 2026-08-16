// features/auth/lib/auth-client.ts
// ─────────────────────────────────────────────────────────────
// Cliente de Better Auth para componentes React ("use client").
// inferAdditionalFields tipa los campos extra (nombre, apellido,
// rol, estado, …) a partir de la instancia del servidor.
// ─────────────────────────────────────────────────────────────
import { createAuthClient }        from "better-auth/react";
import { inferAdditionalFields }   from "better-auth/client/plugins";
import type { auth }               from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
