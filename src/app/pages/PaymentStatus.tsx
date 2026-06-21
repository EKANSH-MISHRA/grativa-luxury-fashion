import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { db, type Product } from "../utils/db";
import { Navbar, Footer, MobileMenu, SearchDrawer, F, R, D } from "./Shop";

// ─── PAYMENT SUCCESS COMPONENT ────────────────────────────────────────────────

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId") || "#VL-UNKNOWN";
  const paymentId = searchParams.get("paymentId") || "pay_unknown";

  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    // Force sync cart (it should be empty)
    const stored = localStorage.getItem("grativa_cart_items");
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  const addSpecificToCart = (p: Product) => {
    const updatedCart = [...cartItems, p];
    setCartItems(updatedCart);
    localStorage.setItem("grativa_cart_items", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("grativa_db_update"));
  };

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

      <main className="flex-grow flex items-center justify-center pt-24 md:pt-32 pb-24 px-6">
        <div className="max-w-md w-full bg-white border border-black/5 p-10 md:p-12 text-center shadow-lg rounded-sm space-y-6">
          <div className="flex justify-center text-emerald-600">
            <CheckCircle2 size={48} strokeWidth={1} />
          </div>

          <div>
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E]" style={R}>ORDER SETTLED</span>
            <h1 className="text-3xl font-normal text-stone-900 mt-2" style={F}>Refinement Confirmed</h1>
          </div>

          <div className="h-[1px] w-12 bg-[#C9A96E] mx-auto" />

          <p className="text-xs text-[#8C7E6E] leading-relaxed font-light">
            Your transaction has been settled successfully under secure protocol. A custom dust bag and complimentary certificate are being prepared for your delivery.
          </p>

          <div className="bg-stone-50 border border-stone-200 p-4 rounded-sm space-y-2 text-left font-mono text-[10px] text-stone-600">
            <div className="flex justify-between">
              <span>Order Reference:</span>
              <span className="font-semibold text-stone-800">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Razorpay ID:</span>
              <span className="font-semibold text-stone-800">{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span>Gateway Status:</span>
              <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[8px]">Paid / Secured</span>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              to="/account"
              className="w-full bg-[#1A1714] text-[#FAF8F4] py-4 text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-[#C9A96E] transition-all duration-400 flex items-center justify-center gap-2"
              style={R}
            >
              Track in Account Portal
              <ArrowRight size={13} />
            </Link>
            <Link
              to="/"
              className="w-full border border-black/15 py-3.5 text-[10px] tracking-[0.2em] uppercase font-bold text-center block text-[#1A1714] hover:bg-stone-50 transition-colors"
              style={R}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer footer={db.getHomepage().footer} />
    </div>
  );
}

// ─── PAYMENT FAILED COMPONENT ─────────────────────────────────────────────────

export function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId") || "#VL-UNKNOWN";

  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("grativa_cart_items");
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  const addSpecificToCart = (p: Product) => {
    const updatedCart = [...cartItems, p];
    setCartItems(updatedCart);
    localStorage.setItem("grativa_cart_items", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("grativa_db_update"));
  };

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

      <main className="flex-grow flex items-center justify-center pt-24 md:pt-32 pb-24 px-6">
        <div className="max-w-md w-full bg-white border border-black/5 p-10 md:p-12 text-center shadow-lg rounded-sm space-y-6">
          <div className="flex justify-center text-red-500">
            <AlertTriangle size={48} strokeWidth={1} />
          </div>

          <div>
            <span className="text-[10px] tracking-[0.4em] uppercase text-red-500" style={R}>SETTLEMENT FAILED</span>
            <h1 className="text-3xl font-normal text-stone-900 mt-2" style={F}>Transaction Unsettled</h1>
          </div>

          <div className="h-[1px] w-12 bg-red-400 mx-auto" />

          <p className="text-xs text-[#8C7E6E] leading-relaxed font-light">
            We were unable to secure authorization from your financial issuer. No assets were transacted from your account balance.
          </p>

          <div className="bg-stone-50 border border-stone-200 p-4 rounded-sm space-y-2 text-left font-mono text-[10px] text-stone-600">
            <div className="flex justify-between">
              <span>Attempted Reference:</span>
              <span className="font-semibold text-stone-800">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Code:</span>
              <span className="font-semibold text-stone-800">ERR_AUTH_DENIED</span>
            </div>
            <div className="flex justify-between">
              <span>Gateway Status:</span>
              <span className="text-red-500 font-semibold uppercase tracking-wider text-[8px]">Rejected / Failed</span>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              to="/checkout"
              className="w-full bg-[#1A1714] text-[#FAF8F4] py-4 text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-[#C9A96E] transition-all duration-400 flex items-center justify-center gap-2"
              style={R}
            >
              Retry Payment Checkout
              <ArrowRight size={13} />
            </Link>
            <Link
              to="/cart"
              className="w-full border border-black/15 py-3.5 text-[10px] tracking-[0.2em] uppercase font-bold text-center block text-[#1A1714] hover:bg-stone-50 transition-colors"
              style={R}
            >
              Return to Shopping Bag
            </Link>
          </div>
        </div>
      </main>

      <Footer footer={db.getHomepage().footer} />
    </div>
  );
}
