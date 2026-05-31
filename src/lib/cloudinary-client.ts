import type { ProductMedia } from "@/lib/products";

type CloudinarySignature = {
  apiKey: string;
  cloudName: string;
  params: {
    eager: string;
    eager_async: string;
    folder: string;
    timestamp: number;
  };
  signature: string;
  uploadUrl: string;
};

function transformCloudinaryUrl(url: string, type: ProductMedia["type"]) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const transform = type === "video" ? "q_auto:eco,f_auto,w_1080,c_limit" : "q_auto:good,f_auto,w_1600,c_limit";
  return url.includes(`/upload/${transform}/`) ? url : url.replace("/upload/", `/upload/${transform}/`);
}

function cloudinaryPoster(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return undefined;
  return url
    .replace("/video/upload/", "/video/upload/q_auto:good,f_jpg,w_900,c_limit/")
    .replace(/\.[a-z0-9]+($|\?)/i, ".jpg$1");
}

function mediaFromCloudinaryUpload(upload: Record<string, unknown>, type: ProductMedia["type"]): ProductMedia {
  const secureUrl = String(upload.secure_url || "");
  return {
    type,
    url: transformCloudinaryUrl(secureUrl, type),
    publicId: String(upload.public_id || ""),
    poster: type === "video" ? cloudinaryPoster(secureUrl) : undefined,
    thumbnail: type === "video" ? cloudinaryPoster(secureUrl) : undefined,
    width: Number(upload.width) || undefined,
    height: Number(upload.height) || undefined,
    duration: Number(upload.duration) || undefined,
    bytes: Number(upload.bytes) || undefined,
    format: String(upload.format || ""),
  };
}

async function signCloudinaryUpload(file: File, slug: string) {
  const resourceType: ProductMedia["type"] = file.type.startsWith("video/") ? "video" : "image";
  const response = await fetch("/api/cloudinary/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceType, slug }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Unable to sign Cloudinary upload.");
  }

  return { resourceType, signature: (await response.json()) as CloudinarySignature };
}

export async function uploadFilesToCloudinary(
  files: File[],
  slug: string,
  onStatus?: (message: string) => void,
): Promise<ProductMedia[]> {
  const uploaded: ProductMedia[] = [];

  for (const file of files) {
    onStatus?.(`Uploading ${file.name} to Cloudinary…`);
    const { resourceType, signature } = await signCloudinaryUpload(file, slug);
    const payload = new FormData();
    payload.append("file", file);
    payload.append("api_key", signature.apiKey);
    payload.append("timestamp", String(signature.params.timestamp));
    payload.append("folder", signature.params.folder);
    payload.append("eager", signature.params.eager);
    payload.append("eager_async", signature.params.eager_async);
    payload.append("signature", signature.signature);

    const uploadResponse = await fetch(signature.uploadUrl, { method: "POST", body: payload });
    if (!uploadResponse.ok) {
      const body = await uploadResponse.json().catch(() => ({}));
      throw new Error(body.error?.message || `Cloudinary upload failed for ${file.name}.`);
    }

    uploaded.push(mediaFromCloudinaryUpload(await uploadResponse.json(), resourceType));
  }

  return uploaded;
}
