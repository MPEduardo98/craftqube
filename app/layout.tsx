// app/layout.tsx
// ─────────────────────────────────────────────────────────────
// Server Component raíz.
// CAMBIOS SEO:
//  - Añadido metadataBase → URLs OG y canonical son absolutas
//  - Añadido openGraph y twitter globales
//  - JSON-LD Organization inyectado una sola vez aquí
// ─────────────────────────────────────────────────────────────
import type { Metadata }  from "next";
import { Barlow_Condensed, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { Header }           from "./global/components/header/Header";
import { Footer }           from "./global/components/footer/Footer";
import { CartDrawer }       from "./global/components/cart/CartDrawer";
import { ThemeProvider }    from "./global/context/ThemeContext";
import { CartProvider }     from "./global/context/CartContext";
import { WishlistProvider } from "./global/context/WishlistContext";
import { AuthProvider }     from "./global/context/AuthContext";
import { AlertProvider }    from "./global/context/AlertContext";
import { AlertContainer }   from "./global/components/alerts/AlertContainer";
import { getCategorias }    from "./global/lib/db/getCategorias";
import { buildOrganizationJsonLd } from "./global/lib/seo/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.com";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700", "800"],
  display:  "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700"],
  display:  "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets:  ["latin"],
  weight:   ["400", "500"],
  display:  "swap",
});

// ── Metadata global ───────────────────────────────────────────
// metadataBase es CRÍTICO: sin él, Next.js no puede construir
// URLs absolutas para OG images ni canonical links.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  "CraftQube — Perfiles de Aluminio & Automatización Industrial",
    template: "%s — CraftQube",
  },
  description:
    "Distribuidor premium de perfiles estructurales de aluminio, tornillería, escuadras y sistemas de automatización industrial en México. Calidad, precisión y tecnología.",
  keywords: [
    "perfil aluminio",
    "perfiles estructurales aluminio",
    "automatización industrial",
    "tornillería industrial",
    "escuadras aluminio",
    "Craftqube",
    "Mexico",
  ],

  // ── OpenGraph global (heredado por páginas que no lo sobreescriben) ──
  openGraph: {
    type:      "website",
    siteName:  "CraftQube",
    locale:    "es_MX",
    url:       SITE_URL,
    title:     "CraftQube — Perfiles de Aluminio & Automatización Industrial",
    description:
      "Distribuidor premium de perfiles estructurales de aluminio, tornillería y accesorios industriales en México.",
    images: [
      {
        url:    "/og-default.jpg", // → se resuelve a SITE_URL/og-default.jpg
        width:  1200,
        height: 630,
        alt:    "CraftQube — Perfiles de Aluminio",
      },
    ],
  },

  // ── Twitter Card global ───────────────────────────────────
  twitter: {
    card:  "summary_large_image",
    title: "CraftQube — Perfiles de Aluminio & Automatización Industrial",
    description:
      "Distribuidor premium de perfiles estructurales de aluminio y accesorios industriales en México.",
    images: ["/og-default.jpg"],
  },

  // ── Índexado ─────────────────────────────────────────────
  robots: {
    index:             true,
    follow:            true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categorias     = await getCategorias().catch(() => []);
  const organizationLd = buildOrganizationJsonLd();

  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* JSON-LD Organization — una sola vez en todo el sitio */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />

        <AlertProvider>
          <AuthProvider>
            <ThemeProvider>
              <CartProvider>
                <WishlistProvider>
                  <Header initialCategorias={categorias} />
                  <CartDrawer />
                  <main>{children}</main>
                  <Footer />
                  <AlertContainer />
                </WishlistProvider>
              </CartProvider>
            </ThemeProvider>
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}