import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryPath, getCategoryShowcase, getMarketplaceCategory, marketplaceCategories } from "@/lib/categories";
import { getProducts } from "@/lib/product-store";
import { formatPrice } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return marketplaceCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getMarketplaceCategory(slug);

  if (!category) return { title: "Category not found | Shopyacu" };

  return {
    title: `${category.label} | Shopyacu`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getMarketplaceCategory(slug);

  if (!category) {
    notFound();
  }

  const products = await getProducts();
  const categoryProducts = products.filter((product) => product.category === category.category);
  const showcase = getCategoryShowcase(products);
  const relatedCategories = showcase.filter((item) => item.slug !== category.slug).slice(0, 6);
  const heroImage = categoryProducts[0]?.image || category.image;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
            Shopyacu
          </Link>
          <Link href="/categories" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/85">
            Categories
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">{category.tag}</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl md:text-6xl">{category.label}</h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-muted">{category.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm">
              {categoryProducts.length ? `${categoryProducts.length} live listings` : "Open for requests"}
            </span>
            <a href={whatsappLink(`Hello Shopyacu, I want to ask about ${category.label}.`)} className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-accent/85">
              Ask on WhatsApp
            </a>
          </div>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-ink shadow-xl sm:min-h-[430px]">
          <Image src={heroImage} alt={`${category.label} hero`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-accent">Shopyacu marketplace</span>
            <span className="mt-1 block font-display text-2xl font-bold">{category.label}</span>
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">Listings</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">Available in {category.label}</h2>
          </div>
          <Link href="/#categories" className="w-fit rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white">
            Back to category circles
          </Link>
        </div>

        {categoryProducts.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {categoryProducts.map((product) => (
              <article key={product.slug} className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
                <Link href={`/products/${product.slug}`} className="block">
                  <Image src={product.image} alt={product.name} width={700} height={700} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" />
                </Link>
                <div className="p-3 sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted sm:text-xs">{product.category}</p>
                  <Link href={`/products/${product.slug}`} className="mt-2 block min-h-10 text-sm font-semibold leading-5 text-ink hover:text-ink/70 sm:min-h-12 sm:text-base sm:leading-6">
                    {product.name}
                  </Link>
                  <p className="mt-2 font-display text-lg font-bold text-ink">{formatPrice(product.price)}</p>
                  <a
                    href={whatsappLink(`Hello Shopyacu, I want to ask about ${product.name} (${formatPrice(product.price)}).`)}
                    className="mt-3 inline-flex w-full justify-center rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink/85"
                  >
                    WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-ink/15 bg-white p-8 text-center">
            <div>
              <p className="font-display text-3xl font-bold text-ink">No {category.label} listings yet</p>
              <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-muted">
                This page is ready. Add listings from the admin panel, or let customers request this category directly on WhatsApp.
              </p>
              <a href={whatsappLink(`Hello Shopyacu, I want to ask about ${category.label}.`)} className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/85">
                Ask on WhatsApp
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">More categories</p>
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {relatedCategories.map((item) => (
            <Link key={item.slug} href={categoryPath(item)} className="w-24 shrink-0 text-center sm:w-32">
              <span className="relative mx-auto block h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-md ring-1 ring-ink/10 sm:h-28 sm:w-28">
                <Image src={item.image} alt={`${item.label} category`} fill sizes="128px" className="object-cover" />
              </span>
              <span className="mt-2 block text-xs font-bold leading-4 text-ink sm:text-sm sm:leading-5">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
