import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./global/components/header/Header";
import { Footer } from "./global/components/footer/Footer";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Craftqube — Perfiles de Aluminio & Automatización Industrial",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
        style={{
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          backgroundColor: "#FFFFFF",
          color: "#1F2937",
        }}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}