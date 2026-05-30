"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { formatPrice, type Product } from "@/lib/products";

// Deterministic per-product display signals (rating / reviews / discount /
// sold count) so each card looks populated. Presentation-only placeholders
// to be swapped for real review data once that exists.
export function productSignals(id: number) {
  const seed = (n: number) => {
    const x = Math.sin(n * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  const rating = Math.round((3.6 + seed(id) * 1.4) * 10) / 10;
  const reviews = Math.round(8 + seed(id + 17) * 472);
  const discount = Math.round(10 + seed(id + 31) * 28);
  const sold = Math.round(20 + seed(id + 53) * 480);
  return { rating, reviews, discount, sold };
}

export function StarRow({ rating, reviews }: { rating: number; reviews: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div
      className="mt-1.5 flex items-center gap-1.5 text-[11px]"
      aria-label={`Rated ${rating} of 5 from ${reviews} reviews`}
    >
      <div className="flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < full;
          const half = i === full && hasHalf;
          return (
            <span
              key={i}
              className={filled ? "text-accent" : half ? "text-accent/55" : "text-ink/15"}
            >
              &#9733;
            </span>
          );
        })}
      </div>
      <span className="font-semibold text-ink/55">({reviews})</span>
    </div>
  );
}

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
  index?: number;
  hideOnMobile?: boolean;
  /**
   * When true, the card fills its grid cell (no fixed width on large
   * screens). Use this in plain grid layouts. The default is sized for the
   * homepage scroll rows.
   */
  fluid?: boolean;
};

export function ProductCard({
  product,
  onAddToCart,
  index = 0,
  hideOnMobile = false,
  fluid = false,
}: ProductCardProps) {
  const reduceMotion = useReducedMotion();
  const { rating, reviews, discount, sold } = productSignals(product.id);
  const original = Math.round(product.price * (1 + discount / 100));
  const [wished, setWished] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    onAddToCart?.(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <m.article
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.14), ease: "easeOut" }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={`group relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-ink/10 bg-white transition-shadow duration-200 hover:border-accent/60 hover:shadow-lg ${
        fluid ? "" : "lg:w-48 lg:snap-start"
      } ${hideOnMobile ? "hidden lg:flex" : ""}`}
    >
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-surface">
        <m.div
          whileHover={reduceMotion ? undefined : { scale: 1.08 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="aspect-square w-full"
        >
          <Image
            src={product.image}
            alt={product.name}
            width={480}
            height={480}
            sizes="(min-width:1024px) 240px, 50vw"
            className="h-full w-full object-cover"
          />
        </m.div>

        <m.span
          initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="absolute left-2 top-2 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm"
        >
          -{discount}%
        </m.span>

        {product.badge ? (
          <span className="absolute left-2 top-9 rounded-md bg-ink/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-accent">
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setWished((w) => !w);
          }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-base shadow-sm transition hover:scale-110 active:scale-95"
        >
          <m.span
            key={String(wished)}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
            className={`leading-none ${wished ? "text-accent" : "text-ink/35"}`}
            aria-hidden
          >
            {wished ? "♥" : "♡"}
          </m.span>
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/products/${product.slug}`}
          className="block min-h-9 text-xs font-semibold leading-4 text-ink transition hover:text-accent sm:text-sm sm:leading-5"
        >
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display text-base font-bold text-ink">{formatPrice(product.price)}</span>
          <span className="text-[11px] font-semibold text-ink/40 line-through">{formatPrice(original)}</span>
        </div>

        <StarRow rating={rating} reviews={reviews} />

        {sold > 250 ? (
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-accent">Bestseller &middot; {sold}+ sold</p>
        ) : sold < 80 ? (
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-ink/50">Only a few left</p>
        ) : null}

        {onAddToCart ? (
          <m.button
            type="button"
            onClick={handleAdd}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className={`mt-2.5 flex h-9 w-full items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white transition ${
              justAdded ? "bg-emerald-600" : "bg-ink hover:bg-ink/85"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <m.span
                  key="ok"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  Added &#10003;
                </m.span>
              ) : (
                <m.span
                  key="add"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  Add to cart
                </m.span>
              )}
            </AnimatePresence>
          </m.button>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="mt-2.5 flex h-9 w-full items-center justify-center rounded-full bg-ink text-xs font-bold text-white transition hover:bg-ink/85"
          >
            View product
          </Link>
        )}
      </div>
    </m.article>
  );
}
