import { getMongoClient } from "@/lib/mongodb";

const databaseName = "shopyacu";
const collectionName = "settings";
const visibilityKey = "category-visibility";

type CategoryVisibilityDocument = {
  key: typeof visibilityKey;
  hiddenCategories?: string[];
  updatedAt?: Date | string;
};

function normalizeCategories(categories: unknown) {
  const values = Array.isArray(categories) ? categories : [];
  return Array.from(
    new Set(
      values
        .map((category) => String(category).trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

async function getCollection() {
  const client = await getMongoClient();
  return client.db(databaseName).collection<CategoryVisibilityDocument>(collectionName);
}

export async function getHiddenCategories() {
  try {
    const settings = await getCollection().then((collection) => collection.findOne({ key: visibilityKey }));
    return normalizeCategories(settings?.hiddenCategories);
  } catch {
    return [];
  }
}

export async function saveHiddenCategories(categories: unknown) {
  const hiddenCategories = normalizeCategories(categories);
  const now = new Date();

  await getCollection().then((collection) =>
    collection.updateOne(
      { key: visibilityKey },
      { $set: { key: visibilityKey, hiddenCategories, updatedAt: now } },
      { upsert: true },
    ),
  );

  return hiddenCategories;
}

export function isCategoryHidden(category: string | undefined, hiddenCategories: string[]) {
  return Boolean(category && hiddenCategories.includes(category));
}
