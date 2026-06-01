"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Small animated rectangular banner placed at the decision point (just above
 * the WhatsApp CTA). Rotates short social-proof / urgency / trust lines with a
 * shimmer sweep and a live pulse dot to draw the eye toward messaging. Messages
 * are passed from the server so the numbers are deterministic (no hydration
 * mismatch) and not obviously fake.
 */
export function LiveActivityBanner({ messages }: { messages: string[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || messages.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [reduceMotion, messages.length]);

  if (!messages.length) return null;

  return (
    <div className="relative mt-4 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
      {!reduceMotion ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/55 to-transparent animate-[shimmer_3s_linear_infinite]" />
      ) : null}

      <div className="relative flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 flex-none" aria-hidden>
          {!reduceMotion ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          ) : null}
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>

        <div className="relative h-5 min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <m.p
              key={index}
              initial={reduceMotion ? false : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: -14, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="absolute inset-0 truncate text-xs font-bold leading-5 text-emerald-800 sm:text-sm"
            >
              {messages[index]}
            </m.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
