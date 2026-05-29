import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProduct, products } from "@/lib/products";

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
    <main className="min-h-screen bg-[#f7f4ef] text-[#1f2933]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-black tracking-[0.08em] text-[#0f3d3e]">
            SHOPYACU
          </Link>
          <Link href="/#products" className="rounded-full bg-[#0f3d3e] px-5 py-3 text-sm font-black text-white">
            Back to products
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-[8px] bg-white shadow-sm">
          <Image src={product.image} alt={product.name} width={1000} height={1000} priority className="aspect-square h-auto w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d25f36]">{product.category}</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#13292f] sm:text-6xl">{product.name}</h1>
          <p className="mt-5 text-3xl font-black text-[#0f3d3e]">{formatPrice(product.price)}</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#51616f]">{product.description}</p>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-[#435466] sm:grid-cols-3">
            <div className="bg-white p-4">Local delivery</div>
            <div className="bg-white p-4">WhatsApp confirmation</div>
            <div className="bg-white p-4">Quality checked</div>
          </div>
          <a
            href={`https://wa.me/250788000000?text=${encodeURIComponent(`Hello Shopyacu, I want to order ${product.name} (${formatPrice(product.price)}).`)}`}
            className="mt-8 inline-flex w-fit rounded-full bg-[#d25f36] px-7 py-4 text-sm font-black text-white transition hover:bg-[#b94f2d]"
          >
            Order on WhatsApp
          </a>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#13292f]">Related products</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="overflow-hidden rounded-[8px] bg-white shadow-sm">
                <Image src={item.image} alt={item.name} width={500} height={500} className="aspect-square w-full object-cover" />
                <div className="p-4">
                  <p className="font-black text-[#13292f]">{item.name}</p>
                  <p className="mt-1 font-black text-[#0f3d3e]">{formatPrice(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
