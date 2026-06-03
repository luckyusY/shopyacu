import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { formatBlogDate, readingTimeMinutes } from "@/lib/blog";
import { getBlogPosts } from "@/lib/blog-store";
import { absoluteUrl, buildOpenGraph, SITE_NAME } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const TITLE = "Shopyacu Blog — Shopping Guides & Home Ideas for Kigali";
const DESCRIPTION =
  "Buying guides, home ideas, and shopping tips for Kigali and Rwanda — air fryers, storage, home gyms, water dispensers, and more, with pay-on-delivery ordering.";

export const metadata: Metadata = {
  title: "Blog — Shopping Guides & Home Ideas for Kigali",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/blog") },
  ...buildOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/blog" }),
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();
  const [featured, ...rest] = posts;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description: DESCRIPTION,
    url: absoluteUrl("/blog"),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: { "@type": "Organization", name: SITE_NAME },
    })),
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <header className="border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Logo imgClassName="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <WhatsAppLink
              href={whatsappLink("Hello Shopyacu, I read your blog and want to order. Can you help me?")}
              track={{ source: "blog" }}
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1fb458] sm:px-5"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </WhatsAppLink>
            <Link href="/#products" className="rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink/85 sm:px-5">
              Shop
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted">Shopyacu Blog</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Shopping guides &amp; home ideas for Kigali
        </h1>
        <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-muted">
          Practical advice on what to buy, how to set up your home, and how to shop online safely in Rwanda — written to help you spend smarter.
        </p>
      </section>

      {featured ? (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid gap-6 overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm transition hover:shadow-xl lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="relative min-h-[260px] overflow-hidden lg:min-h-[420px]">
              <Image
                src={featured.heroImage}
                alt={featured.title}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-5 top-5 rounded-full bg-accent px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-ink">
                {featured.tag}
              </span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                {formatBlogDate(featured.publishedAt)} · {readingTimeMinutes(featured)} min read
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-4 text-base font-medium leading-7 text-muted">{featured.excerpt}</p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition group-hover:bg-accent group-hover:text-ink">
                Read the guide →
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[1.6rem] border border-ink/10 bg-white shadow-sm transition hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.heroImage}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-ink">
                  {post.tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted">
                  {formatBlogDate(post.publishedAt)} · {readingTimeMinutes(post)} min
                </p>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">{post.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm font-medium leading-6 text-muted">{post.excerpt}</p>
                <span className="mt-4 text-sm font-bold text-ink transition group-hover:text-accent">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-ink px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Ready to shop?</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Order anything on WhatsApp — pay on delivery.</h2>
          </div>
          <WhatsAppLink
            href={whatsappLink("Hello Shopyacu, I want to order. Can you help me?")}
            track={{ source: "blog" }}
            className="rounded-full bg-accent px-7 py-4 text-center text-sm font-bold text-ink transition hover:bg-white"
          >
            Start an order
          </WhatsAppLink>
        </div>
      </section>
    </main>
  );
}
