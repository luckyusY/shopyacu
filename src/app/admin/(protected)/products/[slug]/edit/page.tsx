import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/product-store";
import { formatPrice, getCategories } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { Badge, PageHeader } from "@/components/admin/ui";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `Edit ${product.name} | Shopyacu admin` : "Edit product | Shopyacu admin" };
}

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, products] = await Promise.all([
    getProductBySlug(slug),
    getProducts({ includeInactive: true }),
  ]);

  if (!product) notFound();

  const categories = getCategories(products).filter((category) => category !== "All");

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/products" className="text-sm font-semibold text-muted transition hover:text-ink">
        ← Back to products
      </Link>
      <div className="mt-3">
        <PageHeader
          eyebrow="Edit product"
          title={product.name}
          description={`${formatPrice(product.price)} · ${product.category}`}
          actions={
            <>
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-white"
              >
                View on store ↗
              </Link>
              <DeleteProductButton slug={product.slug} name={product.name} />
            </>
          }
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={product.active === false ? "rose" : "emerald"}>
          {product.active === false ? "Hidden" : "Live"}
        </Badge>
        <Badge tone={product.stock === "Out of stock" ? "rose" : product.stock === "Low stock" ? "amber" : "neutral"}>
          {product.stock || "In stock"}
        </Badge>
        {product.featured ? <Badge tone="accent">Featured</Badge> : null}
      </div>

      <div className="mt-6">
        <ProductForm mode="edit" categories={categories} product={product} />
      </div>
    </div>
  );
}
