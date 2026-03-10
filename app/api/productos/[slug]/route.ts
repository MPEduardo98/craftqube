// app/api/productos/[slug]/route.ts
import { NextResponse } from "next/server";
import { getProductoBySlug } from "@/app/global/lib/db/getProductoBySlug";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await getProductoBySlug(slug);

  if (!data) {
    return NextResponse.json(
      { success: false, error: "Producto no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data });
}