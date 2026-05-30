import { v2 as cloudinary } from "cloudinary";
import { MongoClient } from "mongodb";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const carsRoot = process.env.CARS_DIR || "C:\\Users\\HP\\Videos\\properties";
const mongoUri = process.env.MONGODB_URI;
const imageExtensions = new Set([".jpg", ".jpeg", ".jfif", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".mov", ".webm", ".m4v", ".avi"]);
const carCategories = ["Cars for Sale", "Cars for Rent"];

if (!process.env.CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL is required.");
}

if (!mongoUri) {
  throw new Error("MONGODB_URI is required.");
}

function cleanText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/[*_`]+/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bSuv\b/g, "SUV")
    .replace(/\bCe\b/g, "CE")
    .replace(/\bV8\b/gi, "V8")
    .replace(/\bRav4\b/gi, "RAV4")
    .replace(/\bBz4x\b/gi, "bZ4X")
    .replace(/\bGac\b/g, "GAC")
    .replace(/\bGs4\b/g, "GS4")
    .replace(/\bPhev\b/g, "PHEV")
    .replace(/\bVx\b/g, "VX")
    .replace(/\bTxl\b/g, "TXL")
    .replace(/\bD4d\b/g, "D4D")
    .replace(/\b4wd\b/gi, "4WD")
    .replace(/\bMl350\b/g, "ML350")
    .replace(/\bBmw\b/g, "BMW");
}

function folderReference(folderName) {
  return folderName
    .replace(/\s+MORE DETAILS NEEDED.*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function numericReference(folderName, fallback) {
  const match = folderName.match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

function extractTitle(note, reference) {
  const lines = note
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const patterns = [
    /\bFOR\s+(?:SALE|RENT)\s*:\s*(.+)$/i,
    /:\s*(.+?)\s+is\s+available\s+for\s+(?:sale|rent)\b/i,
    /^(.+?)\s+for\s+rent\b/i,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match?.[1]) {
        return normalizeTitle(match[1]);
      }
    }
  }

  const carLine = lines.find((line) => /\b(toyota|kia|hyundai|mercedes|bmw|nissan|honda|mazda|gac|mahindra|ford|subaru|volkswagen)\b/i.test(line));
  if (carLine) {
    return normalizeTitle(carLine);
  }

  return `${reference} Car Listing`;
}

function normalizeTitle(value) {
  const title = value
    .replace(/\s+#.*$/g, "")
    .replace(/\s+\+?250.*$/g, "")
    .replace(/\s+\d{9,}.*$/g, "")
    .replace(/\s+[-–]\s+.+$/g, "")
    .replace(/\s+is\s+available.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return titleCase(title || "Car Listing");
}

function parsePrice(note) {
  const priceLines = note
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /price/i.test(line));

  for (const line of priceLines) {
    const millionMatch = line.match(/price[^0-9]*(\d+(?:[.,]\d+)?)\s*m\b/i);
    if (millionMatch) {
      return Math.round(Number(millionMatch[1].replace(",", ".")) * 1_000_000);
    }

    const rwfMatch = line.match(/price[^0-9]*(\d[\d,\s]{3,})(?:\s*rwf)?/i);
    if (rwfMatch) {
      return Number(rwfMatch[1].replace(/[^\d]/g, ""));
    }
  }

  return 0;
}

function categoryFor(note) {
  return /\b(for\s+rent|rental|rent\s+[-\w]*)\b/i.test(note) ? "Cars for Rent" : "Cars for Sale";
}

function extractSpec(note, label) {
  const match = note.match(new RegExp(`${label}\\s*:\\s*([^\\n]+)`, "i"));
  return match?.[1]?.replace(/\s+/g, " ").trim();
}

function descriptionFor({ note, name, reference, category, price }) {
  const specs = [
    extractSpec(note, "Transmission") && `Transmission: ${extractSpec(note, "Transmission")}`,
    extractSpec(note, "Year") && `Year: ${extractSpec(note, "Year")}`,
    extractSpec(note, "Seats") && `Seats: ${extractSpec(note, "Seats")}`,
    extractSpec(note, "Engine") && `Engine: ${extractSpec(note, "Engine")}`,
  ].filter(Boolean);
  const intro = `${name} is available on Shopyacu under ${category}. Reference: ${reference}.${price ? "" : " Contact Shopyacu for the latest price."}`;
  const details = specs.length ? `${intro}\n${specs.join("\n")}` : intro;
  const cleanedNote = note.replace(/\bCall or WhatsApp\b.*$/gim, "").trim();

  return `${details}\n\n${cleanedNote}`.slice(0, 1400).trim();
}

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
    folder: `shopyacu/cars/${slug}`,
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

async function getListingNote(folderPath) {
  const files = await readdir(folderPath, { withFileTypes: true });
  const textFile = files.find((file) => file.isFile() && path.extname(file.name).toLowerCase() === ".txt");
  if (!textFile) return "";
  return cleanText(await readFile(path.join(folderPath, textFile.name), "utf8"));
}

async function getMediaFiles(folderPath) {
  const files = await readdir(folderPath, { withFileTypes: true });
  return files
    .filter((file) => file.isFile())
    .map((file) => ({ file, extension: path.extname(file.name).toLowerCase() }))
    .filter(({ extension }) => imageExtensions.has(extension) || videoExtensions.has(extension));
}

const entries = await readdir(carsRoot, { withFileTypes: true });
const folders = entries
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => numericReference(a.name, 0) - numericReference(b.name, 0) || a.name.localeCompare(b.name));

const client = new MongoClient(mongoUri);
await client.connect();
const collection = client.db("shopyacu").collection("products");

let seeded = 0;
let skipped = 0;

for (const [folderIndex, folder] of folders.entries()) {
  const folderPath = path.join(carsRoot, folder.name);
  const mediaFiles = await getMediaFiles(folderPath);

  if (!mediaFiles.length) {
    skipped += 1;
    console.log(`Skipped ${folder.name}: no media files.`);
    continue;
  }

  const note = await getListingNote(folderPath);
  const reference = folderReference(folder.name);
  const id = 10000 + numericReference(folder.name, folderIndex + 1);
  const name = extractTitle(note, reference);
  const category = categoryFor(note);
  const price = parsePrice(note);
  const generatedSlug = slugify(`${reference}-${name}`);
  const existing = await collection.findOne({ sourceFolder: folder.name, category: { $in: carCategories } });
  const slug = existing?.slug || generatedSlug;
  let media = existing?.media || [];

  if (process.env.FORCE_UPLOAD === "1" || media.length < mediaFiles.length) {
    media = [];
    for (const [index, { file, extension }] of mediaFiles.entries()) {
      const type = videoExtensions.has(extension) ? "video" : "image";
      media.push(await uploadMedia(path.join(folderPath, file.name), slug, index, type));
    }
  }

  const images = media.filter((item) => item.type === "image").map((item) => item.url);
  const videos = media.filter((item) => item.type === "video");
  const now = new Date();
  const product = {
    id,
    slug,
    name,
    category,
    price,
    image: images[0] || videos[0]?.poster,
    images,
    videos,
    media,
    cloudinaryPublicId: media[0]?.publicId,
    sourceFolder: folder.name,
    description: descriptionFor({ note, name, reference, category, price }),
    active: true,
    stock: "In stock",
    updatedAt: now,
  };

  await collection.updateOne(
    { slug },
    {
      $set: product,
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  seeded += 1;
  console.log(`${seeded}. Synced ${reference}: ${name} (${category}, ${price ? `${price} RWF` : "price on request"})`);
}

await client.close();

console.log(`Seeded ${seeded} car listings to MongoDB. Skipped ${skipped} folders without media.`);
