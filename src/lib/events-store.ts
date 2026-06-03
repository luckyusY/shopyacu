import { getMongoClient } from "@/lib/mongodb";

// Lightweight analytics + audit layer. Storefront interactions are written to
// the `events` collection; admin changes to the `activity` collection. Every
// read/write is wrapped so the app keeps working when MongoDB is unavailable
// (the storefront falls back to bundled data in that mode too).

const databaseName = "shopyacu";

export type StorefrontEventType = "view" | "inquiry";
export type InquirySource =
  | "lead_popup"
  | "support_widget"
  | "product_cta"
  | "sticky_bar"
  | "ask_question"
  | "product_card"
  | "hero"
  | "category"
  | "cart"
  | "header"
  | "blog"
  | "other";

export type StorefrontEvent = {
  type: StorefrontEventType;
  slug?: string;
  name?: string;
  category?: string;
  source?: InquirySource;
  path?: string;
  ref?: string;
  ts: string;
};

export type ActivityAction = "create" | "update" | "delete";

export type ActivityEntry = {
  action: ActivityAction;
  slug: string;
  name: string;
  fields?: string[];
  ts: string;
};

type EventDocument = Omit<StorefrontEvent, "ts"> & { ts: Date };
type ActivityDocument = Omit<ActivityEntry, "ts"> & { ts: Date };

const VALID_EVENT_TYPES: StorefrontEventType[] = ["view", "inquiry"];
const VALID_SOURCES: InquirySource[] = [
  "lead_popup",
  "support_widget",
  "product_cta",
  "sticky_bar",
  "ask_question",
  "product_card",
  "hero",
  "category",
  "cart",
  "header",
  "blog",
  "other",
];

function clean(value: unknown, max = 160): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

async function eventsCollection() {
  const client = await getMongoClient();
  return client.db(databaseName).collection<EventDocument>("events");
}

async function activityCollection() {
  const client = await getMongoClient();
  return client.db(databaseName).collection<ActivityDocument>("activity");
}

/** Validate + normalize an untrusted payload coming from the public track API. */
export function normalizeEvent(input: Record<string, unknown>): StorefrontEvent | null {
  const type = input.type as StorefrontEventType;
  if (!VALID_EVENT_TYPES.includes(type)) return null;

  const source = clean(input.source) as InquirySource | undefined;
  return {
    type,
    slug: clean(input.slug, 200),
    name: clean(input.name, 200),
    category: clean(input.category, 80),
    source: source && VALID_SOURCES.includes(source) ? source : undefined,
    path: clean(input.path, 300),
    ref: clean(input.ref, 300),
    ts: new Date().toISOString(),
  };
}

export async function recordEvent(event: StorefrontEvent): Promise<void> {
  try {
    const collection = await eventsCollection();
    await collection.insertOne({ ...event, ts: new Date(event.ts) });
  } catch {
    // Analytics are best-effort; never block the storefront on a write failure.
  }
}

export async function logActivity(entry: Omit<ActivityEntry, "ts">): Promise<void> {
  try {
    const collection = await activityCollection();
    await collection.insertOne({ ...entry, ts: new Date() });
  } catch {
    // Audit logging is best-effort.
  }
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type AnalyticsSummary = {
  available: boolean;
  rangeDays: number;
  totals: { views: number; inquiries: number; conversion: number };
  series: { date: string; views: number; inquiries: number }[];
  topViewed: { slug: string; name: string; views: number }[];
  topInquired: { slug: string; name: string; inquiries: number }[];
  categories: { category: string; views: number; inquiries: number }[];
  sources: { source: string; count: number }[];
};

const EMPTY_ANALYTICS = (rangeDays: number): AnalyticsSummary => ({
  available: false,
  rangeDays,
  totals: { views: 0, inquiries: 0, conversion: 0 },
  series: [],
  topViewed: [],
  topInquired: [],
  categories: [],
  sources: [],
});

export async function getAnalytics({ days = 30 } = {}): Promise<AnalyticsSummary> {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const collection = await eventsCollection();
    const docs = await collection
      .find({ ts: { $gte: since } })
      .sort({ ts: 1 })
      .limit(20000)
      .toArray();

    if (!docs.length) {
      // Distinguish "configured but empty" from "unavailable": a successful
      // query that returns nothing is still "available".
      return { ...EMPTY_ANALYTICS(days), available: true };
    }

    let views = 0;
    let inquiries = 0;
    const seriesMap = new Map<string, { views: number; inquiries: number }>();
    const viewedMap = new Map<string, { name: string; views: number }>();
    const inquiredMap = new Map<string, { name: string; inquiries: number }>();
    const categoryMap = new Map<string, { views: number; inquiries: number }>();
    const sourceMap = new Map<string, number>();

    // Pre-seed the daily series so the chart has a continuous axis.
    for (let i = days - 1; i >= 0; i--) {
      const key = dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
      seriesMap.set(key, { views: 0, inquiries: 0 });
    }

    for (const doc of docs) {
      const isView = doc.type === "view";
      if (isView) views++;
      else inquiries++;

      const key = dayKey(new Date(doc.ts));
      const bucket = seriesMap.get(key) || { views: 0, inquiries: 0 };
      if (isView) bucket.views++;
      else bucket.inquiries++;
      seriesMap.set(key, bucket);

      if (doc.slug) {
        const name = doc.name || doc.slug;
        if (isView) {
          const entry = viewedMap.get(doc.slug) || { name, views: 0 };
          entry.views++;
          viewedMap.set(doc.slug, entry);
        } else {
          const entry = inquiredMap.get(doc.slug) || { name, inquiries: 0 };
          entry.inquiries++;
          inquiredMap.set(doc.slug, entry);
        }
      }

      if (doc.category) {
        const entry = categoryMap.get(doc.category) || { views: 0, inquiries: 0 };
        if (isView) entry.views++;
        else entry.inquiries++;
        categoryMap.set(doc.category, entry);
      }

      if (!isView) {
        const source = doc.source || "other";
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      }
    }

    return {
      available: true,
      rangeDays: days,
      totals: {
        views,
        inquiries,
        conversion: views > 0 ? Math.round((inquiries / views) * 1000) / 10 : 0,
      },
      series: Array.from(seriesMap.entries()).map(([date, value]) => ({ date, ...value })),
      topViewed: Array.from(viewedMap.entries())
        .map(([slug, value]) => ({ slug, ...value }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8),
      topInquired: Array.from(inquiredMap.entries())
        .map(([slug, value]) => ({ slug, ...value }))
        .sort((a, b) => b.inquiries - a.inquiries)
        .slice(0, 8),
      categories: Array.from(categoryMap.entries())
        .map(([category, value]) => ({ category, ...value }))
        .sort((a, b) => b.views + b.inquiries - (a.views + a.inquiries)),
      sources: Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
    };
  } catch {
    return EMPTY_ANALYTICS(days);
  }
}

export async function getRecentActivity(limit = 30): Promise<ActivityEntry[]> {
  try {
    const collection = await activityCollection();
    const docs = await collection.find({}).sort({ ts: -1 }).limit(limit).toArray();
    return docs.map((doc) => ({
      action: doc.action,
      slug: doc.slug,
      name: doc.name,
      fields: doc.fields,
      ts: new Date(doc.ts).toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getRecentInquiries(limit = 30): Promise<StorefrontEvent[]> {
  try {
    const collection = await eventsCollection();
    const docs = await collection
      .find({ type: "inquiry" })
      .sort({ ts: -1 })
      .limit(limit)
      .toArray();
    return docs.map((doc) => ({
      type: "inquiry" as const,
      slug: doc.slug,
      name: doc.name,
      category: doc.category,
      source: doc.source,
      path: doc.path,
      ref: doc.ref,
      ts: new Date(doc.ts).toISOString(),
    }));
  } catch {
    return [];
  }
}
