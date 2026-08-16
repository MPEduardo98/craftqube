// app/api/auth/[...all]/route.ts
// ─────────────────────────────────────────────────────────────
// Handler catch-all de Better Auth. Atiende TODAS las rutas
// /api/auth/* (sign-in, sign-up, sign-out, verify-email,
// reset-password, get-session, …).
// ─────────────────────────────────────────────────────────────
import { auth }             from "@/features/auth/lib/auth";
import { toNextJsHandler }  from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
