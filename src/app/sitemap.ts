import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { marketplaceCategories } from "@/lib/categories";
import { getProducts } from "@/lib/product-store";
import { blogPosts } from "@/lib/blog";

// Dynamic sitemap covering the homepage, the categories hub, every marketplace
// category, every live product, the blog index, and every blog post. Submitted
// to Google Search Console via robots.txt so new products/posts get crawled.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = marketplaceCategories.map((category) => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productRoutes = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // If the product store is unavailable, still return the static + category
    // + blog routes so the sitemap never fails to build.
  }

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes, ...productRoutes];
}
