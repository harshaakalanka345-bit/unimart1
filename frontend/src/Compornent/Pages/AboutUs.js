import { Link } from "react-router-dom";
import "./AboutUs.css";

const TEAM = [
  { name: "Kasun Perera", role: "Project Lead & Backend Dev", faculty: "Faculty of Computing", icon: "👨‍💻" },
  { name: "Dilani Rathnayake", role: "Frontend Developer", faculty: "Faculty of Computing", icon: "👩‍💻" },
  { name: "Malmi Silva", role: "UI/UX Designer", faculty: "Faculty of Computing", icon: "👩‍🎨" },
  { name: "Amal Fernando", role: "Database & API", faculty: "Faculty of Computing", icon: "👨‍🔬" },
];

const AboutUs = () => (
  <div className="about-page">
    {/* Hero */}
    <section className="about-hero">
      <div className="about-hero__bg">
        <div className="about-blob about-blob--1" />
        <div className="about-blob about-blob--2" />
        <div className="about-blob about-blob--3" />
      </div>
      <div className="container about-hero__content fade-in-up">
        <div className="about-hero__logo">
          <div className="about-logo-icon"><span>uni</span><span>mart</span></div>
          <p>— MARKETPLACE —</p>
        </div>
        <h1>About <span className="gradient-text">UniMart</span></h1>
        <p className="about-hero__sub">Sri Lanka's first campus-based student marketplace, built for SLIIT students by SLIIT students.</p>
      </div>
    </section>

    {/* Mission */}
    <section className="section">
      <div className="container about-mission">
        <div className="about-mission__text fade-in-up">
          <h2 className="section-title">Our <span className="gradient-text">Mission</span></h2>
          <p>UniMart was created to solve a real problem that students face every day — buying and selling items on campus is difficult, unsafe, and scattered across WhatsApp groups and notice boards.</p>
          <p>We built a dedicated, secure, and easy-to-use platform exclusively for SLIIT students to buy, sell, and connect within their university community.</p>
          <p>Our goal is to create a sustainable, circular economy within SLIIT where students can save money, earn from unused items, and build a stronger campus community.</p>
          <div className="about-values">
            {[
              { icon: "🔒", label: "Secure", desc: "University email verified" },
              { icon: "🤝", label: "Community", desc: "Campus students only" },
              { icon: "♻️", label: "Sustainable", desc: "Reduce & reuse" },
              { icon: "💡", label: "Innovative", desc: "Smart campus tech" },
            ].map(v => (
              <div key={v.label} className="about-value">
                <span>{v.icon}</span>
                <strong>{v.label}</strong>
                <small>{v.desc}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="about-mission__stats fade-in">
          <div className="about-stat-card">
            <div className="about-stat">
              <span className="about-stat__num">2,400+</span>
              <span className="about-stat__label">Products Listed</span>
            </div>
            <div className="about-stat">
              <span className="about-stat__num">1,800+</span>
              <span className="about-stat__label">Students Registered</span>
            </div>
            <div className="about-stat">
              <span className="about-stat__num">950+</span>
              <span className="about-stat__label">Successful Deals</span>
            </div>
            <div className="about-stat">
              <span className="about-stat__num">4.8⭐</span>
              <span className="about-stat__label">Average Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Tech stack */}
    <section className="section about-tech-section">
      <div className="container">
        <div className="section-header center">
          <h2 className="section-title">Built with the <span className="gradient-text">MERN Stack</span></h2>
          <p className="section-sub">Modern, scalable technology for the modern student</p>
        </div>
        <div className="tech-grid">
          {[
            { icon: "🍃", name: "MongoDB", desc: "NoSQL database for flexible data storage", color: "green" },
            { icon: "⚡", name: "Express.js", desc: "Fast, minimal Node.js web framework", color: "orange" },
            { icon: "⚛️", name: "React.js", desc: "Dynamic, component-based UI library", color: "blue" },
            { icon: "🟢", name: "Node.js", desc: "JavaScript runtime for the backend", color: "green" },
            { icon: "🔌", name: "Socket.IO", desc: "Real-time bidirectional messaging", color: "orange" },
            { icon: "🔐", name: "JWT Auth", desc: "Secure token-based authentication", color: "blue" },
          ].map(t => (
            <div key={t.name} className={`tech-card tech-card--${t.color}`}>
              <span className="tech-icon">{t.icon}</span>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="section">
      <div className="container">
        <div className="section-header center">
          <h2 className="section-title">Meet the <span className="gradient-text">Team</span></h2>
          <p className="section-sub">SLIIT students who built UniMart</p>
        </div>
        <div className="team-grid">
          {TEAM.map(m => (
            <div key={m.name} className="team-card card">
              <div className="team-avatar">{m.icon}</div>
              <h3>{m.name}</h3>
              <p className="team-role">{m.role}</p>
              <span className="badge badge-blue">{m.faculty}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section">
      <div className="container">
        <div className="about-cta">
          <h2>Ready to join UniMart? 🎓</h2>
          <p>Be part of SLIIT's campus marketplace community today.</p>
          <div className="about-cta__btns">
            <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
            <Link to="/products" className="btn btn-outline btn-lg">Browse Products</Link>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default AboutUs;
