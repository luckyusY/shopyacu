import { getProducts } from "@/lib/product-store";
import { getCategories } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Add product | Shopyacu admin" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const products = await getProducts({ includeInactive: true });
  const categories = getCategories(products).filter((category) => category !== "All");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Catalog"
        title="Add product"
        description="Media uploads to Cloudinary (signed), then syncs to MongoDB. The first image becomes the cover."
      />
      <div className="mt-6">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
