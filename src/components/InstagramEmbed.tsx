"use client";

import { useEffect, useRef, useState } from "react";

const EMBED_SCRIPT = "https://www.instagram.com/embed.js";

function loadInstagramEmbedScript(onReady: () => void) {
  if (typeof window === "undefined") return;
  if (window.instgrm?.Embeds) {
    onReady();
    return;
  }
  const existing = document.querySelector<HTMLScriptElement>(`script[src*="instagram.com/embed.js"]`);
  if (existing) {
    existing.addEventListener("load", onReady, { once: true });
    // Already-loaded script won't refire load; nudge processing shortly.
    window.setTimeout(onReady, 800);
    return;
  }
  const script = document.createElement("script");
  script.async = true;
  script.src = EMBED_SCRIPT;
  script.addEventListener("load", onReady, { once: true });
  document.body.appendChild(script);
}

/**
 * Lazily renders an official Instagram embed for a post/reel permalink.
 * The heavy embed.js only loads once the block scrolls into view.
 */
export function InstagramEmbed({ url, className = "" }: { url: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Reveal when scrolled near the viewport.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      // Older browsers: reveal on the next tick (deferred so we don't call
      // setState synchronously inside the effect body).
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Once visible, load + (re)process the embed for this permalink.
  useEffect(() => {
    if (!visible) return;
    loadInstagramEmbedScript(() => window.instgrm?.Embeds?.process?.());
  }, [visible, url]);

  return (
    <div ref={containerRef} className={className}>
      {visible ? (
        <blockquote
          key={url}
          className="instagram-media relative z-10 mx-auto w-full"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ background: "#fff", border: 0, margin: 0, maxWidth: 540, width: "100%" }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            View this post on Instagram
          </a>
        </blockquote>
      ) : (
        <div className="grid min-h-[400px] place-items-center rounded-2xl border border-dashed border-ink/15 bg-surface text-sm font-semibold text-muted">
          Loading Instagram video…
        </div>
      )}
    </div>
  );
}
