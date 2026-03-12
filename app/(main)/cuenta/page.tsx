// app/(main)/cuenta/page.tsx
"use client";

import { useState } from "react";
import { AccountLayout, type Section } from "./components/AccountLayout";
import { PerfilSection }      from "./components/sections/PerfilSection";
import { PedidosSection }     from "./components/sections/PedidosSection";
import { FavoritosSection }   from "./components/sections/FavoritosSection";
import { DireccionesSection } from "./components/sections/DireccionesSection";

const SECTIONS: Record<Section, React.ReactNode> = {
  perfil:      <PerfilSection />,
  pedidos:     <PedidosSection />,
  favoritos:   <FavoritosSection />,
  direcciones: <DireccionesSection />,
};

export default function CuentaPage() {
  const [active, setActive] = useState<Section>("perfil");

  return (
    <AccountLayout active={active} setActive={setActive}>
      {SECTIONS[active]}
    </AccountLayout>
  );
}