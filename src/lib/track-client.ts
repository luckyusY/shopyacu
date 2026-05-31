// Client-side analytics beacon. Uses sendBeacon when available so the request
// survives navigation (e.g. tapping a WhatsApp link that leaves the page),
// falling back to fetch with keepalive.

import type { InquirySource, StorefrontEventType } from "@/lib/events-store";

type TrackPayload = {
  slug?: string;
  name?: string;
  category?: string;
  source?: InquirySource;
};

export function trackEvent(type: StorefrontEventType, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    type,
    ...payload,
    path: window.location.pathname,
    ref: document.referrer || undefined,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/track", blob)) return;
    }
  } catch {
    // Fall through to fetch.
  }

  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Best-effort only.
  }
}
