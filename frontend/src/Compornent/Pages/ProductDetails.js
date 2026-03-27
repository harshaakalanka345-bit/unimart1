import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth, API } from "../../context/AuthContext";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_meetup");

  // Comments state
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await API.get(`/products/${id}`);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
      } catch (err) {
        setError(err.message || "Error loading product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      return navigate("/login");
    }
    
    setPurchasing(true);
    setPurchaseError("");
    try {
      await API.post("/transactions", { productId: product._id, paymentMethod });
      navigate("/my-orders");
    } catch (err) {
      setPurchaseError(err.message || "Failed to process purchase.");
      setPurchasing(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    setCommentError("");
    try {
      const res = await API.post(`/products/${id}/comments`, { comment: newComment });
      setProduct(prev => ({ ...prev, comments: res.comments }));
      setNewComment("");
    } catch (err) {
      setCommentError(err.message || "Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/600x400?text=No+Image";
    return url.startsWith("http") ? url : `http://localhost:5000${url}`;
  };

  if (loading) return <div className="product-details-page loading-screen"><span className="btn-spinner" style={{width:"40px",height:"40px",borderWidth:"4px"}} /></div>;
  if (error || !product) return <div className="product-details-page error-screen"><h2>Item Not Found</h2><p>{error}</p><Link to="/products" className="btn btn-primary">Back to Shop</Link></div>;

  const isOwner = user && product.seller?._id === user._id;

  return (
    <div className="product-details-page fade-in">
      <div className="details-container">
        {/* Left Side: Media Gallery */}
        <div className="gallery-section">
          <div className="main-image-container">
            <img src={getImageUrl(activeImage)} alt={product.title} className="main-image" />
            
            {/* Status Badges overlay */}
            <div className="status-overlay">
              {product.status !== "Available" && (
                <span className={`badge ${product.status === "Reserved" ? "badge-warning" : "badge-gray"}`} style={{fontSize: "1rem", padding:"8px 16px"}}>
                  {product.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          
        {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="thumbnails-container">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${activeImage === img ? "active" : ""}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Product Comments / Opinions Box */}
          <div className="comments-card premium-card" style={{marginTop:"20px", padding:"30px"}}>
            <h3 style={{marginBottom:"20px", color:"#111827", display:"flex", alignItems:"center", gap:"8px"}}>
              💬 Community Experiences 
              <span className="badge badge-gray" style={{fontSize:"0.9rem"}}>{product.comments?.length || 0}</span>
            </h3>

            {/* Comment Submission Form */}
            {user ? (
              <div className="comment-form-box">
                <textarea 
                  className="form-input comment-input" 
                  placeholder="Have you used this product or model? Share your experience with the community..." 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                ></textarea>
                {commentError && <div className="auth-error" style={{marginTop:"10px"}}>⚠️ {commentError}</div>}
                <div className="comment-actions" style={{display:"flex", justifyContent:"flex-end", marginTop:"12px"}}>
                  <button 
                    className={`btn btn-primary ${submittingComment ? "loading" : ""}`} 
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || submittingComment}
                    style={{borderRadius:"12px", fontWeight:"bold", padding:"10px 24px"}}
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="login-prompt-banner" style={{background:"#f9fafb", padding:"16px", borderRadius:"12px", textAlign:"center", border:"1px solid #e5e7eb", marginBottom:"24px"}}>
                <p style={{margin:0, color:"#4b5563"}}>Please <Link to="/login" style={{color:"var(--primary)", fontWeight:"bold", textDecoration:"none"}}>log in</Link> to join the discussion.</p>
              </div>
            )}

            {/* Comments List */}
            <div className="comments-list" style={{marginTop:"30px", display:"flex", flexDirection:"column", gap:"20px"}}>
              {product.comments && product.comments.length > 0 ? (
                product.comments.slice().reverse().map((c) => (
                  <div key={c._id} className="comment-item" style={{display:"flex", gap:"16px"}}>
                    <div className="comment-avatar" style={{width:"45px", height:"45px", borderRadius:"50%", background:"linear-gradient(135deg, var(--primary) 0%, #ff5e00 100%)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", flexShrink:0, overflow:"hidden"}}>
                      {c.profilePicture ? <img src={getImageUrl(c.profilePicture)} alt={c.name} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : c.name?.charAt(0) || "U"}
                    </div>
                    <div className="comment-body" style={{background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"16px", padding:"16px", flex:1, borderTopLeftRadius:"0"}}>
                      <div className="comment-header" style={{display:"flex", justifyContent:"space-between", marginBottom:"8px"}}>
                        <strong style={{color:"#111827", fontSize:"0.95rem"}}>{c.name}</strong>
                        <span style={{color:"#9ca3af", fontSize:"0.8rem"}}>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{margin:0, color:"#4b5563", fontSize:"0.95rem", lineHeight:"1.5", whiteSpace:"pre-wrap"}}>{c.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{color:"#6b7280", textAlign:"center", padding:"20px 0"}}>
                  No experiences shared yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Product & Checkout Info */}
        <div className="info-section">
          
          {/* Product Info & Description Box */}
          <div className="product-description-card premium-card" style={{padding:"30px", marginBottom:"24px"}}>
            <div className="product-header">
              <div className="breadcrumbs">
                <Link to="/products">Marketplace</Link> / <span>{product.category}</span>
              </div>
              <h1 className="product-title">{product.title}</h1>
              <div className="product-price">
                Rs {product.price.toLocaleString()}
              </div>
              <div className="product-meta-tags">
                <span className="meta-tag condition-tag">✨ Condition: {product.condition}</span>
                <span className="meta-tag views-tag">👁️ {product.views} views</span>
                <span className="meta-tag time-tag">⏰ Listed {new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <hr className="divider" style={{margin: "24px 0", borderTop: "1px solid #e5e7eb"}} />

            <h3 style={{marginBottom:"16px", color:"#111827"}}>Description</h3>
            <p className="product-description" style={{margin:0}}>{product.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="product-keywords" style={{marginTop:"20px"}}>
                {product.tags.map(tag => <span key={tag} className="keyword">#{tag}</span>)}
              </div>
            )}
          </div>

          {/* Checkout Block Feature Card */}
          <div className="checkout-card">
            {product.status === "Available" ? (
              <div className="action-block">
                {isOwner ? (
                  <div className="owner-notice" style={{textAlign:"center", padding:"10px"}}>
                    <h3 style={{marginBottom:"12px"}}>🛒 Your Listing</h3>
                    <Link to={`/edit-product/${product._id}`} className="btn btn-outline" style={{width: "100%", padding:"16px", borderRadius:"12px", fontWeight:"bold"}}>Edit Item Details</Link>
                  </div>
                ) : (
                  <div className="purchase-controls">
                    <div className="payment-method-selector">
                      <label>Select Payment Method</label>
                      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="cash_on_meetup">Cash on Pickup / Meetup</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                    {purchaseError && <div className="auth-error" style={{margin:"0 0 16px 0", borderRadius:"12px"}}><span>⚠️</span> {purchaseError}</div>}
                    <button 
                      className={`btn buy-btn ${purchasing ? "loading" : ""}`} 
                      onClick={handlePurchase} 
                      disabled={purchasing}
                    >
                      {purchasing ? <><span className="btn-spinner" style={{marginRight:"8px", borderColor:"white", borderTopColor:"transparent"}} /> Processing...</> : "🚀 Secure Checkout"}
                    </button>
                    <div className="secure-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      Verified by UniMart Protection
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="sold-out-block">
                <h3 style={{marginBottom:"8px", color:"#991b1b"}}>Product Unavailable</h3>
                <p>This item is currently marked as <strong>{product.status.toUpperCase()}</strong>.</p>
              </div>
            )}
          </div>

          {/* Seller Card */}
          <div className="seller-profile-card">
            <h4>About the Seller</h4>
            <div className="seller-card-content">
              <div className="seller-card-avatar">
                {product.seller?.profilePicture ? (
                  <img src={getImageUrl(product.seller?.profilePicture)} alt={product.seller?.name} />
                ) : (
                  <span>{product.seller?.name?.charAt(0) || "U"}</span>
                )}
              </div>
              <div className="seller-card-info">
                <strong>{product.seller?.name}</strong>
                <div className="seller-rating">
                  ⭐ {(product.seller?.rating / (product.seller?.totalRatings || 1)).toFixed(1)} 
                  <span>({product.seller?.totalRatings || 0} reviews)</span>
                </div>
                {product.seller?.faculty && (
                  <div className="seller-faculty">🎓 {product.seller.faculty}</div>
                )}
              </div>
            </div>
            <button className="btn btn-outline btn-sm block-btn" style={{marginTop:"12px", width:"100%"}}>💬 Message Seller</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
