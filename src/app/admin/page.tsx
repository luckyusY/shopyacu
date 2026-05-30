import { AdminPanel } from "@/components/AdminPanel";
import { getProducts } from "@/lib/product-store";

export const metadata = {
  title: "Admin | Shopyacu",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await getProducts({ includeInactive: true });
  return <AdminPanel products={products} />;
}
