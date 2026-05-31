import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

function clearCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function POST() {
  return clearCookie(NextResponse.json({ ok: true }));
}

export async function GET(request: Request) {
  return clearCookie(NextResponse.redirect(new URL("/admin/login", request.url)));
}
