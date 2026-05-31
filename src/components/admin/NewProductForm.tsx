"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { slugify } from "@/lib/products";
import { uploadFilesToCloudinary } from "@/lib/cloudinary-client";

type ProductForm = {
  name: string;
  category: string;
  price: string;
  badge: string;
  tags: string;
  stock: string;
  description: string;
  active: boolean;
};

const defaultForm: ProductForm = {
  name: "",
  category: "Home",
  price: "",
  badge: "",
  tags: "",
  stock: "In stock",
  description: "",
  active: true,
};

const fieldClass =
  "h-11 rounded-xl border border-ink/10 bg-surface px-4 text-sm font-medium text-ink outline-none transition focus:border-accent focus:bg-white";

export function NewProductForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>({ ...defaultForm, category: categories[0] || "Home" });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = slugify(form.name);
    if (!slug) {
      setStatus("Add a product name first.");
      return;
    }

    setSubmitting(true);
    try {
      const media = selectedFiles.length ? await uploadFilesToCloudinary(selectedFiles, slug, setStatus) : [];
      setStatus("Saving product to MongoDB…");
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug,
          price: Number(form.price),
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          media,
          image: media.find((item) => item.type === "image")?.url || media.find((item) => item.type === "video")?.poster,
          images: media.filter((item) => item.type === "image").map((item) => item.url),
          videos: media.filter((item) => item.type === "video"),
          featured: Boolean(form.badge),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to save product.");
      }
      setStatus("Product created and synced. Redirecting…");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create product.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Catalog</p>
        <h1 className="font-display text-3xl font-bold">Add product</h1>
        <p className="mt-1 text-sm text-muted">Media uploads to Cloudinary (signed), then syncs to MongoDB.</p>
      </div>

      <form onSubmit={createProduct} className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Product name</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="e.g. Stainless Steel Shoe Rack"
            className={fieldClass}
            required
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Category</span>
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              list="admin-categories"
              placeholder="Category"
              className={fieldClass}
            />
            <datalist id="admin-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Price (RWF)</span>
            <input
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              type="number"
              min="0"
              placeholder="0"
              className={fieldClass}
              required
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Badge</span>
            <input
              value={form.badge}
              onChange={(event) => setForm({ ...form, badge: event.target.value })}
              placeholder="e.g. New"
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Stock</span>
            <select
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              className={`${fieldClass} bg-surface`}
            >
              <option>In stock</option>
              <option>Low stock</option>
              <option>Out of stock</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Rotating tags</span>
          <input
            value={form.tags}
            onChange={(event) => setForm({ ...form, tags: event.target.value })}
            placeholder="e.g. -33%, New arrival, Fast delivery"
            className={fieldClass}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Describe the product…"
            className="min-h-24 rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <label className="rounded-xl border border-dashed border-ink/20 bg-surface p-4 text-sm font-semibold text-ink">
          Images or videos
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
            className="mt-3 block w-full text-sm font-medium"
          />
          {selectedFiles.length ? (
            <span className="mt-2 block text-xs font-medium text-muted">{selectedFiles.length} file(s) selected</span>
          ) : null}
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-muted">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
            className="h-4 w-4 accent-ink"
          />
          Show on storefront
        </label>

        {status ? (
          <p className="rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm font-semibold text-ink">{status}</p>
        ) : null}

        <div className="mt-1 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-12 flex-1 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="h-12 rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink transition hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
