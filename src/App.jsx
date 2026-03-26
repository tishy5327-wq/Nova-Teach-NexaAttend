import { useState, useEffect, useRef } from "react";

/* ─── Intersection Observer Hook ─── */
const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

const FadeIn = ({ children, delay = 0, className = "", style = {} }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
};

/* ─── Live Attendance Terminal Data ─── */
const logs = [
  { time: "08:01:03", name: "Arjun Mehta",    cls: "X-A",   status: "present" },
  { time: "08:01:07", name: "Priya Sharma",   cls: "X-A",   status: "present" },
  { time: "08:01:14", name: "Rohan Patel",    cls: "IX-B",  status: "present" },
  { time: "08:01:21", name: "Sneha Verma",    cls: "X-A",   status: "late"    },
  { time: "08:01:28", name: "Dev Agarwal",    cls: "XI-C",  status: "present" },
  { time: "08:01:35", name: "Kavya Joshi",    cls: "IX-B",  status: "present" },
  { time: "08:01:40", name: "Ishaan Nair",    cls: "XII-A", status: "absent"  },
];

/* ─── ERP Modules Data ─── */
const modules = [
  {
    icon: "◉",
    title: "Smart Attendance",
    features: ["AI face recognition — zero ID cards", "Works fully offline", "Marks 30 students in under 60 seconds", "Proxy attendance becomes impossible"],
    color: "#1B4D3E"
  },
  {
    icon: "◈",
    title: "Student Management",
    features: ["Complete student profiles & history", "Batch and class management", "Fee tracking and dues", "Parent notification hub"],
    color: "#1A2B4A"
  },
  {
    icon: "◇",
    title: "Staff & HR",
    features: ["Staff attendance via face recognition", "Payroll auto-calculated from attendance", "Leave management & approvals", "Department & role management"],
    color: "#3D1A4A"
  },
  {
    icon: "▣",
    title: "Reports & Analytics",
    features: ["One-click daily / weekly / monthly reports", "Class-wise attendance trends", "Payroll & fee collection reports", "Admin dashboard — always live"],
    color: "#4A2B0A"
  },
];

/* ─── LinkedIn Icon ─── */
const LiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [logIndex, setLogIndex] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedTab, setSelectedTab] = useState("plans");

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLogIndex(i => (i >= logs.length ? 1 : i + 1)), 1800);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const faqs = [
    { q: "Does it work without internet?", a: "Yes — NexaAttend is designed offline-first. All recognition, data storage, and reports happen on your own computer. Internet is optional and only used for cloud backups if you choose that add-on." },
    { q: "How long does setup take?", a: "Our team completes the full installation, camera setup, and staff training in 3 days. You don't need an IT department — we handle everything." },
    { q: "What cameras does it require?", a: "Any standard webcam or IP camera. You don't need to buy proprietary hardware. If you already have cameras installed, we assess compatibility during the free demo." },
    { q: "How accurate is the face recognition?", a: "99%+ accuracy under normal lighting conditions. The system handles glasses, hair changes, and varying lighting. We test it rigorously before handover." },
    { q: "What happens to our student data?", a: "Your data never leaves your premises. It is stored on your own computer or local server — not on any cloud. You have complete ownership and control." },
    { q: "What is the 30-day guarantee?", a: "Use NexaAttend for 30 days. If it doesn't measurably save time, reduce attendance errors, and simplify daily operations — we refund you in full. No conditions, no paperwork." },
  ];

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif", background: "#F7F5EF", color: "#1C1B17", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #2A6B4A; border-radius: 2px; }

        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .mono  { font-family: 'JetBrains Mono', monospace; }

        .sec { padding: 88px 6%; }

        /* Pill label */
        .pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase;
          padding: 5px 13px; border-radius: 100px; margin-bottom: 20px;
        }
        .pill-green { color: #1B5C3A; background: rgba(42,107,74,0.1); }
        .pill-cream { color: #8A6A2A; background: rgba(184,146,42,0.12); }
        .pill-dark  { color: rgba(247,245,239,0.5); background: rgba(247,245,239,0.08); }

        /* Buttons */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1C1B17; color: #F7F5EF;
          border: none; border-radius: 6px; padding: 13px 22px;
          font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.22s; text-decoration: none;
        }
        .btn-primary:hover { background: #2A6B4A; transform: translateY(-1px); box-shadow: 0 10px 28px rgba(42,107,74,0.28); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #1C1B17;
          border: 1.5px solid rgba(28,27,23,0.2); border-radius: 6px; padding: 12px 20px;
          font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.22s; text-decoration: none;
        }
        .btn-secondary:hover { border-color: #1C1B17; background: rgba(28,27,23,0.04); }

        .btn-cta {
          display: inline-flex; align-items: center; gap: 10px;
          background: #F7F5EF; color: #1C1B17;
          border: none; border-radius: 6px; padding: 14px 28px;
          font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.22s; text-decoration: none;
        }
        .btn-cta:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 10px 28px rgba(28,27,23,0.2); }

        .btn-cta-outline {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent; color: rgba(247,245,239,0.85);
          border: 1.5px solid rgba(247,245,239,0.22); border-radius: 6px; padding: 13px 26px;
          font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.22s; text-decoration: none;
        }
        .btn-cta-outline:hover { border-color: rgba(247,245,239,0.5); background: rgba(247,245,239,0.07); }

        /* Cards */
        .card {
          background: #FFFFFF; border: 1px solid rgba(28,27,23,0.07);
          border-radius: 12px; padding: 24px;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .card:hover { box-shadow: 0 6px 32px rgba(28,27,23,0.07); transform: translateY(-2px); }

        /* Nav links */
        .nav-link {
          font-size: 13px; font-weight: 500; color: rgba(28,27,23,0.55);
          cursor: pointer; border: none; background: none;
          font-family: 'Instrument Sans', sans-serif; transition: color 0.2s; padding: 0;
        }
        .nav-link:hover { color: #1C1B17; }

        /* Terminal */
        .status-present { color: #1B7A45; font-weight: 700; }
        .status-late    { color: #9A6B0A; font-weight: 700; }
        .status-absent  { color: #8A2A1A; font-weight: 700; }

        @keyframes fsi  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes pdot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes count { from { opacity: 0; } to { opacity: 1; } }

        .pdot { animation: pdot 2s ease-in-out infinite; }
        .log-row { animation: fsi 0.4s ease forwards; }
        .ticker-inner { display: flex; gap: 52px; animation: ticker 26s linear infinite; width: max-content; }

        /* Grid helpers */
        .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .g4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }

        /* Mobile nav */
        .mmenu {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 90;
          background: rgba(247,245,239,0.98); backdrop-filter: blur(24px);
          padding: 80px 6% 32px; overflow-y: auto;
          transform: translateX(100%); transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);
          display: flex; flex-direction: column;
        }
        .mmenu.open { transform: translateX(0); }
        .mlink {
          font-size: 22px; font-weight: 500; color: #1C1B17;
          padding: 18px 0; border-bottom: 1px solid rgba(28,27,23,0.07);
          background: none; border-left: none; border-right: none; border-top: none;
          cursor: pointer; text-align: left; font-family: 'Instrument Sans', sans-serif;
          transition: color 0.2s;
        }
        .mlink:hover { color: #2A6B4A; }

        /* Pricing */
        .plan-card {
          background: #FFFFFF; border: 1.5px solid rgba(28,27,23,0.08);
          border-radius: 16px; padding: 36px; display: flex; flex-direction: column;
          transition: all 0.3s ease; position: relative;
        }
        .plan-card:hover { box-shadow: 0 12px 36px rgba(28,27,23,0.08), 0 2px 8px rgba(28,27,23,0.05); transform: translateY(-4px); }
        .plan-card.advanced {
          background: #1C1B17; color: #F7F5EF; border: 2px solid #2A6B4A;
          box-shadow: 0 24px 56px rgba(42,107,74,0.16); transform: scale(1.02);
        }
        .plan-card.advanced:hover { box-shadow: 0 32px 72px rgba(42,107,74,0.22); transform: scale(1.026) translateY(-4px); }
        .plan-badge {
          position: absolute; top: -12px; left: 24px; background: #2A6B4A;
          color: #F7F5EF; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 6px 16px; border-radius: 100px;
        }
        .plan-title { font-size: 20px; font-weight: 600; margin-bottom: 10px; margin-top: 10px; }
        .plan-desc { font-size: 13px; margin-bottom: 24px; line-height: 1.6; }
        .plan-card.standard .plan-desc { color: rgba(28,27,23,0.52); }
        .plan-card.advanced .plan-desc { color: rgba(247,245,239,0.6); }
        .pricing-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .pricing-label { font-size: 11px; font-weight: 600; color: rgba(28,27,23,0.38); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; }
        .plan-card.advanced .pricing-label { color: rgba(247,245,239,0.35); }
        .pricing-amount { font-size: 28px; font-weight: 700; color: #1C1B17; }
        .plan-card.advanced .pricing-amount { color: #5AC87A; }
        .plan-cta { display: flex; gap: 8px; margin-bottom: 24px; }
        .btn-plan { flex: 1; padding: 11px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.22s; font-family: 'Instrument Sans', sans-serif; }
        .btn-plan-secondary { border: 1.5px solid rgba(28,27,23,0.18); background: transparent; color: #1C1B17; }
        .btn-plan-secondary:hover { background: rgba(28,27,23,0.06); border-color: #1C1B17; }
        .btn-plan-primary { background: #5AC87A; color: #1C1B17; border: none; font-weight: 700; }
        .btn-plan-primary:hover { background: #6FD68D; transform: translateY(-2px); }
        .plan-features { list-style: none; display: flex; flex-direction: column; gap: 11px; flex: 1; }
        .plan-features li { display: flex; gap: 9px; font-size: 13.5px; color: rgba(28,27,23,0.64); align-items: flex-start; }
        .plan-card.advanced .plan-features li { color: rgba(247,245,239,0.7); }
        .checkmark { color: #2A6B4A; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
        .plan-card.advanced .checkmark { color: #5AC87A; }
        
        /* FAQ */
        .faq-item { border-bottom: 1px solid rgba(28,27,23,0.08); }
        .faq-q {
          width: 100%; text-align: left; padding: 20px 0; background: none; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 16px;
          font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 500; color: #1C1B17;
        }
        .faq-a { padding: 0 0 20px; font-size: 14px; line-height: 1.85; color: rgba(28,27,23,0.6); }

        /* ─── Responsive ─── */
        @media (max-width: 900px) {
          .g3 { grid-template-columns: 1fr 1fr !important; }
          .g4 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .sec { padding: 56px 5% !important; }
          .g2  { grid-template-columns: 1fr !important; }
          .g3  { grid-template-columns: 1fr !important; }
          .g4  { grid-template-columns: 1fr 1fr !important; }
          .hero-h { font-size: clamp(2.2rem, 9vw, 2.8rem) !important; }
          .hero-pad { padding: 100px 5% 56px !important; min-height: auto !important; }
          .hide-mob { display: none !important; }
          .flex-cta { flex-direction: column !important; }
          .flex-cta a, .flex-cta button { width: 100% !important; justify-content: center !important; }
          .hbg { display: flex !important; }
          .mob-show { display: block !important; }
          .plan-card.advanced { transform: scale(1) !important; }
          .plan-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) {
          .hbg { display: none !important; }
          .mob-show { display: none !important; }
        }
      `}</style>

      {/* ── Mobile Menu ── */}
      <div className={`mmenu ${menuOpen ? "open" : ""}`}>
        {[["problem","Why NexaAttend"],["solution","Platform"],["pricing","Pricing"],["process","How It Works"],["trust","Trust & Guarantee"],["demo","Book Demo"]].map(([id, label]) => (
          <button key={id} className="mlink" onClick={() => scrollTo(id)}>{label}</button>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 28 }}>
          <a href="https://wa.me/919974724656" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 600, color: "#1C1B17", textDecoration: "none", marginBottom: 14 }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,211,102,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💬</span>
            WhatsApp Us
          </a>
          <a href="tel:+919974724656" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 600, color: "#1C1B17", textDecoration: "none" }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(28,27,23,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>📞</span>
            +91 99747 24656
          </a>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: navScrolled ? "11px 6%" : "18px 6%",
        background: navScrolled || menuOpen ? "rgba(247,245,239,0.95)" : "transparent",
        backdropFilter: navScrolled || menuOpen ? "blur(24px)" : "none",
        borderBottom: navScrolled || menuOpen ? "1px solid rgba(28,27,23,0.07)" : "none",
        transition: "all 0.38s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("hero")}>
          <div style={{ width: 32, height: 32, background: "#2A6B4A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/>
              <path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 5l2-2M13.5 9l2.5.5" stroke="#F7F5EF" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
            </svg>
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, lineHeight: 1.1, letterSpacing: "-0.01em" }}>NexaAttend</div>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2A6B4A", fontWeight: 600 }}>Complete School ERP</div>
          </div>
        </div>

        <div className="hide-mob" style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[["problem","Why NexaAttend"],["solution","Platform"],["pricing","Pricing"],["process","How It Works"],["trust","Guarantee"]].map(([id, label]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="tel:+919974724656" className="btn-secondary hide-mob" style={{ padding: "8px 14px", fontSize: 13 }}>+91 99747 24656</a>
          <button className="btn-primary" onClick={() => scrollTo("demo")} style={{ padding: "9px 17px", fontSize: 13 }}>Book Free Demo</button>
          <button className="hbg" onClick={() => setMenuOpen(o => !o)} style={{
            background: "none", border: "1.5px solid rgba(28,27,23,0.18)", cursor: "pointer",
            padding: "7px 9px", borderRadius: 6, alignItems: "center", justifyContent: "center"
          }}>
            {menuOpen
              ? <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="#1C1B17" strokeWidth="1.8" strokeLinecap="round"/></svg>
              : <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="#1C1B17" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
         ══════════════════════════════════════ */}
      <section id="hero" className="hero-pad" style={{ minHeight: "100vh", padding: "130px 6% 80px", position: "relative", overflow: "hidden" }}>
        {/* BG texture */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse 72% 64% at 72% 38%, rgba(42,107,74,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 20% 75%, rgba(184,146,42,0.05) 0%, transparent 55%)"
        }}/>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(28,27,23,0.06)" }}/>

        <div className="g2" style={{ maxWidth: 1200, margin: "0 auto", gap: 64, alignItems: "center", position: "relative", zIndex: 1 }}>
          {/* Left column */}
          <div>
            <div style={{ opacity: 0, animation: "fsi 0.8s 0.1s ease forwards" }}>
              <div className="pill pill-green">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2A6B4A", flexShrink: 0 }} className="pdot"/>
                Complete School ERP · AI-Powered
              </div>
            </div>

            <h1 className="serif hero-h" style={{
              fontSize: "clamp(2.6rem, 4.8vw, 4rem)", lineHeight: 1.05, letterSpacing: "-0.02em",
              marginBottom: 24, opacity: 0, animation: "fsi 0.9s 0.22s ease forwards"
            }}>
              Your Entire School,<br/>
              Managed From<br/>
              <em style={{ color: "#2A6B4A", fontStyle: "italic" }}>One System.</em>
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(28,27,23,0.62)", maxWidth: 460, marginBottom: 30,
              opacity: 0, animation: "fsi 0.8s 0.38s ease forwards" }}>
              NexaAttend is a complete School ERP — attendance, staff, payroll, reports, and parent communication — powered by AI face recognition that works 100% offline.
            </p>

            <div className="flex-cta" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36, opacity: 0, animation: "fsi 0.8s 0.5s ease forwards" }}>
              <button className="btn-primary" onClick={() => scrollTo("demo")} style={{ fontSize: 15, padding: "14px 24px" }}>
                Get Free Trial
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn-secondary" onClick={() => scrollTo("solution")} style={{ fontSize: 15, padding: "13px 22px" }}>
                See the Platform
              </button>
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", opacity: 0, animation: "fsi 0.8s 0.62s ease forwards" }}>
              {[["🔒","100% offline"], ["⚡","3-day setup"], ["🛡️","30-day guarantee"], ["🏫","Made for India"]].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(28,27,23,0.5)" }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Live terminal */}
          <div className="hide-mob" style={{ opacity: 0, animation: "fsi 1s 0.5s ease forwards" }}>
            <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid rgba(28,27,23,0.08)", boxShadow: "0 28px 80px rgba(28,27,23,0.09), 0 4px 12px rgba(28,27,23,0.05)", overflow: "hidden" }}>
              {/* Titlebar */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", borderBottom: "1px solid rgba(28,27,23,0.07)", background: "#FAFAF8" }}>
                {[["#F05A5A"],["#F0B45A"],["#5AF07A"]].map(([c], i) => (
                  <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }}/>
                ))}
                <span className="mono" style={{ fontSize: 10, color: "rgba(28,27,23,0.32)", marginLeft: 8 }}>nexaattend — live dashboard</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3DC87A" }} className="pdot"/>
                  <span className="mono" style={{ fontSize: 9, color: "#1B7A45", fontWeight: 600, letterSpacing: "0.08em" }}>LIVE</span>
                </div>
              </div>

              {/* Stat bar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#FAFAF8", borderBottom: "1px solid rgba(28,27,23,0.06)" }}>
                {[{ l: "Present", v: "284", c: "#1B7A45" }, { l: "Late", v: "12", c: "#9A6B0A" }, { l: "Absent", v: "8", c: "#8A2A1A" }].map(s => (
                  <div key={s.l} style={{ padding: "14px 10px", textAlign: "center", borderRight: "1px solid rgba(28,27,23,0.06)" }}>
                    <div className="serif" style={{ fontSize: 28, color: s.c, lineHeight: 1 }}>{s.v}</div>
                    <div className="mono" style={{ fontSize: 9, color: "rgba(28,27,23,0.38)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Log */}
              <div style={{ padding: "12px 14px 14px" }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(28,27,23,0.28)", marginBottom: 8 }}>Recognition Log</div>
                {logs.slice(0, logIndex).map((log, i) => (
                  <div key={i} className="log-row" style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 7px", borderRadius: 4, background: i % 2 === 0 ? "rgba(28,27,23,0.02)" : "transparent", marginBottom: 1 }}>
                    <span className="mono" style={{ color: "rgba(28,27,23,0.25)", minWidth: 52, fontSize: 10 }}>{log.time}</span>
                    <span className="mono" style={{ color: "#1C1B17", fontWeight: 500, flex: 1, fontSize: 12 }}>{log.name}</span>
                    <span className="mono" style={{ color: "rgba(28,27,23,0.32)", fontSize: 10 }}>{log.cls}</span>
                    <span className={`mono status-${log.status}`} style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em" }}>{log.status}</span>
                  </div>
                ))}
              </div>

              {/* Bottom strip */}
              <div style={{ padding: "10px 14px", background: "rgba(42,107,74,0.05)", borderTop: "1px solid rgba(28,27,23,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(28,27,23,0.45)" }}>Today's attendance rate</span>
                <span className="serif" style={{ fontSize: 18, color: "#1B7A45", fontWeight: 700 }}>96.8%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: "#1C1B17", padding: "13px 0", overflow: "hidden" }}>
        <div style={{ overflow: "hidden" }}>
          <div className="ticker-inner">
            {[...Array(2)].flatMap(() => ["◆ Works 100% Offline","◆ AI Face Recognition","◆ 3-Day Setup","◆ Student + Staff + Payroll","◆ 30-Day Money-Back Guarantee","◆ No ID Cards Needed","◆ Built for Indian Schools","◆ Data Never Leaves Your Premises","◆ Free Lifetime Updates","◆ Ahmedabad-Based Team"])
              .map((item, i) => (
                <span key={i} className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(247,245,239,0.55)", whiteSpace: "nowrap", textTransform: "uppercase" }}>{item}</span>
              ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          PROBLEM
         ══════════════════════════════════════ */}
      <section id="problem" className="sec" style={{ background: "#F7F5EF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="pill pill-green">The Problem</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 600, marginBottom: 12 }}>
              Manual systems are costing your school more than you realise.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(28,27,23,0.5)", maxWidth: 520, marginBottom: 48, lineHeight: 1.85 }}>
              Most Indian schools treat these as normal, unavoidable problems. They aren't.
            </p>
          </FadeIn>

          <div className="g3">
            {[
              { n: "01", h: "2–3 hours lost every day", b: "Teachers spend 15–20 minutes per class calling out names. Multiply that across every class, every day — that's teaching time permanently gone.", accent: "#8A2A1A" },
              { n: "02", h: "Proxy attendance goes undetected", b: "Students mark absent friends 'present'. Registers can't verify faces. Face recognition stops this completely — the first day it's installed.", accent: "#9A6B0A" },
              { n: "03", h: "Five disconnected systems", b: "Attendance register, WhatsApp groups, Excel payroll, manual fee tracking, printed reports. The data never lines up, and staff spend hours reconciling.", accent: "#1B5C3A" },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="card" style={{ borderTop: `3px solid ${p.accent}` }}>
                  <div className="mono" style={{ fontSize: 11, color: p.accent, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 14 }}>{p.n}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, marginBottom: 10 }}>{p.h}</h3>
                  <p style={{ fontSize: 14, color: "rgba(28,27,23,0.54)", lineHeight: 1.8 }}>{p.b}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.1}>
            <div style={{ marginTop: 24, background: "#FFFFFF", borderRadius: 10, border: "1px solid rgba(28,27,23,0.07)", padding: "18px 22px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["❌ Attendance errors","❌ Payroll miscalculations","❌ Missing or late reports","❌ No real-time visibility","❌ Data scattered across tools"].map(t => (
                  <span key={t} style={{ background: "rgba(28,27,23,0.04)", border: "1px solid rgba(28,27,23,0.08)", borderRadius: 100, padding: "6px 14px", fontSize: 13, fontWeight: 500, color: "rgba(28,27,23,0.65)" }}>{t}</span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PLATFORM / SOLUTION
         ══════════════════════════════════════ */}
      <section id="solution" className="sec" style={{ background: "#1C1B17", color: "#F7F5EF", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(42,107,74,0.12), transparent 70%)", pointerEvents: "none" }}/>

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <FadeIn>
            <div className="pill pill-dark">The Platform</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.4rem)", lineHeight: 1.06, letterSpacing: "-0.022em", marginBottom: 20, color: "#F7F5EF" }}>
              One System That Runs<br/>
              Your <em style={{ color: "#5AC87A", fontStyle: "italic" }}>Entire Institute.</em>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(247,245,239,0.55)", maxWidth: 540, marginBottom: 52, lineHeight: 1.85 }}>
              Attendance is just one piece. NexaAttend is a complete ERP — students, staff, payroll, and operations, all connected in a single system.
            </p>
          </FadeIn>

          {/* Module cards */}
          <div className="g2" style={{ marginBottom: 24 }}>
            {modules.map((mod, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div style={{ background: "rgba(247,245,239,0.04)", border: "1px solid rgba(247,245,239,0.09)", borderRadius: 12, padding: "28px 26px", transition: "background 0.3s, border-color 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(247,245,239,0.07)"; e.currentTarget.style.borderColor = "rgba(247,245,239,0.16)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(247,245,239,0.04)"; e.currentTarget.style.borderColor = "rgba(247,245,239,0.09)"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${mod.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#5AC87A" }}>{mod.icon}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "#F7F5EF" }}>{mod.title}</h3>
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {mod.features.map((f, fi) => (
                      <li key={fi} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                        <span style={{ color: "#5AC87A", flexShrink: 0, fontSize: 13, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 13.5, color: "rgba(247,245,239,0.65)", lineHeight: 1.6 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Feature pills */}
          <FadeIn delay={0.15}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 8 }}>
              {["⚡ Mark attendance in under 3 seconds","🔒 100% offline — data stays on-site","📊 Reports auto-generated","💬 Parent alerts via WhatsApp","🎓 Works for students & staff","🖥️ Multi-role dashboards"].map(t => (
                <span key={t} style={{ background: "rgba(247,245,239,0.07)", border: "1px solid rgba(247,245,239,0.1)", borderRadius: 100, padding: "7px 16px", fontSize: 13, fontWeight: 500, color: "rgba(247,245,239,0.7)" }}>{t}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRODUCT DASHBOARD PREVIEW
         ══════════════════════════════════════ */}
      <section className="sec" style={{ background: "#F7F5EF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="pill pill-green">Real System Preview</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)", letterSpacing: "-0.02em", marginBottom: 8 }}>
              Built for principals, <em style={{ fontStyle: "italic", color: "#2A6B4A" }}>not IT teams.</em>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(28,27,23,0.5)", marginBottom: 44, lineHeight: 1.8 }}>Clean dashboards. Everything visible at a glance.</p>
          </FadeIn>

          <div className="g2" style={{ marginBottom: 16 }}>
            {/* Dashboard card */}
            <FadeIn>
              <div className="card" style={{ padding: 20 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(28,27,23,0.35)", marginBottom: 14 }}>Admin Dashboard — Today</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[
                    { l: "Students Present",  v: "284", trend: "96.8%", ok: true },
                    { l: "Staff Present",      v: "28",  trend: "100%",  ok: true },
                    { l: "Fee Collection",     v: "₹1.2L",trend: "This month", ok: true },
                    { l: "Parent Alerts Sent", v: "18",  trend: "Today", ok: false },
                  ].map(m => (
                    <div key={m.l} style={{ background: "rgba(28,27,23,0.03)", borderRadius: 8, padding: "12px 10px" }}>
                      <div className="serif" style={{ fontSize: 22, lineHeight: 1, color: "#1C1B17", marginBottom: 3 }}>{m.v}</div>
                      <div style={{ fontSize: 10.5, color: "rgba(28,27,23,0.42)", lineHeight: 1.4, marginBottom: 2 }}>{m.l}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: m.ok ? "#1B7A45" : "#9A6B0A" }}>{m.trend}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "rgba(28,27,23,0.32)", marginBottom: 6 }}>Attendance this week</div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 44 }}>
                  {[87,93,91,97,96].map((v, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ width: "100%", background: i === 4 ? "#2A6B4A" : "rgba(42,107,74,0.18)", borderRadius: "3px 3px 0 0", height: `${v * 0.44}px` }}/>
                      <div className="mono" style={{ fontSize: 9, color: "rgba(28,27,23,0.3)" }}>{["M","T","W","T","F"][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Time saved */}
            <FadeIn delay={0.1}>
              <div className="card" style={{ background: "#2A6B4A", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(247,245,239,0.4)", marginBottom: 18 }}>Time Saved Today</div>
                  <div className="serif" style={{ fontSize: 52, color: "#F7F5EF", lineHeight: 1, marginBottom: 8 }}>2.4<span style={{ fontSize: 22 }}>h</span></div>
                  <p style={{ fontSize: 13.5, color: "rgba(247,245,239,0.5)", lineHeight: 1.75 }}>vs. manual attendance register for 304 students and staff</p>
                </div>
                <div style={{ borderTop: "1px solid rgba(247,245,239,0.12)", paddingTop: 16, marginTop: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(247,245,239,0.4)", marginBottom: 4 }}>This month total</div>
                  <div className="serif" style={{ fontSize: 30, color: "#F7F5EF" }}>52h</div>
                  <div style={{ fontSize: 12, color: "rgba(247,245,239,0.35)", marginTop: 2 }}>given back to your staff</div>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="g2">
            {/* Monthly table */}
            <FadeIn>
              <div className="card">
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(28,27,23,0.35)", marginBottom: 12 }}>Monthly Attendance Report</div>
                <div className="mono">
                  {[["Class","Attendance","Absent","Trend"],["IX-A","97.2%","2","↑"],["IX-B","94.8%","5","→"],["X-A","98.1%","1","↑"],["XI-C","91.3%","8","↓"]].map((row, ri) => (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 0.6fr", padding: "7px 8px", borderRadius: 4, background: ri === 0 ? "rgba(28,27,23,0.04)" : ri%2===0 ? "rgba(28,27,23,0.015)" : "transparent", fontSize: ri === 0 ? 9 : 11, fontWeight: ri === 0 ? 600 : 400 }}>
                      {row.map((cell, ci) => (
                        <span key={ci} style={{ color: ci === 3 && ri > 0 ? (cell==="↑"?"#1B7A45":cell==="↓"?"#8A2A1A":"#9A6B0A") : "inherit" }}>{cell}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Proxy */}
            <FadeIn delay={0.1}>
              <div className="card" style={{ background: "#1C1B17", border: "none" }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(247,245,239,0.28)", marginBottom: 12 }}>Proxy Attendance Detected</div>
                <div className="serif" style={{ fontSize: 56, color: "#5AC87A", lineHeight: 1, marginBottom: 12 }}>0</div>
                <p style={{ fontSize: 13.5, color: "rgba(247,245,239,0.45)", lineHeight: 1.75 }}>Incidents since installation. AI face recognition doesn't get fooled. Discipline improves from day one.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST — Real Validation
         ══════════════════════════════════════ */}
      <section className="sec" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="pill pill-green" style={{ justifyContent: "center" }}>Tested. Validated. Honest.</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)", letterSpacing: "-0.02em", marginBottom: 14 }}>
              Real testing. Real conditions. Real results.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(28,27,23,0.52)", maxWidth: 540, margin: "0 auto", lineHeight: 1.85 }}>
              We built this in the field — not in a lab. NexaAttend has been tested with real students and staff before we offered it to any school.
            </p>
          </FadeIn>

          {/* Validation badge */}
          <FadeIn>
            <div style={{ background: "rgba(42,107,74,0.06)", border: "1.5px solid rgba(42,107,74,0.2)", borderRadius: 12, padding: "24px 28px", marginBottom: 32, display: "flex", gap: 18, alignItems: "flex-start" }}>
              <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>🏛️</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1B5C3A", marginBottom: 6 }}>Tested in a Government Polytechnic Environment</h3>
                <p style={{ fontSize: 14, color: "rgba(28,27,23,0.6)", lineHeight: 1.8, margin: 0 }}>
                  NexaAttend was deployed and tested in a government polytechnic institution with real users — students and faculty — across multiple sessions. Institution details are kept confidential as per their policy. The insights from that testing are directly built into the system you receive today.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Anonymous testimonials */}
          <div className="g3" style={{ marginBottom: 40 }}>
            {[
              {
                quote: "We used to spend the first 20 minutes of every session taking attendance. Now it just happens. Our teachers were sceptical at first — within a week they refused to go back.",
                person: "Vice Principal",
                inst: "Higher Secondary School, Gujarat",
                initial: "V",
                color: "#1B5C3A"
              },
              {
                quote: "The payroll module alone saved us hours each month. Everything was manual before — now salaries are calculated automatically from attendance data. No more disputes.",
                person: "School Administrator",
                inst: "Technical Institute, India",
                initial: "S",
                color: "#1A2B4A"
              },
              {
                quote: "Parents kept calling us to check if their child came to school. Now they get a WhatsApp message automatically. We haven't had a single call about attendance in two months.",
                person: "Principal",
                inst: "Day School, Ahmedabad",
                initial: "P",
                color: "#3D1A4A"
              },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="card" style={{ borderLeft: `3px solid ${t.color}20`, borderRadius: "0 12px 12px 0", height: "100%" }}>
                  <p style={{ fontSize: 14, color: "rgba(28,27,23,0.65)", lineHeight: 1.85, marginBottom: 20, fontStyle: "italic" }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${t.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: t.color, flexShrink: 0 }}>{t.initial}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1B17" }}>{t.person}</div>
                      <div className="mono" style={{ fontSize: 10, color: "rgba(28,27,23,0.38)", letterSpacing: "0.04em" }}>{t.inst}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(28,27,23,0.04)", borderRadius: 100, padding: "4px 10px" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,27,23,0.38)" }}>Name withheld at request</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Stats */}
          <FadeIn>
            <div style={{ background: "#1C1B17", borderRadius: 14, padding: "32px 28px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, overflow: "hidden" }}>
              {[
                { num: "2–3h", label: "Saved daily", sub: "across all classes" },
                { num: "90%+", label: "Fewer errors", sub: "vs. manual registers" },
                { num: "<3s",  label: "Per student", sub: "face recognition" },
                { num: "0",    label: "Proxy incidents", sub: "from day one" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRight: i < 3 ? "1px solid rgba(247,245,239,0.08)" : "none" }}>
                  <div className="serif" style={{ fontSize: 32, color: "#5AC87A", lineHeight: 1, marginBottom: 5 }}>{s.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F5EF", marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(247,245,239,0.35)" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
         ══════════════════════════════════════ */}
      <section id="pricing" className="sec" style={{ background: "#F7F5EF", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: "10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(42,107,74,0.05), transparent 70%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: -150, right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,146,42,0.03), transparent 70%)", pointerEvents: "none" }}/>

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", padding: "5px 13px", borderRadius: 100, marginBottom: 20, background: "rgba(42,107,74,0.1)", color: "#1B5C3A" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2A6B4A", animation: "pdot 2s ease-in-out infinite" }}/>
              Smart Investment · Transparent Pricing
            </div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", lineHeight: 1.08, letterSpacing: "-0.022em", marginBottom: 12 }}>
              Plans That Scale With Your School
            </h2>
            <p style={{ fontSize: 16, color: "rgba(28,27,23,0.58)", maxWidth: 520, margin: "0 auto", lineHeight: 1.85 }}>
              From 100 to 5,000 students. Pay only for what you use. No lock-in. Same features across all plans.
            </p>
          </FadeIn>

          {/* Founding offer banner */}
          <FadeIn>
            <div style={{ background: "linear-gradient(135deg, #FFF8E8 0%, #FFFBF0 100%)", border: "1.5px solid #D4A433", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <strong style={{ fontSize: 14, color: "#7A5000" }}>Founding Partner Offer — 3 slots remaining at ₹40,000.</strong>
                <span style={{ fontSize: 13.5, color: "#9A6B0A" }}> Once filled, setup price returns to ₹75,000 permanently. This is not a promotional sale.</span>
              </div>
            </div>
          </FadeIn>

          {/* Tab navigation */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 48 }}>
            {[
              { id: "plans", label: "Monthly Plans" },
              { id: "comparison", label: "Full Comparison" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: 8,
                  background: selectedTab === tab.id ? "#1C1B17" : "rgba(28,27,23,0.06)",
                  color: selectedTab === tab.id ? "#F7F5EF" : "rgba(28,27,23,0.54)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.22s",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* PLANS TAB */}
          {selectedTab === "plans" && (
            <div>
              <div className="plan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 32 }}>
                {/* Standard Plan */}
                <div className="plan-card standard">
                  <div className="serif plan-title">Standard</div>
                  <div className="plan-desc">Perfect for growing schools. Core ERP essentials at entry-level pricing.</div>

                  <div className="pricing-row">
                    <div>
                      <div className="pricing-label">Per Student/mo</div>
                      <div className="serif pricing-amount">₹25</div>
                    </div>
                    <div>
                      <div className="pricing-label">Per Staff/mo</div>
                      <div className="serif pricing-amount">₹50</div>
                    </div>
                  </div>

                  <div className="plan-cta">
                    <button className="btn-plan btn-plan-secondary">Learn More</button>
                  </div>

                  <ul className="plan-features">
                    <li><span className="checkmark">✓</span> Face recognition attendance</li>
                    <li><span className="checkmark">✓</span> WhatsApp parent alerts</li>
                    <li><span className="checkmark">✓</span> Basic attendance reports</li>
                    <li><span className="checkmark">✓</span> Student management</li>
                    <li><span className="checkmark">✓</span> 1 admin account</li>
                  </ul>
                </div>

                {/* Advanced Plan - MOST POPULAR */}
                <div className="plan-card advanced">
                  <div className="plan-badge">⭐ Most Popular</div>
                  <div className="serif plan-title">Advanced</div>
                  <div className="plan-desc">Smart choice for established schools. Full control, advanced analytics, better insights.</div>

                  <div className="pricing-row">
                    <div>
                      <div className="pricing-label">Per Student/mo</div>
                      <div className="serif pricing-amount">₹50</div>
                    </div>
                    <div>
                      <div className="pricing-label">Per Staff/mo</div>
                      <div className="serif pricing-amount">₹75</div>
                    </div>
                  </div>

                  <div className="plan-cta">
                    <button className="btn-plan btn-plan-primary" onClick={() => scrollTo("demo")}>Book Demo</button>
                  </div>

                  <div style={{ background: "rgba(90,200,122,0.08)", border: "1px solid rgba(90,200,122,0.15)", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: "rgba(247,245,239,0.75)", lineHeight: 1.6, textAlign: "center" }}>
                    <strong>Most schools choose this plan.</strong> Better control over operations and actionable insights.
                  </div>

                  <ul className="plan-features">
                    <li>Everything in Standard, plus:</li>
                    <li><span className="checkmark">✓</span> Advanced payroll automation</li>
                    <li><span className="checkmark">✓</span> Multi-role admin access</li>
                    <li><span className="checkmark">✓</span> Custom report builder</li>
                    <li><span className="checkmark">✓</span> Staff shift management</li>
                    <li><span className="checkmark">✓</span> Priority phone support</li>
                  </ul>
                </div>

                {/* Enterprise Plan */}
                <div className="plan-card standard">
                  <div className="serif plan-title">Enterprise</div>
                  <div className="plan-desc">Large school networks. Custom integration and dedicated support.</div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(28,27,23,0.52)", marginBottom: 12 }}>Custom pricing based on:</div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                      {["Number of students", "Staff headcount", "Custom API integrations", "Dedicated server setup"].map(item => (
                        <li key={item} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "rgba(28,27,23,0.58)" }}>
                          <span style={{ flexShrink: 0 }}>•</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-cta">
                    <button className="btn-plan btn-plan-secondary">Contact Sales</button>
                  </div>

                  <ul className="plan-features">
                    <li>Everything in Advanced, plus:</li>
                    <li><span className="checkmark">✓</span> Unlimited admin accounts</li>
                    <li><span className="checkmark">✓</span> API access & integrations</li>
                    <li><span className="checkmark">✓</span> Dedicated server setup</li>
                    <li><span className="checkmark">✓</span> Custom feature development</li>
                    <li><span className="checkmark">✓</span> Dedicated account manager</li>
                  </ul>
                </div>
              </div>

              {/* Guarantee Banner */}
              <FadeIn>
                <div style={{ background: "#FFFFFF", border: "2px solid rgba(42,107,74,0.2)", borderRadius: 12, padding: 32, textAlign: "center", display: "flex", gap: 20, alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>🛡️</span>
                  <div style={{ textAlign: "left" }}>
                    <h3 className="serif" style={{ fontSize: 18, fontWeight: 600, color: "#1C1B17", marginBottom: 6 }}>30-Day Performance Guarantee</h3>
                    <p style={{ fontSize: 14, color: "rgba(28,27,23,0.58)", lineHeight: 1.7, margin: 0 }}>
                      Use NexaAttend for 30 days. If it doesn't measurably save your staff time, reduce errors, and simplify operations — we refund you in full. No conditions, no fine print.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          )}

          {/* COMPARISON TAB */}
          {selectedTab === "comparison" && (
            <div style={{ marginTop: 48 }}>
              <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(28,27,23,0.08)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF" }}>
                  <thead>
                    <tr style={{ background: "#F7F5EF", borderBottom: "1px solid rgba(28,27,23,0.08)" }}>
                      <th style={{ padding: "18px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#1C1B17", borderRight: "1px solid rgba(28,27,23,0.08)" }}>Feature</th>
                      <th style={{ padding: "18px 20px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#1C1B17", borderRight: "1px solid rgba(28,27,23,0.08)" }}>Standard</th>
                      <th style={{ padding: "18px 20px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#2A6B4A", background: "rgba(42,107,74,0.04)", borderRight: "1px solid rgba(28,27,23,0.08)" }}>Advanced ⭐</th>
                      <th style={{ padding: "18px 20px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#1C1B17" }}>Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        category: "Attendance",
                        features: [
                          { name: "AI Face Recognition", std: "✓", adv: "✓", ent: "✓" },
                          { name: "Offline Functionality", std: "✓", adv: "✓", ent: "✓" },
                          { name: "Real-time Logs", std: "✓", adv: "✓", ent: "✓" },
                        ],
                      },
                      {
                        category: "Reports & Insights",
                        features: [
                          { name: "Basic Attendance Reports", std: "✓", adv: "✓", ent: "✓" },
                          { name: "Custom Report Builder", std: "—", adv: "✓", ent: "✓" },
                          { name: "Advanced Analytics", std: "—", adv: "✓", ent: "✓" },
                          { name: "Export to Excel/PDF", std: "✓", adv: "✓", ent: "✓" },
                        ],
                      },
                      {
                        category: "Staff Management",
                        features: [
                          { name: "Staff Attendance", std: "✓", adv: "✓", ent: "✓" },
                          { name: "Basic Payroll", std: "✓", adv: "✓", ent: "✓" },
                          { name: "Advanced Payroll Automation", std: "—", adv: "✓", ent: "✓" },
                          { name: "Shift Management", std: "—", adv: "✓", ent: "✓" },
                          { name: "Leave Management", std: "—", adv: "✓", ent: "✓" },
                        ],
                      },
                      {
                        category: "Administration",
                        features: [
                          { name: "Admin Dashboard", std: "✓", adv: "✓", ent: "✓" },
                          { name: "Single Admin Account", std: "1", adv: "Unlimited", ent: "Unlimited" },
                          { name: "Role-based Access", std: "—", adv: "✓", ent: "✓" },
                          { name: "Multi-user Dashboard", std: "—", adv: "✓", ent: "✓" },
                        ],
                      },
                      {
                        category: "Communications",
                        features: [
                          { name: "WhatsApp Parent Alerts", std: "✓", adv: "✓", ent: "✓" },
                          { name: "Custom Alert Templates", std: "—", adv: "✓", ent: "✓" },
                        ],
                      },
                      {
                        category: "Support & Updates",
                        features: [
                          { name: "Email Support", std: "✓", adv: "✓", ent: "✓" },
                          { name: "Priority Phone Support", std: "—", adv: "✓", ent: "✓" },
                          { name: "Dedicated Account Manager", std: "—", adv: "—", ent: "✓" },
                          { name: "Free Lifetime Updates", std: "✓", adv: "✓", ent: "✓" },
                        ],
                      },
                    ].map((section, sIdx) => (
                      <tbody key={sIdx}>
                        <tr style={{ background: "rgba(28,27,23,0.02)" }}>
                          <td colSpan="4" style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2A6B4A", borderBottom: "1px solid rgba(28,27,23,0.08)" }}>
                            {section.category}
                          </td>
                        </tr>
                        {section.features.map((feat, fIdx) => (
                          <tr key={fIdx} style={{ borderBottom: "1px solid rgba(28,27,23,0.06)" }}>
                            <td style={{ padding: "14px 20px", fontSize: 13.5, color: "#1C1B17", borderRight: "1px solid rgba(28,27,23,0.06)" }}>
                              {feat.name}
                            </td>
                            <td style={{ padding: "14px 20px", textAlign: "center", fontSize: 15, color: feat.std === "—" ? "rgba(28,27,23,0.2)" : "#2A6B4A", fontWeight: feat.std === "—" ? 400 : 600, borderRight: "1px solid rgba(28,27,23,0.06)" }}>
                              {feat.std}
                            </td>
                            <td style={{ padding: "14px 20px", textAlign: "center", fontSize: 15, color: feat.adv === "—" ? "rgba(28,27,23,0.2)" : "#2A6B4A", fontWeight: feat.adv === "—" ? 400 : 700, background: "rgba(42,107,74,0.04)", borderRight: "1px solid rgba(28,27,23,0.08)" }}>
                              {feat.adv}
                            </td>
                            <td style={{ padding: "14px 20px", textAlign: "center", fontSize: 15, color: feat.ent === "—" ? "rgba(28,27,23,0.2)" : "#2A6B4A", fontWeight: feat.ent === "—" ? 400 : 600 }}>
                              {feat.ent}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 32, textAlign: "center" }}>
                <p style={{ fontSize: 15, color: "rgba(28,27,23,0.54)", marginBottom: 20, lineHeight: 1.7 }}>
                  Still not sure which plan fits your school?<br/>
                  Book a free demo. We'll show you exactly what you need.
                </p>
                <button className="btn-primary" onClick={() => scrollTo("demo")} style={{ padding: "14px 28px", fontSize: 15 }}>
                  📞 Book Your Free Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
         ══════════════════════════════════════ */}
      <section id="process" className="sec" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <div className="pill pill-green">How It Works</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)", letterSpacing: "-0.02em", marginBottom: 10 }}>
              From demo to live in 3 days.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(28,27,23,0.5)", marginBottom: 48, lineHeight: 1.8 }}>We handle everything. You make one decision.</p>
          </FadeIn>

          <div className="g4" style={{ gap: 24 }}>
            {[
              { step: "01", icon: "📞", title: "Book a Free Demo", body: "WhatsApp or call us. We'll visit your school or connect online — no cost, no commitment, no sales pressure." },
              { step: "02", icon: "🛠️", title: "Free 7-Day Trial", body: "We install NexaAttend and run a live trial with your actual students and staff. You see the numbers yourself." },
              { step: "03", icon: "✓",  title: "You Decide", body: "Trial convinced you? Great. Not sure? Ask more questions. Our 30-day guarantee backs every decision." },
              { step: "04", icon: "🚀", title: "Go Live", body: "Staff trained. Reports automated. From day four onwards, NexaAttend runs in the background — and just works." },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: i === 3 ? "#2A6B4A" : "rgba(42,107,74,0.07)", border: i === 3 ? "none" : "1px solid rgba(42,107,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 20 }}>{s.icon}</div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#2A6B4A", fontWeight: 600, marginBottom: 8 }}>STEP {s.step}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontSize: 13.5, color: "rgba(28,27,23,0.54)", lineHeight: 1.8 }}>{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST / WHY US
         ══════════════════════════════════════ */}
      <section id="trust" className="sec" style={{ background: "#F7F5EF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="g2" style={{ gap: 60, alignItems: "center" }}>
            <FadeIn>
              <div className="pill pill-green">Why Trust Us</div>
              <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.6rem)", lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 18 }}>
                Built in Ahmedabad, for Indian schools, by someone who actually visits them.
              </h2>
              <p style={{ fontSize: 15, color: "rgba(28,27,23,0.58)", lineHeight: 1.85, marginBottom: 24 }}>
                NexaAttend was designed from the ground up for how Indian institutions actually operate — CBSE and GSEB workflows, mixed connectivity, real classroom constraints.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "Your data never leaves your school premises — ever",
                  "Direct WhatsApp access to the founding developer",
                  "1-month money-back guarantee, no conditions",
                  "India-based support, not a foreign ticket system",
                  "Every onboarding personally overseen by the founder",
                  "Works when your internet doesn't — fully offline",
                ].map(t => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#2A6B4A", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 14, color: "#1C1B17", lineHeight: 1.65 }}>{t}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Founder card */}
                <div className="card" style={{ borderLeft: "4px solid #2A6B4A", borderRadius: "0 12px 12px 0" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2A6B4A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>Shah Tishya</div>
                      <div className="mono" style={{ fontSize: 9, color: "rgba(28,27,23,0.38)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Founder · Nova Teach Solution · Ahmedabad</div>
                      <p style={{ fontSize: 13.5, color: "rgba(28,27,23,0.6)", lineHeight: 1.8, fontStyle: "italic" }}>
                        "I built NexaAttend because I was tired of seeing schools run on 5 disconnected systems when one well-made tool could replace all of them. Every feature exists because a real school needed it."
                      </p>
                      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <a href="https://wa.me/919974724656" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 500, color: "#1B5C3A", textDecoration: "none" }}>
                          💬 WhatsApp directly
                        </a>
                        <span style={{ color: "rgba(28,27,23,0.2)" }}>·</span>
                        <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 500, color: "#1B5C3A", textDecoration: "none" }}>
                          <LiIcon/> LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust cards */}
                {[
                  { icon: "🏙️", title: "Ahmedabad-based team", body: "We are local. Same time zone, same context, same language. When you need us, we're reachable — not a ticket queue." },
                  { icon: "🔒", title: "Offline-first by design", body: "No vendor lock-in. Your data belongs to your school, on your server. Not a SaaS dependency." },
                ].map((t, i) => (
                  <div key={i} className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5 }}>{t.title}</div>
                      <p style={{ fontSize: 13, color: "rgba(28,27,23,0.52)", lineHeight: 1.75, margin: 0 }}>{t.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
         ══════════════════════════════════════ */}
      <section className="sec" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="pill pill-green" style={{ justifyContent: "center" }}>Common Questions</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em" }}>
              Questions you'd ask before buying.
            </h2>
          </FadeIn>
          <FadeIn>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 18, color: "rgba(28,27,23,0.35)", transition: "transform 0.22s", transform: activeFaq === i ? "rotate(45deg)" : "none", flexShrink: 0, lineHeight: 1 }}>+</span>
                </button>
                {activeFaq === i && (
                  <div className="faq-a">{faq.a}</div>
                )}
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA / DEMO
         ══════════════════════════════════════ */}
      <section id="demo" className="sec" style={{ background: "#2A6B4A", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(247,245,239,0.06), transparent 70%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(247,245,239,0.05), transparent 70%)", pointerEvents: "none" }}/>

        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <FadeIn>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(247,245,239,0.4)", marginBottom: 18 }}>Free Demo — No Obligation</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 5.5vw, 3.6rem)", lineHeight: 1.06, letterSpacing: "-0.025em", color: "#F7F5EF", marginBottom: 18 }}>
              Book Your Free<br/>School Demo Today.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(247,245,239,0.58)", lineHeight: 1.9, marginBottom: 36, maxWidth: 460, margin: "0 auto 36px" }}>
              We visit your school (or connect online), show you the complete system live, and answer every question — completely free. No contract. No pressure. Just the system working.
            </p>

            <div className="flex-cta" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
              <a href="https://wa.me/919974724656" className="btn-cta">
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.858 1.5 9c0 1.32.337 2.56.928 3.638L1.5 16.5l3.987-.9A7.46 7.46 0 009 16.5c4.142 0 7.5-3.358 7.5-7.5S13.142 1.5 9 1.5z" fill="#25D366" stroke="#25D366" strokeWidth="0.5"/><path d="M12.5 10.9c-.2-.1-1.15-.57-1.33-.63-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.22.14-.42.05a5.3 5.3 0 01-2.6-2.28c-.2-.33.2-.31.56-1.04.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.44-.16-.38-.33-.32-.44-.33h-.38c-.13 0-.34.05-.52.25s-.68.67-.68 1.62.7 1.88.79 2.01c.1.13 1.36 2.08 3.3 2.92 1.22.53 1.7.57 2.31.48.37-.06 1.15-.47 1.31-.92.16-.45.16-.84.11-.92-.05-.08-.18-.13-.38-.22z" fill="#fff"/></svg>
                WhatsApp Us Now
              </a>
              <a href="tel:+919974724656" className="btn-cta-outline">
                📞 Call +91 99747 24656
              </a>
            </div>

            <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
              {["Response within 24 hours","Demo at your school or online","Gujarat schools prioritised"].map(t => (
                <div key={t} style={{ fontSize: 12, color: "rgba(247,245,239,0.4)", display: "flex", gap: 5, alignItems: "center" }}>
                  <span style={{ color: "rgba(247,245,239,0.25)", fontSize: 10 }}>◆</span>{t}
                </div>
              ))}
            </div>

            {/* LinkedIn */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(247,245,239,0.08)", border: "1px solid rgba(247,245,239,0.12)", borderRadius: 10, padding: "11px 18px", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ color: "rgba(247,245,239,0.5)", lineHeight: 1 }}><LiIcon/></span>
              <span style={{ fontSize: 13, color: "rgba(247,245,239,0.65)" }}>Follow updates —</span>
              <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 600, color: "#F7F5EF", textDecoration: "underline", textUnderlineOffset: 3 }}>
                Nova Teach on LinkedIn
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111110", padding: "48px 6% 28px", color: "#F7F5EF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="g2" style={{ gap: 48, paddingBottom: 36, borderBottom: "1px solid rgba(247,245,239,0.07)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, background: "#2A6B4A", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 16 }}>NexaAttend</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2A6B4A" }}>by Nova Teach Solution</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(247,245,239,0.35)", lineHeight: 1.85, maxWidth: 300 }}>
                Complete School ERP with AI face recognition. Offline-first. Transparent pricing. 30-day guarantee.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(247,245,239,0.25)", marginBottom: 14 }}>Product</div>
                {[["Platform","solution"],["Pricing","pricing"],["How It Works","process"],["Book Demo","demo"]].map(([l, id]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <button style={{ background: "none", border: "none", color: "rgba(247,245,239,0.45)", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "'Instrument Sans',sans-serif", transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#F7F5EF"}
                      onMouseLeave={e => e.target.style.color = "rgba(247,245,239,0.45)"}
                      onClick={() => scrollTo(id)}>{l}
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(247,245,239,0.25)", marginBottom: 14 }}>Contact</div>
                <div style={{ fontSize: 13, color: "rgba(247,245,239,0.45)", lineHeight: 2.1 }}>
                  <div>+91 99747 24656</div>
                  <div>WhatsApp available</div>
                  <div>Ahmedabad, Gujarat</div>
                </div>
                <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                  style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "rgba(247,245,239,0.45)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F7F5EF"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(247,245,239,0.45)"}>
                  <LiIcon/> LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "rgba(247,245,239,0.22)" }}>© {new Date().getFullYear()} Nova Teach Solution. Founded by Shah Tishya.</div>
            <div style={{ fontSize: 12, color: "rgba(247,245,239,0.22)" }}>Ahmedabad, Gujarat, India</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
