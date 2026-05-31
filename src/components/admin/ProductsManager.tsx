"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice, getCategories, type Product } from "@/lib/products";
import { Badge, PageHeader, buttonClass } from "@/components/admin/ui";

function ProductThumb({ product }: { product: Product }) {
  const video = product.videos?.[0];
  if (video) {
    return (
      <video
        src={video.url}
        poster={video.poster || product.image}
        muted
        playsInline
        preload="metadata"
        className="h-16 w-16 flex-none rounded-2xl bg-black object-cover"
      />
    );
  }
  return (
    <Image
      src={product.image}
      alt={product.name}
      width={64}
      height={64}
      className="h-16 w-16 flex-none rounded-2xl border border-ink/10 bg-white object-contain p-1"
    />
  );
}

function stockTone(stock?: string): "neutral" | "amber" | "rose" {
  if (stock === "Out of stock") return "rose";
  if (stock === "Low stock") return "amber";
  return "neutral";
}

export function ProductsManager({
  products,
  hiddenCategories,
}: {
  products: Product[];
  hiddenCategories: string[];
}) {
  const [items, setItems] = useState<Product[]>(products);
  const [hidden, setHidden] = useState<string[]>(hiddenCategories);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [status, setStatus] = useState("");

  const categories = useMemo(() => getCategories(items), [items]);
  const visible = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const haystack = `${item.name} ${item.category} ${item.description} ${(item.tags || []).join(" ")}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  });

  async function refreshProducts() {
    try {
      setStatus("Refreshing from MongoDB…");
      const response = await fetch("/api/products?all=1", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to refresh products.");
      setItems(await response.json());
      setStatus("Synced from MongoDB.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to refresh products.");
    }
  }

  async function toggleCategory(category: string) {
    const next = hidden.includes(category) ? hidden.filter((item) => item !== category) : [...hidden, category].sort();
    setHidden(next);
    setStatus(`${category} is ${next.includes(category) ? "hidden from" : "visible on"} the storefront. Saving...`);

    try {
      const response = await fetch("/api/categories/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hiddenCategories: next }),
      });
      if (!response.ok) throw new Error("Unable to update category visibility.");
      const body = await response.json();
      setHidden(body.hiddenCategories || next);
      setStatus(`${category} visibility saved.`);
    } catch (error) {
      setHidden(hidden);
      setStatus(error instanceof Error ? error.message : "Unable to update category visibility.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Browse and search your catalog. Open a product to edit its details, status, and media."
        actions={
          <>
            <button type="button" onClick={refreshProducts} className={buttonClass("secondary")}>
              Refresh
            </button>
            <Link href="/admin/products/new" className={buttonClass("primary")}>
              + Add product
            </Link>
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products…"
          className="h-11 rounded-full border border-ink/10 bg-white px-5 text-sm font-medium text-ink outline-none focus:border-accent lg:w-80"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`h-9 rounded-full px-3.5 text-sm font-semibold transition ${
                selectedCategory === category ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-ink hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-5 rounded-3xl border border-ink/8 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Category visibility</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">Hide a whole category from the website</h2>
          </div>
          <p className="text-xs font-semibold text-muted">{hidden.length} hidden</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.filter((category) => category !== "All").map((category) => {
            const isHidden = hidden.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  isHidden ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : "bg-surface text-ink/75 hover:bg-ink hover:text-white"
                }`}
              >
                {isHidden ? "Hidden: " : "Live: "}
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {status ? (
        <p className="mt-4 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm">
          {status}
        </p>
      ) : null}

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {visible.length} of {items.length} products
      </p>

      <div className="mt-3 grid gap-3">
        {visible.map((product) => (
          <div
            key={product.id}
            className={`flex flex-wrap items-center gap-4 rounded-2xl border border-ink/8 bg-white p-3 shadow-sm transition sm:p-4 ${
              product.active === false ? "opacity-70" : ""
            }`}
          >
            <ProductThumb product={product} />

            <div className="min-w-0 flex-1 basis-48">
              <Link href={`/admin/products/${product.slug}/edit`} className="block truncate text-sm font-bold text-ink hover:underline">
                {product.name}
              </Link>
              <p className="mt-0.5 truncate text-xs font-medium text-muted">
                {product.category} · {product.media?.length || 0} media
                {product.videos?.length ? ` · ${product.videos.length} video` : ""}
                {product.badge ? ` · ${product.badge}` : ""}
              </p>
            </div>

            <div className="text-sm font-bold text-ink">{formatPrice(product.price)}</div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={product.active === false ? "neutral" : "emerald"}>
                {product.active === false ? "Hidden" : "Live"}
              </Badge>
              {hidden.includes(product.category) ? <Badge tone="rose">Category hidden</Badge> : null}
              <Badge tone={stockTone(product.stock)}>{product.stock || "In stock"}</Badge>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/products/${product.slug}/edit`}
                className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-ink/85"
              >
                Edit
              </Link>
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold text-ink transition hover:bg-ink hover:text-white"
              >
                View
              </Link>
            </div>
          </div>
        ))}
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-surface px-4 py-12 text-center text-sm font-medium text-muted">
            No products match your filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}
