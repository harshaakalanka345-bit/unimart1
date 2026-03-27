import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "../../context/AuthContext";
import "./Myorders.css";

const STATUS_COLORS = { Pending: "badge-orange", Reserved: "badge-blue", Completed: "badge-green", Cancelled: "badge-gray" };
const STATUS_ICONS = { Pending: "⏳", Reserved: "🔒", Completed: "✅", Cancelled: "❌" };
const TABS = ["All", "Buying", "Selling"];

const MyOrders = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await API.get("/transactions/my");
      setTransactions(data || []);
    } catch (e) { console.error("Error fetching transactions:", e); } finally { setLoading(false); }
  };

  const updateStatus = async (id, status, reason = "") => {
    setActionLoading(id + status);
    try {
      await API.patch(`/transactions/${id}/status`, { status, cancelReason: reason });
      await fetchTransactions();
    } catch {} finally { setActionLoading(""); }
  };

  const submitReview = async () => {
    try {
      await API.post(`/transactions/${reviewModal}/review`, review);
      setReviewModal(null);
      await fetchTransactions();
    } catch {}
  };

  const filtered = transactions.filter(t => {
    if (tab === "Buying") return t.buyer?._id === user._id;
    if (tab === "Selling") return t.seller?._id === user._id;
    return true;
  });

  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <div>
            <h1>My Orders</h1>
            <p>Track and manage all your transactions</p>
          </div>
          <div className="orders-stats">
            {["Pending","Completed","Cancelled"].map(s => (
              <div key={s} className="orders-stat">
                <span className="orders-stat__value">{transactions.filter(t => t.status === s).length}</span>
                <span className="orders-stat__label">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="orders-tabs">
          {TABS.map(t => (
            <button key={t} className={`orders-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="orders-loading">
            {Array(3).fill(0).map((_,i) => (
              <div key={i} className="order-card-skeleton card">
                <div style={{display:"flex",gap:16,padding:20}}>
                  <div className="skeleton" style={{width:80,height:80,borderRadius:"8px",flexShrink:0}} />
                  <div style={{flex:1}}>
                    <div className="skeleton" style={{height:14,marginBottom:10}} />
                    <div className="skeleton" style={{height:12,width:"60%",marginBottom:8}} />
                    <div className="skeleton" style={{height:12,width:"40%"}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="orders-empty">
            <span>📦</span>
            <h3>No orders yet</h3>
            <p>{tab === "Buying" ? "Start browsing products to make a purchase." : tab === "Selling" ? "List a product to start receiving orders." : "Your transactions will appear here."}</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map(t => {
              const isBuyer = t.buyer?._id === user._id;
              const other = isBuyer ? t.seller : t.buyer;
              return (
                <div key={t._id} className="order-card card">
                  <div className="order-card__body">
                    {/* Product image */}
                    <div className="order-product-img">
                      {t.product?.images?.[0]
                        ? <img src={t.product.images[0]} alt={t.product.title} />
                        : <span>📦</span>}
                    </div>

                    {/* Details */}
                    <div className="order-details">
                      <div className="order-details__top">
                        <div>
                          <p className="order-product-title">{t.product?.title}</p>
                          <p className="order-product-cat">{t.product?.category}</p>
                        </div>
                        <div className="order-status-wrap">
                          <span className={`badge ${STATUS_COLORS[t.status]}`}>{STATUS_ICONS[t.status]} {t.status}</span>
                        </div>
                      </div>
                      <div className="order-meta">
                        <span>💰 Rs. {t.amount?.toLocaleString()}</span>
                        <span>{t.paymentMethod === "cash_on_meetup" ? "🤝 Cash on Meetup" : "🏦 Bank Transfer"}</span>
                        <span>📅 {formatDate(t.createdAt)}</span>
                        <span>{isBuyer ? "👤 Seller:" : "👤 Buyer:"} <strong>{other?.name}</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="order-actions">
                      {(t.status === "Pending" || t.status === "Reserved") && !isBuyer && (
                        <button className="btn btn-green btn-sm" disabled={actionLoading === t._id + "Completed"}
                          onClick={() => updateStatus(t._id, "Completed")}>
                          {actionLoading === t._id + "Completed" ? "..." : "✅ Mark Completed"}
                        </button>
                      )}
                      {(t.status === "Pending" || t.status === "Reserved") && (
                        <button className="btn btn-ghost btn-sm" style={{color:"var(--danger)"}}
                          disabled={actionLoading === t._id + "Cancelled"}
                          onClick={() => updateStatus(t._id, "Cancelled", "Cancelled by user")}>
                          {actionLoading === t._id + "Cancelled" ? "..." : "❌ Cancel"}
                        </button>
                      )}
                      {t.status === "Completed" && isBuyer && !t.review?.rating && (
                        <button className="btn btn-orange btn-sm" onClick={() => setReviewModal(t._id)}>⭐ Rate Seller</button>
                      )}
                      {t.review?.rating && (
                        <div className="order-review-given">
                          {"⭐".repeat(t.review.rating)} <span>Review given</span>
                        </div>
                      )}
                      <Link to={`/products/${t.product?._id}`} className="btn btn-ghost btn-sm">View Item</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Rate the Seller ⭐</h3>
            <p>How was your experience?</p>
            <div className="star-select">
              {[1,2,3,4,5].map(n => (
                <button key={n} className={`star-btn ${review.rating >= n ? "active" : ""}`}
                  onClick={() => setReview(p => ({ ...p, rating: n }))}>⭐</button>
              ))}
            </div>
            <textarea className="form-textarea" placeholder="Write your review (optional)..."
              value={review.comment} onChange={e => setReview(p => ({ ...p, comment: e.target.value }))} />
            <div style={{display:"flex", gap:10, marginTop:16}}>
              <button className="btn btn-ghost" style={{flex:1}} onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-orange" style={{flex:1}} onClick={submitReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
