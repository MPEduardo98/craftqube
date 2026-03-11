// app/global/context/AlertContext.tsx
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  ReactNode,
} from "react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface Alert {
  id:        string;
  type:      AlertType;
  title?:    string;
  message:   string;
  duration?: number; // ms — 0 = persistente
}

interface AlertContextValue {
  alerts:  Alert[];
  show:    (opts: Omit<Alert, "id">) => string;
  dismiss: (id: string) => void;
  clear:   () => void;
  // Helpers rápidos
  success: (message: string, title?: string, duration?: number) => string;
  error:   (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info:    (message: string, title?: string, duration?: number) => string;
}

const AlertContext = createContext<AlertContextValue>({
  alerts:  [],
  show:    () => "",
  dismiss: () => {},
  clear:   () => {},
  success: () => "",
  error:   () => "",
  warning: () => "",
  info:    () => "",
});

const DEFAULT_DURATION: Record<AlertType, number> = {
  success: 4000,
  error:   6000,
  warning: 5000,
  info:    4500,
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const show = useCallback((opts: Omit<Alert, "id">): string => {
    const id       = Math.random().toString(36).slice(2, 10);
    const duration = opts.duration ?? DEFAULT_DURATION[opts.type];

    setAlerts((prev) => {
      // Máximo 5 alertas visibles al mismo tiempo
      const next = [...prev, { ...opts, id, duration }];
      return next.length > 5 ? next.slice(next.length - 5) : next;
    });

    if (duration > 0) {
      const t = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, t);
    }

    return id;
  }, [dismiss]);

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setAlerts([]);
  }, []);

  const success = useCallback(
    (message: string, title?: string, duration?: number) =>
      show({ type: "success", message, title, duration }),
    [show]
  );
  const error = useCallback(
    (message: string, title?: string, duration?: number) =>
      show({ type: "error", message, title, duration }),
    [show]
  );
  const warning = useCallback(
    (message: string, title?: string, duration?: number) =>
      show({ type: "warning", message, title, duration }),
    [show]
  );
  const info = useCallback(
    (message: string, title?: string, duration?: number) =>
      show({ type: "info", message, title, duration }),
    [show]
  );

  return (
    <AlertContext.Provider value={{ alerts, show, dismiss, clear, success, error, warning, info }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}