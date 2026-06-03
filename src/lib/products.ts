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
  tags?: string[];
  description: string;
  /** AI-enriched bullet points: key uses / benefits of the product. */
  highlights?: string[];
  /** AI-enriched short "how to use it" steps. */
  howToUse?: string[];
  /** Long-tail / niche SEO keywords for metadata. */
  seoKeywords?: string[];
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
  { id: 34, slug: "butt-booster-capsules", name: "Butt Booster Capsules", category: "Health & Beauty", price: 30000, image: "/products/wellness-butt-booster-1.jpg", badge: "New arrival", tags: ["Body care", "Beauty", "Wellness"], description: "Body-care supplement capsules available from Shopyacu. Check the product label and use as directed." },
  { id: 35, slug: "yoni-detox-pearls", name: "Yoni Detox Pearls", category: "Personal Care", price: 30000, image: "/products/personal-yoni-detox-pearls.jpg", tags: ["Personal care", "Women"], description: "Personal-care pearl pack for customers who prefer ready-to-order wellness items. Read the label carefully before use." },
  { id: 36, slug: "slim-plus-fat-burner", name: "Slim Plus Fat Burner", category: "Fitness Supplements", price: 30000, image: "/products/fitness-slim-plus-fat-burner.jpg", badge: "Fitness", tags: ["Fitness", "Supplement"], description: "Fitness supplement bottle for shoppers building a wellness routine. Confirm ingredients and directions on the label before use." },
  { id: 37, slug: "concrete-creatine", name: "Concrete Creatine", category: "Fitness Supplements", price: 30000, image: "/products/fitness-concrete-creatine.jpg", tags: ["Gym", "Creatine", "Fitness"], description: "Creatine supplement for gym and training routines. Use according to the product label and your fitness plan." },
  { id: 38, slug: "plump-hips-tea", name: "Plump Hips Tea", category: "Health & Beauty", price: 30000, image: "/products/wellness-plump-hips-tea.jpg", tags: ["Tea", "Beauty", "Wellness"], description: "Packaged wellness tea available for WhatsApp ordering and local delivery. Read preparation directions before use." },
  { id: 39, slug: "developer-box-rapid-increase", name: "Developer Box Rapid Increase", category: "Personal Care", price: 30000, image: "/products/personal-developer-box-rapid-increase.jpg", tags: ["Personal care"], description: "Personal-care boxed product in a 100ml pack. Ask Shopyacu on WhatsApp for label details and availability." },
  { id: 40, slug: "largo-toothpaste", name: "Largo Toothpaste", category: "Oral Care", price: 30000, image: "/products/oral-largo-toothpaste.jpg", tags: ["Oral care", "Toothpaste"], description: "Largo toothpaste for everyday oral-care routines. Order on WhatsApp and confirm stock before delivery." },
  { id: 41, slug: "black-body-shaper", name: "Black Body Shaper", category: "Fashion", price: 30000, image: "/products/fashion-black-body-shaper.jpg", tags: ["Body shaper", "Fashion"], description: "Black body-shaper garment for outfit support and daily styling. Message us to confirm size and fit." },
  { id: 42, slug: "trimtone-tea", name: "TrimTone Tea", category: "Wellness Tea", price: 30000, image: "/products/wellness-trimtone-tea.jpg", tags: ["Tea", "Wellness"], description: "TrimTone Tea pack with 30 tea bags for shoppers who prefer packaged wellness teas. Follow the label directions." },
  { id: 43, slug: "femmi-brew-herbal-tea", name: "Femmi-Brew Herbal Tea", category: "Health & Beauty", price: 30000, image: "/products/wellness-femmi-brew-1.jpg", tags: ["Tea", "Women", "Wellness"], description: "Femmi-Brew herbal tea box for women-focused wellness routines. Confirm directions and ingredients on the label." },
  { id: 44, slug: "daily-support-capsules", name: "Daily Wellness Support Capsules", category: "Wellness Supplements", price: 30000, image: "/products/wellness-daily-support-capsules.jpg", tags: ["Wellness", "Capsules"], description: "Daily wellness capsule bottle available for local delivery. Read the label and use only as directed." },
  { id: 45, slug: "glutathione-enhance-capsules", name: "Glutathione Enhance Capsules", category: "Health & Beauty", price: 30000, image: "/products/beauty-glutathione-enhance.jpg", tags: ["Beauty", "Capsules"], description: "Beauty supplement capsules for customers browsing wellness and skincare support products. Use according to the label." },
  { id: 46, slug: "muscle-bone-care", name: "Muscle-Bone Care", category: "Wellness Supplements", price: 30000, image: "/products/wellness-muscle-bone-care.jpg", tags: ["Wellness", "Capsules"], description: "Muscle-Bone Care supplement bottle available from Shopyacu. Check ingredients and usage directions before ordering." },
  { id: 47, slug: "super-omega-3", name: "Super Omega-3", category: "Wellness Supplements", price: 30000, image: "/products/wellness-super-omega-3.jpg", tags: ["Omega", "Wellness"], description: "Super Omega-3 supplement bottle for everyday wellness shoppers. Read the product label before use." },
  { id: 48, slug: "andro-t-capsules", name: "Andro-T Capsules", category: "Men's Wellness", price: 30000, image: "/products/mens-andro-t-capsules.jpg", tags: ["Men", "Wellness"], description: "Men's wellness capsule bottle available for WhatsApp ordering. Confirm directions and ingredients on the label." },
  { id: 49, slug: "jointflex-capsules", name: "JointFlex Capsules", category: "Wellness Supplements", price: 30000, image: "/products/wellness-jointflex-capsules.jpg", tags: ["Wellness", "Capsules"], description: "JointFlex supplement bottle for customers browsing wellness support products. Use only as directed on the label." },
  { id: 50, slug: "liver-care-capsules", name: "Liver Care Capsules", category: "Wellness Supplements", price: 30000, image: "/products/wellness-liver-care-capsules.jpg", tags: ["Wellness", "Capsules"], description: "Liver Care capsule bottle listed for easy WhatsApp ordering. Please read label details before use." },
  { id: 51, slug: "resveratrol-capsules", name: "Resveratrol Capsules", category: "Wellness Supplements", price: 30000, image: "/products/wellness-resveratrol-capsules.jpg", tags: ["Wellness", "Capsules"], description: "Resveratrol supplement bottle for customers looking through wellness items. Confirm directions before ordering." },
  { id: 52, slug: "andro-brew-coffee", name: "Andro-Brew Coffee", category: "Men's Wellness", price: 30000, image: "/products/mens-andro-brew-coffee.jpg", tags: ["Men", "Coffee", "Wellness"], description: "Andro-Brew coffee pack for men's wellness shoppers. Read the package label and preparation instructions." },
  { id: 53, slug: "strong-man-xxxl", name: "Strong Man XXXL", category: "Men's Care", price: 30000, image: "/products/mens-strong-man-xxxl.jpg", tags: ["Men", "Personal care"], description: "Men's personal-care product in a 60ml pack. Message us for exact label details and availability." },
  { id: 54, slug: "xxxl-enlargement-cream", name: "XXXL Enlargement Cream", category: "Men's Care", price: 30000, image: "/products/mens-xxxl-enlargement-cream.jpg", tags: ["Men", "Personal care"], description: "Men's personal-care cream available from Shopyacu. Read and follow the product label before use." },
  { id: 55, slug: "max-man-enlargement-cream", name: "Max Man Enlargement Cream", category: "Men's Care", price: 30000, image: "/products/mens-max-man-cream.jpg", tags: ["Men", "Personal care"], description: "Max Man men's personal-care cream. Confirm product details and directions with us on WhatsApp." },
  { id: 56, slug: "best-men-enlargement-cream", name: "Best Men Enlargement Cream", category: "Men's Care", price: 30000, image: "/products/mens-best-men-cream.jpg", tags: ["Men", "Personal care"], description: "Best Men personal-care cream for customers browsing men's care items. Check the label before use." },
  { id: 57, slug: "maxman-capsules", name: "MaxMan Capsules", category: "Men's Wellness", price: 30000, image: "/products/mens-maxman-capsules.jpg", tags: ["Men", "Capsules"], description: "MaxMan capsule pack for men's wellness shoppers. Use only according to the product label." },
  { id: 58, slug: "men-gel", name: "Men Gel", category: "Men's Care", price: 30000, image: "/products/mens-gel.jpg", tags: ["Men", "Gel"], description: "Men's personal-care gel available for WhatsApp ordering. Ask for full label details before checkout." },
  { id: 59, slug: "height-growth-capsules", name: "Height Growth Capsules", category: "Wellness Supplements", price: 30000, image: "/products/wellness-height-growth-capsules.jpg", tags: ["Wellness", "Capsules"], description: "Height Growth capsule bottle listed as a wellness supplement. Read directions and ingredients before use." },
  { id: 60, slug: "creatine-60-capsules", name: "Creatine 60 Capsules", category: "Fitness Supplements", price: 30000, image: "/products/fitness-creatine-60-capsules.jpg", tags: ["Gym", "Creatine", "Fitness"], description: "Creatine capsule bottle for fitness shoppers and gym routines. Follow the label dosage directions." },
  { id: 61, slug: "3-days-slimming-capsules", name: "3 Days Slimming Capsules", category: "Wellness Supplements", price: 30000, image: "/products/wellness-3-days-slimming.jpg", tags: ["Wellness", "Capsules"], description: "Slimming capsule bottle available from Shopyacu. Confirm ingredients and usage instructions before ordering." },
  { id: 62, slug: "oxo-capsules", name: "OXO Capsules", category: "Wellness Supplements", price: 30000, image: "/products/wellness-oxo-capsules.jpg", tags: ["Wellness", "Capsules"], description: "OXO capsule bottle for customers browsing wellness items. Message us for label details and availability." },
  { id: 63, slug: "dark-knuckle-whitening-cream", name: "Dark Knuckle Whitening Cream", category: "Skin Care", price: 30000, image: "/products/skin-dark-knuckle-whitening-cream.jpg", tags: ["Skin care", "Cream"], description: "Dark knuckle whitening cream for skincare routines. Patch test and follow the product label before use." },
  { id: 64, slug: "liangnwbingtang-mouth-care", name: "Liangnwbingtang Mouth Care", category: "Oral Care", price: 30000, image: "/products/oral-liangnwbingtang-mouth-care.jpg", tags: ["Oral care"], description: "Packaged mouth-care item available for ordering. Ask Shopyacu for exact label details and directions." },
  { id: 65, slug: "7-days-hair-oil", name: "7 Days Hair Oil", category: "Hair Care", price: 30000, image: "/products/hair-7-days-hair-oil.jpg", tags: ["Hair care", "Oil"], description: "7 Days hair oil for hair-care routines. Read the label and apply as directed." },
  { id: 66, slug: "sex-light-orgasmic-gel", name: "Sex Light Orgasmic Gel", category: "Personal Care", price: 30000, image: "/products/personal-sex-light-orgasmic-gel.jpg", tags: ["Personal care", "Women"], description: "Women's personal-care gel available from Shopyacu. Confirm label details, ingredients, and directions before use." },
  { id: 67, slug: "sonifer-sandwich-maker", name: "Sonifer Sandwich Maker", category: "Kitchen", price: 0, image: "/products/sonifer-sandwich-maker-box-1.jpg", badge: "New arrival", tags: ["Kitchen", "Appliance", "Breakfast"], description: "Sonifer sandwich maker for quick toasted sandwiches and everyday kitchen snacks. Message Shopyacu to confirm the latest price and stock." },
  { id: 68, slug: "foldable-electric-ironing-board", name: "Foldable Electric Ironing Board", category: "Home Appliances", price: 0, image: "/products/electric-ironing-board-1.jpg", tags: ["Laundry", "Ironing", "Home"], description: "Foldable ironing board for laundry rooms and home garment care. Ask on WhatsApp for current availability and delivery details." },
  { id: 69, slug: "metal-kitchen-rack", name: "Metal Kitchen Rack", category: "Storage & Racks", price: 0, image: "/products/metal-kitchen-rack-box.jpg", tags: ["Kitchen", "Storage", "Rack"], description: "Multi-tier kitchen rack for organizing dishes, cookware, condiments, and everyday kitchen tools." },
  { id: 70, slug: "assorted-warm-blankets-duvet-sets", name: "Assorted Warm Blankets & Duvet Sets", category: "Bedding", price: 0, image: "/products/assorted-bedding-stack-1.jpg", badge: "Assorted colors", tags: ["Bedding", "Blankets", "Duvet"], description: "Assorted warm blankets and duvet sets in multiple colors and patterns. Contact Shopyacu to choose the available style you want." },
  { id: 71, slug: "silver-crest-8l-air-fryer", name: "Silver Crest 8L Air Fryer", category: "Kitchen", price: 0, image: "/products/silver-crest-air-fryer-box-1.jpg", badge: "Kitchen pick", tags: ["Air fryer", "Kitchen", "Appliance"], description: "Silver Crest 8L air fryer for easy home cooking with less oil. Message us for the latest price, color, and stock confirmation." },
  { id: 72, slug: "meylux-water-dispenser", name: "Meylux Water Dispenser", category: "Home Appliances", price: 0, image: "/products/meylux-water-dispenser-front.jpg", tags: ["Water dispenser", "Appliance", "Home"], description: "Meylux water dispenser for home or office use. Confirm model details, price, and delivery options on WhatsApp." },
  { id: 73, slug: "pink-wedding-stage-decor", name: "Pink Wedding Stage Decor Setup", category: "Wedding", price: 0, image: "/products/wedding-stage-pink-view-1.jpg", badge: "Event decor", tags: ["Wedding", "Decor", "Stage"], description: "Pink wedding stage decor setup for ceremonies, receptions, and photo moments. Ask Shopyacu for package details and availability." },
  { id: 74, slug: "standing-storage-cabinet", name: "Standing Storage Cabinet", category: "Storage & Racks", price: 0, image: "/products/standing-storage-cabinet.jpg", tags: ["Storage", "Cabinet", "Home"], description: "Standing storage cabinet for organizing household items, clothes, and supplies in compact spaces." },
  { id: 75, slug: "countertop-water-dispenser", name: "Countertop Water Dispenser", category: "Home Appliances", price: 0, image: "/products/countertop-water-dispenser-lifestyle.jpg", tags: ["Water dispenser", "Kitchen", "Home"], description: "Compact countertop water dispenser for kitchens, offices, and small spaces. Contact us for current price and stock." },
  { id: 76, slug: "kitchen-dish-rack", name: "Kitchen Dish Rack", category: "Storage & Racks", price: 0, image: "/products/kitchen-dish-rack-box.jpg", tags: ["Kitchen", "Dish rack", "Storage"], description: "Kitchen dish rack for plates, cups, utensils, and countertop organization." },
  { id: 77, slug: "elastic-load-cover", name: "Elastic Load Cover", category: "Outdoor", price: 0, image: "/products/elastic-load-cover.jpg", tags: ["Outdoor", "Cover", "Utility"], description: "Elastic load cover for securing and covering carried items during movement, storage, or outdoor use." },
  { id: 78, slug: "portable-cloth-wardrobe", name: "Portable Cloth Wardrobe", category: "Storage & Racks", price: 0, image: "/products/portable-wardrobe-lifestyle.jpg", tags: ["Wardrobe", "Storage", "Clothes"], description: "Portable cloth wardrobe with shelves and hanging space for bedrooms, rentals, and compact homes." },
  { id: 79, slug: "door-draft-stopper-set", name: "Door Draft Stopper Set", category: "Home", price: 0, image: "/products/door-draft-stopper-set.jpg", tags: ["Door seal", "Home", "Comfort"], description: "Door draft stopper set for reducing gaps under doors and improving everyday home comfort." },
  { id: 80, slug: "over-toilet-bathroom-rack", name: "Over-Toilet Bathroom Rack", category: "Bathroom", price: 0, image: "/products/over-toilet-bathroom-rack.jpg", tags: ["Bathroom", "Rack", "Storage"], description: "Over-toilet bathroom rack for keeping toiletries, towels, and daily essentials organized." },
  { id: 81, slug: "shoe-and-hat-rack", name: "Shoe and Hat Rack", category: "Storage & Racks", price: 0, image: "/products/shoe-and-hat-rack-box.jpg", tags: ["Shoes", "Rack", "Storage"], description: "Shoe and hat rack for entryways, bedrooms, and closet organization." },
  { id: 82, slug: "electric-kettle", name: "Electric Kettle", category: "Kitchen", price: 0, image: "/products/electric-kettle-display.jpg", tags: ["Kettle", "Kitchen", "Appliance"], description: "Electric kettle for boiling water quickly at home, in the office, or in small kitchens." },
  { id: 83, slug: "storage-ottoman-stools", name: "Storage Ottoman Stools", category: "Furniture", price: 0, image: "/products/storage-ottoman-stools.jpg", tags: ["Furniture", "Storage", "Stool"], description: "Storage ottoman stools that can be used for seating, small-space organization, and room styling." },
  { id: 84, slug: "excel-course", name: "Excel Course", category: "Learning", price: 200000, image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80", badge: "Course", tags: ["Excel", "Learning", "Business"], description: "A practical one-month Excel course for office work, business tracking, reports, and everyday data confidence. Price is RWF 200,000 per month." },
  { id: 85, slug: "digital-marketing-course", name: "Digital Marketing Course", category: "Learning", price: 200000, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", badge: "Course", tags: ["Marketing", "Social media", "Learning"], description: "A one-month digital marketing course for social media, content, ads, WhatsApp selling, and customer growth. Price is RWF 200,000 per month." },
  { id: 86, slug: "full-stack-development-course", name: "Full Stack Development Course", category: "Learning", price: 200000, image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80", badge: "Course", tags: ["Coding", "Web development", "Learning"], description: "A one-month full stack development course covering frontend, backend, databases, and deployment. Price is RWF 200,000 per month." },
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
  34: ["wellness-butt-booster-2.jpg"],
  43: ["wellness-femmi-brew-2.jpg"],
  67: ["sonifer-sandwich-maker-box-2.jpg", "sonifer-sandwich-maker-box-3.jpg"],
  68: ["ironing-board-box-blue.jpg", "ironing-board-box-black.jpg", "ironing-board-lifestyle.jpg"],
  70: ["bedding-color-options.jpg", "red-warm-blanket.jpg", "black-duvet-set.jpg", "striped-warm-blanket.jpg", "assorted-bedding-stack-2.jpg", "cream-warm-blanket.jpg", "bedding-stock-shelves.jpg", "bedding-store-display.jpg", "assorted-bedding-stack-3.jpg", "assorted-bedding-stack-4.jpg"],
  71: ["silver-crest-air-fryer-box-2.jpg", "air-fryer-display-unit.jpg", "silver-crest-air-fryer-box-3.jpg"],
  72: ["meylux-water-dispenser-box.jpg"],
  73: ["wedding-stage-pink-view-2.jpg"],
  75: ["countertop-water-dispenser-side.jpg", "standing-water-dispenser.jpg"],
  78: ["portable-cloth-wardrobe-box.jpg"],
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

function normalizeTags(tags: Product["tags"] | string | undefined) {
  const values = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",") : [];

  return Array.from(
    new Set(
      values
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
    ),
  );
}

function normalizeTextList(value: string[] | string | undefined, max: number, maxLen: number): string[] | undefined {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split("\n") : [];
  const cleaned = Array.from(
    new Set(
      values
        .map((item) => String(item).trim().slice(0, maxLen))
        .filter(Boolean),
    ),
  ).slice(0, max);
  return cleaned.length ? cleaned : undefined;
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
    tags: normalizeTags(product.tags),
    description: product.description?.trim() || `${name} is available from Shopyacu for local online ordering and delivery.`,
    highlights: normalizeTextList(product.highlights, 6, 200),
    howToUse: normalizeTextList(product.howToUse, 6, 200),
    seoKeywords: normalizeTextList(product.seoKeywords, 12, 80),
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
