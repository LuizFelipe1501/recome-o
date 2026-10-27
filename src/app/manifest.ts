import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Recomeço",
    short_name: "Recomeço",
    description: "Apoio para quem quer parar de apostar e para quem está do lado.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fcfc30",
    theme_color: "#fcfc30",
    lang: "pt-BR",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icone-mascara-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Estou com vontade", url: "/app/crise", icons: [{ src: "/icone-192.png", sizes: "192x192" }] },
      { name: "Check-in do dia", url: "/app#checkin", icons: [{ src: "/icone-192.png", sizes: "192x192" }] },
    ],
  };
}
