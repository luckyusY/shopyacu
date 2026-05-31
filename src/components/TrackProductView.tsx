"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/track-client";

/** Records a "view" analytics beacon once per mount (client-side, non-blocking). */
export function TrackProductView({
  slug,
  name,
  category,
}: {
  slug: string;
  name: string;
  category: string;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent("view", { slug, name, category });
  }, [slug, name, category]);

  return null;
}
