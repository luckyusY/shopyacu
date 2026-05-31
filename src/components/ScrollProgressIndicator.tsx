"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function getScrollProgress() {
  if (typeof window === "undefined") return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export function ScrollProgressIndicator() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const hidden = pathname?.startsWith("/admin");

  useEffect(() => {
    if (hidden || typeof window === "undefined") return;

    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setProgress(getScrollProgress()));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [hidden]);

  if (hidden) return null;

  const percent = Math.round(progress * 100);
  const circumference = 2 * Math.PI * 17;
  const dashOffset = circumference * (1 - progress);
  const atBottom = progress > 0.92;

  function handleClick() {
    window.scrollTo({ top: atBottom ? 0 : window.innerHeight * 0.82, behavior: "smooth" });
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 bg-transparent">
        <div
          className="h-full rounded-r-full bg-accent shadow-[0_0_18px_rgba(246,139,30,0.45)] transition-[width] duration-150 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <button
        type="button"
        onClick={handleClick}
        aria-label={atBottom ? "Scroll to top" : "Scroll down"}
        className="fixed bottom-4 left-3 z-[55] hidden items-center gap-2 rounded-full border border-ink/10 bg-white/92 py-1.5 pl-2 pr-3 text-ink shadow-xl shadow-ink/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white sm:flex lg:bottom-6 lg:left-6"
      >
        <span className="relative grid h-10 w-10 place-items-center">
          <svg className="absolute inset-0 h-10 w-10 -rotate-90" viewBox="0 0 40 40" aria-hidden>
            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(28,28,28,0.12)" strokeWidth="3" />
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="text-accent transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          <span className="text-base font-black leading-none">{atBottom ? "\u2191" : "\u2193"}</span>
        </span>
        <span className="text-left">
          <span className="block text-[0.62rem] font-black uppercase tracking-[0.16em] text-muted">
            {atBottom ? "Back" : "Scroll"}
          </span>
          <span className="block text-xs font-bold leading-none text-ink">{atBottom ? "Top" : `${percent}% viewed`}</span>
        </span>
      </button>
    </>
  );
}
