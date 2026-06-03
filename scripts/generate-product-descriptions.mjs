/**
 * Enrich every product with the ChatGPT (OpenAI) API: a richer SEO description,
 * "why people buy it" highlights, "how to use it" steps, and long-tail SEO
 * keywords. Results are upserted into MongoDB and render on each product page.
 *
 * Usage (from the project root):
 *   npm run generate:products              # enrich products missing highlights
 *   npm run generate:products -- --overwrite          # redo every product
 *   npm run generate:products -- --count 10           # only the first 10
 *   npm run generate:products -- --slugs mini-stepper,electric-kettle
 *   npm run generate:products -- --dry-run            # preview, save nothing
 *   npm run generate:products -- --model gpt-4o
 *
 * Requires in .env.local: OPENAI_API_KEY, MONGODB_URI. Optional: OPENAI_MODEL.
 */
import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";

const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = args[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const MODEL = flag("model", process.env.OPENAI_MODEL || "gpt-4o-mini");
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const DRY_RUN = Boolean(flag("dry-run", false));
const OVERWRITE = Boolean(flag("overwrite", false));
const COUNT = flag("count", false);
const SLUGS = flag("slugs", false);

const databaseName = "shopyacu";
const collectionName = "products";

if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required (add it to .env.local).");
if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");

// ----------------------------- load products -----------------------------
async function loadSeedProducts() {
  const source = await readFile("src/lib/products.ts", "utf8");
  const read = (marker, openChar, term) => {
    const start = source.indexOf(openChar, source.indexOf(marker));
    const end = source.indexOf(term, start);
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${source.slice(start, end + 1)});`)();
  };
  const seed = read("const productSeed", "[", "];");
  const gallery = read("const galleryImages", "{", "};");
  return seed.map((p) => {
    const images = [p.image, ...((gallery[p.id] || []).map((img) => `/products/${img}`))];
    return { ...p, images };
  });
}

// ----------------------------- OpenAI -----------------------------
async function openai(messages) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      messages,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

const WELLNESS_HINTS = [
  "wellness", "supplement", "capsule", "tea", "cream", "gel", "oil", "detox",
  "personal care", "men", "skin", "oral", "beauty", "slim", "fat burner",
  "enlargement", "booster", "growth", "creatine", "omega",
];

function isWellness(product) {
  const text = `${product.name} ${product.category} ${(product.tags || []).join(" ")}`.toLowerCase();
  return WELLNESS_HINTS.some((h) => text.includes(h));
}

function buildMessages(product) {
  const wellness = isWellness(product);
  const system = `You are an expert e-commerce SEO copywriter for Shopyacu, an online store in Kigali, Rwanda.
Customers order on WhatsApp and pay on delivery (WISHYURA BIKUGEZEHO). Write accurate, honest, original copy for shoppers in Kigali and across Rwanda, in British/international English.
Use specific LONG-TAIL / NICHE keywords naturally (e.g. "space-saving stainless steel shoe rack for small Kigali apartments") so the description ranks for more searches and is better seen on Google. Do not keyword-stuff.
Never invent exact prices as facts. ${wellness ? "This is a wellness/personal-care item: make NO medical, health, or results claims; tell readers to read the product label and use only as directed." : ""}
Output a single valid JSON object only.`;

  const user = `Product:
- name: ${product.name}
- category: ${product.category}
- tags: ${(product.tags || []).join(", ") || "n/a"}
- current description: ${product.description || "n/a"}

Return JSON with EXACTLY this shape:
{
  "description": "2 short HTML paragraphs using only <p> and <strong> tags. ~50-90 words total. Natural long-tail keywords. Describe what it is and who it's for in Kigali/Rwanda.",
  "highlights": ["4-6 short benefit/use bullet points (plain text, no HTML), each under 15 words"],
  "howToUse": ["3-5 short, practical steps for using the product (plain text)"],
  "seoKeywords": ["6-10 long-tail search keywords incl. Kigali/Rwanda variants"]
}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

// Lightweight sanitiser for the model-generated HTML description.
function sanitizeHtml(html) {
  return String(html || "")
    .replace(/<\s*(script|style|iframe)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function cleanList(value, max, maxLen) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((v) => String(v).trim().slice(0, maxLen)).filter(Boolean))).slice(0, max);
}

// ----------------------------- main -----------------------------
async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const collection = client.db(databaseName).collection(collectionName);

  const dbProducts = await collection.find({}).toArray();
  let products = dbProducts.length ? dbProducts : await loadSeedProducts();
  const fromSeed = dbProducts.length === 0;
  console.log(`Loaded ${products.length} products ${fromSeed ? "from seed file (DB empty)" : "from MongoDB"}.`);

  if (SLUGS && typeof SLUGS === "string") {
    const set = new Set(SLUGS.split(",").map((s) => s.trim()));
    products = products.filter((p) => set.has(p.slug));
  }
  if (!OVERWRITE && !SLUGS) {
    products = products.filter((p) => !(Array.isArray(p.highlights) && p.highlights.length));
  }
  if (COUNT) products = products.slice(0, Number(COUNT) || products.length);

  if (!products.length) {
    console.log("Nothing to do (all products already enriched — use --overwrite to redo).");
    await client.close();
    return;
  }

  let ok = 0;
  let skipped = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const label = `[${i + 1}/${products.length}] ${product.name}`;
    try {
      const parsed = JSON.parse(await openai(buildMessages(product)));
      const update = {
        description: sanitizeHtml(parsed.description) || product.description,
        highlights: cleanList(parsed.highlights, 6, 200),
        howToUse: cleanList(parsed.howToUse, 6, 200),
        seoKeywords: cleanList(parsed.seoKeywords, 12, 80),
        updatedAt: new Date(),
      };
      if (!update.highlights.length && !update.description) {
        console.warn(`  ✗ ${label} — empty result, skipped`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  ✓ ${label} → ${update.highlights.length} highlights, ${update.howToUse.length} steps [dry-run]`);
      } else {
        const setOnInsert = fromSeed
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              category: product.category,
              price: product.price ?? 0,
              image: product.image,
              images: product.images || [product.image],
              tags: product.tags || [],
              badge: product.badge,
              active: true,
              createdAt: new Date(),
            }
          : {};
        await collection.updateOne(
          { slug: product.slug },
          { $set: update, ...(fromSeed ? { $setOnInsert: setOnInsert } : {}) },
          { upsert: true },
        );
        console.log(`  ✓ ${label} → /products/${product.slug}`);
      }
      ok++;
    } catch (error) {
      console.warn(`  ✗ ${label} — ${error.message}`);
      skipped++;
    }
  }

  console.log(`\nDone. ${ok} enriched, ${skipped} skipped.${DRY_RUN ? " (dry run — nothing saved)" : ""}`);
  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
