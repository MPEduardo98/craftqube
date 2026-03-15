// app/layout.tsx
// ─────────────────────────────────────────────────────────────
// Root layout — solo fuentes, providers globales y metadata.
// Header / Footer / CartDrawer se renderizan en
// app/(main)/layout.tsx para que /admin y /auth queden limpios.
// ─────────────────────────────────────────────────────────────
import type { Metadata }  from "next";
import { Barlow_Condensed, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider }    from "./global/context/ThemeContext";
import { CartProvider }     from "./global/context/CartContext";
import { WishlistProvider } from "./global/context/WishlistContext";
import { AuthProvider }     from "./global/context/AuthContext";
import { AlertProvider }    from "./global/context/AlertContext";
import { AlertContainer }   from "./global/components/alerts/AlertContainer";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  "CraftQube — Perfiles de Aluminio & Automatización Industrial",
    template: "%s — CraftQube",
  },
  description:
    "Distribuidor premium de perfiles estructurales de aluminio, tornillería, escuadras y sistemas de automatización industrial en México.",
  keywords: [
    "perfil aluminio",
    "perfiles estructurales aluminio",
    "automatización industrial",
    "tornillería industrial",
    "escuadras aluminio",
    "Craftqube",
    "Mexico",
  ],
  openGraph: {
    type:        "website",
    siteName:    "CraftQube",
    locale:      "es_MX",
    url:         SITE_URL,
    title:       "CraftQube — Perfiles de Aluminio & Automatización Industrial",
    description: "Distribuidor premium de perfiles estructurales de aluminio, tornillería y accesorios industriales en México.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "CraftQube — Perfiles de Aluminio" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "CraftQube — Perfiles de Aluminio & Automatización Industrial",
    description: "Distribuidor premium de perfiles estructurales de aluminio y accesorios industriales en México.",
    images:      ["/og-default.jpg"],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organizationLd = buildOrganizationJsonLd();

  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />

        <AlertProvider>
          <AuthProvider>
            <ThemeProvider>
              <CartProvider>
                <WishlistProvider>
                  {children}
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