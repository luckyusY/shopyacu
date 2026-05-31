"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "shopyacu-install-dismissed";
const DISMISS_DAYS = 14;

function recentlyDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const when = Number(raw);
  if (Number.isNaN(when)) return false;
  return Date.now() - when < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || recentlyDismissed()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari never fires beforeinstallprompt; offer manual guidance.
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    let iosTimer = 0;
    if (isIos) {
      iosTimer = window.setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 14000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.clearTimeout(iosTimer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    if (typeof window !== "undefined") window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <m.div
          key="install"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-md rounded-2xl border border-ink/10 bg-white p-3.5 shadow-2xl sm:hidden"
          role="dialog"
          aria-label="Install Shopyacu app"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-ink font-display text-xl font-bold text-accent">S</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight text-ink">Add Shopyacu to your home screen</p>
              <p className="mt-0.5 text-xs font-medium leading-snug text-muted">
                {iosHint ? "Tap Share, then “Add to Home Screen” for discount alerts." : "Get future discounts and faster reordering."}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="grid h-8 w-8 flex-none place-items-center rounded-full bg-ink/5 text-lg leading-none text-ink/50 transition hover:bg-ink/10"
            >
              &times;
            </button>
          </div>
          {!iosHint ? (
            <button
              type="button"
              onClick={install}
              className="mt-3 min-h-11 w-full rounded-xl bg-accent text-sm font-black text-ink transition hover:bg-accent/90 active:scale-[0.99]"
            >
              Install app
            </button>
          ) : null}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
