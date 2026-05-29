"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { categories, formatPrice, type Product } from "@/lib/products";
import { whatsappDisplay, whatsappLink } from "@/lib/whatsapp";

type CartItem = Product & { quantity: number };

const highlights = ["33 products", "Local delivery", "WhatsApp checkout"];
const promises = [
  ["Browse fast", "Search by product or category."],
  ["Confirm clearly", "Your cart becomes a WhatsApp order."],
  ["Shop locally", "Selected for everyday Kigali homes."],
  ["Manage easily", "Admin panel for quick product updates."],
];

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

  useEffect(() => {
    const processEmbeds = () => window.instgrm?.Embeds?.process?.();

    if (window.instgrm?.Embeds) {
      processEmbeds();
      return;
    }

    if (document.querySelector('script[src*="instagram.com/embed.js"]')) {
      window.setTimeout(processEmbeds, 800);
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.instagram.com/embed.js";
    script.onload = processEmbeds;
    document.body.appendChild(script);
  }, []);

  function addToCart(product: Product) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...items, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function removeFromCart(productId: number) {
    setCart((items) => items.filter((item) => item.id !== productId));
  }

  const whatsappText =
    `Hello Shopyacu, I want to order:\n${cart
      .map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`)
      .join("\n")}\nTotal: ${formatPrice(cartTotal)}`;

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#1f2933]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f6f1e9]/90 backdrop-blur">
        <div className="bg-[#0f3d3e] px-4 py-2 text-center text-xs font-extrabold text-white/85">
          Orders confirmed on WhatsApp {whatsappDisplay}
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="grid leading-none text-[#0f3d3e]">
            <span className="text-xl font-black uppercase tracking-[0.08em]">Shopyacu</span>
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#667680]">Online store</span>
          </Link>
          <nav className="hidden items-center gap-2 rounded-full border border-black/10 bg-white/60 p-1 text-sm font-black text-[#435466] md:flex">
            <a className="rounded-full px-4 py-2 hover:bg-[#0f3d3e] hover:text-white" href="#products">Products</a>
            <a className="rounded-full px-4 py-2 hover:bg-[#0f3d3e] hover:text-white" href="#instagram">Instagram</a>
            <a className="rounded-full px-4 py-2 hover:bg-[#0f3d3e] hover:text-white" href="#delivery">How it works</a>
            <Link className="rounded-full px-4 py-2 hover:bg-[#0f3d3e] hover:text-white" href="/admin">Admin</Link>
            <a className="rounded-full px-4 py-2 hover:bg-[#0f3d3e] hover:text-white" href="#contact">Contact</a>
          </nav>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative h-11 rounded-full bg-[#c95d35] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#b94f2d]"
          >
            Cart
            {itemCount > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-[#c95d35]">{itemCount}</span>
            )}
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-[#c95d35]">Kigali online essentials</p>
          <h1 className="max-w-3xl text-5xl font-black leading-none text-[#13292f] sm:text-6xl lg:text-7xl">
            Useful products for a cleaner, easier home.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#51616f]">
            Shop practical picks for kitchens, bathrooms, fitness corners, work setups, and rainy-day errands. Add items to cart, then confirm your order on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#products" className="rounded-full bg-[#c95d35] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#b94f2d]">
              Shop catalog
            </a>
            <a href={whatsappLink()} className="rounded-full border border-[#0f3d3e]/25 bg-white/40 px-6 py-3 text-sm font-black text-[#0f3d3e] transition hover:border-[#0f3d3e]">
              Order on WhatsApp
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {highlights.map((item) => (
              <span key={item} className="rounded-full border border-black/10 bg-white/60 px-3 py-2 text-xs font-black text-[#344851]">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid min-h-[560px] grid-cols-[1fr_0.72fr] gap-4 max-md:min-h-0 max-md:grid-cols-1">
          <div className="relative overflow-hidden rounded-[8px] bg-white shadow-xl">
            <Image src="/products/product-21.jpg" alt="Corner shower caddy" width={900} height={900} priority className="h-full min-h-[420px] w-full object-cover" />
            <div className="absolute inset-x-4 bottom-4 rounded-[8px] bg-[#0f3d3e]/85 p-4 text-white backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f2bd4b]">Featured</p>
              <p className="mt-1 text-lg font-black">Corner Shower Caddy</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-[8px] bg-white shadow-sm">
              <Image src="/products/product-19.jpg" alt="Silver Crest air fryer" width={600} height={600} className="h-full w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-[8px] bg-white shadow-sm">
              <Image src="/products/product-31.jpg" alt="Portable laptop table" width={600} height={600} className="h-full w-full object-cover" />
            </div>
            <div className="rounded-[8px] bg-[#315f72] p-5 text-white">
              <p className="text-3xl font-black">{whatsappDisplay}</p>
              <p className="mt-2 text-sm font-semibold text-white/75">orders through WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-12 sm:px-6 md:grid-cols-4 lg:px-8">
        {promises.map(([title, copy]) => (
          <div key={title} className="rounded-[8px] border border-black/10 bg-white/70 p-5">
            <p className="font-black text-[#13292f]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[#667680]">{copy}</p>
          </div>
        ))}
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-6 md:grid-cols-[190px_1fr]">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#c95d35]">Catalog</p>
          <div>
            <h2 className="max-w-3xl text-4xl font-black leading-tight text-[#13292f] md:text-5xl">Shop by need, room, or routine.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#667680]">Filter the catalog, add products to cart, and send the order list directly to WhatsApp.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-[8px] border border-black/10 bg-white/70 p-4 lg:flex-row lg:items-center lg:justify-between">
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
            <m.article
              key={product.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="group overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-sm"
            >
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-[#e9e4dc]">
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#0f3d3e]">
                    In stock
                  </span>
                  {product.badge && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-[#f6c453] px-3 py-1 text-xs font-black text-[#1f2933]">
                      {product.badge}
                    </span>
                  )}
                  <Image src={product.image} alt={product.name} width={700} height={700} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                </div>
              </Link>
              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c95d35]">{product.category}</p>
                <Link href={`/products/${product.slug}`} className="mt-2 block min-h-12 text-base font-black leading-6 text-[#13292f] hover:text-[#0f3d3e]">
                  {product.name}
                </Link>
                <p className="mt-3 text-xl font-black text-[#0f3d3e]">{formatPrice(product.price)}</p>
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="mt-4 h-11 w-full rounded-full bg-[#13292f] text-sm font-black text-white transition hover:bg-[#c95d35]"
                >
                  Add to cart
                </button>
              </div>
            </m.article>
          ))}
        </div>
      </section>

      <section id="instagram" className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 sm:px-6 md:grid-cols-[0.85fr_1fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#c95d35]">Instagram</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#13292f] md:text-5xl">Follow the newest arrivals from @shopyacu.</h2>
          <p className="mt-5 max-w-2xl leading-7 text-[#667680]">
            See product videos, restocks, and daily-use demos directly from the Shopyacu Instagram profile.
          </p>
          <a href="https://www.instagram.com/shopyacu/" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex w-fit rounded-full border border-[#0f3d3e]/25 bg-white/40 px-6 py-3 text-sm font-black text-[#0f3d3e]">
            Open Instagram
          </a>
        </div>
        <div className="relative min-h-[440px] overflow-hidden rounded-[8px] border border-black/10 bg-white p-5 shadow-xl">
          <blockquote
            className="instagram-media relative z-10 mx-auto w-full max-w-[540px]"
            data-instgrm-permalink="https://www.instagram.com/shopyacu/"
            data-instgrm-version="14"
          >
            <a href="https://www.instagram.com/shopyacu/" target="_blank" rel="noopener noreferrer">
              View @shopyacu on Instagram
            </a>
          </blockquote>
          <div className="absolute inset-5 z-0 grid place-items-center rounded-[8px] border border-dashed border-black/15 p-8 text-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c95d35]">@shopyacu</p>
              <p className="mx-auto mt-3 max-w-sm text-2xl font-black leading-tight text-[#13292f]">Latest product drops, demos, and offers</p>
              <p className="mt-3 text-sm font-bold text-[#667680]">Instagram embed loading...</p>
            </div>
          </div>
        </div>
      </section>

      <section id="delivery" className="bg-[#0f3d3e] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f2bd4b]">How ordering works</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight md:text-5xl">Simple cart, human confirmation.</h2>
            <p className="mt-5 max-w-xl leading-7 text-white/70">
              Choose products on the website, send your cart to WhatsApp, then confirm availability, delivery, and payment details with the seller.
            </p>
            <a href={whatsappLink()} className="mt-8 inline-flex rounded-full bg-[#f2bd4b] px-6 py-3 text-sm font-black text-[#13292f]">
              Start WhatsApp order
            </a>
          </div>
          <div className="grid gap-4">
            {["Choose products", "Send cart", "Confirm delivery"].map((step, index) => (
              <div key={step} className="rounded-[8px] border border-white/15 bg-white/5 p-5">
                <p className="font-mono text-sm text-[#f6c453]">0{index + 1}</p>
                <h3 className="mt-2 text-2xl font-black">{step}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">Simple ordering built around WhatsApp confirmation and local delivery.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm font-semibold text-[#51616f] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-xl font-black uppercase tracking-[0.08em] text-[#0f3d3e]">Shopyacu</p>
          <p className="mt-2 max-w-xl">Home, kitchen, bathroom, office, fitness, and outdoor essentials for everyday use.</p>
        </div>
        <p className="text-lg font-black text-[#0f3d3e]">WhatsApp {whatsappDisplay}</p>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setCartOpen(false)}>
          <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c95d35]">Checkout</p>
                <h2 className="text-3xl font-black text-[#13292f]">Your cart</h2>
              </div>
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
                      <p className="mt-1 text-sm font-semibold text-[#51616f]">Qty {item.quantity} - {formatPrice(item.price * item.quantity)}</p>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="mt-2 text-sm font-black text-[#d25f35]">Remove</button>
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
                href={cart.length ? whatsappLink(whatsappText) : "#products"}
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
