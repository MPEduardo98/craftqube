// app/global/context/AuthContext.tsx
// ─────────────────────────────────────────────────────────────
// Contexto de autenticación — JWT access token + refresh
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
import type { UsuarioPublico } from "@/app/global/types/auth";

interface AuthState {
  usuario:     UsuarioPublico | null;
  cargando:    boolean;
  autenticado: boolean;
}

interface AuthContextValue extends AuthState {
  login:      (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register:   (payload: RegisterInput) => Promise<{ ok: boolean; error?: string }>;
  logout:     () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterInput {
  nombre:    string;
  apellido:  string;
  email:     string;
  password:  string;
  telefono?: string;
}

const AuthContext = createContext<AuthContextValue>({
  usuario:     null,
  cargando:    true,
  autenticado: false,
  login:       async () => ({ ok: false }),
  register:    async () => ({ ok: false }),
  logout:      async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario,  setUsuario]  = useState<UsuarioPublico | null>(null);
  const [cargando, setCargando] = useState(true);

  /** Verifica sesión activa al montar */
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setUsuario(json.usuario ?? null);
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setUsuario(json.usuario);
        return { ok: true };
      }
      return { ok: false, error: json.error ?? "Error al iniciar sesión" };
    } catch {
      return { ok: false, error: "Error de conexión" };
    }
  }, []);

  const register = useCallback(async (payload: RegisterInput) => {
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setUsuario(json.usuario);
        return { ok: true };
      }
      return { ok: false, error: json.error ?? "Error al registrarse" };
    } catch {
      return { ok: false, error: "Error de conexión" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
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