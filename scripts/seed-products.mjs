import { v2 as cloudinary } from "cloudinary";
import { MongoClient } from "mongodb";
import { readdir } from "node:fs/promises";
import path from "node:path";

const productRoot = process.env.PRODUCTS_DIR || "C:\\Users\\HP\\Videos\\products";
const mongoUri = process.env.MONGODB_URI;
const imageExtensions = new Set([".jpg", ".jpeg", ".jfif", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".mov", ".webm", ".m4v", ".avi"]);

if (!process.env.CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL is required.");
}

if (!mongoUri) {
  throw new Error("MONGODB_URI is required.");
}

function cleanName(folderName) {
  return folderName
    .replace(/^\d+[\s.,-]*/, "")
    .replace(/\s+/g, " ")
    .replace(/\bavailabl\b/i, "available")
    .replace(/\bVegettable\b/i, "Vegetable")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categoryFor(name) {
  const text = name.toLowerCase();
  if (text.includes("shower") || text.includes("toilet") || text.includes("bathroom")) return "Bathroom";
  if (text.includes("blender") || text.includes("chopping") || text.includes("air fryer") || text.includes("amazi")) return "Kitchen";
  if (text.includes("stepper") || text.includes("resistance") || text.includes("abdominal") || text.includes("body weight")) return "Fitness";
  if (text.includes("laptop")) return "Office";
  if (text.includes("rain") || text.includes("hose") || text.includes("sunshade") || text.includes("pump") || text.includes("phone case")) return "Outdoor";
  return "Home";
}

function priceFor(name) {
  const text = name.toLowerCase();
  if (text.includes("air fryer")) return 98000;
  if (text.includes("blender")) return 75000;
  if (text.includes("stepper")) return 65000;
  if (text.includes("telescopic")) return 45000;
  if (text.includes("toilet rack")) return 42000;
  if (text.includes("laptop")) return 36000;
  if (text.includes("shower caddy")) return 38000;
  if (text.includes("furniture mover")) return 28000;
  if (text.includes("rain")) return 20000;
  if (text.includes("pad")) return 18000;
  return 30000;
}

const entries = await readdir(productRoot, { withFileTypes: true });
const folders = entries
  .filter((entry) => entry.isDirectory() && /^\d+/.test(entry.name))
  .sort((a, b) => Number(a.name.match(/^\d+/)[0]) - Number(b.name.match(/^\d+/)[0]));

const products = [];

function transformedCloudinaryUrl(url, type) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const transform = type === "video" ? "q_auto:eco,f_auto,w_1080,c_limit" : "q_auto:good,f_auto,w_1600,c_limit";
  return url.replace("/upload/", `/upload/${transform}/`);
}

function videoPoster(url) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return undefined;
  return url
    .replace("/video/upload/", "/video/upload/q_auto:good,f_jpg,w_900,c_limit/")
    .replace(/\.[a-z0-9]+($|\?)/i, ".jpg$1");
}

async function uploadMedia(filePath, slug, index, type) {
  const upload = await cloudinary.uploader.upload(filePath, {
    folder: `shopyacu/products/${slug}`,
    public_id: `${slug}-${index + 1}`,
    overwrite: true,
    resource_type: type,
    transformation: type === "image" ? [{ width: 1600, height: 1600, crop: "limit", quality: "auto:good", fetch_format: "auto" }] : undefined,
    eager: type === "video" ? [{ width: 1080, crop: "limit", quality: "auto:eco", format: "mp4" }] : undefined,
    eager_async: type === "video",
  });

  return {
    type,
    url: transformedCloudinaryUrl(upload.secure_url, type),
    publicId: upload.public_id,
    poster: type === "video" ? videoPoster(upload.secure_url) : undefined,
    thumbnail: type === "video" ? videoPoster(upload.secure_url) : undefined,
    width: upload.width,
    height: upload.height,
    duration: upload.duration,
    bytes: upload.bytes,
    format: upload.format,
  };
}

for (const folder of folders) {
  const id = Number(folder.name.match(/^\d+/)[0]);
  const folderPath = path.join(productRoot, folder.name);
  const files = await readdir(folderPath, { withFileTypes: true });
  const mediaFiles = files
    .filter((file) => file.isFile())
    .map((file) => ({ file, extension: path.extname(file.name).toLowerCase() }))
    .filter(({ extension }) => imageExtensions.has(extension) || videoExtensions.has(extension));

  if (!mediaFiles.length) {
    continue;
  }

  const name = cleanName(folder.name) || `Product ${id}`;
  const slug = slugify(name);
  const media = [];

  for (const [index, { file, extension }] of mediaFiles.entries()) {
    const type = videoExtensions.has(extension) ? "video" : "image";
    try {
      media.push(await uploadMedia(path.join(folderPath, file.name), slug, index, type));
    } catch (error) {
      console.warn(`Skipped ${folder.name}/${file.name}: ${error?.message || "Cloudinary upload failed."}`);
    }
  }

  if (!media.length) {
    console.warn(`Skipped ${folder.name}: no media uploaded.`);
    continue;
  }

  const images = media.filter((item) => item.type === "image").map((item) => item.url);
  const videos = media.filter((item) => item.type === "video");

  products.push({
    id,
    slug,
    name,
    category: categoryFor(name),
    price: priceFor(name),
    image: images[0] || videos[0]?.poster,
    images,
    videos,
    media,
    cloudinaryPublicId: media[0]?.publicId,
    sourceFolder: folder.name,
    description: `${name} is available from Shopyacu for local online ordering and delivery.`,
    active: true,
    stock: "In stock",
    updatedAt: new Date(),
  });

  console.log(`Uploaded ${id}. ${name}`);
}

const client = new MongoClient(mongoUri);
await client.connect();
const collection = client.db("shopyacu").collection("products");

for (const product of products) {
  await collection.updateOne({ slug: product.slug }, { $set: product }, { upsert: true });
}

await client.close();

console.log(`Seeded ${products.length} products to MongoDB.`);
