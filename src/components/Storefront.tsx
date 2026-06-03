"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { categoryPath, getCategoryShowcase, marketplaceCategories, type MarketplaceCategory } from "@/lib/categories";
import { formatPrice, getCategories, type Product, type ProductMedia } from "@/lib/products";
import { whatsappDisplay, whatsappLink } from "@/lib/whatsapp";
import { ProductCard, StarRow, productSignals } from "@/components/ProductCard";
import { Logo } from "@/components/Logo";
import { InstagramProfileCard } from "@/components/InstagramProfileCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackEvent } from "@/lib/track-client";
import type { InquirySource } from "@/lib/events-store";

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

type CategoryPromo = {
  headline: string;
  line: string;
  cta: string;
  tone: string;
  desktopClass: string;
  mobileClass: string;
  markClass: string;
};

const categoryPromos: Record<string, CategoryPromo> = {
  Fashion: {
    headline: "Fresh fits, clean finish.",
    line: "Shape, layer, and step out with pieces that do the quiet work.",
    cta: "Shop style",
    tone: "Style edit",
    desktopClass: "from-[#1b1f2a] via-[#2f3747] to-[#f97316]",
    mobileClass: "from-[#1b1f2a] to-[#f97316]",
    markClass: "bg-[#f97316] text-white",
  },
  Kitchen: {
    headline: "Kitchen upgrades that earn counter space.",
    line: "Appliances, prep tools, and daily helpers picked for busy homes.",
    cta: "Cook smarter",
    tone: "Kitchen picks",
    desktopClass: "from-[#12343b] via-[#1f6f6a] to-[#f5b700]",
    mobileClass: "from-[#12343b] to-[#f5b700]",
    markClass: "bg-[#f5b700] text-[#12343b]",
  },
  Bathroom: {
    headline: "Turn small spaces into tidy rituals.",
    line: "Shelves, racks, and organizers that make the morning rush calmer.",
    cta: "Organize now",
    tone: "Bathroom order",
    desktopClass: "from-[#17324d] via-[#3f7cac] to-[#d9f2f2]",
    mobileClass: "from-[#17324d] to-[#3f7cac]",
    markClass: "bg-[#d9f2f2] text-[#17324d]",
  },
  "Storage & Racks": {
    headline: "Give everything a proper place.",
    line: "Wardrobes, shelves, racks, and compact storage for rooms that work harder.",
    cta: "Find storage",
    tone: "Space makers",
    desktopClass: "from-[#242423] via-[#57564f] to-[#f2cc8f]",
    mobileClass: "from-[#242423] to-[#57564f]",
    markClass: "bg-[#f2cc8f] text-[#242423]",
  },
  Bedding: {
    headline: "Soft layers, warmer nights.",
    line: "Blankets and duvet sets in colors that make bedrooms feel finished.",
    cta: "Choose bedding",
    tone: "Bedroom comfort",
    desktopClass: "from-[#3b1f2b] via-[#8f4f65] to-[#f7c7a3]",
    mobileClass: "from-[#3b1f2b] to-[#8f4f65]",
    markClass: "bg-[#f7c7a3] text-[#3b1f2b]",
  },
  "Home Appliances": {
    headline: "The practical things that quietly save the day.",
    line: "Dispensers, ironing boards, and appliances made for daily use.",
    cta: "See appliances",
    tone: "Home utility",
    desktopClass: "from-[#233d4d] via-[#619b8a] to-[#fe7f2d]",
    mobileClass: "from-[#233d4d] to-[#619b8a]",
    markClass: "bg-[#fe7f2d] text-white",
  },
  Wedding: {
    headline: "Set the scene before the first photo.",
    line: "Decor, stage details, and event pieces with presence.",
    cta: "Plan decor",
    tone: "Event mood",
    desktopClass: "from-[#4a1942] via-[#893168] to-[#f2d0a9]",
    mobileClass: "from-[#4a1942] to-[#893168]",
    markClass: "bg-[#f2d0a9] text-[#4a1942]",
  },
  Outdoor: {
    headline: "Ready for rain, errands, and movement.",
    line: "Useful gear for outside days, deliveries, travel, and quick fixes.",
    cta: "Go outside",
    tone: "Out and about",
    desktopClass: "from-[#1b4332] via-[#40916c] to-[#ffd166]",
    mobileClass: "from-[#1b4332] to-[#40916c]",
    markClass: "bg-[#ffd166] text-[#1b4332]",
  },
  Furniture: {
    headline: "Small pieces with room energy.",
    line: "Functional accents that add storage, seating, and polish.",
    cta: "Style rooms",
    tone: "Room pieces",
    desktopClass: "from-[#2b2d42] via-[#8d99ae] to-[#ef233c]",
    mobileClass: "from-[#2b2d42] to-[#8d99ae]",
    markClass: "bg-[#ef233c] text-white",
  },
};

const fallbackPromo: CategoryPromo = {
  headline: "A sharper shelf for everyday finds.",
  line: "Browse the best of this category, grouped so the good stuff is easy to spot.",
  cta: "Explore",
  tone: "Curated aisle",
  desktopClass: "from-[#20232f] via-[#59606f] to-[#ff8a1d]",
  mobileClass: "from-[#20232f] to-[#59606f]",
  markClass: "bg-[#ff8a1d] text-white",
};

function CategoryGraphicStrip({
  category,
  items,
  marketplace,
  onSeeAll,
}: {
  category: string;
  items: Product[];
  marketplace?: MarketplaceCategory;
  onSeeAll: () => void;
}) {
  const promo = categoryPromos[category] || fallbackPromo;
  const leadImage = marketplace?.image || items[0]?.image || "/products/product-21.jpg";
  const secondImage = items[1]?.image || leadImage;
  const thirdImage = items[2]?.image || secondImage;
  const href = marketplace ? categoryPath(marketplace) : undefined;

  const content = (
    <>
      <span className={`hidden min-h-[88px] overflow-hidden rounded-2xl bg-gradient-to-r ${promo.desktopClass} text-white shadow-sm sm:grid sm:grid-cols-[1fr_240px]`}>
        <span className="relative z-10 flex min-w-0 items-center gap-4 px-5 py-4">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-xl font-black ${promo.markClass}`}>
            {category.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/70">{promo.tone}</span>
            <span className="mt-1 block truncate font-display text-2xl font-bold leading-tight">{promo.headline}</span>
            <span className="mt-1 block max-w-2xl truncate text-sm font-semibold text-white/78">{promo.line}</span>
          </span>
        </span>
        <span className="relative hidden overflow-hidden sm:block">
          <span className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black/35 to-transparent" />
          <Image src={leadImage} alt="" fill sizes="260px" className="object-cover opacity-90" />
          <span className="absolute bottom-3 left-5 z-20 rounded-full bg-white px-3 py-1 text-xs font-black text-ink shadow-sm">
            {promo.cta} <span aria-hidden>&rarr;</span>
          </span>
          <span className="absolute right-4 top-4 z-20 h-14 w-14 overflow-hidden rounded-xl border-2 border-white/85 bg-white shadow-md">
            <Image src={secondImage} alt="" fill sizes="64px" className="object-cover" />
          </span>
          <span className="absolute bottom-4 right-12 z-20 h-12 w-12 overflow-hidden rounded-xl border-2 border-white/85 bg-white shadow-md">
            <Image src={thirdImage} alt="" fill sizes="56px" className="object-cover" />
          </span>
        </span>
      </span>

      <span className={`relative flex min-h-16 overflow-hidden rounded-xl bg-gradient-to-r ${promo.mobileClass} text-white shadow-sm sm:hidden`}>
        <span className="relative z-10 flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-base font-black ${promo.markClass}`}>
            {category.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[10px] font-black uppercase tracking-[0.14em] text-white/70">{promo.tone}</span>
            <span className="mt-0.5 block truncate text-sm font-black leading-5">{category}</span>
          </span>
        </span>
        <span className="absolute inset-y-0 right-0 w-28">
          <Image src={leadImage} alt="" fill sizes="112px" className="object-cover opacity-55" />
          <span className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        </span>
      </span>
    </>
  );

  return href ? (
    <Link href={href} className="mb-4 block focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onSeeAll} className="mb-4 block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
      {content}
    </button>
  );
}

function CategoryRow({
  category,
  items,
  marketplace,
  onAddToCart,
  onSeeAll,
}: {
  category: string;
  items: Product[];
  marketplace?: MarketplaceCategory;
  onAddToCart: (product: Product) => void;
  onSeeAll: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = Math.min(node.clientWidth * 0.85, 540);
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  // Both the top pill and the mobile footer button lead to the same place
  // (the full category page, or the in-page filter when there is no page).
  const renderSeeAll = (className: string, label: ReactNode) =>
    marketplace ? (
      <Link href={categoryPath(marketplace)} className={className}>
        {label}
      </Link>
    ) : (
      <button type="button" onClick={onSeeAll} className={className}>
        {label}
      </button>
    );

  const hasMore = items.length > 4;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden rounded-[1.75rem] border-2 border-ink/15 bg-white shadow-sm transition hover:border-ink/25 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 bg-gradient-to-r from-surface to-white px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink font-display text-lg font-black text-accent sm:h-11 sm:w-11">
            {category.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold leading-tight text-ink sm:text-2xl">{category}</h3>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-bold text-ink/70">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
              {marketplace?.tag ? <span className="hidden truncate text-ink/45 sm:inline">{marketplace.tag}</span> : null}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label={`Scroll ${category} left`}
            className="hidden h-9 w-9 place-items-center rounded-full border border-ink/15 text-lg font-bold text-ink transition hover:bg-ink hover:text-white lg:grid"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label={`Scroll ${category} right`}
            className="hidden h-9 w-9 place-items-center rounded-full border border-ink/15 text-lg font-bold text-ink transition hover:bg-ink hover:text-white lg:grid"
          >
            &rsaquo;
          </button>
          {renderSeeAll(
            "inline-flex items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-xs font-bold text-ink shadow-sm transition hover:bg-ink hover:text-white sm:px-4 sm:text-sm",
            <>
              See all <span aria-hidden>&rarr;</span>
            </>,
          )}
        </div>
      </div>

      <div className="relative px-4 pb-4 pt-4 sm:px-6">
        <CategoryGraphicStrip category={category} items={items} marketplace={marketplace} onSeeAll={onSeeAll} />

        {/* Edge fades hint that the row scrolls horizontally (large screens only). */}
        <span className="pointer-events-none absolute bottom-4 left-4 top-[7.75rem] z-10 hidden w-6 bg-gradient-to-r from-white to-transparent lg:block" />
        <span className="pointer-events-none absolute bottom-4 right-4 top-[7.75rem] z-10 hidden w-12 bg-gradient-to-l from-white to-transparent lg:block" />

        {/*
          Mobile: a clean 2-column grid showing 4 products per category (no
          horizontal scroll). Large screens: a snap scroll row of up to 14.
        */}
        <div
          ref={scrollerRef}
          className="-mx-1 grid grid-cols-2 gap-3 px-1 lg:flex lg:snap-x lg:snap-mandatory lg:overflow-x-auto lg:pb-2 lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
        >
          {items.slice(0, 14).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              hideOnMobile={index >= 4}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Mobile only shows 4 cards, so make "see the rest" obvious per section. */}
        {hasMore
          ? renderSeeAll(
              "mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white lg:hidden",
              <>
                See all {items.length} in {category} <span aria-hidden>&rarr;</span>
              </>,
            )
          : null}
      </div>
    </m.div>
  );
}

export function Storefront({
  products,
  hiddenCategories = [],
}: {
  products: Product[];
  hiddenCategories?: string[];
}) {
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
  // Catalog chips now reflect categories that actually have products, so empty
  // marketplace categories (e.g. Cars for Sale when the DB is not connected) no
  // longer render a chip that leads to an empty state.
  const catalogCategories = useMemo(() => storeCategories, [storeCategories]);
  const visibleMarketplaceCategories = useMemo(
    () => marketplaceCategories.filter((category) => !hiddenCategories.includes(category.category)),
    [hiddenCategories],
  );
  const selectedMarketplaceCategory = visibleMarketplaceCategories.find((item) => item.category === activeCategory);
  const categoryShowcase = useMemo(
    () => getCategoryShowcase(products).filter((category) => !hiddenCategories.includes(category.category)),
    [hiddenCategories, products],
  );
  const categoryBannerItems = categoryShowcase.filter((item) => ["Wedding", "Cars for Sale", "Home"].includes(item.category));

  // Group products by category and order marketplace categories first so the
  // homepage renders one "aisle" (section) per category, Jumia-style.
  const productsByCategory = useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const product of products) {
      const list = groups.get(product.category) || [];
      list.push(product);
      groups.set(product.category, list);
    }

    const order = visibleMarketplaceCategories.map((category) => category.category);
    return Array.from(groups.entries()).sort((a, b) => {
      const indexA = order.indexOf(a[0]);
      const indexB = order.indexOf(b[0]);
      const rankA = indexA === -1 ? order.length : indexA;
      const rankB = indexB === -1 ? order.length : indexB;
      if (rankA !== rankB) return rankA - rankB;
      return b[1].length - a[1].length;
    });
  }, [products, visibleMarketplaceCategories]);

  // Featured products to rotate through the Jumia-style flash-sale hero banner.
  const bannerProducts = useMemo(() => {
    const featured = products.filter((product) => product.badge);
    return (featured.length ? featured : products).slice(0, 5);
  }, [products]);

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

  const whatsappText =
    `Hello Shopyacu, I want to order:\n${cart
      .map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`)
      .join("\n")}\nTotal: ${formatPrice(cartTotal)}`;

  const trackWa = (source: InquirySource) => trackEvent("inquiry", { source });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-white shadow-sm">
        <div className="bg-ink px-4 py-2 text-center text-xs font-semibold tracking-wide text-white/80">
          Orders confirmed on WhatsApp <span className="text-accent">{whatsappDisplay}</span>
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-ink">
            <Logo priority imgClassName="h-[40px] w-[128px] object-contain sm:h-9 sm:w-auto" />
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55 sm:inline">store</span>
          </Link>
          <form onSubmit={submitSearch} className="hidden min-w-[280px] flex-1 items-center rounded-full border border-ink/10 bg-surface p-1 shadow-sm lg:flex xl:max-w-lg">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search caddy, air fryer, laptop table..."
              aria-label="Search Shopyacu products"
              className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm font-medium text-ink outline-none placeholder:text-ink/40"
            />
            <button type="submit" className="h-10 rounded-full bg-ink px-5 text-sm font-bold text-white transition hover:bg-ink/85">
              Search
            </button>
          </form>
          <nav className="hidden items-center gap-6 text-sm font-bold text-ink/75 md:flex">
            <a className="transition hover:text-accent" href="#categories">Categories</a>
            <a className="transition hover:text-accent" href="#products">Products</a>
            <Link className="transition hover:text-accent" href="/courses">Courses</Link>
            <a className="transition hover:text-accent" href="#delivery">How it works</a>
            <Link className="transition hover:text-accent" href="/blog">Blog</Link>
            <a className="transition hover:text-accent" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={whatsappLink("Hello Shopyacu, I would like to order. Can you help me?")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWa("header")}
              className="hidden h-11 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#1fb458] sm:flex sm:px-5"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="h-11 rounded-full border border-ink/15 px-4 text-sm font-bold text-ink transition hover:bg-ink hover:text-white md:hidden"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative h-11 rounded-full bg-ink px-4 text-sm font-bold text-white transition hover:bg-ink/85 sm:px-5"
            >
              Cart
              {itemCount > 0 && (
                <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">{itemCount}</span>
              )}
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 lg:hidden">
          <form onSubmit={submitSearch} className="flex items-center rounded-full border border-ink/10 bg-surface p-1 shadow-sm">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search Shopyacu products"
              className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm font-medium text-ink outline-none placeholder:text-ink/40"
            />
            <button type="submit" className="h-10 shrink-0 rounded-full bg-ink px-5 text-sm font-bold text-white transition hover:bg-ink/85">
              Search
            </button>
          </form>
        </div>
        {isMenuOpen && (
          <div className="grid gap-2 border-t border-ink/10 bg-white px-4 py-3 md:hidden">
            {[
              ["Categories", "#categories"],
              ["Products", "#products"],
              ["Courses", "/courses"],
              ["How it works", "#delivery"],
              ["Blog", "/blog"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-sm"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Jumia-style quick category strip for phones/tablets (sidebar is lg+). */}
      <div className="border-b border-ink/10 bg-white lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleMarketplaceCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={categoryPath(cat)}
              className="shrink-0 rounded-full border border-ink/15 bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink/80 transition hover:border-accent hover:bg-accent hover:text-white"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[212px_1fr_248px]">
          {/* Left: Jumia-style category sidebar */}
          <aside className="hidden rounded-2xl border border-ink/10 bg-white p-2 lg:block">
            <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Categories</p>
            <ul>
              {visibleMarketplaceCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={categoryPath(cat)}
                    className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-ink/80 transition hover:bg-accent/10 hover:text-accent"
                  >
                    <span>{cat.label}</span>
                    <span aria-hidden className="text-ink/30 transition group-hover:text-accent">&rsaquo;</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Center: flash-sale banner carousel */}
          <div className="min-w-0">
            <Swiper
              modules={[Autoplay, Pagination, A11y, Keyboard]}
              slidesPerView={1}
              loop={bannerProducts.length > 1}
              autoplay={reduceMotion ? false : { delay: 4200, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              keyboard={{ enabled: true }}
              speed={500}
              className="h-full overflow-hidden rounded-2xl"
            >
              {bannerProducts.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <div className="relative min-h-[340px] overflow-hidden bg-ink text-white sm:min-h-[400px]">
                    {/* Full-bleed photography image, visible on every screen size */}
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      priority={index === 0}
                      sizes="(min-width:1024px) 70vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
                    <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent sm:hidden" />
                    <div className="relative flex min-h-[340px] flex-col justify-end gap-3 p-6 sm:min-h-[400px] sm:max-w-lg sm:justify-center sm:p-10">
                      <span className="w-fit rounded-md bg-accent px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-ink">Flash sale &#9889;</span>
                      <h1 className="max-w-md font-display text-2xl font-black leading-tight drop-shadow-sm sm:text-4xl">{product.name}</h1>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="rounded-lg bg-white px-3 py-1.5 font-display text-xl font-black text-ink sm:text-2xl">{formatPrice(product.price)}</span>
                        <span className="text-sm font-semibold text-white/65 line-through decoration-2 decoration-accent">{formatPrice(Math.round(product.price * 1.4))}</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Limited stock &middot; Local delivery &middot; WhatsApp checkout</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Link href={`/products/${product.slug}`} className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-accent/85">
                          Shop now
                        </Link>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="rounded-full border border-white/40 bg-white/5 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-ink"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-ink">
                      {product.badge || "Hot deal"}
                    </span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Right: info / promo cards */}
          <aside className="hidden flex-col gap-3 lg:flex">
            <a
              href={whatsappLink("Hello Shopyacu, I would like to order. Can you help me?")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWa("hero")}
              className="flex items-center gap-3 rounded-2xl bg-[#25D366] p-4 text-white shadow-sm transition hover:bg-[#1fb458]"
            >
              <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black">Order on WhatsApp</span>
                <span className="block truncate text-xs font-semibold text-white/85">Pay after delivery · WISHYURA BIKUGEZEHO</span>
              </span>
            </a>
            <div className="rounded-2xl border border-ink/10 bg-white p-4">
              <p className="text-sm font-bold text-ink">Top rated, best prices</p>
              <p className="mt-1 text-xs font-medium leading-5 text-muted">Hand-picked products for everyday Kigali homes.</p>
            </div>
            <a href="#shop" className="rounded-2xl bg-ink p-4 text-white transition hover:bg-ink/90">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Up to 40% off</span>
              <span className="mt-1 block font-display text-xl font-black">Daily deals</span>
              <span className="mt-2 inline-block text-xs font-bold underline">Shop categories</span>
            </a>
          </aside>
        </div>

        {/* Trending + quick searches under the hero */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Trending:</span>
          {quickSearches.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => applySmartSearch(item.query, item.category)}
              className="rounded-full border border-ink/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-ink hover:text-ink"
            >
              {item.label}
            </button>
          ))}
          {searchSuggestions.slice(0, 3).map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => applySmartSearch(product.name)}
              className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-ink hover:text-white"
            >
              {product.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span key={item} className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70">
              {item}
            </span>
          ))}
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
                <a
                  href={whatsappLink("Hello Shopyacu, I would like to order. Can you help me?")}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackWa("hero")}
                  className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1fb458]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Order on WhatsApp
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:relative sm:min-h-[280px]">
              {categoryBannerItems.map((item, index) => (
                <m.div
                  key={item.category}
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
                  className={`relative aspect-square overflow-hidden rounded-full border-4 border-white/80 bg-white shadow-2xl transition sm:absolute ${
                    index === 0
                      ? "sm:left-8 sm:top-5 sm:h-52 sm:w-52"
                      : index === 1
                        ? "sm:right-12 sm:top-0 sm:h-48 sm:w-48"
                        : "sm:bottom-0 sm:left-1/2 sm:h-44 sm:w-44 sm:-translate-x-1/2"
                  }`}
                >
                  <Link href={categoryPath(item)} className="group block h-full w-full outline-none focus-visible:ring-4 focus-visible:ring-accent/70">
                    <Image
                      src={item.image}
                      alt={`${item.label} category`}
                      fill
                      sizes="(min-width: 1024px) 220px, 30vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 px-2 pb-3 text-center sm:px-4 sm:pb-5">
                      <span className="block font-display text-xs font-bold leading-tight sm:text-lg">{item.label}</span>
                      <span className="mt-1 block text-[10px] font-bold text-white/85 sm:text-xs">{item.listingCount ? `${item.listingCount} live` : item.tag}</span>
                    </span>
                  </Link>
                </m.div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-4 pr-4">
              {categoryShowcase.map((item, index) => (
                <m.div
                  key={item.category}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.24, delay: Math.min(index * 0.02, 0.16), ease: "easeOut" }}
                  whileHover={reduceMotion ? undefined : { y: -5 }}
                  className="w-24 shrink-0 text-center sm:w-32"
                >
                  <Link href={categoryPath(item)} className="group block outline-none">
                    <span className="relative mx-auto block h-20 w-20 overflow-hidden rounded-full border-4 border-white/80 bg-white shadow-lg ring-1 ring-black/10 transition group-hover:border-accent group-focus-visible:ring-4 group-focus-visible:ring-accent/70 sm:h-28 sm:w-28">
                      <Image
                        src={item.image}
                        alt={`${item.label} category`}
                        fill
                        sizes="128px"
                        className="object-cover transition duration-500 group-hover:scale-110"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-80" />
                    </span>
                    <span className="mt-2 block text-xs font-bold leading-4 text-white sm:mt-3 sm:text-sm sm:leading-5">{item.label}</span>
                    <span className="mt-1 block text-[11px] font-semibold text-white/60 sm:text-xs">{item.listingCount ? `${item.listingCount} live` : item.tag}</span>
                  </Link>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Shop by category
            </span>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-[1.05] text-ink sm:text-4xl md:text-5xl">
              Every category, its own aisle.
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-muted">
              Browse the first picks in each category, then tap <span className="font-semibold text-ink">See all</span> to open the full collection.
            </p>
          </div>
          <a
            href={whatsappLink("Hello Shopyacu, I'm looking for a specific product. Can you help me find it?")}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackWa("category")}
            className="hidden w-fit shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1fb458] sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Can&apos;t find it? Ask on WhatsApp
          </a>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {productsByCategory.map(([category, items]) => (
            <CategoryRow
              key={category}
              category={category}
              items={items}
              marketplace={visibleMarketplaceCategories.find((entry) => entry.category === category)}
              onAddToCart={addToCart}
              onSeeAll={() => applySmartSearch("", category)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
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
          {recommendedProducts.map((product) => {
            const { rating, reviews, discount } = productSignals(product.id);
            const original = Math.round(product.price * (1 + discount / 100));
            return (
              <m.article
                key={product.id}
                layout
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="group relative overflow-hidden rounded-2xl border-2 border-ink/10 bg-white shadow-sm transition-all duration-200 hover:border-accent/60 hover:shadow-lg"
              >
                <span className="absolute left-2 top-2 z-10 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                  -{discount}%
                </span>
                <button type="button" onClick={() => applySmartSearch(product.name)} className="block w-full text-left">
                  <span className="block overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={420}
                      height={320}
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </span>
                  <span className="block p-4">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{product.category}</span>
                    <span className="mt-2 block min-h-12 text-sm font-semibold leading-5 text-ink">{product.name}</span>
                    <span className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-lg font-bold text-ink">{formatPrice(product.price)}</span>
                      <span className="text-[11px] font-semibold text-ink/45 line-through decoration-2 decoration-rose-500/80">{formatPrice(original)}</span>
                    </span>
                    <StarRow rating={rating} reviews={reviews} />
                  </span>
                </button>
              </m.article>
            );
          })}
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
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackWa("category")}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1fb458]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
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

      <InstagramProfileCard />

      <section id="delivery" className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-accent">How ordering works</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">Simple cart, human confirmation.</h2>
            <p className="mt-5 max-w-xl leading-7 text-white/70">
              Choose products on the website, send your cart to WhatsApp, then confirm availability, delivery, and payment details with the seller.
            </p>
            <a
              href={whatsappLink("Hello Shopyacu, I would like to start an order. Can you help me?")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWa("hero")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1fb458]"
            >
              <WhatsAppIcon className="h-5 w-5" />
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

      <footer id="contact" className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm font-medium text-muted sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div>
          <Logo imgClassName="h-8" />
          <p className="mt-3 max-w-xl">Home, kitchen, bathroom, office, fitness, and outdoor essentials for everyday use in Kigali. Order on WhatsApp with pay-on-delivery.</p>
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink/70">
            <Link href="/categories" className="transition hover:text-accent">Categories</Link>
            <Link href="/blog" className="transition hover:text-accent">Blog</Link>
            <a href="#products" className="transition hover:text-accent">Products</a>
            <a href="#delivery" className="transition hover:text-accent">How it works</a>
          </nav>
        </div>
        <p className="font-display text-lg font-bold text-ink">WhatsApp {whatsappDisplay}</p>
      </footer>

      {/* The persistent WhatsApp CTA on this page is the global FloatingSupport
          widget; a second fixed link here would overlap it bottom-right. */}

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
                target={cart.length ? "_blank" : undefined}
                rel={cart.length ? "noreferrer" : undefined}
                onClick={() => {
                  if (cart.length) trackWa("cart");
                }}
                className={`mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-center text-sm font-black text-white shadow-lg transition ${
                  cart.length ? "bg-[#25D366] hover:bg-[#1fb458]" : "bg-ink/40"
                }`}
              >
                <WhatsAppIcon className="h-5 w-5" />
                {cart.length ? "Send order on WhatsApp" : "Add items to order"}
              </a>
              {cart.length ? (
                <p className="mt-2 text-center text-xs font-semibold text-muted">
                  Pay after delivery · WISHYURA BIKUGEZEHO
                </p>
              ) : null}
            </div>
            </m.aside>
          </m.div>
        )}
      </AnimatePresence>
    </main>
  );
}
