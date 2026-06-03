import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { getProductCollections, saveProductCollection } from "@/lib/collections-store";
import { logActivity } from "@/lib/events-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collections = await getProductCollections({ includeInactive: searchParams.get("all") === "1" });
  return NextResponse.json(collections);
}

export async function POST(request: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const collection = await saveProductCollection(await request.json());
    await logActivity({ action: "create", slug: collection.slug, name: collection.title, fields: ["collection"] });
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save collection." },
      { status: 500 },
    );
  }
}
