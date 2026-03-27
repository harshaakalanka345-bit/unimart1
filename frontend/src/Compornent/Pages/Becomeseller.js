import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, API } from "../../context/AuthContext";

import "./BecomeSeller.css";

const BENEFITS = [
  { icon: "💰", title: "Earn Extra Cash", desc: "Turn unused textbooks, gadgets & items into money." },
  { icon: "🎓", title: "Campus Community", desc: "Connect with 1,800+ fellow SLIIT students." },
  { icon: "🛡️", title: "Safe & Secure", desc: "All buyers are verified university students." },
  { icon: "📱", title: "Easy Management", desc: "List, edit & manage your items from any device." },
  { icon: "💬", title: "Direct Messaging", desc: "Chat directly with buyers through the app." },
  { icon: "⭐", title: "Build Reputation", desc: "Earn seller ratings & grow your profile." },
];

const BecomeSeller = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="seller-page">
        <div className="container seller-login-prompt">
          <span>🔒</span>
          <h2>Login Required</h2>
          <p>You need to be logged in with a SLIIT email to become a seller.</p>
          <Link to="/login" className="btn btn-primary btn-lg">Login to Continue</Link>
        </div>
      </div>
    );
  }

  if (user.isSeller) {
    return (
      <div className="seller-page">
        <div className="container seller-already">
          <span>✅</span>
          <h2>You're already a Seller!</h2>
          <p>Your seller account is active. Start listing items now.</p>
          <div style={{display:"flex", gap:12}}>
            <Link to="/add-product" className="btn btn-primary btn-lg">➕ List New Item</Link>
            <Link to="/profile" className="btn btn-ghost btn-lg">View My Profile</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleBecomeSeller = () => {
    navigate("/become-seller/application");
  };

  if (success) {
    return (
      <div className="seller-page">
        <div className="container seller-success">
          <div className="success-animation">🎉</div>
          <h2>Welcome to UniMart Sellers!</h2>
          <p>Your seller account is now active. Start listing your first item!</p>
          <div style={{display:"flex", gap:12}}>
            <Link to="/add-product" className="btn btn-primary btn-lg">➕ List My First Item</Link>
            <Link to="/products" className="btn btn-ghost btn-lg">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-page">
      {/* Hero */}
      <div className="seller-hero">
        <div className="seller-hero__bg">
          <div className="seller-blob seller-blob--1" />
          <div className="seller-blob seller-blob--2" />
        </div>
        <div className="container seller-hero__content">
          <div className="seller-hero__text fade-in-up">
            <div className="seller-badge">🏷️ Become a Seller</div>
            <h1>Start Selling on <span className="gradient-text">UniMart</span> Today</h1>
            <p>Turn your unused items into cash. Join hundreds of SLIIT students already earning on UniMart Marketplace.</p>
          </div>
          <div className="seller-hero__card fade-in">
            <div className="seller-cta-card">
              <div className="seller-cta-card__header">
                <div className="seller-cta-icon">🎓</div>
                <div>
                  <h3>Free Seller Account</h3>
                  <p>No fees, no commission</p>
                </div>
              </div>
              <div className="seller-checklist">
                {["Verified SLIIT student","Free to list items","Instant activation","Secure messaging"].map(c => (
                  <div key={c} className="seller-check"><span className="check-icon">✓</span>{c}</div>
                ))}
              </div>

              {error && <div className="auth-error" style={{margin:"16px 0 0"}}><span>⚠️</span> {error}</div>}
              <button className={`btn btn-orange btn-lg seller-activate-btn ${loading ? "loading" : ""}`}
                style={{marginTop:"16px"}}
                onClick={handleBecomeSeller} disabled={loading}>
                {loading ? <><span className="btn-spinner" /> Navigating...</> : "🚀 Activate Seller Account"}
              </button>
              <p className="seller-terms">By activating, you agree to UniMart's <a href="#">Seller Guidelines</a>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section className="section seller-benefits">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">Why Sell on <span className="gradient-text">UniMart</span>?</h2>
            <p className="section-sub">Everything you need to sell successfully on campus</p>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map((b, i) => (
              <div key={i} className="benefit-card card fade-in-up" style={{animationDelay:`${i*0.08}s`}}>
                <div className="benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to sell */}
      <section className="section seller-how">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">How to Sell in <span className="gradient-text">3 Steps</span></h2>
          </div>
          <div className="sell-steps">
            {[
              { n:"01", icon:"✅", title:"Activate Your Seller Account", desc:"Click the button above to instantly activate your free seller account." },
              { n:"02", icon:"📸", title:"List Your Items", desc:"Upload photos, add a description, set your price and category." },
              { n:"03", icon:"💰", title:"Sell & Get Paid", desc:"Buyers contact you, meet on campus, and complete the transaction." },
            ].map(s => (
              <div key={s.n} className="sell-step">
                <div className="sell-step__num">{s.n}</div>
                <div className="sell-step__icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeSeller;
