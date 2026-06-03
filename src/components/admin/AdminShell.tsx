"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";

type NavItem = { href: string; label: string; icon: string; exact: boolean };
type NavGroup = { heading: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "▤", exact: true }],
  },
  {
    heading: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: "▦", exact: false },
      { href: "/admin/products/new", label: "Add product", icon: "＋", exact: true },
      { href: "/admin/collections", label: "Collections", icon: "◇", exact: false },
    ],
  },
  {
    heading: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: "📈", exact: true },
      { href: "/admin/logs", label: "Activity & logs", icon: "🧾", exact: true },
    ],
  },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  // Avoid "Products" staying active on the dedicated /new route.
  if (href === "/admin/products") {
    return pathname === href || (pathname.startsWith(`${href}/`) && !pathname.startsWith("/admin/products/new"));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
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
    <nav className="grid gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.heading} className="grid gap-1.5">
          <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/35">{group.heading}</p>
          <div className="grid gap-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-accent text-ink shadow-sm"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span aria-hidden className="grid h-6 w-6 place-items-center text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="grid gap-2">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
      >
        <span aria-hidden className="grid h-6 w-6 place-items-center text-base">↗</span>
        View storefront
      </Link>
      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-left text-sm font-semibold text-white/80 transition hover:bg-white hover:text-ink"
      >
        <span aria-hidden className="grid h-6 w-6 place-items-center text-base">⏻</span>
        Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[268px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-gradient-to-b from-ink to-[#15161b] p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2 rounded-xl px-2 py-1">
          <Logo imgClassName="h-7" />
          <span className="rounded-md bg-accent px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.18em] text-ink">
            admin
          </span>
        </Link>
        <div className="mt-8 flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-white/10 pt-4">{footer}</div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo imgClassName="h-6" />
          <span className="rounded-md bg-accent px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.18em] text-ink">
            admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label="Toggle admin menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 text-lg"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {menuOpen ? (
        <div className="bg-ink px-4 pb-4 pt-2 text-white lg:hidden">
          {nav}
          <div className="mt-4 border-t border-white/10 pt-4">{footer}</div>
        </div>
      ) : null}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
