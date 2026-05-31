"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▣", exact: true },
  { href: "/admin/products", label: "Products", icon: "▦", exact: false },
  { href: "/admin/products/new", label: "Add product", icon: "＋", exact: true },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="grid gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active ? "bg-ink text-white" : "text-ink/70 hover:bg-surface hover:text-ink"
            }`}
          >
            <span aria-hidden className="grid h-6 w-6 place-items-center text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink/10 bg-white p-5 lg:flex">
        <Link href="/admin" className="font-display text-2xl font-bold tracking-tight">
          Shopyacu
          <span className="ml-1 align-top text-xs font-bold uppercase tracking-[0.18em] text-accent">admin</span>
        </Link>
        <div className="mt-8 flex-1">{nav}</div>
        <div className="grid gap-2 border-t border-ink/10 pt-4">
          <Link
            href="/"
            className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-surface hover:text-ink"
          >
            View storefront ↗
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-ink/10 px-3.5 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="font-display text-xl font-bold tracking-tight">
          Shopyacu <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label="Toggle admin menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-lg"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {menuOpen ? (
        <div className="border-b border-ink/10 bg-white px-4 py-3 lg:hidden">
          {nav}
          <div className="mt-3 grid gap-2 border-t border-ink/10 pt-3">
            <Link href="/" className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink/70 hover:bg-surface">
              View storefront ↗
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-ink/10 px-3.5 py-2.5 text-left text-sm font-semibold text-ink hover:bg-ink hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
