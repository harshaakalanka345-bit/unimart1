import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./nav.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/products", label: "Products", icon: "🛍️" },
    { to: "/messages", label: "Messages", icon: "💬" },
    { to: "/my-orders", label: "My Orders", icon: "📦" },
    user?.isSeller 
      ? { to: "/add-product", label: "List Item", icon: "➕", highlight: true }
      : { to: "/become-seller", label: "Become a Seller", icon: "🏷️", highlight: true },
    { to: "/about", label: "About Us", icon: "ℹ️" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__container">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="logo-icon">
            <span className="logo-text-uni">uni</span>
            <span className="logo-text-mart">mart</span>
          </div>
          <span className="logo-sub">MARKETPLACE</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "active" : ""} ${link.highlight ? "navbar__link--highlight" : ""}`
                }
                end={link.to === "/"}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="navbar__actions">
          {user ? (
            <div className="profile-dropdown" ref={profileRef}>
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="profile-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} />
                  ) : (
                    <span>{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="profile-name">{user.name?.split(" ")[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {profileOpen && (
                <div className="profile-menu fade-in">
                  <div className="profile-menu__header">
                    <p className="profile-menu__name">{user.name}</p>
                    <p className="profile-menu__email">{user.email}</p>
                    <span className={`badge ${user.role === "admin" ? "badge-orange" : "badge-blue"}`}>
                      {user.role === "admin" ? "Admin" : "Student"}
                    </span>
                  </div>
                  <div className="profile-menu__items">
                    <Link to="/profile" onClick={() => setProfileOpen(false)}>👤 My Profile</Link>
                    <Link to="/my-orders" onClick={() => setProfileOpen(false)}>📦 My Orders</Link>
                    <Link to="/add-product" onClick={() => setProfileOpen(false)}>➕ List Item</Link>
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}>⚙️ Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className={`hamburger ${mobileOpen ? "open" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu fade-in">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `mobile-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
              end={link.to === "/"}
            >
              <span className="mobile-link__icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          {!user && (
            <div className="mobile-auth">
              <Link to="/login" className="btn btn-outline" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
