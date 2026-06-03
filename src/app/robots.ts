import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep admin tooling, internal APIs, and the analytics proxy out of
        // the index — they have no SEO value and shouldn't be crawled.
        disallow: ["/admin", "/api/", "/ingest/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
