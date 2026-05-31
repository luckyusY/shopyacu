"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { whatsappDisplay, whatsappInternational, whatsappLink } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/track-client";

const DEFAULT_MESSAGE = "Hello Shopyacu, I need help choosing or ordering a product.";

const TOPICS = [
  { label: "Availability", message: "Hello Shopyacu, is this product in stock right now?" },
  { label: "Delivery & price", message: "Hello Shopyacu, what is the delivery time and price to my area?" },
  { label: "Bundles & offers", message: "Hello Shopyacu, do you have any bundle deals or current offers?" },
  { label: "Track my order", message: "Hello Shopyacu, I'd like an update on my order, please." },
];

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // One-time greeting nudge to invite interaction, dismissed once the
  // widget is opened or the user closes it.
  useEffect(() => {
    if (open) return;
    if (typeof window !== "undefined" && window.sessionStorage.getItem("shopyacu-support-nudge") === "seen") {
      return;
    }
    const timer = window.setTimeout(() => setShowNudge(true), 3500);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Close on Escape and on outside click while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  function toggleOpen() {
    setOpen((value) => {
      const next = !value;
      if (next) dismissNudge();
      return next;
    });
  }

  function dismissNudge() {
    setShowNudge(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("shopyacu-support-nudge", "seen");
    }
  }

  function pickTopic(topic: (typeof TOPICS)[number]) {
    setActiveTopic(topic.label);
    setMessage(topic.message);
    textareaRef.current?.focus();
  }

  const trimmed = message.trim();
  const canSend = trimmed.length > 0;

  // The support widget is for shoppers; keep it out of the admin area. On
  // product pages the always-visible sticky WhatsApp bar is the primary CTA,
  // so hide this floating widget there to avoid overlap and decision noise.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/products/")) return null;

  return (
    <div ref={panelRef} className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      <AnimatePresence>
        {open ? (
          <m.div
            key="panel"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-label="Shopyacu support"
            className="w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-ink/10 bg-white text-ink shadow-2xl"
          >
            <div className="relative bg-ink p-4 text-white">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close support"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg leading-none text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                &times;
              </button>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Shopyacu support</p>
              <p className="mt-2 font-display text-2xl font-bold leading-tight">Need help before you buy?</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white/70">
                <span className="relative flex h-2.5 w-2.5">
                  {!reduceMotion ? (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
                  ) : null}
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#25D366]" />
                </span>
                Online now &middot; replies in minutes
              </p>
            </div>

            <div className="grid gap-3 p-3">
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted">Quick questions</p>
                <div className="flex flex-wrap gap-1.5">
                  {TOPICS.map((topic) => {
                    const isActive = activeTopic === topic.label;
                    return (
                      <button
                        key={topic.label}
                        type="button"
                        onClick={() => pickTopic(topic)}
                        aria-pressed={isActive}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                          isActive
                            ? "border-accent bg-accent/10 text-ink"
                            : "border-ink/10 bg-surface text-ink/70 hover:border-ink/30 hover:text-ink"
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="grid gap-1.5">
                <span className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">Your message</span>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setActiveTopic(null);
                  }}
                  rows={3}
                  maxLength={600}
                  placeholder="Type your question…"
                  className="w-full resize-none rounded-2xl border border-ink/10 bg-surface px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:text-muted focus:border-accent focus:bg-white"
                />
              </label>

              <a
                href={canSend ? whatsappLink(trimmed) : whatsappLink(DEFAULT_MESSAGE)}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!canSend}
                onClick={(event) => {
                  if (!canSend) {
                    event.preventDefault();
                    return;
                  }
                  trackEvent("inquiry", { source: "support_widget" });
                }}
                className={`flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-white transition ${
                  canSend ? "bg-[#25D366] hover:bg-[#1fb458]" : "cursor-not-allowed bg-[#25D366]/50"
                }`}
              >
                <span>Send on WhatsApp</span>
                <span className="rounded-full bg-white/20 px-2 py-1 text-xs">WA</span>
              </a>
              <a
                href={`tel:+${whatsappInternational}`}
                className="flex min-h-12 items-center justify-between rounded-2xl border border-ink/10 bg-surface px-4 py-3 text-sm font-black text-ink transition hover:bg-ink hover:text-white"
              >
                <span>Call {whatsappDisplay}</span>
                <span className="rounded-full bg-ink/10 px-2 py-1 text-xs">CALL</span>
              </a>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!open && showNudge ? (
          <m.div
            key="nudge"
            initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative max-w-[15rem] rounded-2xl rounded-br-sm border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-2xl"
          >
            <button
              type="button"
              onClick={dismissNudge}
              aria-label="Dismiss message"
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs leading-none text-white shadow-md transition hover:bg-ink/85"
            >
              &times;
            </button>
            Hi there! Questions about a product? Tap to chat with us.
          </m.div>
        ) : null}
      </AnimatePresence>

      <m.button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-label={open ? "Close support options" : "Open support options"}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        animate={reduceMotion || open ? undefined : { y: [0, -3, 0] }}
        transition={reduceMotion ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className="group relative flex min-h-14 items-center gap-3 rounded-full bg-ink px-4 py-3 text-left text-white shadow-2xl ring-4 ring-white/90 transition hover:bg-ink/85 sm:min-h-16 sm:px-5"
      >
        <span className="absolute -left-1 -top-1 flex h-4 w-4">
          {!reduceMotion && !open ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
          ) : null}
          <span className="relative inline-flex h-4 w-4 rounded-full bg-[#25D366] ring-4 ring-white" />
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-xs font-black text-white sm:h-10 sm:w-10">
          WA
        </span>
        <span className="grid">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{open ? "Support open" : "Buy now"}</span>
          <span className="text-sm font-bold leading-tight sm:text-base">Call or WhatsApp</span>
        </span>
      </m.button>
    </div>
  );
}
