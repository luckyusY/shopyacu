"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, formatPrice, type Product } from "@/lib/products";

type CartItem = Product & { quantity: number };

export function Storefront({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const searchMatch = `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, products, query]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  function addToCart(product: Product) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function removeFromCart(productId: number) {
    setCart((items) => items.filter((item) => item.id !== productId));
  }

  const whatsappText = encodeURIComponent(
    `Hello Shopyacu, I want to order:\n${cart
      .map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`)
      .join("\n")}\nTotal: ${formatPrice(cartTotal)}`,
  );

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#1f2933]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f4ef]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-black tracking-[0.08em] text-[#0f3d3e]">
            SHOPYACU
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#435466] md:flex">
            <a href="#products">Products</a>
            <a href="#delivery">Delivery</a>
            <a href="#contact">Contact</a>
          </nav>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative h-11 rounded-full bg-[#0f3d3e] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#145c5e]"
          >
            Cart
            {itemCount > 0 && (
              <span className="ml-2 rounded-full bg-[#f6c453] px-2 py-0.5 text-xs text-[#1f2933]">{itemCount}</span>
            )}
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-[#d25f36]">Kigali online store</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] text-[#13292f] sm:text-6xl lg:text-7xl">
            Smart home finds, delivered fast.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#51616f]">
            Shop practical kitchen, bathroom, fitness, office, and outdoor products selected from the Shopyacu catalog.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#products" className="rounded-full bg-[#d25f36] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#b94f2d]">
              Browse products
            </a>
            <a href="https://wa.me/250788000000" className="rounded-full border border-[#0f3d3e]/25 px-6 py-3 text-sm font-black text-[#0f3d3e] transition hover:border-[#0f3d3e]">
              WhatsApp us
            </a>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_0.78fr] gap-4">
          <div className="overflow-hidden rounded-[8px] bg-white shadow-sm">
            <Image src="/products/product-21.jpg" alt="Corner shower caddy" width={900} height={900} priority className="h-full min-h-[420px] w-full object-cover" />
          </div>
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-[8px] bg-white shadow-sm">
              <Image src="/products/product-19.jpg" alt="Silver Crest air fryer" width={600} height={600} className="h-full w-full object-cover" />
            </div>
            <div className="bg-[#0f3d3e] p-5 text-white">
              <p className="text-4xl font-black">{products.length}</p>
              <p className="mt-2 text-sm font-semibold text-white/75">ready-to-order products in this first catalog</p>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-y border-black/10 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`h-10 rounded-full px-4 text-sm font-bold transition ${
                  activeCategory === category ? "bg-[#0f3d3e] text-white" : "bg-white text-[#435466] hover:bg-[#e8efe8]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="block w-full lg:w-80">
            <span className="sr-only">Search products</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="h-11 w-full rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-[#1f2933] outline-none transition focus:border-[#0f3d3e]"
            />
          </label>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-[8px] bg-white shadow-sm">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-[#e9e4dc]">
                  {product.badge && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-[#f6c453] px-3 py-1 text-xs font-black text-[#1f2933]">
                      {product.badge}
                    </span>
                  )}
                  <Image src={product.image} alt={product.name} width={700} height={700} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                </div>
              </Link>
              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d25f36]">{product.category}</p>
                <Link href={`/products/${product.slug}`} className="mt-2 block min-h-12 text-base font-black leading-6 text-[#13292f] hover:text-[#0f3d3e]">
                  {product.name}
                </Link>
                <p className="mt-2 text-lg font-black text-[#0f3d3e]">{formatPrice(product.price)}</p>
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="mt-4 h-11 w-full rounded-full bg-[#13292f] text-sm font-black text-white transition hover:bg-[#d25f36]"
                >
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="delivery" className="bg-[#102f33] py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {["Order on the site", "Confirm on WhatsApp", "Fast Kigali delivery"].map((step, index) => (
            <div key={step} className="border-l border-white/20 pl-5">
              <p className="font-mono text-sm text-[#f6c453]">0{index + 1}</p>
              <h2 className="mt-2 text-2xl font-black">{step}</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">Simple ordering built around local delivery and quick product confirmation.</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm font-semibold text-[#51616f] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>Shopyacu Online Store</p>
        <p>Kigali, Rwanda · WhatsApp orders · Home essentials</p>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/35" onClick={() => setCartOpen(false)}>
          <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#13292f]">Your cart</h2>
              <button type="button" onClick={() => setCartOpen(false)} className="h-10 w-10 rounded-full bg-[#f1eee8] text-xl font-black text-[#13292f]">x</button>
            </div>
            <div className="mt-6 flex-1 space-y-4 overflow-auto">
              {cart.length === 0 ? (
                <p className="rounded-[8px] bg-[#f7f4ef] p-4 text-sm font-semibold text-[#51616f]">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-black/10 pb-4">
                    <Image src={item.image} alt={item.name} width={84} height={84} className="h-20 w-20 rounded-[8px] object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-[#13292f]">{item.name}</p>
                      <p className="mt-1 text-sm font-semibold text-[#51616f]">Qty {item.quantity} · {formatPrice(item.price * item.quantity)}</p>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="mt-2 text-sm font-black text-[#d25f36]">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-black/10 pt-5">
              <div className="flex items-center justify-between text-lg font-black text-[#13292f]">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <a
                href={cart.length ? `https://wa.me/250788000000?text=${whatsappText}` : "#products"}
                className="mt-4 block rounded-full bg-[#0f3d3e] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#145c5e]"
              >
                Send order on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
