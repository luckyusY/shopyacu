import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ShareActions } from "@/components/ShareActions";
import { ProductCard } from "@/components/ProductCard";
import {
  getBlogPost,
  getBlogPosts,
  getRelatedPosts,
  formatBlogDate,
  readingTimeMinutes,
  type BlogSection,
} from "@/lib/blog";
import { getMarketplaceCategory, categoryPath } from "@/lib/categories";
import { getProducts } from "@/lib/product-store";
import { whatsappLink } from "@/lib/whatsapp";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildOpenGraph,
  breadcrumbJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article not found" };

  const path = `/blog/${post.slug}`;
  return {
    title: post.metaTitle,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: absoluteUrl(path) },
    ...buildOpenGraph({
      title: post.title,
      description: post.description,
      path,
      image: post.heroImage,
      type: "article",
    }),
  };
}

function Section({ section }: { section: BlogSection }) {
  switch (section.type) {
    case "h2":
      return <h2 className="mt-10 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">{section.text}</h2>;
    case "h3":
      return <h3 className="mt-7 font-display text-xl font-bold leading-tight text-ink">{section.text}</h3>;
    case "ul":
      return (
        <ul className="mt-4 grid gap-2.5 pl-1">
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-base font-medium leading-7 text-muted">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-4 grid gap-3">
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-base font-medium leading-7 text-muted">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-black text-accent">{i + 1}</span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="mt-8 border-l-4 border-accent bg-white px-5 py-4 font-display text-lg font-semibold italic leading-7 text-ink shadow-sm">
          {section.text}
        </blockquote>
      );
    default:
      return <p className="mt-4 text-base font-medium leading-8 text-muted">{section.text}</p>;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const allProducts = await getProducts();
  const featuredProducts = post.featuredProductSlugs
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const relatedCategories = post.relatedCategorySlugs
    .map((s) => getMarketplaceCategory(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const relatedPosts = getRelatedPosts(post.slug, 3);
  const readingTime = readingTimeMinutes(post);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: absoluteUrl(post.heroImage),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${post.slug}`) },
    keywords: post.keywords.join(", "),
  };

  const faqJsonLd =
    post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }
      : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Logo imgClassName="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/blog" className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white">
              All articles
            </Link>
            <WhatsAppLink
              href={whatsappLink(`Hello Shopyacu, I read "${post.title}" and want to order. Can you help?`)}
              track={{ source: "blog" }}
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1fb458]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </WhatsAppLink>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-ink">Blog</Link>
          <span>/</span>
          <span className="text-ink/60">{post.tag}</span>
        </nav>

        <span className="mt-5 inline-flex rounded-full bg-accent px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-ink">
          {post.tag}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-[2.7rem] sm:leading-[1.1]">
          {post.title}
        </h1>
        <p className="mt-4 text-lg font-medium leading-8 text-muted">{post.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-muted">
          <span>{post.author}</span>
          <span className="h-1 w-1 rounded-full bg-ink/25" />
          <span>{formatBlogDate(post.publishedAt)}</span>
          <span className="h-1 w-1 rounded-full bg-ink/25" />
          <span>{readingTime} min read</span>
        </div>

        <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-[1.6rem] bg-ink shadow-lg">
          <Image src={post.heroImage} alt={post.title} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>

        <ShareActions
          compact
          title={`${post.title} | ${SITE_NAME}`}
          text={post.excerpt}
          path={`/blog/${post.slug}`}
          className="mt-6"
        />

        <div className="mt-2">
          {post.sections.map((section, i) => (
            <Section key={i} section={section} />
          ))}
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-12 rounded-[1.6rem] border border-ink/10 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Shop this guide</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">Products mentioned in this article</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} fluid />
              ))}
            </div>
          </div>
        ) : null}

        {relatedCategories.length > 0 ? (
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Browse related categories</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={categoryPath(category)}
                  className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm font-bold text-ink/75 transition hover:bg-ink hover:text-white"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {post.faqs.length > 0 ? (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Frequently asked questions</h2>
            <div className="mt-5 grid gap-3">
              {post.faqs.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 font-display text-base font-bold text-ink marker:content-none">
                    {faq.q}
                    <span className="text-accent transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-base font-medium leading-7 text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 rounded-[1.6rem] bg-ink p-6 text-white shadow-xl sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">No prepayment</p>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Ready to order? Pay on delivery.</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-white/70">
            Message a real person on WhatsApp. We confirm the price, colour, and delivery time, and you pay only when it reaches you (WISHYURA BIKUGEZEHO).
          </p>
          <WhatsAppLink
            href={whatsappLink(`Hello Shopyacu, I read "${post.title}" and I want to order. Can you help me?`)}
            track={{ source: "blog" }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-bold text-ink transition hover:bg-white"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Order on WhatsApp
          </WhatsAppLink>
        </div>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink">Keep reading</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-ink/10 bg-white shadow-sm transition hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={related.heroImage} alt={related.title} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted">{related.tag}</p>
                  <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-ink">{related.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
