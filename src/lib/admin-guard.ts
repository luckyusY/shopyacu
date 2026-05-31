import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

// Returns a 401 response when the caller is not an authenticated admin,
// otherwise null so the handler can proceed.
export async function adminGuard(): Promise<NextResponse | null> {
  if (await isAdminRequest()) return null;
  return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
}
