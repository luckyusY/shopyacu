/**
 * Small rectangular banner placed at the decision point (just above the
 * WhatsApp CTA). Shows a single static social-proof / urgency line with a
 * shimmer sweep and a live pulse dot to draw the eye toward messaging.
 * (Word rotation removed.) All motion is pure CSS and respects
 * prefers-reduced-motion via the global stylesheet.
 */
export function LiveActivityBanner({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="relative mt-4 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/55 to-transparent animate-[shimmer_3s_linear_infinite]" />

      <div className="relative flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 flex-none" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <p className="min-w-0 flex-1 truncate text-xs font-bold leading-5 text-emerald-800 sm:text-sm">{message}</p>
      </div>
    </div>
  );
}
