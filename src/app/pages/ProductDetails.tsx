import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Heart, ShoppingBag, Check, Star, Shield, HelpCircle, Truck, RotateCcw } from "lucide-react";
import { db, type Product } from "../utils/db";
import { Navbar, Footer, CartDrawer, MobileMenu, SearchDrawer } from "./Shop";
import { motion, AnimatePresence } from "motion/react";

const F = { fontFamily: "'Playfair Display', Georgia, serif" as const };
const R = { fontFamily: "'Raleway', system-ui, sans-serif" as const };
const D = { fontFamily: "'DM Sans', system-ui, sans-serif" as const };

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" });

  // Storefront shared layout states
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const addSpecificToCart = (p: Product) => {
    const updatedCart = [...cartItems, p];
    setCartItems(updatedCart);
    localStorage.setItem("grativa_cart_items", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("grativa_db_update"));
    setCartOpen(true);
  };
  
  // Custom reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ author: "", rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Related & recently viewed
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load product and sync states
  const loadProductData = () => {
    if (!id) return;
    const allProducts = db.getProducts();
    const found = allProducts.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setActiveImage(found.images[0] || "");
      
      // Load related products
      const related = allProducts
        .filter(p => p.category === found.category && p.id !== found.id && p.status === "active")
        .slice(0, 4);
      setRelatedProducts(related);

      // Wishlist status
      const customer = db.getCustomerSession();
      if (customer && customer.wishlist) {
        setWishlisted(customer.wishlist.includes(found.id));
      }

      // Add to recently viewed
      const recentIdsJson = localStorage.getItem("grativa_recently_viewed");
      let recentIds: string[] = recentIdsJson ? JSON.parse(recentIdsJson) : [];
      recentIds = [found.id, ...recentIds.filter(x => x !== found.id)].slice(0, 4);
      localStorage.setItem("grativa_recently_viewed", JSON.stringify(recentIds));
      
      const viewedProducts = allProducts.filter(p => recentIds.includes(p.id) && p.id !== found.id && p.status === "active");
      setRecentlyViewed(viewedProducts);

      // Load reviews
      const storedReviews = localStorage.getItem(`grativa_reviews_${found.id}`);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      } else {
        // Seed mock reviews
        const seedReviews: Review[] = [
          { id: "rev-1", author: "Aishwarya R.", rating: 5, date: "2026-05-10", comment: "The stitching and leather quality are absolutely world-class. Smells premium and feels solid." },
          { id: "rev-2", author: "Kiran K.", rating: 4, date: "2026-06-02", comment: "Beautiful bag. The Mocha Brown shade is deep and elegant. Fits my daily cards and items comfortably." }
        ];
        setReviews(seedReviews);
        localStorage.setItem(`grativa_reviews_${found.id}`, JSON.stringify(seedReviews));
      }
    } else {
      navigate("/404");
    }
  };

  const syncCart = () => {
    // Load cart items from temporary session or logic
    const sessionCart = localStorage.getItem("grativa_cart_items");
    if (sessionCart) {
      try {
        setCartItems(JSON.parse(sessionCart));
      } catch {}
    }
  };

  useEffect(() => {
    loadProductData();
    syncCart();
    window.addEventListener("grativa_db_update", loadProductData);
    return () => {
      window.removeEventListener("grativa_db_update", loadProductData);
    };
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${activeImage})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  const addToCart = (buyNow = false) => {
    if (!product) return;
    
    // Add product to cart multiple times based on quantity
    const newItems: Product[] = [];
    for (let i = 0; i < quantity; i++) {
      newItems.push(product);
    }

    const updatedCart = [...cartItems, ...newItems];
    setCartItems(updatedCart);
    localStorage.setItem("grativa_cart_items", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("grativa_db_update"));

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);

    if (buyNow) {
      navigate("/checkout");
    } else {
      setCartOpen(true);
    }
  };

  const removeFromCart = (productId: string) => {
    const idx = cartItems.findIndex((p) => p.id === productId);
    if (idx === -1) return;
    const updated = [...cartItems.slice(0, idx), ...cartItems.slice(idx + 1)];
    setCartItems(updated);
    localStorage.setItem("grativa_cart_items", JSON.stringify(updated));
    window.dispatchEvent(new Event("grativa_db_update"));
  };

  const toggleWishlist = () => {
    if (!product) return;
    const customer = db.getCustomerSession();
    if (!customer) {
      alert("Please log in to manage your wishlist.");
      navigate("/account");
      return;
    }

    const currentWishlist = customer.wishlist || [];
    let updatedWishlist: string[] = [];
    if (currentWishlist.includes(product.id)) {
      updatedWishlist = currentWishlist.filter(id => id !== product.id);
      setWishlisted(false);
    } else {
      updatedWishlist = [...currentWishlist, product.id];
      setWishlisted(true);
    }

    // Save back to customer db
    const customers = db.getCustomers();
    const updatedCustomers = customers.map(c => 
      c.email === customer.email ? { ...c, wishlist: updatedWishlist } : c
    );
    db.saveCustomers(updatedCustomers);
    
    // Sync current session
    db.setCustomerSession({ ...customer, wishlist: updatedWishlist });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReview.author.trim() || !newReview.comment.trim()) return;

    const reviewObj: Review = {
      id: `rev-${Date.now()}`,
      author: newReview.author.trim(),
      rating: newReview.rating,
      date: new Date().toISOString().split("T")[0],
      comment: newReview.comment.trim()
    };

    const updatedReviews = [reviewObj, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`grativa_reviews_${product.id}`, JSON.stringify(updatedReviews));
    setNewReview({ author: "", rating: 5, comment: "" });
    setShowReviewForm(false);
  };

  if (!product) return null;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  const allImages = [product.images[0], ...(product.galleryImages || [])].filter(Boolean);

  return (
    <div className="bg-[#FAF8F4] min-h-screen flex flex-col" style={D}>
      <Navbar
        categories={db.getCategories()}
        selectedCategory="All"
        onSelectCategory={() => {}}
        cartCount={cartItems.length}
        onCartOpen={() => setCartOpen(true)}
        onMobileMenu={() => setMobileMenuOpen(true)}
        onSearchToggle={() => setSearchOpen(true)}
      />

      <SearchDrawer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={db.getProducts()}
        onQuickView={(p) => navigate(`/product/${p.id}`)}
        onAddToCart={addSpecificToCart}
      />

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={db.getCategories()}
        selectedCategory="All"
        onSelectCategory={() => {}}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onCheckout={() => navigate("/checkout")}
      />

      {/* Main Container */}
      <main className="flex-grow pt-24 md:pt-32 pb-24 max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
        {/* Back link */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-xs text-[#8C7E6E] hover:text-[#1A1714] transition-colors mb-8 uppercase tracking-widest font-semibold"
          style={R}
        >
          <ArrowLeft size={14} />
          Back to Catalogue
        </Link>

        {/* Gallery + Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* LEFT: Gallery Section */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            {/* Vertical Thumbnails */}
            <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-x-visible">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-20 bg-[#EDE6DA] border overflow-hidden flex-shrink-0 transition-colors ${activeImage === img ? "border-[#C9A96E]" : "border-black/5"}`}
                >
                  <img src={img} alt={`Gallery view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Large Main Zoom Image */}
            <div 
              className="flex-grow aspect-[3/4] bg-[#EDE6DA] overflow-hidden relative cursor-zoom-in order-1 md:order-2 border border-black/5"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
              {/* Zoom lens overlay */}
              <div 
                className="absolute inset-0 bg-no-repeat pointer-events-none"
                style={{
                  ...zoomStyle,
                  backgroundSize: "200%"
                }}
              />

              {product.luxuryBadge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-[9px] tracking-[0.2em] uppercase bg-[#C9A96E] text-white px-3.5 py-1 font-semibold" style={R}>
                    {product.luxuryBadge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Specs Section */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] font-medium" style={R}>
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl text-[#1A1714] font-normal leading-tight mt-1 mb-2" style={F}>
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="text-sm text-[#8C7E6E] font-serif italic mb-3">{product.subtitle}</p>
              )}
              
              {/* Stars Review Summary */}
              <div className="flex items-center gap-1.5 text-xs text-[#8C7E6E] mt-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span>{averageRating} ({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Prices */}
            <div className="border-y border-black/8 py-4 flex items-baseline gap-4">
              <span className="text-2xl text-[#1A1714] font-medium" style={F}>{fmtPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-stone-400 line-through text-sm">{fmtPrice(product.comparePrice)}</span>
                  <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 font-semibold" style={R}>
                    Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Metadata (SKU, Color) */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[#8C7E6E]">Colorway:</span>
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: product.colorHex }} />
                  {product.color}
                </span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[#8C7E6E]">Reference SKU:</span>
                <span className="font-mono text-stone-600">{product.sku}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[#8C7E6E]">Stock Status:</span>
                <span className={`font-semibold ${product.inventory > 0 ? (product.inventory < 5 ? "text-amber-600" : "text-emerald-600") : "text-red-500"}`}>
                  {product.inventory > 0 
                    ? (product.inventory < 5 ? `Only ${product.inventory} pieces left` : "Available In Stock") 
                    : "Sold Out / Restocking"}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.inventory > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#8C7E6E]">Quantity:</span>
                <div className="flex items-center border border-black/15 bg-white">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-1.5 hover:bg-stone-50 text-stone-600 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-semibold text-stone-800">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.inventory, q + 1))}
                    className="px-3.5 py-1.5 hover:bg-stone-50 text-stone-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Shopping buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => addToCart(false)}
                disabled={product.inventory === 0}
                className={`w-full py-4 text-[10px] tracking-[0.3em] uppercase font-bold transition-all duration-400 ${
                  product.inventory === 0
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : addedToCart
                      ? "bg-emerald-600 text-white"
                      : "bg-[#1A1714] text-white hover:bg-[#C9A96E]"
                }`}
                style={R}
              >
                {product.inventory === 0 ? "Out of Stock" : addedToCart ? "Added to Bag ✓" : "Add to Bag"}
              </button>
              
              <button
                onClick={() => addToCart(true)}
                disabled={product.inventory === 0}
                className="w-full border border-black text-[#1A1714] py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#1A1714] hover:text-white transition-all duration-300"
                style={R}
              >
                Buy Now
              </button>

              <button
                onClick={toggleWishlist}
                className={`w-full col-span-full border border-black/15 py-3 text-[10px] tracking-[0.22em] uppercase font-bold flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors`}
                style={R}
              >
                <Heart size={14} className={wishlisted ? "fill-[#C9A96E] text-[#C9A96E]" : "text-[#1A1714]"} />
                {wishlisted ? "Remove From Wishlist" : "Save to Wishlist"}
              </button>
            </div>

            {/* Description & Long Description Accordion */}
            <div className="space-y-4 pt-4 border-t border-black/6">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#1A1714] font-semibold mb-2" style={R}>Product Description</h4>
                <p className="text-xs text-[#8C7E6E] leading-relaxed font-light">{product.description}</p>
              </div>

              {product.longDescription && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#1A1714] font-semibold mb-2" style={R}>Atelier Craft Details</h4>
                  <div 
                    className="text-xs text-[#8C7E6E] leading-relaxed font-light space-y-2 border-l-2 border-[#C9A96E]/30 pl-3"
                    dangerouslySetInnerHTML={{ __html: product.longDescription }}
                  />
                </div>
              )}
            </div>

            {/* Luxury Shipping Seals */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 text-[10px] text-[#8C7E6E]">
              <div className="flex items-center gap-2.5">
                <Truck size={14} className="text-[#C9A96E]" />
                <span>Complimentary Shipping</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw size={14} className="text-[#C9A96E]" />
                <span>30-Day Returns Policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-black/8 text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3" style={R}>CURATED PAIRINGS</p>
            <h3 className="text-2xl md:text-3xl text-[#1A1714] mb-12 font-normal" style={F}>Related Products</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <div key={p.id} className="group text-left cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="aspect-[3/4] bg-[#EDE6DA] overflow-hidden relative border border-black/5">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-stone-800" style={F}>{p.name}</h4>
                    <p className="text-xs text-stone-400 mt-0.5">{p.color}</p>
                    <p className="text-xs text-stone-700 font-semibold mt-1.5">{fmtPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RECENTLY VIEWED PRODUCTS */}
        {recentlyViewed.length > 0 && (
          <section className="mt-20 pt-12 border-t border-black/8 text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3" style={R}>YOUR JOURNEY</p>
            <h3 className="text-xl md:text-2xl text-[#1A1714] mb-10 font-normal" style={F}>Recently Viewed</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map(p => (
                <div key={p.id} className="group text-left cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="aspect-[3/4] bg-[#EDE6DA] overflow-hidden relative border border-black/5">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-stone-800" style={F}>{p.name}</h4>
                    <p className="text-xs text-stone-400 mt-0.5">{p.color} · {fmtPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REVIEWS SECTION */}
        <section className="mt-24 pt-16 border-t border-black/8 text-left max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8 border-b border-black/5 pb-4">
            <div>
              <h3 className="text-2xl text-stone-800 font-normal" style={F}>Client Feedback</h3>
              <p className="text-xs text-stone-400 mt-1">Average rating: {averageRating} / 5.0 based on {reviews.length} notes</p>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-[#1A1714] hover:bg-[#C9A96E] text-white text-[9px] uppercase tracking-widest font-bold px-4 py-2.5 transition-colors"
              style={R}
            >
              Write Review
            </button>
          </div>

          {/* New review form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-white border border-black/5 p-6 mb-8 space-y-4 shadow-sm">
              <h4 className="text-xs uppercase tracking-wider text-[#1A1714] font-bold" style={R}>Submit Review</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Display Name</label>
                  <input
                    type="text"
                    required
                    value={newReview.author}
                    onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                    className="w-full border border-black/10 px-3 py-2 bg-[#FAF8F4] outline-none text-xs"
                    placeholder="e.g. Priyas."
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Rating Star Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full border border-black/10 px-3 py-2 bg-[#FAF8F4] outline-none text-xs"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Notes & Feedback</label>
                <textarea
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={3}
                  className="w-full border border-black/10 px-3 py-2 bg-[#FAF8F4] outline-none text-xs"
                  placeholder="Share details on texture, strap length, craftsmanship..."
                />
              </div>
              <button
                type="submit"
                className="bg-[#1A1714] hover:bg-[#C9A96E] text-white text-[9px] uppercase tracking-widest font-bold px-6 py-2.5 transition-colors"
                style={R}
              >
                Submit Feedback
              </button>
            </form>
          )}

          {/* Reviews list */}
          <div className="space-y-6">
            {reviews.map(r => (
              <div key={r.id} className="border-b border-black/4 pb-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-stone-800">{r.author}</span>
                    <span className="text-[10px] text-stone-300">·</span>
                    <span className="text-[10px] text-[#8C7E6E]">{r.date}</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} fill={i < r.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#8C7E6E] leading-relaxed font-light">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer footer={db.getHomepage().footer} />
    </div>
  );
}
