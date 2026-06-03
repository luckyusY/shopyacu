import { CollectionsManager } from "@/components/admin/CollectionsManager";
import { getProductCollections } from "@/lib/collections-store";
import { getProducts } from "@/lib/product-store";

export const metadata = { title: "Product collections | Shopyacu admin" };
export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const [products, collections] = await Promise.all([
    getProducts({ includeInactive: true }),
    getProductCollections({ includeInactive: true }),
  ]);

  return <CollectionsManager products={products} collections={collections} />;
}
