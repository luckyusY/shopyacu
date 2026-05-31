"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";
import { getCategories, type Product } from "@/lib/products";
import { uploadFilesToCloudinary } from "@/lib/cloudinary-client";

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
        className="h-14 w-14 rounded-xl bg-black object-cover"
      />
    );
  }
  return (
    <Image
      src={product.image}
      alt={product.name}
      width={56}
      height={56}
      className="h-14 w-14 rounded-xl border border-ink/10 bg-white object-contain p-1"
    />
  );
}

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

  function updateProduct(id: number, patch: Partial<DraftProduct>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function replaceProduct(product: Product) {
    setItems((current) => current.map((item) => (item.slug === product.slug ? product : item)));
  }

  async function refreshProducts() {
    try {
      setStatus("Refreshing products from MongoDB…");
      const response = await fetch("/api/products?all=1", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to refresh products.");
      setItems(await response.json());
      setStatus("Products synced from MongoDB.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to refresh products.");
    }
  }

  async function saveProduct(product: DraftProduct) {
    try {
      updateProduct(product.id, { saving: true });
      setStatus(`Saving ${product.name}…`);
      const response = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to update product.");
      }
      replaceProduct(await response.json());
      setStatus(`${product.name} synced to MongoDB.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update product.");
    } finally {
      updateProduct(product.id, { saving: false });
    }
  }

  async function appendMedia(product: DraftProduct, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    try {
      updateProduct(product.id, { saving: true });
      const uploaded = await uploadFilesToCloudinary(files, product.slug, setStatus);
      const media = [...(product.media || []), ...uploaded];
      const response = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          media,
          images: media.filter((item) => item.type === "image").map((item) => item.url),
          videos: media.filter((item) => item.type === "video"),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to save uploaded media.");
      }
      replaceProduct(await response.json());
      setStatus(`${files.length} media file${files.length === 1 ? "" : "s"} added to ${product.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to add media.");
    } finally {
      updateProduct(product.id, { saving: false });
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Catalog</p>
          <h1 className="font-display text-3xl font-bold">Products</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refreshProducts}
            className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            Refresh
          </button>
          <Link
            href="/admin/products/new"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-accent/85"
          >
            + Add product
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
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

      <div className="mt-3 overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm">
        <div className="min-w-[1040px]">
          <div className="grid grid-cols-[80px_1.35fr_0.7fr_0.55fr_0.6fr_1fr_140px] gap-4 border-b border-ink/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            <span>Media</span>
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span>Add image/video</span>
            <span>Action</span>
          </div>
          {visible.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[80px_1.35fr_0.7fr_0.55fr_0.6fr_1fr_140px] items-center gap-4 border-b border-ink/10 px-4 py-3 last:border-0"
            >
              <ProductThumb product={product} />
              <div>
                <input
                  value={product.name}
                  onChange={(event) => updateProduct(product.id, { name: event.target.value })}
                  className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink outline-none"
                />
                <input
                  value={product.badge || ""}
                  onChange={(event) => updateProduct(product.id, { badge: event.target.value, featured: Boolean(event.target.value) })}
                  placeholder="Badge"
                  className="mt-2 h-8 w-full rounded-lg border border-ink/10 px-2 text-xs font-medium outline-none focus:border-accent"
                />
                <input
                  value={(product.tags || []).join(", ")}
                  onChange={(event) =>
                    updateProduct(product.id, {
                      tags: event.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Rotating tags"
                  className="mt-2 h-8 w-full rounded-lg border border-ink/10 px-2 text-xs font-medium outline-none focus:border-accent"
                />
                <p className="mt-2 text-xs font-medium text-muted">
                  {product.media?.length || 0} media / {product.videos?.length || 0} videos
                </p>
              </div>
              <input
                value={product.category}
                onChange={(event) => updateProduct(product.id, { category: event.target.value })}
                className="h-10 rounded-xl border border-ink/10 px-3 text-sm font-semibold text-ink outline-none focus:border-accent"
              />
              <input
                type="number"
                value={product.price}
                onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) })}
                className="h-10 w-full rounded-xl border border-ink/10 px-3 text-sm font-semibold text-ink outline-none focus:border-accent"
              />
              <select
                value={product.stock}
                onChange={(event) => updateProduct(product.id, { stock: event.target.value })}
                className="h-10 rounded-xl border border-ink/10 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-accent"
              >
                <option>In stock</option>
                <option>Low stock</option>
                <option>Out of stock</option>
              </select>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(event) => appendMedia(product, event)}
                className="text-xs font-medium text-muted"
              />
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => saveProduct(product)}
                  disabled={product.saving}
                  className="rounded-full bg-ink px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-60"
                >
                  {product.saving ? "Saving…" : "Save"}
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  className="rounded-full border border-ink/15 px-4 py-2 text-center text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
          {visible.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm font-medium text-muted">No products match your filters.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
