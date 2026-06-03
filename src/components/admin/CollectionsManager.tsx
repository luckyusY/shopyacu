"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { slugify, type Product } from "@/lib/products";
import type { ProductCollection } from "@/lib/collections-store";
import { Badge, PageHeader, buttonClass } from "@/components/admin/ui";

const fieldClass =
  "h-11 rounded-xl border border-ink/10 bg-surface px-4 text-sm font-semibold text-ink outline-none transition focus:border-accent focus:bg-white";
const labelClass = "text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted";

function collectionUrl(slug: string) {
  if (typeof window === "undefined") return `/collections/${slug}`;
  return `${window.location.origin}/collections/${slug}`;
}

export function CollectionsManager({
  products,
  collections,
}: {
  products: Product[];
  collections: ProductCollection[];
}) {
  const [items, setItems] = useState<ProductCollection[]>(collections);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [editingSlug, setEditingSlug] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedProducts = products.filter((product) => selectedSet.has(product.slug));
  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  });

  function resetForm() {
    setTitle("");
    setSlug("");
    setDescription("");
    setSelected([]);
    setEditingSlug("");
  }

  function loadCollection(collection: ProductCollection) {
    setTitle(collection.title);
    setSlug(collection.slug);
    setDescription(collection.description || "");
    setSelected(collection.productSlugs);
    setEditingSlug(collection.slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleProduct(productSlug: string) {
    setSelected((current) =>
      current.includes(productSlug) ? current.filter((item) => item !== productSlug) : [...current, productSlug],
    );
  }

  async function copyLink(collectionSlug: string) {
    const url = collectionUrl(collectionSlug);
    try {
      await navigator.clipboard.writeText(url);
      setStatus(`Copied ${url}`);
    } catch {
      setStatus(url);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setStatus("Add a title for this share page.");
      return;
    }
    if (selected.length === 0) {
      setStatus("Select at least one product.");
      return;
    }

    setBusy(true);
    const nextSlug = slugify(slug || title);
    const payload = {
      title: title.trim(),
      slug: nextSlug,
      description: description.trim() || undefined,
      productSlugs: selected,
      active: true,
    };

    try {
      const response = await fetch(editingSlug ? `/api/collections/${editingSlug}` : "/api/collections", {
        method: editingSlug ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to save collection.");
      }
      const saved = (await response.json()) as ProductCollection;
      setItems((current) => {
        const withoutOld = current.filter((item) => item.slug !== editingSlug && item.slug !== saved.slug);
        return [saved, ...withoutOld];
      });
      setEditingSlug(saved.slug);
      setSlug(saved.slug);
      setStatus(`Saved. Share page: ${collectionUrl(saved.slug)}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save collection.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCollection(collection: ProductCollection) {
    if (!window.confirm(`Delete "${collection.title}"?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/collections/${collection.slug}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete collection.");
      setItems((current) => current.filter((item) => item.slug !== collection.slug));
      if (editingSlug === collection.slug) resetForm();
      setStatus(`${collection.title} deleted.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete collection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Share pages"
        title="Product collections"
        description="Select related products, generate a customer-facing webpage, then copy the link and share it on WhatsApp."
        actions={
          <button type="button" onClick={resetForm} className={buttonClass("secondary")}>
            New collection
          </button>
        }
      />

      <form onSubmit={submit} className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="grid content-start gap-4 rounded-3xl border border-ink/8 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={labelClass}>{editingSlug ? "Editing" : "Create"}</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink">Collection details</h2>
            </div>
            <Badge tone={selected.length ? "emerald" : "neutral"}>{selected.length} selected</Badge>
          </div>

          <label className="grid gap-1">
            <span className={labelClass}>Page title</span>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!editingSlug && !slug) setSlug(slugify(event.target.value));
              }}
              placeholder="e.g. Kitchen starter pack"
              className={fieldClass}
              required
            />
          </label>

          <label className="grid gap-1">
            <span className={labelClass}>URL slug</span>
            <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="kitchen-starter-pack" className={fieldClass} />
            <span className="text-xs font-semibold text-muted">Public link: /collections/{slug || "your-page"}</span>
          </label>

          <label className="grid gap-1">
            <span className={labelClass}>Message for customer</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell the customer why these products belong together..."
              className="min-h-28 rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-accent focus:bg-white"
            />
          </label>

          {selectedProducts.length ? (
            <div className="grid gap-2">
              <p className={labelClass}>Selected products</p>
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map((product) => (
                  <button
                    key={product.slug}
                    type="button"
                    onClick={() => toggleProduct(product.slug)}
                    className="rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-500"
                  >
                    {product.name} x
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button type="submit" disabled={busy} className="h-12 rounded-full bg-accent px-5 text-sm font-black text-ink transition hover:bg-accent/85 disabled:cursor-wait disabled:opacity-60">
            {busy ? "Saving..." : editingSlug ? "Update share page" : "Generate share page"}
          </button>

          {status ? <p className="rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm font-semibold text-ink">{status}</p> : null}
        </section>

        <section className="rounded-3xl border border-ink/8 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <label className="grid gap-1">
              <span className={labelClass}>Search products</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." className={fieldClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid max-h-[720px] gap-2 overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const isSelected = selectedSet.has(product.slug);
              return (
                <button
                  key={product.slug}
                  type="button"
                  onClick={() => toggleProduct(product.slug)}
                  className={`grid grid-cols-[54px_1fr_auto] items-center gap-3 rounded-2xl border p-2 text-left transition ${
                    isSelected ? "border-accent bg-accent/10" : "border-ink/8 bg-surface hover:border-accent/50"
                  }`}
                >
                  <Image src={product.image} alt="" width={54} height={54} className="h-14 w-14 rounded-xl bg-white object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-ink">{product.name}</span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-muted">{product.category}</span>
                  </span>
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-sm font-black ${isSelected ? "bg-accent text-ink" : "bg-white text-ink/35"}`}>
                    {isSelected ? "✓" : "+"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </form>

      <section className="mt-6 rounded-3xl border border-ink/8 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={labelClass}>Saved pages</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">Share-ready collections</h2>
          </div>
          <p className="text-sm font-bold text-muted">{items.length} pages</p>
        </div>

        <div className="mt-4 grid gap-3">
          {items.map((collection) => (
            <div key={collection.slug} className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/8 bg-surface p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold text-ink">{collection.title}</p>
                <p className="truncate text-sm font-semibold text-muted">
                  /collections/{collection.slug} - {collection.productSlugs.length} products
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => loadCollection(collection)} className={buttonClass("secondary")}>
                  Edit
                </button>
                <button type="button" onClick={() => copyLink(collection.slug)} className={buttonClass("primary")}>
                  Copy link
                </button>
                <Link href={`/collections/${collection.slug}`} target="_blank" className={buttonClass("secondary")}>
                  Open
                </Link>
                <button type="button" onClick={() => deleteCollection(collection)} className={buttonClass("danger")}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink/15 bg-surface px-4 py-10 text-center text-sm font-semibold text-muted">
              No collection pages yet. Select products above and generate your first share page.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
