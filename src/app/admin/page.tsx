import { AdminPanel } from "@/components/AdminPanel";
import { products } from "@/lib/products";

export const metadata = {
  title: "Admin | Shopyacu",
};

export default function AdminPage() {
  return <AdminPanel products={products} />;
}
