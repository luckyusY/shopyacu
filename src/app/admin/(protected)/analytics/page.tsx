import Link from "next/link";
import { getAnalytics } from "@/lib/events-store";
import { BarChart, Card, EmptyState, PageHeader, SectionTitle, StatCard } from "@/components/admin/ui";

export const metadata = { title: "Analytics | Shopyacu admin" };
export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  lead_popup: "Lead popup",
  support_widget: "Support widget",
  product_cta: "Order button",
  sticky_bar: "Sticky bar",
  ask_question: "Ask first",
  header: "Product header",
  other: "Other",
};

function RankList({
  rows,
  metricLabel,
}: {
  rows: { slug: string; name: string; value: number }[];
  metricLabel: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="grid gap-2.5">
      {rows.map((row, index) => (
        <li key={row.slug} className="grid gap-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <Link href={`/admin/products/${row.slug}/edit`} className="flex min-w-0 items-center gap-2 font-semibold hover:underline">
              <span className="text-muted">{index + 1}.</span>
              <span className="truncate">{row.name}</span>
            </Link>
            <span className="flex-none font-bold text-ink">
              {row.value.toLocaleString()} <span className="text-xs font-medium text-muted">{metricLabel}</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/8">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics({ days: 30 });
  const hasData = analytics.totals.views > 0 || analytics.totals.inquiries > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description={`Storefront engagement over the last ${analytics.rangeDays} days. Inquiries are WhatsApp taps from product pages, the lead popup, and the support widget.`}
      />

      {!analytics.available ? (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-700">
            Analytics storage is unavailable. Connect MongoDB (set <code>MONGODB_URI</code>) to start recording views and inquiries.
          </p>
        </Card>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Product views" value={analytics.totals.views.toLocaleString()} tone="sky" icon="👁" />
        <StatCard label="WhatsApp inquiries" value={analytics.totals.inquiries.toLocaleString()} tone="emerald" icon="💬" />
        <StatCard
          label="View → inquiry rate"
          value={`${analytics.totals.conversion}%`}
          tone="accent"
          icon="↗"
          hint="Share of views that messaged you"
        />
      </section>

      <Card className="mt-5">
        <SectionTitle title="Daily engagement" />
        <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-ink/15" /> Views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Inquiries
          </span>
        </div>
        {hasData ? (
          <BarChart data={analytics.series} className="mt-4" />
        ) : (
          <EmptyState
            title="No engagement recorded yet"
            description="Once shoppers view products and tap WhatsApp, the trend appears here."
          />
        )}
      </Card>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Most viewed products" />
          <div className="mt-4">
            {analytics.topViewed.length ? (
              <RankList rows={analytics.topViewed.map((r) => ({ slug: r.slug, name: r.name, value: r.views }))} metricLabel="views" />
            ) : (
              <EmptyState title="No views yet" />
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Most inquired products" />
          <div className="mt-4">
            {analytics.topInquired.length ? (
              <RankList
                rows={analytics.topInquired.map((r) => ({ slug: r.slug, name: r.name, value: r.inquiries }))}
                metricLabel="inquiries"
              />
            ) : (
              <EmptyState title="No inquiries yet" />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <SectionTitle title="By category" />
          <div className="mt-4 overflow-hidden rounded-2xl border border-ink/8">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-surface px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <span>Category</span>
              <span className="text-right">Views</span>
              <span className="text-right">Inquiries</span>
            </div>
            {analytics.categories.length ? (
              analytics.categories.map((row) => (
                <div key={row.category} className="grid grid-cols-[1fr_auto_auto] gap-4 border-t border-ink/8 px-4 py-2.5 text-sm">
                  <span className="font-semibold">{row.category}</span>
                  <span className="text-right font-bold">{row.views.toLocaleString()}</span>
                  <span className="text-right font-bold text-accent">{row.inquiries.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-center text-sm font-medium text-muted">No category data yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Inquiry sources" />
          <ul className="mt-4 grid gap-2">
            {analytics.sources.length ? (
              analytics.sources.map((row) => (
                <li key={row.source} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5 text-sm">
                  <span className="font-semibold">{SOURCE_LABELS[row.source] || row.source}</span>
                  <span className="font-bold text-ink">{row.count.toLocaleString()}</span>
                </li>
              ))
            ) : (
              <li className="rounded-xl bg-surface px-3 py-6 text-center text-sm font-medium text-muted">No inquiries yet.</li>
            )}
          </ul>
        </Card>
      </section>
    </div>
  );
}
