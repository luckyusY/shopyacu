import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/product-store";
import { formatPrice, getCategories } from "@/lib/products";

export const metadata = { title: "Dashboard | Shopyacu admin" };
export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs font-medium text-muted">{hint}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const products = await getProducts({ includeInactive: true });
  const categories = getCategories(products);
  const active = products.filter((p) => p.active !== false).length;
  const videoCount = products.reduce((total, p) => total + (p.videos?.length || 0), 0);
  const inventoryValue = products.reduce((total, p) => total + p.price, 0);
  const outOfStock = products.filter((p) => p.stock === "Out of stock");
  const recent = [...products]
    .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Overview</p>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-accent/85"
        >
          + Add product
        </Link>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Products" value={products.length.toString()} hint={`${active} live on storefront`} />
        <Stat label="Categories" value={Math.max(categories.length - 1, 0).toString()} />
        <Stat label="Videos" value={videoCount.toString()} />
        <Stat label="Catalog value" value={formatPrice(inventoryValue)} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Recently updated</h2>
            <Link href="/admin/products" className="text-sm font-semibold text-accent hover:underline">
              Manage all
            </Link>
          </div>
          <ul className="mt-4 grid gap-3">
            {recent.map((product) => (
              <li key={product.id} className="flex items-center gap-3">
                <Image
                  src={product.image}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-xl border border-ink/10 bg-white object-contain p-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs font-medium text-muted">{product.category}</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(product.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-ink p-5 text-white shadow-sm">
          <h2 className="font-display text-xl font-bold">Stock attention</h2>
          {outOfStock.length ? (
            <ul className="mt-4 grid gap-2">
              {outOfStock.slice(0, 6).map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
                  <span className="truncate font-semibold">{product.name}</span>
                  <span className="shrink-0 rounded-full bg-red-500/90 px-2 py-0.5 text-xs font-bold">Out</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm font-medium text-white/70">Everything is in stock. Nice.</p>
          )}
        </div>
      </section>
    </div>
  );
}
