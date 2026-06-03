import type { WithId } from "mongodb";
import { getMongoClient } from "@/lib/mongodb";
import { slugify } from "@/lib/products";

const databaseName = "shopyacu";
const collectionName = "productCollections";

export type ProductCollection = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  productSlugs: string[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ProductCollectionDocument = Omit<ProductCollection, "createdAt" | "updatedAt"> & {
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

function serializeCollection(document: WithId<ProductCollectionDocument> | ProductCollectionDocument): ProductCollection {
  const collection = { ...(document as ProductCollectionDocument & { _id?: unknown }) };
  delete collection._id;

  return {
    id: Number(collection.id) || Date.now(),
    slug: collection.slug,
    title: collection.title,
    description: collection.description,
    productSlugs: Array.isArray(collection.productSlugs) ? collection.productSlugs.filter(Boolean) : [],
    active: collection.active !== false,
    createdAt: collection.createdAt ? new Date(collection.createdAt).toISOString() : undefined,
    updatedAt: collection.updatedAt ? new Date(collection.updatedAt).toISOString() : undefined,
  };
}

async function getCollection() {
  const client = await getMongoClient();
  return client.db(databaseName).collection<ProductCollectionDocument>(collectionName);
}

export async function getProductCollections({ includeInactive = false } = {}) {
  try {
    const filter = includeInactive ? {} : { active: { $ne: false } };
    const collections = await getCollection().then((store) =>
      store.find(filter).sort({ updatedAt: -1, createdAt: -1, id: -1 }).toArray(),
    );
    return collections.map(serializeCollection);
  } catch {
    return [];
  }
}

export async function getProductCollectionBySlug(slug: string, { includeInactive = false } = {}) {
  try {
    const collection = await getCollection().then((store) => store.findOne({ slug }));
    if (!collection) return null;
    const serialized = serializeCollection(collection);
    return includeInactive || serialized.active !== false ? serialized : null;
  } catch {
    return null;
  }
}

export async function saveProductCollection(input: Partial<ProductCollection>) {
  const store = await getCollection();
  const now = new Date();
  const title = input.title?.trim() || "Product collection";
  const slug = slugify(input.slug || title);
  const existing = await store.findOne({ slug });
  const maxCollection = await store.find({}).sort({ id: -1 }).limit(1).next();
  const id = Number(input.id || existing?.id || (maxCollection?.id || 0) + 1);
  const productSlugs = Array.from(new Set((input.productSlugs || []).map((item) => item.trim()).filter(Boolean)));

  const collection: ProductCollection = {
    id,
    slug,
    title,
    description: input.description?.trim() || undefined,
    productSlugs,
    active: input.active !== false,
    createdAt: existing?.createdAt ? new Date(existing.createdAt).toISOString() : now.toISOString(),
    updatedAt: now.toISOString(),
  };

  await store.updateOne(
    { slug },
    {
      $set: {
        ...collection,
        createdAt: collection.createdAt ? new Date(collection.createdAt) : now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  return collection;
}

export async function patchProductCollection(slug: string, input: Partial<ProductCollection>) {
  const store = await getCollection();
  const existing = await store.findOne({ slug });
  if (!existing) return null;

  const nextSlug = input.slug ? slugify(input.slug) : slug;
  const now = new Date();
  const collection: ProductCollection = {
    ...serializeCollection(existing),
    ...input,
    id: existing.id,
    slug: nextSlug,
    title: input.title?.trim() || existing.title,
    description: input.description?.trim() || undefined,
    productSlugs: Array.from(new Set((input.productSlugs || existing.productSlugs || []).map((item) => item.trim()).filter(Boolean))),
    active: input.active !== false,
    updatedAt: now.toISOString(),
  };

  if (nextSlug !== slug) {
    await store.deleteOne({ slug });
  }

  await store.updateOne(
    { slug: nextSlug },
    {
      $set: {
        ...collection,
        createdAt: collection.createdAt ? new Date(collection.createdAt) : now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  return collection;
}

export async function deleteProductCollection(slug: string) {
  const store = await getCollection();
  const existing = await store.findOne({ slug });
  if (!existing) return null;
  await store.deleteOne({ slug });
  return serializeCollection(existing);
}
