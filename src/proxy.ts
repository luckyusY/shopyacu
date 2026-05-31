import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // API routes: only guard state-changing requests. Public GETs stay open.
  if (isApi) {
    if (!MUTATING_METHODS.has(request.method)) return NextResponse.next();
    const authorized = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
    if (authorized) return NextResponse.next();
    return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  }

  // Admin pages: the login page is always reachable; everything else needs a session.
  if (pathname === "/admin/login") return NextResponse.next();

  const authorized = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (authorized) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/products/:path*", "/api/cloudinary/:path*"],
};
