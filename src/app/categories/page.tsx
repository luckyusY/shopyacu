import Image from "next/image";
import Link from "next/link";
import { categoryPath, getCategoryShowcase } from "@/lib/categories";
import { getProducts } from "@/lib/product-store";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop Categories | Shopyacu",
  description: "Browse Shopyacu marketplace categories including home, cars, weddings, jobs, scholarships, pets, and services.",
};

export default async function CategoriesPage() {
  const products = await getProducts();
  const categories = getCategoryShowcase(products);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Logo imgClassName="h-8" />
          </Link>
          <Link href="/#products" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/85">
            All products
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">Categories</p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-tight text-ink sm:text-5xl md:text-6xl">
          Browse Shopyacu by need, event, vehicle, service, or opportunity.
        </h1>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.slug} href={categoryPath(category)} className="group text-center">
              <span className="relative mx-auto block h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg ring-1 ring-ink/10 transition group-hover:-translate-y-1 group-hover:border-accent sm:h-36 sm:w-36">
                <Image src={category.image} alt={`${category.label} category`} fill sizes="160px" className="object-cover transition duration-500 group-hover:scale-110" />
              </span>
              <span className="mt-3 block font-display text-lg font-bold leading-tight text-ink">{category.label}</span>
              <span className="mt-1 block text-sm font-semibold text-muted">{category.listingCount ? `${category.listingCount} live` : category.tag}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
