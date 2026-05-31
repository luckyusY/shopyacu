"use client";

import { whatsappLink } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/track-client";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

type Props = {
  name: string;
  slug: string;
  category: string;
  priceLabel: string;
};

/**
 * Always-visible mobile conversion bar. Keeps the single goal action — a
 * WhatsApp inquiry — within thumb reach no matter how far the shopper scrolls.
 * Hidden on desktop (the hero CTA stays in view there).
 */
export function ProductStickyBar({ name, slug, category, priceLabel }: Props) {
  const href = whatsappLink(
    `Hello Shopyacu, I want to order ${name} (${priceLabel}). Is it available and what is the delivery time?`,
  );

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pt-2.5">
        <div className="min-w-0 shrink-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-emerald-600">Pay on delivery</p>
          <p className="font-display text-lg font-bold leading-none text-ink">{priceLabel}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent("inquiry", { slug, name, category, source: "sticky_bar" })}
          className="ml-auto flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-black text-white shadow-lg transition active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Order on WhatsApp
        </a>
      </div>
    </div>
  );
}
