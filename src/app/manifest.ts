import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shopyacu Online Store",
    short_name: "Shopyacu",
    description: "Shop home, kitchen, fitness, office, and outdoor products in Kigali. Order on WhatsApp.",
    start_url: "/?utm_source=pwa",
    display: "standalone",
    background_color: "#f1f2f4",
    theme_color: "#f68b1e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
