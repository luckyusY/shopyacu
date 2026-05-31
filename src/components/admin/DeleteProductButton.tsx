"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete "${name}"? This removes it from the storefront and cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to delete product.");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete product.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:cursor-wait disabled:opacity-60"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
