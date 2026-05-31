"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { whatsappDisplay, whatsappInternational, whatsappLink } from "@/lib/whatsapp";

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const supportMessage = "Hello Shopyacu, I need help choosing or ordering a product.";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      <AnimatePresence>
        {open ? (
          <m.div
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[min(330px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-ink/10 bg-white text-ink shadow-2xl"
          >
            <div className="bg-ink p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Shopyacu support</p>
              <p className="mt-2 font-display text-2xl font-bold leading-tight">Need help before you buy?</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white/70">
                Ask about availability, delivery, prices, bundles, or the right product for you.
              </p>
            </div>
            <div className="grid gap-2 p-3">
              <a
                href={whatsappLink(supportMessage)}
                className="flex min-h-12 items-center justify-between rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-black text-white transition hover:bg-[#1fb458]"
              >
                <span>Ask on WhatsApp</span>
                <span className="rounded-full bg-white/20 px-2 py-1 text-xs">WA</span>
              </a>
              <a
                href={`tel:+${whatsappInternational}`}
                className="flex min-h-12 items-center justify-between rounded-2xl border border-ink/10 bg-surface px-4 py-3 text-sm font-black text-ink transition hover:bg-ink hover:text-white"
              >
                <span>Call {whatsappDisplay}</span>
                <span className="rounded-full bg-ink/10 px-2 py-1 text-xs">CALL</span>
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-2 text-xs font-bold text-muted transition hover:bg-surface hover:text-ink"
              >
                Hide support
              </button>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>

      <m.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close support options" : "Open support options"}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
        transition={reduceMotion ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className="group relative flex min-h-14 items-center gap-3 rounded-full bg-ink px-4 py-3 text-left text-white shadow-2xl ring-4 ring-white/90 transition hover:bg-ink/85 sm:min-h-16 sm:px-5"
      >
        <span className="absolute -left-1 -top-1 h-4 w-4 rounded-full bg-[#25D366] ring-4 ring-white" />
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-xs font-black text-white sm:h-10 sm:w-10">
          WA
        </span>
        <span className="grid">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{open ? "Support open" : "Need help?"}</span>
          <span className="text-sm font-bold leading-tight sm:text-base">Call or WhatsApp</span>
        </span>
      </m.button>
    </div>
  );
}
