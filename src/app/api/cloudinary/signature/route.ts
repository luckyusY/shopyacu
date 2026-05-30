import { NextRequest, NextResponse } from "next/server";
import { getCloudinaryUploadSignature, type CloudinaryResourceType } from "@/lib/cloudinary";
import { slugify } from "@/lib/products";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { resourceType?: CloudinaryResourceType; slug?: string };
    const resourceType = body.resourceType === "video" ? "video" : "image";
    const slug = slugify(body.slug || "product-media") || "product-media";
    const signature = getCloudinaryUploadSignature({
      folder: `shopyacu/products/${slug}`,
      resourceType,
    });

    return NextResponse.json(signature);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sign Cloudinary upload." },
      { status: 500 },
    );
  }
}
