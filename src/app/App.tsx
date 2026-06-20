import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  ShoppingBag, Heart, Search, Menu, X, Star, ArrowRight,
  Plus, Trash2, Edit, Eye, Package, Users, ShoppingCart,
  BarChart2, LogOut, Mail, MapPin, Check, Bell,
  TrendingUp, Award, Image, Tag, Clock, Gem, Watch,
  Layers, Sparkles, Crown, ChevronDown,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type AdminSection =
  | "overview" | "products" | "orders" | "customers"
  | "banners" | "collections" | "testimonials" | "offers" | "coming-soon";

interface Product {
  id: string;
  name: string;
  color: string;
  colorHex: string;
  price: number;
  image: string;
  badge?: string;
  inStock: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  product: string;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  tier: "standard" | "gold" | "vip";
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: "vl-001",
    name: "The Signature Tote",
    color: "Mocha Brown",
    colorHex: "#6B4C3B",
    price: 34500,
    image: "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format",
    badge: "Bestseller",
    inStock: true,
  },
  {
    id: "vl-002",
    name: "The Signature Tote",
    color: "Ivory White",
    colorHex: "#F0EAE0",
    price: 34500,
    image: "https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?w=600&h=800&fit=crop&auto=format",
    badge: "New",
    inStock: true,
  },
  {
    id: "vl-003",
    name: "The Signature Tote",
    color: "Blush Pink",
    colorHex: "#E8BDB0",
    price: 34500,
    image: "https://images.unsplash.com/photo-1683921470299-b8f0f3331657?w=600&h=800&fit=crop&auto=format",
    inStock: true,
  },
  {
    id: "vl-004",
    name: "The Signature Tote",
    color: "Midnight Black",
    colorHex: "#1A1714",
    price: 34500,
    image: "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=600&h=800&fit=crop&auto=format",
    inStock: true,
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "I've owned bags from Coach and Michael Kors — VELLA rivals them both. The leather is impeccable. Soft, structured, and absolutely stunning. I receive compliments every single day.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&auto=format",
    product: "Signature Tote — Mocha Brown",
  },
  {
    id: "t2",
    name: "Ananya Verma",
    location: "Delhi",
    rating: 5,
    text: "The unboxing alone felt like a luxury experience. My Ivory White tote is even more beautiful in person — it pairs with everything and feels genuinely high-end in a way most brands fail to achieve.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&auto=format",
    product: "Signature Tote — Ivory White",
  },
  {
    id: "t3",
    name: "Kavya Nair",
    location: "Bangalore",
    rating: 5,
    text: "This is exactly the bag I had been searching for. Not too flashy, not too understated — perfect quiet luxury. The hardware feels weighty and premium. VELLA truly understands modern women.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&auto=format",
    product: "Signature Tote — Midnight Black",
  },
];

const ORDERS: Order[] = [
  { id: "#VL-0091", customer: "Priya Sharma", product: "Signature Tote — Mocha Brown", amount: 34500, status: "delivered", date: "2024-12-14" },
  { id: "#VL-0090", customer: "Ananya Verma", product: "Signature Tote — Ivory White", amount: 34500, status: "shipped", date: "2024-12-13" },
  { id: "#VL-0089", customer: "Kavya Nair", product: "Signature Tote — Midnight Black", amount: 34500, status: "processing", date: "2024-12-13" },
  { id: "#VL-0088", customer: "Riya Patel", product: "Signature Tote — Blush Pink", amount: 34500, status: "pending", date: "2024-12-12" },
  { id: "#VL-0087", customer: "Meera Iyer", product: "Signature Tote — Mocha Brown", amount: 34500, status: "delivered", date: "2024-12-10" },
  { id: "#VL-0086", customer: "Shreya Kapoor", product: "Signature Tote — Ivory White", amount: 34500, status: "delivered", date: "2024-12-09" },
];

const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Priya Sharma", email: "priya@email.com", orders: 3, totalSpent: 103500, tier: "vip" },
  { id: "c2", name: "Ananya Verma", email: "ananya@email.com", orders: 2, totalSpent: 69000, tier: "gold" },
  { id: "c3", name: "Kavya Nair", email: "kavya@email.com", orders: 1, totalSpent: 34500, tier: "standard" },
  { id: "c4", name: "Riya Patel", email: "riya@email.com", orders: 1, totalSpent: 34500, tier: "standard" },
  { id: "c5", name: "Meera Iyer", email: "meera@email.com", orders: 2, totalSpent: 69000, tier: "gold" },
  { id: "c6", name: "Shreya Kapoor", email: "shreya@email.com", orders: 2, totalSpent: 69000, tier: "gold" },
];

const COMING_SOON_CATEGORIES = [
  {
    name: "Timepieces",
    label: "Watches",
    Icon: Watch,
    image: "https://images.unsplash.com/photo-1768123969966-64d79a5c33ca?w=400&h=500&fit=crop&auto=format",
  },
  {
    name: "Fine Jewelry",
    label: "Jewelry",
    Icon: Gem,
    image: "https://images.unsplash.com/photo-1591352254932-6d56d9fe295b?w=400&h=500&fit=crop&auto=format",
  },
  {
    name: "Leather Goods",
    label: "Accessories",
    Icon: Tag,
    image: "https://images.unsplash.com/photo-1628483211662-9bcc692c46dc?w=400&h=500&fit=crop&auto=format",
  },
  {
    name: "Womenswear",
    label: "Fashion",
    Icon: Sparkles,
    image: "https://images.unsplash.com/photo-1779405949264-a44d50a14315?w=400&h=500&fit=crop&auto=format",
  },
];

const INSTAGRAM_PHOTOS = [
  "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1571829604981-ea159f94e5ad?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1591348278900-019a8a2a8b1d?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1573227896778-8f378c4029d4?w=400&h=400&fit=crop&auto=format",
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const F = { display: "'Playfair Display', Georgia, serif" as const };
const R = { fontFamily: "'Raleway', system-ui, sans-serif" as const };
const D = { fontFamily: "'DM Sans', system-ui, sans-serif" as const };

const STATUS_STYLE: Record<Order["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};

const TIER_STYLE: Record<Customer["tier"], string> = {
  standard: "bg-stone-100 text-stone-600",
  gold: "bg-amber-50 text-amber-700",
  vip: "bg-purple-50 text-purple-700",
};

// ─── ANIMATION HELPERS ────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9A96E] mb-4" style={R}>
      {children}
    </p>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar({
  cartCount,
  onCartOpen,
  onMobileMenu,
}: {
  cartCount: number;
  onCartOpen: () => void;
  onMobileMenu: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = scrolled ? "text-[#1A1714]" : "text-white";
  const hoverColor = "hover:text-[#C9A96E]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#FAF8F4]/96 backdrop-blur-md shadow-[0_1px_0_rgba(26,23,20,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-16 md:h-20">
        {/* Desktop Left Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {["Collections", "Handbags", "About", "Journal"].map((item) => (
            <a
              key={item}
              href="#"
              className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${textColor} ${hoverColor}`}
              style={R}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Logo */}
        <a
          href="#"
          className={`text-2xl md:text-[28px] tracking-[0.4em] font-normal transition-colors duration-300 ${textColor}`}
          style={F}
        >
          VELLA
        </a>

        {/* Right Icons */}
        <div className="flex items-center gap-5">
          <button className={`hidden md:block transition-colors duration-300 ${textColor} ${hoverColor}`}>
            <Search size={17} strokeWidth={1.5} />
          </button>
          <button className={`hidden md:block transition-colors duration-300 ${textColor} ${hoverColor}`}>
            <Heart size={17} strokeWidth={1.5} />
          </button>
          <button
            onClick={onCartOpen}
            className={`relative transition-colors duration-300 ${textColor} ${hoverColor}`}
          >
            <ShoppingBag size={17} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C9A96E] text-white text-[9px] rounded-full flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={onMobileMenu}
            className={`md:hidden transition-colors duration-300 ${textColor}`}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── MOBILE MENU ──────────────────────────────────────────────────────────────

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 h-full w-4/5 max-w-xs bg-[#1A1714] z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/8">
              <span className="text-2xl tracking-[0.3em] text-white" style={F}>VELLA</span>
              <button onClick={onClose} className="text-white/60 hover:text-[#C9A96E] transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col px-8 pt-10 gap-7">
              {["Collections", "Handbags", "About", "Journal"].map((item) => (
                <a
                  key={item}
                  href="#"
                  onClick={onClose}
                  className="text-white text-sm tracking-[0.22em] uppercase hover:text-[#C9A96E] transition-colors"
                  style={R}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-auto px-8 pb-10 border-t border-white/8 pt-8 flex items-center gap-5">
              <Search size={17} strokeWidth={1.5} className="text-white/40" />
              <Heart size={17} strokeWidth={1.5} className="text-white/40" />
              <ShoppingBag size={17} strokeWidth={1.5} className="text-white/40" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────

function CartDrawer({
  open,
  onClose,
  items,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#FAF8F4] z-[70] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-black/8">
              <h2 className="text-sm tracking-[0.2em] uppercase text-[#1A1714]" style={R}>
                Your Bag{" "}
                <span className="text-[#8C7E6E]">({items.length})</span>
              </h2>
              <button onClick={onClose} className="text-[#1A1714] hover:text-[#C9A96E] transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                  <ShoppingBag size={40} strokeWidth={1} className="text-[#C9A96E]" />
                  <div>
                    <p className="text-sm text-[#1A1714] mb-1" style={F}>Your bag is empty</p>
                    <p className="text-xs text-[#8C7E6E]" style={D}>Add something beautiful</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 text-[10px] tracking-[0.25em] uppercase border border-[#1A1714] px-7 py-3.5 hover:bg-[#1A1714] hover:text-white transition-all duration-300"
                    style={R}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                      <div className="w-20 h-24 bg-[#EDE6DA] overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.color} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <p className="text-sm text-[#1A1714]" style={F}>{item.name}</p>
                          <p className="text-xs text-[#8C7E6E] mt-0.5" style={D}>{item.color}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-[#1A1714]" style={R}>{fmtPrice(item.price)}</p>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="text-[#C0B5A8] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-8 py-6 border-t border-black/8 space-y-3">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#8C7E6E]" style={R}>Subtotal</span>
                  <span className="text-xl text-[#1A1714]" style={F}>
                    {fmtPrice(items.reduce((s, p) => s + p.price, 0))}
                  </span>
                </div>
                <button className="w-full bg-[#1A1714] text-[#FAF8F4] py-4 text-[10px] tracking-[0.3em] uppercase hover:bg-[#C9A96E] transition-all duration-400" style={R}>
                  Proceed to Checkout
                </button>
                <button
                  onClick={onClose}
                  className="w-full border border-[#1A1714]/25 py-3.5 text-[10px] tracking-[0.22em] uppercase hover:bg-[#1A1714] hover:text-white transition-all duration-300"
                  style={R}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── QUICK VIEW MODAL ────────────────────────────────────────────────────────

function QuickView({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/65 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F4] w-full max-w-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] shadow-2xl"
      >
        {/* Image */}
        <div className="w-full md:w-[45%] bg-[#EDE6DA] overflow-hidden aspect-[3/4] md:aspect-auto">
          <img
            src={product.image}
            alt={`VELLA ${product.name} in ${product.color}`}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Content */}
        <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#8C7E6E] hover:text-[#1A1714] transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          <Label>Signature Collection</Label>
          <h3 className="text-2xl md:text-3xl mb-1 text-[#1A1714]" style={F}>{product.name}</h3>
          <p className="text-sm text-[#8C7E6E] mb-5" style={D}>{product.color}</p>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 rounded-full ring-1 ring-black/15 shadow-sm" style={{ backgroundColor: product.colorHex }} />
            <span className="text-xs text-[#8C7E6E]" style={D}>{product.color}</span>
          </div>

          <p className="text-2xl text-[#1A1714] mb-6" style={F}>{fmtPrice(product.price)}</p>

          <p className="text-sm text-[#8C7E6E] leading-relaxed mb-2" style={{ ...D, fontWeight: 300 }}>
            Handcrafted from the finest full-grain leather, The Signature Tote is designed for women who move with intention. Spacious, structured, and endlessly refined.
          </p>

          <ul className="mt-4 space-y-2 mb-8">
            {["Full-grain leather", "Gold-toned hardware", "Suede-lined interior", "Dust bag included"].map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-xs text-[#8C7E6E]" style={D}>
                <Check size={11} strokeWidth={2.5} className="text-[#C9A96E]" />
                {feat}
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-3">
            <button
              onClick={handleAdd}
              className={`w-full py-4 text-[10px] tracking-[0.3em] uppercase transition-all duration-400 ${added ? "bg-[#C9A96E] text-white" : "bg-[#1A1714] text-[#FAF8F4] hover:bg-[#C9A96E]"}`}
              style={R}
            >
              {added ? "Added to Bag ✓" : "Add to Bag"}
            </button>
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className={`w-full border py-3.5 text-[10px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 transition-all duration-300 ${wishlisted ? "border-[#C9A96E] text-[#C9A96E]" : "border-[#1A1714]/25 text-[#1A1714] hover:border-[#1A1714] hover:bg-[#1A1714] hover:text-white"}`}
              style={R}
            >
              <Heart size={13} strokeWidth={1.5} className={wishlisted ? "fill-[#C9A96E]" : ""} />
              {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onQuickView,
  onAddToCart,
}: {
  product: Product;
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#EDE6DA] aspect-[3/4]">
        <img
          src={product.image}
          alt={`VELLA ${product.name} — ${product.color}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3.5 left-3.5">
            <span className="text-[9px] tracking-[0.2em] uppercase bg-[#C9A96E] text-white px-3 py-1 font-medium" style={R}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-3.5 right-3.5 w-9 h-9 bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-sm"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={wishlisted ? "fill-[#C9A96E] text-[#C9A96E]" : "text-[#1A1714]"}
          />
        </button>

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-[#1A1714]/82 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="text-[9px] tracking-[0.28em] uppercase text-white border border-white/60 px-6 py-3 hover:bg-white hover:text-[#1A1714] transition-all duration-300"
            style={R}
          >
            Quick View
          </button>
          <button
            onClick={handleAdd}
            className={`text-[9px] tracking-[0.28em] uppercase border px-6 py-3 transition-all duration-300 ${justAdded ? "bg-[#C9A96E] border-[#C9A96E] text-white" : "border-[#C9A96E]/70 text-[#C9A96E] hover:bg-[#C9A96E] hover:text-white"}`}
            style={R}
          >
            {justAdded ? "Added ✓" : "Add to Bag"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm text-[#1A1714] leading-snug" style={F}>{product.name}</p>
            <p className="text-xs text-[#8C7E6E] mt-0.5 tracking-wide" style={D}>{product.color}</p>
          </div>
          <div
            className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 flex-shrink-0 mt-1"
            style={{ backgroundColor: product.colorHex }}
          />
        </div>
        <p className="text-sm mt-2.5 text-[#1A1714] tracking-wide" style={R}>{fmtPrice(product.price)}</p>
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function HeroSection({ onDiscover }: { onDiscover: () => void }) {
  return (
    <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1779398968962-b3ad149b57b6?w=1920&h=1080&fit=crop&auto=format"
          alt="VELLA luxury fashion campaign — two elegant women in black"
          className="w-full h-full object-cover scale-105"
          style={{ animation: "heroZoom 12s ease-out forwards" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="text-[9px] tracking-[0.55em] uppercase text-[#C9A96E] mb-7"
          style={R}
        >
          The Signature Collection — 2024
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(3rem,8vw,6rem)] text-white font-normal leading-[1.05] mb-7"
          style={F}
        >
          Crafted To Be
          <br />
          <em>Desired.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="text-white/70 text-sm md:text-[15px] tracking-wider mb-12 max-w-md mx-auto leading-[1.8]"
          style={{ ...D, fontWeight: 300 }}
        >
          Timeless handbags designed for women who appreciate elegance.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0 }}
          onClick={onDiscover}
          className="group inline-flex items-center gap-3.5 border border-white/80 text-white text-[10px] tracking-[0.32em] uppercase px-9 py-4 hover:bg-white hover:text-[#1A1714] transition-all duration-400"
          style={R}
        >
          Discover The Collection
          <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300" />
        </motion.button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <motion.div
          animate={{ scaleY: [0, 1, 0], y: [0, 8, 16] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px h-10 bg-white/40 origin-top"
        />
        <p className="text-white/30 text-[8px] tracking-[0.4em] uppercase" style={R}>Scroll</p>
      </motion.div>

      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1.05); }
          to   { transform: scale(1); }
        }
      `}</style>
    </section>
  );
}

// ─── COLLECTION SECTION ───────────────────────────────────────────────────────

function CollectionSection({
  onQuickView,
  onAddToCart,
}: {
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <section id="collection" className="py-24 md:py-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <FadeIn className="text-center mb-16">
        <Label>Signature Collection</Label>
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] text-[#1A1714]" style={F}>The Signature Tote</h2>
        <p className="mt-5 text-[#8C7E6E] text-sm max-w-sm mx-auto leading-[1.85]" style={{ ...D, fontWeight: 300 }}>
          One iconic silhouette. Four expressions of quiet luxury. Each handcrafted from full-grain leather.
        </p>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-7">
        {PRODUCTS.map((product, i) => (
          <FadeIn key={product.id} delay={i * 0.1}>
            <ProductCard product={product} onQuickView={onQuickView} onAddToCart={onAddToCart} />
          </FadeIn>
        ))}
      </div>

      <FadeIn className="text-center mt-16" delay={0.2}>
        <button
          className="group text-[10px] tracking-[0.3em] uppercase border border-[#1A1714] px-10 py-4 hover:bg-[#1A1714] hover:text-white transition-all duration-400 inline-flex items-center gap-3"
          style={R}
        >
          View Full Collection
          <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300" />
        </button>
      </FadeIn>
    </section>
  );
}

// ─── BRAND STORY ─────────────────────────────────────────────────────────────

function BrandStorySection() {
  return (
    <section className="py-24 md:py-32 bg-[#1A1714] text-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <FadeIn>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden bg-[#2A2420]">
                <img
                  src="https://images.unsplash.com/photo-1779405949264-a44d50a14315?w=800&h=1000&fit=crop&auto=format"
                  alt="VELLA brand story — editorial fashion portrait"
                  className="w-full h-full object-cover opacity-85 hover:opacity-95 transition-opacity duration-700"
                />
              </div>
              <div className="absolute -bottom-5 -right-5 w-28 h-28 border border-[#C9A96E]/30 hidden md:block" />
              <div className="absolute -top-4 -left-4 w-16 h-16 border border-[#C9A96E]/20 hidden md:block" />
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Label>Our Story</Label>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-normal leading-[1.1] mb-8 text-white" style={F}>
              The Beginning<br />
              <em>of VELLA</em>
            </h2>
            <div className="space-y-5 text-white/60 leading-[1.9]" style={{ ...D, fontWeight: 300, fontSize: "0.9rem" }}>
              <p>
                VELLA was born from a singular belief: that luxury should not be a privilege reserved for the few, but an experience accessible to any woman who values true quality.
              </p>
              <p>
                We set out to create something different — handbags that carry the DNA of the world's finest fashion houses, without the barriers that have long defined the industry.
              </p>
              <p>
                Every stitch, every piece of hardware, every fold of leather is a deliberate act of craft. VELLA is not just a bag. It is a statement of who you are.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-10">
              {[
                { stat: "2024", label: "Founded" },
                { stat: "100%", label: "Full-Grain Leather" },
                { stat: "India", label: "Crafted Here" },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-10">
                  <div className="text-center">
                    <p className="text-2xl font-normal text-[#C9A96E]" style={F}>{s.stat}</p>
                    <p className="text-[9px] tracking-[0.22em] uppercase text-white/35 mt-1.5" style={R}>{s.label}</p>
                  </div>
                  {i < 2 && <div className="w-px h-10 bg-white/10" />}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── CRAFTSMANSHIP ────────────────────────────────────────────────────────────

function CraftsmanshipSection() {
  const crafts = [
    {
      label: "Premium Leather",
      desc: "Full-grain leather selected for natural character and exceptional durability.",
      image: "https://images.unsplash.com/photo-1571829604981-ea159f94e5ad?w=600&h=700&fit=crop&auto=format",
    },
    {
      label: "Precision Stitching",
      desc: "Each seam hand-stitched with waxed thread by experienced artisans.",
      image: "https://images.unsplash.com/photo-1628483211662-9bcc692c46dc?w=600&h=700&fit=crop&auto=format",
    },
    {
      label: "Luxury Hardware",
      desc: "Gold-toned zinc alloy fittings, resistant to tarnish and built to endure.",
      image: "https://images.unsplash.com/photo-1573227896778-8f378c4029d4?w=600&h=700&fit=crop&auto=format",
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <FadeIn className="text-center mb-16">
        <Label>The Craft</Label>
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] text-[#1A1714]" style={F}>Precision In Every Detail</h2>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {crafts.map((c, i) => (
          <FadeIn key={c.label} delay={i * 0.12}>
            <div className="group relative overflow-hidden aspect-[4/5] bg-[#EDE6DA]">
              <img
                src={c.image}
                alt={`VELLA craftsmanship — ${c.label}`}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-75 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1714]/80 via-[#1A1714]/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-2.5" style={R}>{c.label}</p>
                <p className="text-white/80 text-sm leading-[1.7]" style={{ ...D, fontWeight: 300 }}>{c.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ─── MARQUEE BAR ─────────────────────────────────────────────────────────────

function MarqueeBar() {
  const items = ["Free Shipping Over ₹5,000", "Complimentary Dust Bag", "30-Day Returns", "Handcrafted In India", "Lifetime Leather Care"];
  return (
    <div className="bg-[#1A1714] py-3.5 overflow-hidden">
      <div className="flex" style={{ animation: "marquee 28s linear infinite" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-4 whitespace-nowrap text-[9px] tracking-[0.28em] uppercase text-white/55 px-8" style={R}>
            {item}
            <span className="text-[#C9A96E]">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── TESTIMONIALS + INSTAGRAM ────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 bg-[#F5EFE6]">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        <FadeIn className="text-center mb-16">
          <Label>Client Stories</Label>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] text-[#1A1714]" style={F}>Words From Our Women</h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.id} delay={i * 0.12}>
              <div className="bg-white p-8 md:p-10 flex flex-col h-full">
                <div className="flex gap-1 mb-7">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={11} className="fill-[#C9A96E] text-[#C9A96E]" />
                  ))}
                </div>
                <blockquote
                  className="flex-1 text-[#1A1714] text-sm leading-[1.9] mb-8"
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                >
                  "{t.text}"
                </blockquote>
                <div className="flex items-center gap-4 pt-6 border-t border-black/6">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#EDE6DA] flex-shrink-0 ring-1 ring-[#C9A96E]/20">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1A1714] tracking-wide" style={R}>{t.name}</p>
                    <p className="text-[11px] text-[#8C7E6E] mt-0.5" style={D}>{t.location} · {t.product}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Instagram Gallery */}
        <FadeIn className="mt-20" delay={0.2}>
          <div className="text-center mb-8">
            <Label>@vella.official</Label>
            <h3 className="text-2xl text-[#1A1714]" style={F}>Join the Community</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
            {INSTAGRAM_PHOTOS.map((url, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-[#EDE6DA] cursor-pointer group">
                <img
                  src={url}
                  alt={`VELLA community — style inspiration ${i + 1}`}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-90"
                />
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── COMING SOON ──────────────────────────────────────────────────────────────

function ComingSoonSection() {
  return (
    <section className="py-24 md:py-32 bg-[#1A1714] text-white">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        <FadeIn className="text-center mb-16">
          <Label>The VELLA Universe</Label>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] text-white" style={F}>Coming Soon</h2>
          <p className="mt-5 text-white/45 text-sm max-w-xs mx-auto leading-[1.8]" style={{ ...D, fontWeight: 300 }}>
            New categories, new expressions. The VELLA world is expanding.
          </p>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {COMING_SOON_CATEGORIES.map((cat, i) => (
            <FadeIn key={cat.name} delay={i * 0.1}>
              <div className="group relative overflow-hidden bg-[#2A2420] aspect-[3/4] cursor-pointer">
                <img
                  src={cat.image}
                  alt={`VELLA ${cat.name} — coming soon`}
                  className="w-full h-full object-cover opacity-45 group-hover:opacity-65 transition-all duration-700 group-hover:scale-107"
                  style={{ transform: "scale(1.0)", transition: "opacity 0.7s, transform 0.7s" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.07)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1.0)")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div className="absolute top-5 left-0 right-0 flex justify-center">
                  <div className="border border-[#C9A96E]/60 px-4 py-1.5">
                    <span className="text-[8px] tracking-[0.32em] uppercase text-[#C9A96E]" style={R}>
                      Launching Soon
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] mb-1.5" style={R}>{cat.label}</p>
                  <p className="text-base text-white leading-snug" style={F}>{cat.name}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRIVATE CLUB ────────────────────────────────────────────────────────────

function PrivateClubSection() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const benefits = [
    { Icon: Clock, label: "Early Access", desc: "Shop new releases 48 hours before anyone else." },
    { Icon: Crown, label: "Limited Releases", desc: "Exclusive access to limited-edition pieces and colorways." },
    { Icon: Tag, label: "VIP Pricing", desc: "Members-only pricing on select collections." },
    { Icon: Sparkles, label: "Private Events", desc: "Invitations to VELLA launch previews and private exhibitions." },
  ];

  return (
    <section className="py-28 md:py-36 bg-[#FAF8F4] relative overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-[#C9A96E]/8 pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full border border-[#C9A96E]/8 pointer-events-none" />

      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto relative">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#C9A96E]" />
              <span className="text-[9px] tracking-[0.45em] uppercase text-[#C9A96E]" style={R}>Members Only</span>
              <div className="h-px w-8 bg-[#C9A96E]" />
            </div>
            <h2 className="text-[clamp(2.25rem,5vw,4.5rem)] text-[#1A1714] leading-[1.05] mb-6" style={F}>
              VELLA Private Club
            </h2>
            <p className="text-[#8C7E6E] text-sm md:text-base leading-[1.9] max-w-lg mx-auto mb-14" style={{ ...D, fontWeight: 300 }}>
              A membership crafted for women who live with intention, elegance, and quiet power. More than access — a way of being.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14 text-left max-w-2xl mx-auto">
              {benefits.map((b) => (
                <div key={b.label} className="flex gap-5 p-6 bg-white border border-black/6 hover:border-[#C9A96E]/30 transition-colors duration-300">
                  <div className="w-10 h-10 border border-[#C9A96E]/35 flex items-center justify-center flex-shrink-0">
                    <b.Icon size={15} strokeWidth={1.5} className="text-[#C9A96E]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1A1714] mb-1.5 tracking-wide" style={R}>{b.label}</p>
                    <p className="text-xs text-[#8C7E6E] leading-[1.7]" style={D}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            {joined ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-14 h-14 bg-[#C9A96E] flex items-center justify-center"
                >
                  <Check size={22} strokeWidth={2} className="text-white" />
                </motion.div>
                <p className="text-xl text-[#1A1714]" style={F}>Welcome to VELLA Private Club</p>
                <p className="text-xs text-[#8C7E6E] tracking-wide" style={D}>Your invitation details will arrive shortly.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && email && setJoined(true)}
                  placeholder="Your email address"
                  className="flex-1 border border-[#1A1714]/18 bg-white px-5 py-4 text-sm text-[#1A1714] placeholder-[#C0B5A8] outline-none focus:border-[#C9A96E] transition-colors"
                  style={D}
                />
                <button
                  onClick={() => email && setJoined(true)}
                  className="bg-[#1A1714] text-white text-[10px] tracking-[0.28em] uppercase px-8 py-4 hover:bg-[#C9A96E] transition-all duration-350 whitespace-nowrap"
                  style={R}
                >
                  Request Access
                </button>
              </div>
            )}
            <p className="text-[10px] text-[#C0B5A8] mt-4 tracking-wide" style={D}>
              No spam. You may unsubscribe at any time.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="py-20 bg-[#EDE6DA]">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl text-[#1A1714]" style={F}>The VELLA Edit</h3>
              <p className="text-[#8C7E6E] text-sm mt-2" style={{ ...D, fontWeight: 300 }}>
                Curated stories, styling notes, and early access. No noise.
              </p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2.5 text-[#C9A96E]">
                <Check size={16} strokeWidth={2.5} />
                <span className="text-sm tracking-wide" style={R}>Thank you for subscribing.</span>
              </div>
            ) : (
              <div className="flex gap-2.5 w-full md:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && email && setSubscribed(true)}
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 border border-[#1A1714]/18 bg-white px-5 py-3.5 text-sm text-[#1A1714] placeholder-[#C0B5A8] outline-none focus:border-[#C9A96E] transition-colors"
                  style={D}
                />
                <button
                  onClick={() => email && setSubscribed(true)}
                  className="bg-[#1A1714] text-white text-[10px] tracking-[0.22em] uppercase px-6 py-3.5 hover:bg-[#C9A96E] transition-all duration-350 whitespace-nowrap"
                  style={R}
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer({ onAdminAccess }: { onAdminAccess: () => void }) {
  return (
    <footer className="bg-[#120F0C] text-white/50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <p className="text-white text-[28px] tracking-[0.35em] mb-5 font-normal" style={F}>VELLA</p>
            <p className="text-sm leading-[1.85] mb-6" style={{ ...D, fontWeight: 300 }}>
              Luxury women's accessories crafted with intention. Born in Mumbai.
            </p>
            <div className="flex items-center gap-2 text-xs mb-3">
              <Mail size={11} strokeWidth={1.5} />
              <span style={D}>hello@vella.in</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin size={11} strokeWidth={1.5} />
              <span style={D}>Mumbai, Maharashtra, India</span>
            </div>
          </div>

          {[
            { heading: "Shop", links: ["Handbags", "New Arrivals", "Bestsellers", "Gift Cards"] },
            { heading: "Help", links: ["Size Guide", "Care Instructions", "Returns & Exchanges", "FAQs"] },
            { heading: "VELLA", links: ["About Us", "Journal", "Careers", "Press & Media"] },
          ].map((col) => (
            <div key={col.heading}>
              <p className="text-white text-[10px] tracking-[0.28em] uppercase mb-6" style={R}>{col.heading}</p>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs hover:text-[#C9A96E] transition-colors duration-300" style={D}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p style={D}>© 2024 VELLA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#C9A96E] transition-colors" style={D}>Privacy Policy</a>
            <a href="#" className="hover:text-[#C9A96E] transition-colors" style={D}>Terms of Service</a>
            {/* Hidden admin access */}
            <button
              onClick={onAdminAccess}
              className="text-white/5 hover:text-white/15 transition-colors text-xs select-none"
              style={D}
              title=""
            >
              ···
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [section, setSection] = useState<AdminSection>("overview");
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [customers] = useState<Customer[]>(CUSTOMERS);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "", colorHex: "#C9A96E", price: "", image: "", badge: "" });

  const navItems: { id: AdminSection; label: string; Icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", Icon: BarChart2 },
    { id: "products", label: "Products", Icon: Package },
    { id: "orders", label: "Orders", Icon: ShoppingCart },
    { id: "customers", label: "Customers", Icon: Users },
    { id: "banners", label: "Banners", Icon: Image },
    { id: "collections", label: "Collections", Icon: Layers },
    { id: "testimonials", label: "Testimonials", Icon: Award },
    { id: "offers", label: "Offers", Icon: Tag },
    { id: "coming-soon", label: "Coming Soon", Icon: Clock },
  ];

  const revenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.amount, 0);

  const openAddProduct = () => {
    setEditingProduct(null);
    setFormData({ name: "", color: "", colorHex: "#C9A96E", price: "", image: "", badge: "" });
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormData({ name: p.name, color: p.color, colorHex: p.colorHex, price: String(p.price), image: p.image, badge: p.badge || "" });
    setShowProductModal(true);
  };

  const saveProduct = () => {
    if (!formData.name || !formData.color || !formData.price) return;
    const updated: Product = {
      id: editingProduct?.id || `vl-${Date.now()}`,
      name: formData.name,
      color: formData.color,
      colorHex: formData.colorHex,
      price: parseInt(formData.price) || 0,
      image: formData.image || PRODUCTS[0].image,
      badge: formData.badge || undefined,
      inStock: true,
    };
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      setProducts((prev) => [...prev, updated]);
    }
    setShowProductModal(false);
  };

  const deleteProduct = (id: string) => {
    if (window.confirm("Delete this product?")) setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const SimpleMgmtView = ({ title, Icon: IconComp }: { title: string; Icon: React.ElementType }) => (
    <div className="bg-white border border-black/6 p-16 text-center">
      <div className="w-16 h-16 border border-[#C9A96E]/30 flex items-center justify-center mx-auto mb-5">
        <IconComp size={24} strokeWidth={1} className="text-[#C9A96E]" />
      </div>
      <h3 className="text-xl text-[#1A1714] mb-2" style={F}>Manage {title}</h3>
      <p className="text-sm text-[#8C7E6E] mb-8 max-w-xs mx-auto" style={D}>
        This module is ready to connect to your CMS or backend.
      </p>
      <button
        className="inline-flex items-center gap-2 bg-[#1A1714] text-white text-[10px] px-6 py-3 hover:bg-[#C9A96E] transition-colors"
        style={{ ...R, letterSpacing: "0.08em" }}
      >
        <Plus size={12} strokeWidth={2} />
        Add New Entry
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8F7F5] overflow-hidden" style={D}>
      {/* Sidebar */}
      <aside className="w-56 bg-[#1A1714] flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="px-5 py-5 border-b border-white/8">
          <p className="text-white text-xl tracking-[0.25em]" style={F}>VELLA</p>
          <p className="text-white/25 text-[9px] tracking-[0.25em] uppercase mt-1" style={R}>Admin Panel</p>
        </div>
        <nav className="flex-1 py-3 px-2.5">
          {navItems.map(({ id, label, Icon: NavIcon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] mb-0.5 transition-all duration-200 text-left rounded-sm
                ${section === id ? "bg-[#C9A96E] text-white" : "text-white/45 hover:text-white/80 hover:bg-white/5"}`}
              style={{ ...R, letterSpacing: "0.05em" }}
            >
              <NavIcon size={13} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/8">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-white/35 hover:text-white text-[11px] transition-colors"
            style={R}
          >
            <LogOut size={13} strokeWidth={1.5} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-black/6 px-7 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <p className="text-sm font-medium text-[#1A1714] capitalize" style={R}>
            {navItems.find((n) => n.id === section)?.label}
          </p>
          <div className="flex items-center gap-4">
            <button className="text-[#8C7E6E] hover:text-[#1A1714] transition-colors">
              <Bell size={15} strokeWidth={1.5} />
            </button>
            <div className="w-7 h-7 bg-[#C9A96E] flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold" style={R}>VL</span>
            </div>
          </div>
        </div>

        <div className="p-7 flex-1">
          {/* OVERVIEW */}
          {section === "overview" && (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
                {[
                  { label: "Total Revenue", value: fmtPrice(revenue), Icon: TrendingUp, change: "+12% this month", color: "text-emerald-600" },
                  { label: "Total Orders", value: String(orders.length), Icon: ShoppingCart, change: "+8% this month", color: "text-emerald-600" },
                  { label: "Active Products", value: String(products.length), Icon: Package, change: "", color: "" },
                  { label: "Total Customers", value: String(customers.length), Icon: Users, change: "+23% this month", color: "text-emerald-600" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-5 border border-black/6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] text-[#8C7E6E] uppercase tracking-wide" style={R}>{stat.label}</p>
                      <stat.Icon size={14} className="text-[#C9A96E]" strokeWidth={1.5} />
                    </div>
                    <p className="text-2xl text-[#1A1714]" style={F}>{stat.value}</p>
                    {stat.change && <p className={`text-[10px] mt-1 ${stat.color}`} style={D}>{stat.change}</p>}
                  </div>
                ))}
              </div>

              <div className="bg-white border border-black/6">
                <div className="px-6 py-4 border-b border-black/6 flex items-center justify-between">
                  <p className="text-sm font-medium text-[#1A1714]" style={R}>Recent Orders</p>
                  <button onClick={() => setSection("orders")} className="text-xs text-[#C9A96E] hover:underline" style={D}>View all →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-black/5">
                        {["Order", "Customer", "Product", "Amount", "Status", "Date"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[#8C7E6E] font-medium uppercase text-[9px] tracking-wider" style={R}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="border-b border-black/4 hover:bg-[#FAF8F4] transition-colors">
                          <td className="px-5 py-3.5 font-mono text-[11px] text-[#1A1714]">{o.id}</td>
                          <td className="px-5 py-3.5 text-[#1A1714]" style={D}>{o.customer}</td>
                          <td className="px-5 py-3.5 text-[#8C7E6E]" style={D}>{o.product}</td>
                          <td className="px-5 py-3.5 text-[#1A1714]" style={D}>{fmtPrice(o.amount)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[9px] px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[o.status]}`} style={R}>{o.status}</span>
                          </td>
                          <td className="px-5 py-3.5 text-[#8C7E6E]" style={D}>{o.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* PRODUCTS */}
          {section === "products" && (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-[#8C7E6E]" style={D}>{products.length} products</p>
                <button
                  onClick={openAddProduct}
                  className="flex items-center gap-2 bg-[#1A1714] text-white text-[10px] px-5 py-2.5 hover:bg-[#C9A96E] transition-colors"
                  style={{ ...R, letterSpacing: "0.07em" }}
                >
                  <Plus size={12} strokeWidth={2.5} />
                  Add Product
                </button>
              </div>
              <div className="bg-white border border-black/6 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-black/5">
                      {["Product", "Color", "Price", "Stock", "Badge", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[#8C7E6E] font-medium uppercase text-[9px] tracking-wider" style={R}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-black/4 hover:bg-[#FAF8F4] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 bg-[#EDE6DA] overflow-hidden flex-shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-[#1A1714]" style={D}>{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: p.colorHex }} />
                            <span className="text-[#8C7E6E]" style={D}>{p.color}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#1A1714]" style={D}>{fmtPrice(p.price)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[9px] px-2.5 py-1 rounded-full ${p.inStock ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`} style={R}>
                            {p.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#8C7E6E]" style={D}>{p.badge || "—"}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button onClick={() => openEditProduct(p)} className="text-[#8C7E6E] hover:text-[#C9A96E] transition-colors"><Edit size={13} strokeWidth={1.5} /></button>
                            <button onClick={() => deleteProduct(p.id)} className="text-[#8C7E6E] hover:text-red-500 transition-colors"><Trash2 size={13} strokeWidth={1.5} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Product Modal */}
              <AnimatePresence>
                {showProductModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowProductModal(false)}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.96, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white w-full max-w-md shadow-2xl"
                    >
                      <div className="flex items-center justify-between px-7 py-5 border-b border-black/8">
                        <h3 className="text-base text-[#1A1714]" style={F}>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                        <button onClick={() => setShowProductModal(false)} className="text-[#8C7E6E] hover:text-[#1A1714]"><X size={16} strokeWidth={1.5} /></button>
                      </div>
                      <div className="p-7 space-y-4">
                        {[
                          { key: "name", label: "Product Name", placeholder: "e.g. The Signature Tote" },
                          { key: "color", label: "Color Name", placeholder: "e.g. Mocha Brown" },
                          { key: "price", label: "Price (INR)", placeholder: "e.g. 34500" },
                          { key: "image", label: "Image URL", placeholder: "https://..." },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="block text-[9px] tracking-[0.18em] uppercase text-[#8C7E6E] mb-1.5" style={R}>{field.label}</label>
                            <input
                              type="text"
                              value={formData[field.key as keyof typeof formData]}
                              onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              className="w-full border border-black/12 px-4 py-2.5 text-sm text-[#1A1714] placeholder-[#C0B5A8] outline-none focus:border-[#C9A96E] transition-colors bg-white"
                              style={D}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-[9px] tracking-[0.18em] uppercase text-[#8C7E6E] mb-1.5" style={R}>Color Swatch</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={formData.colorHex}
                              onChange={(e) => setFormData((prev) => ({ ...prev, colorHex: e.target.value }))}
                              className="w-10 h-10 border border-black/12 cursor-pointer bg-white p-0.5"
                            />
                            <span className="text-xs text-[#8C7E6E]" style={D}>{formData.colorHex}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] tracking-[0.18em] uppercase text-[#8C7E6E] mb-1.5" style={R}>Badge (optional)</label>
                          <select
                            value={formData.badge}
                            onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                            className="w-full border border-black/12 px-4 py-2.5 text-sm text-[#1A1714] outline-none focus:border-[#C9A96E] transition-colors bg-white"
                            style={D}
                          >
                            <option value="">No Badge</option>
                            <option value="New">New</option>
                            <option value="Bestseller">Bestseller</option>
                            <option value="Limited">Limited</option>
                            <option value="Sale">Sale</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 px-7 pb-7">
                        <button
                          onClick={saveProduct}
                          className="flex-1 bg-[#1A1714] text-white py-3.5 text-[10px] tracking-[0.22em] uppercase hover:bg-[#C9A96E] transition-all"
                          style={R}
                        >
                          {editingProduct ? "Save Changes" : "Add Product"}
                        </button>
                        <button
                          onClick={() => setShowProductModal(false)}
                          className="border border-black/15 px-6 py-3.5 text-xs hover:bg-[#1A1714] hover:text-white transition-all"
                          style={R}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ORDERS */}
          {section === "orders" && (
            <div className="bg-white border border-black/6 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black/5">
                    {["Order ID", "Customer", "Product", "Amount", "Status", "Date", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[#8C7E6E] font-medium uppercase text-[9px] tracking-wider" style={R}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-black/4 hover:bg-[#FAF8F4] transition-colors">
                      <td className="px-5 py-4 font-mono text-[11px] text-[#1A1714]">{o.id}</td>
                      <td className="px-5 py-4 text-[#1A1714]" style={D}>{o.customer}</td>
                      <td className="px-5 py-4 text-[#8C7E6E]" style={D}>{o.product}</td>
                      <td className="px-5 py-4 text-[#1A1714]" style={D}>{fmtPrice(o.amount)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as Order["status"])}
                          className={`text-[9px] px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_STYLE[o.status]}`}
                          style={R}
                        >
                          {(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => (
                            <option key={s} value={s} className="bg-white text-[#1A1714]">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-[#8C7E6E]" style={D}>{o.date}</td>
                      <td className="px-5 py-4">
                        <button className="text-[#8C7E6E] hover:text-[#1A1714] transition-colors"><Eye size={13} strokeWidth={1.5} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CUSTOMERS */}
          {section === "customers" && (
            <div className="bg-white border border-black/6 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black/5">
                    {["Customer", "Email", "Orders", "Total Spent", "Tier"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[#8C7E6E] font-medium uppercase text-[9px] tracking-wider" style={R}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-black/4 hover:bg-[#FAF8F4] transition-colors">
                      <td className="px-5 py-4 font-medium text-[#1A1714]" style={D}>{c.name}</td>
                      <td className="px-5 py-4 text-[#8C7E6E]" style={D}>{c.email}</td>
                      <td className="px-5 py-4 text-[#1A1714]" style={D}>{c.orders}</td>
                      <td className="px-5 py-4 text-[#1A1714]" style={D}>{fmtPrice(c.totalSpent)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[9px] px-2.5 py-1 rounded-full capitalize ${TIER_STYLE[c.tier]}`} style={R}>{c.tier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section === "banners" && <SimpleMgmtView title="Banners" Icon={Image} />}
          {section === "collections" && <SimpleMgmtView title="Collections" Icon={Layers} />}
          {section === "testimonials" && <SimpleMgmtView title="Testimonials" Icon={Award} />}
          {section === "offers" && <SimpleMgmtView title="Offers" Icon={Tag} />}
          {section === "coming-soon" && <SimpleMgmtView title="Coming Soon" Icon={Clock} />}
        </div>
      </main>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const collectionRef = useRef<HTMLDivElement>(null);

  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => [...prev, product]);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((p) => p.id === productId);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  if (showAdmin) {
    return <AdminDashboard onExit={() => setShowAdmin(false)} />;
  }

  return (
    <>
      <Navbar
        cartCount={cartItems.length}
        onCartOpen={() => setCartOpen(true)}
        onMobileMenu={() => setMobileMenuOpen(true)}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onRemove={removeFromCart} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <AnimatePresence>
        {quickViewProduct && (
          <QuickView
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>

      <main>
        <HeroSection onDiscover={() => collectionRef.current?.scrollIntoView({ behavior: "smooth" })} />
        <MarqueeBar />
        <div ref={collectionRef}>
          <CollectionSection onQuickView={setQuickViewProduct} onAddToCart={addToCart} />
        </div>
        <BrandStorySection />
        <CraftsmanshipSection />
        <TestimonialsSection />
        <ComingSoonSection />
        <PrivateClubSection />
        <NewsletterSection />
      </main>

      <Footer onAdminAccess={() => setShowAdmin(true)} />
    </>
  );
}
