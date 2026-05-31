import Link from "next/link";
import type { ActivityEntry } from "@/lib/events-store";

const ACTION_META: Record<ActivityEntry["action"], { label: string; icon: string; className: string }> = {
  create: { label: "Created", icon: "＋", className: "bg-emerald-100 text-emerald-700" },
  update: { label: "Updated", icon: "✎", className: "bg-sky-100 text-sky-700" },
  delete: { label: "Deleted", icon: "✕", className: "bg-rose-100 text-rose-700" },
};

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityFeed({ entries, compact = false }: { entries: ActivityEntry[]; compact?: boolean }) {
  return (
    <ul className="grid gap-2">
      {entries.map((entry, index) => {
        const meta = ACTION_META[entry.action];
        return (
          <li key={`${entry.slug}-${entry.ts}-${index}`} className="flex items-center gap-3">
            <span className={`grid h-8 w-8 flex-none place-items-center rounded-full text-sm font-bold ${meta.className}`}>
              {meta.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {meta.label}{" "}
                {entry.action === "delete" ? (
                  <span className="font-bold">{entry.name}</span>
                ) : (
                  <Link href={`/admin/products/${entry.slug}/edit`} className="font-bold hover:underline">
                    {entry.name}
                  </Link>
                )}
              </p>
              {!compact && entry.fields?.length ? (
                <p className="truncate text-xs font-medium text-muted">Changed: {entry.fields.join(", ")}</p>
              ) : null}
            </div>
            <span className="flex-none text-xs font-medium text-muted">{relativeTime(entry.ts)}</span>
          </li>
        );
      })}
    </ul>
  );
}
