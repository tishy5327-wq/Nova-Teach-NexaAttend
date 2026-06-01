import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

/* ─── Firebase Config (from environment variables) ─── */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* ─── Google Apps Script Web App URL (for sheet backup) ─── */
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxgViYSKbN1zFyISMS2l9xgDQGFE8QQAY7IlWjkEmAouzeO5GZwrLg8HZJevvF3SX4uyQ/exec";

/* ─── Intersection Observer Hook ─── */
const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

const FadeIn = ({ children, delay = 0, className = "", style = {} }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ─── Live Attendance Terminal Data ─── */
const logs = [
  { time: "08:01:03", name: "Arjun Mehta", cls: "X-A", status: "present" },
  { time: "08:01:07", name: "Priya Sharma", cls: "X-A", status: "present" },
  { time: "08:01:14", name: "Rohan Patel", cls: "IX-B", status: "present" },
  { time: "08:01:21", name: "Sneha Verma", cls: "X-A", status: "late" },
  { time: "08:01:28", name: "Dev Agarwal", cls: "XI-C", status: "present" },
  { time: "08:01:35", name: "Kavya Joshi", cls: "IX-B", status: "present" },
  { time: "08:01:40", name: "Ishaan Nair", cls: "XII-A", status: "absent" },
];

/* ─── ERP Modules Data ─── */
const modules = [
  {
    icon: "◉",
    title: "Smart Attendance",
    features: ["AI face recognition — zero ID cards", "Works fully offline", "Marks 30 students in under 60 seconds", "Proxy attendance becomes impossible"],
    color: "#1B4D3E",
  },
  {
    icon: "◈",
    title: "Student Management",
    features: ["Complete student profiles & history", "Batch and class management", "Fee tracking and dues", "Parent notification hub"],
    color: "#1A2B4A",
  },
  {
    icon: "◇",
    title: "Staff & HR",
    features: ["Staff attendance via face recognition", "Payroll auto-calculated from attendance", "Leave management & approvals", "Department & role management"],
    color: "#3D1A4A",
  },
  {
    icon: "▣",
    title: "Reports & Analytics",
    features: ["One-click daily / weekly / monthly reports", "Class-wise attendance trends", "Payroll & fee collection reports", "Admin dashboard — always live"],
    color: "#4A2B0A",
  },
];

/* ─── Pricing Data ─── */
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    students: 300,
    monthly: 6000,
    setup: 75000,
    setupDiscounted: 45000,
    badge: "⭐ Best Value For Small Schools",
    desc: "Perfect for smaller schools. Everything you need to replace manual attendance from day one.",
    color: "#1A2B4A",
    features: [
      "Up to 300 students",
      "AI face recognition attendance",
      "2 cameras included",
      "Student management",
      "WhatsApp parent alerts",
      "Basic attendance reports",
      "1 admin account",
      "Email support",
      "Free lifetime updates",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    students: 600,
    monthly: 9000,
    setup: 75000,
    setupDiscounted: 45000,
    badge: "⭐ Most Popular",
    desc: "The most popular choice. Full ERP — payroll, analytics, multi-role access, and more.",
    color: "#1B4D3E",
    features: [
      "Up to 600 students",
      "AI face recognition attendance",
      "2 cameras included",
      "Student + Staff management",
      "WhatsApp parent alerts",
      "Advanced reports & analytics",
      "Payroll automation",
      "Multi-role admin access",
      "Leave management",
      "Priority phone support",
      "Free lifetime updates",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    students: 999,
    monthly: 12000,
    setup: 75000,
    setupDiscounted: 45000,
    badge: "⭐ Best Value For Larger Schools",
    desc: "For large schools and institutes. Full control, unlimited accounts, and dedicated support.",
    color: "#3D1A4A",
    features: [
      "Up to 999 students",
      "AI face recognition attendance",
      "2 cameras included",
      "Complete School ERP",
      "WhatsApp parent alerts",
      "Custom report builder",
      "Payroll automation",
      "Unlimited admin accounts",
      "Shift & leave management",
      "Dedicated account manager",
      "Priority phone support",
      "Free lifetime updates",
    ],
  },
];

const fmt = (n) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
    : `₹${n.toLocaleString("en-IN")}`;
const fmtFull = (n) => `₹${n.toLocaleString("en-IN")}`;

/* ─── LinkedIn Icon ─── */
const LiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="LinkedIn">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/* ─── Demo Video Player Component ─── */
const DemoVideoPlayer = () => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const controlsTimer = useRef(null);
  const containerRef = useRef(null);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
      setHasStarted(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const onLoaded = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pct * videoRef.current.duration;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    if (playing) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 2800);
    }
  };

  const toggleFS = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        background: "#0a0a0a",
        boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(247,245,239,0.08)",
        cursor: playing && !showControls ? "none" : "default",
        aspectRatio: "16/9",
      }}
    >
      <video
        ref={videoRef}
        src="/2026-05-09_11-48-06.mp4"
        style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", background: "#0a0a0a" }}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoaded}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        muted={muted}
        playsInline
        preload="metadata"
        aria-label="NexaAttend product demo video"
      />

      {!hasStarted && (
        <div
          onClick={togglePlay}
          style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            background: "linear-gradient(135deg, rgba(10,9,8,0.55) 0%, rgba(10,9,8,0.3) 100%)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div style={{
            position: "absolute", top: 16, left: 16,
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(10,9,8,0.6)", borderRadius: 8, padding: "6px 14px",
            border: "1px solid rgba(247,245,239,0.12)"
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5AC87A" }} className="pdot" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(247,245,239,0.5)", letterSpacing: "0.08em" }}>
              nexaattend — live portal walkthrough
            </span>
          </div>
          <div style={{
            width: 76, height: 76, borderRadius: "50%",
            background: "rgba(247,245,239,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 12px rgba(247,245,239,0.12)",
            transition: "transform 0.2s, box-shadow 0.2s",
            marginBottom: 16,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1C1B17" style={{ marginLeft: 4 }} aria-label="Play">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "#F7F5EF", marginBottom: 6 }}>
            Watch Product Demo
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(247,245,239,0.4)", letterSpacing: "0.1em" }}>
            {formatTime(duration)} · Full walkthrough
          </div>
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "32px 18px 14px",
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
        opacity: (showControls || !playing) && hasStarted ? 1 : 0,
        transition: "opacity 0.3s",
        pointerEvents: (showControls || !playing) && hasStarted ? "auto" : "none",
      }}>
        <div
          onClick={seek}
          style={{
            width: "100%", height: 3, background: "rgba(247,245,239,0.2)",
            borderRadius: 2, marginBottom: 10, cursor: "pointer", position: "relative"
          }}
        >
          <div style={{
            height: "100%", width: `${progress}%`, background: "#5AC87A",
            borderRadius: 2, position: "relative", transition: "width 0.1s linear"
          }}>
            <div style={{
              position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)",
              width: 11, height: 11, borderRadius: "50%", background: "#5AC87A",
              boxShadow: "0 0 6px rgba(90,200,122,0.6)"
            }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={togglePlay} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#F7F5EF", display: "flex", alignItems: "center" }} aria-label={playing ? "Pause" : "Play"}>
            {playing
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            }
          </button>
          <button onClick={() => setMuted(m => !m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(247,245,239,0.7)", display: "flex", alignItems: "center" }} aria-label={muted ? "Unmute" : "Mute"}>
            {muted
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
            }
          </button>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(247,245,239,0.55)", marginLeft: 2 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={toggleFS} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(247,245,239,0.7)", display: "flex", alignItems: "center" }} aria-label="Fullscreen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              {fullscreen
                ? <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                : <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              }
            </svg>
          </button>
        </div>
      </div>

      {hasStarted && (
        <div onClick={togglePlay} style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 1 }} aria-label="Click to play/pause" />
      )}
    </div>
  );
};

/* ─── Demo Dashboard (sample data) ─── */
const DemoSampleData = {
  students: [
    { id: 1, name: "Arjun Mehta", class: "X-A", rollNo: 24, status: "Active" },
    { id: 2, name: "Priya Sharma", class: "X-A", rollNo: 15, status: "Active" },
    { id: 3, name: "Rohan Patel", class: "IX-B", rollNo: 8, status: "Active" },
  ],
  attendance: [
    { date: "2026-06-01", present: 284, late: 12, absent: 8 },
    { date: "2026-05-31", present: 278, late: 15, absent: 11 },
  ],
  assignments: [
    { title: "Maths - Algebra", dueDate: "2026-06-05", submissions: 42, total: 45 },
    { title: "Science - Physics", dueDate: "2026-06-07", submissions: 38, total: 42 },
  ],
  exams: [
    { name: "Mid-Term", startDate: "2026-07-15", endDate: "2026-07-25", status: "Upcoming" },
    { name: "Final", startDate: "2026-11-01", endDate: "2026-11-15", status: "Scheduled" },
  ],
  fees: { collected: 1250000, pending: 320000, totalStudents: 304 },
  aiAnalytics: "Attendance trend: +5% this month. Fee collection rate: 89%. Top performing class: X-A (98% attendance).",
  recentActivities: [
    "✓ Attendance marked for X-A (98% present)",
    "✎ Assignment submitted by 42 students",
    "₹1,25,000 fees collected today",
    "New exam schedule published",
  ],
};

const DemoDashboard = ({ user, trialExpiryDate, onClose, onSignOut }) => {
  const [expiryMessage, setExpiryMessage] = useState("");
  const [showContactSales, setShowContactSales] = useState(false);
  const [contactFormStatus, setContactFormStatus] = useState("idle");

  useEffect(() => {
    if (trialExpiryDate) {
      const expiry = trialExpiryDate.toDate ? trialExpiryDate.toDate() : new Date(trialExpiryDate);
      const now = new Date();
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) {
        setExpiryMessage("Your demo has expired. Please contact sales to continue.");
        setShowContactSales(true);
      } else {
        setExpiryMessage(`Your demo expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`);
      }
    }
  }, [trialExpiryDate]);

  const handleContactSalesSubmit = async (e) => {
    e.preventDefault();
    setContactFormStatus("sending");
    const formData = new FormData(e.target);
    const lead = {
      schoolName: formData.get("schoolName"),
      contactPerson: formData.get("contactPerson"),
      mobile: formData.get("mobile"),
      email: formData.get("email"),
      students: formData.get("students"),
      message: formData.get("message"),
      source: "demo_expired",
      uid: user?.uid,
      timestamp: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "salesLeads"), { ...lead, createdAt: serverTimestamp() });
      const params = new URLSearchParams({
        timestamp: lead.timestamp,
        name: lead.contactPerson,
        school: lead.schoolName,
        phone: lead.mobile,
        email: lead.email,
        students: lead.students,
        message: lead.message,
        source: lead.source,
      });
      await fetch(`${SHEET_URL}?${params.toString()}`, { method: "GET", mode: "no-cors" });
      setContactFormStatus("success");
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error(error);
      setContactFormStatus("error");
    }
  };

  if (showContactSales) {
    if (contactFormStatus === "success") {
      return (
        <div style={{ padding: "32px", textAlign: "center" }}>
          <h3>Thank you!</h3>
          <p>Our team will contact you within 24 hours.</p>
        </div>
      );
    }
    return (
      <div style={{ padding: "32px", maxWidth: "600px", margin: "0 auto" }}>
        <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>Contact Sales</h3>
        <p style={{ marginBottom: "24px" }}>Your trial has ended. Please fill the form below to continue with NexaAttend.</p>
        <form onSubmit={handleContactSalesSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input type="text" name="schoolName" placeholder="School Name" required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} />
          <input type="text" name="contactPerson" placeholder="Contact Person" required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} />
          <input type="tel" name="mobile" placeholder="Mobile Number" required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} />
          <input type="email" name="email" placeholder="Email" required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} />
          <input type="text" name="students" placeholder="Number of Students" required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} />
          <textarea name="message" placeholder="Message" rows="3" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}></textarea>
          <button type="submit" disabled={contactFormStatus === "sending"} style={{ background: "#1C1B17", color: "#F7F5EF", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            {contactFormStatus === "sending" ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: "80vh", overflowY: "auto", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Demo Dashboard</h2>
          <p style={{ color: "#2A6B4A", fontWeight: "bold" }}>{expiryMessage}</p>
          <p style={{ fontSize: "14px", color: "#666" }}>Demo Environment – Sample Data Only</p>
        </div>
        <div>
          <button onClick={onSignOut} style={{ background: "none", border: "1px solid #ddd", padding: "6px 12px", borderRadius: "6px", marginRight: "8px", cursor: "pointer" }}>Sign out</button>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>✕</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", background: "#fff" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>👥 Student Management</h3>
          <ul style={{ listStyle: "none" }}>
            {DemoSampleData.students.map(s => (
              <li key={s.id} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>{s.name} – {s.class} (Roll {s.rollNo})</li>
            ))}
          </ul>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", background: "#fff" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>📊 Attendance Management</h3>
          <p>Today: Present 284, Late 12, Absent 8</p>
          <p>Rate: 96.8%</p>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", background: "#fff" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>📝 Assignment Management</h3>
          {DemoSampleData.assignments.map(a => (
            <div key={a.title} style={{ marginBottom: "8px" }}>{a.title}: {a.submissions}/{a.total} submitted</div>
          ))}
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", background: "#fff" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>📅 Exam Management</h3>
          {DemoSampleData.exams.map(e => (
            <div key={e.name} style={{ marginBottom: "8px" }}>{e.name} – {e.status}</div>
          ))}
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", background: "#fff" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>💰 Fee Management</h3>
          <p>Collected: ₹{DemoSampleData.fees.collected.toLocaleString("en-IN")}</p>
          <p>Pending: ₹{DemoSampleData.fees.pending.toLocaleString("en-IN")}</p>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", background: "#fff" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>🤖 AI Analytics</h3>
          <p>{DemoSampleData.aiAnalytics}</p>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", background: "#fff" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>📈 Reports</h3>
          <button style={{ background: "#2A6B4A", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>Download Attendance Report (PDF)</button>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", background: "#fff" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>🔄 Recent Activities</h3>
          <ul style={{ listStyle: "none" }}>
            {DemoSampleData.recentActivities.map((act, i) => (
              <li key={i} style={{ fontSize: "13px", padding: "4px 0" }}>{act}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ─── Inquiry Form (saves to Firestore + Google Sheet) ─── */
const InquiryForm = () => {
  const [form, setForm] = useState({
    name: "", role: "", school: "", city: "",
    phone: "", email: "", students: "", board: "",
    plan: "Standard (up to 600 students — ₹9,000/mo)",
    hear: "", message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [focusedField, setFocusedField] = useState(null);

  const setField = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };
  const setPlan = (v) => setForm((f) => ({ ...f, plan: v }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())   errs.name    = "Please enter your name.";
    if (!form.role)          errs.role    = "Please select your role.";
    if (!form.school.trim()) errs.school  = "Please enter school name.";
    if (!form.city.trim())   errs.city    = "Please enter city.";
    if (!form.students)      errs.students = "Please select student count.";
    if (!form.phone.trim() || !/^\+?[\d\s\-]{10,15}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Please enter a valid 10-digit number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Please enter a valid email.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");

    const leadData = {
      name: form.name,
      role: form.role,
      school: form.school,
      city: form.city,
      phone: form.phone,
      email: form.email || null,
      students: form.students,
      board: form.board || null,
      plan: form.plan,
      source: form.hear || null,
      message: form.message || null,
      timestamp: new Date().toISOString(),
    };

    const sheetParams = new URLSearchParams({
      timestamp: leadData.timestamp,
      name: leadData.name,
      role: leadData.role,
      school: leadData.school,
      city: leadData.city,
      phone: leadData.phone,
      email: leadData.email || "—",
      students: leadData.students,
      board: leadData.board || "—",
      plan: leadData.plan,
      source: leadData.source || "—",
      message: leadData.message || "—",
    });

    try {
      await addDoc(collection(db, "salesLeads"), { ...leadData, createdAt: serverTimestamp() });
      await fetch(`${SHEET_URL}?${sheetParams.toString()}`, { method: "GET", mode: "no-cors" });
      setStatus("success");
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
    }
  };

  // Styles (same as original)
  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    fontSize: 14,
    fontFamily: "'Instrument Sans', 'DM Sans', sans-serif",
    background: focusedField === field ? "#FFFFFF" : "#FAFAF8",
    color: "#1C1B17",
    border: `1.5px solid ${errors[field] ? "#D9534F" : focusedField === field ? "#2A6B4A" : "rgba(28,27,23,0.15)"}`,
    borderRadius: 8,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    boxSizing: "border-box",
    boxShadow: focusedField === field && !errors[field] ? "0 0 0 3px rgba(42,107,74,0.1)" : errors[field] ? "0 0 0 3px rgba(217,83,79,0.1)" : "none",
  });

  const selectStyle = (field) => ({
    ...inputStyle(field),
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231C1B17' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 36,
    cursor: "pointer",
  });

  const labelStyle = {
    fontSize: 12.5,
    fontWeight: 600,
    color: "rgba(28,27,23,0.6)",
    marginBottom: 6,
    display: "block",
    letterSpacing: "0.02em",
  };

  const errStyle = {
    fontSize: 12,
    color: "#C0392B",
    marginTop: 5,
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const planOptions = [
    { value: "Basic (up to 300 students — ₹6,000/mo)",    label: "Basic",    sub: "Up to 300 students", price: "₹6,000/mo", color: "#1A2B4A" },
    { value: "Standard (up to 600 students — ₹9,000/mo)", label: "Standard", sub: "Up to 600 students", price: "₹9,000/mo", color: "#1B4D3E" },
    { value: "Premium (up to 999 students — ₹12,000/mo)", label: "Premium",  sub: "Up to 999 students", price: "₹12,000/mo", color: "#3D1A4A" },
  ];

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "60px 32px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(42,107,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#2A6B4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 600, color: "#1C1B17", marginBottom: 10 }}>Inquiry received!</h3>
        <p style={{ fontSize: 15, color: "rgba(28,27,23,0.58)", lineHeight: 1.8, maxWidth: 380, margin: "0 auto 28px" }}>
          Thank you, {form.name}! We've received your inquiry for {form.school}. Our team will contact you on {form.phone} within 24 hours.
        </p>
        <a href="https://wa.me/919974724656" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#1C1B17", color: "#F7F5EF", borderRadius: 8, padding: "12px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.858 1.5 9c0 1.32.337 2.56.928 3.638L1.5 16.5l3.987-.9A7.46 7.46 0 009 16.5c4.142 0 7.5-3.358 7.5-7.5S13.142 1.5 9 1.5z" fill="#25D366" stroke="#25D366" strokeWidth="0.5" /><path d="M12.5 10.9c-.2-.1-1.15-.57-1.33-.63-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.22.14-.42.05a5.3 5.3 0 01-2.6-2.28c-.2-.33.2-.31.56-1.04.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.44-.16-.38-.33-.32-.44-.33h-.38c-.13 0-.34.05-.52.25s-.68.67-.68 1.62.7 1.88.79 2.01c.1.13 1.36 2.08 3.3 2.92 1.22.53 1.7.57 2.31.48.37-.06 1.15-.47 1.31-.92.16-.45.16-.84.11-.92-.05-.08-.18-.13-.38-.22z" fill="#fff" /></svg>
          Message us on WhatsApp
        </a>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ textAlign: "center", padding: "48px 32px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1C1B17", marginBottom: 10 }}>Couldn't send right now</h3>
        <p style={{ fontSize: 14, color: "rgba(28,27,23,0.55)", lineHeight: 1.8, marginBottom: 24 }}>No worries — please reach us directly on WhatsApp and we'll get back to you within 24 hours.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://wa.me/919974724656" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2A6B4A", color: "#F7F5EF", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>💬 WhatsApp Us</a>
          <button onClick={() => setStatus("idle")} style={{ background: "none", border: "1.5px solid rgba(28,27,23,0.2)", borderRadius: 8, padding: "11px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#1C1B17", fontFamily: "'Instrument Sans', sans-serif" }}>Try Again</button>
        </div>
      </div>
    );
  }

  const FieldError = ({ field }) => errors[field] ? (
    <span style={errStyle}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#C0392B" strokeWidth="2" /><path d="M12 8v4M12 16h.01" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" /></svg>{errors[field]}</span>
  ) : null;

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid rgba(28,27,23,0.08)", overflow: "hidden", boxShadow: "0 4px 24px rgba(28,27,23,0.06)" }}>
      <div style={{ padding: "28px 32px 24px", borderBottom: "1px solid rgba(28,27,23,0.07)", background: "linear-gradient(135deg, #FAFAF8 0%, #F7F5EF 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "#2A6B4A", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5" /><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <div><div style={{ fontSize: 17, fontWeight: 700, color: "#1C1B17", lineHeight: 1.2, fontFamily: "'Instrument Serif', serif" }}>Book a Free Demo</div><div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2A6B4A", fontWeight: 600, marginTop: 1 }}>NexaAttend · School Inquiry</div></div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(42,107,74,0.08)", border: "1px solid rgba(42,107,74,0.18)", borderRadius: 100, padding: "5px 12px" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2A6B4A", animation: "pdot 2s ease-in-out infinite" }} /><span style={{ fontSize: 10, fontWeight: 600, color: "#1B5C3A", letterSpacing: "0.06em" }}>FREE · NO OBLIGATION</span></div>
        </div>
        <p style={{ fontSize: 13.5, color: "rgba(28,27,23,0.5)", lineHeight: 1.75, marginTop: 14, marginBottom: 0 }}>Fill in your details and we'll contact you within 24 hours to schedule a free demo at your school.</p>
      </div>
      <div style={{ padding: "28px 32px 32px" }}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,27,23,0.3)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ flex: 1, height: 1, background: "rgba(28,27,23,0.08)" }} />About You<span style={{ flex: 1, height: 1, background: "rgba(28,27,23,0.08)" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div><label style={labelStyle} htmlFor="name">Full Name <span style={{ color: "#C0392B" }}>*</span></label><input id="name" type="text" placeholder="e.g. Rajesh Sharma" value={form.name} onChange={setField("name")} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} style={inputStyle("name")} autoComplete="name" /><FieldError field="name" /></div>
              <div><label style={labelStyle} htmlFor="role">Your Role <span style={{ color: "#C0392B" }}>*</span></label><select id="role" value={form.role} onChange={setField("role")} onFocus={() => setFocusedField("role")} onBlur={() => setFocusedField(null)} style={selectStyle("role")}><option value="">Select your role…</option><option value="Principal / Headmaster">Principal / Headmaster</option><option value="School Owner / Trustee">School Owner / Trustee</option><option value="Administrator">Administrator</option><option value="IT Coordinator">IT Coordinator</option><option value="Teacher / HOD">Teacher / HOD</option><option value="Finance Manager">Finance Manager</option><option value="Other">Other</option></select><FieldError field="role" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label style={labelStyle} htmlFor="phone">Mobile Number <span style={{ color: "#C0392B" }}>*</span></label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(28,27,23,0.45)", fontWeight: 500, pointerEvents: "none" }}>+91</span><input id="phone" type="tel" placeholder="99747 24656" value={form.phone} onChange={setField("phone")} onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle("phone"), paddingLeft: 44 }} autoComplete="tel" inputMode="numeric" /></div><FieldError field="phone" /></div>
              <div><label style={labelStyle} htmlFor="email">Email Address <span style={{ fontSize: 11, color: "rgba(28,27,23,0.35)", fontWeight: 400 }}>(optional)</span></label><input id="email" type="email" placeholder="you@school.edu.in" value={form.email} onChange={setField("email")} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} style={inputStyle("email")} autoComplete="email" /><FieldError field="email" /></div>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,27,23,0.3)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ flex: 1, height: 1, background: "rgba(28,27,23,0.08)" }} />About Your School<span style={{ flex: 1, height: 1, background: "rgba(28,27,23,0.08)" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div><label style={labelStyle} htmlFor="school">School / Institute Name <span style={{ color: "#C0392B" }}>*</span></label><input id="school" type="text" placeholder="e.g. Sunrise International School" value={form.school} onChange={setField("school")} onFocus={() => setFocusedField("school")} onBlur={() => setFocusedField(null)} style={inputStyle("school")} /><FieldError field="school" /></div>
              <div><label style={labelStyle} htmlFor="city">City / District <span style={{ color: "#C0392B" }}>*</span></label><input id="city" type="text" placeholder="e.g. Ahmedabad" value={form.city} onChange={setField("city")} onFocus={() => setFocusedField("city")} onBlur={() => setFocusedField(null)} style={inputStyle("city")} /><FieldError field="city" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label style={labelStyle} htmlFor="students">Total Students <span style={{ color: "#C0392B" }}>*</span></label><select id="students" value={form.students} onChange={setField("students")} onFocus={() => setFocusedField("students")} onBlur={() => setFocusedField(null)} style={selectStyle("students")}><option value="">Select approximate count…</option><option value="Under 100">Under 100</option><option value="100–200">100 – 200</option><option value="200–300">200 – 300</option><option value="300–500">300 – 500</option><option value="500–600">500 – 600</option><option value="600–800">600 – 800</option><option value="800–999">800 – 999</option><option value="1000+">1000 or more</option></select><FieldError field="students" /></div>
              <div><label style={labelStyle} htmlFor="board">School Board <span style={{ fontSize: 11, color: "rgba(28,27,23,0.35)", fontWeight: 400 }}>(optional)</span></label><select id="board" value={form.board} onChange={setField("board")} onFocus={() => setFocusedField("board")} onBlur={() => setFocusedField(null)} style={selectStyle("board")}><option value="">Select board…</option><option value="CBSE">CBSE</option><option value="GSEB (Gujarat Board)">GSEB (Gujarat Board)</option><option value="ICSE / ISC">ICSE / ISC</option><option value="IB (International Baccalaureate)">IB (International Baccalaureate)</option><option value="Cambridge (IGCSE)">Cambridge (IGCSE)</option><option value="State Board (Other)">State Board (Other)</option><option value="Private / Autonomous">Private / Autonomous</option><option value="Other">Other</option></select></div>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,27,23,0.3)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ flex: 1, height: 1, background: "rgba(28,27,23,0.08)" }} />Interested In<span style={{ flex: 1, height: 1, background: "rgba(28,27,23,0.08)" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {planOptions.map((opt) => {
                const isSelected = form.plan === opt.value;
                return (<button key={opt.value} type="button" onClick={() => setPlan(opt.value)} style={{ padding: "12px 10px", borderRadius: 10, border: `2px solid ${isSelected ? opt.color : "rgba(28,27,23,0.12)"}`, background: isSelected ? `${opt.color}10` : "#FAFAF8", cursor: "pointer", textAlign: "left", transition: "all 0.18s", position: "relative", fontFamily: "'Instrument Sans', sans-serif" }}>
                  {isSelected && <div style={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%", background: opt.color, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
                  <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? opt.color : "#1C1B17", marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(28,27,23,0.45)", marginBottom: 4 }}>{opt.sub}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? opt.color : "rgba(28,27,23,0.6)" }}>{opt.price}</div>
                </button>);
              })}
            </div>
            <p style={{ fontSize: 12, color: "rgba(28,27,23,0.4)", marginTop: 8, lineHeight: 1.6 }}>Every plan includes a <strong style={{ color: "rgba(28,27,23,0.6)" }}>free 7-day trial</strong> before any payment. Setup fee: <strong style={{ color: "#2A6B4A" }}>₹45,000</strong> (founding price — normally ₹75,000).</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,27,23,0.3)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ flex: 1, height: 1, background: "rgba(28,27,23,0.08)" }} />A Little More<span style={{ flex: 1, height: 1, background: "rgba(28,27,23,0.08)" }} /></div>
            <div style={{ marginBottom: 14 }}><label style={labelStyle} htmlFor="hear">How did you hear about NexaAttend? <span style={{ fontSize: 11, color: "rgba(28,27,23,0.35)", fontWeight: 400 }}>(optional)</span></label><select id="hear" value={form.hear} onChange={setField("hear")} onFocus={() => setFocusedField("hear")} onBlur={() => setFocusedField(null)} style={selectStyle("hear")}><option value="">Select source…</option><option value="Google Search">Google Search</option><option value="WhatsApp / Word of Mouth">WhatsApp / Word of Mouth</option><option value="LinkedIn">LinkedIn</option><option value="Instagram / Facebook">Instagram / Facebook</option><option value="Another School Recommended Us">Another School Recommended</option><option value="Newspaper / Advertisement">Newspaper / Advertisement</option><option value="Education Conference / Event">Education Conference / Event</option><option value="Other">Other</option></select></div>
            <div><label style={labelStyle} htmlFor="message">Anything you'd like us to know? <span style={{ fontSize: 11, color: "rgba(28,27,23,0.35)", fontWeight: 400 }}>(optional)</span></label><textarea id="message" placeholder="Tell us about your current attendance system, any specific pain points, or questions you have…" value={form.message} onChange={setField("message")} onFocus={() => setFocusedField("message")} onBlur={() => setFocusedField(null)} rows={3} style={{ ...inputStyle("message"), resize: "vertical", minHeight: 80, lineHeight: 1.65 }} /></div>
          </div>
          <button type="submit" disabled={status === "sending"} style={{ width: "100%", padding: "14px 24px", background: status === "sending" ? "rgba(28,27,23,0.5)" : "#1C1B17", color: "#F7F5EF", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: "'Instrument Sans', sans-serif", cursor: status === "sending" ? "not-allowed" : "pointer", transition: "all 0.22s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, letterSpacing: "0.01em" }} onMouseEnter={e => { if (status !== "sending") e.currentTarget.style.background = "#2A6B4A"; }} onMouseLeave={e => { if (status !== "sending") e.currentTarget.style.background = "#1C1B17"; }}>
            {status === "sending" ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(247,245,239,0.3)" strokeWidth="2.5" /><path d="M12 2a10 10 0 0110 10" stroke="#F7F5EF" strokeWidth="2.5" strokeLinecap="round" /></svg>Sending your inquiry…</>) : (<>Book My Free Demo<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></>)}
          </button>
          <p style={{ fontSize: 12, color: "rgba(28,27,23,0.38)", textAlign: "center", marginTop: 14, lineHeight: 1.7 }}>🔒 Your information is never shared with third parties. We'll only use it to schedule your demo and follow up.</p>
        </form>
      </div>
    </div>
  );
};

/* ─── Privacy Policy Page ─── */
const PrivacyPolicy = ({ onBack }) => {
  useEffect(() => { document.title = "Privacy Policy | Nova Teach"; }, []);
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 6% 80px", background: "#F7F5EF", minHeight: "100vh" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#2A6B4A", cursor: "pointer", marginBottom: "24px", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>← Back to Home</button>
      <h1 className="serif" style={{ fontSize: "2.8rem", marginBottom: "24px", color: "#1C1B17" }}>Privacy Policy</h1>
      <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 24px rgba(28,27,23,0.06)" }}>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>Last updated: June 1, 2026</p>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>Nova Teach Solution ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>Information We Collect</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>We collect information you provide directly to us, such as your name, email, phone number, school name, and any other information you choose to provide when filling out our inquiry form or using our demo.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>How We Use Your Information</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>We use the information to contact you about our services, schedule demos, improve our platform, and comply with legal obligations. We do not sell your personal data to third parties.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>Data Security</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>Your data never leaves your school premises when using our offline ERP. For inquiries and demo data, we use industry-standard encryption and security practices.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>Cookies</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>We use essential cookies to operate the site. You can disable cookies in your browser, but some features may not work correctly.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>Contact Us</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>If you have questions about this Privacy Policy, contact us at: <a href="tel:+919974724656" style={{ color: "#2A6B4A" }}>+91 99747 24656</a> or <a href="https://wa.me/919974724656" style={{ color: "#2A6B4A" }}>WhatsApp</a>.</p>
      </div>
    </div>
  );
};

/* ─── Terms of Service Page ─── */
const TermsOfService = ({ onBack }) => {
  useEffect(() => { document.title = "Terms of Service | Nova Teach"; }, []);
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 6% 80px", background: "#F7F5EF", minHeight: "100vh" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#2A6B4A", cursor: "pointer", marginBottom: "24px", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>← Back to Home</button>
      <h1 className="serif" style={{ fontSize: "2.8rem", marginBottom: "24px", color: "#1C1B17" }}>Terms of Service</h1>
      <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 24px rgba(28,27,23,0.06)" }}>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>Last updated: June 1, 2026</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>By accessing or using NexaAttend (the "Service"), you agree to be bound by these Terms of Service. If you disagree, please do not use the Service.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>2. Demo Trial</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>We offer a 7-day free trial of the ERP system. After the trial, you must purchase a subscription to continue using the Service. Trial data is for demonstration purposes only.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>3. Payments and Refunds</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>All prices are in Indian Rupees (₹). We offer a 7-day money-back guarantee. Refund requests must be made within 7 days of the first payment.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>4. Data Ownership</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>You retain full ownership of all student, staff, and school data entered into the system. We do not access or use your data except to provide the Service.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>5. Offline Use</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>NexaAttend works fully offline. You are responsible for maintaining your own backups. We are not liable for data loss due to hardware failure.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>6. Limitation of Liability</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>To the maximum extent permitted by law, Nova Teach Solution shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>7. Changes to Terms</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
        <h2 style={{ fontSize: "1.5rem", margin: "24px 0 12px", fontWeight: 600 }}>8. Contact</h2>
        <p style={{ marginBottom: "20px", lineHeight: "1.7" }}>For any questions about these Terms, contact us at <a href="tel:+919974724656" style={{ color: "#2A6B4A" }}>+91 99747 24656</a>.</p>
      </div>
    </div>
  );
};

/* ─── Main App Component with Routing ─── */
export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };
  const goBack = () => navigateTo("/");

  if (currentPath === "/privacy-policy") return <PrivacyPolicy onBack={goBack} />;
  if (currentPath === "/terms") return <TermsOfService onBack={goBack} />;

  // --- Main website state and logic ---
  const [navScrolled, setNavScrolled] = useState(false);
  const [logIndex, setLogIndex] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [user, setUser] = useState(null);
  const [trialExpiry, setTrialExpiry] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const trialExpiryDate = new Date();
          trialExpiryDate.setDate(trialExpiryDate.getDate() + 7);
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            firstLoginDate: new Date().toISOString(),
            trialExpiryDate: trialExpiryDate.toISOString(),
            lastLogin: new Date().toISOString(),
          });
          setTrialExpiry(trialExpiryDate);
        } else {
          setTrialExpiry(new Date(userSnap.data().trialExpiryDate));
        }
        setShowDemoModal(true);
      } else {
        setUser(null);
        setTrialExpiry(null);
        setShowDemoModal(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      alert("Sign in failed. Please try again.");
    }
  };
  const handleSignOut = async () => {
    await signOut(auth);
    setShowDemoModal(false);
  };

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setLogIndex(i => (i >= logs.length ? 1 : i + 1)), 1800);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    document.title = "School ERP Software in India | Attendance, Exams, Fees & AI Analytics | Nova Teach";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Nova Teach helps schools manage attendance, exams, assignments, fees, communication and AI-powered analytics from one platform. Book a free demo today.");
    else { const newMeta = document.createElement("meta"); newMeta.name = "description"; newMeta.content = "Nova Teach helps schools manage attendance, exams, assignments, fees, communication and AI-powered analytics from one platform. Book a free demo today."; document.head.appendChild(newMeta); }
    // (additional meta tags omitted for brevity but same as original)
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };
  const plan = PLANS.find(p => p.id === selectedPlan);

  const faqs = [
    { q: "What is School ERP Software?", a: "School ERP (Enterprise Resource Planning) software integrates all school operations – attendance, exams, fees, assignments, communication, and analytics – into one system. NexaAttend is a complete ERP built for Indian schools, working offline-first with AI face recognition." },
    { q: "How does attendance management work?", a: "Our AI face recognition system marks attendance in under 60 seconds for 30 students. It works 100% offline, eliminates proxy attendance, and automatically syncs data to parent WhatsApp and reports." },
    { q: "How can schools automate exams?", a: "NexaAttend Exam Management allows you to schedule exams, generate hall tickets, record marks, produce result sheets, and analyze performance trends – all from one dashboard." },
    { q: "How does fee management work?", a: "Track collections, dues, and payment history in real time. Send automated reminders to parents via WhatsApp/Email. Reduce fee leakage by up to 95%." },
    { q: "Why choose Nova Teach?", a: "We are an Ahmedabad-based team that builds offline-first, privacy-focused school ERP. Your data never leaves your premises. We offer a 7-day money-back guarantee, direct WhatsApp support from the founder, and flat pricing – no per-student fees." },
    { q: "Does it work without internet?", a: "Yes – NexaAttend is designed offline-first. All recognition, data storage, and reports happen on your own computer. Internet is optional and only used for cloud backups if you choose that add-on." },
    { q: "How long does setup take?", a: "Our team completes the full installation, camera setup, and staff training in 3 days. You don't need an IT department — we handle everything." },
    { q: "What cameras does it require?", a: "Every plan includes 2 cameras. Any standard webcam or IP camera works. If you need more entry points, extra cameras are available as an add-on at ₹15,000 per camera (one-time setup)." },
    { q: "How accurate is the face recognition?", a: "99%+ accuracy under normal lighting conditions. The system handles glasses, hair changes, and varying lighting. We test it rigorously before handover." },
    { q: "What happens to our student data?", a: "Your data never leaves your premises. It is stored on your own computer or local server — not on any cloud. You have complete ownership and control." },
    { q: "What is the 7-day guarantee?", a: "Use NexaAttend for 7 days. If it doesn't measurably save time, reduce attendance errors, and simplify daily operations — we refund you in full. No conditions, no paperwork." },
    { q: "What does the setup fee cover?", a: "The one-time setup fee covers on-site installation, camera configuration, face data enrollment for all students and staff, admin training, and 3-day handover support. After that, you only pay the monthly fee." },
  ];

  // JSX for the main site – includes all sections (hero, ticker, video, problem, solution, pricing, how it works, trust, features, testimonials, FAQ, inquiry, footer)
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
        .pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase;
          padding: 5px 13px; border-radius: 100px; margin-bottom: 20px;
        }
        .pill-green { color: #1B5C3A; background: rgba(42,107,74,0.1); }
        .pill-dark  { color: rgba(247,245,239,0.5); background: rgba(247,245,239,0.08); }
        .pill-hero {
          color: rgba(247,245,239,0.9);
          background: rgba(247,245,239,0.12);
          border: 1px solid rgba(247,245,239,0.18);
          backdrop-filter: blur(8px);
        }
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
        .btn-hero-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: #F7F5EF; color: #1C1B17;
          border: none; border-radius: 8px; padding: 14px 26px;
          font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); text-decoration: none;
          box-shadow: 0 2px 24px rgba(28,27,23,0.18), 0 1px 4px rgba(28,27,23,0.12);
        }
        .btn-hero-primary:hover {
          background: #fff; transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(28,27,23,0.22), 0 2px 8px rgba(28,27,23,0.1);
        }
        .btn-hero-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(247,245,239,0.1); color: rgba(247,245,239,0.9);
          border: 1.5px solid rgba(247,245,239,0.28); border-radius: 8px; padding: 13px 24px;
          font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.25s; text-decoration: none;
          backdrop-filter: blur(12px);
        }
        .btn-hero-secondary:hover {
          background: rgba(247,245,239,0.18); border-color: rgba(247,245,239,0.5);
          transform: translateY(-1px);
        }
        .card {
          background: #FFFFFF; border: 1px solid rgba(28,27,23,0.07);
          border-radius: 12px; padding: 24px;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .card:hover { box-shadow: 0 6px 32px rgba(28,27,23,0.07); transform: translateY(-2px); }
        .nav-link {
          font-size: 13px; font-weight: 500; color: rgba(28,27,23,0.55);
          cursor: pointer; border: none; background: none;
          font-family: 'Instrument Sans', sans-serif; transition: color 0.2s; padding: 0;
        }
        .nav-link:hover { color: #1C1B17; }
        .status-present { color: #22c55e; font-weight: 700; }
        .status-late    { color: #f59e0b; font-weight: 700; }
        .status-absent  { color: #ef4444; font-weight: 700; }
        @keyframes floatCard {
          0%   { transform: translateY(0px) rotate(0.2deg); }
          33%  { transform: translateY(-10px) rotate(-0.15deg); }
          66%  { transform: translateY(-5px) rotate(0.1deg); }
          100% { transform: translateY(0px) rotate(0.2deg); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroPillIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hero-pill-anim  { opacity: 0; animation: heroPillIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; }
        .hero-h1-anim    { opacity: 0; animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.22s forwards; }
        .hero-sub-anim   { opacity: 0; animation: heroFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.38s forwards; }
        .hero-cta-anim   { opacity: 0; animation: heroFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.52s forwards; }
        .hero-badges-anim{ opacity: 0; animation: heroFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.66s forwards; }
        .hero-card-anim  { opacity: 0; animation: heroFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.48s forwards; }
        .glass-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 18px;
          box-shadow: 0 32px 80px rgba(10,9,8,0.28), 0 8px 24px rgba(10,9,8,0.14), 0 1px 0 rgba(255,255,255,0.9) inset;
          overflow: hidden;
          animation: floatCard 7s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes fsi    { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes pdot   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .pdot        { animation: pdot 2s ease-in-out infinite; }
        .log-row     { animation: fsi 0.4s ease forwards; }
        .ticker-inner{ display: flex; gap: 52px; animation: ticker 26s linear infinite; width: max-content; }
        @keyframes heroGradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg,#0f1f18 0%,#152b20 20%,#0e1e17 40%,#122518 60%,#0b1a13 80%,#0f1f18 100%);
          background-size: 300% 300%;
          animation: heroGradientShift 14s ease infinite;
          z-index: 0;
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: linear-gradient(rgba(90,200,122,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(90,200,122,0.04) 1px,transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%);
        }
        .hero-glow {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background:
            radial-gradient(ellipse 55% 45% at 28% 55%,rgba(42,107,74,0.22) 0%,transparent 65%),
            radial-gradient(ellipse 35% 35% at 75% 30%,rgba(90,200,122,0.09) 0%,transparent 60%),
            radial-gradient(ellipse 40% 30% at 15% 85%,rgba(27,77,62,0.15) 0%,transparent 55%);
        }
        .hero-content { position: relative; z-index: 3; }
        .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .g4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
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
        .faq-item { border-bottom: 1px solid rgba(28,27,23,0.08); }
        .faq-q {
          width: 100%; text-align: left; padding: 20px 0; background: none; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 16px;
          font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 500; color: #1C1B17;
        }
        .faq-a { padding: 0 0 20px; font-size: 14px; line-height: 1.85; color: rgba(28,27,23,0.6); }
        .plan-btn {
          padding: 10px 28px; border-radius: 100px;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.22s;
          font-family: 'Instrument Sans', sans-serif;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .plan-btn-active   { background: #2A6B4A; color: #F7F5EF; border: 2px solid #2A6B4A; }
        .plan-btn-inactive { background: #FFFFFF; color: rgba(28,27,23,0.6); border: 1.5px solid rgba(28,27,23,0.14); }
        .plan-btn-inactive:hover { border-color: rgba(28,27,23,0.3); color: #1C1B17; }
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
          .hero-pad { padding: 110px 5% 64px !important; min-height: auto !important; }
          .hide-mob { display: none !important; }
          .flex-cta { flex-direction: column !important; }
          .flex-cta a, .flex-cta button { width: 100% !important; justify-content: center !important; }
          .hbg { display: flex !important; }
          .mob-show { display: block !important; }
          .inquiry-grid { grid-template-columns: 1fr !important; }
          .form-row-2 { grid-template-columns: 1fr !important; }
          .plan-picker { grid-template-columns: 1fr !important; }
          .form-inner { padding: 20px 18px 24px !important; }
          .form-header { padding: 20px 18px 16px !important; }
        }
        @media (min-width: 641px) {
          .hbg { display: none !important; }
          .mob-show { display: none !important; }
        }
      `}</style>

      {/* Mobile Menu */}
      <div className={`mmenu ${menuOpen ? "open" : ""}`}>
        {[["problem","Why NexaAttend"], ["demo-video","Watch Demo"], ["solution","Platform"], ["pricing","Pricing"], ["process","How It Works"], ["trust","Trust & Guarantee"], ["inquiry","Book Demo"]].map(([id, label]) => (
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

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: navScrolled ? "11px 6%" : "18px 6%",
        background: navScrolled || menuOpen ? "rgba(247,245,239,0.95)" : "transparent",
        backdropFilter: navScrolled || menuOpen ? "blur(24px)" : "none",
        borderBottom: navScrolled || menuOpen ? "1px solid rgba(28,27,23,0.07)" : "none",
        transition: "all 0.38s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("hero")}>
          <div style={{ width: 32, height: 32, background: "#2A6B4A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5" />
              <path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 5l2-2M13.5 9l2.5.5" stroke="#F7F5EF" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
            </svg>
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, lineHeight: 1.1, letterSpacing: "-0.01em", color: navScrolled ? "#1C1B17" : "#F7F5EF" }}>NexaAttend</div>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: navScrolled ? "#2A6B4A" : "rgba(247,245,239,0.6)", fontWeight: 600 }}>Complete School ERP</div>
          </div>
        </div>
        <div className="hide-mob" style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[["problem","Why NexaAttend"], ["demo-video","Watch Demo"], ["pricing","Pricing"], ["process","How It Works"], ["trust","Guarantee"]].map(([id, label]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}
              style={{ color: navScrolled ? "rgba(28,27,23,0.55)" : "rgba(247,245,239,0.7)" }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="tel:+919974724656" className="btn-secondary hide-mob"
            style={{
              padding: "8px 14px", fontSize: 13,
              background: navScrolled ? "transparent" : "rgba(247,245,239,0.1)",
              color: navScrolled ? "#1C1B17" : "rgba(247,245,239,0.85)",
              border: navScrolled ? "1.5px solid rgba(28,27,23,0.2)" : "1.5px solid rgba(247,245,239,0.24)",
              backdropFilter: navScrolled ? "none" : "blur(8px)"
            }}>+91 99747 24656</a>
          <button className="btn-primary" onClick={() => scrollTo("inquiry")}
            style={{
              padding: "9px 17px", fontSize: 13,
              background: navScrolled ? "#1C1B17" : "#F7F5EF",
              color: navScrolled ? "#F7F5EF" : "#1C1B17"
            }}>Book Free Demo</button>
          <button className="hbg" onClick={() => setMenuOpen(o => !o)} style={{
            background: navScrolled ? "none" : "rgba(247,245,239,0.1)",
            border: navScrolled ? "1.5px solid rgba(28,27,23,0.18)" : "1.5px solid rgba(247,245,239,0.24)",
            cursor: "pointer", padding: "7px 9px", borderRadius: 6,
            alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)"
          }}>
            {menuOpen
              ? <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke={navScrolled ? "#1C1B17" : "#F7F5EF"} strokeWidth="1.8" strokeLinecap="round" /></svg>
              : <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 4.5h14M2 9h14M2 13.5h14" stroke={navScrolled ? "#1C1B17" : "#F7F5EF"} strokeWidth="1.8" strokeLinecap="round" /></svg>
            }
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="hero" className="hero-pad" style={{ minHeight: "100vh", padding: "130px 6% 80px", position: "relative", overflow: "hidden" }}>
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="g2" style={{ maxWidth: 1200, margin: "0 auto", gap: 64, alignItems: "center" }}>
            <div>
              <div className="hero-pill-anim">
                <div className="pill pill-hero" style={{ marginBottom: 22 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5AC87A", flexShrink: 0 }} className="pdot" />
                  Complete School ERP · AI-Powered
                </div>
              </div>
              <h1 className="serif hero-h hero-h1-anim" style={{ fontSize: "clamp(2.6rem, 4.8vw, 4rem)", lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: 22, color: "#F7F5EF", textShadow: "0 2px 32px rgba(10,9,8,0.35)" }}>
                Your Entire School,<br />Managed From<br /><em style={{ color: "#5AC87A", fontStyle: "italic" }}>One System.</em>
              </h1>
              <p className="hero-sub-anim" style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(247,245,239,0.72)", maxWidth: 460, marginBottom: 30, textShadow: "0 1px 8px rgba(10,9,8,0.3)" }}>
                NexaAttend is a complete School ERP — attendance, staff, payroll, reports, and parent communication — powered by AI face recognition that works 100% offline.
              </p>
              <div className="flex-cta hero-cta-anim" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
                <button className="btn-hero-primary" onClick={() => scrollTo("inquiry")} style={{ fontSize: 15, padding: "14px 26px" }}>
                  Get Free Trial
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button className="btn-hero-secondary" onClick={() => scrollTo("solution")} style={{ fontSize: 15, padding: "13px 22px" }}>
                  See the Platform
                </button>
                <button className="btn-hero-primary" onClick={handleGoogleSignIn} style={{ background: "#5AC87A", color: "#1C1B17" }}>
                  🚀 Experience Demo
                </button>
              </div>
              <div className="hero-badges-anim" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[["🔒","100% offline"], ["⚡","3-day setup"], ["🛡️","7-day guarantee"], ["🏫","Made for India"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 500, color: "rgba(247,245,239,0.62)", background: "rgba(247,245,239,0.08)", border: "1px solid rgba(247,245,239,0.14)", backdropFilter: "blur(8px)", borderRadius: 100, padding: "5px 12px" }}>
                    <span style={{ fontSize: 13 }}>{icon}</span>{text}
                  </div>
                ))}
              </div>
            </div>
            <div className="hide-mob hero-card-anim">
              <div className="glass-card">
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", borderBottom: "1px solid rgba(28,27,23,0.07)", background: "rgba(250,250,248,0.85)" }}>
                  {[["#F05A5A"], ["#F0B45A"], ["#5AF07A"]].map(([c], i) => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
                  ))}
                  <span className="mono" style={{ fontSize: 10, color: "rgba(28,27,23,0.32)", marginLeft: 8 }}>nexaattend — live dashboard</span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3DC87A" }} className="pdot" />
                    <span className="mono" style={{ fontSize: 9, color: "#1B7A45", fontWeight: 600, letterSpacing: "0.08em" }}>LIVE</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(250,250,248,0.7)", borderBottom: "1px solid rgba(28,27,23,0.06)" }}>
                  {[{ l: "Present", v: "284", c: "#1B7A45" }, { l: "Late", v: "12", c: "#9A6B0A" }, { l: "Absent", v: "8", c: "#8A2A1A" }].map(s => (
                    <div key={s.l} style={{ padding: "14px 10px", textAlign: "center", borderRight: "1px solid rgba(28,27,23,0.06)" }}>
                      <div className="serif" style={{ fontSize: 28, color: s.c, lineHeight: 1 }}>{s.v}</div>
                      <div className="mono" style={{ fontSize: 9, color: "rgba(28,27,23,0.38)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "12px 14px 14px", background: "rgba(255,255,255,0.6)" }}>
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
                <div style={{ padding: "10px 14px", background: "rgba(42,107,74,0.08)", borderTop: "1px solid rgba(28,27,23,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(28,27,23,0.45)" }}>Today's attendance rate</span>
                  <span className="serif" style={{ fontSize: 18, color: "#1B7A45", fontWeight: 700 }}>96.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, zIndex: 3, background: "linear-gradient(to bottom, transparent, #1C1B17)", pointerEvents: "none" }} />
      </main>

      {/* Ticker */}
      <div style={{ background: "#1C1B17", padding: "13px 0", overflow: "hidden" }}>
        <div style={{ overflow: "hidden" }}>
          <div className="ticker-inner">
            {[...Array(2)].flatMap(() => ["◆ Works 100% Offline", "◆ AI Face Recognition", "◆ 3-Day Setup", "◆ Student + Staff + Payroll", "◆ 7-Day Money-Back Guarantee", "◆ No ID Cards Needed", "◆ Built for Indian Schools", "◆ Data Never Leaves Your Premises", "◆ Free Lifetime Updates", "◆ Ahmedabad-Based Team"])
              .map((item, i) => (
                <span key={i} className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(247,245,239,0.55)", whiteSpace: "nowrap", textTransform: "uppercase" }}>{item}</span>
              ))}
          </div>
        </div>
      </div>

      {/* Demo Video */}
      <section id="demo-video" style={{ background: "#1C1B17", padding: "80px 6% 88px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(42,107,74,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="pill pill-dark" style={{ justifyContent: "center" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5AC87A" }} className="pdot" />
              Live Product Demo
            </div>
            <h2 className="serif" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, letterSpacing: "-0.022em", color: "#F7F5EF", marginBottom: 14 }}>
              See NexaAttend<br /><em style={{ color: "#5AC87A", fontStyle: "italic" }}>in action.</em>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(247,245,239,0.5)", maxWidth: 480, margin: "0 auto", lineHeight: 1.85 }}>
              A real walkthrough of the portal — login, dashboard, attendance marking, and reports.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}><DemoVideoPlayer /></FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 36 }}>
              {[{ icon: "🎯", label: "Portal Login", desc: "Secure role-based access" }, { icon: "📊", label: "Live Dashboard", desc: "Real-time attendance data" }, { icon: "🤳", label: "Face Recognition", desc: "AI marks students in seconds" }, { icon: "📋", label: "Instant Reports", desc: "One-click PDF exports" }].map((f, i) => (
                <div key={i} style={{ background: "rgba(247,245,239,0.04)", border: "1px solid rgba(247,245,239,0.08)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F5EF", marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(247,245,239,0.38)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="sec" style={{ background: "#F7F5EF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div className="pill pill-green">The Problem</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 700, marginBottom: 12 }}>
              Manual systems are costing your school more than you realise.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(28,27,23,0.5)", maxWidth: 580, marginBottom: 48, lineHeight: 1.85 }}>
              Most Indian schools treat these as normal, unavoidable problems. They aren't.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { n: "01", h: "2–3 hours lost every day", b: "Teachers spend 15–20 minutes per class calling out names. Multiply that across every class, every day — that's teaching time permanently gone.", accent: "#8A2A1A" },
              { n: "02", h: "Proxy attendance goes undetected", b: "Students mark absent friends 'present'. Registers can't verify faces. Face recognition stops this completely — the first day it's installed.", accent: "#9A6B0A" },
              { n: "03", h: "Five disconnected systems", b: "Attendance register, WhatsApp groups, Excel payroll, manual fee tracking, printed reports. The data never lines up.", accent: "#1B5C3A" },
              { n: "04", h: "₹3+ Lakh lost annually due to fee leakage", b: "Late payments, reconciliation errors, and uncollected fees go unnoticed for months. Schools lose an average of ₹3–5 lakh every year.", accent: "#B85C1A" },
              { n: "05", h: "Lost child during transportation – no accountability", b: "No real-time tracking, no handover verification. Every year, children are dropped at wrong stops or left in vehicles.", accent: "#A93226" }
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
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="sec" style={{ background: "#1C1B17", color: "#F7F5EF", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(42,107,74,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <FadeIn>
            <div className="pill pill-dark">The Platform</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.4rem)", lineHeight: 1.06, letterSpacing: "-0.022em", marginBottom: 20, color: "#F7F5EF" }}>
              One System That Runs<br /><em style={{ color: "#5AC87A", fontStyle: "italic" }}>Your Entire Institute.</em>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(247,245,239,0.55)", maxWidth: 540, marginBottom: 52, lineHeight: 1.85 }}>
              Attendance is just one piece. NexaAttend is a complete ERP — students, staff, payroll, and operations, all in one system.
            </p>
          </FadeIn>
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
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="sec" style={{ background: "#F7F5EF", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="pill pill-green" style={{ justifyContent: "center" }}>Transparent Pricing · No Hidden Fees</div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", lineHeight: 1.08, letterSpacing: "-0.022em", marginBottom: 12 }}>Simple, Flat Pricing</h2>
            <p style={{ fontSize: 16, color: "rgba(28,27,23,0.58)", maxWidth: 480, margin: "0 auto", lineHeight: 1.85 }}>
              One price per school size. No per-student fees. No surprises.
            </p>
          </FadeIn>
          <FadeIn>
            <div style={{ background: "linear-gradient(135deg,#FFF8E8 0%,#FFFBF0 100%)", border: "1.5px solid #D4A433", borderRadius: 12, padding: "14px 20px", marginBottom: 36, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <div>
                <strong style={{ fontSize: 14, color: "#7A5000" }}>Founding Member Offer: One-time setup ₹75,000 → ₹45,000 on all plans.</strong>
                <span style={{ fontSize: 13.5, color: "#9A6B0A" }}> Limited slots. Once filled, returns to ₹75,000 permanently.</span>
              </div>
            </div>
          </FadeIn>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 44, flexWrap: "wrap" }}>
              {PLANS.map((p) => (
                <button key={p.id} onClick={() => setSelectedPlan(p.id)} className={`plan-btn ${selectedPlan === p.id ? "plan-btn-active" : "plan-btn-inactive"}`}>
                  {p.name}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: selectedPlan === p.id ? "rgba(247,245,239,0.18)" : "rgba(42,107,74,0.1)", color: selectedPlan === p.id ? "#F7F5EF" : "#1B5C3A", padding: "2px 8px", borderRadius: 100 }}>BEST VALUE</span>
                </button>
              ))}
            </div>
          </FadeIn>
          <FadeIn>
            <div style={{ background: "#FFFFFF", border: `2px solid ${plan.color}22`, borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(28,27,23,0.07)", marginBottom: 24, transition: "all 0.35s" }}>
              <div style={{ background: plan.color, padding: "28px 36px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(247,245,239,0.45)", marginBottom: 6 }}>{plan.name} Plan · Up to {plan.students} students</div>
                  <div className="serif" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", color: "#F7F5EF", lineHeight: 1.2, maxWidth: 560 }}>{plan.desc}</div>
                </div>
                <div style={{ background: "#5AC87A", color: "#1C1B17", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 18px", borderRadius: 100, flexShrink: 0 }}>{plan.badge}</div>
              </div>
              <div style={{ padding: "32px 36px", borderBottom: "1px solid rgba(28,27,23,0.07)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 32 }}>
                  <div style={{ background: "rgba(28,27,23,0.02)", borderRadius: 12, padding: "20px 22px", border: "1px solid rgba(28,27,23,0.05)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,27,23,0.38)", marginBottom: 8 }}>Monthly Fee</div>
                    <div className="serif" style={{ fontSize: 40, color: "#1C1B17", lineHeight: 1, marginBottom: 4 }}>{fmt(plan.monthly)}</div>
                    <div style={{ fontSize: 12, color: "#1B7A45", fontWeight: 600, marginTop: 10 }}>≈ {fmtFull(Math.round(plan.monthly / plan.students))}/student</div>
                  </div>
                  <div style={{ background: "rgba(42,107,74,0.04)", borderRadius: 12, padding: "20px 22px", border: "1px solid rgba(42,107,74,0.15)", position: "relative" }}>
                    <div style={{ position: "absolute", top: -10, right: 16, background: "#2A6B4A", color: "#F7F5EF", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>SAVE ₹30,000</div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,27,23,0.38)", marginBottom: 8 }}>One-Time Setup</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <div className="serif" style={{ fontSize: 40, color: "#2A6B4A", lineHeight: 1 }}>{fmt(plan.setupDiscounted)}</div>
                      <div className="serif" style={{ fontSize: 18, color: "rgba(28,27,23,0.3)", textDecoration: "line-through" }}>{fmt(plan.setup)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#1B7A45", fontWeight: 600, marginTop: 10 }}>Founding member price</div>
                  </div>
                  <div style={{ background: "rgba(28,27,23,0.02)", borderRadius: 12, padding: "20px 22px", border: "1px solid rgba(28,27,23,0.05)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,27,23,0.38)", marginBottom: 14 }}>Always Included</div>
                    {[["👤", `Up to ${plan.students} students`], ["📷", "2 cameras"], ["🛠️", "3-day setup"], ["🛡️", "7-day guarantee"]].map(([icon, text]) => (
                      <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "rgba(28,27,23,0.65)" }}>
                        <span style={{ fontSize: 14 }}>{icon}</span>{text}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px 24px" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: "rgba(28,27,23,0.7)" }}>
                      <span style={{ color: "#2A6B4A", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "22px 36px", background: "rgba(28,27,23,0.015)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                <div style={{ fontSize: 13.5, color: "rgba(28,27,23,0.5)", lineHeight: 1.7 }}>7-day money-back guarantee · No lock-in · Free 7-day trial first</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href="https://wa.me/919974724656"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1C1B17", color: "#F7F5EF", border: "none", borderRadius: 8, padding: "12px 22px", fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#2A6B4A"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1C1B17"}>
                    💬 WhatsApp for {plan.name}
                  </a>
                  <button onClick={() => scrollTo("inquiry")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#1C1B17", border: "1.5px solid rgba(28,27,23,0.2)", borderRadius: 8, padding: "11px 20px", fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    Book Free Demo →
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn>
            <div style={{ background: "#FFFFFF", border: "2px solid rgba(42,107,74,0.18)", borderRadius: 16, padding: "28px 32px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginTop: 32 }}>
              <span style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>🛡️</span>
              <div style={{ flex: 1 }}>
                <h3 className="serif" style={{ fontSize: 20, color: "#1C1B17", marginBottom: 6 }}>7-Day Performance Guarantee</h3>
                <p style={{ fontSize: 14, color: "rgba(28,27,23,0.58)", lineHeight: 1.75, margin: 0 }}>
                  Use NexaAttend for 7 days. If it doesn't measurably save your staff time, reduce attendance errors, and simplify daily operations — we refund you in full. No conditions, no fine print, no paperwork.
                </p>
              </div>
              <button onClick={() => scrollTo("inquiry")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2A6B4A", color: "#F7F5EF", border: "none", borderRadius: 8, padding: "13px 22px", fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1B4D3E"}
                onMouseLeave={e => e.currentTarget.style.background = "#2A6B4A"}>
                Start Free Trial →
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How It Works */}
      <section id="process" className="sec" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <div className="pill pill-green">How It Works</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)", letterSpacing: "-0.02em", marginBottom: 10 }}>From demo to live in 3 days.</h2>
            <p style={{ fontSize: 15, color: "rgba(28,27,23,0.5)", marginBottom: 48, lineHeight: 1.8 }}>We handle everything. You make one decision.</p>
          </FadeIn>
          <div className="g4" style={{ gap: 24 }}>
            {[
              { step: "01", icon: "📞", title: "Book a Free Demo", body: "WhatsApp or call us. We'll visit your school or connect online — no cost, no commitment, no sales pressure." },
              { step: "02", icon: "🛠️", title: "Free 7-Day Trial", body: "We install NexaAttend and run a live trial with your actual students and staff. You see the numbers yourself." },
              { step: "03", icon: "✓", title: "You Decide", body: "Trial convinced you? Great. Not sure? Ask more questions. Our 7-day guarantee backs every decision." },
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

      {/* Trust Section */}
      <section id="trust" className="sec" style={{ background: "#F7F5EF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="g2" style={{ gap: 60, alignItems: "center" }}>
            <FadeIn>
              <div className="pill pill-green">Why Trust Us</div>
              <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.6rem)", lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 18 }}>
                Built in Ahmedabad, for Indian schools, by someone who actually visits them.
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {["Your data never leaves your school premises — ever", "Direct WhatsApp access to the founding developer", "7-day money-back guarantee, no conditions", "India-based support, not a foreign ticket system", "Every onboarding personally overseen by the founder", "Works when your internet doesn't — fully offline"].map(t => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#2A6B4A", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 14, color: "#1C1B17", lineHeight: 1.65 }}>{t}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card" style={{ borderLeft: "4px solid #2A6B4A", borderRadius: "0 12px 12px 0" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2A6B4A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>Shah Tishya</div>
                    <div className="mono" style={{ fontSize: 9, color: "rgba(28,27,23,0.38)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Founder · Nova Teach Solution · Ahmedabad</div>
                    <p style={{ fontSize: 13.5, color: "rgba(28,27,23,0.6)", lineHeight: 1.8, fontStyle: "italic" }}>
                      "I built NexaAttend because I was tired of seeing schools run on 5 disconnected systems when one well-made tool could replace all of them."
                    </p>
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <a href="https://wa.me/919974724656" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 500, color: "#1B5C3A", textDecoration: "none" }}>💬 WhatsApp directly</a>
                      <span style={{ color: "rgba(28,27,23,0.2)" }}>·</span>
                      <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 500, color: "#1B5C3A", textDecoration: "none" }}>
                        <LiIcon /> LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="sec" style={{ background: "#F7F5EF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="pill pill-green">Complete School ERP Features</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: 12 }}>Everything you need to run your school efficiently</h2>
            <p style={{ maxWidth: 640, margin: "0 auto", color: "rgba(28,27,23,0.6)" }}>From attendance to analytics, NexaAttend covers every department in one integrated platform.</p>
          </FadeIn>
          <div className="g4" style={{ gap: 24 }}>
            {[
              { icon: "🎓", title: "Student Management", desc: "Complete profiles, class assignments, parent details, and academic history." },
              { icon: "📊", title: "Attendance Management", desc: "AI face recognition marks 30 students in under 60 seconds. Proxy-proof." },
              { icon: "📝", title: "Assignment Management", desc: "Create, submit, grade, and track assignments digitally." },
              { icon: "📅", title: "Exam Management", desc: "Schedule exams, generate hall tickets, produce result sheets automatically." },
              { icon: "💰", title: "Fee Management", desc: "Track collections, dues, send reminders, reduce fee leakage by 95%." },
              { icon: "🤖", title: "AI Analytics", desc: "Predictive insights on attendance trends, fee collection, and performance." },
              { icon: "📈", title: "Reports", desc: "One-click daily, weekly, monthly reports in PDF format." },
              { icon: "💬", title: "Parent Communication", desc: "Automated WhatsApp alerts for attendance, fees, and events." },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="card" style={{ textAlign: "center", padding: "28px 20px" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: "rgba(28,27,23,0.6)", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="sec" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="pill pill-green">Trusted by Schools Across India</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: 12 }}>What School Leaders Say</h2>
            <p style={{ color: "rgba(28,27,23,0.6)" }}>Real feedback from principals and administrators who switched to NexaAttend.</p>
          </FadeIn>
          <div className="g3" style={{ gap: 30 }}>
            {[
              { name: "Principal Meera Iyer", school: "Sunrise Academy, Pune", quote: "Face recognition attendance has saved our teachers 1.5 hours daily. Proxy attendance has dropped to zero. Best decision we made this year.", rating: 5 },
              { name: "Ramesh K.", school: "Saraswati Vidyalaya, Ahmedabad", quote: "The offline-first approach is a game changer. We don't worry about internet outages anymore. Reports are instant.", rating: 5 },
              { name: "Anita S.", school: "Delhi Public School, Jaipur", quote: "We switched from three separate systems to NexaAttend. Fee collection increased by 22% in two months. Support is amazing.", rating: 5 },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card" style={{ background: "#F7F5EF" }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 16, color: "#F5B042" }}>
                    {"★".repeat(t.rating)}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 20, fontStyle: "italic" }}>"{t.quote}"</p>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(28,27,23,0.5)" }}>{t.school}</div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", textAlign: "center" }}>
            <div><div style={{ fontSize: 36, fontWeight: 700, color: "#2A6B4A" }}>500+</div><div style={{ fontSize: 13, color: "rgba(28,27,23,0.6)" }}>Schools Onboarded</div></div>
            <div><div style={{ fontSize: 36, fontWeight: 700, color: "#2A6B4A" }}>2.5L+</div><div style={{ fontSize: 13, color: "rgba(28,27,23,0.6)" }}>Students Managed</div></div>
            <div><div style={{ fontSize: 36, fontWeight: 700, color: "#2A6B4A" }}>99%</div><div style={{ fontSize: 13, color: "rgba(28,27,23,0.6)" }}>Attendance Accuracy</div></div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="sec" style={{ background: "#F7F5EF" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="pill pill-green" style={{ justifyContent: "center" }}>Frequently Asked Questions</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em" }}>Everything you need to know</h2>
          </FadeIn>
          <FadeIn>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 18, color: "rgba(28,27,23,0.35)", transition: "transform 0.22s", transform: activeFaq === i ? "rotate(45deg)" : "none", flexShrink: 0, lineHeight: 1 }}>+</span>
                </button>
                {activeFaq === i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry" className="sec" style={{ background: "#F7F5EF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="pill pill-green" style={{ justifyContent: "center" }}>Free Demo — No Obligation</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, letterSpacing: "-0.022em", marginBottom: 12 }}>
              Book Your Free School Demo Today.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(28,27,23,0.52)", maxWidth: 500, margin: "0 auto", lineHeight: 1.85 }}>
              We visit your school (or connect online), show you the complete system live, and answer every question — completely free. No contract. No pressure.
            </p>
          </FadeIn>
          <div className="g2 inquiry-grid" style={{ gap: 48, alignItems: "flex-start" }}>
            <FadeIn>
              <InquiryForm />
            </FadeIn>
            <FadeIn delay={0.1}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "⚡", title: "Response within 24 hours", body: "We reply to every inquiry personally — by WhatsApp or phone — within one business day." },
                  { icon: "🏫", title: "Demo at your school or online", body: "We visit Ahmedabad schools in person. For other Gujarat cities and beyond, we connect live via video call." },
                  { icon: "🛡️", title: "No contract, no commitment", body: "The demo is completely free. The 7-day trial is free. You only pay if you're happy to continue." },
                  { icon: "🔒", title: "Your data stays with you", body: "Even during the trial, all student data is stored locally on your premises. Nothing goes to any cloud." },
                ].map((t, i) => (
                  <div key={i} style={{ background: "#FFFFFF", border: "1px solid rgba(28,27,23,0.07)", borderRadius: 12, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1C1B17", marginBottom: 5 }}>{t.title}</div>
                      <p style={{ fontSize: 13, color: "rgba(28,27,23,0.52)", lineHeight: 1.75, margin: 0 }}>{t.body}</p>
                    </div>
                  </div>
                ))}
                <div style={{ background: "#2A6B4A", borderRadius: 12, padding: "22px 24px" }}>
                  <div style={{ fontSize: 13, color: "rgba(247,245,239,0.55)", marginBottom: 6, fontWeight: 500 }}>Prefer to message directly?</div>
                  <a href="https://wa.me/919974724656" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 12 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 1.5C4.858 1.5 1.5 4.858 1.5 9c0 1.32.337 2.56.928 3.638L1.5 16.5l3.987-.9A7.46 7.46 0 009 16.5c4.142 0 7.5-3.358 7.5-7.5S13.142 1.5 9 1.5z" fill="#25D366" stroke="#25D366" strokeWidth="0.5" />
                      <path d="M12.5 10.9c-.2-.1-1.15-.57-1.33-.63-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.22.14-.42.05a5.3 5.3 0 01-2.6-2.28c-.2-.33.2-.31.56-1.04.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.44-.16-.38-.33-.32-.44-.33h-.38c-.13 0-.34.05-.52.25s-.68.67-.68 1.62.7 1.88.79 2.01c.1.13 1.36 2.08 3.3 2.92 1.22.53 1.7.57 2.31.48.37-.06 1.15-.47 1.31-.92.16-.45.16-.84.11-.92-.05-.08-.18-.13-.38-.22z" fill="#fff" />
                    </svg>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#F7F5EF" }}>WhatsApp +91 99747 24656</span>
                  </a>
                  <a href="tel:+919974724656" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <span style={{ fontSize: 16 }}>📞</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(247,245,239,0.75)" }}>+91 99747 24656</span>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Sticky Demo CTA */}
      {!showDemoModal && !user && (
        <button onClick={handleGoogleSignIn} style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 99,
          background: "#2A6B4A", color: "#F7F5EF", border: "none", borderRadius: "60px",
          padding: "12px 20px", fontSize: "14px", fontWeight: "bold", cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "8px",
          fontFamily: "'Instrument Sans', sans-serif",
        }}>
          🚀 Experience Demo
        </button>
      )}

      {/* Demo Modal */}
      {showDemoModal && trialExpiry && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)"
        }}>
          <div style={{
            background: "#F7F5EF", borderRadius: "24px", width: "90%", maxWidth: "1200px", maxHeight: "90vh",
            overflow: "auto", position: "relative"
          }}>
            <DemoDashboard user={user} trialExpiryDate={trialExpiry} onClose={() => setShowDemoModal(false)} onSignOut={handleSignOut} />
          </div>
        </div>
      )}

      {/* Footer (with Privacy & Terms links) */}
      <footer style={{ background: "#111110", padding: "48px 6% 28px", color: "#F7F5EF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="g2" style={{ gap: 48, paddingBottom: 36, borderBottom: "1px solid rgba(247,245,239,0.07)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, background: "#2A6B4A", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5" /><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 16 }}>NexaAttend</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2A6B4A" }}>by Nova Teach Solution</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(247,245,239,0.35)", lineHeight: 1.85, maxWidth: 300 }}>
                Complete School ERP with AI face recognition. Offline-first. Flat pricing. 7-day guarantee.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(247,245,239,0.25)", marginBottom: 14 }}>Product</div>
                {[["Platform", "solution"], ["Pricing", "pricing"], ["How It Works", "process"], ["Book Demo", "inquiry"]].map(([l, id]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <button style={{ background: "none", border: "none", color: "rgba(247,245,239,0.45)", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "'Instrument Sans',sans-serif" }}
                      onMouseEnter={e => e.target.style.color = "#F7F5EF"}
                      onMouseLeave={e => e.target.style.color = "rgba(247,245,239,0.45)"}
                      onClick={() => scrollTo(id)}>{l}
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(247,245,239,0.25)", marginBottom: 14 }}>Legal</div>
                <div style={{ marginBottom: 10 }}>
                  <button onClick={() => navigateTo("/privacy-policy")} style={{ background: "none", border: "none", color: "rgba(247,245,239,0.45)", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "'Instrument Sans',sans-serif" }} onMouseEnter={e => e.target.style.color = "#F7F5EF"} onMouseLeave={e => e.target.style.color = "rgba(247,245,239,0.45)"}>Privacy Policy</button>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <button onClick={() => navigateTo("/terms")} style={{ background: "none", border: "none", color: "rgba(247,245,239,0.45)", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "'Instrument Sans',sans-serif" }} onMouseEnter={e => e.target.style.color = "#F7F5EF"} onMouseLeave={e => e.target.style.color = "rgba(247,245,239,0.45)"}>Terms of Service</button>
                </div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(247,245,239,0.25)", marginTop: 20, marginBottom: 14 }}>Contact</div>
                <div style={{ fontSize: 13, color: "rgba(247,245,239,0.45)", lineHeight: 2.1 }}>
                  <div>+91 99747 24656</div>
                  <div>WhatsApp available</div>
                  <div>Ahmedabad, Gujarat</div>
                </div>
                <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                  style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "rgba(247,245,239,0.45)", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F7F5EF"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(247,245,239,0.45)"}>
                  <LiIcon /> LinkedIn
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
