import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

const categories = [
  { icon: "📚", label: "Textbooks", slug: "textbooks", color: "blue" },
  { icon: "💻", label: "Electronics", slug: "electronics", color: "orange" },
  { icon: "✏️", label: "Stationery", slug: "stationery", color: "green" },
  { icon: "👕", label: "Clothing", slug: "clothing", color: "blue" },
  { icon: "🛋️", label: "Furniture", slug: "furniture", color: "orange" },
  { icon: "⚽", label: "Sports", slug: "sports", color: "green" },
  { icon: "🎮", label: "Gaming", slug: "gaming", color: "blue" },
  { icon: "🎒", label: "Bags", slug: "bags", color: "orange" },
];

const mockProducts = [
  { _id: "1", title: "Engineering Mathematics Textbook", price: 1500, condition: "Good", category: "textbooks", images: [], views: 234, seller: { name: "Amal P.", rating: 4.8 }, status: "Available", createdAt: new Date() },
  { _id: "2", title: "HP Laptop 15\" 8GB RAM", price: 65000, condition: "Like New", category: "electronics", images: [], views: 892, seller: { name: "Nimal S.", rating: 4.5 }, status: "Available", createdAt: new Date() },
  { _id: "3", title: "Scientific Calculator Casio", price: 2200, condition: "New", category: "stationery", images: [], views: 145, seller: { name: "Kasun F.", rating: 5.0 }, status: "Available", createdAt: new Date() },
  { _id: "4", title: "Study Table with Drawer", price: 8500, condition: "Fair", category: "furniture", images: [], views: 378, seller: { name: "Dilani R.", rating: 4.2 }, status: "Available", createdAt: new Date() },
  { _id: "5", title: "Data Structures Book - Cormen", price: 3000, condition: "Good", category: "textbooks", images: [], views: 512, seller: { name: "Saman W.", rating: 4.9 }, status: "Available", createdAt: new Date() },
  { _id: "6", title: "Arduino Starter Kit", price: 4500, condition: "Like New", category: "electronics", images: [], views: 267, seller: { name: "Priya M.", rating: 4.7 }, status: "Available", createdAt: new Date() },
];

const stats = [
  { icon: "🛍️", value: "2,400+", label: "Products Listed" },
  { icon: "👩‍🎓", value: "1,800+", label: "Students" },
  { icon: "✅", value: "950+", label: "Deals Completed" },
  { icon: "⭐", value: "4.8", label: "Avg. Rating" },
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [animatedStats, setAnimatedStats] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    else navigate("/products");
  };

  const conditionColor = (c) => c === "New" ? "badge-green" : c === "Like New" ? "badge-blue" : "badge-gray";

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__blob hero__blob--3" />
        </div>
        <div className="container hero__content">
          <div className="hero__text fade-in-up">
            <div className="hero__pill">
              <span className="pill-dot" />
              Campus Marketplace · SLIIT Students Only
            </div>
            <h1 className="hero__title">
              Buy & Sell Within<br />
              <span className="gradient-text">Your Campus</span> 🎓
            </h1>
            <p className="hero__subtitle">
              Sri Lanka's smartest student marketplace. Find textbooks, electronics, and more — all from fellow students at your university.
            </p>
            <form className="search-bar" onSubmit={handleSearch}>
              <div className="search-bar__input-wrap">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text" placeholder="Search for textbooks, laptops, calculators..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg search-btn">Search</button>
            </form>
            <div className="hero__tags">
              {["Textbooks", "Laptops", "Calculator", "Lab Coat", "Arduino"].map(tag => (
                <button key={tag} className="tag-chip" onClick={() => { setSearchQuery(tag); navigate(`/products?search=${tag}`); }}>{tag}</button>
              ))}
            </div>
          </div>
          <div className="hero__illustration fade-in">
            <div className="hero__cards">
              {mockProducts.slice(0,3).map((p, i) => (
                <div key={p._id} className="hero__mini-card" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="mini-card__img">{["📚","💻","✏️"][i]}</div>
                  <div className="mini-card__info">
                    <p>{p.title.slice(0,22)}...</p>
                    <strong className="text-orange">Rs. {p.price.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-bar">
        <div className="container stats-grid">
          {stats.map((s, i) => (
            <div key={i} className={`stat-item fade-in-up`} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by <span className="gradient-text">Category</span></h2>
            <p className="section-sub">Find exactly what you need</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className={`category-card category-card--${cat.color}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">🔥 Featured <span className="gradient-text">Listings</span></h2>
              <p className="section-sub">Latest items from your campus</p>
            </div>
            <Link to="/products" className="btn btn-outline">View All →</Link>
          </div>
          <div className="products-grid">
            {mockProducts.map((product, i) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="product-card card fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="product-card__img">
                  <div className="product-card__placeholder">{["📚","💻","✏️","🛋️","📖","⚡"][i]}</div>
                  <span className={`badge ${conditionColor(product.condition)} product-card__condition`}>{product.condition}</span>
                </div>
                <div className="product-card__body">
                  <p className="product-card__category">{product.category}</p>
                  <h3 className="product-card__title">{product.title}</h3>
                  <div className="product-card__footer">
                    <strong className="product-card__price">Rs. {product.price.toLocaleString()}</strong>
                    <div className="product-card__meta">
                      <span>👁️ {product.views}</span>
                      <span>⭐ {product.seller.rating}</span>
                    </div>
                  </div>
                  <p className="product-card__seller">by {product.seller.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">How <span className="gradient-text">UniMart</span> Works</h2>
            <p className="section-sub">Simple, safe & student-friendly</p>
          </div>
          <div className="steps-grid">
            {[
              { step: "01", icon: "📝", title: "Register with Uni Email", desc: "Sign up using your official university email to verify you're a SLIIT student.", color: "blue" },
              { step: "02", icon: "🛍️", title: "List or Browse", desc: "Post items you want to sell or browse hundreds of student listings.", color: "orange" },
              { step: "03", icon: "💬", title: "Chat & Negotiate", desc: "Message sellers directly through our secure in-app messaging system.", color: "green" },
              { step: "04", icon: "🤝", title: "Meet & Complete Deal", desc: "Meet on campus safely and complete your transaction with ease.", color: "blue" },
            ].map((s) => (
              <div key={s.step} className={`step-card step-card--${s.color}`}>
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-text">
              <h2>Ready to Start Selling? 🎓</h2>
              <p>Turn your unused textbooks, gadgets & more into cash. Join hundreds of students already earning on UniMart.</p>
            </div>
            <div className="cta-actions">
              <Link to="/become-seller" className="btn btn-orange btn-lg">Become a Seller</Link>
              <Link to="/products" className="btn btn-ghost btn-lg">Browse Products</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
