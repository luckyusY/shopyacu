"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { formatPrice, getCategories, slugify, type Product, type ProductMedia } from "@/lib/products";
import { whatsappDisplay } from "@/lib/whatsapp";

type DraftProduct = Product & { saving?: boolean };
type ProductForm = {
  name: string;
  category: string;
  price: string;
  badge: string;
  stock: string;
  description: string;
  active: boolean;
};
type CloudinarySignature = {
  apiKey: string;
  cloudName: string;
  params: {
    eager: string;
    eager_async: string;
    folder: string;
    timestamp: number;
  };
  signature: string;
  uploadUrl: string;
};

const defaultForm: ProductForm = {
  name: "",
  category: "Home",
  price: "",
  badge: "",
  stock: "In stock",
  description: "",
  active: true,
};

function transformCloudinaryUrl(url: string, type: ProductMedia["type"]) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const transform = type === "video" ? "q_auto:eco,f_auto,w_1080,c_limit" : "q_auto:good,f_auto,w_1600,c_limit";
  return url.includes(`/upload/${transform}/`) ? url : url.replace("/upload/", `/upload/${transform}/`);
}

function cloudinaryPoster(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return undefined;
  return url
    .replace("/video/upload/", "/video/upload/q_auto:good,f_jpg,w_900,c_limit/")
    .replace(/\.[a-z0-9]+($|\?)/i, ".jpg$1");
}

function mediaFromCloudinaryUpload(upload: Record<string, unknown>, type: ProductMedia["type"]): ProductMedia {
  const secureUrl = String(upload.secure_url || "");

  return {
    type,
    url: transformCloudinaryUrl(secureUrl, type),
    publicId: String(upload.public_id || ""),
    poster: type === "video" ? cloudinaryPoster(secureUrl) : undefined,
    thumbnail: type === "video" ? cloudinaryPoster(secureUrl) : undefined,
    width: Number(upload.width) || undefined,
    height: Number(upload.height) || undefined,
    duration: Number(upload.duration) || undefined,
    bytes: Number(upload.bytes) || undefined,
    format: String(upload.format || ""),
  };
}

export function AdminPanel({ products }: { products: Product[] }) {
  const [items, setItems] = useState<DraftProduct[]>(products);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories = useMemo(() => getCategories(items), [items]);
  const visible = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesQuery = `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const inventoryValue = items.reduce((total, item) => total + item.price, 0);
  const videoCount = items.reduce((total, item) => total + (item.videos?.length || 0), 0);

  function updateProduct(id: number, patch: Partial<DraftProduct>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function replaceProduct(product: Product) {
    setItems((current) => {
      const exists = current.some((item) => item.slug === product.slug);
      return exists ? current.map((item) => (item.slug === product.slug ? product : item)) : [product, ...current];
    });
  }

  async function refreshProducts() {
    setStatus("Refreshing products from MongoDB...");
    const response = await fetch("/api/products?all=1", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to refresh products.");
    setItems(await response.json());
    setStatus("Products synced from MongoDB.");
  }

  async function signCloudinaryUpload(file: File, slug: string) {
    const resourceType: ProductMedia["type"] = file.type.startsWith("video/") ? "video" : "image";
    const response = await fetch("/api/cloudinary/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType, slug }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Unable to sign Cloudinary upload.");
    }

    return { resourceType, signature: (await response.json()) as CloudinarySignature };
  }

  async function uploadFilesToCloudinary(files: File[], slug: string) {
    const uploaded: ProductMedia[] = [];

    for (const file of files) {
      setStatus(`Uploading ${file.name} to Cloudinary...`);
      const { resourceType, signature } = await signCloudinaryUpload(file, slug);
      const payload = new FormData();
      payload.append("file", file);
      payload.append("api_key", signature.apiKey);
      payload.append("timestamp", String(signature.params.timestamp));
      payload.append("folder", signature.params.folder);
      payload.append("eager", signature.params.eager);
      payload.append("eager_async", signature.params.eager_async);
      payload.append("signature", signature.signature);

      const uploadResponse = await fetch(signature.uploadUrl, {
        method: "POST",
        body: payload,
      });

      if (!uploadResponse.ok) {
        const body = await uploadResponse.json().catch(() => ({}));
        throw new Error(body.error?.message || `Cloudinary upload failed for ${file.name}.`);
      }

      uploaded.push(mediaFromCloudinaryUpload(await uploadResponse.json(), resourceType));
    }

    return uploaded;
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = slugify(form.name);
    if (!slug) {
      setStatus("Add a product name first.");
      return;
    }

    try {
      const media = selectedFiles.length ? await uploadFilesToCloudinary(selectedFiles, slug) : [];
      setStatus("Saving product to MongoDB...");
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug,
          price: Number(form.price),
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

      replaceProduct(await response.json());
      setForm(defaultForm);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus("Product created, media uploaded to Cloudinary, and MongoDB synced.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create product.");
    }
  }

  async function saveProduct(product: DraftProduct) {
    try {
      updateProduct(product.id, { saving: true });
      setStatus(`Saving ${product.name}...`);
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
      const uploaded = await uploadFilesToCloudinary(files, product.slug);
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
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Admin</p>
            <h1 className="font-display text-2xl font-bold">Shopyacu control panel</h1>
          </div>
          <Link href="/" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/85">
            Storefront
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        <Stat label="Products" value={items.length.toString()} />
        <Stat label="Categories" value={(categories.length - 1).toString()} />
        <Stat label="Videos" value={videoCount.toString()} />
        <Stat label="Orders" value={whatsappDisplay} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <form onSubmit={createProduct} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">New product</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Upload to Cloudinary, sync to MongoDB.</h2>
          <div className="mt-5 grid gap-3">
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Product name" className="h-11 rounded-xl border border-ink/10 px-4 text-sm font-medium outline-none focus:border-ink" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" className="h-11 rounded-xl border border-ink/10 px-4 text-sm font-medium outline-none focus:border-ink" />
              <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} type="number" min="0" placeholder="Price in RWF" className="h-11 rounded-xl border border-ink/10 px-4 text-sm font-medium outline-none focus:border-ink" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} placeholder="Badge, e.g. New" className="h-11 rounded-xl border border-ink/10 px-4 text-sm font-medium outline-none focus:border-ink" />
              <select value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="h-11 rounded-xl border border-ink/10 bg-white px-4 text-sm font-medium outline-none focus:border-ink">
                <option>In stock</option>
                <option>Low stock</option>
                <option>Out of stock</option>
              </select>
            </div>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="min-h-24 rounded-xl border border-ink/10 px-4 py-3 text-sm font-medium outline-none focus:border-ink" />
            <label className="rounded-xl border border-dashed border-ink/20 bg-surface p-4 text-sm font-semibold text-ink">
              Images or videos
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))} className="mt-3 block w-full text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-muted">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-4 w-4 accent-ink" />
              Show on storefront
            </label>
            <button type="submit" className="h-12 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink/85">
              Create product
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-ink/10 bg-ink p-5 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Media workflow</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Videos are delivered compressed.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Admin uploads go straight to Cloudinary with signed requests. Images use automatic format and quality delivery. Videos get an eager MP4 compression request and storefront delivery uses quality-auto, 1080px limit, and generated poster frames.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={refreshProducts} className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-accent/85">
              Refresh Mongo products
            </button>
            <span className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/70">
              Catalog value {formatPrice(inventoryValue)}
            </span>
          </div>
          {status && <p className="mt-5 rounded-xl bg-white/10 p-3 text-sm font-semibold text-white">{status}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-y border-ink/10 py-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="h-11 rounded-full border border-ink/10 bg-white px-5 text-sm font-medium text-ink outline-none focus:border-ink lg:w-80"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
                  selectedCategory === category ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-ink hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm">
          <div className="min-w-[1040px]">
            <div className="grid grid-cols-[90px_1.35fr_0.7fr_0.55fr_0.6fr_1fr_150px] gap-4 border-b border-ink/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
              <span>Media</span>
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Status</span>
              <span>Add image/video</span>
              <span>Action</span>
            </div>
            {visible.map((product) => (
              <div key={product.id} className="grid grid-cols-[90px_1.35fr_0.7fr_0.55fr_0.6fr_1fr_150px] items-center gap-4 border-b border-ink/10 px-4 py-3">
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
                    className="mt-2 h-8 w-full rounded-lg border border-ink/10 px-2 text-xs font-medium outline-none focus:border-ink"
                  />
                  <p className="mt-2 text-xs font-medium text-muted">
                    {(product.media?.length || 0)} media / {(product.videos?.length || 0)} videos
                  </p>
                </div>
                <input
                  value={product.category}
                  onChange={(event) => updateProduct(product.id, { category: event.target.value })}
                  className="h-10 rounded-xl border border-ink/10 px-3 text-sm font-semibold text-ink outline-none focus:border-ink"
                />
                <input
                  type="number"
                  value={product.price}
                  onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) })}
                  className="h-10 w-full rounded-xl border border-ink/10 px-3 text-sm font-semibold text-ink outline-none focus:border-ink"
                />
                <select
                  value={product.stock}
                  onChange={(event) => updateProduct(product.id, { stock: event.target.value })}
                  className="h-10 rounded-xl border border-ink/10 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-ink"
                >
                  <option>In stock</option>
                  <option>Low stock</option>
                  <option>Out of stock</option>
                </select>
                <input type="file" accept="image/*,video/*" multiple onChange={(event) => appendMedia(product, event)} className="text-xs font-medium text-muted" />
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => saveProduct(product)}
                    disabled={product.saving}
                    className="rounded-full bg-ink px-4 py-3 text-center text-xs font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-60"
                  >
                    {product.saving ? "Saving..." : "Save"}
                  </button>
                  <Link href={`/products/${product.slug}`} className="rounded-full border border-ink/15 px-4 py-2 text-center text-xs font-semibold text-ink transition hover:bg-ink hover:text-white">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductThumb({ product }: { product: Product }) {
  const video = product.videos?.[0];

  if (video) {
    return (
      <video src={video.url} poster={video.poster || product.image} muted playsInline preload="metadata" className="h-16 w-16 rounded-xl bg-black object-cover" />
    );
  }

  return <Image src={product.image} alt={product.name} width={72} height={72} className="h-16 w-16 rounded-xl object-cover" />;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
