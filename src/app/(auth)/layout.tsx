// app/(auth)/layout.tsx
import { AvisoAnalitica } from "@/shared/components/analitica/AvisoAnalitica";
import type { ReactNode } from "react";

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