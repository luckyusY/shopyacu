# Shopyacu Online Store

Shopyacu is a product catalog storefront for local online orders in Kigali.

## Static Site

The working no-build version is available at:

```text
http://127.0.0.1:4173/index.html
```

The static admin panel is available at:

```text
http://127.0.0.1:4173/admin.html
```

Start it from this folder with:

```bash
python -m http.server 4173 -b 127.0.0.1
```

The static site uses:

- `index.html`
- `admin.html`
- `styles.css`
- `app.js`
- `admin.js`
- `public/products/*.jpg`

Orders are sent through WhatsApp at `0789448107`.

## Next.js App

The repository also includes a Next.js App Router implementation in `src/app`.

After freeing disk space, install dependencies and run:

```bash
npm install
npm run dev
```

The Next.js app includes Lenis smooth scrolling and Framer Motion page/product animations.

## Product Import

Secrets live in `.env.local`, which is ignored by git. To upload product images to Cloudinary and upsert product documents into MongoDB:

```bash
npm run seed:products
```

The importer scans:

```text
C:\Users\HP\Videos\products
```

You can override that path with `PRODUCTS_DIR`.
