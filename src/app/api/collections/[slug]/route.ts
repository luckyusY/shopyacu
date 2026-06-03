import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { deleteProductCollection, getProductCollectionBySlug, patchProductCollection } from "@/lib/collections-store";
import { logActivity } from "@/lib/events-store";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getProductCollectionBySlug(slug, { includeInactive: true });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  }

  return NextResponse.json(collection);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { slug } = await params;
    const body = await request.json();
    const collection = await patchProductCollection(slug, body);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    }

    await logActivity({
      action: "update",
      slug: collection.slug,
      name: collection.title,
      fields: Object.keys(body || {}).filter((key) => key !== "id"),
    });

    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update collection." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { slug } = await params;
    const collection = await deleteProductCollection(slug);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    }

    await logActivity({ action: "delete", slug: collection.slug, name: collection.title, fields: ["collection"] });
    return NextResponse.json({ ok: true, slug: collection.slug });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete collection." },
      { status: 500 },
    );
  }
}
