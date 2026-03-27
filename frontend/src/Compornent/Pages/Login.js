import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./AuthPages.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />
      </div>

      <div className="auth-container">
        {/* Left panel */}
        <div className="auth-panel auth-panel--left">
          <div className="auth-brand">
            <div className="auth-logo-icon"><span>uni</span><span>mart</span></div>
            <p className="auth-logo-sub">— MARKETPLACE —</p>
          </div>
          <h2 className="auth-panel__title">Welcome back! 👋</h2>
          <p className="auth-panel__desc">Sign in to buy & sell with fellow SLIIT students on Sri Lanka's campus marketplace.</p>
          <div className="auth-features">
            {["🛍️ Browse 2,400+ student listings","💬 Chat directly with sellers","📦 Track your orders easily","⭐ Trusted campus community"].map(f => (
              <div key={f} className="auth-feature">{f}</div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-panel auth-panel--right">
          <div className="auth-form-wrap fade-in-up">
            <h1 className="auth-form-title">Sign In</h1>
            <p className="auth-form-sub">Use your SLIIT university email</p>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">University Email</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input className="form-input input-with-icon" type="email" name="email" placeholder="student@sliit.lk" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input className="form-input input-with-icon input-with-icon-right" type={showPass ? "text" : "password"} name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                  <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="auth-form-row">
                <label className="checkbox-label">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="auth-link">Forgot password?</a>
              </div>

              <button type="submit" className={`btn btn-primary btn-lg auth-submit ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? <><span className="btn-spinner" /> Signing in...</> : "Sign In →"}
              </button>
            </form>

            <div className="auth-divider"><span>or continue with</span></div>
            <button className="btn-google">
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Sign in with Google
            </button>

            <p className="auth-switch">
              Don't have an account? <Link to="/register" className="auth-link font-bold">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
