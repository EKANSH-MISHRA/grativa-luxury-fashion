import React, { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  ShoppingBag, Heart, Search, Menu, X, ArrowRight,
  Trash2, Gem, Watch, Tag, Sparkles, Clock, Check, Mail, MapPin
} from "lucide-react";
import { db, type Product, type Category, type HomepageContent } from "../utils/db";

export const fmtPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const F = { fontFamily: "'Playfair Display', Georgia, serif" as const };
export const R = { fontFamily: "'Raleway', system-ui, sans-serif" as const };
export const D = { fontFamily: "'DM Sans', system-ui, sans-serif" as const };

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

export function Navbar({
  categories,
  selectedCategory,
  onSelectCategory,
  cartCount,
  onCartOpen,
  onMobileMenu,
  onSearchToggle,
}: {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  cartCount: number;
  onCartOpen: () => void;
  onMobileMenu: () => void;
  onSearchToggle: () => void;
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
          <a
            href="#collection"
            onClick={() => onSelectCategory("All")}
            className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${textColor} ${hoverColor} ${selectedCategory === "All" ? "text-[#C9A96E]" : ""}`}
            style={R}
          >
            All
          </a>
          {categories.slice(0, 4).map(cat => (
            <a
              key={cat.id}
              href="#collection"
              onClick={() => onSelectCategory(cat.name)}
              className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${textColor} ${hoverColor} ${selectedCategory === cat.name ? "text-[#C9A96E]" : ""}`}
              style={R}
            >
              {cat.name}
            </a>
          ))}
          <a
            href="#brand-story"
            className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${textColor} ${hoverColor}`}
            style={R}
          >
            About
          </a>
          <Link
            to="/journal"
            className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${textColor} ${hoverColor}`}
            style={R}
          >
            Journal
          </Link>
        </nav>

        {/* Logo */}
        <Link
          to="/"
          className={`text-2xl md:text-[28px] tracking-[0.4em] font-normal transition-colors duration-300 ${textColor}`}
          style={F}
        >
          GRATIVA
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-5">
          <button onClick={onSearchToggle} className={`hidden md:block transition-colors duration-300 ${textColor} ${hoverColor}`}>
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

export function MobileMenu({
  open,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
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
              <span className="text-2xl tracking-[0.3em] text-white" style={F}>GRATIVA</span>
              <button onClick={onClose} className="text-white/60 hover:text-[#C9A96E] transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col px-8 pt-10 gap-7">
              <a
                href="#collection"
                onClick={() => { onSelectCategory("All"); onClose(); }}
                className="text-white text-sm tracking-[0.22em] uppercase hover:text-[#C9A96E] transition-colors"
                style={R}
              >
                All Collections
              </a>
              {categories.map(cat => (
                <a
                  key={cat.id}
                  href="#collection"
                  onClick={() => { onSelectCategory(cat.name); onClose(); }}
                  className="text-white text-sm tracking-[0.22em] uppercase hover:text-[#C9A96E] transition-colors"
                  style={R}
                >
                  {cat.name}
                </a>
              ))}
              <a
                href="#brand-story"
                onClick={onClose}
                className="text-white text-sm tracking-[0.22em] uppercase hover:text-[#C9A96E] transition-colors"
                style={R}
              >
                About
              </a>
              <Link
                to="/journal"
                onClick={onClose}
                className="text-white text-sm tracking-[0.22em] uppercase hover:text-[#C9A96E] transition-colors"
                style={R}
              >
                Journal
              </Link>
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

export function CartDrawer({
  open,
  onClose,
  items,
  onRemove,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
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
                        <img src={item.images[0] || ""} alt={item.color} className="w-full h-full object-cover" />
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
                <button
                  onClick={onCheckout}
                  className="w-full bg-[#1A1714] text-[#FAF8F4] py-4 text-[10px] tracking-[0.3em] uppercase hover:bg-[#C9A96E] transition-all duration-400"
                  style={R}
                >
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
            src={product.images[0] || ""}
            alt={`GRATIVA ${product.name} in ${product.color}`}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Content */}
        <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col relative overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#8C7E6E] hover:text-[#1A1714] transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          <Label>{product.category} Collection</Label>
          <h3 className="text-2xl md:text-3xl mb-1 text-[#1A1714]" style={F}>{product.name}</h3>
          <p className="text-xs text-[#8C7E6E] mb-4" style={D}>{product.color}</p>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full ring-1 ring-black/15 shadow-sm" style={{ backgroundColor: product.colorHex }} />
            <span className="text-xs text-[#8C7E6E]" style={D}>{product.color}</span>
            {product.inventory < 5 && product.inventory > 0 && (
              <span className="ml-auto text-[10px] text-amber-600 font-medium uppercase tracking-wider" style={R}>Only {product.inventory} left</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-2xl text-[#1A1714]" style={F}>{fmtPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-[#8C7E6E] line-through" style={D}>{fmtPrice(product.comparePrice)}</span>
            )}
          </div>

          <p className="text-xs text-[#8C7E6E] leading-relaxed mb-4" style={{ ...D, fontWeight: 300 }}>
            {product.description}
          </p>

          <ul className="space-y-1.5 mb-6">
            {["Designed in India", "Aspirational silhouette", "Suede-lined interior", "Dust bag included"].map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-[11px] text-[#8C7E6E]" style={D}>
                <Check size={11} strokeWidth={2.5} className="text-[#C9A96E]" />
                {feat}
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-2.5">
            <button
              onClick={handleAdd}
              disabled={product.inventory === 0}
              className={`w-full py-3.5 text-[10px] tracking-[0.3em] uppercase transition-all duration-400 ${
                product.inventory === 0 
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed" 
                  : added 
                    ? "bg-[#C9A96E] text-white" 
                    : "bg-[#1A1714] text-[#FAF8F4] hover:bg-[#C9A96E]"
              }`}
              style={R}
            >
              {product.inventory === 0 ? "Out of Stock" : added ? "Added to Bag ✓" : "Add to Bag"}
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
    if (product.inventory === 0) return;
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const badge = product.bestseller ? "Bestseller" : (product.comparePrice && product.comparePrice > product.price ? "Sale" : product.badge);

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#EDE6DA] aspect-[3/4]">
        <img
          src={product.images[0] || ""}
          alt={`GRATIVA ${product.name} — ${product.color}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badge */}
        {badge && (
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="text-[9px] tracking-[0.2em] uppercase bg-[#C9A96E] text-white px-3 py-1 font-medium" style={R}>
              {badge}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {product.inventory === 0 && (
          <div className="absolute inset-0 bg-[#FAF8F4]/80 flex items-center justify-center z-10">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#1A1714] font-medium border border-[#1A1714]/20 px-4 py-2" style={R}>
              Sold Out
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-3.5 right-3.5 w-9 h-9 bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-sm z-10"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={wishlisted ? "fill-[#C9A96E] text-[#C9A96E]" : "text-[#1A1714]"}
          />
        </button>

        {/* Hover Overlay */}
        {product.inventory > 0 && (
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
        )}
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
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-sm text-[#1A1714] tracking-wide" style={R}>{fmtPrice(product.price)}</p>
          {product.comparePrice && product.comparePrice > product.price && (
            <p className="text-xs text-[#8C7E6E] line-through tracking-wide" style={D}>{fmtPrice(product.comparePrice)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function HeroSection({ hero, onDiscover }: { hero: HomepageContent["hero"]; onDiscover: () => void }) {
  // Use first image if available, fallback to default
  const bgImage = hero.images[0] || "https://images.unsplash.com/photo-1779398968962-b3ad149b57b6?w=1920&h=1080&fit=crop&auto=format";

  return (
    <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="GRATIVA luxury fashion campaign"
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
          {hero.badge}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.5rem,7vw,5.5rem)] text-white font-normal leading-[1.1] mb-7 whitespace-pre-line"
          style={F}
        >
          {hero.headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="text-white/70 text-sm md:text-[15px] tracking-wider mb-12 max-w-md mx-auto leading-[1.8]"
          style={{ ...D, fontWeight: 300 }}
        >
          {hero.subheadline}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0 }}
          onClick={onDiscover}
          className="group inline-flex items-center gap-3.5 border border-white/80 text-white text-[10px] tracking-[0.32em] uppercase px-9 py-4 hover:bg-white hover:text-[#1A1714] transition-all duration-400"
          style={R}
        >
          {hero.ctaText}
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
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onQuickView,
  onAddToCart,
  emptyState,
}: {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  emptyState?: HomepageContent["emptyState"];
}) {
  const activeProducts = products.filter(p => p.status === "active");
  const filteredProducts = selectedCategory === "All" 
    ? activeProducts 
    : activeProducts.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="collection" className="py-24 md:py-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <FadeIn className="text-center mb-10">
        <Label>Signature Collection</Label>
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] text-[#1A1714]" style={F}>
          {selectedCategory === "All" ? "The Signature Collection" : selectedCategory}
        </h2>
        <p className="mt-5 text-[#8C7E6E] text-sm max-w-sm mx-auto leading-[1.85]" style={{ ...D, fontWeight: 300 }}>
          {selectedCategory === "All" 
            ? "One iconic silhouette. Four expressions of quiet luxury. Handcrafted to elevate your everyday presence."
            : `Discover our curated selection of luxury ${selectedCategory.toLowerCase()} handcrafted by master artisans.`}
        </p>
      </FadeIn>

      {/* Category Tabs */}
      <FadeIn className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12" delay={0.1}>
        <button
          onClick={() => onSelectCategory("All")}
          className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-300 font-semibold border-b-2 ${selectedCategory === "All" ? "border-[#C9A96E] text-[#1A1714]" : "border-transparent text-[#8C7E6E] hover:text-[#1A1714]"}`}
          style={R}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-300 font-semibold border-b-2 ${selectedCategory === cat.name ? "border-[#C9A96E] text-[#1A1714]" : "border-transparent text-[#8C7E6E] hover:text-[#1A1714]"}`}
            style={R}
          >
            {cat.name}
          </button>
        ))}
      </FadeIn>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white border border-black/5 max-w-lg mx-auto w-full col-span-full shadow-sm rounded-sm space-y-5">
          {emptyState?.image && (
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-[#EDE6DA] border border-black/5">
              <img src={emptyState.image} alt="Collection preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h3 className="text-lg text-stone-800" style={F}>{emptyState?.title || "Collection In Formulation"}</h3>
            <p className="text-xs text-stone-400 mt-2 font-light leading-relaxed max-w-sm mx-auto" style={D}>
              {emptyState?.description || "Our master artisans are currently stitching the next drop. Sign up for Privé access to be notified."}
            </p>
          </div>
          <button 
            onClick={() => {
              document.getElementById("brand-story")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-block bg-[#1A1714] text-white text-[9px] tracking-widest uppercase font-bold px-6 py-3 hover:bg-[#C9A96E] transition-colors"
            style={R}
          >
            {emptyState?.buttonText || "Request Access Preview"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-7">
          {filteredProducts.map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.05}>
              <ProductCard product={product} onQuickView={onQuickView} onAddToCart={onAddToCart} />
            </FadeIn>
          ))}
        </div>
      )}

      {selectedCategory !== "All" && (
        <FadeIn className="text-center mt-12" delay={0.2}>
          <button
            onClick={() => onSelectCategory("All")}
            className="group text-[10px] tracking-[0.3em] uppercase border border-[#1A1714] px-10 py-4 hover:bg-[#1A1714] hover:text-white transition-all duration-400 inline-flex items-center gap-3"
            style={R}
          >
            View All Collections
            <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </FadeIn>
      )}
    </section>
  );
}

// ─── BRAND STORY ─────────────────────────────────────────────────────────────

function BrandStorySection() {
  return (
    <section id="brand-story" className="py-24 md:py-32 bg-[#1A1714] text-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <FadeIn>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden bg-[#2A2420]">
                <img
                  src="https://images.unsplash.com/photo-1779405949264-a44d50a14315?w=800&h=1000&fit=crop&auto=format"
                  alt="GRATIVA brand story — editorial fashion portrait"
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
              The World<br />
              <em>of GRATIVA</em>
            </h2>
            <div className="space-y-5 text-white/60 leading-[1.9]" style={{ ...D, fontWeight: 300, fontSize: "0.9rem" }}>
              <p>
                GRATIVA was born from a singular belief: that luxury should not be a privilege reserved for the few, but an experience accessible to any woman who values true quality.
              </p>
              <p>
                We set out to create something different — handbags that carry the DNA of the world's finest fashion houses, without the barriers that have long defined the industry.
              </p>
              <p>
                Every detail, every silhouette, every finish is a deliberate act of design. GRATIVA is not just an accessory. It is a statement of elegance and presence.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-10">
              {[
                { stat: "2024", label: "Founded" },
                { stat: "Limited", label: "Editions" },
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

// ─── THE GRATIVA DIFFERENCE ──────────────────────────────────────────────────

function GrativaDifferenceSection({ difference }: { difference: HomepageContent["difference"] }) {
  return (
    <section className="py-28 md:py-36 bg-[#FAF8F4] overflow-hidden border-t border-black/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <FadeIn className="text-center mb-20">
          <Label>The GRATIVA Standard</Label>
          <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] text-[#1A1714] font-normal tracking-wide mb-6 uppercase" style={F}>
            {difference.headline}
          </h2>
          <p className="text-sm md:text-base text-[#8C7E6E] max-w-xl mx-auto leading-[1.8] font-light" style={{ ...D, fontWeight: 300 }}>
            {difference.subheadline}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {difference.features.map((feat, i) => (
            <FadeIn key={feat.title} delay={i * 0.12}>
              <div className="group flex flex-col h-full bg-[#FAF8F4] transition-all duration-500 ease-out">
                {/* Image Container with Elegant Zoom */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-[#EDE6DA] mb-8 relative border border-black/5">
                  <img
                    src={feat.image}
                    alt={`GRATIVA Difference — ${feat.title}`}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Elegant Gold Corner Overlay */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-[#C9A96E]/20 transition-colors duration-700 pointer-events-none" />
                  
                  {/* Luxury tracked number accent */}
                  <div className="absolute top-4 left-4 bg-[#FAF8F4]/90 backdrop-blur-sm text-[#C9A96E] text-[10px] tracking-[0.25em] font-medium px-3 py-1 border border-black/5" style={R}>
                    0{i + 1}
                  </div>
                </div>

                {/* Typography Block */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl text-[#1A1714] font-normal mb-3 transition-colors duration-300 group-hover:text-[#C9A96E]" style={F}>
                      {feat.title}
                    </h3>
                    {/* Subtle sliding gold accent line */}
                    <div className="h-[1px] w-8 bg-[#C9A96E]/40 mb-4 group-hover:w-16 group-hover:bg-[#C9A96E] transition-all duration-500" />
                    <p className="text-[13px] text-[#8C7E6E] leading-[1.85] font-light" style={{ ...D, fontWeight: 300 }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MARQUEE BAR ─────────────────────────────────────────────────────────────

function MarqueeBar({ marquee }: { marquee: string[] }) {
  return (
    <div className="bg-[#1A1714] py-3.5 overflow-hidden">
      <div className="flex" style={{ animation: "marquee 28s linear infinite" }}>
        {[...marquee, ...marquee].map((item, i) => (
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

// ─── INSTAGRAM GALLERY ───────────────────────────────────────────────────────

function InstagramSection() {
  const INSTAGRAM_PHOTOS = [
    "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1571829604981-ea159f94e5ad?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1591348278900-019a8a2a8b1d?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1573227896778-8f378c4029d4?w=400&h=400&fit=crop&auto=format",
  ];

  return (
    <section className="py-24 md:py-32 bg-[#FAF8F4] border-t border-black/5">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        <FadeIn className="text-center mb-10">
          <Label>@grativaofficial</Label>
          <h3 className="text-2xl text-[#1A1714]" style={F}>Join the Community</h3>
        </FadeIn>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
          {INSTAGRAM_PHOTOS.map((url, i) => (
            <div key={i} className="aspect-square overflow-hidden bg-[#EDE6DA] cursor-pointer group">
              <img
                src={url}
                alt={`GRATIVA community — style inspiration ${i + 1}`}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-90"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── COMING SOON ──────────────────────────────────────────────────────────────

function ComingSoonSection({ comingSoon }: { comingSoon: HomepageContent["comingSoon"] }) {
  return (
    <section className="py-24 md:py-32 bg-[#1A1714] text-white">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        <FadeIn className="text-center mb-16">
          <Label>The GRATIVA Universe</Label>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] text-white" style={F}>{comingSoon.headline}</h2>
          <p className="mt-5 text-white/45 text-sm max-w-xs mx-auto leading-[1.8]" style={{ ...D, fontWeight: 300 }}>
            {comingSoon.subheadline}
          </p>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {comingSoon.categories.map((cat, i) => {
            const IconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
              "Watches": Watch,
              "Jewelry": Gem,
              "Accessories": Tag,
              "Fashion": Sparkles,
            };
            const Icon = IconMap[cat.label] || Sparkles;

            return (
              <FadeIn key={cat.name} delay={i * 0.1}>
                <div className="group relative overflow-hidden bg-[#2A2420] aspect-[3/4] cursor-pointer">
                  <img
                    src={cat.image}
                    alt={`GRATIVA ${cat.name} — coming soon`}
                    className="w-full h-full object-cover opacity-45 group-hover:opacity-65 transition-all duration-700"
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
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] mb-1.5 flex items-center gap-1.5" style={R}>
                      <Icon size={10} />
                      {cat.label}
                    </p>
                    <p className="text-base text-white leading-snug" style={F}>{cat.name}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
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
    { Icon: Gem, label: "Limited Releases", desc: "Exclusive access to limited-edition pieces and colorways." },
    { Icon: Tag, label: "VIP Pricing", desc: "Members-only pricing on select collections." },
    { Icon: Sparkles, label: "Private Events", desc: "Invitations to GRATIVA launch previews and private exhibitions." },
  ];

  return (
    <section className="py-28 md:py-36 bg-[#FAF8F4] relative overflow-hidden">
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
              GRATIVA Privé
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
                <p className="text-xl text-[#1A1714]" style={F}>Welcome to GRATIVA Privé</p>
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

function NewsletterSection({ newsletter }: { newsletter: HomepageContent["newsletter"] }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="py-20 bg-[#EDE6DA]">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl text-[#1A1714]" style={F}>{newsletter.headline}</h3>
              <p className="text-[#8C7E6E] text-sm mt-2" style={{ ...D, fontWeight: 300 }}>
                {newsletter.subheadline}
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

export function Footer({ footer }: { footer: HomepageContent["footer"] }) {
  return (
    <footer className="bg-[#120F0C] text-white/50 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <p className="text-white text-[28px] tracking-[0.35em] mb-5 font-normal" style={F}>GRATIVA</p>
            <p className="text-sm leading-[1.85] mb-6" style={{ ...D, fontWeight: 300 }}>
              {footer.about}
            </p>
            <div className="flex items-center gap-2 text-xs mb-3">
              <Mail size={11} strokeWidth={1.5} />
              <span style={D}>{footer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin size={11} strokeWidth={1.5} />
              <span style={D}>{footer.location}</span>
            </div>
          </div>

          {[
            { heading: "Shop", links: ["Handbags", "New Arrivals", "Bestsellers", "Gift Cards"] },
            { heading: "Help", links: ["Size Guide", "Care Instructions", "Returns & Exchanges", "FAQs"] },
            { heading: "GRATIVA", links: ["About Us", "Journal", "Careers", "Press & Media"] },
          ].map((col) => (
            <div key={col.heading}>
              <p className="text-white text-[10px] tracking-[0.28em] uppercase mb-6" style={R}>{col.heading}</p>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    {link === "Journal" ? (
                      <Link to="/journal" className="text-xs hover:text-[#C9A96E] transition-colors duration-300" style={D}>
                        {link}
                      </Link>
                    ) : (
                      <a href="#" className="text-xs hover:text-[#C9A96E] transition-colors duration-300" style={D}>
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p style={D}>© {new Date().getFullYear()} GRATIVA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#C9A96E] transition-colors" style={D}>Privacy Policy</a>
            <a href="#" className="hover:text-[#C9A96E] transition-colors" style={D}>Terms of Service</a>
            {/* Hidden admin access */}
            <Link
              to="/admin"
              className="text-white/5 hover:text-white/20 transition-colors text-xs select-none"
              style={D}
              title="Administrator Login"
            >
              ···
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── SEARCH DRAWER ─────────────────────────────────────────────────────────────

export function SearchDrawer({
  open,
  onClose,
  products,
  onQuickView,
  onAddToCart
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery("");
    }
  }, [open]);

  const filtered = query.trim() === "" ? [] : products.filter(p => 
    p.status === "active" && (
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.color.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    )
  );

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
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 right-0 bg-[#FAF8F4] z-[70] shadow-xl border-b border-black/8 px-6 py-8"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-6 mb-8">
              <Search size={18} className="text-[#8C7E6E]" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search collection (e.g., mocha, ivory, black, pink)..."
                className="flex-1 bg-transparent text-[#1A1714] text-lg md:text-xl placeholder-[#C0B5A8] border-b border-black/10 focus:border-[#C9A96E] py-2 outline-none transition-colors"
                style={D}
              />
              <button onClick={onClose} className="text-[#1A1714] hover:text-[#C9A96E] transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {query.trim() !== "" && (
              <div className="max-w-4xl mx-auto max-h-[50vh] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-[#8C7E6E]" style={D}>No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filtered.map(p => (
                      <div 
                        key={p.id} 
                        className="flex gap-4 p-3 bg-white border border-black/5 hover:border-[#C9A96E]/30 cursor-pointer transition-all duration-300"
                        onClick={() => { onQuickView(p); onClose(); }}
                      >
                        <div className="w-16 h-20 bg-[#EDE6DA] overflow-hidden flex-shrink-0">
                          <img src={p.images[0] || ""} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-xs text-[#8C7E6E] uppercase tracking-wider" style={R}>{p.category}</p>
                          <p className="text-sm text-[#1A1714] font-medium" style={F}>{p.name}</p>
                          <p className="text-xs text-[#8C7E6E] mt-0.5" style={D}>{p.color} · {fmtPrice(p.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN SHOP PAGE ───────────────────────────────────────────────────────────

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const collectionRef = useRef<HTMLDivElement>(null);

  // Load database data and SEO tags
  const loadData = () => {
    setProducts(db.getProducts());
    setCategories(db.getCategories());
    setHomepage(db.getHomepage());
    db.updateSeoTags();
  };

  useEffect(() => {
    loadData();
    // Listen to instant database changes from dashboard
    window.addEventListener("grativa_db_update", loadData);
    return () => window.removeEventListener("grativa_db_update", loadData);
  }, []);

  const addToCart = useCallback((product: Product) => {
    // Add item and update inventory in temp session or let checkout handle it
    setCartItems((prev) => [...prev, product]);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((p) => p.id === productId);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  const handleCheckout = () => {
    // Simulated Checkout
    if (cartItems.length === 0) return;

    // Create a new order in DB
    const allProducts = db.getProducts();
    const currentOrders = db.getOrders();
    const currentCustomers = db.getCustomers();

    const orderId = `#VL-0${100 + currentOrders.length}`;
    const amount = cartItems.reduce((sum, item) => sum + item.price, 0);
    const productNames = cartItems.map(item => `${item.name} — ${item.color}`);
    
    // Choose a random customer from DB to simulate user
    const randomCustomer = currentCustomers[Math.floor(Math.random() * currentCustomers.length)] || {
      name: "Guest Shopper",
      email: "guest@email.com",
      id: `c-${Date.now()}`
    };

    // Deduct inventory
    let inventoryError = false;
    const updatedProducts = allProducts.map(p => {
      const quantityInCart = cartItems.filter(item => item.id === p.id).length;
      if (quantityInCart > 0) {
        if (p.inventory < quantityInCart) {
          inventoryError = true;
        }
        return {
          ...p,
          inventory: Math.max(0, p.inventory - quantityInCart),
          inStock: Math.max(0, p.inventory - quantityInCart) > 0
        };
      }
      return p;
    });

    if (inventoryError) {
      alert("We apologize, but one or more items in your cart exceed available inventory. The order cannot be completed.");
      return;
    }

    // Save inventory deduction
    db.saveProducts(updatedProducts);

    // Save new order
    const newOrder = {
      id: orderId,
      customerName: randomCustomer.name,
      customerEmail: randomCustomer.email,
      productNames,
      amount,
      status: "pending" as const,
      date: new Date().toISOString().split("T")[0]
    };
    db.saveOrders([newOrder, ...currentOrders]);

    // Update customer spend/orders
    const updatedCustomers = currentCustomers.map(c => {
      if (c.email === randomCustomer.email) {
        const newOrdersCount = c.ordersCount + 1;
        const newTotalSpent = c.totalSpent + amount;
        return {
          ...c,
          ordersCount: newOrdersCount,
          totalSpent: newTotalSpent,
          tier: newTotalSpent >= 100000 ? "vip" as const : (newTotalSpent >= 50000 ? "gold" as const : "standard" as const)
        };
      }
      return c;
    });
    db.saveCustomers(updatedCustomers);

    setCartItems([]);
    setCartOpen(false);
    alert(`Order Successful!\n\nOrder ID: ${orderId}\nAmount: ${fmtPrice(amount)}\nThank you for shopping with GRATIVA!`);
  };

  if (!homepage) return (
    <div className="h-screen bg-[#FAF8F4] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#8C7E6E] tracking-[0.2em] uppercase" style={R}>Loading GRATIVA Atelier...</p>
      </div>
    </div>
  );

  return (
    <>
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        cartCount={cartItems.length}
        onCartOpen={() => setCartOpen(true)}
        onMobileMenu={() => setMobileMenuOpen(true)}
        onSearchToggle={() => setSearchOpen(true)}
      />

      <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        items={cartItems} 
        onRemove={removeFromCart} 
        onCheckout={handleCheckout}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <SearchDrawer 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        products={products}
        onQuickView={setQuickViewProduct}
        onAddToCart={addToCart}
      />

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
        <HeroSection hero={homepage.hero} onDiscover={() => collectionRef.current?.scrollIntoView({ behavior: "smooth" })} />
        <MarqueeBar marquee={homepage.marquee} />
        <div ref={collectionRef}>
          <CollectionSection
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onQuickView={setQuickViewProduct}
            onAddToCart={addToCart}
            emptyState={homepage.emptyState}
          />
        </div>
        <BrandStorySection />
        <GrativaDifferenceSection difference={homepage.difference} />
        <InstagramSection />
        <ComingSoonSection comingSoon={homepage.comingSoon} />
        <PrivateClubSection />
        <NewsletterSection newsletter={homepage.newsletter} />
      </main>

      <Footer footer={homepage.footer} />
    </>
  );
}
