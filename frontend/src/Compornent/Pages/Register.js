import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./AuthPages.css";

const FACULTIES = ["Faculty of Computing","Faculty of Engineering","Faculty of Business","Faculty of Architecture","Faculty of Science","Faculty of Humanities & Sciences"];

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", faculty: "", year: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(""); };

  const validateStep1 = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email) return "Email is required.";
    if (!form.email.endsWith("@sliit.lk") && !form.email.endsWith("@students.sliit.lk")) return "Must use a valid SLIIT university email (@sliit.lk).";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) return setError(err);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.faculty) return setError("Please select your faculty.");
    if (!form.year) return setError("Please select your year.");
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, faculty: form.faculty, year: Number(form.year) });
      navigate("/");
    } catch (err) {
      setError(err.message || err.response?.data?.message || "Registration failed.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: "var(--danger)", width: "25%" };
    if (p.length < 8 || !/\d/.test(p)) return { label: "Fair", color: "var(--warning)", width: "50%" };
    if (p.length >= 8 && /\d/.test(p) && /[A-Z]/.test(p)) return { label: "Strong", color: "var(--success)", width: "100%" };
    return { label: "Good", color: "var(--green)", width: "75%" };
  };
  const strength = passwordStrength();

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />
      </div>

      <div className="auth-container">
        {/* Left */}
        <div className="auth-panel auth-panel--left">
          <div className="auth-brand">
            <div className="auth-logo-icon"><span>uni</span><span>mart</span></div>
            <p className="auth-logo-sub">— MARKETPLACE —</p>
          </div>
          <h2 className="auth-panel__title">Join UniMart! 🎓</h2>
          <p className="auth-panel__desc">Create your free account and start buying & selling within the SLIIT campus community today.</p>
          <div className="auth-steps-visual">
            {[{n:"01",t:"Register with SLIIT email"},{n:"02",t:"Browse or list items"},{n:"03",t:"Connect & trade safely"}].map((s,i) => (
              <div key={i} className="auth-step-item">
                <div className="auth-step-num">{s.n}</div>
                <span>{s.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="auth-panel auth-panel--right">
          <div className="auth-form-wrap fade-in-up">
            {/* Step indicator */}
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1</div>
              <div className={`step-line ${step >= 2 ? "active" : ""}`} />
              <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2</div>
            </div>

            <h1 className="auth-form-title">{step === 1 ? "Create Account" : "Your Details"}</h1>
            <p className="auth-form-sub">{step === 1 ? "Step 1: Account credentials" : "Step 2: Student information"}</p>

            {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-icon-wrap">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <input className="form-input input-with-icon" type="text" name="name" placeholder="e.g. Amal Perera" value={form.name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">SLIIT University Email</label>
                    <div className="input-icon-wrap">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <input className="form-input input-with-icon" type="email" name="email" placeholder="it21XXXXXX@my.sliit.lk" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-icon-wrap">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <input className="form-input input-with-icon input-with-icon-right" type={showPass ? "text" : "password"} name="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required />
                      <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁️"}</button>
                    </div>
                    {strength && (
                      <div className="password-strength">
                        <div className="strength-bar"><div style={{ width: strength.width, background: strength.color }} /></div>
                        <span style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-icon-wrap">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <input className="form-input input-with-icon" type="password" name="confirmPassword" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary btn-lg auth-submit" onClick={handleNext}>Next Step →</button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Faculty</label>
                    <select className="form-select" name="faculty" value={form.faculty} onChange={handleChange} required>
                      <option value="">Select your faculty</option>
                      {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <div className="year-grid">
                      {[1,2,3,4].map(y => (
                        <button key={y} type="button"
                          className={`year-btn ${form.year === String(y) ? "active" : ""}`}
                          onClick={() => setForm(p => ({ ...p, year: String(y) }))}>
                          Year {y}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label" style={{alignItems:"flex-start", gap:"10px"}}>
                      <input type="checkbox" required style={{marginTop:"3px", flexShrink:0}} />
                      <span style={{fontSize:"0.82rem", color:"var(--gray-600)", lineHeight:"1.5"}}>
                        I agree to the <a href="#" className="auth-link">Terms of Service</a> and <a href="#" className="auth-link">Privacy Policy</a>. I confirm I am a registered SLIIT student.
                      </span>
                    </label>
                  </div>
                  <div style={{display:"flex", gap:"10px"}}>
                    <button type="button" className="btn btn-ghost btn-lg" style={{flex:"0 0 auto"}} onClick={() => setStep(1)}>← Back</button>
                    <button type="submit" className={`btn btn-primary btn-lg auth-submit ${loading ? "loading" : ""}`} style={{flex:1}} disabled={loading}>
                      {loading ? <><span className="btn-spinner" /> Creating...</> : "Create Account 🎉"}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="auth-switch">Already have an account? <Link to="/login" className="auth-link font-bold">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
