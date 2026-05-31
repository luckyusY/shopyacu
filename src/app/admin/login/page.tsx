import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Admin sign in | Shopyacu",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/admin") ? next : "/admin";

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 py-10 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex justify-center">
            <Logo imgClassName="h-10" />
          </Link>
          <p className="mt-1 text-sm font-medium text-muted">Control panel access</p>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Enter the admin password to manage the catalog.</p>
          <AdminLoginForm redirectTo={target} />
        </div>
        <Link
          href="/"
          className="mt-5 block text-center text-sm font-semibold text-muted transition hover:text-ink"
        >
          &larr; Back to storefront
        </Link>
      </div>
    </main>
  );
}
