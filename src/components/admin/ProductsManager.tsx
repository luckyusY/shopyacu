"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice, getCategories, type Product } from "@/lib/products";
import { PageHeader, buttonClass } from "@/components/admin/ui";

type DraftProduct = Product & { saving?: boolean };

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

const stockTone: Record<string, string> = {
  "In stock": "border-ink/10 text-ink",
  "Low stock": "border-amber-300 text-amber-700",
  "Out of stock": "border-rose-300 text-rose-700",
};

export function ProductsManager({ products }: { products: Product[] }) {
  const [items, setItems] = useState<DraftProduct[]>(products);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [status, setStatus] = useState("");

  const categories = useMemo(() => getCategories(items), [items]);
  const visible = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const haystack = `${item.name} ${item.category} ${item.description} ${(item.tags || []).join(" ")}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  });

  function patchLocal(id: number, patch: Partial<DraftProduct>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

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

  async function quickSave(product: DraftProduct, patch: Partial<Product>) {
    patchLocal(product.id, { ...patch, saving: true });
    try {
      const response = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to update product.");
      }
      const updated = (await response.json()) as Product;
      setItems((current) => current.map((item) => (item.slug === updated.slug ? updated : item)));
      setStatus(`${product.name} updated.`);
    } catch (error) {
      patchLocal(product.id, product); // revert
      setStatus(error instanceof Error ? error.message : "Unable to update product.");
    } finally {
      patchLocal(product.id, { saving: false });
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Search, filter, and manage your catalog. Open a product to edit details and media."
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

            <select
              value={product.stock || "In stock"}
              disabled={product.saving}
              onChange={(event) => quickSave(product, { stock: event.target.value })}
              className={`h-9 rounded-full border bg-white px-3 text-xs font-bold outline-none focus:border-accent ${
                stockTone[product.stock || "In stock"] || stockTone["In stock"]
              }`}
            >
              <option>In stock</option>
              <option>Low stock</option>
              <option>Out of stock</option>
            </select>

            <button
              type="button"
              disabled={product.saving}
              onClick={() => quickSave(product, { active: product.active === false })}
              className={`h-9 rounded-full px-3.5 text-xs font-bold transition disabled:opacity-50 ${
                product.active === false
                  ? "bg-ink/8 text-muted hover:bg-ink hover:text-white"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              }`}
            >
              {product.active === false ? "Hidden" : "Live"}
            </button>

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
