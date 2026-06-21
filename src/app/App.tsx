import React from "react";
import { Routes, Route, Navigate } from "react-router";
import Shop from "./pages/Shop";
import Journal from "./pages/Journal";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import { PaymentSuccess, PaymentFailed } from "./pages/PaymentStatus";

// ─── 404 NOT FOUND PAGE ───────────────────────────────────────────────────────

function NotFound() {
  const F = { fontFamily: "'Playfair Display', Georgia, serif" as const };
  const R = { fontFamily: "'Raleway', system-ui, sans-serif" as const };
  const D = { fontFamily: "'DM Sans', system-ui, sans-serif" as const };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center p-6 text-center" style={D}>
      <span className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4" style={R}>ERROR 404</span>
      <h1 className="text-4xl md:text-5xl text-[#1A1714] font-normal mb-4" style={F}>Lost in Refinement</h1>
      <div className="h-[1px] w-12 bg-[#C9A96E] mb-6" />
      <p className="text-sm text-[#8C7E6E] max-w-xs mx-auto leading-relaxed mb-8" style={{ fontWeight: 300 }}>
        The page you are seeking does not exist in the GRATIVA catalogue. It may have been retired to the archives.
      </p>
      <a
        href="/"
        className="bg-[#1A1714] text-white text-[10px] tracking-[0.3em] uppercase px-8 py-4 hover:bg-[#C9A96E] transition-all duration-300"
        style={R}
      >
        Return to Storefront
      </a>
    </div>
  );
}

// ─── APP COMPONENT ────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Customer / Public Routes */}
      <Route path="/" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/account" element={<Account />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/journal/:slug" element={<Journal />} />
      
      {/* E-Commerce Blog Legacy Route Redirects */}
      <Route path="/blog" element={<Navigate to="/journal" replace />} />
      <Route path="/blog/:slug" element={<Navigate to="/journal/:slug" replace />} />

      {/* Administrative Routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminDashboard />} />
      <Route path="/admin/categories" element={<AdminDashboard />} />
      <Route path="/admin/orders" element={<AdminDashboard />} />
      <Route path="/admin/clientele" element={<AdminDashboard />} />
      <Route path="/admin/homepage" element={<AdminDashboard />} />
      <Route path="/admin/journal" element={<AdminDashboard />} />
      <Route path="/admin/media" element={<AdminDashboard />} />
      <Route path="/admin/seo" element={<AdminDashboard />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
