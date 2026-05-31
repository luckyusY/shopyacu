import { Storefront } from "@/components/Storefront";
import { getHiddenCategories } from "@/lib/category-visibility";
import { getProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, hiddenCategories] = await Promise.all([getProducts(), getHiddenCategories()]);
  return <Storefront products={products} hiddenCategories={hiddenCategories} />;
}
