import { getCategorias, getProductosCatalogo } from "@mpeduardo98/commerce-core/catalogo";
import { CategoriesSection } from "./CategoriesSection";
import { FeaturedProductsSection } from "./FeaturedProductsSection";

export async function CatalogoInicio() {
  const [categorias, { productos }] = await Promise.all([
    getCategorias(),
    getProductosCatalogo({ sort: "reciente", limit: 12 }),
  ]);

  return (
    <>
      <CategoriesSection categorias={categorias} />
      <FeaturedProductsSection productos={productos} />
    </>
  );
}
