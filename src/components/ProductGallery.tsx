"use client";

import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductMedia } from "@/lib/products";

type ProductGalleryProps = {
  media: ProductMedia[];
  name: string;
  fallbackImage: string;
};

const SWIPE_THRESHOLD = 45;

export function ProductGallery({ media, name, fallbackImage }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const touchStartX = useRef<number | null>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const count = media.length;
  const current = media[active] ?? media[0];

  const go = useCallback(
    (direction: 1 | -1) => {
      setActive((index) => (index + direction + count) % count);
    },
    [count],
  );

  function onTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null || count < 2) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  // Keep the active thumbnail visible within the scrollable strip.
  useEffect(() => {
    const strip = thumbStripRef.current;
    const node = strip?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
  }, [active, reduceMotion]);

  // Arrow keys + Escape while the zoom overlay is open.
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoomOpen, go]);

  const isVideo = current.type === "video";

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-[4/5] max-h-[72vh] touch-pan-y select-none overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm sm:aspect-square sm:max-h-none sm:rounded-3xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {isVideo ? (
          <video
            key={current.url}
            src={current.url}
            poster={current.poster || fallbackImage}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label={`Zoom ${name}`}
            className="block h-full w-full cursor-zoom-in"
          >
            <Image
              src={current.url}
              alt={`${name}${active > 0 ? ` view ${active + 1}` : ""}`}
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              priority
              className="object-contain p-2 sm:p-4"
            />
          </button>
        )}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur transition hover:bg-white active:scale-95 sm:h-11 sm:w-11 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <span className="text-xl leading-none">&#8249;</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur transition hover:bg-white active:scale-95 sm:h-11 sm:w-11 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <span className="text-xl leading-none">&#8250;</span>
            </button>
            <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-white sm:bottom-3">
              {active + 1} / {count}
            </span>
          </>
        ) : null}

        {!isVideo ? (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white sm:opacity-0 sm:transition sm:group-hover:opacity-100">
            Tap to zoom
          </span>
        ) : null}
      </div>

      {count > 1 ? (
        <div
          ref={thumbStripRef}
          className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.map((item, index) => {
            const thumb = item.type === "video" ? item.poster || fallbackImage : item.url;
            const isActive = index === active;
            return (
              <button
                key={`${item.url}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show ${name} view ${index + 1}`}
                aria-current={isActive}
                className={`relative aspect-square w-16 flex-none snap-start overflow-hidden rounded-xl border-2 bg-white transition active:scale-95 sm:w-20 ${
                  isActive ? "border-accent" : "border-ink/10 hover:border-ink/30"
                }`}
              >
                <Image src={thumb} alt="" fill sizes="80px" className="object-cover sm:object-contain sm:p-1.5" />
                {item.type === "video" ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/15 text-lg text-white">&#9658;</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <AnimatePresence>
        {zoomOpen ? (
          <m.div
            key="zoom"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} image viewer`}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 backdrop-blur-sm"
            onClick={() => setZoomOpen(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Close viewer"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25"
            >
              &times;
            </button>
            <div className="relative h-[82vh] w-[92vw]" onClick={(event) => event.stopPropagation()}>
              {isVideo ? (
                <video src={current.url} poster={current.poster || fallbackImage} controls playsInline autoPlay muted loop className="h-full w-full object-contain" />
              ) : (
                <Image src={current.url} alt={`${name} enlarged`} fill sizes="92vw" className="object-contain" />
              )}
            </div>
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(-1);
                  }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(1);
                  }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25"
                >
                  &#8250;
                </button>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold text-white">
                  {active + 1} / {count}
                </span>
              </>
            ) : null}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
