import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ProductCard } from "@/components/ProductCard";
import { ShareActions } from "@/components/ShareActions";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getProductCollectionBySlug, getProductCollections } from "@/lib/collections-store";
import { getProducts } from "@/lib/product-store";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const collections = await getProductCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getProductCollectionBySlug(slug);

  if (!collection) return { title: "Collection not found | Shopyacu" };

  return {
    title: `${collection.title} | Shopyacu`,
    description: collection.description || `Browse ${collection.title} on Shopyacu.`,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getProductCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const allProducts = await getProducts();
  const productMap = new Map(allProducts.map((product) => [product.slug, product]));
  const collectionProducts = collection.productSlugs.flatMap((productSlug) => {
    const product = productMap.get(productSlug);
    return product ? [product] : [];
  });
  const cover = collectionProducts[0]?.image || "/logo.png";
  const message = `Hello Shopyacu, I am interested in this product group: ${collection.title}. Can you help me order?`;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Logo priority imgClassName="h-10 w-[130px] object-contain sm:w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/#products" className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-white">
              All products
            </Link>
            <a href={whatsappLink(message)} className="hidden rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#1fb458] sm:inline-flex">
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">Shopyacu collection</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">{collection.title}</h1>
          {collection.description ? (
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-muted">{collection.description}</p>
          ) : (
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-muted">
              A hand-picked group of products prepared for easy browsing and WhatsApp ordering.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm">
              {collectionProducts.length} {collectionProducts.length === 1 ? "product" : "products"}
            </span>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">
              Pay after delivery
            </span>
            <a href={whatsappLink(message)} className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1fb458]">
              <WhatsAppIcon className="h-5 w-5" />
              Order this group
            </a>
          </div>
          <ShareActions
            compact
            title={`${collection.title} | Shopyacu`}
            text={collection.description || `Browse ${collection.title} on Shopyacu.`}
            path={`/collections/${collection.slug}`}
            className="mt-5 max-w-xl"
          />
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-ink shadow-xl sm:min-h-[430px]">
          <Image src={cover} alt={collection.title} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex gap-2">
            {collectionProducts.slice(0, 4).map((product) => (
              <span key={product.slug} className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-white bg-white shadow-md sm:h-20 sm:w-20">
                <Image src={product.image} alt="" fill sizes="80px" className="object-cover" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          WISHYURA BIKUGEZEHO: pay after delivery. Confirm availability and delivery on WhatsApp before payment.
        </div>
        {collectionProducts.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {collectionProducts.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={index}
                fluid
                productHref={`/products/${product.slug}?fromCollection=${collection.slug}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-ink">No products in this collection</p>
              <p className="mt-2 text-sm font-semibold text-muted">The collection exists, but its selected products are not currently visible.</p>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-ink px-5 py-6 text-center text-white shadow-xl sm:px-8 sm:py-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Keep browsing</p>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Want to see everything?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-white/70">
            Open the full Shopyacu catalog to compare more products, categories, and new arrivals.
          </p>
          <Link
            href="/#products"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-7 text-sm font-black text-ink transition hover:bg-white sm:w-auto"
          >
            See all products
          </Link>
        </div>
      </section>
    </main>
  );
}
