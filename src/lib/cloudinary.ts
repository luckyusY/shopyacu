import { v2 as cloudinary } from "cloudinary";

export type CloudinaryResourceType = "image" | "video";

type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getCloudinaryCredentials(): CloudinaryCredentials {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  if (!process.env.CLOUDINARY_URL) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const parsed = new URL(process.env.CLOUDINARY_URL);
  return {
    cloudName: parsed.hostname,
    apiKey: decodeURIComponent(parsed.username),
    apiSecret: decodeURIComponent(parsed.password),
  };
}

export function getCloudinaryUploadSignature({
  folder,
  resourceType,
}: {
  folder: string;
  resourceType: CloudinaryResourceType;
}) {
  const credentials = getCloudinaryCredentials();
  const timestamp = Math.round(Date.now() / 1000);
  const eager = resourceType === "video" ? "q_auto:eco,f_mp4,w_1080,c_limit" : "q_auto:good,f_auto,w_1600,c_limit";
  const params = {
    eager,
    eager_async: "true",
    folder,
    timestamp,
  };

  return {
    apiKey: credentials.apiKey,
    cloudName: credentials.cloudName,
    params,
    resourceType,
    signature: cloudinary.utils.api_sign_request(params, credentials.apiSecret),
    uploadUrl: `https://api.cloudinary.com/v1_1/${credentials.cloudName}/${resourceType}/upload`,
  };
}
