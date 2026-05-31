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
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
