import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await getMongoClient();
    const remoteProducts = await client
      .db("shopyacu")
      .collection("products")
      .find({})
      .sort({ id: 1 })
      .toArray();

    return NextResponse.json(remoteProducts.length > 0 ? remoteProducts : products);
  } catch {
    return NextResponse.json(products);
  }
}
