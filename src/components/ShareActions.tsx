"use client";

import { useMemo, useState } from "react";

type ShareActionsProps = {
  title: string;
  text?: string;
  path: string;
  compact?: boolean;
  className?: string;
};

type ShareButtonProps = {
  title: string;
  text?: string;
  path: string;
  label?: string;
  className?: string;
};

function getAbsoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ShareActions({ title, text, path, compact = false, className = "" }: ShareActionsProps) {
  const [status, setStatus] = useState("");
  const shareText = text || title;
  const url = useMemo(() => getAbsoluteUrl(path), [path]);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${shareText} ${url}`);

  async function shareNative() {
    const nativeShare = navigator.share;
    if (nativeShare) {
      try {
        await nativeShare.call(navigator, { title, text: shareText, url });
        setStatus("Shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied");
    } catch {
      setStatus("Copy the link from your browser");
    }
  }

  const linkClass =
    "inline-flex min-h-10 items-center justify-center rounded-full px-4 text-xs font-black transition active:scale-[0.98]";

  return (
    <div className={`rounded-2xl border border-ink/10 bg-white p-3 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-muted">Share</p>
          {!compact ? <p className="mt-1 text-sm font-bold leading-5 text-ink">Send this to a friend or customer.</p> : null}
        </div>
        <button
          type="button"
          onClick={shareNative}
          className="min-h-10 shrink-0 rounded-full bg-ink px-4 text-xs font-black text-white transition hover:bg-ink/85"
        >
          Share
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank"
          rel="noreferrer"
          className={`${linkClass} bg-[#25D366] text-white hover:bg-[#1fb458]`}
        >
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className={`${linkClass} bg-[#1877F2] text-white hover:bg-[#1264cf]`}
        >
          Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className={`${linkClass} bg-ink text-white hover:bg-ink/85`}
        >
          X
        </a>
      </div>

      {status ? <p className="mt-2 text-center text-xs font-bold text-muted">{status}</p> : null}
    </div>
  );
}

export function ShareButton({ title, text, path, label = "Share", className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareText = text || title;
  const url = useMemo(() => getAbsoluteUrl(path), [path]);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={share} className={className} aria-label={`Share ${title}`}>
      {copied ? "Copied" : label}
    </button>
  );
}
