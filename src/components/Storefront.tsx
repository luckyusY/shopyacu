"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { formatPrice, getCategories, type Product, type ProductMedia } from "@/lib/products";
import { whatsappDisplay, whatsappLink } from "@/lib/whatsapp";

type CartItem = Product & { quantity: number };
type SavedCartItem = { id: number; quantity: number };

const cartStorageKey = "shopyacu_cart_v1";
const promises = [
  ["Browse fast", "Search by product or category."],
  ["Confirm clearly", "Your cart becomes a WhatsApp order."],
  ["Shop locally", "Selected for everyday Kigali homes."],
  ["Manage easily", "Admin panel for quick product updates."],
];
const quickSearches = [
  { label: "Bathroom storage", query: "shower caddy", category: "Bathroom" },
  { label: "Kitchen deals", query: "air fryer", category: "Kitchen" },
  { label: "Work setup", query: "laptop table", category: "Office" },
  { label: "Rainy day", query: "rain coat", category: "Outdoor" },
];
const marketplaceCategories = [
  {
    label: "Home",
    category: "Home",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    description: "Household finds, furniture helpers, storage, decor, and daily-use essentials.",
    tag: "Home goods",
  },
  {
    label: "Wedding",
    category: "Wedding",
    image: "/categories/wedding-aisle.jpeg",
    description: "Past wedding decor, stages, bridal setups, gifts, beauty, and event support.",
    tag: "Past weddings",
  },
  {
    label: "Cars for Sale",
    category: "Cars for Sale",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    description: "Vehicle listings, deals, inspection-ready offers, and seller leads.",
    tag: "Buy cars",
  },
  {
    label: "Cars for Rent",
    category: "Cars for Rent",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    description: "Short-term rentals, special day cars, travel cars, and driver options.",
    tag: "Rentals",
  },
  {
    label: "Jobs",
    category: "Jobs",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    description: "Open roles, hiring notices, service opportunities, and local work leads.",
    tag: "Hiring",
  },
  {
    label: "Scholarships",
    category: "Scholarships",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    description: "Study opportunities, funding notices, school programs, and application leads.",
    tag: "Education",
  },
  {
    label: "Pets",
    category: "Pets",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    description: "Pet supplies, adoption leads, care products, and animal services.",
    tag: "Pet care",
  },
  {
    label: "Electronics",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    description: "Phones, accessories, office tech, gadgets, and useful digital tools.",
    tag: "Devices",
  },
  {
    label: "Fashion",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
    description: "Clothes, shoes, bags, beauty picks, and occasion-ready outfits.",
    tag: "Style",
  },
  {
    label: "Real Estate",
    category: "Real Estate",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    description: "Homes, rentals, land, rooms, and property-related listings.",
    tag: "Property",
  },
  {
    label: "Services",
    category: "Services",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    description: "Professional help, repairs, delivery, creative work, and business support.",
    tag: "Help",
  },
  {
    label: "Events",
    category: "Events",
    image: "/categories/wedding-stage.jfif",
    description: "Party supplies, event vendors, experiences, tickets, and local happenings.",
    tag: "Local fun",
  },
];

export function Storefront({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const reduceMotion = useReducedMotion();
  const normalizedQuery = query.trim().toLowerCase();
  const highlights = [`${products.length} products`, "Local delivery", "WhatsApp checkout"];
  const storeCategories = useMemo(() => getCategories(products), [products]);
  const catalogCategories = useMemo(
    () => ["All", ...Array.from(new Set([...storeCategories.filter((category) => category !== "All"), ...marketplaceCategories.map((category) => category.category)]))],
    [storeCategories],
  );
  const selectedMarketplaceCategory = marketplaceCategories.find((item) => item.category === activeCategory);
  const categoryShowcase = useMemo(
    () =>
      marketplaceCategories.map((item) => {
        const categoryProducts = products.filter((product) => product.category === item.category);
        const leadProduct = categoryProducts.find((product) => product.image) || categoryProducts[0];

        return {
          ...item,
          image: leadProduct?.image || item.image,
          listingCount: categoryProducts.length,
        };
      }),
    [products],
  );
  const categoryBannerItems = categoryShowcase.filter((item) => ["Wedding", "Cars for Sale", "Home"].includes(item.category));

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const searchMatch =
        !normalizedQuery ||
        `${product.name} ${product.description} ${product.category} ${product.badge || ""}`.toLowerCase().includes(normalizedQuery);
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, normalizedQuery, products]);

  const searchSuggestions = useMemo(() => {
    const scored = products
      .map((product) => {
        const haystack = `${product.name} ${product.description} ${product.category} ${product.badge || ""}`.toLowerCase();
        const name = product.name.toLowerCase();
        let score = product.badge ? 1 : 0;

        if (normalizedQuery) {
          if (name.startsWith(normalizedQuery)) score += 8;
          if (name.includes(normalizedQuery)) score += 5;
          if (haystack.includes(normalizedQuery)) score += 3;
          if (product.category.toLowerCase().includes(normalizedQuery)) score += 2;
        } else if (["Featured", "Hot deal", "Popular"].includes(product.badge || "")) {
          score += 4;
        }

        return { product, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

    return scored.slice(0, 5).map(({ product }) => product);
  }, [normalizedQuery, products]);

  const recommendedProducts = useMemo(() => {
    const cartIds = new Set(cart.map((item) => item.id));
    const preferredCategory = cart[0]?.category || (activeCategory !== "All" ? activeCategory : "");

    return products
      .filter((product) => !cartIds.has(product.id))
      .map((product) => ({
        product,
        score:
          (product.category === preferredCategory ? 5 : 0) +
          (product.badge ? 2 : 0) +
          (normalizedQuery && `${product.name} ${product.description}`.toLowerCase().includes(normalizedQuery) ? 3 : 0),
      }))
      .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
      .slice(0, 3)
      .map(({ product }) => product);
  }, [activeCategory, cart, normalizedQuery, products]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const assistantCopy = cart.length
    ? `${itemCount} item${itemCount === 1 ? "" : "s"} saved. Your cart stays after refresh.`
    : normalizedQuery
      ? `${filteredProducts.length} match${filteredProducts.length === 1 ? "" : "es"} ready in the catalog.`
      : "Try bathroom storage, kitchen deals, rainy day, or work setup.";

  useEffect(() => {
    let cancelled = false;

    const timeout = window.setTimeout(() => {
      try {
        const savedCart = window.localStorage.getItem(cartStorageKey);
        if (!savedCart) {
          if (!cancelled) setCartHydrated(true);
          return;
        }

        const parsed = JSON.parse(savedCart) as Array<Partial<SavedCartItem>>;
        const restored = parsed.flatMap((item) => {
          const product = products.find((candidate) => candidate.id === Number(item.id));
          const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
          return product ? [{ ...product, quantity }] : [];
        });

        if (!cancelled) setCart(restored);
      } catch {
        window.localStorage.removeItem(cartStorageKey);
      } finally {
        if (!cancelled) setCartHydrated(true);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [products]);

  useEffect(() => {
    if (!cartHydrated) return;

    const savedCart: SavedCartItem[] = cart.map((item) => ({ id: item.id, quantity: item.quantity }));
    if (savedCart.length) {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(savedCart));
    } else {
      window.localStorage.removeItem(cartStorageKey);
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cartOpen]);

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
    setToast(`${product.name} added to cart`);
    setCartOpen(true);
  }

  function removeFromCart(productId: number) {
    setCart((items) => items.filter((item) => item.id !== productId));
  }

  function updateCartQuantity(productId: number, change: number) {
    setCart((items) =>
      items.flatMap((item) => {
        if (item.id !== productId) return [item];
        const quantity = item.quantity + change;
        return quantity > 0 ? [{ ...item, quantity }] : [];
      }),
    );
  }

  function clearCart() {
    setCart([]);
    setToast("Cart cleared");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applySmartSearch(nextQuery: string, nextCategory = "All") {
    setQuery(nextQuery);
    setActiveCategory(nextCategory);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function exploreMarketplaceCategory(category: string) {
    setQuery("");
    setActiveCategory(category);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const whatsappText =
    `Hello Shopyacu, I want to order:\n${cart
      .map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`)
      .join("\n")}\nTotal: ${formatPrice(cartTotal)}`;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="bg-ink px-4 py-2 text-center text-xs font-semibold tracking-wide text-white/80">
          Orders confirmed on WhatsApp <span className="text-accent">{whatsappDisplay}</span>
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-baseline gap-2 text-ink">
            <span className="font-display text-2xl font-bold tracking-tight">Shopyacu</span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45 sm:inline">store</span>
          </Link>
          <form onSubmit={submitSearch} className="hidden min-w-[280px] flex-1 items-center rounded-full border border-ink/15 bg-white p-1 lg:flex xl:max-w-lg">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search caddy, air fryer, laptop table..."
              aria-label="Search Shopyacu products"
              className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm font-medium text-ink outline-none placeholder:text-ink/40"
            />
            <button type="submit" className="h-10 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink/85">
              Search
            </button>
          </form>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink/65 md:flex">
            <a className="transition hover:text-ink" href="#categories">Categories</a>
            <a className="transition hover:text-ink" href="#products">Products</a>
            <a className="transition hover:text-ink" href="#instagram">Instagram</a>
            <a className="transition hover:text-ink" href="#delivery">How it works</a>
            <Link className="transition hover:text-ink" href="/admin">Admin</Link>
            <a className="transition hover:text-ink" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="h-11 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white md:hidden"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative h-11 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/85 sm:px-5"
            >
              Cart
              {itemCount > 0 && (
                <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-ink">{itemCount}</span>
              )}
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 lg:hidden">
          <form onSubmit={submitSearch} className="flex items-center rounded-full border border-ink/15 bg-white p-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search Shopyacu products"
              className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm font-medium text-ink outline-none placeholder:text-ink/40"
            />
            <button type="submit" className="h-10 shrink-0 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink/85">
              Search
            </button>
          </form>
        </div>
        {isMenuOpen && (
          <div className="grid gap-2 border-t border-ink/10 px-4 py-3 md:hidden">
            {[
              ["Categories", "#categories"],
              ["Products", "#products"],
              ["Instagram", "#instagram"],
              ["How it works", "#delivery"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink"
              >
                {label}
              </a>
            ))}
            <Link onClick={() => setIsMenuOpen(false)} className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink" href="/admin">
              Admin
            </Link>
          </div>
        )}
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:gap-12 sm:px-6 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Kigali online essentials</p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.02] text-ink sm:text-6xl sm:leading-[0.95] lg:text-7xl">
            Useful products for a cleaner, easier home.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
            Shop practical picks for kitchens, bathrooms, fitness corners, work setups, and rainy-day errands. Add items to cart, then confirm your order on WhatsApp.
          </p>
          <form onSubmit={submitSearch} className="mt-7 rounded-2xl border border-ink/10 bg-white p-2 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you looking for today?"
                aria-label="Search products"
                className="h-12 min-w-0 flex-1 rounded-xl border border-transparent bg-surface px-5 text-sm font-medium text-ink outline-none transition focus:border-ink"
              />
              <button type="submit" className="h-12 rounded-xl bg-ink px-6 text-sm font-semibold text-white transition hover:bg-ink/85">
                Find products
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickSearches.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => applySmartSearch(item.query, item.category)}
                  className="rounded-full border border-ink/20 bg-surface px-3 py-2 text-xs font-semibold text-ink/70 transition hover:border-ink hover:text-ink"
                >
                  {item.label}
                </button>
              ))}
            </div>
            {searchSuggestions.length > 0 && (
              <div className="mt-3 grid gap-2 border-t border-ink/10 pt-3 sm:grid-cols-2">
                {searchSuggestions.slice(0, 4).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => applySmartSearch(product.name)}
                    className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2 text-left text-xs font-medium text-muted transition hover:bg-ink hover:text-white"
                  >
                    <span className="min-w-0 truncate">{product.name}</span>
                    <span className="shrink-0 font-bold">{formatPrice(product.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#products" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/85">
              Shop catalog
            </a>
            <a href={whatsappLink()} className="rounded-full border border-ink/20 bg-transparent px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white">
              Order on WhatsApp
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {highlights.map((item) => (
              <span key={item} className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-semibold text-ink/70">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid min-h-[560px] grid-cols-[1fr_0.72fr] gap-4 max-md:min-h-0 max-md:grid-cols-1">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
            <Image src="/products/product-21.jpg" alt="Corner shower caddy" width={900} height={900} priority className="h-full min-h-[420px] w-full object-cover" />
            <m.div
              animate={reduceMotion ? undefined : { y: [0, -9, 0], rotate: [0, -1.5, 1.5, 0] }}
              transition={reduceMotion ? undefined : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-4 top-4 z-10 flex max-w-[260px] items-center gap-3 rounded-2xl border border-ink/10 bg-white/95 p-3 text-ink shadow-xl backdrop-blur"
            >
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent shadow-inner" aria-hidden="true">
                <span className="absolute -top-2 h-4 w-7 rounded-t-full border-4 border-ink border-b-0" />
                <span className="mt-1 flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-ink" />
                  <span className="h-2 w-2 rounded-full bg-ink" />
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-ink/50">Shop guide</span>
                <span className="block text-sm font-semibold leading-5">{assistantCopy}</span>
              </span>
            </m.div>
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-ink/90 p-4 text-white backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Featured</p>
              <p className="mt-1 font-display text-lg font-bold">Corner Shower Caddy</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <Image src="/products/product-19.jpg" alt="Silver Crest air fryer" width={600} height={600} className="h-full w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <Image src="/products/product-31.jpg" alt="Portable laptop table" width={600} height={600} className="h-full w-full object-cover" />
            </div>
            <div className="rounded-3xl bg-ink p-5 text-white">
              <p className="font-display text-3xl font-bold text-accent">{whatsappDisplay}</p>
              <p className="mt-2 text-sm font-semibold text-white/70">orders through WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-12 sm:px-6 md:grid-cols-4 lg:px-8">
        {promises.map(([title, copy]) => (
          <div key={title} className="rounded-2xl border border-ink/10 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md">
            <p className="font-display text-lg font-bold text-ink">{title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
          </div>
        ))}
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-4 py-6 text-white shadow-xl sm:px-6 lg:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_44%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Shop by categories</p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Pick a circle. Jump straight to what you need.
              </h2>
              <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/70">
                Categories now work like a marketplace banner: real product photos where available, past wedding visuals for events, and fast filtering into the catalog.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#products" className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-accent/85">
                  Browse catalog
                </a>
                <a href="/admin" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink">
                  Add category item
                </a>
              </div>
            </div>

            <div className="relative min-h-[250px]">
              {categoryBannerItems.map((item, index) => (
                <m.button
                  key={item.category}
                  type="button"
                  onClick={() => exploreMarketplaceCategory(item.category)}
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
                  className={`group absolute overflow-hidden rounded-full border-4 border-white/80 bg-white shadow-2xl outline-none transition focus-visible:ring-4 focus-visible:ring-accent/70 ${
                    index === 0
                      ? "left-1 top-5 h-40 w-40 sm:left-8 sm:h-52 sm:w-52"
                      : index === 1
                        ? "right-2 top-0 h-36 w-36 sm:right-12 sm:h-48 sm:w-48"
                        : "bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 sm:h-44 sm:w-44"
                  }`}
                  aria-label={`Open ${item.label} category`}
                >
                  <Image
                    src={item.image}
                    alt={`${item.label} category`}
                    fill
                    sizes="(min-width: 1024px) 220px, 44vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 px-4 pb-5 text-center">
                    <span className="block font-display text-lg font-bold leading-tight">{item.label}</span>
                    <span className="mt-1 block text-xs font-bold text-white/85">{item.listingCount ? `${item.listingCount} live` : item.tag}</span>
                  </span>
                </m.button>
              ))}
            </div>
          </div>

          <div className="relative mt-8 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-4 pr-4">
              {categoryShowcase.map((item, index) => (
                <m.button
                  key={item.category}
                  type="button"
                  onClick={() => exploreMarketplaceCategory(item.category)}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.24, delay: Math.min(index * 0.02, 0.16), ease: "easeOut" }}
                  whileHover={reduceMotion ? undefined : { y: -5 }}
                  className="group w-28 shrink-0 text-center outline-none sm:w-32"
                >
                  <span className="relative mx-auto block h-24 w-24 overflow-hidden rounded-full border-4 border-white/80 bg-white shadow-lg ring-1 ring-black/10 transition group-hover:border-accent group-focus-visible:ring-4 group-focus-visible:ring-accent/70 sm:h-28 sm:w-28">
                    <Image
                      src={item.image}
                      alt={`${item.label} category`}
                      fill
                      sizes="128px"
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-80" />
                  </span>
                  <span className="mt-3 block text-sm font-bold leading-5 text-white">{item.label}</span>
                  <span className="mt-1 block text-xs font-semibold text-white/60">{item.listingCount ? `${item.listingCount} live` : item.tag}</span>
                </m.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-14 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <div className="rounded-3xl bg-ink p-5 text-white sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Smart picks</p>
          <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">The catalog reacts to your search and cart.</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">{assistantCopy}</p>
          <button
            type="button"
            onClick={() => applySmartSearch("", "All")}
            className="mt-6 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-accent/85"
          >
            Reset catalog
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {recommendedProducts.map((product) => (
            <m.article
              key={product.id}
              layout
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg"
            >
              <button type="button" onClick={() => applySmartSearch(product.name)} className="block w-full text-left">
                <Image src={product.image} alt={product.name} width={420} height={320} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" />
                <span className="block p-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{product.category}</span>
                  <span className="mt-2 block min-h-12 text-sm font-semibold leading-5 text-ink">{product.name}</span>
                  <span className="mt-2 block font-display text-lg font-bold text-ink">{formatPrice(product.price)}</span>
                </span>
              </button>
            </m.article>
          ))}
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-6 md:grid-cols-[190px_1fr]">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">Catalog</p>
          <div>
            <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">Shop by need, room, or routine.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted">Filter the catalog, add products to cart, and send the order list directly to WhatsApp.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {catalogCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition ${
                  activeCategory === category ? "bg-ink text-white" : "bg-surface text-ink/70 hover:bg-ink hover:text-white"
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
              className="h-11 w-full rounded-full border border-ink/10 bg-surface px-5 text-sm font-medium text-ink outline-none transition focus:border-ink"
            />
          </label>
        </div>
        <p className="mt-4 text-sm font-semibold text-muted">
          {isLoading ? "Loading catalog..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} shown`}
        </p>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
                <div className="aspect-square animate-pulse bg-ink/10" />
                <div className="space-y-3 p-3 sm:p-4">
                  <div className="h-3 w-1/3 rounded-full bg-ink/10" />
                  <div className="h-5 w-4/5 rounded-full bg-ink/10" />
                  <div className="h-5 w-1/2 rounded-full bg-ink/10" />
                  <div className="h-10 rounded-full bg-ink/10 sm:h-11" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 grid min-h-60 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-ink">
                {selectedMarketplaceCategory ? `No ${selectedMarketplaceCategory.label} listings yet` : "No products found"}
              </p>
              <p className="mt-2 font-semibold text-muted">
                {selectedMarketplaceCategory
                  ? "Add this category from the admin panel or message us on WhatsApp to request a listing."
                  : "Try another category or clear the search."}
              </p>
              {selectedMarketplaceCategory && (
                <a
                  href={whatsappLink(`Hello Shopyacu, I want to ask about ${selectedMarketplaceCategory.label}.`)}
                  className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/85"
                >
                  Ask on WhatsApp
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const media: ProductMedia[] = product.media?.length
                ? product.media
                : (product.images?.length ? product.images : [product.image]).map((image) => ({ type: "image", url: image }));

              return (
                <m.article
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden bg-surface">
                    <Swiper
                      modules={[Navigation, Pagination, Keyboard, A11y]}
                      slidesPerView={1}
                      loop={media.length > 1}
                      speed={360}
                      grabCursor
                      keyboard={{ enabled: true }}
                      pagination={media.length > 1 ? { clickable: true } : false}
                      navigation={media.length > 1}
                      className="h-full w-full product-swiper"
                    >
                      {media.map((item, index) => (
                        <SwiperSlide key={item.url}>
                          <Link href={`/products/${product.slug}`} className="block h-full">
                            {item.type === "video" ? (
                              <video
                                src={item.url}
                                poster={item.poster || product.image}
                                muted
                                playsInline
                                loop
                                preload="metadata"
                                className="h-full w-full bg-black object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <Image src={item.url} alt={`${product.name}${index > 0 ? ` view ${index + 1}` : ""}`} width={700} height={700} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                            )}
                          </Link>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <span className="absolute left-2 top-2 z-10 hidden rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink sm:left-3 sm:top-3 sm:inline-block sm:px-3 sm:text-xs">
                      In stock
                    </span>
                    {product.badge && (
                      <span className="absolute right-2 top-2 z-10 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-ink sm:right-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted sm:text-xs sm:tracking-[0.18em]">{product.category}</p>
                    <Link href={`/products/${product.slug}`} className="mt-1.5 block min-h-10 text-sm font-semibold leading-5 text-ink hover:text-ink/70 sm:mt-2 sm:min-h-12 sm:text-base sm:leading-6">
                      {product.name}
                    </Link>
                    <p className="mt-2 font-display text-lg font-bold text-ink sm:mt-3 sm:text-xl">{formatPrice(product.price)}</p>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="mt-3 h-10 w-full rounded-full bg-ink text-sm font-semibold text-white transition hover:bg-ink/85 sm:mt-4 sm:h-11"
                    >
                      Add to cart
                    </button>
                  </div>
                </m.article>
              );
            })}
          </div>
        )}
      </section>

      <section id="instagram" className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 sm:px-6 md:grid-cols-[0.85fr_1fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">Instagram</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-ink md:text-5xl">Follow the newest arrivals from @shopyacu.</h2>
          <p className="mt-5 max-w-2xl leading-7 text-muted">
            See product videos, restocks, and daily-use demos directly from the Shopyacu Instagram profile.
          </p>
          <a href="https://www.instagram.com/shopyacu/" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex w-fit rounded-full border border-ink/20 bg-transparent px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white">
            Open Instagram
          </a>
        </div>
        <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-ink/10 bg-white p-5 shadow-xl">
          <blockquote
            className="instagram-media relative z-10 mx-auto w-full max-w-[540px]"
            data-instgrm-permalink="https://www.instagram.com/shopyacu/"
            data-instgrm-version="14"
          >
            <a href="https://www.instagram.com/shopyacu/" target="_blank" rel="noopener noreferrer">
              View @shopyacu on Instagram
            </a>
          </blockquote>
          <div className="absolute inset-5 z-0 grid place-items-center rounded-2xl border border-dashed border-ink/15 p-8 text-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">@shopyacu</p>
              <p className="mx-auto mt-3 max-w-sm font-display text-2xl font-bold leading-tight text-ink">Latest product drops, demos, and offers</p>
              <p className="mt-3 text-sm font-semibold text-muted">Instagram embed loading...</p>
            </div>
          </div>
        </div>
      </section>

      <section id="delivery" className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-accent">How ordering works</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">Simple cart, human confirmation.</h2>
            <p className="mt-5 max-w-xl leading-7 text-white/70">
              Choose products on the website, send your cart to WhatsApp, then confirm availability, delivery, and payment details with the seller.
            </p>
            <a href={whatsappLink()} className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink transition hover:bg-accent/85">
              Start WhatsApp order
            </a>
          </div>
          <div className="grid gap-4">
            {["Choose products", "Send cart", "Confirm delivery"].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="font-mono text-sm text-accent">0{index + 1}</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{step}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">Simple ordering built around WhatsApp confirmation and local delivery.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm font-medium text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-display text-xl font-bold tracking-tight text-ink">Shopyacu</p>
          <p className="mt-2 max-w-xl">Home, kitchen, bathroom, office, fitness, and outdoor essentials for everyday use.</p>
        </div>
        <p className="font-display text-lg font-bold text-ink">WhatsApp {whatsappDisplay}</p>
      </footer>

      <a
        href={whatsappLink()}
        className="fixed bottom-4 right-4 z-40 grid rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-2xl transition hover:bg-ink/85"
        aria-label="Order on WhatsApp"
      >
        <span className="text-[11px] uppercase tracking-[0.14em] text-accent">WhatsApp</span>
        <span>{whatsappDisplay}</span>
      </a>

      <div className="pointer-events-none fixed bottom-24 left-1/2 z-[60] max-w-[92vw] -translate-x-1/2" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <m.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-2xl"
            >
              {toast}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {cartOpen && (
          <m.div
            key="cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setCartOpen(false)}
          >
            <m.aside
              role="dialog"
              aria-modal="true"
              aria-label="Shopping cart"
              initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="ml-auto flex h-full w-full max-w-md flex-col bg-paper p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Checkout</p>
                <h2 className="font-display text-3xl font-bold text-ink">Your cart</h2>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart" className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl font-bold text-ink transition hover:bg-ink hover:text-white">&times;</button>
            </div>
            <p className="mt-4 rounded-xl bg-white p-3 text-sm font-semibold text-ink">
              {cartHydrated ? "Saved on this device, so refresh will not empty it." : "Loading saved cart..."}
            </p>
            <div className="mt-6 flex-1 space-y-4 overflow-auto">
              {cart.length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-sm font-medium text-muted">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-ink/10 pb-4">
                    <Image src={item.image} alt={item.name} width={84} height={84} className="h-20 w-20 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="mt-1 text-sm font-medium text-muted">Qty {item.quantity} - {formatPrice(item.price * item.quantity)}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => updateCartQuantity(item.id, -1)} className="grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-bold text-ink transition hover:bg-ink hover:text-white" aria-label={`Decrease ${item.name}`}>
                          -
                        </button>
                        <span className="min-w-8 text-center text-sm font-bold text-ink">{item.quantity}</span>
                        <button type="button" onClick={() => updateCartQuantity(item.id, 1)} className="grid h-8 w-8 place-items-center rounded-full bg-ink text-lg font-bold text-white transition hover:bg-ink/85" aria-label={`Increase ${item.name}`}>
                          +
                        </button>
                        <button type="button" onClick={() => removeFromCart(item.id)} className="ml-auto text-sm font-semibold text-ink/60 transition hover:text-ink">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-ink/10 pt-5">
              {cart.length > 0 && (
                <button type="button" onClick={clearCart} className="mb-3 text-sm font-semibold text-ink/60 transition hover:text-ink">
                  Clear cart
                </button>
              )}
              <div className="flex items-center justify-between font-display text-lg font-bold text-ink">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <a
                href={cart.length ? whatsappLink(whatsappText) : "#products"}
                className="mt-4 block rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-ink/85"
              >
                Send order on WhatsApp
              </a>
            </div>
            </m.aside>
          </m.div>
        )}
      </AnimatePresence>
    </main>
  );
}
