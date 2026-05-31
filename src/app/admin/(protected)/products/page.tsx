import { getProducts } from "@/lib/product-store";
import { getHiddenCategories } from "@/lib/category-visibility";
import { ProductsManager } from "@/components/admin/ProductsManager";

export const metadata = { title: "Products | Shopyacu admin" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, hiddenCategories] = await Promise.all([
    getProducts({ includeInactive: true }),
    getHiddenCategories(),
  ]);
  return <ProductsManager products={products} hiddenCategories={hiddenCategories} />;
}
