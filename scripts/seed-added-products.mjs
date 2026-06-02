import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const databaseName = "shopyacu";
const collectionName = "products";
const minimumAddedProductId = 34;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required.");
}

function extractLiteral(source, marker, terminator) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Unable to find ${marker}.`);
  const start = source.indexOf(marker.includes("productSeed") ? "[" : "{", markerIndex);
  const end = source.indexOf(terminator, start);
  if (start === -1 || end === -1) throw new Error(`Unable to parse ${marker}.`);
  return source.slice(start, end + 1);
}

function evaluateLiteral(literal) {
  return Function(`"use strict"; return (${literal});`)();
}

const source = await readFile("src/lib/products.ts", "utf8");
const productSeed = evaluateLiteral(extractLiteral(source, "const productSeed", "];"));
const galleryImages = evaluateLiteral(extractLiteral(source, "const galleryImages", "};"));

const products = productSeed
  .filter((product) => Number(product.id) >= minimumAddedProductId)
  .map((product) => {
    const images = [
      product.image,
      ...(galleryImages[product.id] || []).map((image) => `/products/${image}`),
    ];

    return {
      ...product,
      images,
      media: images.map((url) => ({ type: "image", url })),
      stock: product.stock || "In stock",
      active: product.active !== false,
      featured: Boolean(product.featured || product.badge),
      sourceFolder: "C:\\Users\\HP\\Documents\\shopyacu\\products",
      updatedAt: new Date(),
    };
  });

const client = new MongoClient(mongoUri);
await client.connect();
const collection = client.db(databaseName).collection(collectionName);

for (const product of products) {
  await collection.updateOne({ slug: product.slug }, { $set: product }, { upsert: true });
  console.log(`Seeded ${product.id}. ${product.name}`);
}

await client.close();

console.log(`Seeded ${products.length} added products to MongoDB.`);
