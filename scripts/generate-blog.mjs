/**
 * Bulk-generate SEO-optimised blog posts with the ChatGPT (OpenAI) API and
 * upsert them into MongoDB so they render on the site automatically.
 *
 * Usage (run from the project root):
 *   npm run generate:blog                 # generate from the built-in topic list
 *   npm run generate:blog -- --count 20   # only the first 20 topics
 *   npm run generate:blog -- --ideas 100  # ask the model for 100 fresh topics, then write them
 *   npm run generate:blog -- --topics my-topics.txt   # one topic per line
 *   npm run generate:blog -- --model gpt-4o --dry-run  # preview without saving
 *
 * Requires in .env.local:
 *   OPENAI_API_KEY=sk-...
 *   MONGODB_URI=mongodb+srv://...
 * Optional:
 *   OPENAI_MODEL=gpt-4o-mini   (default)
 *   OPENAI_BASE_URL=https://api.openai.com/v1
 */
import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";

// ----------------------------- config / args -----------------------------
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
const COUNT = flag("count", false);
const IDEAS = flag("ideas", false);
const TOPICS_FILE = flag("topics", false);

const databaseName = "shopyacu";
const collectionName = "blogPosts";

if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required (add it to .env.local).");
if (!MONGODB_URI && !DRY_RUN) throw new Error("MONGODB_URI is required (or use --dry-run).");

// Marketplace category slugs the model is allowed to link to. Keep in sync with
// src/lib/categories.ts.
const CATEGORY_SLUGS = [
  "home", "wedding", "cars-for-sale", "cars-for-rent", "jobs", "scholarships",
  "pets", "electronics", "home-appliances", "bedding", "storage-racks",
  "fashion", "real-estate", "furniture", "services", "events",
];

// Built-in buyer-intent topics (used when no --topics file and no --ideas). Each
// targets a real search intent for shoppers in Kigali / Rwanda.
const DEFAULT_TOPICS = [
  "Best blenders for smoothies and cooking in Kigali",
  "How to choose an electric kettle for your home in Rwanda",
  "Top kitchen gadgets that save time for busy families in Kigali",
  "Buying a sandwich maker in Kigali: what to look for",
  "Best shoe racks to keep your entryway tidy in Rwanda",
  "Portable wardrobes vs built-in closets for Kigali renters",
  "How to organise a small kitchen in a Kigali apartment",
  "Choosing a dish rack that fits your sink and counter",
  "Best storage cabinets for clothes and supplies in Rwanda",
  "Decorating a rented room in Kigali without losing your deposit",
  "How to set up a cosy bedroom on a budget in Rwanda",
  "Choosing warm blankets and duvet sets for the rainy season",
  "Best ottoman stools for small living rooms in Kigali",
  "How to keep your bathroom clean and organised in Rwanda",
  "Corner shower caddies: do they really hold up?",
  "How to reduce washing machine noise and vibration at home",
  "Best resistance band workouts for beginners in Rwanda",
  "How to track fitness progress with a smart body scale",
  "Building a home gym in a small Kigali apartment",
  "Mini stepper vs skipping rope for home cardio in Rwanda",
  "Best water spray guns for gardening and car washing in Kigali",
  "Choosing a raincoat for the Rwanda rainy season",
  "How to protect your phone outdoors with a waterproof case",
  "Best laptop tables for working from home in Kigali",
  "How to stay productive working from a small space in Rwanda",
  "Air fryer recipes that work great for Rwandan meals",
  "How to clean and maintain your air fryer for longer life",
  "Standing vs countertop water dispensers for Kigali offices",
  "How to plan a small wedding decor budget in Kigali",
  "Choosing a colour theme for your Kigali wedding stage",
  "Gusaba ceremony decor ideas on a budget in Rwanda",
  "How online shopping delivery works across Kigali neighbourhoods",
  "Why pay-on-delivery is safer for online shopping in Rwanda",
  "How to spot a trustworthy online seller in Kigali",
  "Best housewarming gift ideas you can buy in Kigali",
  "Setting up a first apartment in Kigali: a starter shopping list",
  "How to childproof and organise a family home in Rwanda",
  "Best appliances to cut your electricity bill in Kigali",
  "How to keep food fresh longer without a big fridge in Rwanda",
  "Laundry day hacks: drying clothes faster in Kigali's climate",
];

// ----------------------------- product grounding -----------------------------
async function loadProductsFromSeed() {
  try {
    const source = await readFile("src/lib/products.ts", "utf8");
    const marker = "const productSeed";
    const start = source.indexOf("[", source.indexOf(marker));
    const end = source.indexOf("];", start);
    const literal = source.slice(start, end + 1);
    // eslint-disable-next-line no-new-func
    const seed = Function(`"use strict"; return (${literal});`)();
    return seed.map((p) => ({ slug: p.slug, name: p.name, category: p.category, image: p.image }));
  } catch {
    return [];
  }
}

async function loadProducts(client) {
  if (client) {
    try {
      const docs = await client
        .db(databaseName)
        .collection("products")
        .find({ active: { $ne: false } })
        .project({ slug: 1, name: 1, category: 1, image: 1, _id: 0 })
        .toArray();
      if (docs.length) return docs;
    } catch {
      /* fall back to seed file */
    }
  }
  return loadProductsFromSeed();
}

// ----------------------------- OpenAI helpers -----------------------------
async function openai(messages, { json = true } = {}) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.8,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function brainstormTopics(n, products) {
  const productHint = products.slice(0, 40).map((p) => p.name).join(", ");
  const content = await openai(
    [
      {
        role: "system",
        content:
          "You are an SEO strategist for Shopyacu, an online store and marketplace in Kigali, Rwanda that sells home, kitchen, bathroom, fitness, office, outdoor, appliance, storage, bedding, wedding and event products with WhatsApp pay-on-delivery. Output ONLY JSON.",
      },
      {
        role: "user",
        content: `Brainstorm ${n} distinct, high-intent blog post topics that would rank on Google for shoppers in Kigali/Rwanda and lead to product orders. Vary the angle (buying guides, comparisons, how-tos, local tips, gift ideas, seasonal). Avoid duplicates. Relevant products include: ${productHint}. Return JSON: {"topics": ["...", ...]}.`,
      },
    ],
  );
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.topics) ? parsed.topics.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function buildArticleMessages(topic, products) {
  const productList = products
    .map((p) => `- slug: ${p.slug} | ${p.name} | category: ${p.category} | image: ${p.image}`)
    .join("\n");

  const system = `You are a senior SEO content writer for Shopyacu, an online store and marketplace in Kigali, Rwanda.
Shopyacu sells practical home, kitchen, bathroom, fitness, office, outdoor, appliance, storage, bedding, wedding/event and wellness products.
Customers order on WhatsApp and pay on delivery — in Kinyarwanda this is "WISHYURA BIKUGEZEHO" (pay when it reaches you). A real person replies on WhatsApp.
Write helpful, accurate, original content for readers in Kigali and across Rwanda. Be specific and locally relevant. Use British/international English.
NEVER invent exact prices as facts — if you mention price, phrase it as "around X RWF (2026 guide)" or tell readers to message on WhatsApp for the current price.
You MUST output a single valid JSON object only — no markdown, no commentary.`;

  const user = `Write one SEO-optimised blog post for this topic: "${topic}".

Output JSON with EXACTLY this shape:
{
  "slug": "short-kebab-case-slug",
  "title": "compelling H1 (max 70 chars)",
  "metaTitle": "SEO title tag (max 60 chars)",
  "description": "meta description, 150-160 chars, includes the main keyword",
  "excerpt": "1-2 sentence summary for cards",
  "keywords": ["5-8 search keywords, include Kigali/Rwanda variants"],
  "tag": "one of: Buying Guide, Home Ideas, Fitness, Events, How It Works, Kitchen, Storage",
  "heroImage": "pick the MOST relevant image path from the product list below, or omit",
  "relatedCategorySlugs": ["2-4 slugs from the allowed category list"],
  "featuredProductSlugs": ["2-4 slugs from the product list that fit this article"],
  "sections": [
    { "type": "p", "text": "..." },
    { "type": "h2", "text": "..." },
    { "type": "ul", "items": ["...", "..."] },
    { "type": "ol", "items": ["...", "..."] },
    { "type": "quote", "text": "..." }
  ],
  "faqs": [ { "q": "...", "a": "..." } ]
}

Content rules:
- 900-1400 words total across the sections. Start with one or two intro "p" sections (no heading before them).
- Use 3-6 "h2" headings; under each, 1-3 paragraphs and/or one list. Include at least one "ul" or "ol" and exactly one "quote".
- Naturally include the main keyword in the title, first paragraph, and one H2.
- Mention WhatsApp ordering and pay-on-delivery (WISHYURA BIKUGEZEHO) once, naturally, near the end.
- Write 3-5 genuinely useful FAQs with concise answers (good for FAQ rich results).
- ONLY use category slugs from this allowed list: ${CATEGORY_SLUGS.join(", ")}.
- ONLY use product slugs and image paths that appear in this product list (do not invent any):
${productList}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ----------------------------- main -----------------------------
async function main() {
  const client = MONGODB_URI && !DRY_RUN ? new MongoClient(MONGODB_URI) : null;
  if (client) await client.connect();

  const products = await loadProducts(client);
  const productSlugs = new Set(products.map((p) => p.slug));
  const productImages = new Set(products.map((p) => p.image));
  console.log(`Grounding on ${products.length} products.`);

  // Decide the topic list.
  let topics;
  if (TOPICS_FILE && typeof TOPICS_FILE === "string") {
    const raw = await readFile(TOPICS_FILE, "utf8");
    topics = raw.split(/\r?\n/).map((t) => t.trim()).filter(Boolean);
    console.log(`Loaded ${topics.length} topics from ${TOPICS_FILE}.`);
  } else if (IDEAS) {
    const n = Number(IDEAS) || 50;
    console.log(`Asking ${MODEL} for ${n} topic ideas...`);
    topics = await brainstormTopics(n, products);
    console.log(`Got ${topics.length} topic ideas.`);
  } else {
    topics = DEFAULT_TOPICS;
  }

  if (COUNT) topics = topics.slice(0, Number(COUNT) || topics.length);
  if (!topics.length) throw new Error("No topics to generate.");

  const collection = client ? client.db(databaseName).collection(collectionName) : null;
  let ok = 0;
  let skipped = 0;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const label = `[${i + 1}/${topics.length}] ${topic}`;
    try {
      const content = await openai(buildArticleMessages(topic, products));
      const post = JSON.parse(content);

      // Server-side guards: enforce real slugs/images and valid categories.
      post.slug = slugify(post.slug || post.title || topic);
      post.featuredProductSlugs = (post.featuredProductSlugs || []).filter((s) => productSlugs.has(s));
      post.relatedCategorySlugs = (post.relatedCategorySlugs || []).filter((s) => CATEGORY_SLUGS.includes(s));
      if (post.heroImage && !productImages.has(post.heroImage)) {
        // Fall back to the first featured product's image, else the logo.
        const fp = products.find((p) => p.slug === post.featuredProductSlugs[0]);
        post.heroImage = fp?.image || "/logo.png";
      }
      const today = new Date();
      post.author = "The Shopyacu Team";
      post.publishedAt = post.publishedAt || today.toISOString().slice(0, 10);
      post.updatedAt = today.toISOString().slice(0, 10);

      if (!post.title || !Array.isArray(post.sections) || post.sections.length < 2) {
        console.warn(`  ✗ ${label} — invalid content, skipped`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  ✓ ${label} → ${post.slug} (${post.sections.length} sections) [dry-run]`);
      } else {
        await collection.updateOne(
          { slug: post.slug },
          { $set: { ...post, updatedAt: new Date(post.updatedAt), createdAt: new Date() } },
          { upsert: true },
        );
        console.log(`  ✓ ${label} → /blog/${post.slug}`);
      }
      ok++;
    } catch (error) {
      console.warn(`  ✗ ${label} — ${error.message}`);
      skipped++;
    }
  }

  console.log(`\nDone. ${ok} generated, ${skipped} skipped.${DRY_RUN ? " (dry run — nothing saved)" : ""}`);
  if (client) await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
