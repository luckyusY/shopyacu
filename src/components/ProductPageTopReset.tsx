"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ProductPageTopReset() {
  const pathname = usePathname();

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }, [pathname]);

  return null;
}
