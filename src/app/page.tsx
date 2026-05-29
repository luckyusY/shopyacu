import { Storefront } from "@/components/Storefront";
import { products } from "@/lib/products";

export default function Home() {
  return <Storefront products={products} />;
}
