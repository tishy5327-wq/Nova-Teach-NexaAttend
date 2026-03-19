import { useState, useEffect, useRef } from "react";

const useInView = (threshold = 0.12) => {
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
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
    }}>
      {children}
    </div>
  );
};

const logs = [
  { time: "08:01:03", name: "Arjun Mehta",  cls: "X-A",   status: "present" },
  { time: "08:01:07", name: "Priya Sharma", cls: "X-A",   status: "present" },
  { time: "08:01:14", name: "Rohan Patel",  cls: "IX-B",  status: "present" },
  { time: "08:01:21", name: "Sneha Verma",  cls: "X-A",   status: "late"    },
  { time: "08:01:28", name: "Dev Agarwal",  cls: "XI-C",  status: "present" },
  { time: "08:01:35", name: "Kavya Joshi",  cls: "IX-B",  status: "present" },
  { time: "08:01:40", name: "Ishaan Nair",  cls: "XII-A", status: "absent"  },
];

const LiIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// ── BROCHURE SECTION COMPONENT ──
const BrochureSection = ({ scrollTo }) => {
  const featureGroups = [
    {
      label: "🎓 Student Management",
      features: [
        { icon: "📸", title: "Face Recognition Attendance", desc: "Accurate, contactless, automatic — no registers needed" },
        { icon: "📋", title: "Student Profiles & History",  desc: "Enrollment, performance, fee records in one place" },
        { icon: "📊", title: "Attendance Reports",           desc: "Daily, weekly, monthly — auto-generated instantly" },
        { icon: "💳", title: "Fee Tracking",                 desc: "Pending dues, payment history, receipts" },
        { icon: "🔔", title: "Parent Notifications",         desc: "Automated alerts for attendance and updates" },
        { icon: "📅", title: "Batch & Schedule Management",  desc: "Organise students across batches effortlessly" },
      ]
    },
    {
      label: "👩‍🏫 Staff Management",
      features: [
        { icon: "🕐", title: "Staff Attendance Tracking",   desc: "Same face recognition system — zero extra setup" },
        { icon: "💰", title: "Payroll Management",           desc: "Auto-calculate salaries based on attendance and leaves" },
        { icon: "🗂️", title: "Staff Profiles & Roles",     desc: "Departments, subjects, and access levels" },
        { icon: "📆", title: "Leave Management",             desc: "Apply, approve, and track leaves without paperwork" },
      ]
    },
    {
      label: "🏛️ Admin & Operations Control",
      features: [
        { icon: "📈", title: "Live Dashboard",               desc: "See your entire institute at a glance — any time" },
        { icon: "🖨️", title: "One-Click Reports",           desc: "Export attendance, fees, and payroll instantly" },
        { icon: "🔐", title: "Role-Based Access",            desc: "Admin, teacher, and staff see only what they need" },
        { icon: "📱", title: "Mobile-Friendly",              desc: "Manage operations from your phone, anywhere" },
      ]
    },
  ];

  return (
    <>
      {/* ── BROCHURE BANNER ── */}
      <div style={{ background: "#8B3A2A", padding: "10px 6%", textAlign: "center" }}>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}>
          ⚠ FOUNDING PARTNER OFFER — Only 3–4 spots available at ₹40,000.{" "}
          <span style={{ opacity: 0.8, fontWeight: 400 }}>Price returns to ₹75,000 permanently after slots fill.</span>
        </span>
      </div>

      {/* ── FULL PLATFORM INTRO ── */}
      <section id="platform" className="sec" style={{ background: "#1a1209", color: "#faf8f3", position: "relative", overflow: "hidden" }}>
        {/* decorative circle */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,146,42,0.14), transparent 70%)", pointerEvents: "none" }}/>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#d4a93c", background: "rgba(184,146,42,0.12)", padding: "6px 14px", borderRadius: 100, marginBottom: 20 }}>
              Complete Institute Management System
            </div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", lineHeight: 1.08, letterSpacing: "-0.025em", color: "#faf8f3", marginBottom: 20 }}>
              Run Your Entire Institute<br/>
              From <em style={{ fontStyle: "italic", color: "#d4a93c" }}>One System.</em>
            </h2>
            <p style={{ fontSize: 17, color: "rgba(250,248,243,0.65)", maxWidth: 560, marginBottom: 32, lineHeight: 1.8 }}>
              Attendance is just the beginning. NexaAttend is a complete institute management platform — students, staff, reports, payroll, and operations, all in one place.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
              {["✓ Face Recognition Attendance","✓ Student & Staff Management","✓ Payroll & Reports","✓ 30-Day Guarantee"].map(t => (
                <span key={t} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(250,248,243,0.85)", fontSize: 12, fontWeight: 500, padding: "5px 14px", borderRadius: 100 }}>{t}</span>
              ))}
            </div>
          </FadeIn>

          {/* PROBLEM STRIP */}
          <FadeIn delay={0.1}>
            <div style={{ background: "rgba(255,255,255,0.06)", borderLeft: "4px solid #b8922a", padding: "22px 26px", borderRadius: "0 10px 10px 0", marginBottom: 20 }}>
              <p style={{ fontSize: 16, fontWeight: 500, color: "#faf8f3", margin: 0 }}>
                Most institutes run on 5 disconnected tools — attendance registers, WhatsApp, Excel payroll, manual fees, printed reports. It's slow, error-prone, and costs hours every day.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["❌ Attendance errors","❌ Late or missing reports","❌ Payroll confusion","❌ No real-time visibility","❌ Multiple disconnected tools"].map(t => (
                <span key={t} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "6px 16px", fontSize: 13, fontWeight: 500, color: "rgba(250,248,243,0.7)" }}>{t}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FEATURE GROUPS ── */}
      <section className="sec" style={{ background: "#faf8f3" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b8922a", background: "rgba(184,146,42,0.1)", padding: "6px 14px", borderRadius: 100, marginBottom: 14 }}>
              What's Included
            </div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)", letterSpacing: "-0.02em", color: "#1a1209", marginBottom: 8 }}>
              Every module your institute needs, built in.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(26,25,22,0.55)", marginBottom: 44 }}>Replaces multiple tools. Centralises every operation.</p>
          </FadeIn>

          {featureGroups.map((group, gi) => (
            <FadeIn key={gi} delay={gi * 0.08}>
              <div style={{ marginBottom: 36 }}>
                {/* Group header */}
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b8922a", paddingBottom: 10, borderBottom: "1px solid #e0d8c8", marginBottom: 16 }}>
                  {group.label}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                  {group.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fff", border: "1px solid #e0d8c8", borderRadius: 8, padding: "14px 16px" }}>
                      <div style={{ width: 32, height: 32, flexShrink: 0, background: "#f2ede2", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{f.icon}</div>
                      <div>
                        <strong style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#1a1209", marginBottom: 2 }}>{f.title}</strong>
                        <span style={{ fontSize: 12.5, color: "#6b5e45" }}>{f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}

          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
              {["✅ Save 2–3 hours daily","✅ Zero paperwork","✅ Real-time dashboards","✅ Automated reports"].map(t => (
                <span key={t} style={{ background: "rgba(45,90,61,0.08)", border: "1px solid rgba(45,90,61,0.15)", borderRadius: 100, padding: "6px 16px", fontSize: 13, fontWeight: 500, color: "#2D5A3D" }}>{t}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOUNDING PARTNER PRICING ── */}
      <section id="founding" className="sec" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b8922a", background: "rgba(184,146,42,0.1)", padding: "6px 14px", borderRadius: 100, marginBottom: 14 }}>
              Founding Partner Pricing
            </div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)", letterSpacing: "-0.02em", color: "#1a1209", marginBottom: 10 }}>
              A Complete System Upgrade — At an Exceptional Price
            </h2>
            <p style={{ fontSize: 15, color: "rgba(26,25,22,0.55)", marginBottom: 32, maxWidth: 520, lineHeight: 1.8 }}>
              We're onboarding our first 3–4 institutes as Founding Partners. This is a one-time opportunity — not a promotional gimmick.
            </p>
          </FadeIn>

          {/* Pricing cards */}
          <FadeIn delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Standard — crossed out */}
              <div style={{ borderRadius: 12, padding: "28px 24px", border: "2px solid #e0d8c8", background: "#faf8f3" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8, color: "#6b5e45" }}>Standard Price</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, fontWeight: 900, lineHeight: 1, color: "#1a1209", textDecoration: "line-through", opacity: 0.45 }}>
                  <sub style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 400, verticalAlign: "baseline" }}>₹</sub>75,000
                </div>
                <div style={{ fontSize: 12.5, marginTop: 6, color: "#6b5e45" }}>One-time setup &amp; licence fee</div>
              </div>
              {/* Founding — highlighted */}
              <div style={{ borderRadius: 12, padding: "28px 24px", border: "2px solid #b8922a", background: "#1a1209", color: "#faf8f3" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8, color: "#d4a93c" }}>Founding Partner Price</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, fontWeight: 900, lineHeight: 1, color: "#faf8f3" }}>
                  <sub style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 400, verticalAlign: "baseline" }}>₹</sub>40,000
                </div>
                <div style={{ fontSize: 12.5, marginTop: 6, color: "rgba(250,248,243,0.55)" }}>Same full system · Same lifetime access · Limited slots only</div>
              </div>
            </div>
          </FadeIn>

          {/* Scarcity */}
          <FadeIn delay={0.15}>
            <div style={{ background: "#fff3cd", border: "1px solid #ffe08a", borderRadius: 8, padding: "14px 18px", fontSize: 13.5, fontWeight: 500, color: "#7a5800", marginBottom: 20 }}>
              ⚠ <strong style={{ color: "#5c4000" }}>Only 3–4 Founding Partner slots exist.</strong> Once filled, the price permanently returns to ₹75,000. This is not a sale — it's a one-time founder rate that will not be offered again.
            </div>
          </FadeIn>

          {/* Spots visual */}
          <FadeIn delay={0.18}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              {[true, false, false, false].map((taken, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: taken ? "#c0392b" : "#d4a93c" }}/>
              ))}
              <span style={{ fontSize: 13, color: "rgba(26,25,22,0.55)", marginLeft: 4 }}>— 1 slot taken · 3 remaining at ₹40,000</span>
            </div>
          </FadeIn>

          {/* Monthly note */}
          <FadeIn delay={0.2}>
            <div style={{ background: "#f2ede2", borderRadius: 8, padding: "16px 20px", fontSize: 13.5, color: "#6b5e45", marginBottom: 32 }}>
              Also available on <strong style={{ color: "#1a1209" }}>monthly billing</strong> — <strong style={{ color: "#1a1209" }}>₹50 per student</strong> and <strong style={{ color: "#1a1209" }}>₹75 per staff member.</strong> Ideal for institutes that prefer a flexible, usage-based model.
            </div>
          </FadeIn>

          {/* 30-day guarantee */}
          <FadeIn delay={0.22}>
            <div style={{ background: "#fff", border: "2px solid #b8922a", borderRadius: 12, padding: 28, display: "flex", gap: 20, alignItems: "flex-start" }}>
              <span style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>🛡️</span>
              <div>
                <h3 className="serif" style={{ fontSize: 20, color: "#1a1209", marginBottom: 6 }}>30-Day Performance Guarantee</h3>
                <p style={{ fontSize: 14, color: "rgba(26,25,22,0.6)", margin: 0, lineHeight: 1.75 }}>
                  Use NexaAttend for 30 days. If it doesn't measurably save you time, reduce errors, and simplify daily operations — we will refund you in full. No conditions. No questions asked.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.25}>
            <div style={{ background: "#1a1209", borderRadius: 16, padding: "40px 32px", textAlign: "center", marginTop: 32 }}>
              <h3 className="serif" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#faf8f3", marginBottom: 10 }}>
                Don't Let Your Institute Run on Last Year's Systems
              </h3>
              <p style={{ fontSize: 14, color: "rgba(250,248,243,0.6)", marginBottom: 28, lineHeight: 1.8 }}>
                Get a free 30-minute walkthrough tailored to your institute — and lock in the Founding Partner price before it's gone.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                <a href="https://wa.me/919974724656" className="btn-green" style={{ background: "#b8922a" }}>
                  💬 WhatsApp Us Now
                </a>
                <a href="tel:+919974724656" className="btn-outline" style={{ borderColor: "rgba(250,248,243,0.25)", color: "#faf8f3" }}>
                  📞 Call to Book a Demo
                </a>
              </div>
              <div style={{ fontSize: 12, color: "rgba(250,248,243,0.35)" }}>Free demo · No obligation · Response within 2 hours</div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [logIndex, setLogIndex] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 30);
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

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8F6F1", color: "#1A1916", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #2D5A3D; border-radius: 2px; }
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        .mono  { font-family: 'DM Mono', monospace; }

        .btn-primary {
          background: #1A1916; color: #F8F6F1; border: none; padding: 13px 22px;
          border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.25s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .btn-primary:hover { background: #2D5A3D; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(45,90,61,0.28); }

        .btn-outline {
          background: transparent; color: #1A1916; border: 1.5px solid rgba(26,25,22,0.22);
          padding: 12px 20px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.25s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .btn-outline:hover { border-color: #1A1916; background: rgba(26,25,22,0.04); }

        .btn-green {
          background: #2D5A3D; color: #F8F6F1; border: none; padding: 14px 30px;
          border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.25s; display: inline-flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .btn-green:hover { background: #22452f; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(45,90,61,0.35); }

        .card {
          background: #FFFFFF; border: 1px solid rgba(26,25,22,0.08); border-radius: 12px;
          padding: 24px; transition: box-shadow 0.3s, transform 0.3s;
        }
        .card:hover { box-shadow: 0 8px 36px rgba(26,25,22,0.08); transform: translateY(-2px); }

        .stag {
          display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase; color: #2D5A3D;
          background: rgba(45,90,61,0.08); padding: 6px 14px; border-radius: 100px; margin-bottom: 16px;
        }
        .nav-link {
          font-size: 13px; font-weight: 500; color: rgba(26,25,22,0.6);
          cursor: pointer; transition: color 0.2s; border: none; background: none;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { color: #1A1916; }

        .status-present { color: #2D5A3D; }
        .status-late    { color: #B8860B; }
        .status-absent  { color: #8B3A2A; }

        .ticker-wrap  { overflow: hidden; }
        .ticker-inner { display: flex; gap: 48px; animation: ticker 24s linear infinite; width: max-content; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .gb {
          background: linear-gradient(#fff,#fff) padding-box,
                      linear-gradient(135deg,rgba(45,90,61,0.3),rgba(26,25,22,0.1)) border-box;
          border: 1.5px solid transparent; border-radius: 16px;
        }

        @keyframes pdot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        @keyframes fsi  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .pdot    { animation: pdot 2s ease-in-out infinite; }
        .log-row { animation: fsi 0.4s ease forwards; }

        .stepcon {
          position: absolute; top: 26px; left: calc(50% + 27px);
          width: calc(100% - 54px); height: 1px;
          background: repeating-linear-gradient(90deg,rgba(45,90,61,0.3) 0,rgba(45,90,61,0.3) 4px,transparent 4px,transparent 10px);
        }

        /* ── DIVIDER ── */
        .platform-divider {
          display: flex; align-items: center; gap: 16px;
          padding: 0 6%; background: #F8F6F1;
        }
        .platform-divider::before, .platform-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(26,25,22,0.12);
        }
        .platform-divider span {
          font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(26,25,22,0.35);
          white-space: nowrap; padding: 28px 0;
        }

        /* ── HAMBURGER ── */
        .hbg-btn { display: none; }
        .show-mob-only { display: none; }
        @media (max-width: 640px) {
          .hbg-btn { display: flex !important; }
          .show-mob-only { display: block !important; }
        }
        .mmenu {
          position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
          background: rgba(248,246,241,0.97); backdrop-filter: blur(20px);
          z-index: 90; display: flex; flex-direction: column; padding: 24px 6%;
          overflow-y: auto; transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .mmenu.open { transform: translateX(0); }
        .mlink {
          font-size: 19px; font-weight: 500; color: #1A1916; padding: 16px 0;
          border-bottom: 1px solid rgba(26,25,22,0.07); background: none;
          border-left: none; border-right: none; border-top: none;
          cursor: pointer; text-align: left; font-family: 'DM Sans', sans-serif; transition: color 0.2s;
        }
        .mlink:hover { color: #2D5A3D; }

        /* ── LAYOUT GRID ── */
        .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .g4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

        /* Section padding */
        .sec { padding: 96px 6%; }

        /* ── BREAKPOINTS ── */
        @media (max-width: 900px) {
          .g3     { grid-template-columns: 1fr 1fr !important; }
          .g4     { grid-template-columns: 1fr 1fr !important; }
          .pinner { grid-template-columns: 1fr 1fr !important; }
          .bento  { grid-template-columns: 1fr !important; }
          .fgrid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .sec        { padding: 56px 5% !important; }
          .g2         { grid-template-columns: 1fr !important; }
          .g3         { grid-template-columns: 1fr !important; }
          .g4         { grid-template-columns: 1fr 1fr !important; }
          .fgrid      { grid-template-columns: 1fr !important; }
          .bento      { grid-template-columns: 1fr !important; }
          .pinner     { grid-template-columns: 1fr !important; }
          .bentostat  { grid-template-columns: 1fr 1fr !important; }
          .card       { padding: 16px !important; }
          .hero-h1    { font-size: clamp(2rem, 9vw, 2.6rem) !important; }
          .heropad    { padding: 96px 5% 56px !important; min-height: auto !important; }
          .hide-mob   { display: none !important; }
          .stepcon    { display: none !important; }
          .dbtns      { flex-direction: column !important; }
          .dbtns a    { width: 100% !important; justify-content: center !important; }
          .ftgrid     { grid-template-columns: 1fr !important; gap: 32px !important; }
          .addonsgrid { grid-template-columns: 1fr !important; }
          .trustgrid  { grid-template-columns: 1fr !important; gap: 36px !important; }
          .roigrid    { grid-template-columns: 1fr 1fr !important; }
          .stepgrid   { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
          .fbentorow  { grid-template-columns: 1fr !important; }
          .sec h2     { font-size: clamp(1.5rem, 6vw, 2rem) !important; }
          .pricebadge { font-size: 8px !important; padding: 3px 10px !important; white-space: normal !important; text-align: center !important; width: 80% !important; }
          .pricecta   { flex-direction: column !important; align-items: stretch !important; }
          .pricecta button { justify-content: center !important; }
          .ticker-inner { animation-duration: 18s !important; }
          .ftcols     { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
          .navphone   { display: none !important; }
        }
        @media (max-width: 640px) {
          .herobts { flex-direction: column !important; }
          .herobts button, .herobts a { width: 100% !important; justify-content: center !important; }
          .trustchecks { gap: 8px !important; }
          .guarantee-pill { font-size: 11px !important; padding: 6px 12px !important; text-align: center !important; }
          .ftcols { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
        }
        @media (min-width: 641px) {
          .pinner > div { border-right: 1px solid rgba(26,25,22,0.08) !important; border-bottom: none !important; }
          .pinner > div:last-child { border-right: none !important; }
        }
        @media (max-width: 640px) {
          .pinner > div:last-child { border-bottom: none !important; }
          .pricecta button, .pricecta a { width: 100% !important; justify-content: center !important; }
        }
      `}</style>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div className={`mmenu ${menuOpen ? "open" : ""}`}>
        {[["problem","Why NexaAttend"],["solution","Solution"],["platform","Full Platform"],["pricing","Pricing"],["process","How It Works"],["trust","Trust"]].map(([id, label]) => (
          <button key={id} className="mlink" onClick={() => scrollTo(id)}>{label}</button>
        ))}
        <div style={{ marginTop: 32, padding: "20px 0", borderTop: "1px solid rgba(26,25,22,0.08)" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,25,22,0.35)", marginBottom: 16 }}>Contact Us</div>
          <a href="tel:+919974724656" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 600, color: "#1A1916", textDecoration: "none", marginBottom: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(26,25,22,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📞</span>
            +91 99747 24656
          </a>
          <a href="https://wa.me/919974724656" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 500, color: "#1A1916", textDecoration: "none", marginBottom: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,211,102,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.858 1.5 9c0 1.32.337 2.56.928 3.638L1.5 16.5l3.987-.9A7.46 7.46 0 009 16.5c4.142 0 7.5-3.358 7.5-7.5S13.142 1.5 9 1.5z" fill="#25D366" stroke="#25D366" strokeWidth="0.5"/><path d="M12.5 10.9c-.2-.1-1.15-.57-1.33-.63-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.22.14-.42.05a5.3 5.3 0 01-2.6-2.28c-.2-.33.2-.31.56-1.04.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.44-.16-.38-.33-.32-.44-.33h-.38c-.13 0-.34.05-.52.25s-.68.67-.68 1.62.7 1.88.79 2.01c.1.13 1.36 2.08 3.3 2.92 1.22.53 1.7.57 2.31.48.37-.06 1.15-.47 1.31-.92.16-.45.16-.84.11-.92-.05-.08-.18-.13-.38-.22z" fill="#fff"/></svg>
            </span>
            WhatsApp Us
          </a>
          <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 500, color: "#1A1916", textDecoration: "none", marginBottom: 24 }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(10,102,194,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><LiIcon /></span>
            Follow on LinkedIn
          </a>
          <button className="btn-green" onClick={() => scrollTo("demo")} style={{ width: "100%", justifyContent: "center" }}>Book Free Demo</button>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: navScrolled ? "12px 6%" : "18px 6%",
        background: navScrolled || menuOpen ? "rgba(248,246,241,0.96)" : "transparent",
        backdropFilter: navScrolled || menuOpen ? "blur(20px)" : "none",
        borderBottom: navScrolled || menuOpen ? "1px solid rgba(26,25,22,0.07)" : "none",
        transition: "all 0.4s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: "#2D5A3D", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3" stroke="#F8F6F1" strokeWidth="1.5"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#F8F6F1" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 4l1.5-1.5M12 8l2 .5" stroke="#F8F6F1" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <div className="serif" style={{ fontSize: 16, lineHeight: 1.1, letterSpacing: "-0.01em" }}>NexaAttend</div>
            <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2D5A3D", fontWeight: 600, lineHeight: 1 }}>by Nova Teach</div>
          </div>
        </div>

        <div className="hide-mob" style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {[["problem","Why NexaAttend"],["solution","Solution"],["platform","Full Platform"],["pricing","Pricing"],["process","How It Works"],["trust","Trust"]].map(([id, label]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="tel:+919974724656" className="btn-outline hide-mob" style={{ padding: "8px 14px", fontSize: 13 }}>+91 99747 24656</a>
          <button className="btn-primary" onClick={() => scrollTo("demo")} style={{ padding: "9px 16px", fontSize: 13 }}>Book Demo</button>
          <button onClick={() => setMenuOpen(o => !o)} className="hbg-btn" style={{
            background: "none", border: "1.5px solid rgba(26,25,22,0.18)", cursor: "pointer",
            padding: "7px 9px", borderRadius: 6, alignItems: "center", justifyContent: "center"
          }}>
            {menuOpen
              ? <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="#1A1916" strokeWidth="1.8" strokeLinecap="round"/></svg>
              : <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="#1A1916" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="heropad sec" style={{ minHeight: "100vh", padding: "128px 6% 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle at 70% 40%, rgba(45,90,61,0.07) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(184,134,11,0.05) 0%, transparent 50%)" }}/>
        <div className="g2" style={{ maxWidth: 1200, margin: "0 auto", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ opacity: 0, animation: "fsi 0.8s 0.1s ease forwards" }}>
              <div className="stag">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2D5A3D", display: "inline-block" }} className="pdot"/>
                AI Attendance for Indian Schools
              </div>
            </div>
            <h1 className="serif hero-h1" style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)", lineHeight: 1.06, letterSpacing: "-0.025em", marginBottom: 22, opacity: 0, animation: "fsi 0.9s 0.25s ease forwards" }}>
              Stop Manual<br/>
              <em style={{ color: "#2D5A3D", fontStyle: "italic" }}>Attendance.</em><br/>
              Switch to AI<br/>in 3 Days.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(26,25,22,0.65)", maxWidth: 440, marginBottom: 28, opacity: 0, animation: "fsi 0.8s 0.4s ease forwards" }}>
              NexaAttend uses face recognition to mark every student and staff member in seconds — no ID cards, no registers, no errors. Runs entirely offline.
            </p>
            <div className="herobts" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32, opacity: 0, animation: "fsi 0.8s 0.5s ease forwards" }}>
              <button className="btn-primary" onClick={() => scrollTo("demo")}>
                Book Free Demo
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn-outline" onClick={() => scrollTo("solution")}>See How It Works</button>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", opacity: 0, animation: "fsi 0.8s 0.65s ease forwards" }}>
              {[["🔒","Works offline"],["✓","No ID cards"],["🏫","Data stays local"]].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(26,25,22,0.55)" }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
            </div>

            {/* ── MOBILE-ONLY LIVE TERMINAL ── */}
            <div className="show-mob-only" style={{ marginTop: 28, opacity: 0, animation: "fsi 0.8s 0.75s ease forwards" }}>
              <div style={{ background: "#FFFFFF", border: "1px solid rgba(26,25,22,0.1)", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(26,25,22,0.08)" }}>
                {/* Terminal titlebar */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid rgba(26,25,22,0.07)", background: "rgba(26,25,22,0.02)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F05A5A" }}/>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F0B45A" }}/>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5AF07A" }}/>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(26,25,22,0.35)", marginLeft: 6 }}>nexa — live attendance</span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#52d880", display: "inline-block", animation: "pdot 2s ease-in-out infinite" }}/>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#2D5A3D", fontWeight: 600 }}>LIVE</span>
                  </div>
                </div>
                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(26,25,22,0.06)" }}>
                  {[{ l: "Present", v: "284", c: "#2D5A3D" }, { l: "Late", v: "12", c: "#B8860B" }, { l: "Absent", v: "8", c: "#8B3A2A" }].map(s => (
                    <div key={s.l} style={{ background: "#fff", padding: "12px 8px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: s.c, lineHeight: 1, marginBottom: 3 }}>{s.v}</div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(26,25,22,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {/* Log rows */}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(26,25,22,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>Recognition Log</div>
                  {logs.slice(0, logIndex).map((log, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 6px", background: i % 2 === 0 ? "rgba(26,25,22,0.02)" : "transparent", borderRadius: 4, marginBottom: 2 }}>
                      <span style={{ fontFamily: "'DM Mono',monospace", color: "rgba(26,25,22,0.28)", fontSize: 9, minWidth: 44, flexShrink: 0 }}>{log.time}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace", color: "#1A1916", fontWeight: 500, flex: 1, fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{log.name}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace", color: "rgba(26,25,22,0.35)", fontSize: 9, flexShrink: 0 }}>{log.cls}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 700, textTransform: "uppercase", flexShrink: 0, color: log.status === "present" ? "#2D5A3D" : log.status === "late" ? "#B8860B" : "#8B3A2A" }}>{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hide-mob" style={{ opacity: 0, animation: "fsi 1s 0.5s ease forwards" }}>
            <div className="gb" style={{ background: "#FFFFFF", padding: 22, boxShadow: "0 24px 80px rgba(26,25,22,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(26,25,22,0.07)" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#F05A5A" }}/>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#F0B45A" }}/>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#5AF07A" }}/>
                <span className="mono" style={{ fontSize: 10, color: "rgba(26,25,22,0.35)", marginLeft: 8 }}>nexa — live attendance</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#52d880", display: "inline-block" }} className="pdot"/>
                  <span className="mono" style={{ fontSize: 9, color: "#2D5A3D" }}>LIVE</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 16 }}>
                {[{ l: "Present", v: "284", c: "#2D5A3D" }, { l: "Late", v: "12", c: "#B8860B" }, { l: "Absent", v: "8", c: "#8B3A2A" }].map(s => (
                  <div key={s.l} style={{ background: "rgba(26,25,22,0.03)", borderRadius: 7, padding: "10px 8px", textAlign: "center" }}>
                    <div className="serif" style={{ fontSize: 24, color: s.c, lineHeight: 1 }}>{s.v}</div>
                    <div className="mono" style={{ fontSize: 9, color: "rgba(26,25,22,0.4)", marginTop: 3, textTransform: "uppercase" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="mono" style={{ fontSize: 11 }}>
                <div style={{ color: "rgba(26,25,22,0.3)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Recognition Log</div>
                {logs.slice(0, logIndex).map((log, i) => (
                  <div key={i} className="log-row" style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 7px", background: "rgba(26,25,22,0.02)", borderRadius: 4, marginBottom: 2 }}>
                    <span style={{ color: "rgba(26,25,22,0.28)", minWidth: 50, fontSize: 10 }}>{log.time}</span>
                    <span style={{ color: "#1A1916", fontWeight: 500, flex: 1, fontSize: 11 }}>{log.name}</span>
                    <span style={{ color: "rgba(26,25,22,0.35)", fontSize: 10 }}>{log.cls}</span>
                    <span className={`status-${log.status}`} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: "#2D5A3D", padding: "12px 0", overflow: "hidden" }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(2)].flatMap(() => ["◆ Works 100% Offline","◆ 3-Day Setup","◆ No ID Cards Needed","◆ 1-Month Money-Back","◆ Built for Indian Schools","◆ Data Never Leaves Your School","◆ Free Lifetime Updates","◆ Ahmedabad-Based Team"])
              .map((item, i) => (
                <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(248,246,241,0.75)", whiteSpace: "nowrap", textTransform: "uppercase" }}>{item}</span>
              ))}
          </div>
        </div>
      </div>

      {/* ── PROBLEM ── */}
      <section id="problem" className="sec" style={{ background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="stag">The Problem</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.9rem)", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 580, marginBottom: 12 }}>
              Manual attendance is costing your school more than you think.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(26,25,22,0.55)", maxWidth: 500, marginBottom: 44, lineHeight: 1.8 }}>
              Most Indian schools accept these problems as normal. They aren't.
            </p>
          </FadeIn>
          <div className="g3">
            {[
              { num: "01", headline: "2–3 hours wasted every day", body: "Teachers spend 15–20 minutes per class calling names. That is teaching time permanently lost.", accent: "#8B3A2A" },
              { num: "02", headline: "Proxy attendance is undetectable", body: "Students mark absent friends 'present' without anyone noticing. Face recognition stops this completely.", accent: "#B8860B" },
              { num: "03", headline: "Manual errors create disputes", body: "Wrong entries, illegible handwriting. Parents call. Staff scramble. Every mistake costs trust and time.", accent: "#2D5A3D" },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card" style={{ borderTop: `3px solid ${p.accent}` }}>
                  <div className="mono" style={{ fontSize: 11, color: p.accent, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>{p.num}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3, marginBottom: 10 }}>{p.headline}</h3>
                  <p style={{ fontSize: 14, color: "rgba(26,25,22,0.55)", lineHeight: 1.75 }}>{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="solution" className="sec" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="stag">The Solution</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.9rem)", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 540, marginBottom: 44 }}>
              NexaAttend handles attendance so your staff can focus on education.
            </h2>
          </FadeIn>
          <div className="g2" style={{ marginBottom: 14 }}>
            <FadeIn>
              <div style={{ background: "#1A1916", borderRadius: 12, padding: 28, color: "#F8F6F1" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(45,90,61,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke="#5af07a" strokeWidth="1.5"/><circle cx="11" cy="8" r="7" stroke="#5af07a" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5"/><path d="M3 20c0-4.418 3.582-7 8-7s8 2.582 8 7" stroke="#5af07a" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <h3 className="serif" style={{ fontSize: 21, marginBottom: 10 }}>Face Recognition Engine</h3>
                <p style={{ fontSize: 14, color: "rgba(248,246,241,0.55)", lineHeight: 1.75, marginBottom: 16 }}>
                  Students and staff walk past the camera. NexaAttend identifies each face in under 1 second — no stopping, no scanning, no effort.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["&lt;1 sec per face", "All lighting", "99%+ accuracy"].map(t => (
                    <span key={t} className="mono" style={{ fontSize: 10, color: "rgba(248,246,241,0.4)", background: "rgba(255,255,255,0.06)", padding: "4px 9px", borderRadius: 4 }}>{t}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="#2D5A3D" strokeWidth="1.5"/><path d="M6 8h8M6 12h5" stroke="#2D5A3D" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "Automated Reports", body: "Daily, weekly, and monthly reports generated automatically." },
                { icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#2D5A3D" strokeWidth="1.5"/><path d="M7 17h6M10 14v3" stroke="#2D5A3D" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "Instant Parent Alerts", body: "SMS and WhatsApp alerts sent automatically for absent or late students." },
              ].map((f, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="card">
                    <div style={{ width: 34, height: 34, borderRadius: 7, background: "rgba(45,90,61,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>{f.icon}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                    <p style={{ fontSize: 13.5, color: "rgba(26,25,22,0.55)", lineHeight: 1.75 }}>{f.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
          <div className="g3">
            {[
              { title: "Works 100% Offline", body: "No internet required. Everything runs on your school's own computer." },
              { title: "Multi-Role Dashboards", body: "Separate views for teachers, administrators, and management." },
              { title: "Any Standard Camera", body: "Works with any webcam or IP camera — no specialist hardware." },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2D5A3D", marginBottom: 12 }}/>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 7 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: "rgba(26,25,22,0.55)", lineHeight: 1.75 }}>{f.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT EXPERIENCE ── */}
      <section className="sec" style={{ background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="stag">Product Experience</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.9rem)", letterSpacing: "-0.02em", marginBottom: 44 }}>
              Built for principals, <em style={{ fontStyle: "italic", color: "#2D5A3D" }}>not IT teams.</em>
            </h2>
          </FadeIn>
          <div className="g2" style={{ marginBottom: 14 }}>
            <FadeIn>
              <div className="card">
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,25,22,0.4)", marginBottom: 12 }}>Live Dashboard — Today</div>
                <div className="bentostat g4" style={{ gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Students Present", value: "284", trend: "+3",       ok: true  },
                    { label: "Staff Present",     value: "28",  trend: "100%",     ok: true  },
                    { label: "Attendance Rate",   value: "96.8%",trend: "+1.2%",  ok: true  },
                    { label: "Alerts Sent",       value: "18",  trend: "WhatsApp", ok: false },
                  ].map(m => (
                    <div key={m.label} style={{ background: "rgba(26,25,22,0.03)", borderRadius: 8, padding: "10px 8px" }}>
                      <div className="serif" style={{ fontSize: 20, lineHeight: 1, color: "#1A1916", marginBottom: 3 }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: "rgba(26,25,22,0.45)", lineHeight: 1.4, marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: m.ok ? "#2D5A3D" : "#B8860B" }}>{m.trend}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "rgba(26,25,22,0.35)", marginBottom: 5 }}>Attendance this week</div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 40 }}>
                  {[88,94,92,97,96].map((v, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ width: "100%", background: i === 4 ? "#2D5A3D" : "rgba(45,90,61,0.2)", borderRadius: "3px 3px 0 0", height: `${v * 0.4}px` }}/>
                      <div className="mono" style={{ fontSize: 9, color: "rgba(26,25,22,0.35)" }}>{["M","T","W","T","F"][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card" style={{ background: "#2D5A3D", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,246,241,0.45)", marginBottom: 16 }}>Time Saved Today</div>
                  <div className="serif" style={{ fontSize: 46, color: "#F8F6F1", lineHeight: 1, marginBottom: 8 }}>2.4<span style={{ fontSize: 20 }}>h</span></div>
                  <p style={{ fontSize: 13, color: "rgba(248,246,241,0.55)", lineHeight: 1.7 }}>vs. manual register for 304 students and staff</p>
                </div>
                <div style={{ borderTop: "1px solid rgba(248,246,241,0.12)", paddingTop: 14, marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "rgba(248,246,241,0.45)", marginBottom: 3 }}>This month</div>
                  <div className="serif" style={{ fontSize: 26, color: "#F8F6F1" }}>52h</div>
                  <div style={{ fontSize: 11, color: "rgba(248,246,241,0.35)" }}>freed for teaching</div>
                </div>
              </div>
            </FadeIn>
          </div>
          <div className="g2">
            <FadeIn>
              <div className="card">
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,25,22,0.4)", marginBottom: 12 }}>Monthly Report</div>
                <div className="mono">
                  {[["Class","Present%","Absent","Trend"],["IX-A","97.2%","2","↑"],["IX-B","94.8%","5","→"],["X-A","98.1%","1","↑"],["XI-C","91.3%","8","↓"]].map((row, ri) => (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 0.6fr", padding: "6px 8px", borderRadius: 4, background: ri === 0 ? "rgba(26,25,22,0.04)" : ri % 2 === 0 ? "rgba(26,25,22,0.015)" : "transparent", fontSize: ri === 0 ? 9 : 11, fontWeight: ri === 0 ? 600 : 400 }}>
                      {row.map((cell, ci) => (
                        <span key={ci} style={{ color: ci === 3 && ri > 0 ? (cell==="↑"?"#2D5A3D":cell==="↓"?"#8B3A2A":"#B8860B") : "inherit" }}>{cell}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card" style={{ background: "#1A1916", border: "none" }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,246,241,0.3)", marginBottom: 12 }}>Proxy Detection</div>
                <div className="serif" style={{ fontSize: 48, color: "#5af07a", lineHeight: 1, marginBottom: 10 }}>0</div>
                <p style={{ fontSize: 13, color: "rgba(248,246,241,0.45)", lineHeight: 1.7 }}>Proxy incidents since installation. Face recognition makes proxy impossible.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FEATURES / BENEFITS ── */}
      <section className="sec" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="stag">Features & Benefits</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.9rem)", letterSpacing: "-0.02em", maxWidth: 500, marginBottom: 44 }}>
              Every feature designed around outcomes, not technology.
            </h2>
          </FadeIn>
          <div className="fgrid g2" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(26,25,22,0.08)" }}>
            {[
              { benefit: "Mark attendance in under 3 seconds", detail: "No calling names, no ID scanning. Students walk in — attendance is marked." },
              { benefit: "Reduce errors by 90%+",               detail: "Automated recognition eliminates manual data entry and its inevitable mistakes." },
              { benefit: "Runs offline — full control",          detail: "Your data on your computer. No cloud, no breach exposure." },
              { benefit: "Instant parent communication",         detail: "Absence alerts via SMS/WhatsApp without any staff effort." },
              { benefit: "Save 2–3 hours every day",             detail: "Across all classes and staff check-ins — that time goes back to teaching." },
              { benefit: "Reports in one click",                  detail: "Any class, any date range. Generated in seconds." },
              { benefit: "Free lifetime updates",                 detail: "Technology improves. Your system improves with it, free." },
              { benefit: "Setup in 3 days",                       detail: "Our team installs, configures, and trains your staff." },
            ].map((f, i) => (
              <FadeIn key={i} delay={(i % 4) * 0.06}>
                <div style={{ padding: "20px 22px", background: "#FFFFFF", borderBottom: "1px solid rgba(26,25,22,0.08)", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F8F6F1"}
                  onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                  <div style={{ display: "flex", gap: 9, marginBottom: 5 }}>
                    <span style={{ color: "#2D5A3D", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>✓</span>
                    <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{f.benefit}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(26,25,22,0.5)", lineHeight: 1.75, paddingLeft: 24 }}>{f.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DIVIDER — transitions into full platform
         ══════════════════════════════════════════ */}
      <div className="platform-divider">
        <span>NexaAttend is more than attendance — see the full platform below</span>
      </div>

      {/* ── BROCHURE / FULL PLATFORM SECTION ── */}
      <BrochureSection scrollTo={scrollTo} />

      {/* ── PRICING ── */}
      <section id="pricing" className="sec" style={{ background: "#F8F6F1" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div className="stag" style={{ justifyContent: "center" }}>Pricing</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.9rem)", letterSpacing: "-0.02em", marginBottom: 10 }}>
              Simple, transparent pricing.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(26,25,22,0.55)", marginBottom: 8, lineHeight: 1.8 }}>
              One-time setup. Predictable monthly cost. No hidden charges.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(45,90,61,0.1)", borderRadius: 100, padding: "7px 16px", marginBottom: 44, fontSize: 13, fontWeight: 600, color: "#2D5A3D" }}>
              1-Month Money-Back Guarantee — No Questions Asked
            </div>
          </FadeIn>
          <FadeIn>
            <div className="card" style={{ border: "2px solid #2D5A3D", position: "relative", marginBottom: 24, padding: 0, overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#2D5A3D", color: "#F8F6F1", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 16px", borderRadius: 100, whiteSpace: "nowrap", zIndex: 1 }}>
                Everything in One Plan
              </div>
              <div className="pinner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                {[
                  { label: "Setup", price: "₹40,000", period: "one-time", desc: "Full installation, configuration, and staff training.", items: ["System installation","Camera setup","Staff training","First-month support"], bg: "#FAFAF8" },
                  { label: "Students", price: "₹25", period: "per student / month", desc: "Scales with your school. Better value as you grow.", items: ["Face recognition","Attendance logs","Parent alerts","Class-wise reports"], bg: "#FFFFFF" },
                  { label: "Employees", price: "₹50", period: "per employee / month", desc: "Full staff attendance with management dashboard.", items: ["Staff recognition","Shift reports","Payroll export","Role-based access"], bg: "#FAFAF8" },
                ].map((p, i) => (
                  <div key={i} style={{ padding: "28px 20px", background: p.bg, borderBottom: "1px solid rgba(26,25,22,0.08)", textAlign: "left" }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,25,22,0.4)", marginBottom: 12 }}>{p.label}</div>
                    <div className="serif" style={{ fontSize: 30, lineHeight: 1, marginBottom: 4 }}>{p.price}</div>
                    <div style={{ fontSize: 12, color: "rgba(26,25,22,0.45)", marginBottom: 12 }}>{p.period}</div>
                    <p style={{ fontSize: 12.5, color: "rgba(26,25,22,0.55)", lineHeight: 1.75, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(26,25,22,0.07)" }}>{p.desc}</p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.items.map(item => (
                        <li key={item} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "#1A1916" }}>
                          <span style={{ color: "#2D5A3D", fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="pricecta" style={{ padding: "14px 20px", background: "rgba(45,90,61,0.04)", borderTop: "1px solid rgba(26,25,22,0.07)", display: "flex", justifyContent: "center" }}>
                <button className="btn-green" onClick={() => scrollTo("demo")}>
                  Book Free Demo
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </FadeIn>
          <FadeIn>
            <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid rgba(26,25,22,0.08)", padding: "16px 18px", display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 52 }}>
              {["No hidden charges","Cancel anytime","1-month money-back","Free lifetime updates","No lock-in"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(26,25,22,0.6)" }}>
                  <span style={{ color: "#2D5A3D", fontWeight: 700 }}>✓</span>{t}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(26,25,22,0.35)", marginBottom: 8 }}>Optional Add-Ons</div>
                <h3 className="serif" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", letterSpacing: "-0.015em", marginBottom: 6 }}>Extend NexaAttend as your school grows.</h3>
                <p style={{ fontSize: 14, color: "rgba(26,25,22,0.5)", lineHeight: 1.75 }}>Available any time after setup. Add or remove with 30 days notice.</p>
              </div>
              <div className="g3 addonsgrid" style={{ gap: 10 }}>
                {[
                  { icon: "☁️", name: "Cloud Backup",       price: "₹999",  pd: "/ month", desc: "Automatic daily backup. Access records from anywhere.", badge: null },
                  { icon: "📊", name: "Advanced Analytics", price: "₹799",  pd: "/ month", desc: "Class-wise trends, absentee alerts, teacher punctuality reports.", badge: "Popular" },
                  { icon: "📱", name: "Parent Mobile App",  price: "₹499",  pd: "/ month", desc: "Branded app for parents to view attendance and get alerts.", badge: null },
                  { icon: "🔗", name: "ERP Integration",    price: "Custom", pd: "",         desc: "Connect with your existing school ERP. One-time fee.", badge: null },
                  { icon: "🏫", name: "Multi-Branch",       price: "Custom", pd: "",         desc: "Manage multiple school branches from one dashboard.", badge: null },
                  { icon: "🛡️", name: "Extended Support",  price: "₹499",  pd: "/ month", desc: "Priority WhatsApp support + quarterly on-site check-ins.", badge: null },
                ].map((a, i) => (
                  <div key={i} className="card" style={{ position: "relative", padding: "18px 20px", textAlign: "left" }}>
                    {a.badge && <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(45,90,61,0.1)", color: "#2D5A3D", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 9px", borderRadius: 100 }}>{a.badge}</div>}
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{a.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 7 }}>
                      <span className="serif" style={{ fontSize: 19 }}>{a.price}</span>
                      <span style={{ fontSize: 12, color: "rgba(26,25,22,0.4)" }}>{a.pd}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(26,25,22,0.5)", lineHeight: 1.7 }}>{a.desc}</p>
                  </div>
                ))}
              </div>
              <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "rgba(26,25,22,0.4)", fontStyle: "italic" }}>
                Don't see what you need?{" "}
                <button onClick={() => scrollTo("demo")} style={{ background: "none", border: "none", color: "#2D5A3D", fontWeight: 600, cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>Talk to us</button>
                {" "}— we build custom solutions.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── ROI ── */}
      <section className="sec" style={{ background: "#1A1916", color: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="stag" style={{ color: "rgba(248,246,241,0.5)", background: "rgba(248,246,241,0.08)" }}>Return on Investment</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.9rem)", letterSpacing: "-0.02em", maxWidth: 500, marginBottom: 44, color: "#F8F6F1" }}>
              What NexaAttend actually <em style={{ fontStyle: "italic", color: "#5af07a" }}>returns</em> to your school.
            </h2>
          </FadeIn>
          <div className="g4 roigrid" style={{ gap: 2, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(248,246,241,0.08)" }}>
            {[
              { num: "2–3h", label: "Saved daily",       sub: "All classes and staff check-ins — given back to teaching." },
              { num: "90%+", label: "Fewer errors",       sub: "vs. manual register systems. Face recognition doesn't make typos." },
              { num: "0",    label: "Proxy incidents",    sub: "Face recognition can't be fooled. Discipline improves within weeks." },
              { num: "52h",  label: "Per month freed",    sub: "Over a full working week returned to your staff every month." },
            ].map((r, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ padding: "32px 20px", borderRight: i % 2 === 0 ? "1px solid rgba(248,246,241,0.08)" : "none", borderBottom: i < 2 ? "1px solid rgba(248,246,241,0.08)" : "none", transition: "background 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(248,246,241,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div className="serif" style={{ fontSize: 44, lineHeight: 1, color: "#5af07a", marginBottom: 8 }}>{r.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F8F6F1", marginBottom: 6 }}>{r.label}</div>
                  <p style={{ fontSize: 13, color: "rgba(248,246,241,0.4)", lineHeight: 1.75 }}>{r.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" className="sec" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="stag">How It Works</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.9rem)", letterSpacing: "-0.02em", marginBottom: 12 }}>From demo to live in 3 days.</h2>
            <p style={{ fontSize: 15, color: "rgba(26,25,22,0.55)", maxWidth: 440, marginBottom: 44, lineHeight: 1.8 }}>We handle everything. You make one decision.</p>
          </FadeIn>
          <div className="g4 stepgrid" style={{ gap: 20 }}>
            {[
              { step: "01", title: "Book Free Demo",  body: "Call or WhatsApp us. We visit your school or connect online — no cost, no commitment.", icon: "📞" },
              { step: "02", title: "Free Trial",       body: "We install NexaAttend and run a 7-day trial with your actual students and staff.", icon: "🔧" },
              { step: "03", title: "You Decide",       body: "After the trial, you decide. 1-month money-back if you change your mind.", icon: "✓" },
              { step: "04", title: "Go Live",          body: "Staff trained. Reports automated. Day 4 onwards — it just works.", icon: "🚀" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ position: "relative" }}>
                  {i < 3 && <div className="stepcon"/>}
                  <div style={{ width: 50, height: 50, borderRadius: 12, background: i === 3 ? "#2D5A3D" : "#F8F6F1", border: i === 3 ? "none" : "1px solid rgba(26,25,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 20 }}>{s.icon}</div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#2D5A3D", fontWeight: 600, marginBottom: 7 }}>STEP {s.step}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 7, lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontSize: 13.5, color: "rgba(26,25,22,0.55)", lineHeight: 1.75 }}>{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section id="trust" className="sec" style={{ background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="g2 trustgrid" style={{ gap: 52, alignItems: "center" }}>
            <FadeIn>
              <div className="stag">Why Trust Us</div>
              <h2 className="serif" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 18 }}>
                Built in Ahmedabad, for Indian schools, by people who understand your challenges.
              </h2>
              <p style={{ fontSize: 15, color: "rgba(26,25,22,0.6)", lineHeight: 1.85, marginBottom: 22 }}>
                Designed from the ground up for Indian institutions — CBSE/GSEB workflows, Indian class structures, local support you can actually reach.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 24 }}>
                {[
                  "Your data never leaves your school premises",
                  "Direct WhatsApp access to our founding team",
                  "1-month money-back guarantee — no conditions",
                  "India-based support, not a foreign call centre",
                  "Founder personally oversees every onboarding",
                ].map(t => (
                  <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ color: "#2D5A3D", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 14, color: "#1A1916", lineHeight: 1.6 }}>{t}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="card" style={{ borderLeft: "4px solid #2D5A3D", borderRadius: "0 12px 12px 0" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#2D5A3D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 17 }}>👤</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 14 }}>Shah Tishya</div>
                      <div className="mono" style={{ fontSize: 9, color: "rgba(26,25,22,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 9 }}>Founder, Nova Teach Solution · Ahmedabad</div>
                      <p style={{ fontSize: 13, color: "rgba(26,25,22,0.6)", lineHeight: 1.75, fontStyle: "italic" }}>
                        "Every school deserves the tools that well-funded institutions use. We built NexaAttend to be the most practical, affordable, and reliable attendance system for Indian schools — with a full 1-month money-back guarantee."
                      </p>
                    </div>
                  </div>
                </div>
                {[
                  { icon: "🏙️", title: "Ahmedabad-based team", body: "We are local. We understand your context, language, and workflows." },
                  { icon: "🔒", title: "Offline-first architecture", body: "No internet dependency. Works even when your connection does not." },
                ].map((t, i) => (
                  <div key={i} className="card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 19, flexShrink: 0 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                      <p style={{ fontSize: 13, color: "rgba(26,25,22,0.55)", lineHeight: 1.7 }}>{t.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA / DEMO ── */}
      <section id="demo" className="sec" style={{ background: "#2D5A3D" }}>
        <div style={{ maxWidth: 660, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,246,241,0.45)", marginBottom: 16 }}>Free Demo — No Obligation</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.9rem, 5vw, 3.4rem)", lineHeight: 1.08, letterSpacing: "-0.025em", color: "#F8F6F1", marginBottom: 16 }}>
              Book Your Free<br/>School Demo Today.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(248,246,241,0.6)", lineHeight: 1.85, marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
              We visit your school, show you the system live, and answer every question — completely free. No contract, no pressure.
            </p>
            <div className="dbtns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
              <a href="https://wa.me/919974724656" className="btn-primary" style={{ background: "#F8F6F1", color: "#1A1916", fontSize: 15, padding: "14px 26px" }}>
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.858 1.5 9c0 1.32.337 2.56.928 3.638L1.5 16.5l3.987-.9A7.46 7.46 0 009 16.5c4.142 0 7.5-3.358 7.5-7.5S13.142 1.5 9 1.5z" fill="#25D366" stroke="#25D366" strokeWidth="0.5"/><path d="M12.5 10.9c-.2-.1-1.15-.57-1.33-.63-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.22.14-.42.05a5.3 5.3 0 01-2.6-2.28c-.2-.33.2-.31.56-1.04.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.44-.16-.38-.33-.32-.44-.33h-.38c-.13 0-.34.05-.52.25s-.68.67-.68 1.62.7 1.88.79 2.01c.1.13 1.36 2.08 3.3 2.92 1.22.53 1.7.57 2.31.48.37-.06 1.15-.47 1.31-.92.16-.45.16-.84.11-.92-.05-.08-.18-.13-.38-.22z" fill="#fff"/></svg>
                WhatsApp Us Now
              </a>
              <a href="tel:+919974724656" className="btn-outline" style={{ borderColor: "rgba(248,246,241,0.25)", color: "#F8F6F1", fontSize: 15, padding: "13px 26px" }}>
                📞 Call +91 99747 24656
              </a>
            </div>
            <div style={{ marginBottom: 24, padding: "13px 18px", background: "rgba(248,246,241,0.08)", borderRadius: 10, border: "1px solid rgba(248,246,241,0.12)", display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ color: "rgba(248,246,241,0.55)" }}><LiIcon/></span>
              <span style={{ fontSize: 13, color: "rgba(248,246,241,0.7)" }}>Stay updated on new features —</span>
              <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 600, color: "#F8F6F1", textDecoration: "underline", textUnderlineOffset: 3 }}>
                Follow Nova Teach on LinkedIn
              </a>
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {["Response within 24 hours","Demo at your school or online","Gujarat schools prioritised"].map(t => (
                <div key={t} style={{ fontSize: 12, color: "rgba(248,246,241,0.45)", display: "flex", gap: 5, alignItems: "center" }}>
                  <span style={{ color: "rgba(248,246,241,0.3)" }}>◆</span>{t}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111110", padding: "48px 6% 28px", color: "#F8F6F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="ftgrid g2" style={{ gap: 48, paddingBottom: 36, borderBottom: "1px solid rgba(248,246,241,0.08)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <div style={{ width: 27, height: 27, background: "#2D5A3D", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="#F8F6F1" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#F8F6F1" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 15 }}>NexaAttend</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D5A3D" }}>by Nova Teach Solution</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(248,246,241,0.4)", lineHeight: 1.8, maxWidth: 300 }}>
                AI face recognition attendance for Indian schools. Offline-first. No hidden charges. 1-month money-back.
              </p>
            </div>
            <div className="ftcols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,246,241,0.3)", marginBottom: 12 }}>Product</div>
                {[["Features","solution"],["Full Platform","platform"],["Pricing","pricing"],["How It Works","process"],["Book Demo","demo"]].map(([l, id]) => (
                  <div key={l} style={{ marginBottom: 9 }}>
                    <button style={{ background: "none", border: "none", color: "rgba(248,246,241,0.5)", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "'DM Sans',sans-serif" }}
                      onMouseEnter={e => e.target.style.color = "#F8F6F1"}
                      onMouseLeave={e => e.target.style.color = "rgba(248,246,241,0.5)"}
                      onClick={() => scrollTo(id)}>{l}
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,246,241,0.3)", marginBottom: 12 }}>Contact</div>
                <div style={{ fontSize: 13, color: "rgba(248,246,241,0.5)", lineHeight: 2 }}>
                  <div>+91 99747 24656</div>
                  <div>WhatsApp available</div>
                  <div style={{ marginTop: 3 }}>Ahmedabad, Gujarat</div>
                </div>
                <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                  style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "rgba(248,246,241,0.5)", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F8F6F1"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(248,246,241,0.5)"}>
                  <LiIcon/> Follow on LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "rgba(248,246,241,0.25)" }}>© {new Date().getFullYear()} Nova Teach Solution. Founded by Shah Tishya.</div>
            <div style={{ fontSize: 12, color: "rgba(248,246,241,0.25)" }}>Ahmedabad, Gujarat, India</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
