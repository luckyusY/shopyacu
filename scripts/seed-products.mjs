import { v2 as cloudinary } from "cloudinary";
import { MongoClient } from "mongodb";
import { readdir } from "node:fs/promises";
import path from "node:path";

const productRoot = process.env.PRODUCTS_DIR || "C:\\Users\\HP\\Videos\\products";
const mongoUri = process.env.MONGODB_URI;
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

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

for (const folder of folders) {
  const id = Number(folder.name.match(/^\d+/)[0]);
  const folderPath = path.join(productRoot, folder.name);
  const files = await readdir(folderPath, { withFileTypes: true });
  const firstImage = files.find((file) => file.isFile() && imageExtensions.has(path.extname(file.name).toLowerCase()));

  if (!firstImage) {
    continue;
  }

  const name = cleanName(folder.name) || `Product ${id}`;
  const slug = slugify(name);
  const upload = await cloudinary.uploader.upload(path.join(folderPath, firstImage.name), {
    folder: "shopyacu/products",
    public_id: slug,
    overwrite: true,
    resource_type: "image",
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }],
  });

  products.push({
    id,
    slug,
    name,
    category: categoryFor(name),
    price: priceFor(name),
    image: upload.secure_url,
    cloudinaryPublicId: upload.public_id,
    sourceFolder: folder.name,
    description: `${name} is available from Shopyacu for local online ordering and delivery.`,
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
