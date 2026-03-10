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
export type UsuarioPublico = Omit<Usuario, "rfc" | "razon_social">;

export interface Sesion {
  id:             number;
  usuario_id:     number;
  refresh_token:  string;
  ip:             string | null;
  activa:         boolean;
  expira_en:      string;
  last_used_at:   string | null;
  created_at:     string;
}

export type TokenTipo =
  | "verificar_email"
  | "reset_password"
  | "magic_link"
  | "invitacion";

export interface TokenVerificacion {
  id:         number;
  usuario_id: number;
  token:      string;
  tipo:       TokenTipo;
  usado:      boolean;
  expira_en:  string;
  created_at: string;
}

// ─── Payloads de API ─────────────────────────────────────────

export interface RegisterPayload {
  nombre:    string;
  apellido:  string;
  email:     string;
  password:  string;
  telefono?: string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface AuthResponse {
  success:      boolean;
  accessToken?: string;
  usuario?:     UsuarioPublico;
  error?:       string;
}