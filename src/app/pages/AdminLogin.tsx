import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Check, AlertCircle, Sparkles, Key, ExternalLink, X } from "lucide-react";
import { db } from "../utils/db";

const F = { fontFamily: "'Playfair Display', Georgia, serif" as const };
const R = { fontFamily: "'Raleway', system-ui, sans-serif" as const };
const D = { fontFamily: "'DM Sans', system-ui, sans-serif" as const };

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [simulatedMail, setSimulatedMail] = useState<{ token: string; link: string } | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Validate email address
  const ADMIN_EMAIL = "mishrakrishna893@gmail.com";

  // Check token in URL on load
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setLoading(true);
      // Verify token
      const storedTokenData = localStorage.getItem("grativa_admin_pending_token");
      if (storedTokenData) {
        try {
          const { token: savedToken, expiry } = JSON.parse(storedTokenData);
          if (token === savedToken && Date.now() < expiry) {
            setTimeout(() => {
              db.setAdminSession(ADMIN_EMAIL);
              localStorage.removeItem("grativa_admin_pending_token");
              setLoading(false);
              navigate("/admin/dashboard");
            }, 1500); // Elegant verification delay
            return;
          }
        } catch (e) {
          console.error("Failed to parse admin pending token:", e);
        }
      }
      setLoading(false);
      setError("Invalid or expired magic link. Please request a new one.");
    }
  }, [searchParams, navigate]);

  // Check if already logged in
  useEffect(() => {
    if (db.getAdminSession()) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSimulatedMail(null);

    const enteredEmail = email.trim().toLowerCase();
    if (!enteredEmail) {
      setError("Please enter your administrator email.");
      return;
    }

    if (enteredEmail !== ADMIN_EMAIL) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setError("Access denied. Unauthorized administrator email.");
      }, 800);
      return;
    }

    // Success flow - generate magic token
    setLoading(true);
    setTimeout(() => {
      const token = `token_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

      // Save pending token in localStorage
      localStorage.setItem("grativa_admin_pending_token", JSON.stringify({ token, expiry }));

      setLoading(false);
      setSuccess(true);

      // Create simulated link (Vite defaults to window.location.origin)
      const origin = window.location.origin;
      const magicLink = `${origin}/admin?token=${token}`;

      // Open Mail Simulation
      setSimulatedMail({
        token,
        link: magicLink,
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#120F0C] text-white flex flex-col justify-between relative overflow-hidden" style={D}>
      {/* Background Decorative Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C9A96E]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#C9A96E]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border border-[#C9A96E]/5 rounded-full pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-8 flex justify-between items-center z-10">
        <Link to="/" className="text-[10px] tracking-[0.25em] uppercase text-white/55 hover:text-[#C9A96E] transition-colors" style={R}>
          ← Storefront
        </Link>
        <span className="text-xl tracking-[0.3em] font-light text-[#C9A96E]" style={F}>GRATIVA</span>
        <div className="w-16" /> {/* Balance */}
      </header>

      {/* Content Form */}
      <main className="flex items-center justify-center px-6 z-10">
        <div className="w-full max-w-md bg-[#1E1A16]/80 backdrop-blur-md border border-[#C9A96E]/20 p-8 md:p-10 shadow-2xl relative">
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/50 to-transparent" />
          
          <AnimatePresence mode="wait">
            {loading && !searchParams.get("token") ? (
              /* SENDING MAGIC LINK LOADING STATE */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-10"
                key="loading"
              >
                <div className="w-12 h-12 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-lg text-[#C9A96E] font-normal mb-2" style={F}>Generating Security Token</h3>
                <p className="text-xs text-white/50" style={D}>Establishing secure administrative channel...</p>
              </motion.div>
            ) : loading && searchParams.get("token") ? (
              /* VERIFYING MAGIC LINK STATE */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-10"
                key="verifying"
              >
                <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-lg text-emerald-400 font-normal mb-2" style={F}>Verifying Magic Token</h3>
                <p className="text-xs text-white/50" style={D}>Decrypting credentials and signing in as Administrator...</p>
              </motion.div>
            ) : success ? (
              /* SUCCESS STATE */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
                key="success"
              >
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-xl font-normal text-white mb-3" style={F}>Magic Link Dispatched</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-6" style={D}>
                  A secure magic link has been generated for your session. Since this is a local setup, please use the simulator console below to sign in.
                </p>
                <button
                  onClick={() => { setSuccess(false); setSimulatedMail(null); }}
                  className="text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] hover:underline"
                  style={R}
                >
                  Request Another Link
                </button>
              </motion.div>
            ) : (
              /* LOGIN FORM */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="form"
              >
                <div className="text-center mb-8">
                  <div className="w-10 h-10 border border-[#C9A96E]/30 flex items-center justify-center mx-auto mb-4 bg-[#120F0C]">
                    <Key size={16} className="text-[#C9A96E]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-normal" style={F}>Atelier Portal</h2>
                  <p className="text-xs text-white/40 mt-2" style={D}>Authorized access for GRATIVA administration.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[9px] tracking-[0.2em] uppercase text-white/50 mb-2.5" style={R}>
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. name@company.com"
                        className="w-full bg-[#120F0C] border border-[#C9A96E]/15 focus:border-[#C9A96E] px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-colors"
                        style={D}
                      />
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={15} />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-400">
                      <AlertCircle className="flex-shrink-0 mt-0.5" size={14} />
                      <span style={D}>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#C9A96E] text-[#120F0C] py-4 text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-[#120F0C] transition-all duration-300 font-semibold"
                    style={R}
                  >
                    Send Magic Link
                  </button>
                </form>

                <div className="mt-8 border-t border-white/5 pt-6 text-center">
                  <p className="text-[10px] text-white/30" style={D}>
                    No credentials required. Magic link logs in automatically.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Simulated Email Inbox (Bottom Right Drawer) */}
      <AnimatePresence>
        {simulatedMail && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-6 right-6 w-full max-w-sm bg-white text-[#1A1714] shadow-2xl border-2 border-[#C9A96E] z-50 overflow-hidden"
            style={D}
          >
            {/* Header of simulated email client */}
            <div className="bg-[#1A1714] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={R}>GRATIVA Mail Delivery Simulator</span>
              </div>
              <button 
                onClick={() => setSimulatedMail(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            {/* Body of simulated email client */}
            <div className="p-5 space-y-4 text-left">
              <div className="border-b border-black/8 pb-3 text-xs space-y-1">
                <p><span className="font-semibold text-stone-500">From:</span> authentication@grativa.in</p>
                <p><span className="font-semibold text-stone-500">To:</span> mishrakrishna893@gmail.com</p>
                <p><span className="font-semibold text-stone-500">Subject:</span> Log in to your GRATIVA Admin Account</p>
              </div>

              <div className="py-2 text-xs space-y-3 font-light leading-relaxed">
                <p>Hello,</p>
                <p>Use the secure button below to log in as Administrator. This link is valid for 15 minutes and can only be used once.</p>
                
                {/* CTA Link Button */}
                <div className="py-2.5 text-center">
                  <a
                    href={simulatedMail.link}
                    className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#1A1714] text-white text-[10px] tracking-[0.2em] uppercase font-semibold px-6 py-3 transition-colors shadow"
                    style={R}
                  >
                    Login as Administrator <ExternalLink size={11} />
                  </a>
                </div>

                <p className="text-[10px] text-stone-400">
                  If the button does not work, copy and paste this URL into your browser:<br />
                  <span className="break-all font-mono text-[9px] text-[#C9A96E] bg-stone-50 p-1 border border-stone-200 block mt-1">
                    {simulatedMail.link}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-6 text-center text-[10px] text-white/20 z-10" style={D}>
        <p>© {new Date().getFullYear()} GRATIVA. Secured Access Portal.</p>
      </footer>
    </div>
  );
}
