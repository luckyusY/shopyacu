import Link from "next/link";
import { getRecentActivity, getRecentInquiries } from "@/lib/events-store";
import { Card, EmptyState, PageHeader, SectionTitle } from "@/components/admin/ui";
import { ActivityFeed, relativeTime } from "@/components/admin/ActivityFeed";

export const metadata = { title: "Activity & logs | Shopyacu admin" };
export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  lead_popup: "Lead popup",
  support_widget: "Support widget",
  product_cta: "Order button",
  sticky_bar: "Sticky bar",
  ask_question: "Ask first",
  product_card: "Product card",
  hero: "Hero / banner",
  category: "Category page",
  cart: "Cart checkout",
  header: "Header",
  other: "Other",
};

export default async function LogsPage() {
  const [activity, inquiries] = await Promise.all([getRecentActivity(40), getRecentInquiries(40)]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Insights"
        title="Activity & logs"
        description="An audit trail of catalog changes and a live feed of customer WhatsApp inquiries."
      />

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Catalog activity" />
          <div className="mt-4">
            {activity.length ? (
              <ActivityFeed entries={activity} />
            ) : (
              <EmptyState
                title="No activity logged yet"
                description="Creating, editing, or deleting products will record entries here."
              />
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Customer inquiries" />
          <div className="mt-4">
            {inquiries.length ? (
              <ul className="grid gap-2">
                {inquiries.map((inquiry, index) => (
                  <li key={`${inquiry.slug}-${inquiry.ts}-${index}`} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-emerald-100 text-sm text-emerald-700">
                      💬
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {inquiry.slug ? (
                          <Link href={`/admin/products/${inquiry.slug}/edit`} className="font-bold hover:underline">
                            {inquiry.name || inquiry.slug}
                          </Link>
                        ) : (
                          <span className="font-bold">General inquiry</span>
                        )}
                      </p>
                      <p className="truncate text-xs font-medium text-muted">
                        {SOURCE_LABELS[inquiry.source || "other"] || inquiry.source}
                      </p>
                    </div>
                    <span className="flex-none text-xs font-medium text-muted">{relativeTime(inquiry.ts)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No inquiries yet"
                description="WhatsApp taps from the storefront will appear here in real time."
              />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
