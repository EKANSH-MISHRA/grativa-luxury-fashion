import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { db, type Product } from "../utils/db";
import { Navbar, Footer, MobileMenu, SearchDrawer, fmtPrice, F, R, D } from "./Shop";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const loadCart = () => {
    const stored = localStorage.getItem("grativa_cart_items");
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {}
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener("grativa_db_update", loadCart);
    return () => window.removeEventListener("grativa_db_update", loadCart);
  }, []);

  // Deduplicate items to show quantity
  const getItemDetails = () => {
    const map: Record<string, { product: Product; quantity: number }> = {};
    cartItems.forEach((item) => {
      if (map[item.id]) {
        map[item.id].quantity += 1;
      } else {
        map[item.id] = { product: item, quantity: 1 };
      }
    });
    return Object.values(map);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const stored = localStorage.getItem("grativa_cart_items");
    if (!stored) return;
    try {
      const items: Product[] = JSON.parse(stored);
      if (delta > 0) {
        // Find the product info to add
        const prod = items.find((x) => x.id === productId);
        if (prod) {
          // Check stock
          const allProducts = db.getProducts();
          const dbProd = allProducts.find(p => p.id === productId);
          const currentQty = items.filter(x => x.id === productId).length;
          if (dbProd && dbProd.inventory <= currentQty) {
            alert(`Cannot add more. Only ${dbProd.inventory} items are in stock.`);
            return;
          }
          items.push(prod);
        }
      } else {
        // Find index of one occurrence to remove
        const idx = items.findIndex((x) => x.id === productId);
        if (idx !== -1) {
          items.splice(idx, 1);
        }
      }
      localStorage.setItem("grativa_cart_items", JSON.stringify(items));
      setCartItems(items);
      window.dispatchEvent(new Event("grativa_db_update"));
    } catch {}
  };

  const removeItemCompletely = (productId: string) => {
    const stored = localStorage.getItem("grativa_cart_items");
    if (!stored) return;
    try {
      const items: Product[] = JSON.parse(stored);
      const filtered = items.filter((x) => x.id !== productId);
      localStorage.setItem("grativa_cart_items", JSON.stringify(filtered));
      setCartItems(filtered);
      window.dispatchEvent(new Event("grativa_db_update"));
    } catch {}
  };

  const addSpecificToCart = (p: Product) => {
    const updatedCart = [...cartItems, p];
    setCartItems(updatedCart);
    localStorage.setItem("grativa_cart_items", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("grativa_db_update"));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const itemsDetailed = getItemDetails();

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

      {/* Main Cart Content */}
      <main className="flex-grow pt-24 md:pt-32 pb-24 max-w-[1200px] mx-auto px-6 lg:px-10 w-full">
        <h1 className="text-3xl md:text-4xl text-[#1A1714] font-normal tracking-wide mb-10 text-center md:text-left" style={F}>
          Shopping Bag
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
            <ShoppingBag size={48} strokeWidth={1} className="text-[#C9A96E]" />
            <div>
              <p className="text-lg text-[#1A1714] mb-2 font-medium" style={F}>Your bag is currently empty</p>
              <p className="text-xs text-[#8C7E6E]" style={D}>Select an item from our curated drops to begin your experience</p>
            </div>
            <Link
              to="/"
              className="bg-[#1A1714] text-white text-[10px] tracking-[0.3em] uppercase px-8 py-4 hover:bg-[#C9A96E] transition-all duration-300"
              style={R}
            >
              Discover The Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left List */}
            <div className="lg:col-span-8 space-y-6">
              {itemsDetailed.map(({ product, quantity }) => (
                <div 
                  key={product.id} 
                  className="flex flex-col sm:flex-row gap-6 bg-white border border-black/5 p-6 shadow-sm group relative"
                >
                  {/* Image */}
                  <div className="w-24 h-32 bg-[#EDE6DA] overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info details */}
                  <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#C9A96E] font-semibold" style={R}>{product.category}</span>
                          <h3 className="text-lg text-[#1A1714] mt-0.5" style={F}>
                            <Link to={`/product/${product.id}`} className="hover:text-[#C9A96E] transition-colors">
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-[#8C7E6E] mt-0.5" style={D}>Color: {product.color}</p>
                        </div>
                        <span className="text-sm font-semibold text-stone-800 self-center sm:self-start mt-2 sm:mt-0" style={R}>
                          {fmtPrice(product.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity selectors & Delete */}
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center border border-black/15 bg-white mx-auto sm:mx-0">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="px-3 py-1 hover:bg-stone-50 text-stone-600 font-bold"
                        >
                          -
                        </button>
                        <span className="px-4 text-xs font-semibold text-stone-800">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="px-3 py-1 hover:bg-stone-50 text-stone-600 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItemCompletely(product.id)}
                        className="text-[#C0B5A8] hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs tracking-wider"
                        style={R}
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-4 bg-white border border-black/5 p-8 shadow-sm">
              <h2 className="text-xs uppercase tracking-[0.25em] text-[#1A1714] font-bold border-b border-black/5 pb-4 mb-6" style={R}>
                Order Summary
              </h2>

              <div className="space-y-4 text-xs text-[#8C7E6E] mb-6">
                <div className="flex justify-between pb-2 border-b border-black/4">
                  <span>Bag Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-stone-800">{fmtPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-black/4">
                  <span>Luxury Delivery</span>
                  <span className="text-emerald-600 font-semibold uppercase tracking-wider">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm text-[#1A1714] font-semibold pt-2">
                  <span>Total (Incl. Duties)</span>
                  <span className="text-lg" style={F}>{fmtPrice(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-[#1A1714] text-[#FAF8F4] py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#C9A96E] transition-all duration-400 flex items-center justify-center gap-2"
                  style={R}
                >
                  Proceed to Checkout
                  <ArrowRight size={14} />
                </button>
                <Link
                  to="/"
                  className="w-full border border-black/15 py-3.5 text-[10px] tracking-[0.22em] uppercase font-bold text-center block text-[#1A1714] hover:bg-[#1A1714] hover:text-white transition-all duration-300"
                  style={R}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer footer={db.getHomepage().footer} />
    </div>
  );
}
