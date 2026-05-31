import { getProducts } from "@/lib/product-store";
import { ProductsManager } from "@/components/admin/ProductsManager";

export const metadata = { title: "Products | Shopyacu admin" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts({ includeInactive: true });
  return <ProductsManager products={products} />;
}
