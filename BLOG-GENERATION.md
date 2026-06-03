# Generating SEO blog posts with the ChatGPT API

This project can mass-generate SEO-optimised blog posts using the OpenAI/ChatGPT
API and store them in MongoDB. Posts render automatically at `/blog` and
`/blog/<slug>`, get full metadata + Article/FAQ JSON-LD, internal links to your
products & categories, and are added to `sitemap.xml`.

## One-time setup

Add to `.env.local`:

```
OPENAI_API_KEY=sk-...           # from https://platform.openai.com/api-keys
OPENAI_MODEL=gpt-4o-mini        # optional; cheap & good for articles
MONGODB_URI=mongodb+srv://...   # already set for the store
```

## Generate posts

```bash
# Generate from the built-in list of ~40 buyer-intent topics
npm run generate:blog

# Ask the model to brainstorm 100 fresh topics, then write all of them
npm run generate:blog -- --ideas 100

# Generate from your own topics (one per line)
npm run generate:blog -- --topics my-topics.txt

# Limit how many to write this run
npm run generate:blog -- --count 25

# Preview without saving anything to the database
npm run generate:blog -- --ideas 20 --dry-run

# Use a stronger model
npm run generate:blog -- --model gpt-4o --ideas 50
```

The script **grounds the model on your real catalogue**: it only allows
`featuredProductSlugs`, `heroImage`, and `relatedCategorySlugs` that actually
exist, so internal links never break. Posts are upserted by `slug`, so
re-running updates rather than duplicating.

## How it shows up on the site

- Posts are read live from MongoDB by `src/lib/blog-store.ts`.
- When the DB has posts they replace the bundled fallback in `src/lib/blog.ts`.
- New posts appear at `/blog` and in `/sitemap.xml` immediately (no redeploy) —
  as long as the latest code (with the blog store) is deployed.

## Cost & rate

`gpt-4o-mini` generates a full article for a fraction of a cent. The script runs
topics sequentially; for hundreds of posts expect several minutes. If you hit
rate limits, run in smaller batches with `--count`.

## Quality tips for ranking

- Generate in themed batches (e.g. all "kitchen" topics) so internal linking
  clusters well.
- Keep topics specific and buyer-intent ("best X for Y in Kigali"), not generic.
- Review a sample before bulk-publishing; edit any post directly in MongoDB.
- Submit the sitemap in Google Search Console and request indexing for new URLs.
