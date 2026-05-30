import { NextResponse } from "next/server";
import { getProducts, saveProduct } from "@/lib/product-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = await getProducts({ includeInactive: searchParams.get("all") === "1" });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const product = await saveProduct(await request.json());
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save product." },
      { status: 500 },
    );
  }
}
