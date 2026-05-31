import { NextResponse } from "next/server";
import { deleteProduct, getProductBySlug, patchProduct } from "@/lib/product-store";
import { adminGuard } from "@/lib/admin-guard";
import { logActivity } from "@/lib/events-store";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { slug } = await params;
    const body = await request.json();
    const product = await patchProduct(slug, body);

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await logActivity({
      action: "update",
      slug: product.slug,
      name: product.name,
      fields: Object.keys(body || {}).filter((key) => key !== "id" && key !== "slug"),
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { slug } = await params;
    const product = await deleteProduct(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await logActivity({ action: "delete", slug: product.slug, name: product.name });
    return NextResponse.json({ ok: true, slug: product.slug });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete product." },
      { status: 500 },
    );
  }
}
