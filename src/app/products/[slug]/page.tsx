import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/product-store";
import { formatPrice, products } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";

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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const related = allProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const media = product.media?.length ? product.media : [{ type: "image" as const, url: product.image }];

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
            Shopyacu
          </Link>
          <Link href="/#products" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/85">
            Back to products
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:px-8 lg:py-10">
        <div className="grid gap-3">
          {media.map((item, index) => (
            <div key={`${item.url}-${index}`} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              {item.type === "video" ? (
                <video
                  src={item.url}
                  poster={item.poster || product.image}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-square h-auto w-full bg-black object-cover"
                />
              ) : (
                <Image src={item.url} alt={`${product.name}${index > 0 ? ` view ${index + 1}` : ""}`} width={1000} height={1000} priority={index === 0} className="aspect-square h-auto w-full object-cover" />
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-center">
          <p className="inline-flex w-fit items-center rounded-full bg-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{product.category}</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{product.name}</h1>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{formatPrice(product.price)}</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{product.description}</p>
          <div className="mt-5 grid gap-2.5 text-sm font-semibold text-ink/70 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink/10 bg-white p-3.5 shadow-sm">Local delivery</div>
            <div className="rounded-2xl border border-ink/10 bg-white p-3.5 shadow-sm">WhatsApp confirmation</div>
            <div className="rounded-2xl border border-ink/10 bg-white p-3.5 shadow-sm">Quality checked</div>
          </div>
          <a
            href={whatsappLink(`Hello Shopyacu, I want to order ${product.name} (${formatPrice(product.price)}).`)}
            className="mt-5 inline-flex w-fit rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white transition hover:bg-ink/85"
          >
            Order on WhatsApp
          </a>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} fluid />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
