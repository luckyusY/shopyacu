import { NextResponse } from "next/server";
import { normalizeEvent, recordEvent } from "@/lib/events-store";

export const runtime = "nodejs";

// Public, unauthenticated endpoint for storefront analytics beacons.
// Payloads are validated/normalized server-side and written best-effort.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const event = normalizeEvent(body || {});
    if (!event) {
      return NextResponse.json({ error: "Invalid event." }, { status: 400 });
    }
    await recordEvent(event);
  } catch {
    // Swallow errors: analytics must never surface to the shopper.
  }
  return NextResponse.json({ ok: true });
}
