import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { User, LogOut, Package, MapPin, Heart, Plus, Trash2, Eye, Shield, Key } from "lucide-react";
import { db, type Customer, type Product, type Order } from "../utils/db";
import { Navbar, Footer, MobileMenu, SearchDrawer, fmtPrice, F, R, D } from "./Shop";

export default function Account() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");

  // Shared storefront states
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Login/Register States
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);
  const [magicCode, setMagicCode] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Profile Edit / Address form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrCountry, setAddrCountry] = useState("India");

  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  const loadAccountData = () => {
    // Cart
    const storedCart = localStorage.getItem("grativa_cart_items");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch {}
    }

    // Auth Session
    const sess = db.getCustomerSession();
    if (sess) {
      setCustomer(sess);
      setEditName(sess.name);
      setEditPhone(sess.phone);

      // Load orders
      const allOrders = db.getOrders();
      const userOrders = allOrders.filter(o => o.customerEmail.toLowerCase() === sess.email.toLowerCase());
      setClientOrders(userOrders);

      // Load wishlist
      const allProducts = db.getProducts();
      const wishProds = allProducts.filter(p => sess.wishlist?.includes(p.id));
      setWishlistProducts(wishProds);
    } else {
      setCustomer(null);
    }
  };

  useEffect(() => {
    loadAccountData();
    window.addEventListener("grativa_db_update", loadAccountData);
    return () => window.removeEventListener("grativa_db_update", loadAccountData);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const customers = db.getCustomers();
    const found = customers.find(c => c.email.toLowerCase() === loginEmail.toLowerCase());

    if (!found) {
      alert("Atelier Record: No client is registered under this email.");
      return;
    }

    if (loginMethod === "password") {
      if (found.password === loginPassword) {
        db.setCustomerSession(found);
        loadAccountData();
      } else {
        alert("Authentication code rejected. Please verify password credentials.");
      }
    } else {
      // Magic Code simulation
      if (!magicSent) {
        setMagicSent(true);
        alert("Atelier Alert: Security Code '123456' has been dispatched to your email (simulated).");
      } else {
        if (magicCode === "123456") {
          db.setCustomerSession(found);
          setMagicSent(false);
          setMagicCode("");
          loadAccountData();
        } else {
          alert("The security code entered is invalid. Try code '123456'.");
        }
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const customers = db.getCustomers();
    const exists = customers.some(c => c.email.toLowerCase() === registerEmail.toLowerCase());

    if (exists) {
      alert("This email address is already assigned to a registered GRATIVA account.");
      return;
    }

    const newCust: Customer = {
      id: `c-${Date.now()}`,
      name: registerName,
      email: registerEmail,
      phone: registerPhone,
      ordersCount: 0,
      totalSpent: 0,
      tier: "standard",
      joinedDate: new Date().toISOString().split("T")[0],
      password: registerPassword || "customer123",
      addresses: [],
      wishlist: []
    };

    db.saveCustomers([...customers, newCust]);
    db.setCustomerSession(newCust);
    loadAccountData();
  };

  const handleSignOut = () => {
    db.clearCustomerSession();
    setCustomer(null);
    setClientOrders([]);
    setWishlistProducts([]);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const updated = {
      ...customer,
      name: editName,
      phone: editPhone
    };

    // Save to Database
    const customers = db.getCustomers();
    const list = customers.map(c => c.id === customer.id ? updated : c);
    db.saveCustomers(list);
    db.setCustomerSession(updated);

    alert("Atelier coordinates updated successfully.");
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const newAddr = {
      id: `addr-${Date.now()}`,
      name: addrName.trim() || "Delivery Coordinates",
      street: addrStreet.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      zip: addrZip.trim(),
      country: addrCountry.trim()
    };

    const addresses = [...(customer.addresses || []), newAddr];
    const updated = {
      ...customer,
      addresses
    };

    const customers = db.getCustomers();
    db.saveCustomers(customers.map(c => c.id === customer.id ? updated : c));
    db.setCustomerSession(updated);

    // Reset Form
    setAddrName("");
    setAddrStreet("");
    setAddrCity("");
    setAddrState("");
    setAddrZip("");
    setAddrCountry("India");
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (!customer) return;
    const addresses = (customer.addresses || []).filter(a => a.id !== id);
    const updated = {
      ...customer,
      addresses
    };

    const customers = db.getCustomers();
    db.saveCustomers(customers.map(c => c.id === customer.id ? updated : c));
    db.setCustomerSession(updated);
  };

  const handleRemoveWishlist = (pId: string) => {
    if (!customer) return;
    const wishlist = (customer.wishlist || []).filter(id => id !== pId);
    const updated = {
      ...customer,
      wishlist
    };

    const customers = db.getCustomers();
    db.saveCustomers(customers.map(c => c.id === customer.id ? updated : c));
    db.setCustomerSession(updated);
  };

  const addSpecificToCart = (p: Product) => {
    const updatedCart = [...cartItems, p];
    setCartItems(updatedCart);
    localStorage.setItem("grativa_cart_items", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("grativa_db_update"));
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen flex flex-col font-sans text-stone-800" style={D}>
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

      <main className="flex-grow pt-24 md:pt-32 pb-24 max-w-[1200px] mx-auto px-6 lg:px-10 w-full">
        {!customer ? (
          /* LOGIN OR REGISTER CARD */
          <div className="max-w-[450px] mx-auto bg-white border border-black/5 p-8 md:p-10 shadow-lg rounded-sm">
            <div className="flex border-b border-black/5 mb-8">
              <button
                onClick={() => { setIsLogin(true); setMagicSent(false); }}
                className={`flex-1 pb-4 text-[10px] tracking-[0.25em] uppercase font-bold text-center border-b-2 transition-all ${isLogin ? "border-[#C9A96E] text-stone-900" : "border-transparent text-stone-400 hover:text-stone-700"}`}
                style={R}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-4 text-[10px] tracking-[0.25em] uppercase font-bold text-center border-b-2 transition-all ${!isLogin ? "border-[#C9A96E] text-stone-900" : "border-transparent text-stone-400 hover:text-stone-700"}`}
                style={R}
              >
                Create Account
              </button>
            </div>

            {isLogin ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Client Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                    placeholder="client@email.com"
                  />
                </div>

                {loginMethod === "password" ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] font-bold" style={R}>Client Security Password</label>
                      <button 
                        type="button" 
                        onClick={() => setLoginMethod("magic")}
                        className="text-[9px] text-[#C9A96E] hover:underline"
                        style={R}
                      >
                        Use Magic Code Instead
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] font-bold" style={R}>Security OTP / Magic Code</label>
                      <button 
                        type="button" 
                        onClick={() => { setLoginMethod("password"); setMagicSent(false); }}
                        className="text-[9px] text-[#C9A96E] hover:underline"
                        style={R}
                      >
                        Use Password Instead
                      </button>
                    </div>
                    {magicSent ? (
                      <input
                        type="text"
                        required
                        value={magicCode}
                        onChange={(e) => setMagicCode(e.target.value)}
                        className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs tracking-wider font-mono text-center transition-colors"
                        placeholder="Enter Code (123456)"
                      />
                    ) : (
                      <p className="text-[11px] text-[#8C7E6E] leading-relaxed font-light">
                        We will dispatch a secure one-time passcode verification to your coordinates.
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#1A1714] text-white py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#C9A96E] transition-all duration-400"
                  style={R}
                >
                  {loginMethod === "magic" && !magicSent ? "Send Security Code" : "Authenticate Session"}
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Client Full Name</label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                    placeholder="Enter Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Email coordinates</label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                    placeholder="client@email.com"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Phone Coordinates</label>
                  <input
                    type="tel"
                    required
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Security Password</label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                    placeholder="Set Account Password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1714] text-white py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#C9A96E] transition-all duration-400"
                  style={R}
                >
                  Register Account Coordinates
                </button>
              </form>
            )}
          </div>
        ) : (
          /* CLIENT DASHBOARD PANEL */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column Sidebar Info */}
            <div className="lg:col-span-4 bg-white border border-black/5 p-8 shadow-sm">
              <div className="text-center pb-6 border-b border-black/5 mb-6">
                <div className="w-16 h-16 bg-[#EDE6DA] text-[#C9A96E] rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 shadow-inner">
                  <User size={24} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-normal text-stone-900" style={F}>{customer.name}</h3>
                <span className="inline-block mt-2 text-[9px] tracking-[0.2em] bg-[#1A1714] text-[#FAF8F4] px-3 py-1 font-semibold uppercase" style={R}>
                  {customer.tier} Client
                </span>
                <p className="text-[10px] text-stone-400 mt-2">Atelier Member Since {customer.joinedDate}</p>
              </div>

              <nav className="flex flex-col gap-2.5">
                {[
                  { id: "profile", label: "Client Coordinates & Address", icon: MapPin },
                  { id: "orders", label: "Acquisitions Archive", icon: Package, badge: clientOrders.length },
                  { id: "wishlist", label: "Saved Atelier Wishlist", icon: Heart, badge: wishlistProducts.length },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between text-left py-3 px-4 text-xs font-semibold hover:bg-stone-50 border transition-all ${activeTab === item.id ? "border-[#C9A96E] bg-stone-50/50 text-[#C9A96E]" : "border-transparent text-stone-600 hover:text-stone-900"}`}
                      style={R}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={14} className="flex-shrink-0" />
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-[#1A1714] text-white text-[9px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 text-left py-3 px-4 text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent rounded-sm mt-4 transition-colors"
                  style={R}
                >
                  <LogOut size={14} />
                  Terminate Session
                </button>
              </nav>
            </div>

            {/* Right Main Content Tabs */}
            <div className="lg:col-span-8 bg-white border border-black/5 p-8 shadow-sm">
              
              {/* TAB 1: Profile Coordinates */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl text-stone-900 font-normal mb-1.5" style={F}>Client Profile Coordinates</h2>
                    <p className="text-xs text-[#8C7E6E]">Manage your personal validation profile records.</p>
                    <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Account Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-black/10 px-4 py-2.5 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full border border-black/10 px-4 py-2.5 bg-white outline-none focus:border-[#C9A96E] text-xs transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2 pt-2 text-right">
                        <button
                          type="submit"
                          className="bg-[#1A1714] text-white hover:bg-[#C9A96E] text-[9px] uppercase tracking-widest font-bold px-6 py-2.5 transition-colors"
                          style={R}
                        >
                          Save Profile Changes
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="border-t border-black/5 pt-8">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg text-stone-900 font-normal" style={F}>Saved Addresses</h3>
                        <p className="text-xs text-[#8C7E6E]">Used for complimentary premium shipping coordination.</p>
                      </div>
                      {!showAddressForm && (
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="border border-[#1A1714]/25 hover:border-[#1A1714] text-[#1A1714] px-4 py-2 text-[9px] uppercase tracking-widest font-bold hover:bg-stone-50 transition-colors flex items-center gap-1.5"
                          style={R}
                        >
                          <Plus size={12} />
                          Add Address
                        </button>
                      )}
                    </div>

                    {showAddressForm && (
                      <form onSubmit={handleAddAddress} className="bg-stone-50 border border-black/5 p-6 mb-6 space-y-4">
                        <h4 className="text-xs uppercase tracking-wider text-stone-800 font-bold border-b border-stone-200 pb-2" style={R}>Add New Shipping Coordinates</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Address Label</label>
                            <input
                              type="text"
                              required
                              value={addrName}
                              onChange={(e) => setAddrName(e.target.value)}
                              className="w-full border border-black/10 px-3 py-2 bg-white text-xs outline-none focus:border-[#C9A96E]"
                              placeholder="e.g. Home, Office"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Street Address</label>
                            <input
                              type="text"
                              required
                              value={addrStreet}
                              onChange={(e) => setAddrStreet(e.target.value)}
                              className="w-full border border-black/10 px-3 py-2 bg-white text-xs outline-none focus:border-[#C9A96E]"
                              placeholder="House details, block, road"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>City</label>
                            <input
                              type="text"
                              required
                              value={addrCity}
                              onChange={(e) => setAddrCity(e.target.value)}
                              className="w-full border border-black/10 px-3 py-2 bg-white text-xs outline-none focus:border-[#C9A96E]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>State</label>
                            <input
                              type="text"
                              required
                              value={addrState}
                              onChange={(e) => setAddrState(e.target.value)}
                              className="w-full border border-black/10 px-3 py-2 bg-white text-xs outline-none focus:border-[#C9A96E]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>ZIP / Postal Code</label>
                            <input
                              type="text"
                              required
                              value={addrZip}
                              onChange={(e) => setAddrZip(e.target.value)}
                              className="w-full border border-black/10 px-3 py-2 bg-white text-xs outline-none focus:border-[#C9A96E]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1 font-bold" style={R}>Country</label>
                            <input
                              type="text"
                              required
                              value={addrCountry}
                              onChange={(e) => setAddrCountry(e.target.value)}
                              className="w-full border border-black/10 px-3 py-2 bg-white text-xs outline-none focus:border-[#C9A96E]"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="text-stone-400 hover:text-stone-600 text-[9px] uppercase tracking-widest font-semibold px-4 py-2"
                            style={R}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-[#1A1714] text-white hover:bg-[#C9A96E] text-[9px] uppercase tracking-widest font-bold px-6 py-2 transition-colors"
                            style={R}
                          >
                            Save Coordinates
                          </button>
                        </div>
                      </form>
                    )}

                    {customer.addresses && customer.addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customer.addresses.map((a) => (
                          <div key={a.id} className="border border-black/5 p-5 relative rounded-sm bg-white shadow-sm flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-[#C9A96E] font-bold" style={R}>{a.name}</span>
                              <p className="text-xs text-stone-700 mt-2 leading-relaxed font-light">{a.street}</p>
                              <p className="text-xs text-stone-600 font-light">{a.city}, {a.state} - {a.zip}</p>
                              <p className="text-[10px] text-stone-400 tracking-wider mt-1">{a.country}</p>
                            </div>
                            <div className="text-right mt-4">
                              <button
                                onClick={() => handleDeleteAddress(a.id)}
                                className="text-red-400 hover:text-red-600 text-xs transition-colors flex items-center gap-1.5 ml-auto"
                              >
                                <Trash2 size={12} />
                                <span className="text-[10px] tracking-wider uppercase font-semibold" style={R}>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-stone-200 text-[#8C7E6E] text-xs">
                        No delivery coordinates cataloged yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Orders Acquisitions */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl text-stone-900 font-normal mb-1.5" style={F}>Acquisitions Archive</h2>
                    <p className="text-xs text-[#8C7E6E]">Chronological log of orders settled with our ateliers.</p>
                  </div>

                  {clientOrders.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-stone-200 text-[#8C7E6E] text-xs space-y-4">
                      <p>No transactions registered under this client session.</p>
                      <Link to="/" className="inline-block bg-[#1A1714] text-white text-[9px] tracking-widest uppercase font-bold px-6 py-3 hover:bg-[#C9A96E] transition-colors" style={R}>
                        Browse Catalogue
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {clientOrders.map((order) => (
                        <div key={order.id} className="border border-black/5 bg-[#FAF8F4]/30 rounded-sm p-6 shadow-sm">
                          {/* Order top banner */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 border-b border-black/5 pb-4 mb-4">
                            <div>
                              <h3 className="text-sm font-semibold font-mono text-stone-800">{order.id}</h3>
                              <p className="text-[10px] text-stone-400 mt-1">Acquired on {order.date}</p>
                            </div>
                            <div className="flex items-center gap-3.5">
                              <span className="text-xs font-semibold text-stone-900" style={R}>{fmtPrice(order.amount)}</span>
                              <span className={`text-[9px] uppercase tracking-wider px-3 py-1 font-bold font-sans ${order.status === "delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : (order.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-200" : "bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20")}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Items listing */}
                          <div className="space-y-2 mb-4">
                            {order.productNames ? (
                              order.productNames.map((name, i) => (
                                <p key={i} className="text-xs text-stone-700 font-light flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
                                  {name}
                                </p>
                              ))
                            ) : (
                              <p className="text-xs text-stone-400 italic">Product listings archived.</p>
                            )}
                          </div>

                          {/* Shipping coordinates inside order */}
                          {order.shippingAddress && (
                            <div className="text-[10px] text-[#8C7E6E] border-t border-black/5 pt-3 mt-3 flex flex-col sm:flex-row justify-between gap-2.5 leading-relaxed">
                              <div>
                                <span className="font-semibold block mb-0.5 text-stone-700">Delivery Address:</span>
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                              </div>
                              {order.paymentId && (
                                <div className="font-mono text-[9px] self-end sm:self-start bg-stone-50 border border-stone-200 px-2 py-0.5">
                                  TxID: {order.paymentId}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Wishlist items */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl text-stone-900 font-normal mb-1.5" style={F}>Atelier Wishlist</h2>
                    <p className="text-xs text-[#8C7E6E]">Curated designs preserved for future consideration.</p>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-stone-200 text-[#8C7E6E] text-xs">
                      No products preserved in wishlist coordinates.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {wishlistProducts.map((p) => (
                        <div key={p.id} className="border border-black/5 bg-white p-4 shadow-sm flex gap-4 group rounded-sm hover:border-[#C9A96E]/20 transition-all">
                          <div className="w-20 h-24 bg-[#EDE6DA] overflow-hidden flex-shrink-0 border border-black/5">
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-semibold text-stone-800" style={F}>{p.name}</h4>
                              <p className="text-[10px] text-stone-400 mt-0.5">{p.color} · {fmtPrice(p.price)}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <Link
                                to={`/product/${p.id}`}
                                className="text-[9px] uppercase tracking-widest text-[#C9A96E] font-bold hover:underline"
                                style={R}
                              >
                                View Specs
                              </Link>
                              <button
                                onClick={() => handleRemoveWishlist(p.id)}
                                className="text-stone-300 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      <Footer footer={db.getHomepage().footer} />
    </div>
  );
}
