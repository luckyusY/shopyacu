import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProduct, products } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);

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
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

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

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <Image src={product.image} alt={product.name} width={1000} height={1000} priority className="aspect-square h-auto w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="inline-flex w-fit items-center rounded-full bg-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{product.category}</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-6xl">{product.name}</h1>
          <p className="mt-5 font-display text-3xl font-bold text-ink">{formatPrice(product.price)}</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{product.description}</p>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-ink/70 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">Local delivery</div>
            <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">WhatsApp confirmation</div>
            <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">Quality checked</div>
          </div>
          <a
            href={whatsappLink(`Hello Shopyacu, I want to order ${product.name} (${formatPrice(product.price)}).`)}
            className="mt-8 inline-flex w-fit rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white transition hover:bg-ink/85"
          >
            Order on WhatsApp
          </a>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink">Related products</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
                <Image src={item.image} alt={item.name} width={500} height={500} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="p-4">
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 font-display font-bold text-ink">{formatPrice(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
