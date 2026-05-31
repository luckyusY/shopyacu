import Link from "next/link";
import type { ReactNode } from "react";

// Shared building blocks for the admin's refreshed visual language. These are
// server-compatible (no client hooks) so they can be used directly in pages.

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm font-medium text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Component
      className={`rounded-3xl border border-ink/8 bg-white p-5 shadow-[0_1px_3px_rgba(31,33,40,0.04),0_8px_24px_-12px_rgba(31,33,40,0.12)] ${className}`}
    >
      {children}
    </Component>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {action}
    </div>
  );
}

const TONE_STYLES: Record<string, string> = {
  ink: "bg-ink text-white",
  accent: "bg-accent text-ink",
  emerald: "bg-emerald-500 text-white",
  sky: "bg-sky-500 text-white",
  rose: "bg-rose-500 text-white",
  slate: "bg-ink/8 text-ink",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "slate",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: keyof typeof TONE_STYLES;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
        {icon ? (
          <span className={`grid h-9 w-9 place-items-center rounded-xl text-base ${TONE_STYLES[tone]}`}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="font-display text-3xl font-bold tracking-tight text-ink">{value}</p>
      {hint ? <p className="text-xs font-medium text-muted">{hint}</p> : null}
    </Card>
  );
}

const BADGE_TONES: Record<string, string> = {
  neutral: "bg-ink/8 text-ink",
  accent: "bg-accent/20 text-ink",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-surface/60 px-6 py-12 text-center">
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {description ? <p className="max-w-sm text-sm font-medium text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

/** Lightweight dependency-free dual-series bar chart. */
export function BarChart({
  data,
  className = "",
}: {
  data: { date: string; views: number; inquiries: number }[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.views));
  return (
    <div className={`flex items-end gap-1 ${className}`} style={{ height: 160 }}>
      {data.map((d) => {
        const viewH = Math.round((d.views / max) * 100);
        const inqH = d.views > 0 ? Math.round((d.inquiries / max) * 100) : 0;
        const label = new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return (
          <div key={d.date} className="group relative flex flex-1 flex-col justify-end gap-0.5" title={`${label}: ${d.views} views, ${d.inquiries} inquiries`}>
            <div className="relative w-full overflow-hidden rounded-t-md bg-ink/8" style={{ height: `${Math.max(viewH, 2)}%` }}>
              <div className="absolute inset-x-0 bottom-0 bg-accent" style={{ height: `${viewH ? (inqH / viewH) * 100 : 0}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function buttonClass(variant: "primary" | "secondary" | "ghost" | "danger" = "primary") {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition";
  switch (variant) {
    case "secondary":
      return `${base} border border-ink/15 text-ink hover:bg-ink hover:text-white`;
    case "ghost":
      return `${base} text-ink/70 hover:bg-surface hover:text-ink`;
    case "danger":
      return `${base} border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white`;
    default:
      return `${base} bg-accent text-ink hover:bg-accent/85`;
  }
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <Link href={href} className={buttonClass(variant)}>
      {children}
    </Link>
  );
}
