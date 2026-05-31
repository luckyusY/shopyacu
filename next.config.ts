import type { NextConfig } from "next";

// PostHog ingestion endpoints (default to the US cloud). EU projects can
// override via POSTHOG_HOST / POSTHOG_ASSET_HOST env vars at build time.
const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.i.posthog.com";
const POSTHOG_ASSET_HOST = process.env.POSTHOG_ASSET_HOST || "https://us-assets.i.posthog.com";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Reverse-proxy PostHog through our own domain so ad-blockers don't drop
  // analytics/session-replay traffic. The client points at "/ingest".
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${POSTHOG_ASSET_HOST}/static/:path*` },
      { source: "/ingest/array/:path*", destination: `${POSTHOG_ASSET_HOST}/array/:path*` },
      { source: "/ingest/:path*", destination: `${POSTHOG_HOST}/:path*` },
    ];
  },
  // Required so PostHog's trailing-slash API calls aren't redirected.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
