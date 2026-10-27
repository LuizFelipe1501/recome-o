import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ProvedorEstado } from "@/lib/estado";
import "./globals.css";

// Fontes hospedadas no próprio app: funcionam mesmo sem acesso ao Google Fonts.
const atkinson = localFont({
  variable: "--font-atkinson",
  display: "swap",
  src: [
    { path: "../fonts/atkinson-hyperlegible-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/atkinson-hyperlegible-latin-700-normal.woff2", weight: "700" },
  ],
});

const bricolage = localFont({
  variable: "--font-bricolage",
  display: "swap",
  src: [
    { path: "../fonts/bricolage-grotesque-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/bricolage-grotesque-latin-700-normal.woff2", weight: "700" },
    { path: "../fonts/bricolage-grotesque-latin-800-normal.woff2", weight: "800" },
  ],
});

const pixel = localFont({
  variable: "--font-pixel",
  display: "swap",
  src: [
    { path: "../fonts/silkscreen-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/silkscreen-latin-700-normal.woff2", weight: "700" },
  ],
});

export const metadata: Metadata = {
  title: "Recomeço",
  applicationName: "Recomeço",
  appleWebApp: { capable: true, title: "Recomeço", statusBarStyle: "default" },
  icons: { icon: "/icone-192.png", apple: "/apple-touch-icon.png" },
  description:
    "Apoio para quem quer parar ou diminuir as apostas e para quem está do lado. Botão para os momentos de vontade, plano para as dívidas e espaço para a família.",
};

export const viewport: Viewport = {
  themeColor: "#fcfc30",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} ${bricolage.variable} ${pixel.variable} h-full`}>
      <body className="min-h-full">
        <ProvedorEstado>{children}</ProvedorEstado>
      </body>
    </html>
  );
}
