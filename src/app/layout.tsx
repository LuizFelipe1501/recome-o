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

export const metadata: Metadata = {
  title: "Recomeço",
  description:
    "Apoio para quem quer parar ou diminuir as apostas e para quem está do lado. Botão para os momentos de vontade, plano para as dívidas e espaço para a família.",
};

export const viewport: Viewport = {
  themeColor: "#3b4cff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} ${bricolage.variable} h-full`}>
      <body className="min-h-full">
        <ProvedorEstado>{children}</ProvedorEstado>
      </body>
    </html>
  );
}
