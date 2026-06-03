import type { WithId } from "mongodb";
import { getMongoClient } from "@/lib/mongodb";
import {
  blogPosts as fallbackPosts,
  normalizeBlogPost,
  sortPostsByDate,
  getRelatedPostsFrom,
  type BlogPost,
} from "@/lib/blog";

const databaseName = "shopyacu";
const collectionName = "blogPosts";

type BlogDocument = BlogPost & { _id?: unknown };

function serialize(document: WithId<BlogDocument> | BlogDocument): BlogPost | null {
  const post = { ...(document as BlogDocument) };
  delete post._id;
  return normalizeBlogPost(post);
}

async function getCollection() {
  const client = await getMongoClient();
  return client.db(databaseName).collection<BlogDocument>(collectionName);
}

/**
 * All published posts, newest first. Reads from MongoDB and falls back to the
 * bundled posts when the database is empty or unavailable — same pattern as the
 * product store, so the blog always renders.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const collection = await getCollection();
    const docs = await collection.find({}).sort({ publishedAt: -1 }).toArray();
    const posts = docs
      .map(serialize)
      .filter((post): post is BlogPost => Boolean(post));
    return sortPostsByDate(posts.length > 0 ? posts : fallbackPosts);
  } catch {
    return sortPostsByDate(fallbackPosts);
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  try {
    const collection = await getCollection();
    const doc = await collection.findOne({ slug });
    if (doc) return serialize(doc) ?? undefined;
  } catch {
    // fall through to bundled posts
  }
  return fallbackPosts.find((post) => post.slug === slug);
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return getRelatedPostsFrom(posts, slug, limit);
}

/** Upsert a post by slug. Used by the generation script and admin tooling. */
export async function saveBlogPost(input: Partial<BlogPost> & Record<string, unknown>) {
  const post = normalizeBlogPost(input);
  if (!post) return null;

  const collection = await getCollection();
  await collection.updateOne(
    { slug: post.slug },
    { $set: { ...post, updatedAt: post.updatedAt } },
    { upsert: true },
  );
  return post;
}

export async function deleteBlogPost(slug: string) {
  const collection = await getCollection();
  const result = await collection.deleteOne({ slug });
  return result.deletedCount > 0;
}
