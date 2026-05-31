import { getProducts } from "@/lib/product-store";
import { getCategories } from "@/lib/products";
import { NewProductForm } from "@/components/admin/NewProductForm";

export const metadata = { title: "Add product | Shopyacu admin" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const products = await getProducts({ includeInactive: true });
  const categories = getCategories(products).filter((category) => category !== "All");
  return <NewProductForm categories={categories} />;
}
