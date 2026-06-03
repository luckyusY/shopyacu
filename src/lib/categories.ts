import type { Product } from "@/lib/products";

export type MarketplaceCategory = {
  label: string;
  category: string;
  slug: string;
  image: string;
  description: string;
  tag: string;
};

export type CategoryShowcaseItem = MarketplaceCategory & {
  listingCount: number;
};

export const marketplaceCategories: MarketplaceCategory[] = [
  {
    label: "Home",
    category: "Home",
    slug: "home",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    description: "Household finds, furniture helpers, storage, decor, and daily-use essentials.",
    tag: "Home goods",
  },
  {
    label: "Wedding",
    category: "Wedding",
    slug: "wedding",
    image: "/categories/wedding-aisle.jpeg",
    description: "Past wedding decor, stages, bridal setups, gifts, beauty, and event support.",
    tag: "Past weddings",
  },
  {
    label: "Cars for Sale",
    category: "Cars for Sale",
    slug: "cars-for-sale",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    description: "Vehicle listings, deals, inspection-ready offers, and seller leads.",
    tag: "Buy cars",
  },
  {
    label: "Cars for Rent",
    category: "Cars for Rent",
    slug: "cars-for-rent",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    description: "Short-term rentals, special day cars, travel cars, and driver options.",
    tag: "Rentals",
  },
  {
    label: "Jobs",
    category: "Jobs",
    slug: "jobs",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    description: "Open roles, hiring notices, service opportunities, and local work leads.",
    tag: "Hiring",
  },
  {
    label: "Scholarships",
    category: "Scholarships",
    slug: "scholarships",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    description: "Study opportunities, funding notices, school programs, and application leads.",
    tag: "Education",
  },
  {
    label: "Courses",
    category: "Learning",
    slug: "courses",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    description: "One-month practical courses in Excel, digital marketing, full stack development, and AI.",
    tag: "Learning",
  },
  {
    label: "Pets",
    category: "Pets",
    slug: "pets",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    description: "Pet supplies, adoption leads, care products, and animal services.",
    tag: "Pet care",
  },
  {
    label: "Electronics",
    category: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    description: "Phones, accessories, office tech, gadgets, and useful digital tools.",
    tag: "Devices",
  },
  {
    label: "Home Appliances",
    category: "Home Appliances",
    slug: "home-appliances",
    image: "/products/meylux-water-dispenser-front.jpg",
    description: "Water dispensers, ironing boards, and practical appliances for everyday home use.",
    tag: "Appliances",
  },
  {
    label: "Bedding",
    category: "Bedding",
    slug: "bedding",
    image: "/products/assorted-bedding-stack-1.jpg",
    description: "Blankets, duvet sets, warm covers, and bedroom comfort items in assorted styles.",
    tag: "Bedroom",
  },
  {
    label: "Storage & Racks",
    category: "Storage & Racks",
    slug: "storage-racks",
    image: "/products/portable-wardrobe-lifestyle.jpg",
    description: "Kitchen racks, wardrobes, bathroom racks, shoe racks, and compact storage helpers.",
    tag: "Organize",
  },
  {
    label: "Fashion",
    category: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
    description: "Clothes, shoes, bags, beauty picks, and occasion-ready outfits.",
    tag: "Style",
  },
  {
    label: "Real Estate",
    category: "Real Estate",
    slug: "real-estate",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    description: "Homes, rentals, land, rooms, and property-related listings.",
    tag: "Property",
  },
  {
    label: "Furniture",
    category: "Furniture",
    slug: "furniture",
    image: "/products/storage-ottoman-stools.jpg",
    description: "Small furniture, room accents, seating, and practical pieces for home styling.",
    tag: "Furniture",
  },
  {
    label: "Services",
    category: "Services",
    slug: "services",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    description: "Professional help, repairs, delivery, creative work, learning, and business support.",
    tag: "Help",
  },
  {
    label: "Events",
    category: "Events",
    slug: "events",
    image: "/categories/wedding-stage.jfif",
    description: "Party supplies, event vendors, experiences, tickets, and local happenings.",
    tag: "Local fun",
  },
];

export function categoryPath(category: MarketplaceCategory | CategoryShowcaseItem) {
  if (category.slug === "courses") return "/courses";
  return `/categories/${category.slug}`;
}

export function getMarketplaceCategory(slug: string) {
  return marketplaceCategories.find((category) => category.slug === slug);
}

export function getCategoryShowcase(products: Product[]) {
  return marketplaceCategories.map((item) => {
    const categoryProducts = products.filter((product) => product.category === item.category);
    const leadProduct = categoryProducts.find((product) => product.image) || categoryProducts[0];

    return {
      ...item,
      image: leadProduct?.image || item.image,
      listingCount: categoryProducts.length,
    };
  });
}
