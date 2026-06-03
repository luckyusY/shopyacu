// Shopyacu blog — AI-authored, SEO-targeted articles that power our
// programmatic SEO (pSEO) strategy. Each post targets real buyer-intent
// keywords for shoppers in Kigali and across Rwanda, and links back into the
// product catalogue and marketplace categories so search traffic converts.
//
// Content is modelled as structured sections (instead of raw markdown) so it
// renders consistently, stays type-safe, and lets us emit rich Article + FAQ
// JSON-LD without adding a markdown dependency.

export type BlogSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string };

export type BlogFaq = { q: string; a: string };

export type BlogPost = {
  slug: string;
  title: string;
  /** Used for <title>; keep under ~60 chars where possible. */
  metaTitle: string;
  description: string;
  excerpt: string;
  keywords: string[];
  tag: string;
  author: string;
  publishedAt: string; // ISO date
  updatedAt: string; // ISO date
  heroImage: string;
  /** Marketplace category slugs this article should link to. */
  relatedCategorySlugs: string[];
  /** Product slugs to feature inline as "shop this" picks. */
  featuredProductSlugs: string[];
  sections: BlogSection[];
  faqs: BlogFaq[];
};

const AUTHOR = "The Shopyacu Team";

export const blogPosts: BlogPost[] = [
  {
    slug: "best-home-kitchen-products-kigali",
    title: "Best Home & Kitchen Products to Buy in Kigali (2026 Guide)",
    metaTitle: "Best Home & Kitchen Products in Kigali (2026)",
    description:
      "A practical buyer's guide to the best home and kitchen products in Kigali — air fryers, blenders, storage racks, and more, with real prices and WhatsApp pay-on-delivery.",
    excerpt:
      "From air fryers to space-saving storage, here are the home and kitchen products worth buying in Kigali this year — and how to order them without paying upfront.",
    keywords: [
      "home products Kigali",
      "kitchen appliances Rwanda",
      "buy air fryer Kigali",
      "online shopping Kigali",
      "where to buy kitchen products in Rwanda",
    ],
    tag: "Buying Guide",
    author: AUTHOR,
    publishedAt: "2026-01-12",
    updatedAt: "2026-06-01",
    heroImage: "/products/silver-crest-air-fryer-box-1.jpg",
    relatedCategorySlugs: ["home", "home-appliances", "storage-racks"],
    featuredProductSlugs: [
      "silver-crest-air-fryer-2400-watts",
      "multifunction-8-in-1-blender",
      "stainless-steel-shoes-rack",
    ],
    sections: [
      {
        type: "p",
        text: "Setting up a home in Kigali — whether it is a first apartment in Kimironko, a family house in Kicukiro, or a rental in Nyamirambo — usually starts with the same shopping list: something to cook with, somewhere to store things, and a few appliances that make daily life easier. This guide walks through the home and kitchen products that give you the most value for your money in 2026, with honest notes on what each one is actually good for.",
      },
      { type: "h2", text: "Kitchen appliances that earn their counter space" },
      {
        type: "p",
        text: "A small kitchen rewards multi-purpose tools. Instead of buying a single-task gadget for every job, look for appliances that replace three or four things at once.",
      },
      {
        type: "ul",
        items: [
          "Air fryer — crisps chips, chicken, and samosas with little or no oil, and doubles as a small oven for reheating. A 2400W or 8L model is enough for a family of four.",
          "Multi-function blender — a good 8-in-1 blender handles smoothies, soups, isombe, grinding spices, and crushing ice, so you skip three separate machines.",
          "Electric kettle — boils water in two minutes for tea, coffee, and quick cooking, and saves gas.",
          "Sandwich maker — fast breakfasts and after-school snacks without heating a whole stove.",
        ],
      },
      { type: "h2", text: "Storage and organisation for small spaces" },
      {
        type: "p",
        text: "Kigali apartments often trade space for location. The fix is vertical storage — go up the wall instead of out across the floor.",
      },
      {
        type: "ul",
        items: [
          "Stainless steel shoe racks keep entryways tidy and survive humidity better than fabric versions.",
          "Multi-tier kitchen racks turn an empty corner into pantry space for pots, spices, and condiments.",
          "Portable cloth wardrobes add hanging space in rooms with no built-in closet — ideal for renters.",
          "Over-toilet bathroom racks reclaim the dead space above the cistern for towels and toiletries.",
        ],
      },
      { type: "h2", text: "How much should you budget?" },
      {
        type: "p",
        text: "Prices move with the exchange rate and shipping, but as a rough 2026 guide: a quality blender lands around 75,000 RWF, a large air fryer around 98,000 RWF, and most storage racks sit between 26,000 and 45,000 RWF. Smaller helpers like kettles and sandwich makers are typically under 40,000 RWF.",
      },
      {
        type: "quote",
        text: "The smartest home buys are the ones you reach for every single day — prioritise those before the nice-to-haves.",
      },
      { type: "h2", text: "Ordering without paying upfront" },
      {
        type: "p",
        text: "On Shopyacu you do not pay in advance. Message us on WhatsApp, we confirm the current price, colour, and delivery time, and you pay on delivery (WISHYURA BIKUGEZEHO) once the item is in your hands in Kigali. That removes the biggest worry with online shopping in Rwanda — paying before you have seen the product.",
      },
    ],
    faqs: [
      {
        q: "Where can I buy home and kitchen products online in Kigali?",
        a: "Shopyacu sells home, kitchen, and appliance products online with delivery across Kigali. You browse on the website, then order on WhatsApp and pay on delivery.",
      },
      {
        q: "Do I have to pay before delivery?",
        a: "No. Shopyacu uses pay-on-delivery (WISHYURA BIKUGEZEHO). You confirm price and availability on WhatsApp first, then pay once the product reaches you.",
      },
      {
        q: "How long does delivery take in Kigali?",
        a: "Most in-stock items can be delivered the same day or next day within Kigali. Message us on WhatsApp to confirm the exact delivery time for your area.",
      },
    ],
  },
  {
    slug: "where-to-buy-air-fryer-kigali",
    title: "Where to Buy an Air Fryer in Kigali: Prices, Sizes & Delivery",
    metaTitle: "Where to Buy an Air Fryer in Kigali (Prices)",
    description:
      "Thinking of buying an air fryer in Kigali? Compare sizes, wattage, and prices, learn what to cook, and order with pay-on-delivery from Shopyacu.",
    excerpt:
      "Air fryers are everywhere in Kigali kitchens right now. Here's how to choose the right size and wattage, what they cost, and how to order one safely.",
    keywords: [
      "buy air fryer Kigali",
      "air fryer price Rwanda",
      "Silver Crest air fryer Kigali",
      "best air fryer Rwanda",
    ],
    tag: "Buying Guide",
    author: AUTHOR,
    publishedAt: "2026-02-03",
    updatedAt: "2026-05-20",
    heroImage: "/products/silver-crest-air-fryer-box-1.jpg",
    relatedCategorySlugs: ["home-appliances", "home"],
    featuredProductSlugs: [
      "silver-crest-air-fryer-2400-watts",
      "silver-crest-8l-air-fryer",
    ],
    sections: [
      {
        type: "p",
        text: "Air fryers have quickly become one of the most requested kitchen appliances in Kigali — and for good reason. They cook with hot circulating air instead of oil, so you get crispy results with a fraction of the fat, less mess, and no large pot of hot oil to manage.",
      },
      { type: "h2", text: "What size air fryer do you need?" },
      {
        type: "ul",
        items: [
          "3–4L — good for one or two people, snacks, and reheating.",
          "5–6L — the sweet spot for a small family; cooks a whole chicken or a full tray of chips.",
          "8L and above — best for big families, batch cooking, or entertaining guests.",
        ],
      },
      { type: "h2", text: "Wattage and electricity" },
      {
        type: "p",
        text: "Most quality air fryers run between 1400W and 2400W. Higher wattage heats faster and crisps better, but make sure your socket and home wiring can handle it comfortably. A 2400W model on a dedicated socket is a reliable choice for Kigali homes.",
      },
      { type: "h2", text: "What can you cook?" },
      {
        type: "ul",
        items: [
          "Chips, potato wedges, and plantain (ibitoke) with almost no oil",
          "Chicken, fish, and brochettes",
          "Samosas and spring rolls reheated to crispy",
          "Roasted vegetables and even small cakes",
        ],
      },
      { type: "h2", text: "How much does an air fryer cost in Kigali?" },
      {
        type: "p",
        text: "As a 2026 guide, a large 2400W air fryer is around 98,000 RWF, while bigger 8L units vary by stock and model. Because prices shift with shipping and the exchange rate, the best move is to message us on WhatsApp for the current price and available colours before you decide.",
      },
      {
        type: "quote",
        text: "Buy slightly bigger than you think you need — most people end up cooking for guests more often than they expect.",
      },
    ],
    faqs: [
      {
        q: "How much is an air fryer in Kigali?",
        a: "As a 2026 guide, large air fryers start around 98,000 RWF, but prices change with stock and the exchange rate. Message Shopyacu on WhatsApp for today's price.",
      },
      {
        q: "Which air fryer size is best for a family?",
        a: "A 5–6L air fryer suits most families, while 8L models are better for large families or batch cooking.",
      },
      {
        q: "Can I pay after delivery for an air fryer?",
        a: "Yes. Shopyacu offers pay-on-delivery in Kigali. You confirm the price on WhatsApp, then pay when it arrives.",
      },
    ],
  },
  {
    slug: "small-space-storage-ideas-kigali-apartments",
    title: "Small-Space Storage Ideas for Kigali Apartments",
    metaTitle: "Small-Space Storage Ideas for Kigali Homes",
    description:
      "Maximise a small apartment in Kigali with smart storage: shoe racks, portable wardrobes, kitchen racks, and over-toilet shelves. Shop the picks on Shopyacu.",
    excerpt:
      "Living in a compact Kigali apartment? These storage solutions reclaim floor space, tame clutter, and work perfectly for renters who can't drill walls.",
    keywords: [
      "storage ideas Kigali",
      "small apartment storage Rwanda",
      "portable wardrobe Kigali",
      "shoe rack Rwanda",
      "kitchen rack Kigali",
    ],
    tag: "Home Ideas",
    author: AUTHOR,
    publishedAt: "2026-02-22",
    updatedAt: "2026-05-12",
    heroImage: "/products/portable-wardrobe-lifestyle.jpg",
    relatedCategorySlugs: ["storage-racks", "home", "furniture"],
    featuredProductSlugs: [
      "portable-cloth-wardrobe",
      "stainless-steel-shoes-rack",
      "metal-kitchen-rack",
      "storage-ottoman-stools",
    ],
    sections: [
      {
        type: "p",
        text: "A small home does not have to feel cramped. The trick is giving every item a place and using the vertical space most people ignore. Here are storage ideas that work especially well in Kigali rentals — including options that need no drilling and can move with you.",
      },
      { type: "h2", text: "Go vertical in the bedroom" },
      {
        type: "p",
        text: "If your room has no built-in closet, a portable cloth wardrobe adds full hanging space plus shelves in minutes, and packs down when you move. Pair it with a storage ottoman that hides blankets or shoes inside while doubling as extra seating.",
      },
      { type: "h2", text: "Tame the entryway" },
      {
        type: "p",
        text: "Shoes pile up fast. A stainless steel shoe rack keeps them off the floor, resists humidity, and stops the doorway clutter that makes a small home feel chaotic. A combined shoe-and-hat rack adds a spot for bags and caps too.",
      },
      { type: "h2", text: "Win back kitchen counters" },
      {
        type: "ul",
        items: [
          "Multi-tier metal kitchen racks store pots, spices, and produce vertically.",
          "Dish racks dry plates and cups without taking over the sink.",
          "Standing storage cabinets corral cleaning supplies and bulk groceries.",
        ],
      },
      { type: "h2", text: "Use the space above the toilet" },
      {
        type: "p",
        text: "The wall above the cistern is prime, wasted real estate. An over-toilet bathroom rack adds three tiers for towels and toiletries without sacrificing any floor space.",
      },
      {
        type: "quote",
        text: "In a small home, furniture that stores things is worth twice as much as furniture that only sits there.",
      },
    ],
    faqs: [
      {
        q: "What storage works best for renters who can't drill walls?",
        a: "Freestanding options like portable cloth wardrobes, shoe racks, kitchen racks, and over-toilet racks need no drilling and move with you, making them ideal for rentals.",
      },
      {
        q: "Where can I buy storage racks in Kigali?",
        a: "Shopyacu stocks shoe racks, kitchen racks, wardrobes, and bathroom racks with delivery in Kigali and pay-on-delivery on WhatsApp.",
      },
    ],
  },
  {
    slug: "home-gym-essentials-rwanda",
    title: "Home Gym Essentials in Rwanda: Build a Workout Setup at Home",
    metaTitle: "Home Gym Essentials in Rwanda (Starter Kit)",
    description:
      "Build an affordable home gym in Rwanda with resistance bands, a mini stepper, ab wheels, and a smart scale. Order fitness gear on Shopyacu with pay-on-delivery.",
    excerpt:
      "You don't need a gym membership to stay fit in Kigali. Here's a compact, affordable home workout setup you can build piece by piece.",
    keywords: [
      "home gym Rwanda",
      "fitness equipment Kigali",
      "resistance bands Rwanda",
      "buy mini stepper Kigali",
      "workout equipment Rwanda",
    ],
    tag: "Fitness",
    author: AUTHOR,
    publishedAt: "2026-03-08",
    updatedAt: "2026-05-28",
    heroImage: "/products/product-08.jpg",
    relatedCategorySlugs: ["home"],
    featuredProductSlugs: [
      "resistance-band-set",
      "mini-stepper",
      "abdominal-wheels",
      "smart-body-weight-composition-analyzer",
    ],
    sections: [
      {
        type: "p",
        text: "A home gym in Kigali can be small, affordable, and genuinely effective. You do not need heavy machines — a few versatile pieces cover strength, cardio, and core training in the corner of a room.",
      },
      { type: "h2", text: "Start with these four pieces" },
      {
        type: "ol",
        items: [
          "Resistance band set — the most cost-effective full-body tool. Five strengths cover everything from rehab to serious strength work, and they fit in a drawer.",
          "Mini stepper — low-impact cardio you can do while watching TV; easy on the knees and quiet for apartments.",
          "Ab wheel — brutal but brilliant for core, shoulders, and stability in minutes a day.",
          "Smart body composition scale — tracks weight and body fat so you can actually see progress and stay motivated.",
        ],
      },
      { type: "h2", text: "A simple 20-minute routine" },
      {
        type: "ul",
        items: [
          "5 minutes on the mini stepper to warm up",
          "Resistance band squats, rows, and presses — 3 rounds",
          "Ab wheel roll-outs — 3 sets of as many as you can manage",
          "Weigh in weekly, same time of day, to track the trend (not daily noise)",
        ],
      },
      {
        type: "quote",
        text: "Consistency beats equipment. The best home gym is the one that's already set up when motivation strikes.",
      },
      { type: "h2", text: "What it costs to get started" },
      {
        type: "p",
        text: "As a 2026 guide, a resistance band set is around 28,000 RWF, ab wheels around 26,000 RWF, a smart scale around 42,000 RWF, and a mini stepper around 65,000 RWF. You can start with bands alone and add pieces over time.",
      },
    ],
    faqs: [
      {
        q: "What's the cheapest way to start a home gym in Rwanda?",
        a: "A resistance band set is the most affordable starting point — it covers full-body strength training for around 28,000 RWF and stores in a drawer.",
      },
      {
        q: "Where can I buy fitness equipment in Kigali?",
        a: "Shopyacu sells resistance bands, mini steppers, ab wheels, and smart scales with delivery in Kigali and pay-on-delivery on WhatsApp.",
      },
    ],
  },
  {
    slug: "online-shopping-pay-on-delivery-kigali",
    title: "How Pay-on-Delivery Online Shopping Works in Kigali (WISHYURA BIKUGEZEHO)",
    metaTitle: "Pay-on-Delivery Shopping in Kigali Explained",
    description:
      "Worried about paying before you receive your order? Here's how safe pay-on-delivery online shopping works in Kigali with Shopyacu — confirm on WhatsApp, pay when it arrives.",
    excerpt:
      "Pay-on-delivery removes the biggest fear of online shopping in Rwanda. Here's exactly how it works and how to order safely.",
    keywords: [
      "pay on delivery Kigali",
      "online shopping Rwanda",
      "WISHYURA BIKUGEZEHO",
      "safe online shopping Kigali",
      "WhatsApp shopping Rwanda",
    ],
    tag: "How It Works",
    author: AUTHOR,
    publishedAt: "2026-01-28",
    updatedAt: "2026-06-02",
    heroImage: "/products/meylux-water-dispenser-front.jpg",
    relatedCategorySlugs: ["home", "home-appliances", "storage-racks"],
    featuredProductSlugs: [],
    sections: [
      {
        type: "p",
        text: "The number one worry with online shopping in Rwanda is simple: what if I pay and the product never comes, or isn't what I expected? Pay-on-delivery — WISHYURA BIKUGEZEHO — exists to remove exactly that risk. You only pay once the item is in your hands.",
      },
      { type: "h2", text: "The four steps, start to finish" },
      {
        type: "ol",
        items: [
          "Browse the catalogue on shopyacu.com and tap the product you want.",
          "Message us on WhatsApp — we confirm the current price, colour, and availability.",
          "We agree on a delivery time and place that works for you in Kigali.",
          "You receive the item, check it, and pay on delivery. No prepayment.",
        ],
      },
      { type: "h2", text: "Why we do it this way" },
      {
        type: "p",
        text: "Trust is everything for a local business. By letting you inspect the product before paying, we earn repeat customers instead of one-time sales. A real person replies on WhatsApp — not a bot — so you always know who you're dealing with.",
      },
      {
        type: "quote",
        text: "If you can't see it and trust it, you shouldn't have to pay for it yet. That's the whole idea behind WISHYURA BIKUGEZEHO.",
      },
      { type: "h2", text: "Tips for a smooth order" },
      {
        type: "ul",
        items: [
          "Send the product link or screenshot so we know exactly what you mean.",
          "Share your area in Kigali so we can give an accurate delivery time.",
          "Ask about colours and alternatives — we often have more options in stock than are shown online.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is online shopping safe in Kigali?",
        a: "Yes, when you use pay-on-delivery. With Shopyacu you confirm everything on WhatsApp and only pay once you've received and checked the product.",
      },
      {
        q: "What does WISHYURA BIKUGEZEHO mean?",
        a: "It's Kinyarwanda for 'pay when it reaches you' — our pay-on-delivery promise. You don't pay anything upfront.",
      },
      {
        q: "Do you deliver outside Kigali?",
        a: "Message us on WhatsApp with your location and we'll confirm whether delivery is available and what it costs.",
      },
    ],
  },
  {
    slug: "wedding-event-decor-kigali-checklist",
    title: "Wedding & Event Decor in Kigali: A Planning Checklist",
    metaTitle: "Wedding & Event Decor in Kigali: Checklist",
    description:
      "Planning a wedding or event in Kigali? Use this decor and setup checklist — stages, backdrops, seating, and styling — and ask Shopyacu about decor packages.",
    excerpt:
      "From stage backdrops to seating, here's a practical decor checklist for weddings and events in Kigali, plus how to arrange a setup.",
    keywords: [
      "wedding decor Kigali",
      "event decor Rwanda",
      "wedding stage Kigali",
      "event planning Rwanda",
    ],
    tag: "Events",
    author: AUTHOR,
    publishedAt: "2026-03-30",
    updatedAt: "2026-05-15",
    heroImage: "/products/wedding-stage-pink-view-1.jpg",
    relatedCategorySlugs: ["wedding", "events", "furniture"],
    featuredProductSlugs: ["pink-wedding-stage-decor"],
    sections: [
      {
        type: "p",
        text: "A beautiful event comes down to planning the big visual moments early. Whether it's a wedding, an engagement (gusaba), or a milestone celebration in Kigali, this checklist keeps the decor on track.",
      },
      { type: "h2", text: "The decor checklist" },
      {
        type: "ol",
        items: [
          "Stage and backdrop — the focal point of every photo. Lock the colour theme first.",
          "Seating and layout — plan flow so guests move easily between entry, seating, and food.",
          "Lighting — warm lighting transforms a venue after sunset.",
          "Table styling — centrepieces, linens, and small details tie the theme together.",
          "Entrance and photo corner — give guests a dedicated spot for pictures.",
        ],
      },
      { type: "h2", text: "Choosing a colour theme" },
      {
        type: "p",
        text: "Pick one or two main colours and repeat them across the stage, tables, and entrance for a cohesive look. Soft tones like blush pink photograph beautifully and pair with almost any outfit palette.",
      },
      {
        type: "quote",
        text: "Decide the stage and colour theme first — every other decision becomes easier once the centrepiece is set.",
      },
      { type: "h2", text: "Arranging your setup" },
      {
        type: "p",
        text: "Shopyacu has supported past wedding and event setups, including full stage decor. Message us on WhatsApp early with your date, venue, and theme so we can talk through packages and availability.",
      },
    ],
    faqs: [
      {
        q: "Where can I arrange wedding decor in Kigali?",
        a: "Shopyacu has supported wedding and event stage decor in Kigali. Message us on WhatsApp with your date and theme to discuss packages.",
      },
      {
        q: "How early should I book event decor?",
        a: "Book as early as possible — ideally several weeks ahead — so your preferred theme, colours, and setup are available for your date.",
      },
    ],
  },
  {
    slug: "best-water-dispensers-home-office-rwanda",
    title: "Best Water Dispensers for Homes and Offices in Rwanda",
    metaTitle: "Best Water Dispensers in Rwanda (Home & Office)",
    description:
      "Compare countertop and standing water dispensers for homes and offices in Rwanda. Learn which type fits your space, then order from Shopyacu with pay-on-delivery.",
    excerpt:
      "Hot and cold water on demand makes daily life easier. Here's how to choose between countertop and standing water dispensers in Rwanda.",
    keywords: [
      "water dispenser Rwanda",
      "buy water dispenser Kigali",
      "countertop water dispenser Rwanda",
      "office water dispenser Kigali",
    ],
    tag: "Buying Guide",
    author: AUTHOR,
    publishedAt: "2026-04-14",
    updatedAt: "2026-05-30",
    heroImage: "/products/meylux-water-dispenser-front.jpg",
    relatedCategorySlugs: ["home-appliances", "home"],
    featuredProductSlugs: [
      "meylux-water-dispenser",
      "countertop-water-dispenser",
    ],
    sections: [
      {
        type: "p",
        text: "A water dispenser is one of those quiet upgrades that you notice every single day — instant hot water for tea, cold water in Kigali's dry-season heat, and no more lifting heavy bottles to pour.",
      },
      { type: "h2", text: "Countertop vs. standing dispensers" },
      {
        type: "ul",
        items: [
          "Countertop dispensers — compact, sit on a table or counter, perfect for small kitchens, offices, and rentals.",
          "Standing (floor) dispensers — higher capacity and a more permanent look, ideal for busy homes and larger offices.",
        ],
      },
      { type: "h2", text: "What to look for" },
      {
        type: "ol",
        items: [
          "Hot and cold function — make sure it offers both if you want tea and chilled water.",
          "Bottle compatibility — check it fits standard Rwanda water bottles.",
          "Build quality — a sturdy tap and stable base last far longer.",
          "Energy use — look for an on/off switch on the heating element to save power.",
        ],
      },
      {
        type: "quote",
        text: "For most apartments, a countertop dispenser is the sweet spot — all the convenience, none of the bulk.",
      },
      { type: "h2", text: "Ordering in Kigali" },
      {
        type: "p",
        text: "Models and prices change with stock, so message us on WhatsApp for the current options. We'll confirm price, colour, and delivery, and you pay on delivery once it arrives.",
      },
    ],
    faqs: [
      {
        q: "Which water dispenser is best for a small home?",
        a: "A countertop water dispenser is best for small homes and offices — it gives you hot and cold water without taking floor space.",
      },
      {
        q: "Where can I buy a water dispenser in Kigali?",
        a: "Shopyacu stocks countertop and standing water dispensers with delivery in Kigali and pay-on-delivery on WhatsApp.",
      },
    ],
  },
  {
    slug: "bathroom-organization-budget-kigali",
    title: "Bathroom Organisation on a Budget: Racks & Caddies That Work",
    metaTitle: "Bathroom Organisation on a Budget in Kigali",
    description:
      "Organise a small bathroom in Kigali without renovating. Shower caddies, suction holders, and over-toilet racks that maximise space — shop them on Shopyacu.",
    excerpt:
      "A tidy bathroom doesn't need a renovation. These affordable racks and caddies maximise space in even the smallest Kigali bathroom.",
    keywords: [
      "bathroom organisation Kigali",
      "shower caddy Rwanda",
      "bathroom rack Kigali",
      "small bathroom storage Rwanda",
    ],
    tag: "Home Ideas",
    author: AUTHOR,
    publishedAt: "2026-04-29",
    updatedAt: "2026-05-31",
    heroImage: "/products/over-toilet-bathroom-rack.jpg",
    relatedCategorySlugs: ["storage-racks", "home"],
    featuredProductSlugs: [
      "shower-caddy-5-pack",
      "corner-shower-caddy",
      "over-toilet-bathroom-rack",
      "bathroom-suction-holder-set",
    ],
    sections: [
      {
        type: "p",
        text: "Small bathrooms get cluttered fast — bottles on the floor, towels with nowhere to go. The good news is you can fix it for very little money, without drilling tiles or calling a fundi.",
      },
      { type: "h2", text: "Use the walls and corners" },
      {
        type: "ul",
        items: [
          "Adhesive shower caddies hold shampoos, soaps, and skincare without drilling.",
          "Corner caddies turn an unused corner into multi-tier storage.",
          "Suction holders give razors, sponges, and brushes a permanent home.",
        ],
      },
      { type: "h2", text: "Claim the space above the toilet" },
      {
        type: "p",
        text: "An over-toilet rack adds several tiers in the dead space above the cistern — perfect for towels, tissue, and toiletries you want within reach but off the floor.",
      },
      {
        type: "quote",
        text: "Adhesive and suction storage is a renter's best friend — full organisation with zero damage to the walls.",
      },
      { type: "h2", text: "A quick weekend reset" },
      {
        type: "ol",
        items: [
          "Empty everything out and bin expired or empty products.",
          "Group what's left: daily-use, weekly-use, and spares.",
          "Mount caddies and racks so daily items are at eye level.",
          "Store spares up high or in the over-toilet rack.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I organise a small bathroom without drilling?",
        a: "Use adhesive shower caddies, suction holders, and freestanding over-toilet racks. They add storage without damaging tiles, which is ideal for rentals.",
      },
      {
        q: "Where can I buy shower caddies and bathroom racks in Kigali?",
        a: "Shopyacu sells shower caddies, corner caddies, suction holders, and over-toilet racks with delivery in Kigali and pay-on-delivery on WhatsApp.",
      },
    ],
  },
];

export function getBlogPosts() {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

const WORDS_PER_MINUTE = 220;

export function readingTimeMinutes(post: BlogPost) {
  const words = post.sections.reduce((total, section) => {
    if (section.type === "ul" || section.type === "ol") {
      return total + section.items.join(" ").split(/\s+/).length;
    }
    return total + section.text.split(/\s+/).length;
  }, 0);
  return Math.max(2, Math.round(words / WORDS_PER_MINUTE));
}

export function getRelatedPosts(slug: string, limit = 3) {
  const current = getBlogPost(slug);
  if (!current) return getBlogPosts().slice(0, limit);

  return getBlogPosts()
    .filter((post) => post.slug !== slug)
    .sort((a, b) => {
      const score = (post: BlogPost) =>
        (post.tag === current.tag ? 2 : 0) +
        post.relatedCategorySlugs.filter((c) => current.relatedCategorySlugs.includes(c)).length;
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export function formatBlogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
