import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  BarChart2, Package, ShoppingCart, Users, Image as ImageIcon, Layers, Tag,
  Clock, Sparkles, LogOut, Bell, Plus, Edit, Trash2, Eye, Download, Check, X,
  Globe, BookOpen, AlertCircle, FileText, ChevronRight, Upload, Menu, Copy
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { db, type Product, type Category, type Order, type Customer, type Blog, type HomepageContent, type SeoSettings } from "../utils/db";

const F = { fontFamily: "'Playfair Display', Georgia, serif" as const };
const R = { fontFamily: "'Raleway', system-ui, sans-serif" as const };
const D = { fontFamily: "'DM Sans', system-ui, sans-serif" as const };

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const STATUS_STYLE: Record<Order["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  packed: "bg-purple-50 text-purple-700 border border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};

const TIER_STYLE: Record<Customer["tier"], string> = {
  standard: "bg-stone-100 text-stone-600",
  gold: "bg-amber-50 text-amber-700",
  vip: "bg-purple-50 text-purple-700",
};

// ─── ERROR BOUNDARY COMPONENT ────────────────────────────────────────────────

class AdminDashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#120F0C] text-white flex flex-col items-center justify-center p-8 text-center" style={D}>
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <h1 className="text-2xl font-serif text-white mb-2" style={F}>Dashboard Failed To Load</h1>
          <p className="text-xs text-[#C9A96E] uppercase tracking-widest mb-6" style={R}>Critical System Exception</p>
          
          <div className="w-full max-w-lg bg-black/40 border border-red-500/20 p-5 rounded font-mono text-left text-xs text-red-400 overflow-x-auto mb-8 whitespace-pre-wrap leading-relaxed">
            <strong>Error Message:</strong> {this.state.error?.message || "Unknown rendering exception"}
            <br /><br />
            <strong>Stack Trace:</strong>
            <span className="text-white/60 block mt-2 text-[10px] max-h-48 overflow-y-auto font-mono select-text">
              {this.state.error?.stack}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-red-600 text-white text-[10px] tracking-widest uppercase px-6 py-3 font-semibold hover:bg-red-700 transition-colors"
              style={R}
            >
              Clear Storage & Reset
            </button>
            <button
              onClick={() => window.location.reload()}
              className="border border-white/20 text-white text-[10px] tracking-widest uppercase px-6 py-3 font-semibold hover:bg-white hover:text-[#120F0C] transition-all"
              style={R}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── MAIN DASHBOARD MODULE ────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const getSectionFromPath = (path: string) => {
    if (path.includes("/admin/products")) return "products";
    if (path.includes("/admin/categories")) return "categories";
    if (path.includes("/admin/orders")) return "orders";
    if (path.includes("/admin/clientele")) return "customers";
    if (path.includes("/admin/homepage")) return "homepage";
    if (path.includes("/admin/journal")) return "blogs";
    if (path.includes("/admin/media")) return "media";
    if (path.includes("/admin/seo")) return "seo";
    return "overview";
  };

  const section = getSectionFromPath(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  const navigateToSection = (sec: string) => {
    let path = "/admin/dashboard";
    if (sec === "products") path = "/admin/products";
    else if (sec === "categories") path = "/admin/categories";
    else if (sec === "orders") path = "/admin/orders";
    else if (sec === "customers") path = "/admin/clientele";
    else if (sec === "homepage") path = "/admin/homepage";
    else if (sec === "blogs") path = "/admin/journal";
    else if (sec === "media") path = "/admin/media";
    else if (sec === "seo") path = "/admin/seo";
    navigate(path);
  };

  // Database states with defensive fallbacks
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);

  // Modals and Forms State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", subtitle: "", description: "", longDescription: "", category: "",
    price: "", comparePrice: "", inventory: "", sku: "", status: "active" as Product["status"],
    featured: false, bestseller: false, newArrival: false, luxuryBadge: "",
    images: [] as string[], galleryImages: [] as string[], thumbnail: "",
    seoTitle: "", seoDescription: "", seoKeywords: ""
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "", title: "", description: "", bannerImage: "", heroImage: ""
  });

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "", subtitle: "", excerpt: "", content: "", featuredImage: "", author: "", category: "Journal",
    metaTitle: "", metaDescription: "", keywords: "", status: "published" as "published" | "draft",
    publishDate: ""
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Media Manager specific states
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaFilterType, setMediaFilterType] = useState<"all" | "base64" | "unsplash">("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Authentication gate
  useEffect(() => {
    const adminSession = db.getAdminSession();
    if (!adminSession) {
      navigate("/admin");
    } else {
      loadAllData();
    }
  }, [navigate]);

  const loadAllData = () => {
    try {
      const dbProducts = db.getProducts() || [];
      const dbCategories = db.getCategories() || [];
      const dbOrders = db.getOrders() || [];
      const dbCustomers = db.getCustomers() || [];
      const dbBlogs = db.getBlogs() || [];
      const dbHomepage = db.getHomepage();
      const dbSeo = db.getSeo();

      setProducts(dbProducts);
      setCategories(dbCategories);
      setOrders(dbOrders);
      setCustomers(dbCustomers);
      setBlogs(dbBlogs);
      setHomepage(dbHomepage);
      setSeo(dbSeo);
      
      // Assemble media library from current product, blog, difference, coming soon images
      const assetsSet = new Set<string>();
      
      // Defensive mappings for media assets compilation
      dbProducts?.forEach(p => {
        if (Array.isArray(p?.images)) {
          p.images.forEach(img => img && assetsSet.add(img));
        }
      });
      
      dbBlogs?.forEach(b => {
        if (b?.featuredImage) assetsSet.add(b.featuredImage);
      });
      
      if (dbHomepage?.hero?.images) {
        dbHomepage.hero.images.forEach(img => img && assetsSet.add(img));
      }
      
      if (dbHomepage?.difference?.features) {
        dbHomepage.difference.features.forEach(f => {
          if (f?.image) assetsSet.add(f.image);
        });
      }
      
      if (dbHomepage?.comingSoon?.categories) {
        dbHomepage.comingSoon.categories.forEach(c => {
          if (c?.image) assetsSet.add(c.image);
        });
      }

      // Load any base64 images from custom media storage safely
      const customMedia = localStorage.getItem("grativa_custom_media");
      if (customMedia) {
        try {
          const parsedMedia = JSON.parse(customMedia);
          if (Array.isArray(parsedMedia)) {
            parsedMedia.forEach((img: string) => img && assetsSet.add(img));
          }
        } catch (err) {
          console.error("Failed to parse custom media library assets:", err);
        }
      }

      setMediaLibrary(Array.from(assetsSet));
    } catch (e) {
      console.error("loadAllData failed:", e);
    }
  };

  const handleLogout = () => {
    db.clearAdminSession();
    navigate("/admin");
  };

  // ─── PRODUCT ACTIONS ────────────────────────────────────────────────────────

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "", subtitle: "", description: "", longDescription: "", category: categories?.[0]?.name || "Handbags",
      price: "", comparePrice: "", inventory: "10", sku: `GRT-${Date.now().toString().slice(-6)}`, status: "active",
      featured: false, bestseller: false, newArrival: false, luxuryBadge: "",
      images: [], galleryImages: [], thumbnail: "",
      seoTitle: "", seoDescription: "", seoKeywords: ""
    });
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p?.name || "",
      subtitle: p?.subtitle || "",
      description: p?.description || "",
      longDescription: p?.longDescription || "",
      price: String(p?.price || ""),
      comparePrice: p?.comparePrice ? String(p.comparePrice) : "",
      category: p?.category || categories?.[0]?.name || "Handbags",
      inventory: String(p?.inventory ?? 10),
      sku: p?.sku || "",
      status: p?.status || "active",
      featured: p?.featured || false,
      bestseller: p?.bestseller || false,
      newArrival: p?.newArrival || false,
      luxuryBadge: p?.luxuryBadge || "",
      images: Array.isArray(p?.images) ? p.images : [],
      galleryImages: Array.isArray(p?.galleryImages) ? p.galleryImages : [],
      thumbnail: p?.thumbnail || "",
      seoTitle: p?.seoTitle || "",
      seoDescription: p?.seoDescription || "",
      seoKeywords: p?.seoKeywords || ""
    });
    setShowProductModal(true);
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      alert("Name, Price, and Category are required.");
      return;
    }

    const price = parseInt(productForm.price) || 0;
    const comparePrice = productForm.comparePrice ? parseInt(productForm.comparePrice) : undefined;
    const inventory = parseInt(productForm.inventory) || 0;

    const newProduct: Product = {
      id: editingProduct?.id || `product-${Date.now()}`,
      name: productForm.name,
      subtitle: productForm.subtitle,
      description: productForm.description,
      longDescription: productForm.longDescription,
      price,
      comparePrice,
      category: productForm.category,
      inventory,
      sku: productForm.sku || `GRT-PROD-${Date.now()}`,
      status: productForm.status,
      featured: productForm.featured,
      bestseller: productForm.bestseller,
      newArrival: productForm.newArrival,
      luxuryBadge: productForm.luxuryBadge,
      images: productForm.images.length > 0 ? productForm.images : ["https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format"],
      galleryImages: productForm.galleryImages,
      thumbnail: productForm.thumbnail || productForm.images[0] || "",
      color: editingProduct?.color || "Ivory",
      colorHex: editingProduct?.colorHex || "#C9A96E",
      inStock: inventory > 0,
      seoTitle: productForm.seoTitle,
      seoDescription: productForm.seoDescription,
      seoKeywords: productForm.seoKeywords
    };

    let updatedProducts = [];
    if (editingProduct) {
      updatedProducts = products.map(p => p.id === newProduct.id ? newProduct : p);
    } else {
      updatedProducts = [newProduct, ...products];
    }

    db.saveProducts(updatedProducts);
    loadAllData();
    setShowProductModal(false);
  };

  const deleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter(p => p.id !== id);
      db.saveProducts(updated);
      loadAllData();
    }
  };

  const toggleProductStatus = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        const newStatus: Product["status"] = p.status === "active" ? "draft" : "active";
        return { ...p, status: newStatus };
      }
      return p;
    });
    db.saveProducts(updated);
    loadAllData();
  };

  const archiveProduct = (id: string) => {
    const updated = products.map(p => p.id === id ? { ...p, status: "archived" as const } : p);
    db.saveProducts(updated);
    loadAllData();
  };

  const duplicateProduct = (p: Product) => {
    const newProduct: Product = {
      ...p,
      id: `product-${Date.now()}`,
      name: `${p.name} (Copy)`,
      sku: p.sku ? `${p.sku}-COPY` : `GRT-PROD-${Date.now()}`,
      status: "draft"
    };
    db.saveProducts([newProduct, ...products]);
    loadAllData();
    alert(`Duplicated ${p.name} to draft catalogue!`);
  };

  const toggleBlogStatus = (id: string) => {
    const updated = blogs.map(b => {
      if (b.id === id) {
        const newStatus = b.status === "published" ? "draft" : "published";
        return { ...b, status: newStatus as "published" | "draft" };
      }
      return b;
    });
    db.saveBlogs(updated);
    loadAllData();
  };

  // ─── CATEGORY ACTIONS ───────────────────────────────────────────────────────

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", title: "", description: "", bannerImage: "", heroImage: "" });
    setShowCategoryModal(true);
  };

  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryForm({
      name: c?.name || "",
      title: c?.title || "",
      description: c?.description || "",
      bannerImage: c?.bannerImage || "",
      heroImage: c?.heroImage || ""
    });
    setShowCategoryModal(true);
  };

  const saveCategory = () => {
    if (!categoryForm.name.trim()) return;

    const slug = categoryForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCat: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: categoryForm.name.trim(),
      slug,
      title: categoryForm.title || categoryForm.name.trim(),
      description: categoryForm.description,
      bannerImage: categoryForm.bannerImage || "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=1200&h=400&fit=crop&auto=format",
      heroImage: categoryForm.heroImage || "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format"
    };

    let updated = [];
    if (editingCategory) {
      updated = categories.map(c => c.id === newCat.id ? newCat : c);
      
      const oldName = editingCategory.name;
      if (oldName !== newCat.name) {
        const updatedProducts = products.map(p => p.category === oldName ? { ...p, category: newCat.name } : p);
        db.saveProducts(updatedProducts);
      }
    } else {
      updated = [...categories, newCat];
    }

    db.saveCategories(updated);
    loadAllData();
    setShowCategoryModal(false);
  };

  const deleteCategory = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const updated = categories.filter(c => c.id !== id);
      db.saveCategories(updated);
      loadAllData();
    }
  };

  // ─── ORDER ACTIONS ──────────────────────────────────────────────────────────

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    db.saveOrders(updated);
    loadAllData();
  };

  // ─── CUSTOMER ACTIONS ───────────────────────────────────────────────────────

  const viewCustomerOrders = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const exportCustomersCSV = () => {
    try {
      const headers = "Customer ID,Name,Email,Orders Count,Total Spent,Tier,Joined Date\n";
      const rows = (customers || []).map(c => 
        `"${c?.id || ""}","${c?.name || ""}","${c?.email || ""}",${c?.ordersCount || 0},${c?.totalSpent || 0},"${c?.tier || "standard"}","${c?.joinedDate || ""}"`
      ).join("\n");
      
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `grativa_clientele_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Failed to export Clientele data: " + (e as Error).message);
    }
  };

  const exportOrdersCSV = () => {
    try {
      const headers = "Order ID,Customer Name,Customer Email,Products,Total Amount,Status,Order Date,Payment ID\n";
      const rows = (orders || []).map(o => 
        `"${o?.id || ""}","${o?.customerName || ""}","${o?.customerEmail || ""}","${(o?.productNames || []).join(" | ")}",${o?.amount || 0},"${o?.status || "pending"}","${o?.date || ""}","${o?.paymentId || ""}"`
      ).join("\n");
      
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `grativa_orders_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Failed to export Orders data: " + (e as Error).message);
    }
  };

  // ─── HOMEPAGE BANNERS & CMS ──────────────────────────────────────────────────

  const handleHeroSave = (heroData: HomepageContent["hero"]) => {
    if (!homepage) return;
    const updated: HomepageContent = { ...homepage, hero: heroData };
    db.saveHomepage(updated);
    loadAllData();
    alert("Hero Settings saved successfully!");
  };

  const handleDifferenceSave = (diffData: HomepageContent["difference"]) => {
    if (!homepage) return;
    const updated: HomepageContent = { ...homepage, difference: diffData };
    db.saveHomepage(updated);
    loadAllData();
    alert("GRATIVA Difference Settings saved successfully!");
  };

  const handleComingSoonSave = (comingData: HomepageContent["comingSoon"]) => {
    if (!homepage) return;
    const updated: HomepageContent = { ...homepage, comingSoon: comingData };
    db.saveHomepage(updated);
    loadAllData();
    alert("Coming Soon Categories saved successfully!");
  };

  const handleNewsletterFooterSave = (newsData: HomepageContent["newsletter"], footData: HomepageContent["footer"]) => {
    if (!homepage) return;
    const updated: HomepageContent = { 
      ...homepage, 
      newsletter: newsData, 
      footer: footData 
    };
    db.saveHomepage(updated);
    loadAllData();
    alert("Newsletter and Footer settings saved!");
  };

  const handleEmptyStateSave = (emptyStateData: HomepageContent["emptyState"]) => {
    if (!homepage) return;
    const updated: HomepageContent = { ...homepage, emptyState: emptyStateData };
    db.saveHomepage(updated);
    loadAllData();
    alert("Collection Empty State CMS saved successfully!");
  };

  // ─── BLOG ACTIONS ───────────────────────────────────────────────────────────

  const openAddBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: "", subtitle: "", excerpt: "", content: "", featuredImage: "", author: "Atelier Editor", category: "Journal",
      metaTitle: "", metaDescription: "", keywords: "", status: "published",
      publishDate: new Date().toISOString().split("T")[0]
    });
    setShowBlogModal(true);
  };

  const openEditBlog = (b: Blog) => {
    setEditingBlog(b);
    setBlogForm({
      title: b?.title || "",
      subtitle: b?.subtitle || "",
      excerpt: b?.excerpt || "",
      content: b?.content || "",
      featuredImage: b?.featuredImage || "",
      author: b?.author || "Atelier Editor",
      category: b?.category || "Journal",
      metaTitle: b?.metaTitle || "",
      metaDescription: b?.metaDescription || "",
      keywords: b?.keywords || "",
      status: b?.status || "published",
      publishDate: b?.publishDate || b?.date || new Date().toISOString().split("T")[0]
    });
    setShowBlogModal(true);
  };

  const saveBlog = () => {
    if (!blogForm.title || !blogForm.content) {
      alert("Title and Content are required.");
      return;
    }

    const slug = blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newBlog: Blog = {
      id: editingBlog?.id || `blog-${Date.now()}`,
      title: blogForm.title,
      subtitle: blogForm.subtitle,
      slug,
      excerpt: blogForm.excerpt || blogForm.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      content: blogForm.content,
      featuredImage: blogForm.featuredImage || "https://images.unsplash.com/photo-1779398968962-b3ad149b57b6?w=800&h=500&fit=crop",
      author: blogForm.author,
      category: blogForm.category,
      date: editingBlog?.date || new Date().toISOString().split("T")[0],
      publishDate: blogForm.publishDate,
      metaTitle: blogForm.metaTitle || `${blogForm.title} | GRATIVA`,
      metaDescription: blogForm.metaDescription || blogForm.excerpt,
      keywords: blogForm.keywords,
      status: blogForm.status
    };

    let updated = [];
    if (editingBlog) {
      updated = blogs.map(b => b.id === newBlog.id ? newBlog : b);
    } else {
      updated = [newBlog, ...blogs];
    }

    db.saveBlogs(updated);
    loadAllData();
    setShowBlogModal(false);
  };

  const deleteBlog = (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      const updated = blogs.filter(b => b.id !== id);
      db.saveBlogs(updated);
      loadAllData();
    }
  };

  // ─── SEO SETTINGS ACTIONS ────────────────────────────────────────────────────

  const handleSeoSave = (newSeo: SeoSettings) => {
    db.saveSeo(newSeo);
    loadAllData();
    alert("Global SEO settings saved and propagated!");
  };

  // ─── MEDIA ACTIONS ──────────────────────────────────────────────────────────

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          
          const customMedia = localStorage.getItem("grativa_custom_media");
          const mediaList = customMedia ? JSON.parse(customMedia) : [];
          mediaList.push(base64Url);
          localStorage.setItem("grativa_custom_media", JSON.stringify(mediaList));
          
          loadAllData();
          alert("Image uploaded to library!");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Failed to upload media asset: " + (err as Error).message);
    }
  };

  const deleteMediaAsset = (url: string) => {
    if (window.confirm("Are you sure you want to delete this asset from the database? Ensure it is not being used in any product or banner.")) {
      const customMedia = localStorage.getItem("grativa_custom_media");
      if (customMedia) {
        try {
          const mediaList = JSON.parse(customMedia);
          const filtered = mediaList.filter((m: string) => m !== url);
          localStorage.setItem("grativa_custom_media", JSON.stringify(filtered));
          loadAllData();
        } catch (e) {
          console.error("Failed to delete media asset:", e);
        }
      }
    }
  };

  const handleReplaceImage = (oldUrl: string, file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newBase64 = event.target.result as string;

          // 1. Products
          const updatedProducts = (products || []).map(p => {
            let changed = false;
            const images = (p.images || []).map(img => {
              if (img === oldUrl) { changed = true; return newBase64; }
              return img;
            });
            const galleryImages = (p.galleryImages || []).map(img => {
              if (img === oldUrl) { changed = true; return newBase64; }
              return img;
            });
            let thumbnail = p.thumbnail;
            if (thumbnail === oldUrl) { changed = true; thumbnail = newBase64; }
            return changed ? { ...p, images, galleryImages, thumbnail } : p;
          });
          if (updatedProducts.some((p, i) => p !== products[i])) {
            db.saveProducts(updatedProducts);
          }

          // 2. Categories
          const updatedCategories = (categories || []).map(c => {
            let changed = false;
            let bannerImage = c.bannerImage;
            let heroImage = c.heroImage;
            if (bannerImage === oldUrl) { changed = true; bannerImage = newBase64; }
            if (heroImage === oldUrl) { changed = true; heroImage = newBase64; }
            return changed ? { ...c, bannerImage, heroImage } : c;
          });
          if (updatedCategories.some((c, i) => c !== categories[i])) {
            db.saveCategories(updatedCategories);
          }

          // 3. Blogs
          const updatedBlogs = (blogs || []).map(b => {
            let changed = false;
            let featuredImage = b.featuredImage;
            if (featuredImage === oldUrl) { changed = true; featuredImage = newBase64; }
            return changed ? { ...b, featuredImage } : b;
          });
          if (updatedBlogs.some((b, i) => b !== blogs[i])) {
            db.saveBlogs(updatedBlogs);
          }

          // 4. Homepage
          if (homepage) {
            let hpChanged = false;
            const heroImages = (homepage.hero?.images || []).map(img => {
              if (img === oldUrl) { hpChanged = true; return newBase64; }
              return img;
            });
            const features = (homepage.difference?.features || []).map(f => {
              if (f.image === oldUrl) { hpChanged = true; return { ...f, image: newBase64 }; }
              return f;
            });
            const cats = (homepage.comingSoon?.categories || []).map(c => {
              if (c.image === oldUrl) { hpChanged = true; return { ...c, image: newBase64 }; }
              return c;
            });
            let emptyState = homepage.emptyState;
            if (emptyState && emptyState.image === oldUrl) {
              hpChanged = true;
              emptyState = { ...emptyState, image: newBase64 };
            }
            if (hpChanged) {
              db.saveHomepage({
                ...homepage,
                hero: { ...homepage.hero, images: heroImages },
                difference: { ...homepage.difference, features },
                comingSoon: { ...homepage.comingSoon, categories: cats },
                emptyState
              });
            }
          }

          // 5. Custom Media
          const customMediaStr = localStorage.getItem("grativa_custom_media");
          if (customMediaStr) {
            try {
              const customMedia = JSON.parse(customMediaStr);
              if (Array.isArray(customMedia)) {
                const updatedCM = customMedia.map((m: string) => m === oldUrl ? newBase64 : m);
                localStorage.setItem("grativa_custom_media", JSON.stringify(updatedCM));
              }
            } catch (e) {
              console.error(e);
            }
          }

          loadAllData();
          alert("Image successfully replaced across all items!");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Failed to replace media asset: " + (err as Error).message);
    }
  };

  // ─── DEFENSIVE CALCULATION OF LISTS & METRICS ─────────────────────────────────

  const safeProducts = products || [];
  const safeOrders = orders || [];
  const safeCustomers = customers || [];
  const safeCategories = categories || [];
  const safeBlogs = blogs || [];

  const stats = {
    revenue: safeOrders.filter(o => o?.status === "delivered").reduce((sum, o) => sum + (o?.amount || 0), 0),
    totalOrders: safeOrders.length,
    activeProducts: safeProducts.filter(p => p?.status === "active").length,
    totalCustomers: safeCustomers.length,
    conversionRate: "3.42%",
  };

  // Prepare chart data for sales safely
  const salesChartData = [
    { name: "Jan", sales: 138000 },
    { name: "Feb", sales: 172000 },
    { name: "Mar", sales: 240000 },
    { name: "Apr", sales: 215000 },
    { name: "May", sales: 310000 },
    { name: "Jun", sales: stats.revenue || 420000 },
  ];

  // Best selling products calculation safely
  const bestSellers = safeProducts
    .filter(p => p?.bestseller || p?.featured)
    .slice(0, 3);

  return (
    <div className="flex h-screen bg-[#F8F7F5] overflow-hidden relative" style={D}>
      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`w-64 bg-[#120F0C] flex flex-col flex-shrink-0 border-r border-[#C9A96E]/10 z-30 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0 fixed inset-y-0" : "-translate-x-full fixed inset-y-0 md:relative"}`}>
        <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="text-white text-2xl tracking-[0.25em]" style={F}>GRATIVA</p>
            <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase mt-1" style={R}>Atelier Control</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white md:hidden">
            <X size={18} />
          </button>
        </div>
        
        {/* Navigation list */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {[
            { id: "overview", label: "Overview", Icon: BarChart2 },
            { id: "products", label: "Products", Icon: Package },
            { id: "categories", label: "Categories", Icon: Layers },
            { id: "orders", label: "Orders", Icon: ShoppingCart },
            { id: "customers", label: "Clientele", Icon: Users },
            { id: "homepage", label: "Homepage CMS", Icon: ImageIcon },
            { id: "blogs", label: "Journal CMS", Icon: BookOpen },
            { id: "media", label: "Media Library", Icon: Upload },
            { id: "seo", label: "SEO Config", Icon: Globe },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { navigateToSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-medium transition-all rounded-sm uppercase tracking-wider
                ${section === item.id 
                  ? "bg-[#C9A96E] text-[#120F0C]" 
                  : "text-white/55 hover:text-white hover:bg-white/5"}`}
              style={R}
            >
              <item.Icon size={14} strokeWidth={1.5} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDebugPanelOpen(!debugPanelOpen)}
              className="flex items-center justify-center gap-1.5 border border-dashed border-[#C9A96E]/40 text-[#C9A96E] text-[9px] uppercase py-2 hover:bg-white/5 transition-colors font-semibold"
              style={R}
              title="Debug Atelier"
            >
              🛠️ Debug
            </button>
            <button
              onClick={() => window.open("/", "_blank")}
              className="flex items-center justify-center gap-1.5 border border-[#C9A96E]/20 text-[#C9A96E] text-[9px] uppercase py-2 hover:bg-[#C9A96E]/5 transition-colors font-semibold"
              style={R}
            >
              <Eye size={11} />
              Live Site
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#1E1A16] hover:bg-[#2A2420] text-white/75 text-[10px] uppercase py-2 transition-colors font-semibold"
            style={R}
          >
            <LogOut size={12} />
            Sign Out Portal
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        {/* Top Header */}
        <header className="bg-white border-b border-black/8 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-[#1A1714] md:hidden">
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold tracking-wider text-[#1A1714] uppercase" style={R}>
              {section === "overview" ? "System Overview" : section.replace("-", " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#8C7E6E] hover:text-[#1A1714] transition-colors relative">
              <Bell size={16} strokeWidth={1.5} />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-sm flex items-center justify-center">
              <span className="text-[#C9A96E] text-xs font-semibold" style={R}>KM</span>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="p-6 md:p-8 flex-grow">
          {/* SECTION 1: OVERVIEW */}
          {section === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Delivered Revenue", value: fmtPrice(stats.revenue), desc: "Completed orders", color: "text-[#C9A96E]" },
                  { label: "Active Orders", value: String(stats.totalOrders), desc: "All lifecycle states", color: "text-[#1A1714]" },
                  { label: "Active Products", value: String(stats.activeProducts), desc: "Available for purchase", color: "text-[#1A1714]" },
                  { label: "Loyal Clientele", value: String(stats.totalCustomers), desc: "Registered customers", color: "text-[#1A1714]" }
                ].map(stat => (
                  <div key={stat.label} className="bg-white p-5 border border-black/6 shadow-sm flex flex-col justify-between h-28 hover:border-[#C9A96E]/30 transition-colors">
                    <p className="text-[9px] uppercase tracking-wider text-[#8C7E6E]" style={R}>{stat.label}</p>
                    <p className={`text-2xl font-light ${stat.color} my-1`} style={F}>{stat.value}</p>
                    <p className="text-[10px] text-stone-400 font-light" style={D}>{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-8 bg-white border border-black/6 p-6 shadow-sm">
                  <h3 className="text-xs uppercase tracking-wider text-[#1A1714] mb-6 font-semibold" style={R}>Monthly Sales Curve</h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#8C7E6E" />
                        <YAxis stroke="#8C7E6E" />
                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Sales"]} />
                        <Area type="monotone" dataKey="sales" stroke="#C9A96E" fillOpacity={1} fill="url(#colorSales)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Best Sellers */}
                <div className="lg:col-span-4 bg-white border border-black/6 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-[#1A1714] mb-4 font-semibold" style={R}>Premium Bestsellers</h3>
                    <div className="space-y-4">
                      {bestSellers.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-[#FAF8F4] border border-transparent hover:border-black/5 rounded transition-colors">
                          <div className="w-10 h-12 bg-[#EDE6DA] overflow-hidden">
                            <img src={p?.images?.[0] || ""} alt={p?.name || ""} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-xs font-semibold text-[#1A1714]" style={F}>{p?.name || ""}</p>
                            <p className="text-[10px] text-[#8C7E6E]" style={D}>{p?.color || ""} · {fmtPrice(p?.price || 0)}</p>
                          </div>
                          <span className="text-[8px] tracking-[0.1em] uppercase text-[#C9A96E] bg-[#C9A96E]/10 px-2 py-0.5" style={R}>Active</span>
                        </div>
                      ))}
                      {bestSellers.length === 0 && (
                        <p className="text-stone-400 text-xs py-4 text-center">No featured products catalogued.</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => navigateToSection("products")} className="w-full text-center text-[10px] tracking-widest text-[#C9A96E] border-t border-black/5 pt-4 mt-4 uppercase hover:underline" style={R}>
                    Manage Products →
                  </button>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-white border border-black/6 shadow-sm">
                <div className="px-6 py-4 border-b border-black/6 flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider text-[#1A1714] font-semibold" style={R}>Latest Orders</h3>
                  <button onClick={() => navigateToSection("orders")} className="text-[10px] tracking-wider text-[#C9A96E] uppercase hover:underline" style={R}>View all →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-black/6 bg-stone-50">
                        {["Order ID", "Client", "Products", "Amount", "Status", "Date"].map(h => (
                          <th key={h} className="px-6 py-3 font-semibold uppercase text-[9px] tracking-wider text-[#8C7E6E]" style={R}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {safeOrders.slice(0, 5).map(o => (
                        <tr key={o.id} className="border-b border-black/4 hover:bg-[#FAF8F4] transition-colors">
                          <td className="px-6 py-4 font-mono text-[10px] text-[#1A1714]">{o?.id || ""}</td>
                          <td className="px-6 py-4 text-[#1A1714] font-medium" style={D}>{o?.customerName || ""}</td>
                          <td className="px-6 py-4 text-[#8C7E6E]" style={D}>
                            {Array.isArray(o?.productNames) ? o.productNames.join(", ") : ""}
                          </td>
                          <td className="px-6 py-4 text-[#1A1714] font-semibold" style={D}>{fmtPrice(o?.amount || 0)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[8px] px-2 py-0.5 rounded-full capitalize border ${STATUS_STYLE[o?.status || "pending"]}`} style={R}>{o?.status || "pending"}</span>
                          </td>
                          <td className="px-6 py-4 text-[#8C7E6E]" style={D}>{o?.date || ""}</td>
                        </tr>
                      ))}
                      {safeOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-stone-400">No purchases found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PRODUCTS */}
          {section === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8C7E6E]" style={D}>{safeProducts.length} products listed in catalogue</p>
                <button
                  onClick={openAddProduct}
                  className="flex items-center gap-2 bg-[#1A1714] text-white text-[10px] px-4 py-2.5 hover:bg-[#C9A96E] uppercase tracking-widest font-semibold transition-colors"
                  style={R}
                >
                  <Plus size={13} />
                  Add Product
                </button>
              </div>

              <div className="bg-white border border-black/6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-black/6 bg-[#FAF8F4]">
                        {["Product Details", "Price", "Category", "Inventory", "Status", "Promoted", "Actions"].map(h => (
                          <th key={h} className="px-6 py-3.5 uppercase text-[9px] tracking-wider text-[#8C7E6E] font-semibold" style={R}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {safeProducts.map(p => (
                        <tr key={p.id} className="border-b border-black/4 hover:bg-[#FAF8F4]/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 bg-[#EDE6DA] overflow-hidden flex-shrink-0 border border-black/5">
                                <img src={p?.images?.[0] || ""} alt={p?.name || ""} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#1A1714] text-sm" style={F}>{p?.name || ""}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div className="w-2.5 h-2.5 rounded-full border border-black/5" style={{ backgroundColor: p?.colorHex || "#C9A96E" }} />
                                  <span className="text-[10px] text-[#8C7E6E]" style={D}>{p?.color || ""}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <p className="font-semibold text-[#1A1714]">{fmtPrice(p?.price || 0)}</p>
                            {p?.comparePrice && (
                              <p className="text-[10px] text-stone-400 line-through">{fmtPrice(p.comparePrice)}</p>
                            )}
                          </td>
                          <td className="px-6 py-3 text-[#8C7E6E]" style={D}>{p?.category || ""}</td>
                          <td className="px-6 py-3">
                            <p className="font-medium">{p?.inventory ?? 0} units</p>
                            <span className={`text-[8px] uppercase tracking-wider font-semibold ${(p?.inventory ?? 0) > 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {(p?.inventory ?? 0) > 0 ? "In Stock" : "Out of stock"}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded ${p?.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : p?.status === "archived" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-stone-50 text-stone-500 border border-stone-200"}`} style={R}>
                              {p?.status || "active"}
                            </span>
                          </td>
                          <td className="px-6 py-3 space-x-1">
                            {p?.featured && <span className="text-[8px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 uppercase font-medium" style={R}>Featured</span>}
                            {p?.bestseller && <span className="text-[8px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 uppercase font-medium" style={R}>Bestseller</span>}
                            {!p?.featured && !p?.bestseller && <span className="text-stone-300">—</span>}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => toggleProductStatus(p.id)}
                                disabled={p?.status === "archived"}
                                className={`text-[9px] uppercase tracking-wider px-2 py-1 font-semibold transition-colors border ${p?.status === "archived" ? "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed" : p?.status === "active" ? "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"}`}
                                style={R}
                              >
                                {p?.status === "active" ? "Hide" : "Publish"}
                              </button>
                              <button
                                onClick={() => archiveProduct(p.id)}
                                disabled={p?.status === "archived"}
                                className={`text-[9px] uppercase tracking-wider px-2 py-1 font-semibold transition-colors border ${p?.status === "archived" ? "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed" : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"}`}
                                style={R}
                              >
                                Archive
                              </button>
                              <button
                                onClick={() => duplicateProduct(p)}
                                className="text-stone-400 hover:text-blue-500 transition-colors"
                                title="Duplicate Product"
                              >
                                <Copy size={13} />
                              </button>
                              <button onClick={() => openEditProduct(p)} className="text-stone-400 hover:text-[#C9A96E] transition-colors"><Edit size={14} /></button>
                              <button onClick={() => deleteProduct(p.id)} className="text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CATEGORIES */}
          {section === "categories" && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8C7E6E]" style={D}>{safeCategories.length} store collections active</p>
                <button
                  onClick={openAddCategory}
                  className="flex items-center gap-2 bg-[#1A1714] text-white text-[10px] px-4 py-2.5 hover:bg-[#C9A96E] uppercase tracking-widest font-semibold transition-colors"
                  style={R}
                >
                  <Plus size={13} />
                  Create Category
                </button>
              </div>

              <div className="bg-white border border-black/6 shadow-sm overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-black/6 bg-[#FAF8F4]">
                      {["Category Name", "URL Slug", "Products Count", "Actions"].map(h => (
                        <th key={h} className="px-6 py-3.5 uppercase text-[9px] tracking-wider text-[#8C7E6E] font-semibold" style={R}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeCategories.map(c => {
                      const prodCount = safeProducts.filter(p => p?.category === c?.name).length;
                      return (
                        <tr key={c.id} className="border-b border-black/4 hover:bg-[#FAF8F4]/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-[#1A1714] text-sm" style={F}>{c?.name || ""}</td>
                          <td className="px-6 py-4 font-mono text-stone-500">{c?.slug || ""}</td>
                          <td className="px-6 py-4 font-medium">{prodCount} products</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => openEditCategory(c)} className="text-stone-500 hover:text-[#C9A96E] transition-colors"><Edit size={14} /></button>
                              <button onClick={() => deleteCategory(c.id)} className="text-stone-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: ORDERS */}
          {section === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8C7E6E]" style={D}>{safeOrders.length} processed orders</p>
                <button
                  onClick={exportOrdersCSV}
                  className="flex items-center gap-2 border border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/5 text-[10px] px-4 py-2.5 uppercase tracking-widest font-semibold transition-colors"
                  style={R}
                >
                  <Download size={13} />
                  Export Orders CSV
                </button>
              </div>

              <div className="bg-white border border-black/6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-black/6 bg-[#FAF8F4]">
                        {["Order ID", "Customer Details", "Items Purchased", "Total Value", "Status Badge", "Order Date", "Lifecycle Control"].map(h => (
                          <th key={h} className="px-6 py-3.5 uppercase text-[9px] tracking-wider text-[#8C7E6E] font-semibold" style={R}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {safeOrders.map(o => (
                        <tr key={o.id} className="border-b border-black/4 hover:bg-[#FAF8F4]/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-semibold text-[#C9A96E] hover:underline cursor-pointer" onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}>{o?.id || ""}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#1A1714]" style={D}>{o?.customerName || ""}</p>
                            <p className="text-[10px] text-stone-400">{o?.customerEmail || ""}</p>
                          </td>
                          <td className="px-6 py-4 text-[#8C7E6E]" style={D}>
                            {Array.isArray(o?.productNames) ? o.productNames.join(", ") : ""}
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#1A1714]">{fmtPrice(o?.amount || 0)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[8px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${STATUS_STYLE[o?.status || "pending"]}`} style={R}>
                              {o?.status || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#8C7E6E]">{o?.date || ""}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              {o?.status === "pending" && (
                                <button 
                                  onClick={() => updateOrderStatus(o.id, "confirmed")}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[8px] uppercase tracking-wider px-2 py-1 font-semibold transition-colors"
                                  style={R}
                                >
                                  Confirm
                                </button>
                              )}
                              {o?.status === "confirmed" && (
                                <button 
                                  onClick={() => updateOrderStatus(o.id, "packed")}
                                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[8px] uppercase tracking-wider px-2 py-1 font-semibold transition-colors"
                                  style={R}
                                >
                                  Pack
                                </button>
                              )}
                              {o?.status === "packed" && (
                                <button 
                                  onClick={() => updateOrderStatus(o.id, "shipped")}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[8px] uppercase tracking-wider px-2 py-1 font-semibold transition-colors"
                                  style={R}
                                >
                                  Ship
                                </button>
                              )}
                              {o?.status === "shipped" && (
                                <button 
                                  onClick={() => updateOrderStatus(o.id, "delivered")}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[8px] uppercase tracking-wider px-2 py-1 font-semibold transition-colors"
                                  style={R}
                                >
                                  Deliver
                                </button>
                              )}
                              {o?.status !== "delivered" && o?.status !== "cancelled" && (
                                <button 
                                  onClick={() => updateOrderStatus(o.id, "cancelled")}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[8px] uppercase tracking-wider px-2 py-1 font-semibold transition-colors"
                                  style={R}
                                >
                                  Cancel
                                </button>
                              )}
                              <select
                                value={o?.status || "pending"}
                                onChange={(e) => updateOrderStatus(o.id, e.target.value as Order["status"])}
                                className="text-[9px] bg-stone-100 border-0 outline-none p-1 font-semibold text-stone-700 cursor-pointer"
                              >
                                {["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: CUSTOMERS */}
          {section === "customers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8C7E6E]" style={D}>{safeCustomers.length} registered clients</p>
                <button
                  onClick={exportCustomersCSV}
                  className="flex items-center gap-2 border border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/5 text-[10px] px-4 py-2.5 uppercase tracking-widest font-semibold transition-colors"
                  style={R}
                >
                  <Download size={13} />
                  Export Clientele CSV
                </button>
              </div>

              <div className="bg-white border border-black/6 shadow-sm overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-black/6 bg-[#FAF8F4]">
                      {["Client Name", "Email Address", "Phone Number", "Total Orders", "Cumulative Spent", "Status Tier", "Member Since", "Actions"].map(h => (
                        <th key={h} className="px-6 py-3.5 uppercase text-[9px] tracking-wider text-[#8C7E6E] font-semibold" style={R}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeCustomers.map(c => (
                      <tr key={c.id} className="border-b border-black/4 hover:bg-[#FAF8F4]/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#1A1714] text-sm" style={F}>{c?.name || ""}</td>
                        <td className="px-6 py-4 text-stone-500 font-mono">{c?.email || ""}</td>
                        <td className="px-6 py-4 text-stone-500 font-mono">{c?.phone || "—"}</td>
                        <td className="px-6 py-4 font-medium">{c?.ordersCount ?? 0} orders</td>
                        <td className="px-6 py-4 font-semibold text-[#1A1714]">{fmtPrice(c?.totalSpent || 0)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-semibold border ${TIER_STYLE[c?.tier || "standard"]}`} style={R}>
                            {c?.tier || "standard"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#8C7E6E]">{c?.joinedDate || ""}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => viewCustomerOrders(c)}
                            className="inline-flex items-center gap-1 text-[9px] tracking-wider text-[#C9A96E] hover:underline uppercase font-bold"
                            style={R}
                          >
                            <Eye size={12} />
                            History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 6: HOMEPAGE CMS */}
          {section === "homepage" && homepage && (
            <div className="space-y-10 max-w-4xl">
              {/* hero content editor */}
              <HomepageHeroEditor hero={homepage.hero} mediaList={mediaLibrary} onSave={handleHeroSave} />
              
              {/* difference editor */}
              <HomepageDifferenceEditor difference={homepage.difference} mediaList={mediaLibrary} onSave={handleDifferenceSave} />
              
              {/* coming soon categories editor */}
              <HomepageComingSoonEditor comingSoon={homepage.comingSoon} mediaList={mediaLibrary} onSave={handleComingSoonSave} />

              {/* newsletter / footer editor */}
              <HomepageNewsletterFooterEditor 
                newsletter={homepage.newsletter} 
                footer={homepage.footer} 
                onSave={handleNewsletterFooterSave} 
              />

              {/* empty state editor */}
              <HomepageEmptyStateEditor 
                emptyState={homepage.emptyState} 
                mediaList={mediaLibrary} 
                onSave={handleEmptyStateSave} 
              />
            </div>
          )}

          {/* SECTION 7: BLOGS CMS */}
          {section === "blogs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8C7E6E]" style={D}>{safeBlogs.length} editorial posts active</p>
                <button
                  onClick={openAddBlog}
                  className="flex items-center gap-2 bg-[#1A1714] text-white text-[10px] px-4 py-2.5 hover:bg-[#C9A96E] uppercase tracking-widest font-semibold transition-colors"
                  style={R}
                >
                  <Plus size={13} />
                  Write Journal Entry
                </button>
              </div>

              <div className="bg-white border border-black/6 shadow-sm overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-black/6 bg-[#FAF8F4]">
                      {["Featured Image", "Article Title", "Author", "Date", "Category", "Status", "Actions"].map(h => (
                        <th key={h} className="px-6 py-3.5 uppercase text-[9px] tracking-wider text-[#8C7E6E] font-semibold" style={R}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeBlogs.map(b => (
                      <tr key={b.id} className="border-b border-black/4 hover:bg-[#FAF8F4]/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="w-16 h-10 bg-[#EDE6DA] overflow-hidden border border-black/5">
                            <img src={b?.featuredImage || ""} alt={b?.title || ""} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-[#1A1714] text-sm" style={F}>{b?.title || ""}</p>
                          <p className="text-[10px] text-stone-400 font-mono mt-0.5">/journal/{b?.slug || ""}</p>
                        </td>
                        <td className="px-6 py-3.5 text-[#8C7E6E]" style={D}>{b?.author || ""}</td>
                        <td className="px-6 py-3.5 text-[#8C7E6E]">{b?.date || ""}</td>
                        <td className="px-6 py-3.5">
                          <span className="text-[8px] bg-stone-100 border border-stone-200 px-2 py-0.5 uppercase tracking-wider font-semibold text-stone-600" style={R}>{b?.category || ""}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded ${b?.status === "published" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-stone-50 text-stone-500 border border-stone-200"}`} style={R}>
                            {b?.status || "published"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleBlogStatus(b.id)}
                              className={`text-[9px] uppercase tracking-wider px-2 py-1 font-semibold transition-colors border ${b?.status === "published" ? "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"}`}
                              style={R}
                            >
                              {b?.status === "published" ? "Unpublish" : "Publish"}
                            </button>
                            <button onClick={() => openEditBlog(b)} className="text-stone-500 hover:text-[#C9A96E] transition-colors"><Edit size={14} /></button>
                            <button onClick={() => deleteBlog(b.id)} className="text-stone-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 8: MEDIA LIBRARY */}
          {section === "media" && (
            <div className="space-y-6">
              <div className="bg-white p-6 border border-black/6 shadow-sm">
                <h3 className="text-xs uppercase tracking-wider text-[#1A1714] mb-4 font-semibold" style={R}>Add Asset to Library</h3>
                
                {/* Drag and Drop Box */}
                <div className="border-2 border-dashed border-[#C9A96E]/20 hover:border-[#C9A96E]/50 rounded-sm p-8 text-center bg-[#FAF8F4]/30 relative transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="mx-auto text-[#C9A96E] mb-3 group-hover:scale-110 transition-transform" size={24} strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-[#1A1714]" style={F}>Choose an image file</p>
                  <p className="text-[10px] text-stone-400 mt-1.5" style={D}>Drag here or click to browse. Automatically converts to static base64 string storage.</p>
                </div>
              </div>

              <div className="bg-white p-6 border border-black/6 shadow-sm">
                <div className="border-b border-black/5 pb-4 mb-6">
                  <h3 className="text-xs uppercase tracking-wider text-[#1A1714] font-semibold mb-4" style={R}>Atelier Asset Catalogue</h3>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-grow max-w-md">
                      <input
                        type="text"
                        placeholder="Search assets by URL snippet or filename..."
                        value={mediaSearchQuery}
                        onChange={(e) => setMediaSearchQuery(e.target.value)}
                        className="w-full border border-black/10 focus:border-[#C9A96E] bg-white pl-3.5 pr-10 py-2 text-xs outline-none text-stone-700 font-medium"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">🔍</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-[9px]">
                      {(["all", "base64", "unsplash"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setMediaFilterType(tab)}
                          className={`px-3 py-1.5 uppercase font-bold tracking-widest transition-all ${
                            mediaFilterType === tab 
                              ? "bg-[#1A1714] text-white border border-[#1A1714]" 
                              : "border border-black/10 text-stone-500 hover:bg-[#FAF8F4] hover:text-[#1A1714]"
                          }`}
                          style={R}
                        >
                          {tab === "all" ? "All Assets" : tab === "base64" ? "Uploads (Base64)" : "Library Links (Web)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Images grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {(() => {
                    const filteredMedia = (mediaLibrary || []).filter((url) => {
                      if (mediaSearchQuery) {
                        const q = mediaSearchQuery.toLowerCase();
                        if (!url.toLowerCase().includes(q)) return false;
                      }
                      const isBase64 = String(url || "").startsWith("data:image/");
                      const isUnsplash = url.includes("unsplash.com") || !isBase64;
                      if (mediaFilterType === "base64" && !isBase64) return false;
                      if (mediaFilterType === "unsplash" && !isUnsplash) return false;
                      return true;
                    });

                    if (filteredMedia.length === 0) {
                      return (
                        <div className="col-span-full py-12 text-center text-[#8C7E6E] font-medium" style={D}>
                          No matching media assets found in catalogue.
                        </div>
                      );
                    }

                    return filteredMedia.map((url, idx) => {
                      const isBase64 = String(url || "").startsWith("data:image/");
                      return (
                        <div key={url + "-" + idx} className="group relative aspect-square bg-[#EDE6DA] border border-black/10 overflow-hidden shadow-xs">
                          <img src={url} alt="Media Asset" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          
                          {/* Hover controls overlay */}
                          <div className="absolute inset-0 bg-[#120F0C]/90 flex flex-col justify-between p-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="text-[8px] bg-[#C9A96E]/10 border border-[#C9A96E]/25 text-[#C9A96E] px-1.5 py-0.5 rounded self-start font-semibold uppercase tracking-widest" style={R}>
                              {isBase64 ? "Base64" : "Remote URL"}
                            </span>
                            
                            <div className="space-y-1.5 w-full">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(url);
                                  alert("Image URL copied to clipboard!");
                                }}
                                className="w-full text-center bg-white text-[#120F0C] text-[9px] uppercase tracking-wider py-1.5 font-bold transition-colors hover:bg-[#C9A96E]"
                                style={R}
                              >
                                Copy URL
                              </button>

                              <button
                                onClick={() => setPreviewImage(url)}
                                className="w-full text-center bg-white text-[#120F0C] text-[9px] uppercase tracking-wider py-1.5 font-bold transition-colors hover:bg-[#C9A96E]"
                                style={R}
                              >
                                Preview Large
                              </button>

                              <div className="relative w-full">
                                <button
                                  type="button"
                                  className="w-full text-center bg-[#1A1714] text-white border border-white/10 text-[9px] uppercase tracking-wider py-1.5 font-bold transition-colors hover:bg-[#C9A96E] hover:text-[#120F0C]"
                                  style={R}
                                >
                                  Replace File
                                </button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleReplaceImage(url, e.target.files[0]);
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </div>
                              
                              {isBase64 && (
                                <button
                                  onClick={() => deleteMediaAsset(url)}
                                  className="w-full text-center bg-red-650 text-white text-[9px] uppercase tracking-wider py-1.5 font-bold transition-colors hover:bg-red-700"
                                  style={R}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: SEO CONFIG */}
          {section === "seo" && seo && (
            <div className="max-w-3xl">
              <SeoConfigEditor seo={seo} mediaList={mediaLibrary} onSave={handleSeoSave} />
            </div>
          )}
        </div>
      </main>

      {/* ─── TEMPORARY DEVELOPMENT DEBUG PANEL ─── */}
      <AnimatePresence>
        {debugPanelOpen && (
          <div className="fixed bottom-16 left-6 w-80 bg-[#1A1714] text-white shadow-2xl border border-[#C9A96E]/30 z-50 overflow-hidden text-xs rounded-sm" style={D}>
            <div className="bg-[#C9A96E] text-[#1A1714] px-4 py-2.5 flex items-center justify-between font-bold" style={R}>
              <span>🛠️ ATELIER SYSTEM DEBUGS</span>
              <button onClick={() => setDebugPanelOpen(false)} className="text-[#1A1714] hover:opacity-75"><X size={15} /></button>
            </div>
            
            <div className="p-4 space-y-3.5 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-3">
                <span className="text-stone-400">Current Route:</span>
                <span className="font-mono text-right text-emerald-400">/admin/dashboard</span>
                
                <span className="text-stone-400">Auth Status:</span>
                <span className="text-right text-emerald-400 font-semibold">{db.getAdminSession() ? "LOGGED_IN" : "NO_SESSION"}</span>
                
                <span className="text-stone-400">Admin Email:</span>
                <span className="text-right font-mono truncate" title={db.getAdminSession() || ""}>{db.getAdminSession() || "None"}</span>
              </div>
              
              <div className="space-y-1 text-[11px] border-b border-white/10 pb-3">
                <p className="font-semibold text-[#C9A96E] mb-1">State Database Counters:</p>
                <div className="flex justify-between"><span className="text-stone-400">Products:</span> <span>{products?.length || 0} items</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Categories:</span> <span>{categories?.length || 0} items</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Orders:</span> <span>{orders?.length || 0} items</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Customers:</span> <span>{customers?.length || 0} clients</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Blogs:</span> <span>{blogs?.length || 0} articles</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Media Library:</span> <span>{mediaLibrary?.length || 0} assets</span></div>
              </div>

              <div className="space-y-1 text-[11px] border-b border-white/10 pb-3">
                <p className="font-semibold text-[#C9A96E] mb-1">Dashboard State:</p>
                <div className="flex justify-between"><span className="text-stone-400">Active Section:</span> <span>{section}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Sidebar Open:</span> <span>{sidebarOpen ? "Yes" : "No"}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Product Modal:</span> <span>{showProductModal ? "Open" : "Closed"}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Category Modal:</span> <span>{showCategoryModal ? "Open" : "Closed"}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Blog Modal:</span> <span>{showBlogModal ? "Open" : "Closed"}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Client History Modal:</span> <span>{showCustomerModal ? "Open" : "Closed"}</span></div>
              </div>

              <div className="space-y-1 text-[11px]">
                <p className="font-semibold text-[#C9A96E] mb-1">localStorage Data:</p>
                {Object.keys(localStorage).map(key => (
                  <div key={key} className="flex justify-between font-mono text-[9px] gap-2">
                    <span className="text-stone-400 truncate max-w-[140px]" title={key}>{key}:</span>
                    <span className="flex-shrink-0">{Math.round((localStorage.getItem(key)?.length || 0) / 102.4) / 10} KB</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3.5">
                <p className="font-semibold text-[#C9A96E] mb-2">Diagnostic Tools:</p>
                <button
                  onClick={() => {
                    if (window.confirm("This will clear all items in LocalStorage, logging you out and restoring the default database seed on next load. Proceed?")) {
                      localStorage.clear();
                      window.location.href = "/admin";
                    }
                  }}
                  className="w-full bg-red-950/40 border border-red-500/30 text-red-400 py-2 hover:bg-red-900 hover:text-white transition-colors text-[10px] uppercase font-bold"
                  style={R}
                >
                  Force Clear Storage & Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 3: LARGE IMAGE PREVIEW ────────────────────────────────────── */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out" onClick={() => setPreviewImage(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden bg-stone-900 border border-white/10 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setPreviewImage(null)} 
                className="absolute top-4 right-4 text-white hover:text-[#C9A96E] bg-black/60 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
              <img src={previewImage} alt="Large Preview" className="max-w-full max-h-[80vh] object-contain mx-auto" />
              <div className="p-4 bg-black/60 text-white/80 font-mono text-[10px] break-all select-all text-center">
                {previewImage}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 1: PRODUCT ADD/EDIT FORM ────────────────────────────────────── */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              style={D}
            >
              <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between bg-stone-50">
                <h3 className="text-sm font-semibold tracking-wider text-[#1A1714] uppercase" style={R}>
                  {editingProduct ? "Modify Product Details" : "Create New Product"}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="text-stone-500 hover:text-black">
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-grow text-xs text-left">
                {/* 2-column fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Product Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. The Signature Tote"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    >
                      {(categories || []).map(c => (
                        <option key={c?.id} value={c?.name}>{c?.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subtitle & SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Luxury Subtitle</label>
                    <input
                      type="text"
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                      placeholder="e.g. Meticulously Structured Leather"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>SKU Reference</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="e.g. GRT-TOT-MOC-01"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={2}
                    placeholder="Describe the material, craft detail, structure..."
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Atelier Long Description (HTML body)</label>
                  <textarea
                    value={productForm.longDescription}
                    onChange={(e) => setProductForm({ ...productForm, longDescription: e.target.value })}
                    rows={4}
                    placeholder="Rich text / HTML detailing manual craftsmanship processes..."
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none resize-none leading-relaxed font-mono"
                  />
                </div>

                {/* 2-column values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Product Price (INR)</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="e.g. 34500"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Compare Price (INR)</label>
                    <input
                      type="number"
                      value={productForm.comparePrice}
                      onChange={(e) => setProductForm({ ...productForm, comparePrice: e.target.value })}
                      placeholder="Compare at (optional)"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Stock Quantity</label>
                    <input
                      type="number"
                      value={productForm.inventory}
                      onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                      placeholder="e.g. 10"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Swatch & Status & Badge */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Luxury Badge</label>
                    <input
                      type="text"
                      value={productForm.luxuryBadge}
                      onChange={(e) => setProductForm({ ...productForm, luxuryBadge: e.target.value })}
                      placeholder="e.g. Atelier, Pre-Order, Limited Run"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Catalog Status</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value as Product["status"] })}
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none animate-none"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="archived">Archived (Off Catalogue)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Swatch Color Swatch (Fallback)</label>
                    <span className="font-mono text-stone-500 font-semibold">{editingProduct?.color || "Preserved in Database"}</span>
                  </div>
                </div>

                {/* Primary Image & Thumbnail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Primary Image URL</label>
                    <input
                      type="text"
                      value={productForm.images[0] || ""}
                      onChange={(e) => {
                        const newImages = [...productForm.images];
                        newImages[0] = e.target.value;
                        setProductForm({ ...productForm, images: newImages });
                      }}
                      placeholder="Primary Catalog Photo URL"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Thumbnail Preview URL</label>
                    <input
                      type="text"
                      value={productForm.thumbnail}
                      onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value })}
                      placeholder="Lighter Thumbnail Image URL"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Gallery Images List */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Gallery Images URLs (comma separated)</label>
                  <textarea
                    value={productForm.galleryImages.join(", ")}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      galleryImages: e.target.value.split(",").map(url => url.trim()).filter(Boolean)
                    })}
                    rows={2}
                    placeholder="URL 1, URL 2, URL 3..."
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none resize-none"
                  />
                </div>

                {/* Media library picker */}
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-2" style={R}>Or Select Primary Image From Atelier Media Library</label>
                  <div className="grid grid-cols-6 gap-2 border border-black/5 p-2 bg-stone-50 max-h-24 overflow-y-auto font-mono">
                    {(mediaLibrary || []).map((url, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setProductForm({ ...productForm, images: [url] })}
                        className={`aspect-square overflow-hidden bg-stone-200 relative cursor-pointer border-2 ${productForm.images[0] === url ? "border-[#C9A96E]" : "border-transparent"}`}
                      >
                        <img src={url} alt="Media thumbnail" className="w-full h-full object-cover" />
                        {productForm.images[0] === url && (
                          <div className="absolute inset-0 bg-[#C9A96E]/20 flex items-center justify-center">
                            <Check size={12} className="text-[#120F0C]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product SEO Info */}
                <div className="border-t border-black/5 pt-4 space-y-3">
                  <p className="text-[10px] tracking-wider text-[#C9A96E] uppercase font-bold" style={R}>Product Specific Search Engine (SEO) Meta</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>SEO Search Title</label>
                      <input
                        type="text"
                        value={productForm.seoTitle}
                        onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                        placeholder="Customize search title preview"
                        className="w-full border border-black/10 focus:border-[#C9A96E] px-3 py-2 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>SEO Keywords</label>
                      <input
                        type="text"
                        value={productForm.seoKeywords}
                        onChange={(e) => setProductForm({ ...productForm, seoKeywords: e.target.value })}
                        placeholder="luxury tote, European calfskin, mocha tote"
                        className="w-full border border-black/10 focus:border-[#C9A96E] px-3 py-2 bg-white outline-none"
                      />
                    </div>
                    <div className="col-span-full">
                      <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>SEO Snippet Description</label>
                      <input
                        type="text"
                        value={productForm.seoDescription}
                        onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                        placeholder="Customize search description summary"
                        className="w-full border border-black/10 focus:border-[#C9A96E] px-3 py-2 bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Promotions */}
                <div className="flex flex-wrap items-center gap-6 border-t border-black/5 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="accent-[#C9A96E] w-4 h-4"
                    />
                    <span className="font-semibold text-stone-700">Flag as Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.bestseller}
                      onChange={(e) => setProductForm({ ...productForm, bestseller: e.target.checked })}
                      className="accent-[#C9A96E] w-4 h-4"
                    />
                    <span className="font-semibold text-stone-700">Flag as Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.newArrival}
                      onChange={(e) => setProductForm({ ...productForm, newArrival: e.target.checked })}
                      className="accent-[#C9A96E] w-4 h-4"
                    />
                    <span className="font-semibold text-stone-700">Flag as New Arrival</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 border-t border-black/8 bg-stone-50 flex justify-end gap-3.5">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="border border-black/15 text-stone-600 px-5 py-2.5 uppercase tracking-widest text-[9px] hover:bg-stone-100 transition-colors"
                  style={R}
                >
                  Cancel
                </button>
                <button
                  onClick={saveProduct}
                  className="bg-[#1A1714] text-white px-6 py-2.5 uppercase tracking-widest text-[9px] font-semibold hover:bg-[#C9A96E] transition-colors"
                  style={R}
                >
                  {editingProduct ? "Save Modifications" : "Add to Catalogue"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: CATEGORY ADD/EDIT FORM ───────────────────────────────────── */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              style={D}
            >
              <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between bg-stone-50">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#1A1714]" style={R}>
                  {editingCategory ? "Edit Collection Coordinates" : "Add Store Collection"}
                </h3>
                <button onClick={() => setShowCategoryModal(false)} className="text-stone-500 hover:text-black">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs text-left flex-grow">
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Collection Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Fine Jewelry"
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Collection Editorial Title</label>
                  <input
                    type="text"
                    value={categoryForm.title}
                    onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                    placeholder="e.g. Ornements de L'Atelier"
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-serif text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Description copy</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Describe the aesthetic, craft values, and curation details of this collection..."
                    rows={3}
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Collection Banner Image URL (Landscape)</label>
                  <input
                    type="text"
                    value={categoryForm.bannerImage}
                    onChange={(e) => setCategoryForm({ ...categoryForm, bannerImage: e.target.value })}
                    placeholder="e.g. Unsplash URL for banner slider (1200x400)"
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Collection Hero Image URL (Portrait)</label>
                  <input
                    type="text"
                    value={categoryForm.heroImage}
                    onChange={(e) => setCategoryForm({ ...categoryForm, heroImage: e.target.value })}
                    placeholder="e.g. Unsplash URL for vertical grid hero (600x800)"
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
                  />
                </div>

                {/* Media library picker for categories */}
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Select Portrait Hero Image From Library</label>
                  <div className="flex gap-1.5 overflow-x-auto p-1.5 border border-black/5 bg-stone-50 max-h-14 font-mono text-[9px]">
                    {(mediaLibrary || []).map((url, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setCategoryForm({ ...categoryForm, heroImage: url })}
                        className="w-9 h-9 bg-stone-200 overflow-hidden flex-shrink-0 cursor-pointer border border-transparent hover:border-[#C9A96E]"
                      >
                        <img src={url} alt="Media Asset" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-stone-50 flex justify-end gap-3 border-t border-black/8">
                <button onClick={() => setShowCategoryModal(false)} className="border border-black/15 text-stone-500 px-5 py-2.5 uppercase tracking-widest text-[9px]" style={R}>Cancel</button>
                <button onClick={saveCategory} className="bg-[#1A1714] text-white px-6 py-2.5 uppercase tracking-widest text-[9px] font-semibold hover:bg-[#C9A96E] transition-colors" style={R}>Save Collection</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 3: JOURNAL ARTICLE ADD/EDIT FORM ────────────────────────────── */}
      <AnimatePresence>
        {showBlogModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
              style={D}
            >
              <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between bg-stone-50">
                <h3 className="text-sm font-semibold tracking-wider text-[#1A1714] uppercase" style={R}>
                  {editingBlog ? "Edit Journal Entry" : "Write Journal Article"}
                </h3>
                <button onClick={() => setShowBlogModal(false)} className="text-stone-500 hover:text-black">
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-grow text-xs text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Article Title</label>
                    <input
                      type="text"
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="e.g. Quiet Luxury: The Art of Styling"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none font-semibold text-stone-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Subtitle / Quote</label>
                    <input
                      type="text"
                      value={blogForm.subtitle}
                      onChange={(e) => setBlogForm({ ...blogForm, subtitle: e.target.value })}
                      placeholder="e.g. Mastering the aesthetics of soft power"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Category / Tag</label>
                    <input
                      type="text"
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                      placeholder="e.g. Craftsmanship"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Author Name</label>
                    <input
                      type="text"
                      value={blogForm.author}
                      onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Featured Image URL</label>
                    <input
                      type="text"
                      value={blogForm.featuredImage}
                      onChange={(e) => setBlogForm({ ...blogForm, featuredImage: e.target.value })}
                      placeholder="Cover photo URL"
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Publication status</label>
                    <select
                      value={blogForm.status}
                      onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as "published" | "draft" })}
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none animate-none"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft (Unpublished)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Schedule Publish Date</label>
                    <input
                      type="date"
                      value={blogForm.publishDate}
                      onChange={(e) => setBlogForm({ ...blogForm, publishDate: e.target.value })}
                      className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Library selector for featured image */}
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-2" style={R}>Select Image from Library</label>
                  <div className="grid grid-cols-6 gap-2 border border-black/5 p-2 bg-stone-50 max-h-20 overflow-y-auto">
                    {(mediaLibrary || []).map((url, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setBlogForm({ ...blogForm, featuredImage: url })}
                        className={`aspect-[16/10] overflow-hidden bg-stone-200 relative cursor-pointer border-2 ${blogForm.featuredImage === url ? "border-[#C9A96E]" : "border-transparent"}`}
                      >
                        <img src={url} alt="Media Asset" className="w-full h-full object-cover" />
                        {blogForm.featuredImage === url && (
                          <div className="absolute inset-0 bg-[#C9A96E]/20 flex items-center justify-center">
                            <Check size={12} className="text-[#120F0C]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Excerpt / Summary</label>
                  <textarea
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                    rows={2}
                    placeholder="Short editorial summary for index grid listing..."
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Article Body Content (supports HTML tags)</label>
                  <textarea
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    rows={8}
                    placeholder="Use standard HTML markup: <p>, <h3>, <blockquote>, etc. to compose editorial layouts."
                    className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none resize-none leading-relaxed font-mono text-[11px]"
                  />
                </div>

                {/* SEO fields */}
                <div className="border-t border-black/6 pt-4 space-y-4">
                  <p className="text-[10px] tracking-wider text-[#C9A96E] uppercase font-bold" style={R}>Search Meta Settings (Blog SEO)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Meta Title</label>
                      <input
                        type="text"
                        value={blogForm.metaTitle}
                        onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })}
                        placeholder="Customize search title (optional)"
                        className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Meta Description</label>
                      <input
                        type="text"
                        value={blogForm.metaDescription}
                        onChange={(e) => setBlogForm({ ...blogForm, metaDescription: e.target.value })}
                        placeholder="Customize search description summary"
                        className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Meta Keywords</label>
                      <input
                        type="text"
                        value={blogForm.keywords}
                        onChange={(e) => setBlogForm({ ...blogForm, keywords: e.target.value })}
                        placeholder="luxury style, leather bag craftsmanship"
                        className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 border-t border-black/8 bg-stone-50 flex justify-end gap-3.5">
                <button
                  onClick={() => setShowBlogModal(false)}
                  className="border border-black/15 text-stone-600 px-5 py-2.5 uppercase tracking-widest text-[9px] hover:bg-stone-100 transition-colors"
                  style={R}
                >
                  Cancel
                </button>
                <button
                  onClick={saveBlog}
                  className="bg-[#1A1714] text-white px-6 py-2.5 uppercase tracking-widest text-[9px] font-semibold hover:bg-[#C9A96E] transition-colors"
                  style={R}
                >
                  {editingBlog ? "Save modifications" : "Publish Article"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 4: CUSTOMER HISTORY MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]"
              style={D}
            >
              <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between bg-stone-50">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-[#1A1714] uppercase" style={R}>Client History File</h3>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">{selectedCustomer?.name || ""} (Client #{selectedCustomer?.id || ""})</p>
                </div>
                <button onClick={() => setShowCustomerModal(false)} className="text-stone-500 hover:text-black">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow text-xs text-left">
                {/* Profile Stats summary */}
                <div className="grid grid-cols-3 gap-3 border border-black/5 p-4 bg-stone-50 text-center">
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-stone-400" style={R}>Client Tier</p>
                    <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-bold border inline-block mt-1 ${TIER_STYLE[selectedCustomer?.tier || "standard"]}`} style={R}>
                      {selectedCustomer?.tier || "standard"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-stone-400" style={R}>Total Orders</p>
                    <p className="text-sm font-semibold text-[#1A1714] mt-1">{selectedCustomer?.ordersCount || 0} requests</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-stone-400" style={R}>Total Spend</p>
                    <p className="text-sm font-semibold text-[#1A1714] mt-1">{fmtPrice(selectedCustomer?.totalSpent || 0)}</p>
                  </div>
                </div>

                {/* Order List */}
                <div className="space-y-4">
                  <h4 className="font-semibold uppercase tracking-wider text-[#1A1714] border-b border-black/6 pb-2" style={R}>Purchase Invoices</h4>
                  
                  {safeOrders.filter(o => o?.customerEmail === selectedCustomer?.email).length === 0 ? (
                    <p className="text-center py-6 text-stone-400">No orders recorded in system logs.</p>
                  ) : (
                    <div className="space-y-3">
                      {safeOrders
                        .filter(o => o?.customerEmail === selectedCustomer?.email)
                        .map(order => (
                          <div key={order.id} className="p-3 border border-black/5 hover:border-black/10 rounded flex items-center justify-between bg-white">
                            <div>
                              <p className="font-mono text-[10px] font-semibold text-[#1A1714]">{order?.id || ""}</p>
                              <p className="text-[10px] text-stone-500 mt-0.5">{Array.isArray(order?.productNames) ? order.productNames.join(", ") : ""}</p>
                              <p className="text-[9px] text-[#8C7E6E] mt-1">{order?.date || ""}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-[#1A1714] mb-1">{fmtPrice(order?.amount || 0)}</p>
                              <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_STYLE[order?.status || "pending"]}`} style={R}>
                                {order?.status || "pending"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-stone-50 border-t border-black/8 text-right">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="bg-[#1A1714] text-white px-6 py-2.5 uppercase tracking-widest text-[9px] font-semibold hover:bg-[#C9A96E] transition-colors"
                  style={R}
                >
                  Close File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 5: ORDER DETAILS VIEW MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white w-full max-w-md shadow-2xl flex flex-col"
              style={D}
            >
              <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between bg-stone-50">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-[#1A1714] uppercase" style={R}>Invoice Details</h3>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">Order ID: {selectedOrder?.id || ""}</p>
                </div>
                <button onClick={() => setShowOrderModal(false)} className="text-stone-500 hover:text-black">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 flex-grow text-xs text-left">
                {/* Status and Date */}
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-stone-400 mb-1" style={R}>Order Date</p>
                    <p className="font-semibold text-stone-800">{selectedOrder?.date || ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] uppercase tracking-widest text-stone-400 mb-1" style={R}>Current Status</p>
                    <span className={`text-[8px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${STATUS_STYLE[selectedOrder?.status || "pending"]}`} style={R}>
                      {selectedOrder?.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-2">
                  <p className="text-[8px] uppercase tracking-widest text-[#8C7E6E] font-bold" style={R}>Customer Details</p>
                  <div className="p-3 border border-black/5 bg-[#FAF8F4]/30 rounded">
                    <p className="font-semibold text-[#1A1714] text-sm" style={F}>{selectedOrder?.customerName || ""}</p>
                    <p className="text-stone-500 font-mono mt-0.5">{selectedOrder?.customerEmail || ""}</p>
                  </div>
                </div>

                {/* Items Purchased */}
                <div className="space-y-2">
                  <p className="text-[8px] uppercase tracking-widest text-[#8C7E6E] font-bold" style={R}>Items Ordered</p>
                  <div className="border border-black/5 rounded divide-y divide-black/5 bg-white">
                    {Array.isArray(selectedOrder?.productNames) ? (
                      selectedOrder.productNames.map((name, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center">
                          <span className="font-medium text-stone-700" style={D}>{name}</span>
                          <span className="text-[10px] text-stone-400 uppercase tracking-widest" style={R}>Qty: 1</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-stone-400">No items recorded.</div>
                    )}
                  </div>
                </div>

                {/* Total Value */}
                <div className="flex justify-between items-center pt-4 border-t border-black/5">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#8C7E6E] font-semibold" style={R}>Total Amount Paid</span>
                  <span className="text-lg font-semibold text-[#1A1714]" style={F}>
                    {fmtPrice(selectedOrder?.amount || 0)}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-stone-50 border-t border-black/8 text-right">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="bg-[#1A1714] text-white px-6 py-2.5 uppercase tracking-widest text-[9px] font-semibold hover:bg-[#C9A96E] transition-colors"
                  style={R}
                >
                  Close Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HOMEPAGE EDITORS SUB-COMPONENTS ──────────────────────────────────────────

interface EditorProps<T> {
  mediaList: string[];
  onSave: (data: T) => void;
}

function HomepageHeroEditor({ hero, mediaList, onSave }: EditorProps<HomepageContent["hero"]> & { hero: HomepageContent["hero"] }) {
  const safeHero = hero || {
    badge: "",
    headline: "",
    subheadline: "",
    ctaText: "",
    ctaLink: "",
    images: []
  };

  const [formData, setFormData] = useState(safeHero);

  useEffect(() => {
    if (hero) setFormData(hero);
  }, [hero]);

  const safeImages = Array.isArray(formData?.images) ? formData.images : [];

  return (
    <div className="bg-white p-6 border border-black/6 shadow-sm text-xs text-left space-y-4">
      <h3 className="text-xs uppercase tracking-wider text-[#1A1714] border-b border-black/6 pb-2 font-bold" style={R}>Hero Section Headline & Images</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>Collection Badge Label</label>
          <input
            type="text"
            value={formData?.badge || ""}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>CTA Action Button Text</label>
          <input
            type="text"
            value={formData?.ctaText || ""}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>CTA Action Redirect Link</label>
          <input
            type="text"
            value={formData?.ctaLink || ""}
            onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>Hero Image URL</label>
          <input
            type="text"
            value={safeImages[0] || ""}
            onChange={(e) => setFormData({ ...formData, images: [e.target.value, ...safeImages.slice(1)] })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
          />
        </div>
      </div>

      <div>
        <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>Headline Title (Use \n for line breaks)</label>
        <textarea
          value={formData?.headline || ""}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          rows={2}
          className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none resize-none font-serif text-sm leading-snug"
        />
      </div>

      <div>
        <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>Subheadline Description</label>
        <textarea
          value={formData?.subheadline || ""}
          onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
          rows={2}
          className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Select Hero Image from Library */}
      <div>
        <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-2" style={R}>Select Background Image from Library</label>
        <div className="grid grid-cols-8 gap-2 border border-black/5 p-2 bg-stone-50 max-h-20 overflow-y-auto">
          {(mediaList || []).map((url, idx) => (
            <div 
              key={idx} 
              onClick={() => setFormData({ ...formData, images: [url] })}
              className={`aspect-[16/10] overflow-hidden bg-stone-200 relative cursor-pointer border-2 ${safeImages[0] === url ? "border-[#C9A96E]" : "border-transparent"}`}
            >
              <img src={url} alt="Media Asset" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSave(formData)}
        className="bg-[#1A1714] text-white text-[9px] uppercase tracking-widest py-2 px-5 hover:bg-[#C9A96E] font-semibold"
        style={R}
      >
        Save Hero Settings
      </button>
    </div>
  );
}

function HomepageDifferenceEditor({ difference, mediaList, onSave }: EditorProps<HomepageContent["difference"]> & { difference: HomepageContent["difference"] }) {
  const safeDifference = difference || {
    headline: "",
    subheadline: "",
    features: []
  };

  const [formData, setFormData] = useState(safeDifference);

  useEffect(() => {
    if (difference) setFormData(difference);
  }, [difference]);

  const updateFeatureField = (idx: number, field: "title" | "desc" | "image" | "hidden", value: any) => {
    const features = Array.isArray(formData?.features) ? formData.features : [];
    const updatedFeatures = features.map((f, fidx) => 
      fidx === idx ? { ...f, [field]: value } : f
    );
    setFormData({ ...formData, features: updatedFeatures });
  };

  const moveFeature = (idx: number, direction: "up" | "down") => {
    const features = [...(formData?.features || [])];
    if (direction === "up" && idx > 0) {
      const temp = features[idx];
      features[idx] = features[idx - 1];
      features[idx - 1] = temp;
    } else if (direction === "down" && idx < features.length - 1) {
      const temp = features[idx];
      features[idx] = features[idx + 1];
      features[idx + 1] = temp;
    }
    setFormData({ ...formData, features });
  };

  const addFeature = () => {
    const features = [...(formData?.features || [])];
    features.push({
      title: "New Feature Title",
      desc: "Detailed description of the luxury craft or heritage.",
      image: "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format",
      hidden: false
    });
    setFormData({ ...formData, features });
  };

  const deleteFeature = (idx: number) => {
    const features = (formData?.features || []).filter((_, fidx) => fidx !== idx);
    setFormData({ ...formData, features });
  };

  return (
    <div className="bg-white p-6 border border-black/6 shadow-sm text-xs text-left space-y-6">
      <h3 className="text-xs uppercase tracking-wider text-[#1A1714] border-b border-black/6 pb-2 font-bold" style={R}>Homepage "The GRATIVA Difference" Columns</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>Main Headline Title</label>
          <input
            type="text"
            value={formData?.headline || ""}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold uppercase tracking-wider"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>Subheadline Text</label>
          <input
            type="text"
            value={formData?.subheadline || ""}
            onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-light"
          />
        </div>
      </div>

      {/* Grid of the features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-black/5 pt-4">
        {(formData?.features || []).map((feat, idx) => (
          <div key={idx} className={`border border-black/5 p-4 bg-[#FAF8F4]/50 space-y-3 relative ${feat.hidden ? "opacity-60" : ""}`}>
            {/* Top right buttons container */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/80 backdrop-blur-xs p-1 border border-black/5">
              <span className="text-stone-400 font-serif font-semibold text-[10px] mr-1.5">0{idx + 1}</span>
              
              {/* Move Up */}
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveFeature(idx, "up")}
                className="w-5 h-5 flex items-center justify-center border border-black/5 hover:bg-stone-100 disabled:opacity-30 cursor-pointer font-bold"
                title="Move Up"
              >
                ↑
              </button>

              {/* Move Down */}
              <button
                type="button"
                disabled={idx === (formData?.features || []).length - 1}
                onClick={() => moveFeature(idx, "down")}
                className="w-5 h-5 flex items-center justify-center border border-black/5 hover:bg-stone-100 disabled:opacity-30 cursor-pointer font-bold"
                title="Move Down"
              >
                ↓
              </button>

              {/* Toggle Hidden */}
              <button
                type="button"
                onClick={() => updateFeatureField(idx, "hidden", !feat.hidden)}
                className={`w-5 h-5 flex items-center justify-center border border-black/5 text-[9px] font-bold cursor-pointer ${
                  feat.hidden ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }`}
                title={feat.hidden ? "Show Column" : "Hide Column"}
              >
                {feat.hidden ? "H" : "V"}
              </button>

              {/* Delete Feature */}
              <button
                type="button"
                onClick={() => deleteFeature(idx)}
                className="w-5 h-5 flex items-center justify-center border border-black/5 text-red-600 hover:bg-red-50 cursor-pointer"
                title="Delete Column"
              >
                <Trash2 size={10} />
              </button>
            </div>
            
            <div className="pt-4">
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Feature Title</label>
              <input
                type="text"
                value={feat?.title || ""}
                onChange={(e) => updateFeatureField(idx, "title", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] bg-white px-2 py-1.5 outline-none font-serif text-sm"
              />
            </div>
            
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Description Text</label>
              <textarea
                value={feat?.desc || ""}
                onChange={(e) => updateFeatureField(idx, "desc", e.target.value)}
                rows={2}
                className="w-full border border-black/10 focus:border-[#C9A96E] bg-white px-2 py-1.5 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Image URL</label>
              <input
                type="text"
                value={feat?.image || ""}
                onChange={(e) => updateFeatureField(idx, "image", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] bg-white px-2 py-1.5 outline-none text-[10px]"
              />
            </div>

            {/* Select Image from Library */}
            <div>
              <div className="flex gap-1.5 overflow-x-auto p-1 border border-black/5 bg-white max-h-12 font-mono text-[9px]">
                {mediaList.slice(0, 8).map((url, mIdx) => (
                  <div 
                    key={mIdx} 
                    onClick={() => updateFeatureField(idx, "image", url)}
                    className="w-8 h-8 bg-stone-200 overflow-hidden flex-shrink-0 cursor-pointer border border-transparent hover:border-[#C9A96E]"
                  >
                    <img src={url} alt="asset preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-black/5 pt-4">
        <button
          type="button"
          onClick={addFeature}
          className="flex items-center gap-1.5 border border-dashed border-[#C9A96E]/40 text-[#C9A96E] hover:bg-[#C9A96E]/5 text-[9px] px-3.5 py-2 uppercase tracking-widest font-semibold font-mono"
        >
          <Plus size={11} />
          Add Feature Column
        </button>

        <button
          onClick={() => onSave(formData)}
          className="bg-[#1A1714] text-white text-[9px] uppercase tracking-widest py-2 px-5 hover:bg-[#C9A96E] font-semibold"
          style={R}
        >
          Save Differences Section
        </button>
      </div>
    </div>
  );
}

function HomepageComingSoonEditor({ comingSoon, mediaList, onSave }: EditorProps<HomepageContent["comingSoon"]> & { comingSoon: HomepageContent["comingSoon"] }) {
  const safeComingSoon = comingSoon || {
    headline: "",
    subheadline: "",
    categories: []
  };

  const [formData, setFormData] = useState(safeComingSoon);

  useEffect(() => {
    if (comingSoon) setFormData(comingSoon);
  }, [comingSoon]);

  const updateCategoryField = (idx: number, field: "name" | "label" | "image", value: string) => {
    const categories = Array.isArray(formData?.categories) ? formData.categories : [];
    const updatedCategories = categories.map((cat, cidx) => 
      cidx === idx ? { ...cat, [field]: value } : cat
    );
    setFormData({ ...formData, categories: updatedCategories });
  };

  return (
    <div className="bg-white p-6 border border-black/6 shadow-sm text-xs text-left space-y-6">
      <h3 className="text-xs uppercase tracking-wider text-[#1A1714] border-b border-black/6 pb-2 font-bold" style={R}>Homepage "Coming Soon" Universe Grid</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>Section Title</label>
          <input
            type="text"
            value={formData?.headline || ""}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-serif text-base"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1.5" style={R}>Subtitle Description</label>
          <input
            type="text"
            value={formData?.subheadline || ""}
            onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-light"
          />
        </div>
      </div>

      {/* Categories blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-black/5 pt-4">
        {(formData?.categories || []).map((cat, idx) => (
          <div key={idx} className="border border-black/5 p-3.5 bg-[#FAF8F4]/50 space-y-3">
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Launch Label</label>
              <input
                type="text"
                value={cat?.label || ""}
                onChange={(e) => updateCategoryField(idx, "label", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] bg-white px-2 py-1.5 outline-none uppercase font-bold"
              />
            </div>
            
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Category Title</label>
              <input
                type="text"
                value={cat?.name || ""}
                onChange={(e) => updateCategoryField(idx, "name", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] bg-white px-2 py-1.5 outline-none font-serif font-medium"
              />
            </div>

            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1" style={R}>Image URL</label>
              <input
                type="text"
                value={cat?.image || ""}
                onChange={(e) => updateCategoryField(idx, "image", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] bg-white px-2 py-1.5 outline-none text-[9px]"
              />
            </div>

            {/* Select Image from Library */}
            <div>
              <div className="flex gap-1 overflow-x-auto p-1 border border-black/5 bg-white max-h-10 font-mono text-[9px]">
                {mediaList.slice(0, 6).map((url, mIdx) => (
                  <div 
                    key={mIdx} 
                    onClick={() => updateCategoryField(idx, "image", url)}
                    className="w-6 h-6 bg-stone-200 overflow-hidden flex-shrink-0 cursor-pointer border border-transparent hover:border-[#C9A96E]"
                  >
                    <img src={url} alt="asset preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave(formData)}
        className="bg-[#1A1714] text-white text-[9px] uppercase tracking-widest py-2 px-5 hover:bg-[#C9A96E] font-semibold"
        style={R}
      >
        Save Universe Settings
      </button>
    </div>
  );
}

function HomepageNewsletterFooterEditor({ 
  newsletter, 
  footer, 
  onSave 
}: { 
  newsletter: HomepageContent["newsletter"]; 
  footer: HomepageContent["footer"]; 
  onSave: (news: HomepageContent["newsletter"], foot: HomepageContent["footer"]) => void 
}) {
  const safeNewsletter = newsletter || { headline: "", subheadline: "" };
  const safeFooter = footer || { about: "", email: "", location: "" };

  const [newsForm, setNewsForm] = useState(safeNewsletter);
  const [footForm, setFootForm] = useState(safeFooter);

  useEffect(() => {
    if (newsletter) setNewsForm(newsletter);
    if (footer) setFootForm(footer);
  }, [newsletter, footer]);

  return (
    <div className="bg-white p-6 border border-black/6 shadow-sm text-xs text-left space-y-6">
      <h3 className="text-xs uppercase tracking-wider text-[#1A1714] border-b border-black/6 pb-2 font-bold" style={R}>Homepage Newsletter & Footer Detail</h3>

      {/* Newsletter */}
      <div className="space-y-4">
        <p className="text-[10px] tracking-wider text-[#C9A96E] uppercase font-bold" style={R}>Newsletter Headline Section</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Edit Newsletter Headline</label>
            <input
              type="text"
              value={newsForm?.headline || ""}
              onChange={(e) => setNewsForm({ ...newsForm, headline: e.target.value })}
              className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-serif text-sm"
            />
          </div>
          <div>
            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Edit Subheadline Description</label>
            <input
              type="text"
              value={newsForm?.subheadline || ""}
              onChange={(e) => setNewsForm({ ...newsForm, subheadline: e.target.value })}
              className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer details */}
      <div className="space-y-4 border-t border-black/5 pt-4">
        <p className="text-[10px] tracking-wider text-[#C9A96E] uppercase font-bold" style={R}>Footer Contact & Branding Info</p>
        
        <div>
          <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Branding Description</label>
          <textarea
            value={footForm?.about || ""}
            onChange={(e) => setFootForm({ ...footForm, about: e.target.value })}
            rows={2}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Atelier Support Email</label>
            <input
              type="email"
              value={footForm?.email || ""}
              onChange={(e) => setFootForm({ ...footForm, email: e.target.value })}
              className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
            />
          </div>
          <div>
            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Atelier Location Address</label>
            <input
              type="text"
              value={footForm?.location || ""}
              onChange={(e) => setFootForm({ ...footForm, location: e.target.value })}
              className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => onSave(newsForm, footForm)}
        className="bg-[#1A1714] text-white text-[9px] uppercase tracking-widest py-2 px-5 hover:bg-[#C9A96E] font-semibold"
        style={R}
      >
        Save Content Banners
      </button>
    </div>
  );
}

function HomepageEmptyStateEditor({
  emptyState,
  mediaList,
  onSave
}: {
  emptyState?: HomepageContent["emptyState"];
  mediaList: string[];
  onSave: (emptyState: HomepageContent["emptyState"]) => void;
}) {
  const defaultEmptyState = {
    title: "No products catalogued in this collection yet.",
    description: "Our master artisans are currently perfecting new creations. Check back soon for the latest drops.",
    buttonText: "Return To Storefront",
    image: "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=600&h=800&fit=crop&auto=format"
  };

  const [formData, setFormData] = useState(emptyState || defaultEmptyState);

  useEffect(() => {
    if (emptyState) {
      setFormData(emptyState);
    }
  }, [emptyState]);

  return (
    <div className="bg-white p-6 border border-black/6 shadow-sm text-xs text-left space-y-6">
      <h3 className="text-xs uppercase tracking-wider text-[#1A1714] border-b border-black/6 pb-2 font-bold" style={R}>
        Category Empty State CMS Settings
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Empty State Title</label>
          <input
            type="text"
            value={formData?.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-serif text-sm"
          />
        </div>
        <div>
          <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Button Call To Action Text</label>
          <input
            type="text"
            value={formData?.buttonText || ""}
            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold"
          />
        </div>
      </div>
      <div>
        <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Empty State Description</label>
        <textarea
          value={formData?.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none resize-none leading-relaxed"
        />
      </div>
      <div>
        <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Empty State Showcase Image URL</label>
        <input
          type="text"
          value={formData?.image || ""}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-mono text-[10px]"
        />
      </div>
      <div>
        <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Select Image from Library</label>
        <div className="flex gap-1.5 overflow-x-auto p-1 border border-black/5 bg-white max-h-12 font-mono text-[9px] mt-1">
          {mediaList.slice(0, 12).map((url, mIdx) => (
            <div 
              key={mIdx} 
              onClick={() => setFormData({ ...formData, image: url })}
              className="w-8 h-8 bg-stone-200 overflow-hidden flex-shrink-0 cursor-pointer border border-transparent hover:border-[#C9A96E]"
            >
              <img src={url} alt="asset preview" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => onSave(formData)}
        className="bg-[#1A1714] text-white text-[9px] uppercase tracking-widest py-2 px-5 hover:bg-[#C9A96E] font-semibold"
        style={R}
      >
        Save Empty State Settings
      </button>
    </div>
  );
}

// ─── SEO CONFIG EDITOR SUB-COMPONENT ──────────────────────────────────────────

function SeoConfigEditor({ 
  seo, 
  mediaList, 
  onSave 
}: { 
  seo: SeoSettings; 
  mediaList: string[]; 
  onSave: (newSeo: SeoSettings) => void 
}) {
  const safeSeo = seo || {
    home: { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", canonicalUrl: "", keywords: "" },
    blog: { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", canonicalUrl: "", keywords: "" }
  };

  const [formData, setFormData] = useState(safeSeo);

  useEffect(() => {
    if (seo) setFormData(seo);
  }, [seo]);

  const updateField = (page: "home" | "blog", field: keyof SeoSettings["home" | "blog"], value: string) => {
    setFormData({
      ...formData,
      [page]: {
        ...formData[page],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8 text-xs text-left">
      {/* Home Page SEO */}
      <div className="bg-white p-6 border border-black/6 shadow-sm space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-[#1A1714] border-b border-black/6 pb-2 font-bold" style={R}>E-Commerce Main Storefront SEO</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Search Engine Page Title</label>
            <input
              type="text"
              value={formData?.home?.title || ""}
              onChange={(e) => updateField("home", "title", e.target.value)}
              className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
            />
          </div>
          <div>
            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Canonical URL Link</label>
            <input
              type="text"
              value={formData?.home?.canonicalUrl || ""}
              onChange={(e) => updateField("home", "canonicalUrl", e.target.value)}
              className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-mono text-[10px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Meta Description</label>
          <textarea
            value={formData?.home?.description || ""}
            onChange={(e) => updateField("home", "description", e.target.value)}
            rows={2}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Keywords (comma separated)</label>
          <input
            type="text"
            value={formData?.home?.keywords || ""}
            onChange={(e) => updateField("home", "keywords", e.target.value)}
            placeholder="e.g. luxury bags, leather craft, quiet luxury"
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none text-stone-700 font-semibold"
          />
        </div>

        {/* Social OG data */}
        <div className="border-t border-black/5 pt-4 space-y-4">
          <p className="text-[9px] uppercase tracking-widest text-[#C9A96E] font-bold" style={R}>Social Share Preview (Open Graph Protocol)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>OG Social Share Title</label>
              <input
                type="text"
                value={formData?.home?.ogTitle || ""}
                onChange={(e) => updateField("home", "ogTitle", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>OG Social Share Thumbnail Image URL</label>
              <input
                type="text"
                value={formData?.home?.ogImage || ""}
                onChange={(e) => updateField("home", "ogImage", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>OG Social Share Summary Description</label>
              <input
                type="text"
                value={formData?.home?.ogDescription || ""}
                onChange={(e) => updateField("home", "ogDescription", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Twitter Card Layout</label>
              <select
                value={formData?.home?.twitterCard || "summary_large_image"}
                onChange={(e) => updateField("home", "twitterCard", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700 font-mono text-[10px]"
              >
                <option value="summary">Summary Card (Small Image)</option>
                <option value="summary_large_image">Summary Card with Large Image</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Journal / Blog SEO */}
      <div className="bg-white p-6 border border-black/6 shadow-sm space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-[#1A1714] border-b border-black/6 pb-2 font-bold" style={R}>Journal Editorial Index SEO</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Search Engine Page Title</label>
            <input
              type="text"
              value={formData?.blog?.title || ""}
              onChange={(e) => updateField("blog", "title", e.target.value)}
              className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700"
            />
          </div>
          <div>
            <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Canonical URL Link</label>
            <input
              type="text"
              value={formData?.blog?.canonicalUrl || ""}
              onChange={(e) => updateField("blog", "canonicalUrl", e.target.value)}
              className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-mono text-[10px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Meta Description</label>
          <textarea
            value={formData?.blog?.description || ""}
            onChange={(e) => updateField("blog", "description", e.target.value)}
            rows={2}
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Keywords (comma separated)</label>
          <input
            type="text"
            value={formData?.blog?.keywords || ""}
            onChange={(e) => updateField("blog", "keywords", e.target.value)}
            placeholder="e.g. styling guide, luxury journal, fashion atelier"
            className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2.5 bg-white outline-none text-stone-700 font-semibold"
          />
        </div>

        {/* Social OG data */}
        <div className="border-t border-black/5 pt-4 space-y-4">
          <p className="text-[9px] uppercase tracking-widest text-[#C9A96E] font-bold" style={R}>Social Share Preview (Open Graph Protocol)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>OG Social Share Title</label>
              <input
                type="text"
                value={formData?.blog?.ogTitle || ""}
                onChange={(e) => updateField("blog", "ogTitle", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>OG Social Share Thumbnail Image URL</label>
              <input
                type="text"
                value={formData?.blog?.ogImage || ""}
                onChange={(e) => updateField("blog", "ogImage", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>OG Social Share Summary Description</label>
              <input
                type="text"
                value={formData?.blog?.ogDescription || ""}
                onChange={(e) => updateField("blog", "ogDescription", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#8C7E6E] mb-1.5" style={R}>Twitter Card Layout</label>
              <select
                value={formData?.blog?.twitterCard || "summary_large_image"}
                onChange={(e) => updateField("blog", "twitterCard", e.target.value)}
                className="w-full border border-black/10 focus:border-[#C9A96E] px-3.5 py-2 bg-white outline-none font-semibold text-stone-700 font-mono text-[10px]"
              >
                <option value="summary">Summary Card (Small Image)</option>
                <option value="summary_large_image">Summary Card with Large Image</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onSave(formData)}
        className="bg-[#1A1714] text-white text-[10px] uppercase tracking-widest py-3 px-8 hover:bg-[#C9A96E] font-semibold transition-colors w-full"
        style={R}
      >
        Propagate & Update SEO Across Site
      </button>
    </div>
  );
}

// ─── ERROR BOUNDARY WRAPPER EXPORT ───────────────────────────────────────────

export default function AdminDashboardWithErrorBoundary() {
  return (
    <AdminDashboardErrorBoundary>
      <AdminDashboard />
    </AdminDashboardErrorBoundary>
  );
}
