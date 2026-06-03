"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { formatPrice, getCategories, type Product } from "@/lib/products";
import { Badge, PageHeader, buttonClass } from "@/components/admin/ui";

type QuickEditState = {
  name: string;
  category: string;
  customCategory: string;
  price: string;
  badge: string;
  stock: string;
  active: boolean;
  featured: boolean;
};

const quickFieldClass =
  "h-10 rounded-xl border border-ink/10 bg-surface px-3 text-sm font-semibold text-ink outline-none transition focus:border-accent focus:bg-white";
const quickLabelClass = "text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted";

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

function quickEditState(product: Product): QuickEditState {
  return {
    name: product.name,
    category: product.category,
    customCategory: "",
    price: product.price ? String(product.price) : "",
    badge: product.badge || "",
    stock: product.stock || "In stock",
    active: product.active !== false,
    featured: Boolean(product.featured),
  };
}

function QuickEditPanel({
  product,
  categories,
  busy,
  onCancel,
  onSave,
}: {
  product: Product;
  categories: string[];
  busy: boolean;
  onCancel: () => void;
  onSave: (product: Product, values: QuickEditState) => Promise<void>;
}) {
  const [form, setForm] = useState<QuickEditState>(() => quickEditState(product));

  function set<K extends keyof QuickEditState>(key: K, value: QuickEditState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const categoryOptions = categories.filter((category) => category !== "All");
  const selectedCategory = form.category === "__custom" ? form.customCategory.trim() : form.category.trim();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(product, { ...form, category: selectedCategory || product.category });
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-3">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.55fr_0.75fr_0.75fr]">
        <label className="grid gap-1">
          <span className={quickLabelClass}>Name</span>
          <input value={form.name} onChange={(event) => set("name", event.target.value)} className={quickFieldClass} required />
        </label>
        <label className="grid gap-1">
          <span className={quickLabelClass}>Category</span>
          <select value={form.category} onChange={(event) => set("category", event.target.value)} className={quickFieldClass}>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="__custom">+ New category</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className={quickLabelClass}>Price</span>
          <input value={form.price} onChange={(event) => set("price", event.target.value)} type="number" min="0" className={quickFieldClass} />
        </label>
        <label className="grid gap-1">
          <span className={quickLabelClass}>Stock</span>
          <select value={form.stock} onChange={(event) => set("stock", event.target.value)} className={quickFieldClass}>
            <option>In stock</option>
            <option>Low stock</option>
            <option>Out of stock</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className={quickLabelClass}>Badge</span>
          <input value={form.badge} onChange={(event) => set("badge", event.target.value)} placeholder="New, Sale..." className={quickFieldClass} />
        </label>
      </div>

      {form.category === "__custom" ? (
        <label className="grid gap-1">
          <span className={quickLabelClass}>New category name</span>
          <input
            value={form.customCategory}
            onChange={(event) => set("customCategory", event.target.value)}
            placeholder="e.g. Baby Products"
            className={quickFieldClass}
            required
          />
        </label>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={!form.active} onChange={(event) => set("active", !event.target.checked)} className="h-4 w-4 accent-ink" />
            Hide product
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={form.featured} onChange={(event) => set("featured", event.target.checked)} className="h-4 w-4 accent-ink" />
            Featured
          </label>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className={buttonClass("secondary")}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={buttonClass("primary")}>
            {busy ? "Saving..." : "Save quick edit"}
          </button>
        </div>
      </div>
    </form>
  );
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
  const [selectedStock, setSelectedStock] = useState("All");
  const [selectedVisibility, setSelectedVisibility] = useState("All");
  const [editingSlug, setEditingSlug] = useState("");
  const [savingSlug, setSavingSlug] = useState("");
  const [status, setStatus] = useState("");

  const categories = useMemo(() => getCategories(items), [items]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.category, (counts.get(item.category) || 0) + 1);
    return counts;
  }, [items]);

  const visible = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesStock = selectedStock === "All" || (item.stock || "In stock") === selectedStock;
    const matchesVisibility =
      selectedVisibility === "All" ||
      (selectedVisibility === "Live" && item.active !== false && !hidden.includes(item.category)) ||
      (selectedVisibility === "Hidden products" && item.active === false) ||
      (selectedVisibility === "Hidden categories" && hidden.includes(item.category));
    const haystack = `${item.name} ${item.category} ${item.description} ${(item.tags || []).join(" ")}`.toLowerCase();

    return matchesCategory && matchesStock && matchesVisibility && haystack.includes(query.toLowerCase());
  });

  async function refreshProducts() {
    try {
      setStatus("Refreshing from MongoDB...");
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

  async function saveQuickEdit(product: Product, values: QuickEditState) {
    if (!values.name.trim()) {
      setStatus("Product name is required.");
      return;
    }

    setSavingSlug(product.slug);
    setStatus(`Saving ${values.name.trim()}...`);

    try {
      const payload = {
        name: values.name.trim(),
        category: values.category.trim() || product.category,
        price: Number(values.price) || 0,
        badge: values.badge.trim() || undefined,
        stock: values.stock,
        active: values.active,
        featured: values.featured || Boolean(values.badge.trim()),
      };
      const response = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to save quick edit.");
      }

      const updated = (await response.json()) as Product;
      setItems((current) => current.map((item) => (item.slug === product.slug ? updated : item)));
      if (selectedCategory !== "All" && updated.category !== selectedCategory) {
        setSelectedCategory(updated.category);
      }
      setEditingSlug("");
      setStatus(`${updated.name} saved in ${updated.category}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save quick edit.");
    } finally {
      setSavingSlug("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Numbered catalog list with quick filters and inline editing for the details you change most often."
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

      <section className="mt-6 rounded-3xl border border-ink/8 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr]">
          <label className="grid gap-1">
            <span className={quickLabelClass}>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, category, description, tag..."
              className="h-11 rounded-xl border border-ink/10 bg-surface px-4 text-sm font-semibold text-ink outline-none focus:border-accent focus:bg-white"
            />
          </label>
          <label className="grid gap-1">
            <span className={quickLabelClass}>Category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-11 rounded-xl border border-ink/10 bg-surface px-4 text-sm font-semibold text-ink outline-none focus:border-accent focus:bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All categories" : `${category} (${categoryCounts.get(category) || 0})`}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className={quickLabelClass}>Stock</span>
            <select
              value={selectedStock}
              onChange={(event) => setSelectedStock(event.target.value)}
              className="h-11 rounded-xl border border-ink/10 bg-surface px-4 text-sm font-semibold text-ink outline-none focus:border-accent focus:bg-white"
            >
              <option>All</option>
              <option>In stock</option>
              <option>Low stock</option>
              <option>Out of stock</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className={quickLabelClass}>Visibility</span>
            <select
              value={selectedVisibility}
              onChange={(event) => setSelectedVisibility(event.target.value)}
              className="h-11 rounded-xl border border-ink/10 bg-surface px-4 text-sm font-semibold text-ink outline-none focus:border-accent focus:bg-white"
            >
              <option>All</option>
              <option>Live</option>
              <option>Hidden products</option>
              <option>Hidden categories</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Showing {visible.length} of {items.length}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCategory("All");
              setSelectedStock("All");
              setSelectedVisibility("All");
            }}
            className="rounded-full bg-surface px-4 py-2 text-xs font-bold text-ink transition hover:bg-ink hover:text-white"
          >
            Reset filters
          </button>
        </div>
      </section>

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

      <div className="mt-3 grid gap-3">
        {visible.map((product, index) => (
          <div
            key={product.id}
            className={`rounded-2xl border border-ink/8 bg-white p-3 shadow-sm transition sm:p-4 ${
              product.active === false ? "opacity-70" : ""
            }`}
          >
            <div className="grid gap-3 lg:grid-cols-[48px_72px_minmax(0,1fr)_120px_220px_210px] lg:items-center">
              <div className="flex items-center gap-3 lg:block">
                <span className="grid h-9 w-11 place-items-center rounded-xl bg-ink font-mono text-sm font-black text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted lg:hidden">ID {product.id}</span>
              </div>

              <ProductThumb product={product} />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/products/${product.slug}/edit`} className="block truncate text-sm font-bold text-ink hover:underline sm:text-base">
                    {product.name}
                  </Link>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[0.65rem] font-black text-ink/55">ID {product.id}</span>
                </div>
                <p className="mt-0.5 truncate text-xs font-medium text-muted">
                  {product.category} - {product.media?.length || 0} media
                  {product.videos?.length ? ` - ${product.videos.length} video` : ""}
                  {product.badge ? ` - ${product.badge}` : ""}
                </p>
              </div>

              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted lg:hidden">Price</p>
                <p className="text-sm font-bold text-ink">{formatPrice(product.price)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={product.active === false ? "neutral" : "emerald"}>
                  {product.active === false ? "Hidden" : "Live"}
                </Badge>
                {hidden.includes(product.category) ? <Badge tone="rose">Category hidden</Badge> : null}
                <Badge tone={stockTone(product.stock)}>{product.stock || "In stock"}</Badge>
                {product.featured ? <Badge tone="accent">Featured</Badge> : null}
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingSlug(editingSlug === product.slug ? "" : product.slug)}
                  className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink transition hover:bg-accent/85"
                >
                  {editingSlug === product.slug ? "Close quick edit" : "Quick edit"}
                </button>
                <Link
                  href={`/admin/products/${product.slug}/edit`}
                  className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-ink/85"
                >
                  Full edit
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

            {editingSlug === product.slug ? (
              <QuickEditPanel
                product={product}
                categories={categories}
                busy={savingSlug === product.slug}
                onCancel={() => setEditingSlug("")}
                onSave={saveQuickEdit}
              />
            ) : null}
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
