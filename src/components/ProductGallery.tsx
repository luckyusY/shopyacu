"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductMedia } from "@/lib/products";

type ProductGalleryProps = {
  media: ProductMedia[];
  name: string;
  fallbackImage: string;
};

export function ProductGallery({ media, name, fallbackImage }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = media[active] ?? media[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
        {current.type === "video" ? (
          <video
            key={current.url}
            src={current.url}
            poster={current.poster || fallbackImage}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <Image
            src={current.url}
            alt={`${name}${active > 0 ? ` view ${active + 1}` : ""}`}
            fill
            sizes="(min-width:1024px) 45vw, 100vw"
            priority
            className="object-contain p-4"
          />
        )}
      </div>

      {media.length > 1 ? (
        <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-6">
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
                className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition ${
                  isActive ? "border-accent" : "border-ink/10 hover:border-ink/30"
                }`}
              >
                <Image
                  src={thumb}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                />
                {item.type === "video" ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/15 text-lg text-white">&#9658;</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
