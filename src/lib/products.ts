export type ProductMedia = {
  type: "image" | "video";
  url: string;
  publicId?: string;
  poster?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes?: number;
  format?: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  videos?: ProductMedia[];
  media?: ProductMedia[];
  badge?: string;
  description: string;
  stock?: string;
  active?: boolean;
  featured?: boolean;
  cloudinaryPublicId?: string;
  sourceFolder?: string;
  createdAt?: string;
  updatedAt?: string;
};

const productSeed: Product[] = [
  { id: 1, slug: "multi-function-chopping-vegetable-cutter", name: "Multi-function Chopping Vegetable Cutter", category: "Kitchen", price: 18000, image: "/products/product-01.jpg", badge: "Popular", description: "A compact kitchen helper for slicing, dicing, and prepping vegetables faster." },
  { id: 2, slug: "toilet-paper-basket-holder", name: "Toilet Paper Basket Holder", category: "Bathroom", price: 22000, image: "/products/product-02.jpg", description: "A neat organizer for tissue rolls, bathroom essentials, and small toiletries." },
  { id: 3, slug: "double-pole-telescopic-clothes-rack", name: "Double Pole Telescopic Clothes Rack", category: "Home", price: 45000, image: "/products/product-03.jpg", badge: "Space saver", description: "Adjustable clothes storage for bedrooms, laundry areas, and rentals." },
  { id: 4, slug: "mini-stepper", name: "Mini Stepper", category: "Fitness", price: 65000, image: "/products/product-04.jpg", description: "A home fitness stepper for low-impact cardio and daily movement." },
  { id: 5, slug: "washing-machine-feet-pad", name: "4PCS Washing Machine Feet Pad", category: "Home", price: 18000, image: "/products/product-05.jpg", description: "Anti-vibration support pads for washing machines, fridges, and furniture legs." },
  { id: 6, slug: "multifunctional-movable-base-stand", name: "Multifunctional Movable Base Stand", category: "Home", price: 35000, image: "/products/product-06.jpg", description: "A mobile base stand for moving appliances and keeping them raised from the floor." },
  { id: 7, slug: "clothes-drying-rack", name: "Clothes Drying Rack", category: "Home", price: 42000, image: "/products/product-07.jpg", badge: "Foldable", description: "A practical drying rack for balconies, laundry rooms, and indoor spaces." },
  { id: 8, slug: "resistance-band-set", name: "Resistance Band Exercise Straps Set of 5", category: "Fitness", price: 28000, image: "/products/product-08.jpg", description: "Heavy-duty elastic straps for home gym, yoga, stretching, and strength work." },
  { id: 9, slug: "rain-coat-available", name: "Rain Coat", category: "Outdoor", price: 20000, image: "/products/product-09.jpg", description: "Light rain protection for commuters, riders, and everyday errands." },
  { id: 10, slug: "shower-caddy-5-pack", name: "Shower Caddy 5 Pack", category: "Bathroom", price: 38000, image: "/products/product-10.jpg", badge: "Set", description: "Adhesive bathroom shelves for shampoos, soaps, skincare, and shower tools." },
  { id: 11, slug: "adjustable-laptop-bed-table", name: "Adjustable Laptop Bed Table", category: "Office", price: 36000, image: "/products/product-11.jpg", description: "A flexible laptop table for bed, sofa, studying, and remote work." },
  { id: 12, slug: "gushyushya-amazi", name: "Gushyushya Amazi", category: "Kitchen", price: 25000, image: "/products/product-12.jpg", description: "A convenient household water-heating product for daily home use." },
  { id: 13, slug: "three-nozzle-electric-air-pump", name: "3 Nozzle Electric Air Pump", category: "Outdoor", price: 30000, image: "/products/product-13.jpg", description: "Electric air pump with multiple nozzles for inflatables and household use." },
  { id: 14, slug: "foldable-face-shield", name: "Household Daily Essential", category: "Home", price: 15000, image: "/products/product-14.jpg", description: "A useful everyday item selected for quick home organization and convenience." },
  { id: 15, slug: "furniture-mover-price", name: "Furniture Mover", category: "Home", price: 28000, image: "/products/product-15.jpg", description: "Move heavy furniture more easily while protecting floors from scratches." },
  { id: 16, slug: "stainless-steel-shoes-rack", name: "Stainless Steel Shoes Rack", category: "Home", price: 32000, image: "/products/product-16.jpg", description: "Durable shoe storage that keeps entryways and bedrooms tidy." },
  { id: 17, slug: "multifunction-8-in-1-blender", name: "Multifunction 8 in 1 Blender", category: "Kitchen", price: 75000, image: "/products/product-17.jpg", badge: "Kitchen pick", description: "A multi-use blender for smoothies, sauces, grinding, and daily cooking prep." },
  { id: 18, slug: "garden-hose-water-spray-gun", name: "Garden Hose Water Spray Gun 8 Mode", category: "Outdoor", price: 22000, image: "/products/product-18.jpg", description: "Eight spray modes for gardening, cleaning, car washing, and outdoor chores." },
  { id: 19, slug: "silver-crest-air-fryer-2400-watts", name: "Silver Crest Air Fryer 2400 Watts", category: "Kitchen", price: 98000, image: "/products/product-19.jpg", badge: "Hot deal", description: "Large-capacity air fryer for crisp meals with less oil and easy cleanup." },
  { id: 20, slug: "toilet-rack", name: "Toilet Rack", category: "Bathroom", price: 42000, image: "/products/product-20.jpg", description: "Over-toilet storage for towels, toiletries, tissue, and bathroom accessories." },
  { id: 21, slug: "corner-shower-caddy", name: "Corner Shower Caddy", category: "Bathroom", price: 30000, image: "/products/product-21.jpg", badge: "Featured", description: "Corner-mounted bathroom shelves with strong adhesive for tidy shower storage." },
  { id: 22, slug: "double-pole-telescopic", name: "Double Pole Telescopic Rack", category: "Home", price: 45000, image: "/products/product-22.jpg", description: "Adjustable double-pole storage for clothes, bags, and household organization." },
  { id: 23, slug: "abdominal-wheels", name: "Abdominal Wheels", category: "Fitness", price: 26000, image: "/products/product-23.jpg", description: "Core training wheels for abs, shoulders, and home workout routines." },
  { id: 24, slug: "toilet-rack-available", name: "Toilet Rack Available", category: "Bathroom", price: 42000, image: "/products/product-24.jpg", description: "A sturdy bathroom rack for making the most of vertical storage space." },
  { id: 25, slug: "furniture-mover", name: "Furniture Mover Set", category: "Home", price: 28000, image: "/products/product-25.jpg", description: "Lifter and slider tools for repositioning cabinets, sofas, beds, and tables." },
  { id: 26, slug: "plastic-storage-rack", name: "Plastic Storage Rack", category: "Home", price: 26000, image: "/products/product-26.jpg", description: "Lightweight storage rack for kitchens, bathrooms, bedrooms, and small spaces." },
  { id: 27, slug: "anti-vibration-leg-stopper-pads", name: "Anti-Vibration Leg Stopper Pads", category: "Home", price: 18000, image: "/products/product-27.jpg", description: "Four support mats to reduce appliance vibration and keep machines steady." },
  { id: 28, slug: "bathroom-suction-holder-set", name: "Bathroom Suction Holder Set of 3", category: "Bathroom", price: 24000, image: "/products/product-28.jpg", description: "A suction holder set for bathroom tools, soap, sponges, and small accessories." },
  { id: 29, slug: "smart-body-weight-composition-analyzer", name: "Smart Body Weight Composition Analyzer", category: "Fitness", price: 42000, image: "/products/product-29.jpg", description: "Smart body scale for tracking weight and body composition at home." },
  { id: 30, slug: "waterproof-phone-case", name: "Waterproof Phone Case", category: "Outdoor", price: 12000, image: "/products/product-30.jpg", description: "Protects your phone from water during rain, swimming, travel, and outdoor use." },
  { id: 31, slug: "portable-multi-function-laptop-table", name: "Portable Multi Function Laptop Table", category: "Office", price: 36000, image: "/products/product-31.jpg", badge: "Work from anywhere", description: "Portable laptop support for working, reading, watching, and studying anywhere." },
  { id: 32, slug: "roller-sunshade", name: "Roller Sunshade", category: "Outdoor", price: 28000, image: "/products/product-32.jpg", description: "Easy shade for windows and outdoor comfort during bright sunny days." },
  { id: 33, slug: "rain-coat", name: "Rain Coat", category: "Outdoor", price: 20000, image: "/products/product-33.jpg", description: "Reusable rain coat for daily commutes and rainy-season errands." },
];

const galleryImages: Record<number, string[]> = {
  1: ["product-01-2.jpg", "product-01-3.jpg"],
  2: ["product-02-2.jpg", "product-02-3.jpg"],
  4: ["product-04-2.jpg"],
  5: ["product-05-2.jpg"],
  6: ["product-06-2.jpg"],
  8: ["product-08-2.jpg", "product-08-3.jpg"],
  9: ["product-09-2.jpg", "product-09-3.jpg"],
  10: ["product-10-2.jpg", "product-10-3.jpg"],
  11: ["product-11-2.jpg", "product-11-3.jpg"],
  12: ["product-12-2.jpg", "product-12-3.jpg"],
  13: ["product-13-2.jpg"],
  14: ["product-14-2.jpg"],
  15: ["product-15-2.jpg", "product-15-3.jpg"],
  16: ["product-16-2.jpg"],
  18: ["product-18-2.jpg"],
  19: ["product-19-2.jpg", "product-19-3.jpg"],
  20: ["product-20-2.jpg"],
  22: ["product-22-2.jpg"],
  23: ["product-23-2.jpg"],
  24: ["product-24-2.jpg", "product-24-3.jpg"],
  27: ["product-27-2.jpg"],
  29: ["product-29-2.jpg"],
  30: ["product-30-2.jpg", "product-30-3.jpg"],
  31: ["product-31-2.jpg", "product-31-3.jpg"],
  32: ["product-32-2.jpg", "product-32-3.jpg"],
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function addCloudinaryTransform(url: string, type: "image" | "video") {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  const transform = type === "video" ? "q_auto:eco,f_auto,w_1080,c_limit" : "q_auto:good,f_auto,w_1600,c_limit";
  if (url.includes(`/upload/${transform}/`)) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

function cloudinaryVideoPoster(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return undefined;

  const transformed = url.replace("/video/upload/", "/video/upload/q_auto:good,f_jpg,w_900,c_limit/");
  return transformed.replace(/\.[a-z0-9]+($|\?)/i, ".jpg$1");
}

function normalizeMedia(media: Partial<ProductMedia> | string, fallbackType: "image" | "video" = "image"): ProductMedia | null {
  if (typeof media === "string") {
    return { type: fallbackType, url: addCloudinaryTransform(media, fallbackType) };
  }

  if (!media?.url) return null;
  const type = media.type === "video" ? "video" : "image";
  const url = addCloudinaryTransform(media.url, type);

  return {
    type,
    url,
    publicId: media.publicId,
    poster: type === "video" ? media.poster || media.thumbnail || cloudinaryVideoPoster(media.url) : media.poster,
    thumbnail: media.thumbnail,
    width: media.width,
    height: media.height,
    duration: media.duration,
    bytes: media.bytes,
    format: media.format,
  };
}

export function normalizeProduct(product: Partial<Product>): Product {
  const id = Number(product.id) || Date.now();
  const name = product.name?.trim() || `Product ${id}`;
  const slug = product.slug?.trim() || slugify(name);
  const imageUrls = (product.images?.length ? product.images : product.image ? [product.image] : [])
    .map((image) => addCloudinaryTransform(image, "image"));
  const media = [
    ...(product.media || []).map((item) => normalizeMedia(item)),
    ...imageUrls.map((image) => normalizeMedia(image, "image")),
    ...(product.videos || []).map((item) => normalizeMedia(item, "video")),
  ].filter((item): item is ProductMedia => Boolean(item));
  const dedupedMedia = Array.from(new Map(media.map((item) => [item.url, item])).values());
  const images = dedupedMedia.filter((item) => item.type === "image").map((item) => item.url);
  const videos = dedupedMedia.filter((item) => item.type === "video");
  const image = images[0] || videos[0]?.poster || "/products/product-21.jpg";

  return {
    id,
    slug,
    name,
    category: product.category?.trim() || "Home",
    price: Number(product.price) || 0,
    image,
    images: images.length ? images : [image],
    videos,
    media: dedupedMedia.length ? dedupedMedia : [{ type: "image", url: image }],
    badge: product.badge?.trim() || undefined,
    description: product.description?.trim() || `${name} is available from Shopyacu for local online ordering and delivery.`,
    stock: product.stock || "In stock",
    active: product.active !== false,
    featured: Boolean(product.featured || product.badge),
    cloudinaryPublicId: product.cloudinaryPublicId,
    sourceFolder: product.sourceFolder,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export const products: Product[] = productSeed.map((product) =>
  normalizeProduct({
    ...product,
    images: [product.image, ...(galleryImages[product.id] || []).map((image) => `/products/${image}`)],
  }),
);

export function getCategories(productList: Product[] = products) {
  return ["All", ...Array.from(new Set(productList.map((product) => product.category)))];
}

export const categories = getCategories(products);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatPrice(price: number) {
  if (!Number.isFinite(price) || price <= 0) return "Ask for price";

  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
}
