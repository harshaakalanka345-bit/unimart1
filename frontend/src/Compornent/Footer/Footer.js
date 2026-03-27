import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer-logo">
              <div className="footer-logo__icon">
                <span>uni</span><span>mart</span>
              </div>
              <p className="footer-logo__sub">— MARKETPLACE —</p>
            </div>
            <p className="footer__tagline">
              Sri Lanka's first campus-based student marketplace. Buy, sell & connect within your university community.
            </p>
            <div className="footer__socials">
              <a href="#" aria-label="Facebook" className="social-btn social-btn--fb">f</a>
              <a href="#" aria-label="Instagram" className="social-btn social-btn--ig">ig</a>
              <a href="#" aria-label="WhatsApp" className="social-btn social-btn--wa">wa</a>
              <a href="#" aria-label="Twitter" className="social-btn social-btn--tw">x</a>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer__col">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Browse Products</Link></li>
              <li><Link to="/become-seller">Become a Seller</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
              <li><Link to="/messages">Messages</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer__col">
            <h4 className="footer__heading">Categories</h4>
            <ul className="footer__links">
              <li><Link to="/products?category=textbooks">📚 Textbooks</Link></li>
              <li><Link to="/products?category=electronics">💻 Electronics</Link></li>
              <li><Link to="/products?category=stationery">✏️ Stationery</Link></li>
              <li><Link to="/products?category=clothing">👕 Clothing</Link></li>
              <li><Link to="/products?category=furniture">🛋️ Furniture</Link></li>
              <li><Link to="/products?category=sports">⚽ Sports</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer__col">
            <h4 className="footer__heading">Support</h4>
            <ul className="footer__links">
              <li><a href="#">FAQ</a></li>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">Safety Tips</a></li>
              <li><a href="#">Report an Issue</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
            <div className="footer__contact">
              <p>📧 support@unimart.lk</p>
              <p>🏫 SLIIT Campus, Malabe</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} UniMart Marketplace. All rights reserved.</p>
          <p className="footer__credit">
            Made with ❤️ for <span className="text-blue">SLIIT</span> Students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;