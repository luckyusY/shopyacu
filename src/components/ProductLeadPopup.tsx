"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { whatsappDisplay, whatsappLink } from "@/lib/whatsapp";

type ProductLeadPopupProps = {
  productName: string;
  priceLabel: string;
  slug: string;
};

function detectInstagram(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const source = `${params.get("utm_source") ?? ""} ${params.get("ref") ?? ""} ${params.get("fbclid") ?? ""}`.toLowerCase();
  if (source.includes("ig") || source.includes("insta")) return true;
  const ref = document.referrer.toLowerCase();
  if (ref.includes("instagram") || ref.includes("ig.me")) return true;
  return navigator.userAgent.includes("Instagram");
}

export function ProductLeadPopup({ productName, priceLabel, slug }: ProductLeadPopupProps) {
  const [open, setOpen] = useState(false);
  const [fromInstagram, setFromInstagram] = useState(false);
  const reduceMotion = useReducedMotion();
  const storageKey = `shopyacu-lead-${slug}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(storageKey) === "seen") return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setFromInstagram(detectInstagram());
      setOpen(true);
      cleanup();
    };

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      if (scrolled / document.documentElement.scrollHeight > 0.5) reveal();
    };
    const onExit = (event: MouseEvent) => {
      if (event.clientY <= 0) reveal();
    };

    const timer = window.setTimeout(reveal, 8000);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onExit);

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onExit);
    }
    return cleanup;
  }, [storageKey]);

  function dismiss() {
    setOpen(false);
    if (typeof window !== "undefined") window.sessionStorage.setItem(storageKey, "seen");
  }

  const headline = fromInstagram ? "Welcome from Instagram!" : "Get the best price today";
  const incentive = fromInstagram
    ? "Send us a quick message to unlock your Instagram welcome offer and check delivery to your area."
    : "Message us on WhatsApp for today's best price, bundle deals, and a quick delivery check.";

  const message = fromInstagram
    ? `Hello Shopyacu! I came from Instagram and I'm interested in ${productName} (${priceLabel}). Can I get my welcome offer and the best price?`
    : `Hello Shopyacu! I'm interested in ${productName} (${priceLabel}). What's your best price and delivery time?`;

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          key="lead-overlay"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={dismiss}
          role="dialog"
          aria-modal="true"
          aria-label="Chat with Shopyacu on WhatsApp"
        >
          <m.div
            initial={reduceMotion ? false : { y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white text-ink shadow-2xl sm:rounded-3xl"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-xl leading-none text-ink/60 transition hover:bg-ink/10 hover:text-ink"
            >
              &times;
            </button>

            <div className="bg-ink px-5 pb-5 pt-6 text-white sm:px-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#25D366]">
                <span className="h-2 w-2 rounded-full bg-[#25D366]" /> WhatsApp
              </span>
              <p className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">{headline}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white/75">{incentive}</p>
            </div>

            <div className="grid gap-3 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-3 text-sm font-semibold text-ink/75">
                <span className="rounded-lg bg-accent px-2 py-1 text-xs font-black text-ink">DEAL</span>
                <span className="line-clamp-2">{productName} &middot; ask about {priceLabel}</span>
              </div>

              <a
                href={whatsappLink(message)}
                target="_blank"
                rel="noreferrer"
                onClick={dismiss}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 text-base font-black text-white shadow-lg transition hover:bg-[#1fb458] active:scale-[0.98]"
              >
                Send message on WhatsApp
              </a>
              <button
                type="button"
                onClick={dismiss}
                className="min-h-11 rounded-2xl text-sm font-semibold text-muted transition hover:text-ink"
              >
                Maybe later
              </button>
              <p className="text-center text-xs font-medium text-muted">
                A real person replies on {whatsappDisplay}. No app sign-up needed.
              </p>
            </div>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
