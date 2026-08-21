// features/auth/context/AuthContext.tsx
// ─────────────────────────────────────────────────────────────
// Wrapper de React sobre el cliente de Better Auth.
// Mantiene la MISMA interfaz pública que la versión anterior
// (usuario, cargando, autenticado, login, register, logout,
// refreshUser) para no tocar los componentes que la consumen.
// ─────────────────────────────────────────────────────────────
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authClient }            from "@/features/auth/lib/auth-client";
import type { UsuarioPublico }   from "@/features/auth/types/auth";

interface AuthState {
  usuario:     UsuarioPublico | null;
  cargando:    boolean;
  autenticado: boolean;
}

interface AuthContextValue extends AuthState {
  login:       (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register:    (payload: RegisterInput) => Promise<{ ok: boolean; error?: string }>;
  logout:      () => Promise<{ ok: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

interface RegisterInput {
  nombre:    string;
  apellido:  string;
  email:     string;
  password:  string;
  telefono?: string;
}

/* ── Mapea el user de Better Auth → UsuarioPublico ─────────── */
type BetterAuthUser = {
  id:            string | number;
  email:         string;
  name:          string;
  emailVerified: boolean;
  image?:        string | null;
  createdAt?:    string | Date;
  nombre?:       string;
  apellido?:     string;
  telefono?:     string | null;
  rol?:          string;
  estado?:       string;
  rfc?:          string | null;
  razon_social?: string | null;
};

function toUsuario(u: BetterAuthUser): UsuarioPublico {
  return {
    id:               Number(u.id),
    email:            u.email,
    nombre:           u.nombre   ?? u.name ?? "",
    apellido:         u.apellido ?? "",
    telefono:         u.telefono ?? null,
    rol:              (u.rol    ?? "cliente") as UsuarioPublico["rol"],
    estado:           (u.estado ?? "pendiente_verificacion") as UsuarioPublico["estado"],
    email_verificado: Boolean(u.emailVerified),
    avatar_url:       u.image ?? null,
    rfc:              u.rfc ?? null,
    razon_social:     u.razon_social ?? null,
    ultimo_login:     null,
    created_at:       u.createdAt ? new Date(u.createdAt).toISOString() : "",
  };
}

const AuthContext = createContext<AuthContextValue>({
  usuario:     null,
  cargando:    true,
  autenticado: false,
  login:       async () => ({ ok: false }),
  register:    async () => ({ ok: false }),
  logout:      async () => ({ ok: false }),
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario,  setUsuario]  = useState<UsuarioPublico | null>(null);
  const [cargando, setCargando] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      setUsuario(data?.user ? toUsuario(data.user as BetterAuthUser) : null);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error || !data) {
      return { ok: false, error: error?.message ?? "Credenciales incorrectas" };
    }
    await refreshUser();
    return { ok: true };
  }, [refreshUser]);

  const register = useCallback(async (payload: RegisterInput) => {
    const { data, error } = await authClient.signUp.email({
      email:       payload.email,
      password:    payload.password,
      name:        `${payload.nombre} ${payload.apellido}`.trim(),
      nombre:      payload.nombre,
      apellido:    payload.apellido,
      telefono:    payload.telefono ?? undefined,
      callbackURL: "/verificar",
    });
    if (error || !data) {
      return { ok: false, error: error?.message ?? "Error al registrarse" };
    }
    await refreshUser();
    return { ok: true };
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        return { ok: false, error: error.message ?? "No pudimos cerrar tu sesión" };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: "No pudimos cerrar tu sesión" };
    } finally {
      // La sesión local se limpia pase lo que pase: el usuario pidió salir
      // y no debe quedarse con la UI en estado autenticado.
      setUsuario(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      autenticado: !!usuario,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
