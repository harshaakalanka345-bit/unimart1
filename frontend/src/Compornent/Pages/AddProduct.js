import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AddProduct.css";

const CATEGORIES = ["textbooks", "electronics", "stationery", "clothing", "other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    tags: ""
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only verified sellers can list products
  if (!user || (!user.isSeller && user.role !== "admin")) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{maxWidth: "500px", padding: "40px", textAlign: "center", margin: "100px auto"}}>
          <h2>Not a Seller Yet! 🛍️</h2>
          <p style={{marginBottom: "20px", color: "var(--text-light)"}}>You need to activate your professional seller profile before listing items.</p>
          <button className="btn btn-orange" onClick={() => navigate("/become-seller")}>Become a Seller Now</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      setError("You can only upload up to 6 images.");
      return;
    }
    setImages(files);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.category || !form.condition) {
      return setError("Please fill all required fields.");
    }
    if (images.length === 0) {
       return setError("Please upload at least one image of your item.");
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", Number(form.price));
      formData.append("category", form.category);
      formData.append("condition", form.condition);
      
      // Process comma separated tags into JSON string array
      if (form.tags) {
        const tagArray = form.tags.split(",").map(t => t.trim()).filter(t => t);
        formData.append("tags", JSON.stringify(tagArray));
      }

      images.forEach(img => formData.append("images", img));

      const token = localStorage.getItem("unimart_token");
      const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      
      const res = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to list item.");

      navigate(`/products/${data._id}`); // Navigate to the new product page
    } catch (err) {
      setError(err.message || "An error occurred while uploading. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-header">
        <h1>List a New Item 📦</h1>
        <p>Post your textbook, electronics, or dorm items so other students can buy them!</p>
      </div>

      <div className="add-product-card slide-up">
        {error && <div className="auth-error" style={{marginBottom: "20px"}}><span>⚠️</span> {error}</div>}
        
        <form onSubmit={handleSubmit} className="add-product-form">
          
          {/* Photos Upload Section */}
          <div className="form-section">
            <h3 className="section-title">Item Photos <span className="req">*</span></h3>
            <p className="section-sub">Upload up to 6 images showing your item's current condition.</p>
            
            <div className="image-upload-area">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                className="file-input-hidden"
                id="product-images"
              />
              <label htmlFor="product-images" className="image-upload-label">
                <span className="upload-icon">📸</span>
                <span>Click to select photos</span>
                <span className="upload-limit">Max 6 images, up to 5MB each.</span>
              </label>

              {images.length > 0 && (
                <div className="image-preview-list">
                  {images.map((img, i) => (
                    <div key={i} className="image-preview-chip">
                      <span>✓</span> {img.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <hr className="divider" />

          {/* Details Section */}
          <div className="form-section">
            <h3 className="section-title">Product Details</h3>
            <p className="section-sub">Make it easy for buyers to find your listing.</p>

            <div className="form-group row">
              <div style={{flex: 2}}>
                <label className="form-label">Title <span className="req">*</span></label>
                <input type="text" className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Intro to Java Programming 5th Ed" />
              </div>
              <div style={{flex: 1}}>
                <label className="form-label">Price (LKR) <span className="req">*</span></label>
                <div className="price-input-wrapper">
                  <span className="currency-symbol">Rs</span>
                  <input type="number" step="0.01" min="0" className="form-input price-input" name="price" value={form.price} onChange={handleChange} placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="form-group row">
              <div style={{flex: 1}}>
                <label className="form-label">Category <span className="req">*</span></label>
                <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div style={{flex: 1}}>
                <label className="form-label">Condition <span className="req">*</span></label>
                <select className="form-input" name="condition" value={form.condition} onChange={handleChange}>
                  <option value="">Select condition</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description <span className="req">*</span></label>
              <textarea className="form-input" name="description" value={form.description} onChange={handleChange} placeholder="Describe any flaws, usage, or special details." rows="4" style={{resize: "vertical", minHeight: "100px"}} />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (Optional)</label>
              <input type="text" className="form-input" name="tags" value={form.tags} onChange={handleChange} placeholder="Comma separated, e.g. textbook, computing, rare" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={`btn btn-orange btn-lg ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Listing item...</> : "🚀 List Item Now"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;
