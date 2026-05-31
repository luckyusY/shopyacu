import { NextResponse } from "next/server";
import { getProducts, saveProduct } from "@/lib/product-store";
import { adminGuard } from "@/lib/admin-guard";
import { logActivity } from "@/lib/events-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = await getProducts({ includeInactive: searchParams.get("all") === "1" });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const product = await saveProduct(await request.json());
    await logActivity({ action: "create", slug: product.slug, name: product.name });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save product." },
      { status: 500 },
    );
  }
}
