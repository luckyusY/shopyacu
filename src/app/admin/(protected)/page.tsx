import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/product-store";
import { getAnalytics, getRecentActivity } from "@/lib/events-store";
import { formatPrice, getCategories } from "@/lib/products";
import { BarChart, Card, EmptyState, LinkButton, PageHeader, SectionTitle, StatCard } from "@/components/admin/ui";
import { ActivityFeed } from "@/components/admin/ActivityFeed";

export const metadata = { title: "Dashboard | Shopyacu admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, analytics, activity] = await Promise.all([
    getProducts({ includeInactive: true }),
    getAnalytics({ days: 14 }),
    getRecentActivity(6),
  ]);

  const categories = getCategories(products);
  const active = products.filter((p) => p.active !== false).length;
  const inventoryValue = products.reduce((total, p) => total + p.price, 0);
  const outOfStock = products.filter((p) => p.stock === "Out of stock");
  const recent = [...products]
    .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Catalog health and storefront engagement at a glance."
        actions={<LinkButton href="/admin/products/new">+ Add product</LinkButton>}
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Product views"
          value={analytics.totals.views.toLocaleString()}
          hint={`Last ${analytics.rangeDays} days`}
          tone="sky"
          icon="👁"
        />
        <StatCard
          label="WhatsApp inquiries"
          value={analytics.totals.inquiries.toLocaleString()}
          hint={`${analytics.totals.conversion}% of views`}
          tone="emerald"
          icon="💬"
        />
        <StatCard
          label="Live products"
          value={active.toString()}
          hint={`${products.length} total · ${Math.max(categories.length - 1, 0)} categories`}
          tone="ink"
          icon="▦"
        />
        <StatCard label="Catalog value" value={formatPrice(inventoryValue)} tone="accent" icon="₣" />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <SectionTitle
            title="Engagement"
            action={
              <Link href="/admin/analytics" className="text-sm font-semibold text-accent hover:underline">
                Full analytics
              </Link>
            }
          />
          <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-ink/15" /> Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Inquiries
            </span>
          </div>
          {analytics.series.length ? (
            <BarChart data={analytics.series} className="mt-4" />
          ) : (
            <p className="mt-6 text-sm font-medium text-muted">No activity recorded yet in this window.</p>
          )}
          {!analytics.available ? (
            <p className="mt-3 text-xs font-medium text-amber-600">
              Analytics storage is unavailable — connect MongoDB to record live engagement.
            </p>
          ) : null}
        </Card>

        <Card className="bg-ink text-white">
          <SectionTitle title="Stock attention" />
          {outOfStock.length ? (
            <ul className="mt-4 grid gap-2">
              {outOfStock.slice(0, 6).map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm"
                >
                  <Link href={`/admin/products/${product.slug}/edit`} className="truncate font-semibold hover:underline">
                    {product.name}
                  </Link>
                  <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold">Out</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm font-medium text-white/70">Everything is in stock. Nice.</p>
          )}
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionTitle
            title="Recently updated"
            action={
              <Link href="/admin/products" className="text-sm font-semibold text-accent hover:underline">
                Manage all
              </Link>
            }
          />
          <ul className="mt-4 grid gap-1">
            {recent.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/admin/products/${product.slug}/edit`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-surface"
                >
                  <Image
                    src={product.image}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-xl border border-ink/10 bg-white object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="text-xs font-medium text-muted">{product.category}</p>
                  </div>
                  <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle
            title="Recent activity"
            action={
              <Link href="/admin/logs" className="text-sm font-semibold text-accent hover:underline">
                View log
              </Link>
            }
          />
          <div className="mt-4">
            {activity.length ? (
              <ActivityFeed entries={activity} compact />
            ) : (
              <EmptyState title="No activity yet" description="Product changes will appear here." />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
