import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, Clock, User, Tag, Calendar, Mail, MapPin } from "lucide-react";
import { db, type Blog } from "../utils/db";

const F = { fontFamily: "'Playfair Display', Georgia, serif" as const };
const R = { fontFamily: "'Raleway', system-ui, sans-serif" as const };
const D = { fontFamily: "'DM Sans', system-ui, sans-serif" as const };

export default function Journal() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  // Load database blogs
  const loadBlogs = () => {
    const allBlogs = db.getBlogs() || [];
    const publishedBlogs = allBlogs.filter((b) => b.status === "published");
    setBlogs(publishedBlogs);
    db.updateSeoTags();
  };

  useEffect(() => {
    loadBlogs();
    window.addEventListener("grativa_db_update", loadBlogs);
    return () => window.removeEventListener("grativa_db_update", loadBlogs);
  }, []);

  // Update document title for detail pages dynamically
  useEffect(() => {
    if (slug) {
      const activePost = blogs.find((b) => b.slug === slug);
      if (activePost) {
        document.title = activePost.metaTitle || `${activePost.title} | GRATIVA Journal`;
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && activePost.metaDescription) {
          metaDesc.setAttribute("content", activePost.metaDescription);
        }
      }
    } else {
      db.updateSeoTags();
    }
  }, [slug, blogs]);

  // Find active blog post if in slug view
  const activePost = slug ? blogs.find((b) => b.slug === slug) : null;

  return (
    <div className="bg-[#FAF8F4] min-h-screen flex flex-col" style={D}>
      {/* Editorial Mini Navbar */}
      <header className="border-b border-black/8 bg-[#FAF8F4]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="text-[10px] tracking-[0.25em] uppercase text-[#1A1714] hover:text-[#C9A96E] transition-colors" style={R}>
            ← Back to Store
          </Link>
          <Link to="/journal" className="text-xl tracking-[0.35em] text-[#1A1714] font-normal" style={F}>
            GRATIVA
          </Link>
          <div className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E]" style={R}>
            The Journal
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-[1400px] mx-auto px-6 lg:px-10 py-12 w-full">
        {activePost ? (
          /* BLOG ARTICLE DETAIL VIEW */
          <article className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate("/journal")}
              className="inline-flex items-center gap-2 text-xs text-[#8C7E6E] hover:text-[#1A1714] transition-colors mb-8"
              style={R}
            >
              <ArrowLeft size={14} />
              Back to Journal
            </button>

            {/* Header info */}
            <div className="mb-8">
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] bg-[#EDE6DA] px-3 py-1 font-semibold" style={R}>
                {activePost.category}
              </span>
              <h1 className="text-3xl md:text-5xl text-[#1A1714] font-normal leading-[1.15] mt-4 mb-6" style={F}>
                {activePost.title}
              </h1>
              
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-[#8C7E6E] border-y border-black/6 py-4">
                <div className="flex items-center gap-2">
                  <User size={13} className="text-[#C9A96E]" />
                  <span>By {activePost.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-[#C9A96E]" />
                  <span>{activePost.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-[#C9A96E]" />
                  <span>4 min read</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-[16/9] w-full overflow-hidden bg-[#EDE6DA] mb-10 shadow-sm">
              <img
                src={activePost.featuredImage}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Rich Content Area */}
            <div 
              className="prose prose-stone max-w-none text-[#2A2420] text-sm md:text-base leading-[1.9] space-y-6"
              style={{ fontWeight: 300 }}
              dangerouslySetInnerHTML={{ __html: activePost.content }}
            />

            {/* Call to action */}
            <div className="mt-16 border-t border-black/8 pt-10 text-center">
              <p className="text-xs text-[#8C7E6E] uppercase tracking-[0.2em] mb-4" style={R}>Enjoyed the read?</p>
              <Link
                to="/"
                className="inline-block bg-[#1A1714] text-white text-[10px] tracking-[0.3em] uppercase px-8 py-4 hover:bg-[#C9A96E] transition-all duration-300"
                style={R}
              >
                Explore the Signature Collection
              </Link>
            </div>
          </article>
        ) : (
          /* BLOG LIST VIEW */
          <div>
            {/* Header Title */}
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E]" style={R}>EDITORIAL</span>
              <h1 className="text-4xl md:text-5xl mt-2 mb-4 text-[#1A1714]" style={F}>THE JOURNAL</h1>
              <div className="h-[1px] w-12 bg-[#C9A96E] mx-auto mb-5" />
              <p className="text-[#8C7E6E] text-xs md:text-sm font-light leading-[1.8]" style={D}>
                A space dedicated to the details. Stories of slow craftsmanship, curated styling, and the design ideals that inspire the GRATIVA universe.
              </p>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-20 bg-white border border-black/5">
                <p className="text-sm text-[#8C7E6E]" style={D}>New journal entries are currently being written at the atelier. Check back shortly.</p>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Featured / Hero Blog Post */}
                {blogs[0] && (
                  <div 
                    onClick={() => navigate(`/journal/${blogs[0].slug}`)}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white border border-black/6 p-6 md:p-8 cursor-pointer group hover:shadow-md transition-all duration-300"
                  >
                    <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-[#EDE6DA]">
                      <img
                        src={blogs[0].featuredImage}
                        alt={blogs[0].title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="lg:col-span-5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[9px] tracking-[0.25em] uppercase text-[#C9A96E] font-medium" style={R}>{blogs[0].category}</span>
                        <span className="text-stone-300">·</span>
                        <span className="text-[9px] text-[#8C7E6E]" style={D}>{blogs[0].date}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl text-[#1A1714] font-normal leading-snug mb-4 group-hover:text-[#C9A96E] transition-colors" style={F}>
                        {blogs[0].title}
                      </h2>
                      <p className="text-xs md:text-sm text-[#8C7E6E] leading-relaxed mb-6 font-light" style={D}>
                        {blogs[0].excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[9px] tracking-[0.25em] uppercase text-[#1A1714] font-medium group-hover:translate-x-2 transition-transform duration-300" style={R}>
                        Read Story <ArrowLeft size={11} className="rotate-180" />
                      </span>
                    </div>
                  </div>
                )}

                {/* Subgrid of other posts */}
                {blogs.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.slice(1).map((blog) => (
                      <article 
                        key={blog.id}
                        onClick={() => navigate(`/journal/${blog.slug}`)}
                        className="bg-white border border-black/6 flex flex-col h-full cursor-pointer group hover:shadow-sm transition-all duration-300"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden bg-[#EDE6DA]">
                          <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[9px] tracking-[0.22em] uppercase text-[#C9A96E] font-medium" style={R}>{blog.category}</span>
                              <span className="text-stone-300">·</span>
                              <span className="text-[9px] text-[#8C7E6E]" style={D}>{blog.date}</span>
                            </div>
                            <h3 className="text-lg text-[#1A1714] leading-snug mb-3 font-normal group-hover:text-[#C9A96E] transition-colors" style={F}>
                              {blog.title}
                            </h3>
                            <p className="text-xs text-[#8C7E6E] leading-relaxed font-light mb-4" style={D}>
                              {blog.excerpt}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-2 text-[9px] tracking-[0.25em] uppercase text-[#1A1714] font-semibold mt-auto" style={R}>
                            Read story
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Basic Journal Footer */}
      <footer className="bg-[#120F0C] text-white/40 border-t border-white/5 py-12 mt-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-white text-lg tracking-[0.3em] font-normal" style={F}>GRATIVA</p>
            <p className="text-xs text-white/30 mt-1" style={D}>Stories of craftsmanship and quiet luxury.</p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/" className="hover:text-white transition-colors" style={D}>Home</Link>
            <Link to="/journal" className="hover:text-white transition-colors" style={D}>Journal</Link>
            <a href="#" className="hover:text-white transition-colors" style={D}>Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
