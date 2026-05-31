"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";

// Initializes PostHog product analytics on the client. Captures pageviews
// (including SPA navigations), page-leave events (for accurate time-on-page),
// autocaptured clicks, and session replay. Replay must also be toggled on in
// the PostHog project settings ("Record user sessions").
//
// Requires NEXT_PUBLIC_POSTHOG_KEY. Without it, analytics are silently skipped
// so local/dev builds keep working.
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
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
