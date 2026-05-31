import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { getHiddenCategories, saveHiddenCategories } from "@/lib/category-visibility";
import { logActivity } from "@/lib/events-store";

export const runtime = "nodejs";

export async function GET() {
  const hiddenCategories = await getHiddenCategories();
  return NextResponse.json({ hiddenCategories });
}

export async function PATCH(request: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const body = await request.json();
    const hiddenCategories = await saveHiddenCategories(body.hiddenCategories);
    await logActivity({
      action: "update",
      slug: "category-visibility",
      name: "Category visibility",
      fields: hiddenCategories,
    });
    return NextResponse.json({ hiddenCategories });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update category visibility." },
      { status: 500 },
    );
  }
}
