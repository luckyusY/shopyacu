// Central SEO configuration. The canonical production domain drives sitemap
// URLs, canonical tags, OpenGraph, Twitter cards, and JSON-LD. Override with
// NEXT_PUBLIC_SITE_URL in the environment (e.g. a staging preview) if needed.
// NOTE: the apex domain (shopyacu.com) 307-redirects to www.shopyacu.com on
// Vercel, so www is the canonical, non-redirecting host. Sitemap URLs and
// canonical tags MUST point here or Google reports "Sitemap could not be read".
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.shopyacu.com"
).replace(/\/$/, "");

export const SITE_NAME = "Shopyacu";

export const SITE_TAGLINE = "Online Store & Marketplace in Kigali";

export const SITE_DESCRIPTION =
  "Shopyacu is Kigali's online store for home, kitchen, bathroom, fitness, office, and outdoor products. Order on WhatsApp with pay-on-delivery (WISHYURA BIKUGEZEHO) across Rwanda.";

export const DEFAULT_OG_IMAGE = "/logo.png";

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/shopyacu",
  whatsapp: "https://wa.me/250789448107",
};

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Canonical metadata `alternates` block for a given path. */
export function canonical(path = "/") {
  return { canonical: absoluteUrl(path) };
}

type OgImageInput = string | undefined;

/**
 * Shared OpenGraph + Twitter card builder so every page ships consistent,
 * crawlable social metadata.
 */
export function buildOpenGraph({
  title,
  description,
  path = "/",
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path?: string;
  image?: OgImageInput;
  type?: "website" | "article";
}) {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: "en_RW",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Organization JSON-LD for the homepage / root layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    description: SITE_DESCRIPTION,
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.whatsapp],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+250789448107",
        contactType: "sales",
        areaServed: "RW",
        availableLanguage: ["en", "rw"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kigali",
      addressCountry: "RW",
    },
  };
}

/** WebSite JSON-LD with sitelinks search box. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList JSON-LD from an ordered list of crumbs. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
