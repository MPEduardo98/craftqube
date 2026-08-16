// app/global/types/auth.ts
// ─────────────────────────────────────────────────────────────
// Tipos de autenticación, usuarios y sesiones
// ─────────────────────────────────────────────────────────────

export type UserRole   = "cliente" | "vendedor" | "admin" | "superadmin";
export type UserEstado =
  | "activo"
  | "inactivo"
  | "suspendido"
  | "pendiente_verificacion";

export interface Usuario {
  id:                 number;
  email:              string;
  nombre:             string;
  apellido:           string;
  telefono:           string | null;
  rol:                UserRole;
  estado:             UserEstado;
  email_verificado:   boolean;
  avatar_url:         string | null;
  rfc:                string | null;
  razon_social:       string | null;
  ultimo_login:       string | null;
  created_at:         string;
}

/** Versión pública (sin password_hash ni notas_internas) */
export type UsuarioPublico = Usuario;

// ─── Payload de registro (usado por el formulario / AuthContext) ──
export interface RegisterPayload {
  nombre:    string;
  apellido:  string;
  email:     string;
  password:  string;
  telefono?: string;
}