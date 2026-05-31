"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";

// Initializes PostHog product analytics on the client. Captures pageviews
// (including SPA navigations), page-leave events (for accurate time-on-page),
// autocaptured clicks, and session replay. Replay must also be toggled on in
// the PostHog project settings ("Record user sessions").
//
// The phc_ project key is a *public* client-side token (it ships in the
// browser bundle by design), so committing it is safe. An env var override is
// still supported for staging/region changes.
const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_pkRrtTu2YFEn3TjSzhUcoU8NQrcDRA2JKkhPiwt8MheD";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return;

    posthog.init(POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || "https://us.posthog.com",
      // Auto-capture pageviews on initial load AND client-side route changes.
      capture_pageview: "history_change",
      capture_pageleave: true,
      autocapture: true,
      // Build person profiles for anonymous shoppers so paths/funnels work.
      person_profiles: "always",
      // Session replay: masks password fields by default; keep other inputs
      // visible for analysis. Add data-ph-mask to any element to hide it.
      session_recording: {
        maskTextSelector: "[data-ph-mask]",
      },
      debug: process.env.NODE_ENV === "development",
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
