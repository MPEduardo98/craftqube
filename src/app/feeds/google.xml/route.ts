// app/feeds/google.xml/route.ts
// ─────────────────────────────────────────────────────────────
// Feed de productos para Google Merchant Center. Lo arma el
// núcleo; aquí sólo se conecta con la ruta de producto de esta
// tienda (/producto/<slug>). Merchant Center lo descarga cada día
// desde https://craftqube.mx/feeds/google.xml.
// ─────────────────────────────────────────────────────────────
import { feedGoogleMerchant } from "@mpeduardo98/commerce-core/seo/merchant";

export const revalidate = 3600;

export const GET = () => feedGoogleMerchant({ rutas: { producto: (slug) => `/producto/${slug}` } });
