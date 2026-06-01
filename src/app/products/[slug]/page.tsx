import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductLeadPopup } from "@/components/ProductLeadPopup";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { TrackProductView } from "@/components/TrackProductView";
import { ProductStickyBar } from "@/components/ProductStickyBar";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { LiveActivityBanner } from "@/components/LiveActivityBanner";
import { Logo } from "@/components/Logo";
import { InstagramProfileCard } from "@/components/InstagramProfileCard";
import { categoryPath, marketplaceCategories } from "@/lib/categories";
import { getProductBySlug, getProducts } from "@/lib/product-store";
import { formatPrice, products, type Product, type ProductMedia } from "@/lib/products";
import { whatsappDisplay, whatsappLink } from "@/lib/whatsapp";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | Shopyacu" };
  }

  return {
    title: `${product.name} | Shopyacu`,
    description: product.description,
  };
}

function productSignal(id: number) {
  const seed = (n: number) => {
    const x = Math.sin(n * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  return {
    rating: Math.round((4.1 + seed(id) * 0.8) * 10) / 10,
    reviews: Math.round(18 + seed(id + 17) * 520),
    discount: Math.round(8 + seed(id + 31) * 24),
    interested: Math.round(26 + seed(id + 53) * 690),
  };
}

function productText(product: Product) {
  return `${product.name} ${product.category} ${product.description} ${product.badge || ""}`.toLowerCase();
}

function relatedScore(current: Product, item: Product) {
  if (item.slug === current.slug) return -999;

  const currentWords = new Set(productText(current).split(/[^a-z0-9]+/).filter((word) => word.length > 3));
  const itemWords = productText(item).split(/[^a-z0-9]+/).filter((word) => word.length > 3);
  const overlap = itemWords.filter((word) => currentWords.has(word)).length;
  const sameCategory = item.category === current.category ? 18 : 0;
  const sameBadge = item.badge && item.badge === current.badge ? 8 : 0;
  const popularity = productSignal(item.id).interested / 80;

  return sameCategory + sameBadge + overlap * 3 + popularity;
}

function uniqueProducts(items: Product[]) {
  return Array.from(new Map(items.map((item) => [item.slug, item])).values());
}

function getMarketplacePath(categoryName: string) {
  const category = marketplaceCategories.find((item) => item.category === categoryName);
  return category ? categoryPath(category) : `/#products`;
}

function getGalleryMedia(product: Product): ProductMedia[] {
  const source = product.media?.length ? product.media : [{ type: "image" as const, url: product.image }];
  const media = Array.from(new Map(source.map((item) => [item.url, item])).values());
  const [cover, ...rest] = media;
  if (!cover) return [{ type: "image", url: product.image }];

  const videos = rest.filter((item) => item.type === "video");
  const images = rest.filter((item) => item.type === "image");

  if (cover.type === "video") return [cover, ...images, ...videos];
  return [cover, ...videos.slice(0, 1), ...images, ...videos.slice(1)];
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const media = getGalleryMedia(product);
  const signal = productSignal(product.id);
  const related = allProducts
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => relatedScore(product, b) - relatedScore(product, a))
    .slice(0, 8);
  const sameCategory = allProducts
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 8);
  const topSellers = allProducts
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => productSignal(b.id).interested - productSignal(a.id).interested)
    .slice(0, 8);
  const topRelated = uniqueProducts([...sameCategory, ...related, ...topSellers]).slice(0, 4);
  const categoryTags = uniqueProducts(allProducts)
    .filter((item) => item.slug !== product.slug)
    .map((item) => item.category)
    .filter((category, index, categories) => categories.indexOf(category) === index)
    .slice(0, 8);
  const featuredUpsells = uniqueProducts([...related, ...topSellers]).slice(0, 4);
  const originalPrice = Math.round(product.price * (1 + signal.discount / 100));
  const kinyarwandaTags = ["Yizewe", "Byihuse", "Kigali", "Bikugezeho", "Guhitamo"];
  const activityMessage = `🔥 ${signal.interested}+ people viewed this recently · ⚡ we reply in minutes`;

  return (
    <main className="min-h-screen bg-paper pb-28 text-ink lg:pb-0">
      <TrackProductView slug={product.slug} name={product.name} category={product.category} />
      <ProductLeadPopup productName={product.name} priceLabel={formatPrice(product.price)} slug={product.slug} image={product.image} />
      <ProductStickyBar name={product.name} slug={product.slug} category={product.category} priceLabel={formatPrice(product.price)} />
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Logo priority imgClassName="h-8" />
          </Link>
          <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted sm:flex">
            <span>{product.category}</span>
            <span className="h-1 w-1 rounded-full bg-ink/25" />
            <span>{signal.interested}+ interested</span>
          </div>
          <WhatsAppLink
            href={whatsappLink(`Hello Shopyacu, I want to order ${product.name} (${formatPrice(product.price)}).`)}
            track={{ slug: product.slug, name: product.name, category: product.category, source: "header" }}
            className="flex min-h-10 items-center gap-2 rounded-full bg-[#25D366] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1fb458] sm:px-5"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </WhatsAppLink>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-8 lg:py-10 [&>*]:min-w-0">
        <ProductGallery media={media} name={product.name} fallbackImage={product.image} />

        <div className="grid gap-4 sm:gap-5">
          <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={getMarketplacePath(product.category)} className="inline-flex rounded-full bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent">
                {product.category}
              </Link>
              {product.badge ? <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink">{product.badge}</span> : null}
              <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-ink/70">{signal.interested}+ interested</span>
            </div>

            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-ink sm:mt-4 sm:text-4xl lg:text-5xl">{product.name}</h1>

            <div className="mt-3 flex flex-wrap items-end gap-2.5 sm:mt-4 sm:gap-3">
              <span className="font-display text-3xl font-bold leading-none text-ink sm:text-4xl">{formatPrice(product.price)}</span>
              {product.price > 0 ? <span className="pb-1 text-sm font-semibold text-muted line-through decoration-2 decoration-rose-500/80">{formatPrice(originalPrice)}</span> : null}
              {product.price > 0 ? <span className="mb-0.5 rounded-full bg-accent px-3 py-1 text-xs font-black text-ink">Save {signal.discount}%</span> : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink/65 sm:mt-4 sm:text-sm">
              <span className="rounded-full bg-surface px-3 py-1.5">Rating {signal.rating}/5</span>
              <span className="rounded-full bg-surface px-3 py-1.5">{signal.reviews} interested</span>
              <span className="rounded-full bg-surface px-3 py-1.5">{signal.interested}+ interested people</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {kinyarwandaTags.map((tag) => (
                <span key={tag} className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-ink/70">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-ink/10 bg-surface p-2">
              {[
                [`${signal.interested}+`, "interested"],
                [`${signal.reviews}+`, "asked"],
                [`${signal.rating}/5`, "rating"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-white px-2 py-2 text-center">
                  <p className="font-display text-base font-bold leading-none text-ink">{value}</p>
                  <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-muted">{label}</p>
                </div>
              ))}
            </div>

            {product.stock === "Low stock" ? (
              <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                Selling fast - only a few left in Kigali.
              </p>
            ) : product.stock === "Out of stock" ? (
              <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
                Out of stock right now - message us to get notified or find a close alternative.
              </p>
            ) : null}

            <LiveActivityBanner message={activityMessage} />

            <WhatsAppLink
              href={whatsappLink(`Hello Shopyacu, I want to order ${product.name} (${formatPrice(product.price)}). Is it available and what is the delivery time?`)}
              track={{ slug: product.slug, name: product.name, category: product.category, source: "product_cta" }}
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-5 text-sm font-black text-white shadow-lg transition hover:bg-[#1fb458] active:scale-[0.99] animate-[ctaGlow_2.4s_ease-in-out_infinite] sm:min-h-14 sm:px-7 sm:text-base"
            >
              <WhatsAppIcon className="h-6 w-6" />
              Order on WhatsApp
            </WhatsAppLink>
            <WhatsAppLink
              href={whatsappLink(`Hello Shopyacu, I'm interested in ${product.name} (${formatPrice(product.price)}). Can you share your best price, delivery details, and availability?`)}
              track={{ slug: product.slug, name: product.name, category: product.category, source: "ask_question" }}
              className="mt-2.5 flex min-h-11 w-full items-center justify-center rounded-full border border-ink/15 bg-surface px-5 text-sm font-bold text-ink transition hover:bg-ink hover:text-white sm:min-h-12 sm:px-7"
            >
              Ask price &amp; availability first
            </WhatsAppLink>

            <ul className="mt-4 grid grid-cols-3 gap-2 sm:mt-5">
              {[
                ["COD", "Pay after delivery"],
                ["KGL", "Same-day delivery"],
                ["FAST", "Quick replies"],
              ].map(([icon, label]) => (
                <li key={label} className="grid min-h-16 content-center rounded-xl bg-surface px-2 py-2 text-center text-[0.68rem] font-bold leading-tight text-ink/80 sm:flex sm:min-h-0 sm:items-center sm:gap-2 sm:px-3 sm:text-left sm:text-xs">
                  <span className="mx-auto rounded-md bg-white px-1.5 py-0.5 text-[0.6rem] font-black text-ink sm:mx-0" aria-hidden>
                    {icon}
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs font-medium leading-6 text-muted">
              WISHYURA BIKUGEZEHO. A real person replies on WhatsApp at {whatsappDisplay}. No prepayment - confirm price, delivery, and availability before you pay.{" "}
              <Link href="/#products" className="font-semibold text-ink underline-offset-2 hover:underline">
                Keep shopping
              </Link>
            </p>

            <div className="mt-5 border-t border-ink/10 pt-5">
              <p className="text-base leading-7 text-muted">{product.description}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">How ordering works</p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                ["1", "Message us", "Tap WhatsApp and tell us what you want."],
                ["2", "Confirm details", "We confirm the price, delivery time, and availability."],
                ["3", "Pay after delivery", "WISHYURA BIKUGEZEHO - receive your item, check it, then pay."],
              ].map(([step, title, copy]) => (
                <li key={step} className="flex gap-3 rounded-xl bg-surface p-3 sm:bg-transparent sm:p-0">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-ink text-xs font-black text-accent">
                    {step}
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-ink">{title}</p>
                    <p className="mt-1 text-sm font-medium leading-6 text-muted">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {topRelated.length > 0 ? (
        <section className="mx-auto max-w-7xl px-3 pb-10 sm:px-6 sm:pb-12 lg:px-8">
          <div className="grid gap-4 rounded-2xl bg-ink p-4 text-white shadow-xl sm:gap-5 sm:rounded-[2rem] sm:p-7 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Top related products</p>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-4xl">Customers also love these picks.</h2>
              <p className="mt-4 text-sm font-medium leading-7 text-white/70">
                Hand-picked products that pair well with this one. Tap any item to view it, or message us and we&apos;ll help you choose.
              </p>
              <a href={whatsappLink(`Hello Shopyacu, I want help choosing the best option related to ${product.name}.`)} className="mt-5 inline-flex w-full justify-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink transition hover:bg-white sm:w-fit">
                Ask for advice
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {topRelated.map((item) => (
                <Link key={item.slug} href={`/products/${item.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-3 transition hover:bg-white hover:text-ink">
                  <Image src={item.image} alt={item.name} width={360} height={360} className="aspect-square w-full rounded-xl object-cover" />
                  <span className="mt-3 block min-h-10 text-sm font-bold leading-5">{item.name}</span>
                  <span className="mt-1 block text-sm font-semibold text-accent group-hover:text-ink">{formatPrice(item.price)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {featuredUpsells.length > 0 ? (
        <ProductRail
          title="Frequently bought together"
          eyebrow="Upsell picks"
          copy="Show shoppers the next useful item while they are already warm from your ad."
          products={featuredUpsells}
        />
      ) : null}

      {related.length > 0 ? (
        <ProductRail
          title={`More in ${product.category}`}
          eyebrow="Related products"
          copy="Same category options help buyers compare without leaving the buying flow."
          products={related}
        />
      ) : null}

      {topSellers.length > 0 ? (
        <ProductRail
          title="Top selling products"
          eyebrow="Popular now"
          copy="Use proven products as a second chance to convert visitors who are still deciding."
          products={topSellers}
        />
      ) : null}

      <section className="mx-auto max-w-7xl px-3 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">Shop by tag</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">More places to keep selling.</h2>
            </div>
            <a href={whatsappLink(`Hello Shopyacu, I want help choosing products related to ${product.name}.`)} className="w-full rounded-full bg-ink px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-ink/85 sm:w-fit">
              Ask for advice
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[product.category, ...(product.badge ? [product.badge] : []), ...categoryTags].slice(0, 10).map((tag) => (
              <Link key={tag} href={getMarketplacePath(tag)} className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm font-bold text-ink/75 transition hover:bg-ink hover:text-white">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InstagramProfileCard compact />

      <section className="bg-ink px-3 py-7 text-white sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Ready to close?</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Send this product to WhatsApp.</h2>
          </div>
          <WhatsAppLink
            href={whatsappLink(`Hello Shopyacu, I want to order ${product.name} (${formatPrice(product.price)}).`)}
            track={{ slug: product.slug, name: product.name, category: product.category, source: "product_cta" }}
            className="rounded-full bg-accent px-7 py-4 text-center text-sm font-bold text-ink transition hover:bg-white"
          >
            Order now
          </WhatsAppLink>
        </div>
      </section>
    </main>
  );
}

function ProductRail({
  eyebrow,
  title,
  copy,
  products,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  products: Product[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-3 pb-10 sm:px-6 sm:pb-12 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">{eyebrow}</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted">{copy}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {products.slice(0, 8).map((item, index) => (
          <ProductCard key={item.id} product={item} index={index} fluid />
        ))}
      </div>
    </section>
  );
}
