import { useState, useEffect, useRef } from "react";
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`
    }}>
      {children}
    </div>
  );
};
const logs = [
  { time: "08:01:03", name: "Arjun Mehta", class: "X-A", status: "present" },
  { time: "08:01:07", name: "Priya Sharma", class: "X-A", status: "present" },
  { time: "08:01:14", name: "Rohan Patel", class: "IX-B", status: "present" },
  { time: "08:01:21", name: "Sneha Verma", class: "X-A", status: "late" },
  { time: "08:01:28", name: "Dev Agarwal", class: "XI-C", status: "present" },
  { time: "08:01:35", name: "Kavya Joshi", class: "IX-B", status: "present" },
  { time: "08:01:40", name: "Ishaan Nair", class: "XII-A", status: "absent" },
];
export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [logIndex, setLogIndex] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setLogIndex(i => (i + 1) % (logs.length + 1)), 1800);
    return () => clearInterval(t);
  }, []);
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8F6F1", color: "#1A1916", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2D5A3D; border-radius: 2px; }
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        .mono { font-family: 'DM Mono', monospace; }
        .btn-primary {
          background: #1A1916; color: #F8F6F1; border: none; padding: 14px 28px;
          border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 600; letter-spacing: 0.02em; cursor: pointer; transition: all 0.25s ease;
          display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .btn-primary:hover { background: #2D5A3D; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(45,90,61,0.28); }
        .btn-outline {
          background: transparent; color: #1A1916; border: 1.5px solid rgba(26,25,22,0.2);
          padding: 13px 24px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; cursor: pointer; transition: all 0.25s ease;
          display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .btn-outline:hover { border-color: #1A1916; background: rgba(26,25,22,0.04); }
        .btn-green {
          background: #2D5A3D; color: #F8F6F1; border: none; padding: 16px 36px;
          border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 15px;
          font-weight: 600; cursor: pointer; transition: all 0.25s ease;
          display: inline-flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .btn-green:hover { background: #22452f; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(45,90,61,0.35); }
        .card {
          background: #FFFFFF; border: 1px solid rgba(26,25,22,0.08); border-radius: 12px;
          padding: 28px; transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .card:hover { box-shadow: 0 8px 40px rgba(26,25,22,0.08); transform: translateY(-2px); }
        .section-tag {
          display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase; color: #2D5A3D;
          background: rgba(45,90,61,0.08); padding: 6px 14px; border-radius: 100px; margin-bottom: 20px;
        }
        .nav-link {
          font-size: 13.5px; font-weight: 500; color: rgba(26,25,22,0.6); text-decoration: none;
          cursor: pointer; transition: color 0.2s; padding: 4px 0; border: none; background: none;
        }
        .nav-link:hover { color: #1A1916; }
        .status-present { color: #2D5A3D; }
        .status-late { color: #B8860B; }
        .status-absent { color: #8B3A2A; }
        .ticker-wrap { overflow: hidden; }
        .ticker-inner { display: flex; gap: 48px; animation: ticker 22s linear infinite; width: max-content; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .gradient-border {
          background: linear-gradient(#fff, #fff) padding-box,
                      linear-gradient(135deg, rgba(45,90,61,0.3), rgba(26,25,22,0.1)) border-box;
          border: 1.5px solid transparent; border-radius: 16px;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .log-row { animation: fadeSlideIn 0.4s ease forwards; }
        .step-connector {
          position: absolute; top: 28px; left: calc(50% + 28px); width: calc(100% - 56px); height: 1px;
          background: repeating-linear-gradient(90deg, rgba(45,90,61,0.3) 0, rgba(45,90,61,0.3) 4px, transparent 4px, transparent 10px);
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .four-col { grid-template-columns: 1fr 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .step-connector { display: none; }
          .hide-mobile { display: none !important; }
          .hero-h1 { font-size: clamp(2.4rem, 8vw, 3.6rem) !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: navScrolled ? "14px 6%" : "20px 6%",
        background: navScrolled ? "rgba(248,246,241,0.94)" : "transparent",
        backdropFilter: navScrolled ? "blur(20px)" : "none",
        borderBottom: navScrolled ? "1px solid rgba(26,25,22,0.07)" : "none",
        transition: "all 0.4s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#2D5A3D", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3" stroke="#F8F6F1" strokeWidth="1.5"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#F8F6F1" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 4l1.5-1.5M12 8l2 .5" stroke="#F8F6F1" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.01em" }}>NexaAttend</div>
            <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2D5A3D", fontWeight: 600, lineHeight: 1 }}>by Nova Teach</div>
          </div>
        </div>
        <div className="hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["problem","solution","pricing","process","trust"].map(id => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}
              style={{ textTransform: "capitalize" }}>{id === "problem" ? "Why NexaAttend" : id.charAt(0).toUpperCase() + id.slice(1)}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="tel:+919974724656" className="btn-outline hide-mobile" style={{ padding: "10px 18px", fontSize: 13 }}>
            +91 99747 24656
          </a>
          <button className="btn-primary" onClick={() => scrollTo("demo")} style={{ padding: "10px 20px", fontSize: 13 }}>
            Book Demo
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", padding: "140px 6% 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "radial-gradient(circle at 70% 40%, rgba(45,90,61,0.07) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(184,134,11,0.05) 0%, transparent 50%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", right: "-200px", top: "80px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(45,90,61,0.06) 0%, transparent 70%)", zIndex: 0 }}/>
        <div className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ opacity: 0, animation: "fadeSlideIn 0.8s 0.1s ease forwards" }}>
              <div className="section-tag">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2D5A3D", display: "inline-block" }} className="pulse-dot" />
                AI Attendance System for Indian Schools
              </div>
            </div>
            <h1 className="serif hero-h1" style={{ fontSize: "clamp(2.8rem, 5vw, 4.4rem)", lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: 28, opacity: 0, animation: "fadeSlideIn 0.9s 0.25s ease forwards" }}>
              Stop Manual<br/>
              <em style={{ color: "#2D5A3D", fontStyle: "italic" }}>Attendance.</em><br/>
              Switch to AI<br/>in 3 Days.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "rgba(26,25,22,0.65)", maxWidth: 440, marginBottom: 36, opacity: 0, animation: "fadeSlideIn 0.8s 0.4s ease forwards" }}>
              NexaAttend uses face recognition to mark every student and staff member in seconds — no ID cards, no manual registers, no errors. Runs entirely offline.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48, opacity: 0, animation: "fadeSlideIn 0.8s 0.5s ease forwards" }}>
              <button className="btn-primary" onClick={() => scrollTo("demo")}>
                Book Free Demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn-outline" onClick={() => scrollTo("solution")}>See How It Works</button>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", opacity: 0, animation: "fadeSlideIn 0.8s 0.65s ease forwards" }}>
              {[{ icon: "🔒", text: "Works offline" }, { icon: "✓", text: "No ID cards needed" }, { icon: "🏫", text: "Data stays in your school" }].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: "rgba(26,25,22,0.55)" }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ opacity: 0, animation: "fadeSlideIn 1s 0.5s ease forwards" }}>
            <div className="gradient-border" style={{ background: "#FFFFFF", padding: 24, boxShadow: "0 24px 80px rgba(26,25,22,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(26,25,22,0.07)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F05A5A" }}/>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F0B45A" }}/>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5AF07A" }}/>
                <span className="mono" style={{ fontSize: 11, color: "rgba(26,25,22,0.35)", marginLeft: 8, letterSpacing: "0.06em" }}>nexa — live attendance stream</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#52d880", display: "inline-block" }} className="pulse-dot"/>
                  <span className="mono" style={{ fontSize: 10, color: "#2D5A3D" }}>LIVE</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 20 }}>
                {[{ label: "Present", value: "284", color: "#2D5A3D" }, { label: "Late", value: "12", color: "#B8860B" }, { label: "Absent", value: "8", color: "#8B3A2A" }].map(s => (
                  <div key={s.label} style={{ background: "rgba(26,25,22,0.03)", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                    <div className="serif" style={{ fontSize: 28, fontWeight: 400, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div className="mono" style={{ fontSize: 10, color: "rgba(26,25,22,0.4)", letterSpacing: "0.08em", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mono" style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ color: "rgba(26,25,22,0.3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Today — Recognition Log</div>
                {logs.slice(0, logIndex > logs.length ? logs.length : logIndex).map((log, i) => (
                  <div key={i} className="log-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 10px", background: "rgba(26,25,22,0.02)", borderRadius: 5 }}>
                    <span style={{ color: "rgba(26,25,22,0.28)", minWidth: 60 }}>{log.time}</span>
                    <span style={{ color: "#1A1916", fontWeight: 500, flex: 1 }}>{log.name}</span>
                    <span style={{ color: "rgba(26,25,22,0.35)", fontSize: 11 }}>{log.class}</span>
                    <span className={`status-${log.status}`} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{log.status}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 6, padding: "0 10px", opacity: 0.4 }}>
                  <span style={{ width: 5, height: 10, background: "#2D5A3D", borderRadius: 2, display: "inline-block", animation: "pulse-dot 1s steps(1) infinite" }}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: "#2D5A3D", padding: "14px 0", overflow: "hidden" }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(2)].flatMap(() => [
              "◆ Works 100% Offline","◆ 3-Day Setup","◆ No ID Cards Needed","◆ 1-Month Money-Back Guarantee",
              "◆ Built for Indian Schools","◆ Data Never Leaves Your School","◆ Free Lifetime Updates","◆ Ahmedabad-Based Team",
            ]).map((item, i) => (
              <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: "rgba(248,246,241,0.75)", whiteSpace: "nowrap", textTransform: "uppercase" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROBLEM ── */}
      <section id="problem" style={{ padding: "120px 6%", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-tag">The Problem</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 640, marginBottom: 16 }}>
              Manual attendance is costing your school more than you think.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(26,25,22,0.55)", maxWidth: 540, marginBottom: 60, lineHeight: 1.8 }}>
              Most Indian schools accept these problems as normal. They aren't. They're fixable — in 3 days.
            </p>
          </FadeIn>
          <div className="three-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { num: "01", headline: "2–3 hours wasted every day", body: "Teachers spend 15–20 minutes per class calling names. Multiply that across all classes. That is teaching time permanently lost.", accent: "#8B3A2A" },
              { num: "02", headline: "Proxy attendance is undetectable", body: "Students mark absent friends 'present' without anyone noticing. Manual registers cannot catch this. Face recognition can.", accent: "#B8860B" },
              { num: "03", headline: "Manual errors create disputes", body: "Wrong entries, missing rows, illegible handwriting. Parents call. Staff scramble. Every mistake costs trust and time.", accent: "#2D5A3D" },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card" style={{ height: "100%", borderTop: `3px solid ${p.accent}` }}>
                  <div className="mono" style={{ fontSize: 11, color: p.accent, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 16 }}>{p.num}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, marginBottom: 12 }}>{p.headline}</h3>
                  <p style={{ fontSize: 14, color: "rgba(26,25,22,0.55)", lineHeight: 1.75 }}>{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="solution" style={{ padding: "120px 6%", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-tag">The Solution</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 600, marginBottom: 60 }}>
              NexaAttend handles attendance so your staff can focus on education.
            </h2>
          </FadeIn>
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <FadeIn>
              <div style={{ background: "#1A1916", borderRadius: 12, padding: 36, color: "#F8F6F1" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(45,90,61,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke="#5af07a" strokeWidth="1.5"/><circle cx="11" cy="8" r="7" stroke="#5af07a" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5"/><path d="M3 20c0-4.418 3.582-7 8-7s8 2.582 8 7" stroke="#5af07a" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <h3 className="serif" style={{ fontSize: 24, marginBottom: 10, letterSpacing: "-0.01em" }}>Face Recognition Engine</h3>
                <p style={{ fontSize: 14, color: "rgba(248,246,241,0.55)", lineHeight: 1.75, marginBottom: 20 }}>
                  Students and staff walk past the camera. NexaAttend identifies each face in under 1 second and marks attendance automatically. No stopping, no scanning, no effort.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["< 1 sec per face", "Works in all lighting", "99%+ accuracy"].map(t => (
                    <span key={t} className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "rgba(248,246,241,0.35)", background: "rgba(255,255,255,0.06)", padding: "5px 10px", borderRadius: 4 }}>{t}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="#2D5A3D" strokeWidth="1.5"/><path d="M6 8h8M6 12h5" stroke="#2D5A3D" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "Automated Reports", body: "Daily, weekly, and monthly attendance reports generated automatically. Principals get the full picture without asking anyone." },
                { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#2D5A3D" strokeWidth="1.5"/><path d="M7 17h6" stroke="#2D5A3D" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 14v3" stroke="#2D5A3D" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "Instant Parent Alerts", body: "SMS and WhatsApp notifications sent automatically when a student is absent or late. Parents know before the first period ends." },
              ].map((f, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="card">
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(45,90,61,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{f.icon}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ fontSize: 13.5, color: "rgba(26,25,22,0.55)", lineHeight: 1.75 }}>{f.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
          <div className="three-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { title: "Works 100% Offline", body: "No internet required. Everything runs on your school's own computer. No cloud dependency, no data breach risk." },
              { title: "Multi-Role Dashboards", body: "Separate views for teachers, administrators, and management. Each person sees exactly what they need." },
              { title: "Any Standard Camera", body: "No expensive hardware. Works with any webcam or IP camera you already have — no specialist equipment needed." },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2D5A3D", marginBottom: 16 }}/>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: "rgba(26,25,22,0.55)", lineHeight: 1.75 }}>{f.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT EXPERIENCE ── */}
      <section style={{ padding: "120px 6%", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-tag">Product Experience</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", marginBottom: 60 }}>
              Built for principals, <em style={{ fontStyle: "italic", color: "#2D5A3D" }}>not IT teams.</em>
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "auto auto", gap: 16 }}>
            <FadeIn>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,25,22,0.4)", marginBottom: 16 }}>Live Dashboard — Today</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
                  {[
                    { label: "Students Present", value: "284", trend: "+3", trendGood: true },
                    { label: "Staff Present", value: "28", trend: "100%", trendGood: true },
                    { label: "Attendance Rate", value: "96.8%", trend: "+1.2%", trendGood: true },
                    { label: "Auto-Alerts Sent", value: "18", trend: "WhatsApp", trendGood: false },
                  ].map(m => (
                    <div key={m.label} style={{ background: "rgba(26,25,22,0.03)", borderRadius: 8, padding: "14px 12px" }}>
                      <div className="serif" style={{ fontSize: 26, lineHeight: 1, color: "#1A1916", marginBottom: 4 }}>{m.value}</div>
                      <div style={{ fontSize: 11, color: "rgba(26,25,22,0.45)", lineHeight: 1.4, marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: m.trendGood ? "#2D5A3D" : "#B8860B" }}>{m.trend}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(26,25,22,0.35)", marginBottom: 8 }}>Attendance this week</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48 }}>
                    {[88, 94, 92, 97, 96].map((v, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ width: "100%", background: i === 4 ? "#2D5A3D" : "rgba(45,90,61,0.2)", borderRadius: "3px 3px 0 0", height: `${v * 0.5}px` }}/>
                        <div className="mono" style={{ fontSize: 9, color: "rgba(26,25,22,0.35)" }}>{["M","T","W","T","F"][i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card" style={{ background: "#2D5A3D", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,246,241,0.45)", marginBottom: 20 }}>Time Saved Today</div>
                  <div className="serif" style={{ fontSize: 52, color: "#F8F6F1", lineHeight: 1, marginBottom: 8 }}>2.4<span style={{ fontSize: 24 }}>h</span></div>
                  <p style={{ fontSize: 13, color: "rgba(248,246,241,0.55)", lineHeight: 1.7 }}>vs. manual register process for 304 students and staff</p>
                </div>
                <div style={{ borderTop: "1px solid rgba(248,246,241,0.12)", paddingTop: 16, marginTop: 20 }}>
                  <div style={{ fontSize: 12, color: "rgba(248,246,241,0.45)", marginBottom: 4 }}>This month</div>
                  <div className="serif" style={{ fontSize: 28, color: "#F8F6F1" }}>52h</div>
                  <div style={{ fontSize: 11, color: "rgba(248,246,241,0.35)" }}>freed for teaching</div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,25,22,0.4)", marginBottom: 16 }}>Automated Monthly Report</div>
                <div className="mono" style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 0 }}>
                  {[["Class","Present%","Late","Absent","Trend"],["IX-A","97.2%","4","2","↑"],["IX-B","94.8%","8","5","→"],["X-A","98.1%","2","1","↑"],["XI-C","91.3%","12","8","↓"]].map((row, ri) => (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 0.8fr 0.8fr 0.6fr", padding: "7px 10px", borderRadius: 5, background: ri === 0 ? "rgba(26,25,22,0.04)" : ri % 2 === 0 ? "rgba(26,25,22,0.015)" : "transparent", fontWeight: ri === 0 ? 600 : 400, fontSize: ri === 0 ? 10 : 12, color: ri === 0 ? "rgba(26,25,22,0.45)" : "#1A1916" }}>
                      {row.map((cell, ci) => (<span key={ci} style={{ color: ci === 4 && ri > 0 ? (cell === "↑" ? "#2D5A3D" : cell === "↓" ? "#8B3A2A" : "#B8860B") : undefined }}>{cell}</span>))}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card" style={{ background: "#1A1916", border: "none" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,246,241,0.3)", marginBottom: 16 }}>Proxy Detection</div>
                <div className="serif" style={{ fontSize: 36, color: "#5af07a", lineHeight: 1, marginBottom: 10 }}>0</div>
                <p style={{ fontSize: 13, color: "rgba(248,246,241,0.45)", lineHeight: 1.7 }}>Proxy attendance incidents detected since installation. Face recognition makes proxy impossible.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FEATURES / BENEFITS ── */}
      <section style={{ padding: "120px 6%", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-tag">Features & Benefits</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", maxWidth: 560, marginBottom: 60 }}>
              Every feature designed around outcomes, not technology.
            </h2>
          </FadeIn>
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(26,25,22,0.08)" }}>
            {[
              { benefit: "Mark attendance in under 3 seconds", detail: "No calling names, no ID scanning. Students walk in — attendance is marked." },
              { benefit: "Reduce errors by 90%+", detail: "Automated recognition eliminates manual data entry and its inevitable mistakes." },
              { benefit: "Runs offline — full control", detail: "Your school's data lives on your computer. No cloud, no subscription risk, no breach exposure." },
              { benefit: "Instant parent communication", detail: "Absence alerts via SMS/WhatsApp sent automatically without staff intervention." },
              { benefit: "Save 2–3 hours every day", detail: "Across all classes and staff check-ins — that time goes back to the classroom." },
              { benefit: "Reports in one click", detail: "Any class, any date range, any format. Generated in seconds, not hours." },
              { benefit: "Free lifetime updates", detail: "Technology improves. Your system improves with it, at no extra cost." },
              { benefit: "Setup in 3 days", detail: "Our team installs, configures, and trains your staff. You're live by Day 3." },
            ].map((f, i) => (
              <FadeIn key={i} delay={(i % 4) * 0.07}>
                <div style={{ padding: "28px 32px", background: "#FFFFFF", borderRight: i % 2 === 0 ? "1px solid rgba(26,25,22,0.08)" : "none", borderBottom: i < 6 ? "1px solid rgba(26,25,22,0.08)" : "none", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F8F6F1"}
                  onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#2D5A3D", fontWeight: 700, fontSize: 16, lineHeight: 1.4, marginTop: 1 }}>✓</span>
                    <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{f.benefit}</h3>
                  </div>
                  <p style={{ fontSize: 13.5, color: "rgba(26,25,22,0.5)", lineHeight: 1.75, paddingLeft: 28 }}>{f.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "120px 6%", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div className="section-tag" style={{ justifyContent: "center" }}>Pricing</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", marginBottom: 14 }}>Simple, transparent pricing.</h2>
            <p style={{ fontSize: 16, color: "rgba(26,25,22,0.55)", marginBottom: 12, lineHeight: 1.8 }}>One-time setup. Predictable monthly cost. No hidden charges.</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(45,90,61,0.1)", borderRadius: 100, padding: "8px 18px", marginBottom: 56, fontSize: 13, fontWeight: 600, color: "#2D5A3D" }}>
              1-Month Money-Back Guarantee — No Questions Asked
            </div>
          </FadeIn>
          <FadeIn>
            <div className="card" style={{ border: "2px solid #2D5A3D", position: "relative", marginBottom: 36, padding: 0, overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#2D5A3D", color: "#F8F6F1", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 18px", borderRadius: 100, whiteSpace: "nowrap", zIndex: 1 }}>
                Everything in One Plan
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                {[
                  { label: "Setup", price: "₹40,000", period: "one-time", desc: "Full installation, configuration, and staff training at your school. Includes hardware assessment.", items: ["System installation", "Camera setup", "Staff training", "First-month support"], bg: "#FAFAF8" },
                  { label: "Students", price: "₹25", period: "per student / month", desc: "Scales with your school. The more students, the better value per head.", items: ["Face recognition", "Attendance logs", "Parent alerts", "Class-wise reports"], bg: "#FFFFFF" },
                  { label: "Employees", price: "₹50", period: "per employee / month", desc: "Full staff attendance tracking with separate management dashboard.", items: ["Staff recognition", "Shift reports", "Payroll export", "Role-based access"], bg: "#FAFAF8" },
                ].map((p, i) => (
                  <div key={i} style={{ padding: "36px 28px", background: p.bg, borderRight: i < 2 ? "1px solid rgba(26,25,22,0.08)" : "none" }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,25,22,0.4)", marginBottom: 16 }}>{p.label}</div>
                    <div className="serif" style={{ fontSize: 36, lineHeight: 1, marginBottom: 4 }}>{p.price}</div>
                    <div style={{ fontSize: 12, color: "rgba(26,25,22,0.45)", marginBottom: 16 }}>{p.period}</div>
                    <p style={{ fontSize: 13, color: "rgba(26,25,22,0.55)", lineHeight: 1.75, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(26,25,22,0.07)" }}>{p.desc}</p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                      {p.items.map(item => (
                        <li key={item} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#1A1916" }}>
                          <span style={{ color: "#2D5A3D", fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{ padding: "18px 28px", background: "rgba(45,90,61,0.04)", borderTop: "1px solid rgba(26,25,22,0.07)", display: "flex", justifyContent: "center" }}>
                <button className="btn-green" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}>
                  Book Free Demo
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </FadeIn>
          <FadeIn>
            <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid rgba(26,25,22,0.08)", padding: "20px 28px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
              {["No hidden charges", "Cancel anytime (30 days notice)", "1-month money-back guarantee", "Free lifetime updates", "No annual lock-in"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: "rgba(26,25,22,0.6)" }}>
                  <span style={{ color: "#2D5A3D", fontWeight: 700 }}>✓</span>{t}
                </div>
              ))}
            </div>
          </FadeIn>

          {/* ── ADD-ONS ── */}
          <FadeIn delay={0.1}>
            <div style={{ marginTop: 64 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(26,25,22,0.35)", marginBottom: 10 }}>Optional Add-Ons</div>
                <h3 className="serif" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", letterSpacing: "-0.015em", marginBottom: 8 }}>Extend NexaAttend as your school grows.</h3>
                <p style={{ fontSize: 14, color: "rgba(26,25,22,0.5)", lineHeight: 1.75 }}>Available any time after initial setup. Add or remove with 30 days notice.</p>
              </div>
              <div className="three-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { icon: "☁️", name: "Cloud Backup", price: "₹999", period: "/ month", desc: "Automatic daily backup of all attendance data to a secure cloud server. Access records from anywhere.", badge: null },
                  { icon: "📊", name: "Advanced Analytics", price: "₹799", period: "/ month", desc: "Deep insights — class-wise trends, chronic absentee alerts, teacher punctuality reports, and more.", badge: "Popular" },
                  { icon: "📱", name: "Parent Mobile App", price: "₹499", period: "/ month", desc: "Branded app for parents to view their child's daily attendance, history, and receive push notifications.", badge: null },
                  { icon: "🔗", name: "ERP Integration", price: "Custom", period: "", desc: "Connect NexaAttend with your existing school ERP or management software. One-time integration fee.", badge: null },
                  { icon: "🏫", name: "Multi-Branch", price: "Custom", period: "", desc: "Manage attendance across multiple school branches from a single dashboard. Centralised reporting.", badge: null },
                  { icon: "🛡️", name: "Extended Support", price: "₹499", period: "/ month", desc: "Priority WhatsApp support, same-day response, and quarterly on-site check-ins from our team.", badge: null },
                ].map((addon, i) => (
                  <div key={i} className="card" style={{ position: "relative", background: "#FFFFFF", padding: "22px 24px" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,25,22,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
                    {addon.badge && (
                      <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(45,90,61,0.1)", color: "#2D5A3D", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100 }}>{addon.badge}</div>
                    )}
                    <div style={{ fontSize: 22, marginBottom: 12 }}>{addon.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{addon.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 10 }}>
                      <span className="serif" style={{ fontSize: 22, color: "#1A1916" }}>{addon.price}</span>
                      <span style={{ fontSize: 12, color: "rgba(26,25,22,0.4)" }}>{addon.period}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(26,25,22,0.5)", lineHeight: 1.75 }}>{addon.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <p style={{ fontSize: 13, color: "rgba(26,25,22,0.4)", fontStyle: "italic" }}>
                  Don't see what you need?{" "}
                  <button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })} style={{ background: "none", border: "none", color: "#2D5A3D", fontWeight: 600, cursor: "pointer", fontSize: 13, fontStyle: "normal", textDecoration: "underline" }}>Talk to us</button>
                  {" "}— we build custom solutions for schools.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── ROI ── */}
      <section style={{ padding: "120px 6%", background: "#1A1916", color: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-tag" style={{ color: "rgba(248,246,241,0.5)", background: "rgba(248,246,241,0.08)" }}>Return on Investment</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", maxWidth: 560, marginBottom: 60, color: "#F8F6F1" }}>
              What NexaAttend actually <em style={{ fontStyle: "italic", color: "#5af07a" }}>returns</em> to your school.
            </h2>
          </FadeIn>
          <div className="four-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 2, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(248,246,241,0.08)" }}>
            {[
              { num: "2–3h", label: "Saved daily", sub: "Across all classes and staff check-ins — given back to teaching." },
              { num: "90%+", label: "Fewer errors", sub: "Compared to manual register systems. Face recognition doesn't make typos." },
              { num: "0", label: "Proxy incidents", sub: "Face recognition cannot be fooled. Discipline improves within weeks." },
              { num: "52h", label: "Per month freed", sub: "That's over a full working week returned to your staff every month." },
            ].map((r, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ padding: "40px 28px", borderRight: i < 3 ? "1px solid rgba(248,246,241,0.08)" : "none", transition: "background 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(248,246,241,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div className="serif" style={{ fontSize: 52, lineHeight: 1, color: "#5af07a", marginBottom: 10 }}>{r.num}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#F8F6F1", marginBottom: 8 }}>{r.label}</div>
                  <p style={{ fontSize: 13, color: "rgba(248,246,241,0.4)", lineHeight: 1.75 }}>{r.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" style={{ padding: "120px 6%", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-tag">How It Works</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", marginBottom: 16 }}>From demo to live system in 3 days.</h2>
            <p style={{ fontSize: 16, color: "rgba(26,25,22,0.55)", maxWidth: 480, marginBottom: 60, lineHeight: 1.8 }}>We handle everything. You make one decision.</p>
          </FadeIn>
          <div className="four-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
            {[
              { step: "01", title: "Book Free Demo", body: "Call or WhatsApp us. We visit your school (or connect online) and show you the system live — no cost, no commitment.", icon: "📞" },
              { step: "02", title: "Free Trial", body: "We install NexaAttend at your school and run a 7-day trial. See how it performs with your actual students and staff.", icon: "🔧" },
              { step: "03", title: "You Decide", body: "After the trial, you decide. If you want to proceed, we set up the full system. 1-month money-back if you change your mind.", icon: "✓" },
              { step: "04", title: "Go Live", body: "System is fully configured. Staff are trained. Reports are automated. Day 4 onwards — it just works.", icon: "🚀" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ position: "relative" }}>
                  {i < 3 && <div className="step-connector"/>}
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: i === 3 ? "#2D5A3D" : "#F8F6F1", border: i === 3 ? "none" : "1px solid rgba(26,25,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 22 }}>{s.icon}</div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#2D5A3D", fontWeight: 600, marginBottom: 10 }}>STEP {s.step}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(26,25,22,0.55)", lineHeight: 1.75 }}>{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section id="trust" style={{ padding: "120px 6%", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <FadeIn>
              <div className="section-tag">Why Trust Us</div>
              <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 24 }}>
                Built in Ahmedabad, for Indian schools, by people who understand your challenges.
              </h2>
              <p style={{ fontSize: 16, color: "rgba(26,25,22,0.6)", lineHeight: 1.85, marginBottom: 28 }}>
                NexaAttend is not a foreign product adapted for India. It was designed from the ground up for Indian institutions — CBSE/GSEB workflows, Indian class structures, local support you can actually reach.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                {["Your data never leaves your school premises","Direct WhatsApp access to our founding team","1-month money-back guarantee — no conditions","India-based support, not a foreign call centre","Founder personally oversees every onboarding"].map(t => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#2D5A3D", fontWeight: 700, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 15, color: "#1A1916", lineHeight: 1.6 }}>{t}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card" style={{ borderLeft: "4px solid #2D5A3D", borderRadius: "0 12px 12px 0" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2D5A3D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 18 }}>👤</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Shah Tishya</div>
                      <div className="mono" style={{ fontSize: 10, color: "rgba(26,25,22,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Founder, Nova Teach Solution · Ahmedabad</div>
                      <p style={{ fontSize: 13.5, color: "rgba(26,25,22,0.6)", lineHeight: 1.75, fontStyle: "italic" }}>
                        "Every school deserves the tools that well-funded institutions use. We built NexaAttend to be the most practical, affordable, and reliable attendance system for Indian schools — and we stand behind it with a full 1-month money-back guarantee."
                      </p>
                    </div>
                  </div>
                </div>
                {[
                  { icon: "🏙️", title: "Ahmedabad-based team", body: "We are local. We understand your context, your language, and your workflows." },
                  { icon: "🔒", title: "Offline-first architecture", body: "No dependency on internet connectivity. Your system works even when your connection does not." },
                ].map((t, i) => (
                  <div key={i} className="card" style={{ display: "flex", gap: 14 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 5 }}>{t.title}</div>
                      <p style={{ fontSize: 13.5, color: "rgba(26,25,22,0.55)", lineHeight: 1.7 }}>{t.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA / DEMO ── */}
      <section id="demo" style={{ padding: "120px 6%", background: "#2D5A3D" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,246,241,0.45)", marginBottom: 20 }}>Free Demo — No Obligation</div>
            <h2 className="serif" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.08, letterSpacing: "-0.025em", color: "#F8F6F1", marginBottom: 20 }}>
              Book Your Free<br/>School Demo Today.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(248,246,241,0.6)", lineHeight: 1.85, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
              We visit your school, show you the system live, and answer every question — completely free. No contract, no pressure.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
              <a href="https://wa.me/919974724656" className="btn-primary" style={{ background: "#F8F6F1", color: "#1A1916", fontSize: 15, padding: "16px 32px" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.858 1.5 9c0 1.32.337 2.56.928 3.638L1.5 16.5l3.987-.9A7.46 7.46 0 009 16.5c4.142 0 7.5-3.358 7.5-7.5S13.142 1.5 9 1.5z" fill="#25D366" stroke="#25D366" strokeWidth="0.5"/><path d="M12.5 10.9c-.2-.1-1.15-.57-1.33-.63-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.22.14-.42.05a5.3 5.3 0 01-2.6-2.28c-.2-.33.2-.31.56-1.04.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.44-.16-.38-.33-.32-.44-.33h-.38c-.13 0-.34.05-.52.25s-.68.67-.68 1.62.7 1.88.79 2.01c.1.13 1.36 2.08 3.3 2.92 1.22.53 1.7.57 2.31.48.37-.06 1.15-.47 1.31-.92.16-.45.16-.84.11-.92-.05-.08-.18-.13-.38-.22z" fill="#fff"/></svg>
                WhatsApp Us Now
              </a>
              <a href="tel:+919974724656" className="btn-outline" style={{ borderColor: "rgba(248,246,241,0.25)", color: "#F8F6F1", fontSize: 15, padding: "15px 32px" }}>
                📞 Call +91 99747 24656
              </a>
            </div>

            {/* LinkedIn CTA inside demo section */}
            <div style={{ marginBottom: 32, padding: "16px 24px", background: "rgba(248,246,241,0.08)", borderRadius: 10, border: "1px solid rgba(248,246,241,0.12)", display: "inline-flex", alignItems: "center", gap: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(248,246,241,0.6)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <span style={{ fontSize: 13, color: "rgba(248,246,241,0.7)" }}>Stay updated on new features —</span>
              <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 600, color: "#F8F6F1", textDecoration: "underline", textUnderlineOffset: 3 }}>
                Follow Nova Teach on LinkedIn
              </a>
            </div>

            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
              {["Response within 24 hours", "Demo at your school or online", "Gujarat schools prioritised"].map(t => (
                <div key={t} style={{ fontSize: 12, color: "rgba(248,246,241,0.45)", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: "rgba(248,246,241,0.3)" }}>◆</span>{t}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111110", padding: "60px 6% 36px", color: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, paddingBottom: 48, borderBottom: "1px solid rgba(248,246,241,0.08)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, background: "#2D5A3D", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="#F8F6F1" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#F8F6F1" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 16 }}>NexaAttend</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D5A3D" }}>by Nova Teach Solution</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(248,246,241,0.4)", lineHeight: 1.8, maxWidth: 340 }}>
                AI face recognition attendance system built for Indian schools. Offline-first. No hidden charges. 1-month money-back guarantee.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,246,241,0.3)", marginBottom: 16 }}>Product</div>
                {["Features", "Pricing", "How It Works", "Book Demo"].map(l => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <button style={{ background: "none", border: "none", color: "rgba(248,246,241,0.5)", fontSize: 13, cursor: "pointer", padding: 0, transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#F8F6F1"}
                      onMouseLeave={e => e.target.style.color = "rgba(248,246,241,0.5)"}
                      onClick={() => scrollTo(l.toLowerCase().replace(" ", "-"))}>
                      {l}
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,246,241,0.3)", marginBottom: 16 }}>Contact</div>
                <div style={{ fontSize: 13, color: "rgba(248,246,241,0.5)", lineHeight: 2 }}>
                  <div>+91 99747 24656</div>
                  <div>WhatsApp available</div>
                  <div style={{ marginTop: 4 }}>Ahmedabad, Gujarat</div>
                  <div>India</div>
                </div>
                <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                  style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(248,246,241,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F8F6F1"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(248,246,241,0.5)"}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Follow us on LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "rgba(248,246,241,0.25)" }}>
              © {new Date().getFullYear()} Nova Teach Solution. Founded by Shahs Tishya.
            </div>
            <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(248,246,241,0.3)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(248,246,241,0.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(248,246,241,0.3)"}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              linkedin.com/company/nova-teach-solutions
            </a>
            <div style={{ fontSize: 12, color: "rgba(248,246,241,0.25)" }}>Ahmedabad, Gujarat, India</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
