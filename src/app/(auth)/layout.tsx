// app/(auth)/layout.tsx
import { AvisoAnalitica } from "@/shared/components/analitica/AvisoAnalitica";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// Login, registro y recuperación no aportan nada en Google. Van con
// noindex en vez de bloquearse en robots.txt: si Google no puede
// rastrearlas, tampoco ve el noindex y aún podría listar la URL.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-cq-bg)" }}
    >
      {children}
      <AvisoAnalitica />
    </div>
  );
}