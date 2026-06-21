import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Check, ShieldCheck, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { db, type Product, type Customer } from "../utils/db";
import { Navbar, Footer, MobileMenu, fmtPrice, F, R, D } from "./Shop";

const RAZORPAY_KEY_ID = "rzp_test_placeholder_key"; // Placeholder for user keys

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("India");

  const [loading, setLoading] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [tempOrderId, setTempOrderId] = useState("");

  const loadCheckoutData = () => {
    // Cart
    const storedCart = localStorage.getItem("grativa_cart_items");
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        setCartItems(items);
        if (items.length === 0) {
          navigate("/cart");
        }
      } catch {
        navigate("/");
      }
    } else {
      navigate("/");
    }

    // Customer Session
    const sess = db.getCustomerSession();
    if (sess) {
      setCustomer(sess);
      setEmail(sess.email || "");
      setName(sess.name || "");
      setPhone(sess.phone || "");
      if (sess.addresses && sess.addresses.length > 0) {
        const primary = sess.addresses[0];
        setStreet(primary.street || "");
        setCity(primary.city || "");
        setState(primary.state || "");
        setZip(primary.zip || "");
        setCountry(primary.country || "India");
      }
    }
  };

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const selectSavedAddress = (addrId: string) => {
    if (!customer || !customer.addresses) return;
    const found = customer.addresses.find((a) => a.id === addrId);
    if (found) {
      setStreet(found.street);
      setCity(found.city);
      setState(found.state);
      setZip(found.zip);
      setCountry(found.country);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // Validate stock
    const allProducts = db.getProducts();
    let stockError = false;
    
    // Map quantities
    const cartQuantities: Record<string, number> = {};
    cartItems.forEach(item => {
      cartQuantities[item.id] = (cartQuantities[item.id] || 0) + 1;
    });

    allProducts.forEach(p => {
      const needed = cartQuantities[p.id] || 0;
      if (needed > 0 && p.inventory < needed) {
        stockError = true;
      }
    });

    if (stockError) {
      alert("One or more items in your cart are no longer in stock in the required quantity.");
      navigate("/cart");
      return;
    }

    setLoading(true);

    // Create order ID
    const currentOrders = db.getOrders();
    const orderId = `#VL-0${1000 + currentOrders.length}`;
    setTempOrderId(orderId);

    // Simulate payment gateway loading
    setTimeout(() => {
      setLoading(false);
      setShowRazorpayModal(true);
    }, 1000);
  };

  const handlePaymentSuccess = () => {
    setShowRazorpayModal(false);
    setLoading(true);

    // 1. Process database states
    const allProducts = db.getProducts();
    const currentOrders = db.getOrders();
    const currentCustomers = db.getCustomers();

    const amount = cartItems.reduce((sum, item) => sum + item.price, 0);
    const productNames = cartItems.map(item => `${item.name} — ${item.color}`);
    
    const itemsStructured = Object.entries(
      cartItems.reduce<Record<string, { product: Product; quantity: number }>>((acc, item) => {
        if (acc[item.id]) {
          acc[item.id].quantity += 1;
        } else {
          acc[item.id] = { product: item, quantity: 1 };
        }
        return acc;
      }, {})
    ).map(([_, data]) => ({
      productId: data.product.id,
      name: data.product.name,
      price: data.product.price,
      quantity: data.product.quantity
    }));

    // Deduct stock inventory
    const cartQuantities: Record<string, number> = {};
    cartItems.forEach(item => {
      cartQuantities[item.id] = (cartQuantities[item.id] || 0) + 1;
    });

    const updatedProducts = allProducts.map(p => {
      const q = cartQuantities[p.id] || 0;
      if (q > 0) {
        const newStock = Math.max(0, p.inventory - q);
        return {
          ...p,
          inventory: newStock,
          inStock: newStock > 0
        };
      }
      return p;
    });
    db.saveProducts(updatedProducts);

    // Save order
    const paymentId = `pay_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder = {
      id: tempOrderId,
      customerName: name,
      customerEmail: email,
      productNames,
      amount,
      status: "confirmed" as const,
      date: new Date().toISOString().split("T")[0],
      items: itemsStructured,
      shippingAddress: { street, city, state, zip, country },
      paymentStatus: "paid" as const,
      paymentId
    };
    db.saveOrders([newOrder, ...currentOrders]);

    // Update customer logs
    const updatedCustomers = currentCustomers.map(c => {
      if (c.email.toLowerCase() === email.toLowerCase()) {
        const newOrdersCount = c.ordersCount + 1;
        const newTotalSpent = c.totalSpent + amount;
        
        // If address does not exist, add it
        const addresses = c.addresses || [];
        const hasAddr = addresses.some(a => a.street === street && a.zip === zip);
        if (!hasAddr) {
          addresses.push({
            id: `addr-${Date.now()}`,
            name: "Delivery Address",
            street,
            city,
            state,
            zip,
            country
          });
        }

        const updatedCust = {
          ...c,
          ordersCount: newOrdersCount,
          totalSpent: newTotalSpent,
          tier: newTotalSpent >= 100000 ? "vip" as const : (newTotalSpent >= 50000 ? "gold" as const : "standard" as const),
          addresses
        };

        // If it's the current user, update session too
        if (customer && customer.email.toLowerCase() === c.email.toLowerCase()) {
          db.setCustomerSession(updatedCust);
        }
        return updatedCust;
      }
      return c;
    });
    
    // If not found in customers list (guest Checkout), let's create a customer log for admin visibility
    const customerExists = currentCustomers.some(c => c.email.toLowerCase() === email.toLowerCase());
    if (!customerExists) {
      const newCust = {
        id: `c-${Date.now()}`,
        name,
        email,
        phone,
        ordersCount: 1,
        totalSpent: amount,
        tier: amount >= 100000 ? "vip" as const : (amount >= 50000 ? "gold" as const : "standard" as const),
        joinedDate: new Date().toISOString().split("T")[0],
        addresses: [{
          id: `addr-${Date.now()}`,
          name: "Primary Address",
          street,
          city,
          state,
          zip,
          country
        }],
        wishlist: []
      };
      db.saveCustomers([...updatedCustomers, newCust]);
    } else {
      db.saveCustomers(updatedCustomers);
    }

    // Reset cart
    localStorage.removeItem("grativa_cart_items");
    window.dispatchEvent(new Event("grativa_db_update"));

    setTimeout(() => {
      setLoading(false);
      navigate(`/payment-success?orderId=${encodeURIComponent(tempOrderId)}&paymentId=${encodeURIComponent(paymentId)}`);
    }, 1200);
  };

  const handlePaymentFailure = () => {
    setShowRazorpayModal(false);
    setLoading(true);

    const currentOrders = db.getOrders();
    const amount = cartItems.reduce((sum, item) => sum + item.price, 0);
    const productNames = cartItems.map(item => `${item.name} — ${item.color}`);

    // Save failed order representation
    const newOrder = {
      id: tempOrderId,
      customerName: name,
      customerEmail: email,
      productNames,
      amount,
      status: "pending" as const,
      date: new Date().toISOString().split("T")[0],
      paymentStatus: "failed" as const
    };
    db.saveOrders([newOrder, ...currentOrders]);

    setTimeout(() => {
      setLoading(false);
      navigate(`/payment-failed?orderId=${encodeURIComponent(tempOrderId)}`);
    }, 1200);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="bg-[#FAF8F4] min-h-screen flex flex-col font-sans text-stone-800" style={D}>
      <header className="bg-white border-b border-black/8 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="text-xl tracking-[0.35em]" style={F}>GRATIVA</Link>
          <Link to="/cart" className="flex items-center gap-2 text-xs text-[#8C7E6E] hover:text-[#1A1714] font-semibold" style={R}>
            <ArrowLeft size={13} />
            Back to Bag
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-[1200px] mx-auto px-6 py-12 lg:py-16 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-10 h-10 text-[#C9A96E] animate-spin mb-4" />
            <p className="text-sm tracking-[0.2em] uppercase text-stone-600" style={R}>Configuring secure connection...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Form Fields: Shipping Info */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-xl mb-4 font-normal text-stone-900" style={F}>Shipping & Contact Details</h2>
                <p className="text-xs text-[#8C7E6E] mb-6">Complete all information for fine art packaging and courier coordinates.</p>
                
                {/* Saved addresses selector */}
                {customer && customer.addresses && customer.addresses.length > 0 && (
                  <div className="mb-6 bg-white border border-black/5 p-4 rounded-sm">
                    <p className="text-[9px] uppercase tracking-widest text-[#C9A96E] font-bold mb-3.5" style={R}>Select From Saved Addresses</p>
                    <div className="flex flex-wrap gap-2.5">
                      {customer.addresses.map((a) => (
                        <button
                          type="button"
                          key={a.id}
                          onClick={() => selectSavedAddress(a.id)}
                          className="border border-[#1A1714]/15 hover:border-[#C9A96E] px-4 py-2 text-xs font-semibold hover:bg-stone-50 transition-colors"
                          style={R}
                        >
                          {a.name} ({a.city})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Contact Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                      placeholder="client@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Contact Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Client Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                      placeholder="Enter Full Name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Street Address</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                      placeholder="Apartment, suite, block name"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>PIN Code / ZIP</label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                      placeholder="XXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Country</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details info banner */}
              <div className="bg-stone-50 border border-stone-200 p-6 space-y-4">
                <div className="flex gap-3">
                  <CreditCard className="text-[#C9A96E] flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-stone-800 font-bold" style={R}>Razorpay Gateway System</h3>
                    <p className="text-[11px] text-[#8C7E6E] leading-relaxed mt-1 font-light">
                      Orders will be simulated using our Secure sandboxed Razorpay layer. In test mode, you can select whether to execute a successful or failed settlement.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1714] text-white py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#C9A96E] transition-all duration-400"
                style={R}
              >
                Proceed to Payment
              </button>
            </form>

            {/* Right Summary column */}
            <div className="lg:col-span-5 bg-white border border-black/5 p-8 shadow-sm">
              <h2 className="text-xs uppercase tracking-[0.25em] text-[#1A1714] font-bold border-b border-black/5 pb-4 mb-6" style={R}>
                In Your Order
              </h2>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-6">
                {cartItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-4 items-center">
                    <div className="w-12 h-16 bg-[#EDE6DA] overflow-hidden flex-shrink-0 border border-black/5">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-800 truncate" style={F}>{item.name}</h4>
                      <p className="text-[10px] text-stone-400 mt-0.5">{item.color}</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-700">{fmtPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/5 pt-6 space-y-3.5 text-xs text-[#8C7E6E]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-stone-800">{fmtPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Luxury Delivery</span>
                  <span className="text-emerald-600 font-semibold uppercase tracking-widest text-[9px]">Complimentary</span>
                </div>
                <div className="flex justify-between border-t border-black/8 pt-4 text-stone-800 font-semibold text-sm">
                  <span>Total Amount</span>
                  <span className="text-lg text-stone-900" style={F}>{fmtPrice(subtotal)}</span>
                </div>
              </div>

              <div className="mt-8 border-t border-black/5 pt-6 flex justify-center items-center gap-2.5 text-[10px] text-[#8C7E6E]">
                <ShieldCheck className="text-emerald-600" size={14} />
                <span>SSL Encrypted Checkout Verification</span>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* RAZORPAY GATEWAY MODAL SIMULATOR */}
      {showRazorpayModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1714] text-white w-full max-w-[420px] rounded-lg shadow-2xl overflow-hidden border border-white/10 font-sans">
            {/* Header */}
            <div className="bg-[#120F0C] px-6 py-5 flex items-center justify-between border-b border-white/5">
              <div>
                <span className="text-[10px] tracking-[0.25em] text-[#C9A96E] uppercase font-bold" style={R}>Razorpay Gateway</span>
                <h3 className="text-sm font-semibold tracking-wide text-white mt-0.5">Payment Secure Portal</h3>
              </div>
              <span className="text-[9px] bg-white/15 px-2 py-0.5 rounded text-white/80 font-mono">TEST MODE</span>
            </div>

            {/* Main content */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center text-xs border-b border-white/8 pb-4">
                <span className="text-white/60">Order ID Reference</span>
                <span className="font-mono text-white font-semibold">{tempOrderId}</span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-white/8 pb-4">
                <span className="text-white/60">Merchant Settlement</span>
                <span className="text-white font-semibold uppercase tracking-wider">GRATIVA LUXURY RETAIL</span>
              </div>

              <div className="flex justify-between items-center pb-2">
                <span className="text-xs text-white/60">Amount Payable</span>
                <span className="text-xl text-[#C9A96E] font-semibold" style={F}>{fmtPrice(subtotal)}</span>
              </div>

              <div className="bg-white/5 border border-white/8 p-4 rounded text-[11px] text-white/70 leading-relaxed font-light">
                Razorpay key configured to <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-white">{RAZORPAY_KEY_ID}</code>. Choose the settlement output below to simulate gateway return webhooks.
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={handlePaymentSuccess}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3.5 px-4 rounded tracking-wide transition-colors"
                >
                  Simulate Success
                </button>
                <button
                  onClick={handlePaymentFailure}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-3.5 px-4 rounded tracking-wide transition-colors"
                >
                  Simulate Failure
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#120F0C] px-6 py-4 text-center border-t border-white/5">
              <p className="text-[9px] text-white/40 tracking-wider">Powered by Razorpay Secure Sandbox API</p>
            </div>
          </div>
        </div>
      )}

      <Footer footer={db.getHomepage().footer} />
    </div>
  );
}
