// app/layout.tsx
// ─────────────────────────────────────────────────────────────
// Server Component raíz.
// Fetcha categorías en el servidor (unstable_cache, TTL 5 min)
// y las pasa al Header como prop → cero waterfalls en cliente.
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
  title:       "Craftqube — Perfiles de Aluminio & Automatización Industrial",
  description:
    "Distribuidor premium de perfiles estructurales de aluminio, tornillería, escuadras y sistemas de automatización industrial. Calidad, precisión y tecnología.",
  keywords: [
    "perfil aluminio",
    "automatización industrial",
    "tornillería",
    "escuadras aluminio",
    "Craftqube",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  // Categorías resueltas en el servidor — sin fetch client-side
  // unstable_cache devuelve la misma respuesta si no expiró el TTL
  const categorias = await getCategorias().catch(() => []);

  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AlertProvider>
          <AuthProvider>
            <ThemeProvider>
              <CartProvider>
                <WishlistProvider>
                  {/* initialCategorias → header las muestra al instante */}
                  <Header initialCategorias={categorias} />
                  <CartDrawer />
                  {/* pt-16 compensa el header fixed de h-16 (64px) */}
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