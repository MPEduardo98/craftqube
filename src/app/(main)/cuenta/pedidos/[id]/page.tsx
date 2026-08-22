// app/(main)/cuenta/pedidos/[id]/page.tsx
import { PedidoDetalleSection } from "@/features/account/components/sections/PedidoDetalleSection";

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // `key` fuerza el remonte al cambiar de pedido: el componente carga el
  // detalle una sola vez al montar, sin resetear estado dentro del efecto.
  return <PedidoDetalleSection key={id} pedidoId={id} />;
}
