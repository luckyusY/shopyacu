import { NextResponse } from "next/server";
import { getProductBySlug, patchProduct } from "@/lib/product-store";
import { adminGuard } from "@/lib/admin-guard";

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
    const product = await patchProduct(slug, await request.json());

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product." },
      { status: 500 },
    );
  }
}
