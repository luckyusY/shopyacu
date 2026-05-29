"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice, type Product } from "@/lib/products";
import { whatsappDisplay, whatsappLink } from "@/lib/whatsapp";

type DraftProduct = Product & { stock: string; featured: boolean };

export function AdminPanel({ products }: { products: Product[] }) {
  const [items, setItems] = useState<DraftProduct[]>(
    products.map((product) => ({ ...product, stock: "In stock", featured: Boolean(product.badge) })),
  );
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const visible = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const inventoryValue = items.reduce((total, item) => total + item.price, 0);

  function updateProduct(id: number, patch: Partial<DraftProduct>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#13292f]">
      <header className="border-b border-black/10 bg-[#f7f4ef]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d25f36]">Admin</p>
            <h1 className="text-2xl font-black">Shopyacu control panel</h1>
          </div>
          <Link href="/" className="rounded-full bg-[#0f3d3e] px-5 py-3 text-sm font-black text-white">
            Storefront
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        <Stat label="Products" value={items.length.toString()} />
        <Stat label="Categories" value={(categories.length - 1).toString()} />
        <Stat label="Catalog value" value={formatPrice(inventoryValue)} />
        <Stat label="Orders" value={whatsappDisplay} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-y border-black/10 py-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="h-11 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold outline-none focus:border-[#0f3d3e] lg:w-80"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`h-10 rounded-full px-4 text-sm font-black ${
                  selectedCategory === category ? "bg-[#0f3d3e] text-white" : "bg-white text-[#51616f]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[8px] bg-white shadow-sm">
          <div className="min-w-[760px]">
          <div className="grid grid-cols-[90px_1.4fr_0.75fr_0.7fr_0.7fr_130px] gap-4 border-b border-black/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#51616f]">
            <span>Image</span>
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {visible.map((product) => (
            <div key={product.id} className="grid grid-cols-[90px_1.4fr_0.75fr_0.7fr_0.7fr_130px] items-center gap-4 border-b border-black/10 px-4 py-3">
              <Image src={product.image} alt={product.name} width={72} height={72} className="h-16 w-16 rounded-[8px] object-cover" />
              <div>
                <input
                  value={product.name}
                  onChange={(event) => updateProduct(product.id, { name: event.target.value })}
                  className="w-full border-0 bg-transparent p-0 text-sm font-black outline-none"
                />
                <label className="mt-2 flex items-center gap-2 text-xs font-bold text-[#51616f]">
                  <input
                    type="checkbox"
                    checked={product.featured}
                    onChange={(event) => updateProduct(product.id, { featured: event.target.checked })}
                    className="h-4 w-4"
                  />
                  Featured
                </label>
              </div>
              <span className="text-sm font-bold">{product.category}</span>
              <input
                type="number"
                value={product.price}
                onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) })}
                className="h-10 w-full rounded-[8px] border border-black/10 px-3 text-sm font-bold"
              />
              <select
                value={product.stock}
                onChange={(event) => updateProduct(product.id, { stock: event.target.value })}
                className="h-10 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-bold"
              >
                <option>In stock</option>
                <option>Low stock</option>
                <option>Out of stock</option>
              </select>
              <a
                href={whatsappLink(`Hello Shopyacu, I need an update about ${product.name}.`)}
                className="rounded-full bg-[#d25f36] px-4 py-3 text-center text-xs font-black text-white"
              >
                WhatsApp
              </a>
            </div>
          ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d25f36]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#0f3d3e]">{value}</p>
    </div>
  );
}
