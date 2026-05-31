import type { Filter, WithId } from "mongodb";
import { getMongoClient } from "@/lib/mongodb";
import { normalizeProduct, products as fallbackProducts, slugify, type Product } from "@/lib/products";

const databaseName = "shopyacu";
const collectionName = "products";

type ProductDocument = Omit<Product, "createdAt" | "updatedAt"> & {
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

function serializeProduct(document: WithId<ProductDocument> | ProductDocument): Product {
  const product = { ...(document as ProductDocument & { _id?: unknown }) };
  delete product._id;

  return normalizeProduct({
    ...product,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : undefined,
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
  });
}

async function getCollection() {
  const client = await getMongoClient();
  return client.db(databaseName).collection<ProductDocument>(collectionName);
}

export async function getProducts({ includeInactive = false } = {}) {
  try {
    const filter: Filter<ProductDocument> = includeInactive ? {} : { active: { $ne: false } };
    const remoteProducts = await getCollection()
      .then((collection) => collection.find(filter).sort({ id: 1, createdAt: 1 }).toArray());

    return remoteProducts.length > 0 ? remoteProducts.map(serializeProduct) : fallbackProducts;
  } catch {
    return includeInactive ? fallbackProducts : fallbackProducts.filter((product) => product.active !== false);
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await getCollection().then((collection) => collection.findOne({ slug }));
    if (product) return serializeProduct(product);
  } catch {
    // Fall back to bundled products below when MongoDB is not configured or temporarily unavailable.
  }

  return fallbackProducts.find((product) => product.slug === slug);
}

export async function saveProduct(input: Partial<Product>) {
  const collection = await getCollection();
  const now = new Date();
  const slug = input.slug?.trim() || slugify(input.name || "product");
  const existing = await collection.findOne({ slug });
  const maxProduct = await collection.find({}).sort({ id: -1 }).limit(1).next();
  const id = Number(input.id || existing?.id || (maxProduct?.id || fallbackProducts.length) + 1);
  const product = normalizeProduct({
    ...existing,
    ...input,
    id,
    slug,
    createdAt: existing?.createdAt ? new Date(existing.createdAt).toISOString() : now.toISOString(),
    updatedAt: now.toISOString(),
  });

  await collection.updateOne(
    { slug },
    {
      $set: {
        ...product,
        createdAt: product.createdAt ? new Date(product.createdAt) : now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  return product;
}

export async function patchProduct(slug: string, input: Partial<Product>) {
  const collection = await getCollection();
  const existing = await collection.findOne({ slug });
  if (!existing) return null;

  const product = normalizeProduct({
    ...existing,
    ...input,
    slug,
    id: existing.id,
    createdAt: existing.createdAt ? new Date(existing.createdAt).toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  });

  await collection.updateOne(
    { slug },
    {
      $set: {
        ...product,
        createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
        updatedAt: new Date(),
      },
    },
  );

  return product;
}

export async function deleteProduct(slug: string): Promise<Product | null> {
  const collection = await getCollection();
  const existing = await collection.findOne({ slug });
  if (!existing) return null;

  await collection.deleteOne({ slug });
  return serializeProduct(existing);
}
