"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { slugify, type Product, type ProductMedia } from "@/lib/products";
import { uploadFilesToCloudinary } from "@/lib/cloudinary-client";

type ProductFormProps = {
  mode: "create" | "edit";
  categories: string[];
  product?: Product;
};

type FormState = {
  name: string;
  category: string;
  price: string;
  badge: string;
  tags: string;
  stock: string;
  description: string;
  instagramUrl: string;
  active: boolean;
  featured: boolean;
};

const fieldClass =
  "h-11 rounded-xl border border-ink/10 bg-surface px-4 text-sm font-medium text-ink outline-none transition focus:border-accent focus:bg-white";
const labelClass = "text-xs font-bold uppercase tracking-[0.14em] text-muted";

function initialState(product?: Product, categories: string[] = []): FormState {
  return {
    name: product?.name || "",
    category: product?.category || categories[0] || "Home",
    price: product?.price ? String(product.price) : "",
    badge: product?.badge || "",
    tags: (product?.tags || []).join(", "),
    stock: product?.stock || "In stock",
    description: product?.description || "",
    instagramUrl: product?.instagramUrl || "",
    active: product?.active !== false,
    featured: Boolean(product?.featured),
  };
}

export function ProductForm({ mode, categories, product }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(product, categories));
  const [media, setMedia] = useState<ProductMedia[]>(product?.media || []);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const slug = mode === "edit" && product ? product.slug : slugify(form.name);

  async function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const uploadSlug = slug || "draft-product";

    setBusy(true);
    try {
      const uploaded = await uploadFilesToCloudinary(files, uploadSlug, setStatus);
      setMedia((current) => [...current, ...uploaded]);
      setStatus(`${uploaded.length} file${uploaded.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to upload media.");
    } finally {
      setBusy(false);
    }
  }

  function removeMedia(index: number) {
    setMedia((current) => current.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    setMedia((current) => {
      if (index <= 0) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setStatus("Add a product name first.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price) || 0,
        badge: form.badge.trim() || undefined,
        stock: form.stock,
        description: form.description.trim(),
        instagramUrl: form.instagramUrl.trim() || undefined,
        active: form.active,
        featured: form.featured || Boolean(form.badge.trim()),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        media,
        image: media.find((m) => m.type === "image")?.url || media.find((m) => m.type === "video")?.poster,
        images: media.filter((m) => m.type === "image").map((m) => m.url),
        videos: media.filter((m) => m.type === "video"),
      };

      setStatus(mode === "edit" ? "Saving changes…" : "Creating product…");
      const response = await fetch(
        mode === "edit" ? `/api/products/${product!.slug}` : "/api/products",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mode === "edit" ? payload : { ...payload, slug: slugify(form.name) }),
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to save product.");
      }
      setStatus(mode === "edit" ? "Changes saved. Redirecting…" : "Product created. Redirecting…");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save product.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      {/* Main details */}
      <div className="grid content-start gap-4 rounded-3xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <label className="grid gap-1.5">
          <span className={labelClass}>Product name</span>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Stainless Steel Shoe Rack"
            className={fieldClass}
            required
          />
          {slug ? <span className="text-xs font-medium text-muted">URL: /products/{slug}</span> : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelClass}>Category</span>
            <input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              list="admin-categories"
              className={fieldClass}
            />
            <datalist id="admin-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1.5">
            <span className={labelClass}>Price (RWF)</span>
            <input
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              type="number"
              min="0"
              placeholder="0"
              className={fieldClass}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelClass}>Badge</span>
            <input value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="e.g. New" className={fieldClass} />
          </label>
          <label className="grid gap-1.5">
            <span className={labelClass}>Stock</span>
            <select value={form.stock} onChange={(e) => set("stock", e.target.value)} className={fieldClass}>
              <option>In stock</option>
              <option>Low stock</option>
              <option>Out of stock</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className={labelClass}>Rotating tags</span>
          <input
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="e.g. -33%, New arrival, Fast delivery"
            className={fieldClass}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={labelClass}>Description</span>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the product…"
            className="min-h-28 rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <label className="grid gap-1.5">
          <span className={labelClass}>Instagram video URL</span>
          <input
            value={form.instagramUrl}
            onChange={(e) => set("instagramUrl", e.target.value)}
            type="url"
            inputMode="url"
            placeholder="https://www.instagram.com/reel/…"
            className={fieldClass}
          />
          <span className="text-xs font-medium text-muted">
            Paste a post or reel link. It embeds on this product&apos;s page. Leave blank for none.
          </span>
        </label>
      </div>

      {/* Media + publish */}
      <div className="grid content-start gap-5">
        <div className="rounded-3xl border border-ink/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className={labelClass}>Media</span>
            <span className="text-xs font-medium text-muted">{media.length} item{media.length === 1 ? "" : "s"}</span>
          </div>

          {media.length ? (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {media.map((item, index) => (
                <li key={`${item.url}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-ink/10 bg-surface">
                  {item.type === "video" ? (
                    <video src={item.url} poster={item.poster} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" className="h-full w-full object-contain p-1" />
                  )}
                  {index === 0 ? (
                    <span className="absolute left-1 top-1 rounded-md bg-accent px-1.5 py-0.5 text-[0.6rem] font-black uppercase text-ink">
                      Cover
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/75 px-1.5 py-1 opacity-0 transition group-hover:opacity-100">
                    {index !== 0 ? (
                      <button type="button" onClick={() => makeCover(index)} className="text-[0.65rem] font-bold text-white hover:text-accent">
                        Cover
                      </button>
                    ) : <span />}
                    <button type="button" onClick={() => removeMedia(index)} className="text-[0.65rem] font-bold text-rose-300 hover:text-rose-200">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-ink/15 bg-surface px-3 py-6 text-center text-xs font-medium text-muted">
              No media yet. Add images or videos below.
            </p>
          )}

          <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-ink/20 bg-surface px-3 py-3 text-sm font-semibold text-ink transition hover:border-accent">
            + Add images or videos
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={addFiles} className="hidden" />
          </label>
        </div>

        <div className="rounded-3xl border border-ink/8 bg-white p-5 shadow-sm">
          <span className={labelClass}>Publishing</span>
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-ink" />
            Show on storefront
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-ink" />
            Featured product
          </label>
        </div>

        {status ? (
          <p className="rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm font-semibold text-ink">{status}</p>
        ) : null}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="h-12 flex-1 rounded-full bg-ink px-5 text-sm font-bold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Working…" : mode === "edit" ? "Save changes" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="h-12 rounded-full border border-ink/15 px-5 text-sm font-bold text-ink transition hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
