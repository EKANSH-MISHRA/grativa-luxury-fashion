// GRATIVA Database Utility using Local Storage
// Persists products, categories, orders, customers, homepage sections, blogs, and SEO metadata.

export interface Product {
  id: string;
  name: string;
  subtitle?: string; // Luxury subtitle (e.g. "Sculpted Leather Silhouette")
  description: string;
  longDescription?: string; // Rich copy detailing history, materials, stitch details
  images: string[]; // Primary catalog images
  galleryImages?: string[]; // Full photo slider gallery
  thumbnail?: string; // Fast load catalog card thumbnail
  price: number;
  comparePrice?: number; // Original retail price for sales
  category: string;
  color: string;
  colorHex: string;
  inventory: number; // Stock count
  status: "draft" | "active" | "archived";
  featured: boolean;
  bestseller: boolean;
  newArrival?: boolean; // Label as latest drop
  luxuryBadge?: string; // e.g. "Atelier", "Limited Run", "Pre-Order"
  badge?: string; // Derived / legacy fallback badge
  inStock: boolean;
  sku?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  title?: string;
  description?: string;
  bannerImage?: string;
  heroImage?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  productNames: string[];
  amount: number;
  status: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  date: string;
  items?: { productId: string; name: string; price: number; quantity: number }[];
  shippingAddress?: { street: string; city: string; state: string; zip: string; country: string };
  paymentStatus?: "pending" | "paid" | "failed";
  paymentId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  tier: "standard" | "gold" | "vip";
  joinedDate: string;
  password?: string;
  addresses?: { id: string; name: string; street: string; city: string; state: string; zip: string; country: string }[];
  wishlist?: string[];
}

export interface Blog {
  id: string;
  title: string;
  subtitle?: string; // NEW
  slug: string;
  content: string;
  featuredImage: string;
  excerpt: string;
  author: string;
  date: string;
  publishDate?: string; // For scheduling
  category: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string; // NEW
  status: "draft" | "published";
}

export interface HomepageContent {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    images: string[];
  };
  difference: {
    headline: string;
    subheadline: string;
    features: {
      id?: string;
      title: string;
      desc: string;
      image: string;
      hidden?: boolean;
    }[];
  };
  comingSoon: {
    headline: string;
    subheadline: string;
    categories: {
      name: string;
      label: string;
      image: string;
    }[];
  };
  newsletter: {
    headline: string;
    subheadline: string;
  };
  footer: {
    about: string;
    email: string;
    location: string;
  };
  marquee: string[];
  emptyState?: {
    title: string;
    description: string;
    buttonText: string;
    image: string;
  };
}

export interface SeoSettings {
  home: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
    keywords: string;
    twitterCard?: string;
  };
  blog: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
    keywords: string;
    twitterCard?: string;
  };
}

// ─── INITIAL SEED DATA ────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "vl-001",
    name: "The Signature Tote",
    subtitle: "Meticulously Structured Leather",
    description: "Handcrafted with meticulous detail, The Signature Tote is designed for women who move with intention. Spacious, structured, and endlessly refined. Features a suede-lined interior, internal zippered pocket, and polished gold-plated hardware.",
    longDescription: "<p>The Signature Tote is the ultimate embodiment of quiet luxury. Built in our Mumbai atelier from the finest top-grain European calfskin leather, each tote takes over twenty hours of manual craftsmanship to build.</p><p>Featuring double-saddle stitching at all pressure points and finished with hand-painted burnished edges, it is designed to hold its structural shape for generations while acquiring a beautiful, rich patina.</p><p>Inside, you will find a premium split-suede lining in charcoal gray, a secure zippered pocket for coordinates, and solid gold-plated brass hardware that resists tarnishing.</p>",
    images: ["https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format"],
    galleryImages: [
      "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1591348278900-019a8a2a8b1d?w=600&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&auto=format"
    ],
    thumbnail: "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=300&h=400&fit=crop&auto=format",
    price: 34500,
    comparePrice: 39500,
    category: "Handbags",
    color: "Mocha Brown",
    colorHex: "#6B4C3B",
    inventory: 12,
    status: "active",
    featured: true,
    bestseller: true,
    newArrival: false,
    luxuryBadge: "Atelier",
    badge: "Bestseller",
    inStock: true,
    sku: "GRT-TOT-MOC-01",
    seoTitle: "The Signature Tote in Mocha Brown | GRATIVA Luxury Handbags",
    seoDescription: "Shop the handcrafted Calfskin Signature Tote bag in Mocha Brown. Custom gold-plated hardware and suede linings.",
    seoKeywords: "luxury tote, calfskin leather bag, quiet luxury, mocha tote"
  },
  {
    id: "vl-002",
    name: "The Signature Tote",
    subtitle: "Classic Ivory Calfskin",
    description: "An expression of pure ivory elegance. The Signature Tote in Ivory White offers a striking contrast to any silhouette. Carefully selected top-grain leather, meticulously stitched by our master artisans.",
    longDescription: "<p>The Ivory White expression of our Signature Tote represents the absolute zenith of luxury presentation. Hand-formed by master leatherworkers, it features a striking stark contrast that complements monochromatic garments.</p><p>Crafted using water-resistant, durable grain leather, it keeps its pristine matte look while remaining soft to the touch. Features custom protective feet, matching key-fob pouch, and reinforced side folds.</p>",
    images: ["https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?w=600&h=800&fit=crop&auto=format"],
    galleryImages: [
      "https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?w=600&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=800&fit=crop&auto=format"
    ],
    thumbnail: "https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?w=300&h=400&fit=crop&auto=format",
    price: 34500,
    category: "Handbags",
    color: "Ivory White",
    colorHex: "#F0EAE0",
    inventory: 8,
    status: "active",
    featured: true,
    bestseller: false,
    newArrival: true,
    luxuryBadge: "New In",
    badge: "New",
    inStock: true,
    sku: "GRT-TOT-IVR-02",
    seoTitle: "The Signature Tote in Ivory White | Luxury Leather Tote",
    seoDescription: "Exquisite ivory grain calfskin leather luxury handbag with gold hardware. Free shipping in India.",
    seoKeywords: "ivory luxury bag, white leather tote, designer purse"
  },
  {
    id: "vl-003",
    name: "The Signature Tote",
    subtitle: "Quiet Power Blush Nuance",
    description: "A soft, romantic nuance of pink. Perfect for spring afternoons and transition outfits, this bag stands as a statement of soft, power.",
    longDescription: "<p>Refined, soft, and highly desirable. The Signature Tote in Blush Pink captures modern pastel elegance. Perfectly balanced tone-on-tone edge paints and subtle metallic logos.</p>",
    images: ["https://images.unsplash.com/photo-1683921470299-b8f0f3331657?w=600&h=800&fit=crop&auto=format"],
    galleryImages: ["https://images.unsplash.com/photo-1683921470299-b8f0f3331657?w=600&h=800&fit=crop&auto=format"],
    thumbnail: "https://images.unsplash.com/photo-1683921470299-b8f0f3331657?w=300&h=400&fit=crop&auto=format",
    price: 34500,
    comparePrice: 36000,
    category: "Handbags",
    color: "Blush Pink",
    colorHex: "#E8BDB0",
    inventory: 5,
    status: "active",
    featured: false,
    bestseller: false,
    newArrival: false,
    luxuryBadge: "Atelier",
    badge: undefined,
    inStock: true,
    sku: "GRT-TOT-BLS-03",
    seoTitle: "Blush Pink Signature Leather Tote | GRATIVA Handbags",
    seoDescription: "Durable pebbled leather tote bag in subtle blush pink. Crafted to be desired.",
    seoKeywords: "blush pink bag, designer leather tote, grativa hand bag"
  },
  {
    id: "vl-004",
    name: "The Signature Tote",
    subtitle: "Midnight Authority Classic",
    description: "The absolute classic. A deep, intense black with gold-toned details. Sophisticated, authoritative, and stunning in any lighting conditions.",
    longDescription: "<p>The ultimate classic item. An all-leather structure in Midnight Black. Finished with pure micro-milled gold hardware that contrasts with calfskin shadows. Built for the boardroom and nighttime engagements alike.</p>",
    images: ["https://images.unsplash.com/photo-1614179689702-355944cd0918?w=600&h=800&fit=crop&auto=format"],
    galleryImages: [
      "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=600&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&h=800&fit=crop&auto=format"
    ],
    thumbnail: "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=300&h=400&fit=crop&auto=format",
    price: 34500,
    category: "Handbags",
    color: "Midnight Black",
    colorHex: "#1A1714",
    inventory: 15,
    status: "active",
    featured: true,
    bestseller: false,
    newArrival: false,
    luxuryBadge: "Timeless",
    badge: undefined,
    inStock: true,
    sku: "GRT-TOT-BLK-04",
    seoTitle: "Midnight Black Signature Tote Handbag | GRATIVA",
    seoDescription: "The timeless black leather handbag. Luxury suede-lined classic tote in absolute black.",
    seoKeywords: "black designer tote, black leather handbag, classic purse"
  },
];

const INITIAL_CATEGORIES: Category[] = [
  { 
    id: "cat-1", 
    name: "Handbags", 
    slug: "handbags",
    title: "Le Handbags Collection",
    description: "Sleek, handcrafted leather handbags representing pure Parisian luxury and quiet sophistication.",
    bannerImage: "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=1200&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format"
  },
  { 
    id: "cat-2", 
    name: "Watches", 
    slug: "watches",
    title: "Chrono Horology",
    description: "Impeccable mechanical timepieces and chronographs designed to tell time with artistic precision.",
    bannerImage: "https://images.unsplash.com/photo-1768123969966-64d79a5c33ca?w=1200&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1768123969966-64d79a5c33ca?w=600&h=800&fit=crop&auto=format"
  },
  { 
    id: "cat-3", 
    name: "Fine Jewelry", 
    slug: "fine-jewelry",
    title: "Ornements de L'Atelier",
    description: "Exquisite solid gold rings, diamond-encrusted collars, and fine pieces celebrating rare gems.",
    bannerImage: "https://images.unsplash.com/photo-1591352254932-6d56d9fe295b?w=1200&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1591352254932-6d56d9fe295b?w=600&h=800&fit=crop&auto=format"
  },
  { 
    id: "cat-4", 
    name: "Beauty & Nails", 
    slug: "beauty-nails",
    title: "Atelier Cosmétique",
    description: "Curated collection of clean cosmetics, custom nail treatments, and luxury fragrance oils.",
    bannerImage: "https://images.unsplash.com/photo-1628483211662-9bcc692c46dc?w=1200&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1628483211662-9bcc692c46dc?w=600&h=800&fit=crop&auto=format"
  },
  { 
    id: "cat-5", 
    name: "Womenswear", 
    slug: "womenswear",
    title: "Prêt-à-Porter Haute Couture",
    description: "Sculptured coats, fine silk shirts, and knit coordination coordinates reflecting timeless silhouettes.",
    bannerImage: "https://images.unsplash.com/photo-1779405949264-a44d50a14315?w=1200&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1779405949264-a44d50a14315?w=600&h=800&fit=crop&auto=format"
  },
];

const INITIAL_ORDERS: Order[] = [
  { id: "#VL-0091", customerName: "Priya Sharma", customerEmail: "priya@email.com", productNames: ["The Signature Tote — Mocha Brown"], amount: 34500, status: "delivered", date: "2026-06-14" },
  { id: "#VL-0090", customerName: "Ananya Verma", customerEmail: "ananya@email.com", productNames: ["The Signature Tote — Ivory White"], amount: 34500, status: "shipped", date: "2026-06-13" },
  { id: "#VL-0089", customerName: "Kavya Nair", customerEmail: "kavya@email.com", productNames: ["The Signature Tote — Midnight Black"], amount: 34500, status: "confirmed", date: "2026-06-13" },
  { id: "#VL-0088", customerName: "Riya Patel", customerEmail: "riya@email.com", productNames: ["The Signature Tote — Blush Pink"], amount: 34500, status: "pending", date: "2026-06-12" },
  { id: "#VL-0087", customerName: "Meera Iyer", customerEmail: "meera@email.com", productNames: ["The Signature Tote — Mocha Brown"], amount: 34500, status: "delivered", date: "2026-06-10" },
  { id: "#VL-0086", customerName: "Shreya Kapoor", customerEmail: "shreya@email.com", productNames: ["The Signature Tote — Ivory White"], amount: 34500, status: "delivered", date: "2026-06-09" },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43210", ordersCount: 3, totalSpent: 103500, tier: "vip", joinedDate: "2026-01-10", password: "customer123", addresses: [{ id: "addr-1", name: "Home", street: "102, Ocean Drive, Bandra West", city: "Mumbai", state: "Maharashtra", zip: "400050", country: "India" }], wishlist: ["vl-001"] },
  { id: "c2", name: "Ananya Verma", email: "ananya@email.com", phone: "+91 98765 43211", ordersCount: 2, totalSpent: 69000, tier: "gold", joinedDate: "2026-02-15", password: "customer123", addresses: [{ id: "addr-2", name: "Office", street: "Godrej One, Vikhroli", city: "Mumbai", state: "Maharashtra", zip: "400079", country: "India" }], wishlist: ["vl-002"] },
  { id: "c3", name: "Kavya Nair", email: "kavya@email.com", phone: "+91 98765 43212", ordersCount: 1, totalSpent: 34500, tier: "standard", joinedDate: "2026-03-22", password: "customer123", addresses: [], wishlist: [] },
  { id: "c4", name: "Riya Patel", email: "riya@email.com", phone: "+91 98765 43213", ordersCount: 1, totalSpent: 34500, tier: "standard", joinedDate: "2026-04-05", password: "customer123", addresses: [], wishlist: [] },
  { id: "c5", name: "Meera Iyer", email: "meera@email.com", phone: "+91 98765 43214", ordersCount: 2, totalSpent: 69000, tier: "gold", joinedDate: "2026-05-18", password: "customer123", addresses: [], wishlist: [] },
  { id: "c6", name: "Shreya Kapoor", email: "shreya@email.com", phone: "+91 98765 43215", ordersCount: 2, totalSpent: 69000, tier: "gold", joinedDate: "2026-05-20", password: "customer123", addresses: [], wishlist: [] },
];

const INITIAL_BLOGS: Blog[] = [
  {
    id: "blog-1",
    title: "Quiet Luxury: The Art of Styling and Discretion",
    subtitle: "Mastering the aesthetics of soft power",
    slug: "quiet-luxury-styling-and-discretion",
    content: `<p>In a world characterized by fleeting trends and loud statements, a quieter movement has taken root. "Quiet luxury" is not merely about owning luxury items; it is a philosophy of curation, restraint, and an appreciation for craftsmanship that doesn't need to shout to be recognized.</p>
    <h3>The Philosophy of Restraint</h3>
    <p>Quiet luxury values textures over logos, cut over ornamentation, and longevity over temporary styling. It asks us to invest in pieces that are timeless. A handbag that moves with you from boardroom to high tea, retaining its shape, character, and allure for decades.</p>
    <blockquote>"Simplicity is the ultimate sophistication." — Leonardo da Vinci</blockquote>
    <p>To style for quiet luxury, focus on neutral tone-on-tone coordinates. Monochromatic mocha or camel cashmere matched with a structured leather tote creates an image of elegance and effortless posture.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1779398968962-b3ad149b57b6?w=800&h=500&fit=crop&auto=format",
    excerpt: "Discover the principles of quiet luxury, focusing on texture, craftsmanship, and timeless elegance without the logos.",
    author: "Ishaan Mehta",
    date: "2026-06-18",
    category: "Journal",
    metaTitle: "Quiet Luxury Styling Guide | GRATIVA Journal",
    metaDescription: "Learn how to master the quiet luxury aesthetic with our styling tips on neutral tones, clean lines, and luxury materials.",
    keywords: "quiet luxury, fashion guide, calfskin leather bags, designer styling",
    status: "published"
  },
  {
    id: "blog-2",
    title: "Inside the Atelier: The Craft of GRATIVA Handbags",
    subtitle: "A story of calfskin grain and double saddle stitching",
    slug: "inside-atelier-craft-of-grativa",
    content: `<p>Every GRATIVA piece begins its life in our atelier as a collection of carefully hand-selected premium materials. Our artisans bring together decades of combined experience in cutting, stitching, and finishing to breathe life into our designs.</p>
    <h3>The Selection Process</h3>
    <p>We source top-grain leathers that develop a beautiful patina over time. Each hide is inspected under specific light temperatures to ensure perfect uniformity of grain and shade. Only the top 5% of materials make the final selection.</p>
    <h3>Hand-stitched Mastery</h3>
    <p>Our bags feature double-saddle stitching at stress locations, a traditional method that ensures the bag never unravels. The edge finishing alone takes more than six hours, involving multiple rounds of hand-burnishing and painting.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1591348278900-019a8a2a8b1d?w=800&h=500&fit=crop&auto=format",
    excerpt: "Take a step behind the scenes to see how our master artisans handcraft each GRATIVA leather bag in Mumbai.",
    author: "Pritha Sen",
    date: "2026-06-10",
    category: "Craftsmanship",
    metaTitle: "The Craftsmanship of GRATIVA Bags | Atelier Insights",
    metaDescription: "An inside look at our leather selection, saddle-stitching, and edge burnishing process that makes GRATIVA bags highly durable.",
    keywords: "leather stitching, calfskin selection, bag workshop, master artisans",
    status: "published"
  }
];

const INITIAL_HOMEPAGE: HomepageContent = {
  hero: {
    badge: "The Signature Collection — 2026",
    headline: "Crafted To Be\nDesired.",
    subheadline: "Timeless handbags designed for women who appreciate elegance.",
    ctaText: "Discover The Collection",
    ctaLink: "#collection",
    images: [
      "https://images.unsplash.com/photo-1779398968962-b3ad149b57b6?w=1920&h=1080&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=1920&h=1080&fit=crop&auto=format"
    ],
  },
  difference: {
    headline: "THE GRATIVA DIFFERENCE",
    subheadline: "Designed for women who appreciate elegance, confidence, and timeless style.",
    features: [
      {
        id: "feat-1",
        title: "Curated Designs",
        desc: "Every piece is carefully selected to reflect modern luxury and effortless sophistication.",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&auto=format",
        hidden: false
      },
      {
        id: "feat-2",
        title: "Limited Drops",
        desc: "Exclusive collections released in limited quantities to maintain uniqueness and desirability.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=800&fit=crop&auto=format",
        hidden: false
      },
      {
        id: "feat-3",
        title: "Premium Finish",
        desc: "Attention to detail, refined aesthetics, and elevated presentation in every product.",
        image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&h=800&fit=crop&auto=format",
        hidden: false
      },
      {
        id: "feat-4",
        title: "Modern Elegance",
        desc: "Contemporary fashion designed to complement the lifestyle of today's confident women.",
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=800&fit=crop&auto=format",
        hidden: false
      },
    ],
  },
  comingSoon: {
    headline: "Coming Soon",
    subheadline: "New categories, new expressions. The GRATIVA world is expanding.",
    categories: [
      {
        name: "Timepieces",
        label: "Watches",
        image: "https://images.unsplash.com/photo-1768123969966-64d79a5c33ca?w=400&h=500&fit=crop&auto=format",
      },
      {
        name: "Fine Jewelry",
        label: "Jewelry",
        image: "https://images.unsplash.com/photo-1591352254932-6d56d9fe295b?w=400&h=500&fit=crop&auto=format",
      },
      {
        name: "Fine Accessories",
        label: "Accessories",
        image: "https://images.unsplash.com/photo-1628483211662-9bcc692c46dc?w=400&h=500&fit=crop&auto=format",
      },
      {
        name: "Womenswear",
        label: "Fashion",
        image: "https://images.unsplash.com/photo-1779405949264-a44d50a14315?w=400&h=500&fit=crop&auto=format",
      },
    ],
  },
  newsletter: {
    headline: "The GRATIVA Edit",
    subheadline: "Curated stories, styling notes, and early access. No noise.",
  },
  footer: {
    about: "Luxury women's accessories crafted with intention. Born in Mumbai.",
    email: "hello@grativa.in",
    location: "Mumbai, Maharashtra, India",
  },
  marquee: [
    "Free Shipping Over ₹5,000",
    "Complimentary Dust Bag",
    "30-Day Returns",
    "Handcrafted In India",
    "Signature Experience",
  ],
  emptyState: {
    title: "Collection In Formulation",
    description: "Our master artisans are currently stitching the next drop. Sign up for Privé access to be notified.",
    buttonText: "Request Access Preview",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&auto=format"
  }
};

const INITIAL_SEO: SeoSettings = {
  home: {
    title: "GRATIVA | Quiet Luxury & Timeless Leather Handbags",
    description: "Explore the GRATIVA Signature Collection. Handcrafted leather bags designed in Mumbai with quiet sophistication and premium materials.",
    ogTitle: "GRATIVA - A Statement of Quiet Luxury",
    ogDescription: "Handcrafted leather handbags designed for women who move with intention. Experience the GRATIVA standard.",
    ogImage: "https://images.unsplash.com/photo-1779398968962-b3ad149b57b6?w=1200&h=630&fit=crop",
    canonicalUrl: "https://grativa.in",
    keywords: "luxury bags, handbags, leather bags, quiet luxury, fashion, designer tote",
    twitterCard: "summary_large_image"
  },
  blog: {
    title: "The Journal | Art, Craftsmanship & Quiet Luxury by GRATIVA",
    description: "Read about leather styling guides, the design atelier, and luxury lifestyle notes in the official GRATIVA Journal.",
    ogTitle: "The GRATIVA Journal - Quiet Luxury Musings",
    ogDescription: "Refined stories on materials, craftsmanship, and design from the creators of GRATIVA.",
    ogImage: "https://images.unsplash.com/photo-1591348278900-019a8a2a8b1d?w=1200&h=630&fit=crop",
    canonicalUrl: "https://grativa.in/journal",
    keywords: "styling guide, leather craft, luxury journal, fashion atelier",
    twitterCard: "summary_large_image"
  },
};

// ─── LOCAL STORAGE WRAPPER ───────────────────────────────────────────────────

const STORAGE_KEYS = {
  PRODUCTS: "grativa_products",
  CATEGORIES: "grativa_categories",
  ORDERS: "grativa_orders",
  CUSTOMERS: "grativa_customers",
  BLOGS: "grativa_blogs",
  HOMEPAGE: "grativa_homepage",
  SEO: "grativa_seo",
  SESSION: "grativa_admin_session",
  CUSTOMER_SESSION: "grativa_customer_session"
};

export const db = {
  getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      this.saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return INITIAL_PRODUCTS;
      
      // Sanitize product schemas defensively
      return parsed.map((p: any) => ({
        id: String(p.id || `product-${Date.now()}-${Math.random()}`),
        name: String(p.name || "Untitled Product"),
        subtitle: p.subtitle ? String(p.subtitle) : "",
        description: String(p.description || ""),
        longDescription: p.longDescription ? String(p.longDescription) : "",
        images: Array.isArray(p.images) ? p.images : (p.image ? [String(p.image)] : []),
        galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [p.images?.[0] || ""],
        thumbnail: p.thumbnail ? String(p.thumbnail) : (p.images?.[0] || ""),
        price: Number(p.price || 0),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
        category: String(p.category || "Handbags"),
        color: String(p.color || "Ivory"),
        colorHex: String(p.colorHex || "#C9A96E"),
        inventory: typeof p.inventory === "number" ? p.inventory : 10,
        status: p.status === "draft" || p.status === "active" || p.status === "archived" ? p.status : "active",
        featured: Boolean(p.featured),
        bestseller: Boolean(p.bestseller),
        newArrival: Boolean(p.newArrival),
        luxuryBadge: p.luxuryBadge ? String(p.luxuryBadge) : "",
        badge: p.badge ? String(p.badge) : undefined,
        inStock: typeof p.inStock === "boolean" ? p.inStock : (p.inventory > 0),
        sku: p.sku ? String(p.sku) : `GRT-PROD-${p.id.toUpperCase()}`,
        seoTitle: p.seoTitle ? String(p.seoTitle) : "",
        seoDescription: p.seoDescription ? String(p.seoDescription) : "",
        seoKeywords: p.seoKeywords ? String(p.seoKeywords) : ""
      }));
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event("grativa_db_update"));
  },

  getCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) {
      this.saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return INITIAL_CATEGORIES;
      return parsed.map((c: any) => ({
        id: String(c.id || `cat-${Date.now()}`),
        name: String(c.name || ""),
        slug: String(c.slug || ""),
        title: c.title ? String(c.title) : String(c.name || ""),
        description: c.description ? String(c.description) : "",
        bannerImage: c.bannerImage ? String(c.bannerImage) : "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=1200&h=400&fit=crop&auto=format",
        heroImage: c.heroImage ? String(c.heroImage) : "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format"
      }));
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    window.dispatchEvent(new Event("grativa_db_update"));
  },

  getOrders(): Order[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      this.saveOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return INITIAL_ORDERS;
      
      // Sanitize order schemas defensively
      return parsed.map((o: any) => ({
        id: String(o.id || `#VL-${Date.now()}`),
        customerName: String(o.customerName || o.customer || "Guest"),
        customerEmail: String(o.customerEmail || "guest@email.com"),
        productNames: Array.isArray(o.productNames) ? o.productNames : (o.product ? [String(o.product)] : []),
        amount: Number(o.amount || 0),
        status: o.status || "pending",
        date: String(o.date || new Date().toISOString().split("T")[0]),
        items: Array.isArray(o.items) ? o.items : [],
        shippingAddress: o.shippingAddress || { street: "102, Ocean Drive, Bandra West", city: "Mumbai", state: "Maharashtra", zip: "400050", country: "India" },
        paymentStatus: o.paymentStatus || "paid",
        paymentId: o.paymentId || `pay_${Math.random().toString(36).substr(2, 9)}`
      }));
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event("grativa_db_update"));
  },

  getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!data) {
      this.saveCustomers(INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return INITIAL_CUSTOMERS;
      return parsed.map((c: any) => ({
        id: String(c.id || `c-${Date.now()}`),
        name: String(c.name || ""),
        email: String(c.email || ""),
        phone: String(c.phone || ""),
        ordersCount: Number(c.ordersCount || c.orders || 0),
        totalSpent: Number(c.totalSpent || 0),
        tier: c.tier || "standard",
        joinedDate: String(c.joinedDate || new Date().toISOString().split("T")[0]),
        password: c.password || "customer123",
        addresses: Array.isArray(c.addresses) ? c.addresses : [],
        wishlist: Array.isArray(c.wishlist) ? c.wishlist : []
      }));
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    window.dispatchEvent(new Event("grativa_db_update"));
  },

  getBlogs(): Blog[] {
    const data = localStorage.getItem(STORAGE_KEYS.BLOGS);
    if (!data) {
      this.saveBlogs(INITIAL_BLOGS);
      return INITIAL_BLOGS;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return INITIAL_BLOGS;
      return parsed.map((b: any) => ({
        id: String(b.id || `blog-${Date.now()}`),
        title: String(b.title || ""),
        subtitle: b.subtitle ? String(b.subtitle) : "",
        slug: String(b.slug || ""),
        content: String(b.content || ""),
        featuredImage: String(b.featuredImage || ""),
        excerpt: String(b.excerpt || ""),
        author: String(b.author || "Atelier"),
        date: String(b.date || ""),
        publishDate: b.publishDate ? String(b.publishDate) : String(b.date || ""),
        category: String(b.category || "Journal"),
        metaTitle: b.metaTitle ? String(b.metaTitle) : undefined,
        metaDescription: b.metaDescription ? String(b.metaDescription) : undefined,
        keywords: b.keywords ? String(b.keywords) : "",
        status: b.status === "draft" || b.status === "published" ? b.status : "published"
      }));
    } catch {
      return INITIAL_BLOGS;
    }
  },

  saveBlogs(blogs: Blog[]): void {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    window.dispatchEvent(new Event("grativa_db_update"));
  },

  getHomepage(): HomepageContent {
    const data = localStorage.getItem(STORAGE_KEYS.HOMEPAGE);
    if (!data) {
      this.saveHomepage(INITIAL_HOMEPAGE);
      return INITIAL_HOMEPAGE;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed || !parsed.hero || !parsed.difference || !parsed.comingSoon || !parsed.newsletter || !parsed.footer) {
        return INITIAL_HOMEPAGE;
      }
      if (!parsed.emptyState) {
        parsed.emptyState = INITIAL_HOMEPAGE.emptyState;
      }
      return parsed;
    } catch {
      return INITIAL_HOMEPAGE;
    }
  },

  saveHomepage(content: HomepageContent): void {
    localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(content));
    window.dispatchEvent(new Event("grativa_db_update"));
  },

  getSeo(): SeoSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SEO);
    if (!data) {
      this.saveSeo(INITIAL_SEO);
      return INITIAL_SEO;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed || !parsed.home || !parsed.blog) {
        return INITIAL_SEO;
      }
      return {
        home: {
          title: String(parsed.home.title || INITIAL_SEO.home.title),
          description: String(parsed.home.description || INITIAL_SEO.home.description),
          ogTitle: String(parsed.home.ogTitle || INITIAL_SEO.home.ogTitle),
          ogDescription: String(parsed.home.ogDescription || INITIAL_SEO.home.ogDescription),
          ogImage: String(parsed.home.ogImage || INITIAL_SEO.home.ogImage),
          canonicalUrl: String(parsed.home.canonicalUrl || INITIAL_SEO.home.canonicalUrl),
          keywords: String(parsed.home.keywords || INITIAL_SEO.home.keywords),
          twitterCard: String(parsed.home.twitterCard || INITIAL_SEO.home.twitterCard || "summary_large_image")
        },
        blog: {
          title: String(parsed.blog.title || INITIAL_SEO.blog.title),
          description: String(parsed.blog.description || INITIAL_SEO.blog.description),
          ogTitle: String(parsed.blog.ogTitle || INITIAL_SEO.blog.ogTitle),
          ogDescription: String(parsed.blog.ogDescription || INITIAL_SEO.blog.ogDescription),
          ogImage: String(parsed.blog.ogImage || INITIAL_SEO.blog.ogImage),
          canonicalUrl: String(parsed.blog.canonicalUrl || INITIAL_SEO.blog.canonicalUrl),
          keywords: String(parsed.blog.keywords || INITIAL_SEO.blog.keywords),
          twitterCard: String(parsed.blog.twitterCard || INITIAL_SEO.blog.twitterCard || "summary_large_image")
        }
      };
    } catch {
      return INITIAL_SEO;
    }
  },

  saveSeo(seo: SeoSettings): void {
    localStorage.setItem(STORAGE_KEYS.SEO, JSON.stringify(seo));
    window.dispatchEvent(new Event("grativa_db_update"));
    this.updateSeoTags();
  },

  updateSeoTags(): void {
    try {
      const isBlog = window.location.pathname.startsWith("/journal") || window.location.pathname.startsWith("/blog");
      const settings = this.getSeo();
      const seo = isBlog ? settings?.blog : settings?.home;

      if (!seo) return;

      document.title = seo.title || "GRATIVA";
      
      // Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", seo.description || "");

      // Open Graph Title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute("content", seo.ogTitle || "");

      // Open Graph Description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute("content", seo.ogDescription || "");

      // Open Graph Image
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", seo.ogImage || "");

      // Canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", seo.canonicalUrl || "");

      // Meta Keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", seo.keywords || "");

      // Twitter Card
      let twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCard) {
        twitterCard = document.createElement("meta");
        twitterCard.setAttribute("name", "twitter:card");
        document.head.appendChild(twitterCard);
      }
      twitterCard.setAttribute("content", seo.twitterCard || "summary_large_image");
    } catch (e) {
      console.error("SEO tags update failed:", e);
    }
  },

  // ─── ADMIN AUTH SESSION ─────────────────────────────────────────────────────

  getAdminSession(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SESSION);
  },

  setAdminSession(email: string): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, email);
  },

  clearAdminSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // ─── CUSTOMER AUTH SESSION ──────────────────────────────────────────────────

  getCustomerSession(): Customer | null {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_SESSION);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCustomerSession(customer: Customer): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_SESSION, JSON.stringify(customer));
    window.dispatchEvent(new Event("grativa_customer_update"));
  },

  clearCustomerSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_SESSION);
    window.dispatchEvent(new Event("grativa_customer_update"));
  }
};
