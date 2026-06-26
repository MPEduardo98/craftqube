// app/global/hooks/useUnsavedChanges.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useUnsavedChanges(isDirty: boolean) {
  const router                                    = useRouter();
  const [showModal, setShowModal]                 = useState(false);
  const pendingHref                               = useRef<string | "back" | null>(null);
  const skipGuardRef                              = useRef(false);

  // 1. Cierre de pestaña / recarga
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // 2. Botón atrás / adelante del navegador
  useEffect(() => {
    if (!isDirty) return;
    window.history.pushState(null, "", window.location.href);
    const handler = () => {
      if (skipGuardRef.current) { skipGuardRef.current = false; return; }
      window.history.pushState(null, "", window.location.href);
      pendingHref.current = "back";
      setShowModal(true);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isDirty]);

  // 3. Interceptar clics en <a> (sidebar, breadcrumbs, enlaces internos)
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target === "_blank") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      pendingHref.current = href;
      setShowModal(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [isDirty]);

  // Navegación programática con guardia
  const navigate = useCallback(
    (href: string) => {
      if (!isDirty) { router.push(href); return; }
      pendingHref.current = href;
      setShowModal(true);
    },
    [isDirty, router],
  );

  const confirmLeave = useCallback(() => {
    setShowModal(false);
    const dest = pendingHref.current;
    pendingHref.current = null;
    skipGuardRef.current = true;
    if (dest === "back") router.back();
    else if (dest)       router.push(dest);
  }, [router]);

  const cancelLeave = useCallback(() => {
    setShowModal(false);
    pendingHref.current = null;
  }, []);

  return { showModal, navigate, confirmLeave, cancelLeave };
}