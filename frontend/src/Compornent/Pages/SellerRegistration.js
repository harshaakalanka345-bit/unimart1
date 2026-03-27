import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthPages.css";

const SellerRegistration = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Auto-extract Student ID from SLIIT email
  const extractStudentId = (email) => {
    if (!email) return "";
    const match = email.match(/^([a-zA-Z0-9]+)@/);
    return match ? match[1].toUpperCase() : "";
  };

  // Advanced state with all 5-step fields
  const [form, setForm] = useState({
    // Step 1: Account
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    contactInfo: user?.contactInfo || "",
    profilePicture: null,
    
    // Step 2: Seller
    sellerType: user?.sellerDetails?.sellerType || "individual",
    category: user?.sellerDetails?.category || "",
    bio: user?.bio || "",
    address: user?.sellerDetails?.address || "",
    city: user?.sellerDetails?.city || "",
    postalCode: user?.sellerDetails?.postalCode || "",
    country: user?.sellerDetails?.country || "",
    altPhone: user?.sellerDetails?.altPhone || "",

    // Step 3: Verification
    studentIdNumber: user?.verification?.studentIdNumber || extractStudentId(user?.email),
    studentIdImage: null,
    phoneVerified: false,
    emailVerified: false,

    // Step 4: Payment
    bankAccount: user?.paymentDetails?.bankAccount || "",
    mobilePayment: user?.paymentDetails?.mobilePayment || "",
    accountHolderName: user?.paymentDetails?.accountHolderName || "",

    // Step 5: Terms
    agreedTerms: false,
    agreedPrivacy: false
  });

  const handleNext = () => {
    // Step Validation
    setError("");
    if (step === 1) {
      if (!form.name || !form.username || !form.contactInfo) return setError("Please fill all required basic fields.");
    } else if (step === 2) {
      if (!form.category || !form.address || !form.city) return setError("Please fill required seller details.");
    } else if (step === 3) {
      if (!form.studentIdNumber) return setError("Student ID Number is required for verification.");
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(s => s - 1);
  };

  const mockVerifyOTP = (type) => {
    if (type === 'phone') {
      window.alert("Mock SMS sent to " + form.contactInfo + ". Automatically verified!");
      setForm({...form, phoneVerified: true});
    } else {
      window.alert("Mock Email sent to " + form.email + ". Automatically verified!");
      setForm({...form, emailVerified: true});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreedTerms || !form.agreedPrivacy) return setError("You must accept the Terms and Privacy Policy.");
    if (!form.phoneVerified || !form.emailVerified) return setError("Please verify your Email and Phone via OTP.");

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined && key !== "agreedTerms" && key !== "agreedPrivacy" && key !== "phoneVerified" && key !== "emailVerified") {
          formData.append(key, form[key]);
        }
      });

      const token = localStorage.getItem("unimart_token");
      const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      
      const res = await fetch(`${BASE_URL}/users/become-seller`, {
        method: "PATCH",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");

      updateUser(data.user);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success || user?.isSeller) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <div className="auth-blob auth-blob--1" />
          <div className="auth-blob auth-blob--2" />
        </div>
        <div className="auth-container" style={{maxWidth: "600px"}}>
          <div className="auth-panel" style={{textAlign:"center", padding:"60px", width:"100%"}}>
            <div style={{fontSize:"4rem", marginBottom:"24px", animation:"bounce 1s infinite alternate"}}>🎉</div>
            <h2 className="auth-panel__title" style={{color:"black"}}>Welcome to UniMart Sellers!</h2>
            <p className="auth-panel__desc" style={{color:"var(--gray-600)"}}>Your professional seller account is approved and verified. You can now start listing items.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px" }}>
              <Link to="/add-product" className="btn btn-primary btn-lg">➕ List First Item</Link>
              <Link to="/products" className="btn btn-ghost btn-lg">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />
      </div>

      <div className="auth-container wow-fade-in" style={{maxWidth: "1000px"}}>
        {/* Left Panel */}
        <div className="auth-panel auth-panel--left" style={{flex: "0 0 320px"}}>
          <div className="auth-brand">
            <div className="auth-logo-icon"><span>uni</span><span>mart</span></div>
            <p className="auth-logo-sub">— SELLER PLATFORM —</p>
          </div>
          <h2 className="auth-panel__title" style={{marginTop:"30px"}}>Open Your Store! 🚀</h2>
          <p className="auth-panel__desc">Complete your professional seller profile to start taking orders from thousands of students.</p>
          
          <div className="auth-steps-visual" style={{marginTop: "40px"}}>
            {[
              { n:"01", t:"Account Details" },
              { n:"02", t:"Setup Your Store" },
              { n:"03", t:"Identity Verification" },
              { n:"04", t:"Payment Linking" },
              { n:"05", t:"Go Live" }
            ].map((s,i) => (
              <div key={i} className={`auth-step-item ${step === i + 1 ? 'active' : ''}`} style={{opacity: step === i + 1 ? 1 : 0.6}}>
                <div className="auth-step-num" style={step === i + 1 ? {background: "white", color: "var(--primary)"} : {}}>{s.n}</div>
                <span style={step === i + 1 ? {fontWeight: "bold", color: "white"} : {}}>{s.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-panel auth-panel--right" style={{flex: 1, padding: "40px"}}>
          <div className="auth-form-wrap fade-in-up">
            
            {/* Step indicator progress bar */}
            <div className="step-indicator" style={{display:"flex", gap:"8px", marginBottom:"30px"}}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{height:"6px", flex:1, borderRadius:"3px", background: step >= n ? "var(--primary)" : "var(--gray-200)", transition:"all 0.4s ease"}} />
              ))}
            </div>

            <h1 className="auth-form-title">
              {step === 1 ? "Basic Information" : step === 2 ? "Store Details" : step === 3 ? "Verification Details" : step === 4 ? "Payment Options" : "Terms & Privacy"}
            </h1>
            <p className="auth-form-sub" style={{marginBottom:"24px"}}>
              {step === 1 ? "Let's set up your public profile." : step === 2 ? "Information about what you'll be selling." : step === 3 ? "We need to verify you are a genuine SLIIT student." : step === 4 ? "How do you want to get paid?" : "Almost done! Please review the terms."}
            </p>

            {error && <div className="auth-error" style={{marginBottom: "20px"}}><span>⚠️</span> {error}</div>}

            <form onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()} className="auth-form">
              
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="fade-in">
                  <div style={{display:"flex", gap:"16px", marginBottom:"16px"}}>
                    <div className="form-group" style={{flex:1, marginBottom: 0}}>
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" disabled value={form.name} style={{background:"var(--gray-50)", opacity:0.8}} />
                    </div>
                    <div className="form-group" style={{flex:1, marginBottom: 0}}>
                      <label className="form-label">Username <span style={{color:"red"}}>*</span></label>
                      <input type="text" className="form-input" placeholder="e.g. SLIIT_Books" value={form.username} onChange={e => setForm({...form, username: e.target.value})} autoFocus />
                    </div>
                  </div>

                  <div style={{display:"flex", gap:"16px", marginBottom:"16px"}}>
                    <div className="form-group" style={{flex:1, marginBottom: 0}}>
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-input" disabled value={form.email} style={{background:"var(--gray-50)", opacity:0.8}} />
                    </div>
                    <div className="form-group" style={{flex:1, marginBottom: 0}}>
                      <label className="form-label">Phone Number <span style={{color:"red"}}>*</span></label>
                      <input type="text" className="form-input" placeholder="+94 7X XXX XXXX" value={form.contactInfo} onChange={e => setForm({...form, contactInfo: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Profile Photo (Optional)</label>
                    <div style={{padding:"8px", border:"1px solid var(--border-color)", borderRadius:"12px"}}>
                      <input type="file" style={{width:"100%"}} accept="image/*" onChange={e => setForm({...form, profilePicture: e.target.files[0]})} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Seller Info */}
              {step === 2 && (
             <div className="fade-in">
                  <div style={{display:"flex", gap:"16px", marginBottom:"16px"}}>
                    <div className="form-group" style={{flex:1, marginBottom:0}}>
                      <label className="form-label">Seller Type <span style={{color:"red"}}>*</span></label>
                      <select className="form-input" value={form.sellerType} onChange={e => setForm({...form, sellerType: e.target.value})}>
                        <option value="individual">Individual Student</option>
                        <option value="business">Campus Business / Club</option>
                      </select>
                    </div>
                    <div className="form-group" style={{flex:1, marginBottom:0}}>
                      <label className="form-label">Primary Category <span style={{color:"red"}}>*</span></label>
                      <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        <option value="">Select a category</option>
                        <option value="textbooks">Textbooks & Notes</option>
                        <option value="electronics">Electronics</option>
                        <option value="stationery">Stationery</option>
                        <option value="clothing">Clothing & Apparel</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{marginBottom:"16px"}}>
                    <label className="form-label">Store / Seller Bio</label>
                    <textarea className="form-input" placeholder="What are you offering?" rows="2" style={{resize:"vertical", minHeight:"80px"}} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                  </div>

                  <div className="form-group" style={{marginBottom:"16px"}}>
                    <label className="form-label">Street Address / Campus Hostel <span style={{color:"red"}}>*</span></label>
                    <input type="text" className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>

                  <div style={{display:"flex", gap:"16px"}}>
                    <div className="form-group" style={{flex:2, marginBottom:0}}>
                      <label className="form-label">City <span style={{color:"red"}}>*</span></label>
                      <input type="text" className="form-input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                    </div>
                    <div className="form-group" style={{flex:1, marginBottom:0}}>
                      <label className="form-label">Postal Code</label>
                      <input type="text" className="form-input" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Verification */}
              {step === 3 && (
                <div className="fade-in">
                  <div className="form-group" style={{marginBottom:"16px"}}>
                    <label className="form-label">SLIIT Student ID Number <span style={{color:"red"}}>*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. IT20123456" value={form.studentIdNumber} disabled style={{background:"var(--gray-50)", opacity:0.8}} />
                  </div>

                  <div className="form-group" style={{marginBottom:"24px"}}>
                    <label className="form-label">Upload Student ID Photo</label>
                    <div style={{padding:"8px", border:"1px solid var(--border-color)", borderRadius:"12px"}}>
                      <input type="file" style={{width:"100%"}} accept="image/*,.pdf" onChange={e => setForm({...form, studentIdImage: e.target.files[0]})} />
                    </div>
                  </div>
                  
                  <label className="form-label" style={{marginBottom:"8px"}}>Identity Verification via OTP</label>
                  <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", border:"1px solid var(--border-color)", borderRadius:"12px", background:"#f9fafb"}}>
                      <div><strong style={{display:"block", marginBottom:"4px"}}>Email Check</strong><span style={{color:"var(--gray-600)", fontSize:"0.9rem"}}>{form.email}</span></div>
                      {form.emailVerified ? <span style={{padding:"6px 12px", background:"var(--green)", color:"white", borderRadius:"20px", fontSize:"0.8rem", fontWeight:"bold"}}>Verified ✓</span> : <button type="button" className="btn btn-ghost btn-sm" onClick={() => mockVerifyOTP("email")}>Send Mail OTP</button>}
                    </div>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", border:"1px solid var(--border-color)", borderRadius:"12px", background:"#f9fafb"}}>
                      <div><strong style={{display:"block", marginBottom:"4px"}}>Phone Check</strong><span style={{color:"var(--gray-600)", fontSize:"0.9rem"}}>{form.contactInfo || "No phone added"}</span></div>
                      {form.phoneVerified ? <span style={{padding:"6px 12px", background:"var(--green)", color:"white", borderRadius:"20px", fontSize:"0.8rem", fontWeight:"bold"}}>Verified ✓</span> : <button type="button" className="btn btn-ghost btn-sm" disabled={!form.contactInfo} onClick={() => mockVerifyOTP("phone")}>Send SMS OTP</button>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Payment */}
              {step === 4 && (
                <div className="fade-in">
                  <div className="form-group" style={{marginBottom:"16px"}}>
                    <label className="form-label">Account Holder Name</label>
                    <input type="text" className="form-input" placeholder="Full name on bank account" value={form.accountHolderName} onChange={e => setForm({...form, accountHolderName: e.target.value})} />
                  </div>

                  <div className="form-group" style={{marginBottom:"16px"}}>
                    <label className="form-label">Bank Account Details (Bank Name, Branch, Number)</label>
                    <textarea className="form-input" placeholder="e.g. Commercial Bank, Malabe Branch, Account No: 123456789" rows="3" style={{resize:"vertical", minHeight:"80px"}} value={form.bankAccount} onChange={e => setForm({...form, bankAccount: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Payment App Links (Optional)</label>
                    <input type="text" className="form-input" placeholder="e.g. PayPal.me link or Stripe link" value={form.mobilePayment} onChange={e => setForm({...form, mobilePayment: e.target.value})} />
                  </div>
                </div>
              )}

              {/* STEP 5: Terms */}
              {step === 5 && (
                <div className="fade-in">
                  <div style={{display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"20px", padding:"16px", background:"rgba(243, 114, 44, 0.05)", borderRadius:"12px", border:"1px solid rgba(243, 114, 44, 0.1)"}}>
                    <input type="checkbox" id="agreedTerms" checked={form.agreedTerms} onChange={e => setForm({ ...form, agreedTerms: e.target.checked })} style={{marginTop:"3px", width:"18px", height:"18px", accentColor:"var(--primary)"}} />
                    <label htmlFor="agreedTerms" style={{cursor:"pointer", color:"var(--gray-700)", lineHeight:"1.5", fontSize:"0.95rem"}}>
                      I accept the UniMart <a href="#" style={{color:"var(--primary)", fontWeight:"bold"}}>Terms and Conditions</a>, confirming I will only sell authentic items and honestly describe them.
                    </label>
                  </div>

                  <div style={{display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"20px", padding:"16px", background:"rgba(243, 114, 44, 0.05)", borderRadius:"12px", border:"1px solid rgba(243, 114, 44, 0.1)"}}>
                    <input type="checkbox" id="agreedPrivacy" checked={form.agreedPrivacy} onChange={e => setForm({ ...form, agreedPrivacy: e.target.checked })} style={{marginTop:"3px", width:"18px", height:"18px", accentColor:"var(--primary)"}} />
                    <label htmlFor="agreedPrivacy" style={{cursor:"pointer", color:"var(--gray-700)", lineHeight:"1.5", fontSize:"0.95rem"}}>
                      I accept the <a href="#" style={{color:"var(--primary)", fontWeight:"bold"}}>Privacy Policy</a> and understand how my data will be securely processed to verify my identity.
                    </label>
                  </div>
                </div>
              )}

              <div style={{display:"flex", gap:"16px", marginTop:"32px"}}>
                {step > 1 && (
                  <button type="button" className="btn btn-ghost btn-lg" onClick={handleBack} disabled={loading} style={{flex: "0 0 auto", minWidth:"100px"}}>
                    ← Back
                  </button>
                )}
                
                {step < 5 ? (
                  <button type="button" className="btn btn-primary btn-lg auth-submit" onClick={handleNext} style={{flex:1}}>
                    Continue →
                  </button>
                ) : (
                  <button type="submit" className={`btn btn-orange btn-lg auth-submit ${loading ? "loading" : ""}`} disabled={loading || !form.agreedTerms || !form.agreedPrivacy} style={{flex:1}}>
                    {loading ? <><span className="btn-spinner" /> Submitting...</> : "Submit Application 🚀"}
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegistration;
