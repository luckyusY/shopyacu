"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { InquirySource } from "@/lib/events-store";
import { trackEvent } from "@/lib/track-client";

type WhatsAppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  track?: { slug?: string; name?: string; category?: string; source?: InquirySource };
};

/** Anchor that records an "inquiry" analytics event before following through. */
export function WhatsAppLink({ href, children, track, onClick, ...rest }: WhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        trackEvent("inquiry", { source: "product_cta", ...track });
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
