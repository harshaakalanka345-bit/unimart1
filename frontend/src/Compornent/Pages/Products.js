import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API } from "../../context/AuthContext";
import "./Product.css";

const CATEGORIES = ["All","textbooks","electronics","stationery","clothing","furniture","sports","gaming","bags","other"];
const CONDITIONS = ["All","New","Like New","Good","Fair","Poor"];
const SORTS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "most_viewed", label: "Most Viewed" },
];
const CAT_ICONS = { textbooks:"📚", electronics:"💻", stationery:"✏️", clothing:"👕", furniture:"🛋️", sports:"⚽", gaming:"🎮", bags:"🎒", other:"📦" };

const ProductCard = ({ product }) => {
  const conditionBadge = product.condition === "New" ? "badge-green" : product.condition === "Like New" ? "badge-blue" : "badge-gray";
  return (
    <Link to={`/products/${product._id}`} className="pcard card fade-in-up">
      <div className="pcard__img">
        {product.images?.length > 0
          ? <img src={product.images[0]} alt={product.title} />
          : <span className="pcard__emoji">{CAT_ICONS[product.category] || "📦"}</span>}
        <span className={`badge ${conditionBadge} pcard__condition`}>{product.condition}</span>
        {product.views > 200 && <span className="pcard__hot">🔥 Hot</span>}
      </div>
      <div className="pcard__body">
        <p className="pcard__cat">{product.category}</p>
        <h3 className="pcard__title">{product.title}</h3>
        <div className="pcard__footer">
          <strong className="pcard__price">Rs. {product.price.toLocaleString()}</strong>
          <div className="pcard__meta">
            <span title="Views">👁️ {product.views}</span>
            {product.seller?.rating > 0 && <span title="Seller rating">⭐ {(product.seller.rating / product.seller.totalRatings).toFixed(1)}</span>}
          </div>
        </div>
        <div className="pcard__seller">
          <div className="pcard__avatar">
            {product.seller?.profilePicture
              ? <img src={product.seller.profilePicture} alt="" />
              : <span>{product.seller?.name?.charAt(0)}</span>}
          </div>
          <span>{product.seller?.name}</span>
        </div>
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="pcard card">
    <div className="skeleton" style={{height:180}} />
    <div className="pcard__body">
      <div className="skeleton" style={{height:12, width:"50%", marginBottom:8}} />
      <div className="skeleton" style={{height:18, marginBottom:6}} />
      <div className="skeleton" style={{height:14, width:"70%"}} />
    </div>
  </div>
);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const condition = searchParams.get("condition") || "All";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = Number(searchParams.get("page")) || 1;

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== "All") p.set(key, val); else p.delete(key);
    p.set("page", "1");
    setSearchParams(p);
  };
  const setPage = (n) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", String(n));
    setSearchParams(p);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      if (condition !== "All") params.condition = condition;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const data = await API.get("/products", { params });
      setProducts(data.products || []);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      const p = new URLSearchParams(searchParams);
      if (searchInput && searchInput !== "All") p.set("search", searchInput);
      else p.delete("search");
      
      // Only reset to page 1 and trigger URL change if search actually changed
      if (p.get("search") !== searchParams.get("search")) {
        p.set("page", "1");
        setSearchParams(p);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  const clearFilters = () => setSearchParams({ sort: "newest", page: "1" });

  const hasFilters = category !== "All" || condition !== "All" || minPrice || maxPrice || search;

  return (
    <div className="products-page">
      {/* Top bar */}
      <div className="products-topbar">
        <div className="container products-topbar__inner">
          <div className="products-topbar__left">
            <h1>Browse Products</h1>
            <p>{loading ? "Loading..." : `${total} item${total !== 1 ? "s" : ""} found`}</p>
          </div>
          <div className="products-topbar__right">
            {/* Search */}
            <div className="topbar-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search products..." value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <select className="form-select sort-select" value={sort} onChange={e => setParam("sort", e.target.value)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ⚙️ Filters {hasFilters && <span className="filter-dot" />}
            </button>
          </div>
        </div>
      </div>

      <div className="container products-layout">
        {/* Sidebar */}
        <aside className={`filters-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>}
          </div>

          <div className="filter-section">
            <h4>Category</h4>
            <div className="filter-pills">
              {CATEGORIES.map(c => (
                <button key={c} className={`filter-pill ${category === c ? "active-blue" : ""}`} onClick={() => setParam("category", c)}>
                  {CAT_ICONS[c] || ""} {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Condition</h4>
            <div className="filter-pills">
              {CONDITIONS.map(c => (
                <button key={c} className={`filter-pill ${condition === c ? "active-orange" : ""}`} onClick={() => setParam("condition", c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Price Range (Rs.)</h4>
            <div className="price-range-inputs">
              <input className="form-input" type="number" placeholder="Min" value={minPrice}
                onChange={e => { const p = new URLSearchParams(searchParams); if(e.target.value) p.set("minPrice", e.target.value); else p.delete("minPrice"); p.set("page","1"); setSearchParams(p); }} />
              <span>—</span>
              <input className="form-input" type="number" placeholder="Max" value={maxPrice}
                onChange={e => { const p = new URLSearchParams(searchParams); if(e.target.value) p.set("maxPrice", e.target.value); else p.delete("maxPrice"); p.set("page","1"); setSearchParams(p); }} />
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="products-main">
          {/* Active filters */}
          {hasFilters && (
            <div className="active-filters">
              {search && <span className="filter-tag">🔍 "{search}" <button onClick={() => setParam("search", "")}>×</button></span>}
              {category !== "All" && <span className="filter-tag">{CAT_ICONS[category]} {category} <button onClick={() => setParam("category", "")}>×</button></span>}
              {condition !== "All" && <span className="filter-tag">{condition} <button onClick={() => setParam("condition", "")}>×</button></span>}
              {(minPrice || maxPrice) && <span className="filter-tag">Rs. {minPrice || "0"} – {maxPrice || "∞"} <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete("minPrice"); p.delete("maxPrice"); setSearchParams(p); }}>×</button></span>}
            </div>
          )}

          <div className="pgrid">
            {loading
              ? Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.length > 0
                ? products.map(p => <ProductCard key={p._id} product={p} />)
                : (
                  <div className="no-results">
                    <span className="no-results__icon">🔍</span>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search query</p>
                    <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
                  </div>
                )
            }
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="pag-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => Math.abs(n - page) <= 2).map(n => (
                <button key={n} className={`pag-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="pag-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
