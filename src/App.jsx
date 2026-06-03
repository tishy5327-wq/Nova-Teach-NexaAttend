import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
  onAuthStateChanged, signOut,
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc,
  collection, addDoc, serverTimestamp,
} from "firebase/firestore";

/* ─── Firebase Config ─── */
const firebaseConfig = {
  apiKey: "AIzaSyCAhTxH2vcZprnlTqNkfQouwYy76zK1Z5k",
  authDomain: "nova-e3626.firebaseapp.com",
  projectId: "nova-e3626",
  storageBucket: "nova-e3626.firebasestorage.app",
  messagingSenderId: "1000462435473",
  appId: "1:1000462435473:web:e8542ef3f6c478f3182b30",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* ─── Google Apps Script Web App URL ─── */
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxgViYSKbN1zFyISMS2l9xgDQGFE8QQAY7IlWjkEmAouzeO5GZwrLg8HZJevvF3SX4uyQ/exec";

/* ─── Intersection Observer Hook ─── */
const useInView = (threshold = 0.08) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
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
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
};

/* ─── Animated Counter ─── */
const AnimatedNumber = ({ target, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
};

/* ─── Live Attendance Terminal Data ─── */
const logs = [
  { time: "08:01:03", name: "Arjun Mehta",   cls: "X-A",   status: "present" },
  { time: "08:01:07", name: "Priya Sharma",  cls: "X-A",   status: "present" },
  { time: "08:01:14", name: "Rohan Patel",   cls: "IX-B",  status: "present" },
  { time: "08:01:21", name: "Sneha Verma",   cls: "X-A",   status: "late"    },
  { time: "08:01:28", name: "Dev Agarwal",   cls: "XI-C",  status: "present" },
  { time: "08:01:35", name: "Kavya Joshi",   cls: "IX-B",  status: "present" },
  { time: "08:01:40", name: "Ishaan Nair",   cls: "XII-A", status: "absent"  },
];

/* ─── Modules ─── */
const modules = [
  {
    icon: "◉", title: "Smart Attendance",
    features: ["AI face recognition — zero ID cards", "Works fully offline", "Marks 30 students in under 60 seconds", "Proxy attendance becomes impossible"],
    color: "#1B4D3E",
  },
  {
    icon: "◈", title: "Student Management",
    features: ["Complete student profiles & history", "Batch and class management", "Fee tracking and dues", "Parent notification hub"],
    color: "#1A2B4A",
  },
  {
    icon: "◇", title: "Staff & HR",
    features: ["Staff attendance via face recognition", "Payroll auto-calculated from attendance", "Leave management & approvals", "Department & role management"],
    color: "#3D1A4A",
  },
  {
    icon: "▣", title: "Reports & Analytics",
    features: ["One-click daily / weekly / monthly reports", "Class-wise attendance trends", "Payroll & fee collection reports", "Admin dashboard — always live"],
    color: "#4A2B0A",
  },
];

/* ─── Pricing ─── */
const PLANS = [
  {
    id: "basic", name: "Basic", students: 300, monthly: 6000,
    setup: 75000, setupDiscounted: 45000,
    badge: "Best Value For Small Schools", color: "#1A2B4A",
    features: ["Up to 300 students","AI face recognition attendance","2 cameras included","Student management","WhatsApp parent alerts","Basic attendance reports","1 admin account","Email support","Free lifetime updates"],
  },
  {
    id: "standard", name: "Standard", students: 600, monthly: 9000,
    setup: 75000, setupDiscounted: 45000,
    badge: "Most Popular", color: "#1B4D3E",
    features: ["Up to 600 students","AI face recognition attendance","2 cameras included","Student + Staff management","WhatsApp parent alerts","Advanced reports & analytics","Payroll automation","Multi-role admin access","Leave management","Priority phone support","Free lifetime updates"],
  },
  {
    id: "premium", name: "Premium", students: 999, monthly: 12000,
    setup: 75000, setupDiscounted: 45000,
    badge: "Best For Larger Schools", color: "#3D1A4A",
    features: ["Up to 999 students","AI face recognition attendance","2 cameras included","Complete School ERP","WhatsApp parent alerts","Custom report builder","Payroll automation","Unlimited admin accounts","Shift & leave management","Dedicated account manager","Priority phone support","Free lifetime updates"],
  },
];

const fmt = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${n.toLocaleString("en-IN")}`;

/* ─── LinkedIn Icon ─── */
const LiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/* ─── Demo Video Player ─── */
const DemoVideoPlayer = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true); setHasStarted(true); }
    else { videoRef.current.pause(); setPlaying(false); }
  };
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    if (playing) controlsTimer.current = setTimeout(() => setShowControls(false), 2800);
  };
  const toggleFS = () => {
    if (!document.fullscreenElement) { containerRef.current?.requestFullscreen?.(); setFullscreen(true); }
    else { document.exitFullscreen?.(); setFullscreen(false); }
  };

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => playing && setShowControls(false)}
      style={{ position:"relative", borderRadius:16, overflow:"hidden", background:"#0a0a0a",
        boxShadow:"0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(247,245,239,0.08)",
        cursor: playing && !showControls ? "none" : "default", aspectRatio:"16/9" }}>
      <video ref={videoRef} src="/2026-05-09_11-48-06.mp4"
        style={{ width:"100%", height:"100%", display:"block", objectFit:"contain", background:"#0a0a0a" }}
        onTimeUpdate={() => { if (!videoRef.current) return; setCurrentTime(videoRef.current.currentTime); setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100); }}
        onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        muted={muted} playsInline preload="metadata" />
      {!hasStarted && (
        <div onClick={togglePlay} style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", cursor:"pointer",
          background:"linear-gradient(135deg,rgba(10,9,8,0.55),rgba(10,9,8,0.3))", backdropFilter:"blur(2px)" }}>
          <div style={{ position:"absolute", top:16, left:16, display:"flex", alignItems:"center", gap:8,
            background:"rgba(10,9,8,0.6)", borderRadius:8, padding:"6px 14px", border:"1px solid rgba(247,245,239,0.12)" }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#5AC87A" }} />
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(247,245,239,0.5)", letterSpacing:"0.08em" }}>
              nexaattend — live portal walkthrough
            </span>
          </div>
          <div style={{ width:76, height:76, borderRadius:"50%", background:"rgba(247,245,239,0.95)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 8px 40px rgba(0,0,0,0.5), 0 0 0 12px rgba(247,245,239,0.12)", marginBottom:16 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1C1B17" style={{ marginLeft:4 }}><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(1rem,2.5vw,1.4rem)", color:"#F7F5EF", marginBottom:6 }}>Watch Product Demo</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(247,245,239,0.4)", letterSpacing:"0.1em" }}>{formatTime(duration)} · Full walkthrough</div>
        </div>
      )}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"32px 18px 14px",
        background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)",
        opacity:(showControls || !playing) && hasStarted ? 1 : 0, transition:"opacity 0.3s",
        pointerEvents:(showControls || !playing) && hasStarted ? "auto" : "none" }}>
        <div onClick={(e) => { const pct=(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width; if(videoRef.current) videoRef.current.currentTime=pct*videoRef.current.duration; }}
          style={{ width:"100%", height:3, background:"rgba(247,245,239,0.2)", borderRadius:2, marginBottom:10, cursor:"pointer", position:"relative" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"#5AC87A", borderRadius:2, position:"relative" }}>
            <div style={{ position:"absolute", right:-5, top:"50%", transform:"translateY(-50%)", width:11, height:11, borderRadius:"50%", background:"#5AC87A", boxShadow:"0 0 6px rgba(90,200,122,0.6)" }} />
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={togglePlay} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"#F7F5EF", display:"flex" }}>
            {playing ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                     : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
          </button>
          <button onClick={() => setMuted(m => !m)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"rgba(247,245,239,0.7)", display:"flex" }}>
            {muted ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>}
          </button>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(247,245,239,0.55)" }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div style={{ flex:1 }} />
          <button onClick={toggleFS} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"rgba(247,245,239,0.7)", display:"flex" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              {fullscreen ? <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                          : <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>}
            </svg>
          </button>
        </div>
      </div>
      {hasStarted && <div onClick={togglePlay} style={{ position:"absolute", inset:0, cursor:"pointer", zIndex:1 }} />}
    </div>
  );
};

/* ─── Demo Dashboard Sample Data ─── */
const DemoData = {
  students: [
    { id:1, name:"Arjun Mehta",    class:"X-A",  rollNo:24, status:"Active", attendance:"97%", fees:"Paid" },
    { id:2, name:"Priya Sharma",   class:"X-A",  rollNo:15, status:"Active", attendance:"95%", fees:"Paid" },
    { id:3, name:"Rohan Patel",    class:"IX-B", rollNo:8,  status:"Active", attendance:"89%", fees:"Due"  },
    { id:4, name:"Sneha Verma",    class:"X-A",  rollNo:31, status:"Active", attendance:"92%", fees:"Paid" },
    { id:5, name:"Dev Agarwal",    class:"XI-C", rollNo:7,  status:"Active", attendance:"98%", fees:"Paid" },
    { id:6, name:"Kavya Joshi",    class:"IX-B", rollNo:19, status:"Active", attendance:"93%", fees:"Partial" },
  ],
  todayAttendance: { present:284, late:12, absent:8, total:304 },
  weeklyTrend: [
    { day:"Mon", pct:96 },{ day:"Tue", pct:94 },{ day:"Wed", pct:97 },
    { day:"Thu", pct:93 },{ day:"Fri", pct:96 },
  ],
  assignments: [
    { title:"Maths – Algebra",    dueDate:"June 5",  submitted:42, total:45, subject:"Math"    },
    { title:"Science – Physics",  dueDate:"June 7",  submitted:38, total:42, subject:"Science" },
    { title:"English Essay",      dueDate:"June 10", submitted:30, total:45, subject:"English" },
  ],
  exams: [
    { name:"Unit Test I",  date:"June 20–22",  status:"Upcoming",  classes:"All"    },
    { name:"Mid-Term",     date:"July 15–25",  status:"Scheduled", classes:"IX–XII" },
    { name:"Final",        date:"Nov 1–15",    status:"Scheduled", classes:"All"    },
  ],
  fees: { collected:1250000, pending:320000, total:1570000 },
  recentActivity: [
    { icon:"✓", text:"X-A attendance marked (98% present)",     time:"8:02 AM", type:"success" },
    { icon:"📝", text:"42 students submitted Algebra assignment", time:"9:15 AM", type:"info"    },
    { icon:"₹", text:"₹45,000 fees collected — 3 students",     time:"10:30 AM",type:"money"   },
    { icon:"🔔", text:"Parent alerts sent to 8 absent students",  time:"8:10 AM", type:"alert"   },
    { icon:"📅", text:"Mid-term exam schedule published",         time:"Yesterday",type:"info"   },
  ],
};

/* ─── Redesigned Demo Dashboard ─── */
const DemoDashboard = ({ user, trialExpiryDate, onClose, onSignOut }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [daysLeft, setDaysLeft] = useState(7);
  const [expired, setExpired] = useState(false);
  const [contactStatus, setContactStatus] = useState("idle");
  const [contactForm, setContactForm] = useState({ schoolName:"", contactPerson:"", mobile:"", email:"", students:"", message:"" });

  useEffect(() => {
    if (trialExpiryDate) {
      const expiry = trialExpiryDate.toDate ? trialExpiryDate.toDate() : new Date(trialExpiryDate);
      const left = Math.ceil((expiry - new Date()) / (1000*60*60*24));
      if (left <= 0) setExpired(true);
      else setDaysLeft(left);
    }
  }, [trialExpiryDate]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("sending");
    try {
      await addDoc(collection(db, "salesLeads"), { ...contactForm, source:"demo_expired", uid:user?.uid, createdAt:serverTimestamp() });
      const p = new URLSearchParams({ ...contactForm, source:"demo_expired", timestamp:new Date().toISOString() });
      await fetch(`${SHEET_URL}?${p.toString()}`, { method:"GET", mode:"no-cors" });
      setContactStatus("success");
    } catch { setContactStatus("error"); }
  };

  const tabs = [
    { id:"overview",    label:"Overview",    icon:"◉" },
    { id:"attendance",  label:"Attendance",  icon:"◈" },
    { id:"students",    label:"Students",    icon:"◇" },
    { id:"assignments", label:"Assignments", icon:"▣" },
    { id:"exams",       label:"Exams",       icon:"◆" },
    { id:"fees",        label:"Fees",        icon:"◎" },
  ];

  const attPct = Math.round((DemoData.todayAttendance.present / DemoData.todayAttendance.total) * 100);
  const feesPct = Math.round((DemoData.fees.collected / DemoData.fees.total) * 100);

  if (expired && contactStatus !== "success") {
    return (
      <div style={{ padding:"40px", maxWidth:520, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>⏰</div>
        <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, marginBottom:8 }}>Your trial has ended</h2>
        <p style={{ color:"rgba(28,27,23,0.55)", marginBottom:28, lineHeight:1.7 }}>Contact our team to continue using NexaAttend at your school.</p>
        <form onSubmit={handleContactSubmit} style={{ display:"flex", flexDirection:"column", gap:12, textAlign:"left" }}>
          {[["schoolName","School Name"],["contactPerson","Your Name"],["mobile","Mobile Number"],["email","Email"],["students","No. of Students"]].map(([k,p]) => (
            <input key={k} placeholder={p} required value={contactForm[k]} onChange={e => setContactForm(f=>({...f,[k]:e.target.value}))}
              style={{ padding:"11px 14px", borderRadius:8, border:"1.5px solid rgba(28,27,23,0.15)", fontSize:14, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }} />
          ))}
          <textarea placeholder="Message (optional)" rows={3} value={contactForm.message} onChange={e => setContactForm(f=>({...f,message:e.target.value}))}
            style={{ padding:"11px 14px", borderRadius:8, border:"1.5px solid rgba(28,27,23,0.15)", fontSize:14, resize:"vertical", fontFamily:"'Instrument Sans',sans-serif" }} />
          <button type="submit" disabled={contactStatus==="sending"} style={{ padding:"13px", background:"#1C1B17", color:"#F7F5EF", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
            {contactStatus==="sending" ? "Sending…" : "Contact Sales Team"}
          </button>
        </form>
      </div>
    );
  }

  if (contactStatus === "success") {
    return (
      <div style={{ padding:"60px 40px", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(42,107,74,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#2A6B4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, marginBottom:8 }}>We'll be in touch!</h3>
        <p style={{ color:"rgba(28,27,23,0.55)" }}>Our team will call you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"90vh", background:"#F7F5EF", borderRadius:24, overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:220, background:"#1C1B17", display:"flex", flexDirection:"column", flexShrink:0 }}>
        {/* Logo */}
        <div style={{ padding:"22px 20px 16px", borderBottom:"1px solid rgba(247,245,239,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, background:"#2A6B4A", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:15, color:"#F7F5EF" }}>NexaAttend</div>
              <div style={{ fontSize:9, letterSpacing:"0.1em", color:"rgba(247,245,239,0.35)", textTransform:"uppercase" }}>Demo Portal</div>
            </div>
          </div>
        </div>
        {/* User info */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(247,245,239,0.07)" }}>
          {user?.photoURL && <img src={user.photoURL} alt="" style={{ width:32, height:32, borderRadius:"50%", marginBottom:8 }} />}
          <div style={{ fontSize:12, fontWeight:600, color:"#F7F5EF", marginBottom:2 }}>{user?.displayName || "Demo User"}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background: daysLeft > 3 ? "#5AC87A" : "#F59E0B" }} />
            <span style={{ fontSize:10, color:"rgba(247,245,239,0.45)", letterSpacing:"0.04em" }}>{daysLeft}d trial left</span>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10,
              padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer",
              background: activeTab===t.id ? "rgba(247,245,239,0.1)" : "transparent",
              color: activeTab===t.id ? "#F7F5EF" : "rgba(247,245,239,0.45)",
              fontSize:13, fontWeight: activeTab===t.id ? 600 : 400,
              fontFamily:"'Instrument Sans',sans-serif", marginBottom:2,
              borderLeft: activeTab===t.id ? "2px solid #5AC87A" : "2px solid transparent",
              transition:"all 0.18s",
            }}>
              <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        {/* Bottom actions */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(247,245,239,0.07)" }}>
          <div style={{ background:"rgba(90,200,122,0.1)", border:"1px solid rgba(90,200,122,0.2)", borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
            <div style={{ fontSize:10, color:"rgba(247,245,239,0.5)", marginBottom:4 }}>Sample data only</div>
            <div style={{ fontSize:11, color:"#5AC87A", fontWeight:600 }}>This is a live demo</div>
          </div>
          <button onClick={onSignOut} style={{ width:"100%", padding:"9px", background:"rgba(247,245,239,0.06)", border:"1px solid rgba(247,245,239,0.1)", borderRadius:8, color:"rgba(247,245,239,0.5)", fontSize:12, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>Sign out</button>
          <button onClick={onClose} style={{ width:"100%", padding:"9px", background:"transparent", border:"none", color:"rgba(247,245,239,0.3)", fontSize:12, cursor:"pointer", marginTop:4, fontFamily:"'Instrument Sans',sans-serif" }}>✕ Close demo</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflowY:"auto", background:"#F7F5EF" }}>
        {/* Header bar */}
        <div style={{ padding:"18px 28px", background:"#FFFFFF", borderBottom:"1px solid rgba(28,27,23,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:"#1C1B17", fontFamily:"'Instrument Serif',serif" }}>
              {tabs.find(t=>t.id===activeTab)?.label}
            </h2>
            <p style={{ fontSize:12, color:"rgba(28,27,23,0.4)", marginTop:1 }}>Wednesday, June 3, 2026 · Demo Environment</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(42,107,74,0.08)", border:"1px solid rgba(42,107,74,0.18)", borderRadius:100, padding:"5px 12px" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#2A6B4A" }} />
              <span style={{ fontSize:10, fontWeight:600, color:"#1B5C3A", letterSpacing:"0.06em" }}>LIVE DATA</span>
            </div>
          </div>
        </div>

        <div style={{ padding:"24px 28px" }}>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              {/* Stats grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:24 }}>
                {[
                  { label:"Present Today",  value:`${DemoData.todayAttendance.present}`, sub:`of ${DemoData.todayAttendance.total}`, color:"#1B4D3E", bg:"rgba(27,77,62,0.06)" },
                  { label:"Late Today",     value:`${DemoData.todayAttendance.late}`,    sub:"students",  color:"#7A5000", bg:"rgba(122,80,0,0.06)" },
                  { label:"Absent Today",   value:`${DemoData.todayAttendance.absent}`,  sub:"students",  color:"#7A1A1A", bg:"rgba(122,26,26,0.06)" },
                  { label:"Attendance Rate",value:`${attPct}%`,                          sub:"today",     color:"#1A2B6A", bg:"rgba(26,43,106,0.06)" },
                  { label:"Fee Collected",  value:`₹${(DemoData.fees.collected/100000).toFixed(1)}L`, sub:"this month", color:"#1B4D3E", bg:"rgba(27,77,62,0.06)" },
                  { label:"Fee Pending",    value:`₹${(DemoData.fees.pending/100000).toFixed(1)}L`, sub:"outstanding", color:"#7A3A00", bg:"rgba(122,58,0,0.06)" },
                ].map((s,i) => (
                  <div key={i} style={{ background:"#FFFFFF", border:"1px solid rgba(28,27,23,0.07)", borderRadius:12, padding:"18px 16px", borderTop:`3px solid ${s.color}` }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"rgba(28,27,23,0.45)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:700, color:s.color, lineHeight:1, fontFamily:"'Instrument Serif',serif" }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"rgba(28,27,23,0.38)", marginTop:4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Attendance progress + Recent activity */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div style={{ background:"#FFFFFF", borderRadius:12, border:"1px solid rgba(28,27,23,0.07)", padding:"20px" }}>
                  <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Weekly Attendance Trend</h3>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:100 }}>
                    {DemoData.weeklyTrend.map((d,i) => (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:"#2A6B4A" }}>{d.pct}%</div>
                        <div style={{ width:"100%", background:"rgba(42,107,74,0.1)", borderRadius:4, position:"relative", height:60 }}>
                          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:`linear-gradient(to top, #2A6B4A, #5AC87A)`, borderRadius:4, height:`${d.pct}%`, transition:"height 1s ease" }} />
                        </div>
                        <div style={{ fontSize:11, color:"rgba(28,27,23,0.4)" }}>{d.day}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background:"#FFFFFF", borderRadius:12, border:"1px solid rgba(28,27,23,0.07)", padding:"20px" }}>
                  <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Recent Activity</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {DemoData.recentActivity.slice(0,4).map((a,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <span style={{ fontSize:14, flexShrink:0 }}>{a.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, color:"#1C1B17", lineHeight:1.4 }}>{a.text}</div>
                          <div style={{ fontSize:10, color:"rgba(28,27,23,0.38)", marginTop:2 }}>{a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === "attendance" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
                {[
                  { label:"Present", value:DemoData.todayAttendance.present, color:"#1B4D3E", pct:attPct },
                  { label:"Late",    value:DemoData.todayAttendance.late,    color:"#7A5000", pct:4 },
                  { label:"Absent",  value:DemoData.todayAttendance.absent,  color:"#7A1A1A", pct:3 },
                ].map((s,i) => (
                  <div key={i} style={{ background:"#FFFFFF", borderRadius:12, border:"1px solid rgba(28,27,23,0.07)", padding:"20px" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"rgba(28,27,23,0.45)", marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontSize:32, fontWeight:700, color:s.color, fontFamily:"'Instrument Serif',serif", marginBottom:10 }}>{s.value}</div>
                    <div style={{ height:6, background:"rgba(28,27,23,0.06)", borderRadius:3 }}>
                      <div style={{ height:"100%", width:`${s.pct}%`, background:s.color, borderRadius:3, transition:"width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background:"#FFFFFF", borderRadius:12, border:"1px solid rgba(28,27,23,0.07)", overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(28,27,23,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ fontSize:14, fontWeight:600 }}>Today's Recognition Log</h3>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#2A6B4A", fontWeight:600 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#5AC87A" }} />AI LIVE
                  </div>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"rgba(28,27,23,0.02)" }}>
                      {["Time","Student","Class","Status"].map(h => (
                        <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:"rgba(28,27,23,0.4)", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l,i) => (
                      <tr key={i} style={{ borderTop:"1px solid rgba(28,27,23,0.04)", transition:"background 0.15s" }}>
                        <td style={{ padding:"11px 20px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(28,27,23,0.4)" }}>{l.time}</td>
                        <td style={{ padding:"11px 20px", fontSize:13, fontWeight:500 }}>{l.name}</td>
                        <td style={{ padding:"11px 20px", fontSize:12, color:"rgba(28,27,23,0.55)" }}>{l.cls}</td>
                        <td style={{ padding:"11px 20px" }}>
                          <span style={{ padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:600,
                            background: l.status==="present" ? "rgba(42,107,74,0.1)" : l.status==="late" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                            color: l.status==="present" ? "#1B5C3A" : l.status==="late" ? "#7A5000" : "#7A1A1A" }}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === "students" && (
            <div style={{ background:"#FFFFFF", borderRadius:12, border:"1px solid rgba(28,27,23,0.07)", overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(28,27,23,0.07)", display:"flex", justifyContent:"space-between" }}>
                <h3 style={{ fontSize:14, fontWeight:600 }}>Student Directory</h3>
                <span style={{ fontSize:12, color:"rgba(28,27,23,0.45)" }}>{DemoData.students.length} students shown (demo)</span>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(28,27,23,0.02)" }}>
                    {["Name","Class","Roll No","Attendance","Fees","Status"].map(h => (
                      <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:"rgba(28,27,23,0.4)", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DemoData.students.map((s,i) => (
                    <tr key={s.id} style={{ borderTop:"1px solid rgba(28,27,23,0.04)" }}>
                      <td style={{ padding:"13px 20px", fontSize:13, fontWeight:500 }}>{s.name}</td>
                      <td style={{ padding:"13px 20px", fontSize:12, color:"rgba(28,27,23,0.55)" }}>{s.class}</td>
                      <td style={{ padding:"13px 20px", fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"rgba(28,27,23,0.5)" }}>{s.rollNo}</td>
                      <td style={{ padding:"13px 20px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:40, height:4, background:"rgba(28,27,23,0.06)", borderRadius:2 }}>
                            <div style={{ height:"100%", width:s.attendance, background:parseInt(s.attendance)>90?"#2A6B4A":"#F59E0B", borderRadius:2 }} />
                          </div>
                          <span style={{ fontSize:12, fontWeight:600, color:"rgba(28,27,23,0.65)" }}>{s.attendance}</span>
                        </div>
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        <span style={{ padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:600,
                          background: s.fees==="Paid" ? "rgba(42,107,74,0.1)" : s.fees==="Due" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                          color: s.fees==="Paid" ? "#1B5C3A" : s.fees==="Due" ? "#7A1A1A" : "#7A5000" }}>
                          {s.fees}
                        </span>
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        <span style={{ padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:600, background:"rgba(42,107,74,0.08)", color:"#1B5C3A" }}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === "assignments" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {DemoData.assignments.map((a,i) => (
                <div key={i} style={{ background:"#FFFFFF", borderRadius:12, border:"1px solid rgba(28,27,23,0.07)", padding:"20px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <h3 style={{ fontSize:15, fontWeight:600 }}>{a.title}</h3>
                      <p style={{ fontSize:12, color:"rgba(28,27,23,0.45)", marginTop:3 }}>Due: {a.dueDate} · {a.subject}</p>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:"#2A6B4A" }}>{a.submitted}/{a.total}</span>
                  </div>
                  <div style={{ height:6, background:"rgba(28,27,23,0.06)", borderRadius:3 }}>
                    <div style={{ height:"100%", width:`${Math.round(a.submitted/a.total*100)}%`, background:"linear-gradient(to right,#2A6B4A,#5AC87A)", borderRadius:3, transition:"width 1s ease" }} />
                  </div>
                  <div style={{ fontSize:11, color:"rgba(28,27,23,0.4)", marginTop:6 }}>{Math.round(a.submitted/a.total*100)}% submitted</div>
                </div>
              ))}
            </div>
          )}

          {/* EXAMS TAB */}
          {activeTab === "exams" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {DemoData.exams.map((e,i) => (
                <div key={i} style={{ background:"#FFFFFF", borderRadius:12, border:"1px solid rgba(28,27,23,0.07)", padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <h3 style={{ fontSize:15, fontWeight:600 }}>{e.name}</h3>
                    <p style={{ fontSize:12, color:"rgba(28,27,23,0.45)", marginTop:4 }}>{e.date} · Classes: {e.classes}</p>
                  </div>
                  <span style={{ padding:"5px 14px", borderRadius:100, fontSize:12, fontWeight:600,
                    background: e.status==="Upcoming" ? "rgba(26,43,106,0.1)" : "rgba(28,27,23,0.06)",
                    color: e.status==="Upcoming" ? "#1A2B6A" : "rgba(28,27,23,0.5)" }}>
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* FEES TAB */}
          {activeTab === "fees" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:20 }}>
                {[
                  { label:"Total Collected", value:`₹${(DemoData.fees.collected/100000).toFixed(2)}L`, color:"#1B4D3E", pct:feesPct },
                  { label:"Pending",         value:`₹${(DemoData.fees.pending/100000).toFixed(2)}L`,   color:"#7A3A00", pct:100-feesPct },
                  { label:"Collection Rate", value:`${feesPct}%`,                                       color:"#1A2B6A", pct:feesPct },
                ].map((s,i) => (
                  <div key={i} style={{ background:"#FFFFFF", borderRadius:12, border:"1px solid rgba(28,27,23,0.07)", padding:"20px", borderTop:`3px solid ${s.color}` }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"rgba(28,27,23,0.4)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:"'Instrument Serif',serif", marginBottom:10 }}>{s.value}</div>
                    <div style={{ height:6, background:"rgba(28,27,23,0.06)", borderRadius:3 }}>
                      <div style={{ height:"100%", width:`${s.pct}%`, background:s.color, borderRadius:3 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"rgba(42,107,74,0.06)", border:"1px solid rgba(42,107,74,0.15)", borderRadius:12, padding:"16px 20px" }}>
                <p style={{ fontSize:13.5, color:"#1B4D3E", lineHeight:1.7 }}>
                  💡 <strong>AI Insight:</strong> Fee collection rate is <strong>{feesPct}%</strong> this month. 
                  8 students have pending dues above ₹5,000. Automated WhatsApp reminders sent to parents on June 1.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Multi-Step Inquiry Form ─── */
const InquiryForm = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name:"", role:"", school:"", city:"",
    phone:"", email:"", students:"", board:"",
    plan:"Standard (up to 600 students — ₹9,000/mo)",
    hear:"", message:"",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [focusedField, setFocusedField] = useState(null);

  const setField = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(prev => { const n={...prev}; delete n[k]; return n; });
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim())  errs.name = "Required";
    if (!form.role)         errs.role = "Required";
    if (!form.phone.trim() || !/^\+?[\d\s\-]{10,15}$/.test(form.phone.replace(/\s/g,""))) errs.phone = "Valid 10-digit number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    return errs;
  };
  const validateStep2 = () => {
    const errs = {};
    if (!form.school.trim()) errs.school = "Required";
    if (!form.city.trim())   errs.city = "Required";
    if (!form.students)      errs.students = "Required";
    return errs;
  };

  const nextStep = () => {
    const errs = step===1 ? validateStep1() : validateStep2();
    setErrors(errs);
    if (Object.keys(errs).length===0) setStep(s => s+1);
  };

  const handleSubmit = async () => {
    setStatus("sending");
    const leadData = { ...form, timestamp:new Date().toISOString() };
    const params = new URLSearchParams(leadData);
    try {
      await addDoc(collection(db,"salesLeads"), { ...leadData, createdAt:serverTimestamp() });
      await fetch(`${SHEET_URL}?${params.toString()}`, { method:"GET", mode:"no-cors" });
      setStatus("success");
    } catch { setStatus("error"); }
  };

  const iStyle = (field) => ({
    width:"100%", padding:"11px 14px", fontSize:14,
    fontFamily:"'Instrument Sans','DM Sans',sans-serif",
    background: focusedField===field ? "#FFFFFF" : "#FAFAF8",
    color:"#1C1B17",
    border:`1.5px solid ${errors[field] ? "#D9534F" : focusedField===field ? "#2A6B4A" : "rgba(28,27,23,0.15)"}`,
    borderRadius:8, outline:"none", transition:"all 0.2s", boxSizing:"border-box",
    boxShadow: focusedField===field && !errors[field] ? "0 0 0 3px rgba(42,107,74,0.1)" : errors[field] ? "0 0 0 3px rgba(217,83,79,0.1)" : "none",
  });
  const sStyle = (field) => ({
    ...iStyle(field),
    appearance:"none", WebkitAppearance:"none",
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231C1B17' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
    paddingRight:36, cursor:"pointer",
  });
  const lStyle = { fontSize:12, fontWeight:600, color:"rgba(28,27,23,0.55)", marginBottom:5, display:"block", letterSpacing:"0.02em" };
  const eStyle = { fontSize:11.5, color:"#C0392B", marginTop:4 };

  const planOptions = [
    { value:"Basic (up to 300 students — ₹6,000/mo)",    label:"Basic",    sub:"Up to 300 students", price:"₹6,000/mo", color:"#1A2B4A" },
    { value:"Standard (up to 600 students — ₹9,000/mo)", label:"Standard", sub:"Up to 600 students", price:"₹9,000/mo", color:"#1B4D3E" },
    { value:"Premium (up to 999 students — ₹12,000/mo)", label:"Premium",  sub:"Up to 999 students", price:"₹12,000/mo",color:"#3D1A4A" },
  ];

  if (status === "success") {
    return (
      <div style={{ textAlign:"center", padding:"60px 32px" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(42,107,74,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#2A6B4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:22, fontWeight:600, color:"#1C1B17", marginBottom:10 }}>Inquiry received!</h3>
        <p style={{ fontSize:15, color:"rgba(28,27,23,0.58)", lineHeight:1.8, maxWidth:380, margin:"0 auto 28px" }}>
          Thank you, {form.name}! Our team will contact you at {form.phone} within 24 hours.
        </p>
        <a href="https://wa.me/919974724656" style={{ display:"inline-flex", alignItems:"center", gap:9, background:"#1C1B17", color:"#F7F5EF", borderRadius:8, padding:"12px 22px", fontSize:14, fontWeight:600, textDecoration:"none" }}>
          💬 Message us on WhatsApp
        </a>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ textAlign:"center", padding:"48px 32px" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
        <h3 style={{ fontSize:20, fontWeight:600, color:"#1C1B17", marginBottom:10 }}>Couldn't send right now</h3>
        <p style={{ fontSize:14, color:"rgba(28,27,23,0.55)", lineHeight:1.8, marginBottom:24 }}>Please reach us directly on WhatsApp.</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <a href="https://wa.me/919974724656" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#2A6B4A", color:"#F7F5EF", borderRadius:8, padding:"12px 20px", fontSize:14, fontWeight:600, textDecoration:"none" }}>💬 WhatsApp Us</a>
          <button onClick={() => setStatus("idle")} style={{ background:"none", border:"1.5px solid rgba(28,27,23,0.2)", borderRadius:8, padding:"11px 20px", fontSize:14, fontWeight:500, cursor:"pointer", color:"#1C1B17", fontFamily:"'Instrument Sans',sans-serif" }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"#FFFFFF", borderRadius:16, border:"1px solid rgba(28,27,23,0.08)", overflow:"hidden", boxShadow:"0 4px 24px rgba(28,27,23,0.06)" }}>
      {/* Header */}
      <div style={{ padding:"24px 28px 20px", borderBottom:"1px solid rgba(28,27,23,0.07)", background:"linear-gradient(135deg,#FAFAF8,#F7F5EF)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ width:40, height:40, background:"#2A6B4A", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#1C1B17", fontFamily:"'Instrument Serif',serif" }}>Book a Free Demo</div>
            <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"#2A6B4A", fontWeight:600 }}>NexaAttend · School Inquiry</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, background:"rgba(42,107,74,0.08)", border:"1px solid rgba(42,107,74,0.18)", borderRadius:100, padding:"5px 12px" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#2A6B4A" }} />
            <span style={{ fontSize:10, fontWeight:600, color:"#1B5C3A", letterSpacing:"0.06em" }}>FREE · NO OBLIGATION</span>
          </div>
        </div>
        {/* Step indicator */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {["About You","Your School","Choose Plan"].map((label,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700,
                  background: step>i+1 ? "#2A6B4A" : step===i+1 ? "#1C1B17" : "rgba(28,27,23,0.08)",
                  color: step>=i+1 ? "#F7F5EF" : "rgba(28,27,23,0.35)" }}>
                  {step>i+1 ? "✓" : i+1}
                </div>
                <span style={{ fontSize:12, fontWeight: step===i+1 ? 600 : 400, color: step===i+1 ? "#1C1B17" : "rgba(28,27,23,0.4)" }}>{label}</span>
              </div>
              {i<2 && <div style={{ width:24, height:1, background: step>i+1 ? "#2A6B4A" : "rgba(28,27,23,0.1)" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"24px 28px 28px" }}>
        {/* Step 1 — About You */}
        {step === 1 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={lStyle} htmlFor="name">Full Name <span style={{ color:"#C0392B" }}>*</span></label>
                <input id="name" type="text" placeholder="e.g. Rajesh Sharma" value={form.name} onChange={setField("name")} onFocus={()=>setFocusedField("name")} onBlur={()=>setFocusedField(null)} style={iStyle("name")} autoComplete="name" />
                {errors.name && <span style={eStyle}>{errors.name}</span>}
              </div>
              <div>
                <label style={lStyle} htmlFor="role">Your Role <span style={{ color:"#C0392B" }}>*</span></label>
                <select id="role" value={form.role} onChange={setField("role")} onFocus={()=>setFocusedField("role")} onBlur={()=>setFocusedField(null)} style={sStyle("role")}>
                  <option value="">Select role…</option>
                  <option>Principal / Headmaster</option>
                  <option>School Owner / Trustee</option>
                  <option>Administrator</option>
                  <option>IT Coordinator</option>
                  <option>Teacher / HOD</option>
                  <option>Finance Manager</option>
                  <option>Other</option>
                </select>
                {errors.role && <span style={eStyle}>{errors.role}</span>}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <label style={lStyle}>Mobile Number <span style={{ color:"#C0392B" }}>*</span></label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"rgba(28,27,23,0.45)", pointerEvents:"none" }}>+91</span>
                  <input type="tel" placeholder="99747 24656" value={form.phone} onChange={setField("phone")} onFocus={()=>setFocusedField("phone")} onBlur={()=>setFocusedField(null)} style={{ ...iStyle("phone"), paddingLeft:44 }} inputMode="numeric" />
                </div>
                {errors.phone && <span style={eStyle}>{errors.phone}</span>}
              </div>
              <div>
                <label style={lStyle}>Email <span style={{ fontSize:11, color:"rgba(28,27,23,0.35)", fontWeight:400 }}>(optional)</span></label>
                <input type="email" placeholder="you@school.edu.in" value={form.email} onChange={setField("email")} onFocus={()=>setFocusedField("email")} onBlur={()=>setFocusedField(null)} style={iStyle("email")} />
                {errors.email && <span style={eStyle}>{errors.email}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — About Your School */}
        {step === 2 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={lStyle}>School Name <span style={{ color:"#C0392B" }}>*</span></label>
                <input type="text" placeholder="e.g. Sunrise International School" value={form.school} onChange={setField("school")} onFocus={()=>setFocusedField("school")} onBlur={()=>setFocusedField(null)} style={iStyle("school")} />
                {errors.school && <span style={eStyle}>{errors.school}</span>}
              </div>
              <div>
                <label style={lStyle}>City / District <span style={{ color:"#C0392B" }}>*</span></label>
                <input type="text" placeholder="e.g. Ahmedabad" value={form.city} onChange={setField("city")} onFocus={()=>setFocusedField("city")} onBlur={()=>setFocusedField(null)} style={iStyle("city")} />
                {errors.city && <span style={eStyle}>{errors.city}</span>}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={lStyle}>Total Students <span style={{ color:"#C0392B" }}>*</span></label>
                <select value={form.students} onChange={setField("students")} onFocus={()=>setFocusedField("students")} onBlur={()=>setFocusedField(null)} style={sStyle("students")}>
                  <option value="">Select count…</option>
                  <option>Under 100</option><option>100–200</option><option>200–300</option>
                  <option>300–500</option><option>500–600</option><option>600–800</option>
                  <option>800–999</option><option>1000+</option>
                </select>
                {errors.students && <span style={eStyle}>{errors.students}</span>}
              </div>
              <div>
                <label style={lStyle}>School Board <span style={{ fontSize:11, color:"rgba(28,27,23,0.35)", fontWeight:400 }}>(optional)</span></label>
                <select value={form.board} onChange={setField("board")} onFocus={()=>setFocusedField("board")} onBlur={()=>setFocusedField(null)} style={sStyle("board")}>
                  <option value="">Select board…</option>
                  <option>CBSE</option><option>GSEB (Gujarat Board)</option>
                  <option>ICSE / ISC</option><option>IB (International Baccalaureate)</option>
                  <option>Cambridge (IGCSE)</option><option>State Board (Other)</option>
                  <option>Private / Autonomous</option><option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label style={lStyle}>How did you hear about us? <span style={{ fontSize:11, color:"rgba(28,27,23,0.35)", fontWeight:400 }}>(optional)</span></label>
              <select value={form.hear} onChange={setField("hear")} onFocus={()=>setFocusedField("hear")} onBlur={()=>setFocusedField(null)} style={sStyle("hear")}>
                <option value="">Select source…</option>
                <option>Google Search</option><option>WhatsApp / Word of Mouth</option>
                <option>LinkedIn</option><option>Instagram / Facebook</option>
                <option>Another School Recommended</option><option>Newspaper / Advertisement</option>
                <option>Education Conference / Event</option><option>Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3 — Choose Plan */}
        {step === 3 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
              {planOptions.map(opt => {
                const isSelected = form.plan === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setForm(f=>({...f,plan:opt.value}))}
                    style={{ padding:"14px 10px", borderRadius:10, border:`2px solid ${isSelected ? opt.color : "rgba(28,27,23,0.12)"}`,
                      background: isSelected ? `${opt.color}10` : "#FAFAF8", cursor:"pointer", textAlign:"left",
                      transition:"all 0.18s", position:"relative", fontFamily:"'Instrument Sans',sans-serif" }}>
                    {isSelected && <div style={{ position:"absolute", top:-8, right:-8, width:20, height:20, borderRadius:"50%", background:opt.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>}
                    <div style={{ fontSize:14, fontWeight:700, color:isSelected ? opt.color : "#1C1B17", marginBottom:2 }}>{opt.label}</div>
                    <div style={{ fontSize:11, color:"rgba(28,27,23,0.45)", marginBottom:4 }}>{opt.sub}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:isSelected ? opt.color : "rgba(28,27,23,0.6)" }}>{opt.price}</div>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize:12, color:"rgba(28,27,23,0.4)", marginBottom:14, lineHeight:1.6 }}>
              Every plan includes a <strong style={{ color:"rgba(28,27,23,0.6)" }}>free 7-day trial</strong>. Setup: <strong style={{ color:"#2A6B4A" }}>₹45,000</strong> (normally ₹75,000).
            </p>
            <div>
              <label style={lStyle}>Anything you'd like us to know? <span style={{ fontSize:11, color:"rgba(28,27,23,0.35)", fontWeight:400 }}>(optional)</span></label>
              <textarea placeholder="Current system, pain points, questions…" value={form.message} onChange={setField("message")} onFocus={()=>setFocusedField("message")} onBlur={()=>setFocusedField(null)}
                rows={3} style={{ ...iStyle("message"), resize:"vertical", minHeight:80, lineHeight:1.65 }} />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display:"flex", gap:10, marginTop:24 }}>
          {step > 1 && (
            <button onClick={() => setStep(s=>s-1)}
              style={{ padding:"12px 20px", background:"transparent", border:"1.5px solid rgba(28,27,23,0.18)", borderRadius:9, fontSize:14, fontWeight:500, cursor:"pointer", color:"#1C1B17", fontFamily:"'Instrument Sans',sans-serif" }}>
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={nextStep}
              style={{ flex:1, padding:"13px 24px", background:"#1C1B17", color:"#F7F5EF", border:"none", borderRadius:9, fontSize:15, fontWeight:700, fontFamily:"'Instrument Sans',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
              onMouseEnter={e=>e.currentTarget.style.background="#2A6B4A"} onMouseLeave={e=>e.currentTarget.style.background="#1C1B17"}>
              Continue <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={status==="sending"}
              style={{ flex:1, padding:"13px 24px", background:status==="sending" ? "rgba(28,27,23,0.5)" : "#1C1B17", color:"#F7F5EF", border:"none", borderRadius:9, fontSize:15, fontWeight:700, fontFamily:"'Instrument Sans',sans-serif", cursor:status==="sending" ? "not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
              onMouseEnter={e=>{ if(status!=="sending") e.currentTarget.style.background="#2A6B4A"; }} onMouseLeave={e=>{ if(status!=="sending") e.currentTarget.style.background="#1C1B17"; }}>
              {status==="sending" ? "Sending…" : <>Book My Free Demo <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
            </button>
          )}
        </div>
        <p style={{ fontSize:12, color:"rgba(28,27,23,0.38)", textAlign:"center", marginTop:12, lineHeight:1.7 }}>🔒 Your information is never shared with third parties.</p>
      </div>
    </div>
  );
};

/* ─── Privacy & Terms Pages ─── */
const PrivacyPolicy = ({ onBack }) => {
  useEffect(() => { document.title = "Privacy Policy | Nova Teach"; }, []);
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"120px 6% 80px", background:"#F7F5EF", minHeight:"100vh" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#2A6B4A", cursor:"pointer", marginBottom:24, fontSize:14 }}>← Back to Home</button>
      <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"2.8rem", marginBottom:24 }}>Privacy Policy</h1>
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:32, boxShadow:"0 4px 24px rgba(28,27,23,0.06)", lineHeight:1.8, color:"rgba(28,27,23,0.7)" }}>
        <p style={{ marginBottom:16 }}><strong>Last Updated:</strong> June 1, 2026</p>
        <p style={{ marginBottom:16 }}>When you sign in using Google OAuth, we collect: name, email address, and profile picture. This is used only for authentication, demo account creation, platform access, and support. We never sell or share your data. Contact: <a href="mailto:tishy5327@gmail.com" style={{ color:"#2A6B4A" }}>tishy5327@gmail.com</a></p>
      </div>
    </div>
  );
};

const TermsOfService = ({ onBack }) => {
  useEffect(() => { document.title = "Terms of Service | Nova Teach"; }, []);
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"120px 6% 80px", background:"#F7F5EF", minHeight:"100vh" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#2A6B4A", cursor:"pointer", marginBottom:24, fontSize:14 }}>← Back to Home</button>
      <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"2.8rem", marginBottom:24 }}>Terms of Service</h1>
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:32, boxShadow:"0 4px 24px rgba(28,27,23,0.06)", lineHeight:1.8, color:"rgba(28,27,23,0.7)" }}>
        <p style={{ marginBottom:16 }}><strong>Last Updated:</strong> June 1, 2026</p>
        <ol style={{ marginLeft:24 }}>
          {["Platform is for demonstration, educational, and management purposes.","Users must not misuse, disrupt, copy, or gain unauthorized access.","Demo access may be limited or revoked at any time.","All IP belongs to Nova Teach ERP.","We are not liable for service interruptions.","Continued use indicates acceptance."].map((t,i) => <li key={i} style={{ marginBottom:8 }}>{t}</li>)}
        </ol>
        <p style={{ marginTop:16 }}>Contact: <a href="mailto:tishy5327@gmail.com" style={{ color:"#2A6B4A" }}>tishy5327@gmail.com</a></p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const fn = () => setCurrentHash(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  const navigateTo = (path) => { window.location.hash = path; };

  if (currentHash === "/privacy-policy") return <PrivacyPolicy onBack={() => navigateTo("/")} />;
  if (currentHash === "/terms") return <TermsOfService onBack={() => navigateTo("/")} />;

  /* ── State ── */
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
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        setUser(fu);
        const ref = doc(db, "users", fu.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          const exp = new Date(); exp.setDate(exp.getDate() + 7);
          await setDoc(ref, { uid:fu.uid, displayName:fu.displayName, email:fu.email, photoURL:fu.photoURL, firstLoginDate:new Date().toISOString(), trialExpiryDate:exp.toISOString(), lastLogin:new Date().toISOString() });
          setTrialExpiry(exp);
        } else {
          setTrialExpiry(new Date(snap.data().trialExpiryDate));
        }
        setShowDemoModal(true);
      } else { setUser(null); setTrialExpiry(null); setShowDemoModal(false); }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    try { await signInWithPopup(auth, googleProvider); }
    catch (err) { console.error(err); alert("Sign in failed. Please try again."); }
  };
  const handleSignOut = async () => { await signOut(auth); setShowDemoModal(false); };

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
    document.title = "School ERP Software in India | AI Attendance, Fees & Analytics | Nova Teach";
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); setMenuOpen(false); };
  const plan = PLANS.find(p => p.id === selectedPlan);

  const faqs = [
    { q:"What is School ERP Software?",            a:"School ERP integrates all school operations — attendance, exams, fees, assignments, communication, and analytics — into one system. NexaAttend is a complete ERP built for Indian schools, working offline-first with AI face recognition." },
    { q:"How does attendance management work?",    a:"AI face recognition marks 30 students in under 60 seconds, works 100% offline, eliminates proxy attendance, and auto-syncs to parent WhatsApp and reports." },
    { q:"How does fee management work?",           a:"Track collections, dues, and payment history in real time. Send automated WhatsApp reminders. Reduce fee leakage by up to 95%." },
    { q:"Does it work without internet?",          a:"Yes — NexaAttend is offline-first. All recognition and data storage happen on your own computer. Internet is optional, only for cloud backups." },
    { q:"How long does setup take?",               a:"Our team completes full installation, camera setup, and staff training in 3 days. No IT department needed." },
    { q:"How accurate is face recognition?",       a:"99%+ accuracy under normal lighting. Handles glasses, hair changes, and varying conditions. Rigorously tested before handover." },
    { q:"What does the setup fee cover?",          a:"On-site installation, camera configuration, face data enrollment for all students and staff, admin training, and 3-day handover support." },
    { q:"What is the 7-day guarantee?",            a:"Use NexaAttend for 7 days. If it doesn't save time and reduce errors — full refund, no conditions." },
    { q:"What happens to student data?",           a:"Your data never leaves your premises. Stored on your own computer — not on any cloud. Complete ownership." },
    { q:"What cameras does it require?",           a:"Every plan includes 2 cameras. Any webcam or IP camera works. Extra cameras available at ₹15,000 per camera (one-time)." },
  ];

  return (
    <div style={{ fontFamily:"'Instrument Sans','DM Sans',sans-serif", background:"#F7F5EF", color:"#1C1B17", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#2A6B4A;border-radius:2px}
        .serif{font-family:'Instrument Serif',Georgia,serif}
        .mono{font-family:'JetBrains Mono',monospace}
        .sec{padding:88px 6%}
        .pill{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;padding:5px 13px;border-radius:100px;margin-bottom:20px}
        .pill-green{color:#1B5C3A;background:rgba(42,107,74,.1)}
        .pill-dark{color:rgba(247,245,239,.5);background:rgba(247,245,239,.08)}
        .pill-hero{color:rgba(247,245,239,.9);background:rgba(247,245,239,.12);border:1px solid rgba(247,245,239,.18);backdrop-filter:blur(8px)}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;background:#1C1B17;color:#F7F5EF;border:none;border-radius:6px;padding:13px 22px;font-family:'Instrument Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .22s;text-decoration:none}
        .btn-primary:hover{background:#2A6B4A;transform:translateY(-1px);box-shadow:0 10px 28px rgba(42,107,74,.28)}
        .btn-secondary{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#1C1B17;border:1.5px solid rgba(28,27,23,.2);border-radius:6px;padding:12px 20px;font-family:'Instrument Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .22s;text-decoration:none}
        .btn-secondary:hover{border-color:#1C1B17;background:rgba(28,27,23,.04)}
        .btn-hero-primary{display:inline-flex;align-items:center;gap:10px;background:#F7F5EF;color:#1C1B17;border:none;border-radius:8px;padding:14px 26px;font-family:'Instrument Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s cubic-bezier(.16,1,.3,1);text-decoration:none;box-shadow:0 2px 24px rgba(28,27,23,.18),0 1px 4px rgba(28,27,23,.12)}
        .btn-hero-primary:hover{background:#fff;transform:translateY(-2px);box-shadow:0 12px 40px rgba(28,27,23,.22)}
        .btn-hero-secondary{display:inline-flex;align-items:center;gap:10px;background:rgba(247,245,239,.1);color:rgba(247,245,239,.9);border:1.5px solid rgba(247,245,239,.28);border-radius:8px;padding:13px 24px;font-family:'Instrument Sans',sans-serif;font-size:15px;font-weight:500;cursor:pointer;transition:all .25s;text-decoration:none;backdrop-filter:blur(12px)}
        .btn-hero-secondary:hover{background:rgba(247,245,239,.18);border-color:rgba(247,245,239,.5);transform:translateY(-1px)}
        .card{background:#FFFFFF;border:1px solid rgba(28,27,23,.07);border-radius:12px;padding:24px;transition:box-shadow .3s,transform .3s}
        .card:hover{box-shadow:0 6px 32px rgba(28,27,23,.07);transform:translateY(-2px)}
        .nav-link{font-size:13px;font-weight:500;color:rgba(28,27,23,.55);cursor:pointer;border:none;background:none;font-family:'Instrument Sans',sans-serif;transition:color .2s;padding:0}
        .nav-link:hover{color:#1C1B17}
        @keyframes floatCard{0%{transform:translateY(0)rotate(.2deg)}33%{transform:translateY(-10px)rotate(-.15deg)}66%{transform:translateY(-5px)rotate(.1deg)}100%{transform:translateY(0)rotate(.2deg)}}
        @keyframes heroFadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroPillIn{from{opacity:0;transform:translateY(16px)scale(.96)}to{opacity:1;transform:translateY(0)scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes heroGradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fsi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
        @keyframes counterPop{0%{transform:scale(1)}50%{transform:scale(1.06)}100%{transform:scale(1)}}
        .hero-pill-anim{opacity:0;animation:heroPillIn .7s cubic-bezier(.16,1,.3,1) .1s forwards}
        .hero-h1-anim{opacity:0;animation:heroFadeUp .9s cubic-bezier(.16,1,.3,1) .22s forwards}
        .hero-sub-anim{opacity:0;animation:heroFadeUp .8s cubic-bezier(.16,1,.3,1) .38s forwards}
        .hero-cta-anim{opacity:0;animation:heroFadeUp .8s cubic-bezier(.16,1,.3,1) .52s forwards}
        .hero-badges-anim{opacity:0;animation:heroFadeUp .8s cubic-bezier(.16,1,.3,1) .66s forwards}
        .hero-card-anim{opacity:0;animation:heroFadeUp 1s cubic-bezier(.16,1,.3,1) .48s forwards}
        .glass-card{background:rgba(255,255,255,.88);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);border:1px solid rgba(255,255,255,.6);border-radius:18px;box-shadow:0 32px 80px rgba(10,9,8,.28),0 8px 24px rgba(10,9,8,.14),0 1px 0 rgba(255,255,255,.9) inset;overflow:hidden;animation:floatCard 7s ease-in-out infinite;will-change:transform}
        .pdot{animation:pdot 2s ease-in-out infinite}
        .log-row{animation:fsi .4s ease forwards}
        .ticker-inner{display:flex;gap:52px;animation:ticker 26s linear infinite;width:max-content}
        .hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#0f1f18 0%,#152b20 20%,#0e1e17 40%,#122518 60%,#0b1a13 80%,#0f1f18 100%);background-size:300% 300%;animation:heroGradientShift 14s ease infinite;z-index:0}
        .hero-grid{position:absolute;inset:0;z-index:1;pointer-events:none;background-image:linear-gradient(rgba(90,200,122,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(90,200,122,.04) 1px,transparent 1px);background-size:52px 52px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)}
        .hero-glow{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse 55% 45% at 28% 55%,rgba(42,107,74,.22) 0%,transparent 65%),radial-gradient(ellipse 35% 35% at 75% 30%,rgba(90,200,122,.09) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 15% 85%,rgba(27,77,62,.15) 0%,transparent 55%)}
        .hero-content{position:relative;z-index:3}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
        .g4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px}
        .mmenu{position:fixed;top:0;left:0;right:0;bottom:0;z-index:90;background:rgba(247,245,239,.98);backdrop-filter:blur(24px);padding:80px 6% 32px;overflow-y:auto;transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column}
        .mmenu.open{transform:translateX(0)}
        .mlink{font-size:22px;font-weight:500;color:#1C1B17;padding:18px 0;border-bottom:1px solid rgba(28,27,23,.07);background:none;border-left:none;border-right:none;border-top:none;cursor:pointer;text-align:left;font-family:'Instrument Sans',sans-serif;transition:color .2s}
        .mlink:hover{color:#2A6B4A}
        .faq-item{border-bottom:1px solid rgba(28,27,23,.08)}
        .faq-q{width:100%;text-align:left;padding:20px 0;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;font-family:'Instrument Sans',sans-serif;font-size:15px;font-weight:500;color:#1C1B17}
        .faq-a{padding:0 0 20px;font-size:14px;line-height:1.85;color:rgba(28,27,23,.6)}
        .plan-btn{padding:10px 28px;border-radius:100px;font-size:14px;font-weight:600;cursor:pointer;transition:all .22s;font-family:'Instrument Sans',sans-serif;display:inline-flex;align-items:center;gap:8px}
        .plan-btn-active{background:#2A6B4A;color:#F7F5EF;border:2px solid #2A6B4A}
        .plan-btn-inactive{background:#FFFFFF;color:rgba(28,27,23,.6);border:1.5px solid rgba(28,27,23,.14)}
        .plan-btn-inactive:hover{border-color:rgba(28,27,23,.3);color:#1C1B17}
        .compare-row:hover td{background:rgba(42,107,74,.04)!important}
        @media(max-width:900px){.g3{grid-template-columns:1fr 1fr!important}.g4{grid-template-columns:1fr 1fr!important}}
        @media(max-width:640px){.sec{padding:56px 5%!important}.g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr!important}.g4{grid-template-columns:1fr 1fr!important}.hero-h{font-size:clamp(2.2rem,9vw,2.8rem)!important}.hero-pad{padding:110px 5% 64px!important;min-height:auto!important}.hide-mob{display:none!important}.flex-cta{flex-direction:column!important}.hbg{display:flex!important}}
        @media(min-width:641px){.hbg{display:none!important}}
      `}</style>

      {/* Mobile Menu */}
      <div className={`mmenu ${menuOpen ? "open" : ""}`}>
        {[["problem","Why NexaAttend"],["demo-video","Watch Demo"],["solution","Platform"],["pricing","Pricing"],["process","How It Works"],["trust","Trust & Guarantee"],["inquiry","Book Demo"]].map(([id,label]) => (
          <button key={id} className="mlink" onClick={() => scrollTo(id)}>{label}</button>
        ))}
        <div style={{ marginTop:"auto", paddingTop:28 }}>
          <a href="https://wa.me/919974724656" style={{ display:"flex", alignItems:"center", gap:10, fontSize:18, fontWeight:600, color:"#1C1B17", textDecoration:"none", marginBottom:14 }}>
            <span style={{ width:36, height:36, borderRadius:8, background:"rgba(37,211,102,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>💬</span>WhatsApp Us
          </a>
          <a href="tel:+919974724656" style={{ display:"flex", alignItems:"center", gap:10, fontSize:18, fontWeight:600, color:"#1C1B17", textDecoration:"none" }}>
            <span style={{ width:36, height:36, borderRadius:8, background:"rgba(28,27,23,.06)", display:"flex", alignItems:"center", justifyContent:"center" }}>📞</span>+91 99747 24656
          </a>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding: navScrolled ? "11px 6%" : "18px 6%",
        background: navScrolled || menuOpen ? "rgba(247,245,239,.95)" : "transparent",
        backdropFilter: navScrolled || menuOpen ? "blur(24px)" : "none",
        borderBottom: navScrolled || menuOpen ? "1px solid rgba(28,27,23,.07)" : "none",
        transition:"all .38s ease", display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => scrollTo("hero")}>
          <div style={{ width:32, height:32, background:"#2A6B4A", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 5l2-2M13.5 9l2.5.5" stroke="#F7F5EF" strokeWidth="1.2" strokeLinecap="round" opacity=".55"/></svg>
          </div>
          <div>
            <div className="serif" style={{ fontSize:17, lineHeight:1.1, letterSpacing:"-.01em", color: navScrolled ? "#1C1B17" : "#F7F5EF" }}>NexaAttend</div>
            <div style={{ fontSize:9, letterSpacing:".14em", textTransform:"uppercase", color: navScrolled ? "#2A6B4A" : "rgba(247,245,239,.6)", fontWeight:600 }}>Complete School ERP</div>
          </div>
        </div>
        <div className="hide-mob" style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[["problem","Why NexaAttend"],["demo-video","Watch Demo"],["pricing","Pricing"],["process","How It Works"],["trust","Guarantee"]].map(([id,label]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)} style={{ color: navScrolled ? "rgba(28,27,23,.55)" : "rgba(247,245,239,.7)" }}>{label}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <a href="tel:+919974724656" className="btn-secondary hide-mob" style={{ padding:"8px 14px", fontSize:13, background: navScrolled ? "transparent" : "rgba(247,245,239,.1)", color: navScrolled ? "#1C1B17" : "rgba(247,245,239,.85)", border: navScrolled ? "1.5px solid rgba(28,27,23,.2)" : "1.5px solid rgba(247,245,239,.24)", backdropFilter: navScrolled ? "none" : "blur(8px)" }}>+91 99747 24656</a>
          <button className="btn-primary" onClick={() => scrollTo("inquiry")} style={{ padding:"9px 17px", fontSize:13, background: navScrolled ? "#1C1B17" : "#F7F5EF", color: navScrolled ? "#F7F5EF" : "#1C1B17" }}>Book Free Demo</button>
          <button className="hbg" onClick={() => setMenuOpen(o => !o)} style={{ background: navScrolled ? "none" : "rgba(247,245,239,.1)", border: navScrolled ? "1.5px solid rgba(28,27,23,.18)" : "1.5px solid rgba(247,245,239,.24)", cursor:"pointer", padding:"7px 9px", borderRadius:6, alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
            {menuOpen
              ? <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke={navScrolled?"#1C1B17":"#F7F5EF"} strokeWidth="1.8" strokeLinecap="round"/></svg>
              : <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 4.5h14M2 9h14M2 13.5h14" stroke={navScrolled?"#1C1B17":"#F7F5EF"} strokeWidth="1.8" strokeLinecap="round"/></svg>}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main id="hero" className="hero-pad" style={{ minHeight:"100vh", padding:"130px 6% 80px", position:"relative", overflow:"hidden" }}>
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="g2" style={{ maxWidth:1200, margin:"0 auto", gap:64, alignItems:"center" }}>
            <div>
              <div className="hero-pill-anim">
                <div className="pill pill-hero" style={{ marginBottom:22 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#5AC87A" }} className="pdot" />
                  Complete School ERP · AI-Powered
                </div>
              </div>
              <h1 className="serif hero-h hero-h1-anim" style={{ fontSize:"clamp(2.6rem,4.8vw,4rem)", lineHeight:1.05, letterSpacing:"-.025em", marginBottom:22, color:"#F7F5EF", textShadow:"0 2px 32px rgba(10,9,8,.35)" }}>
                Your Entire School,<br />Managed From<br /><em style={{ color:"#5AC87A", fontStyle:"italic" }}>One System.</em>
              </h1>
              <p className="hero-sub-anim" style={{ fontSize:16, lineHeight:1.85, color:"rgba(247,245,239,.72)", maxWidth:460, marginBottom:30 }}>
                NexaAttend is a complete School ERP — attendance, staff, payroll, reports, and parent communication — powered by AI face recognition that works 100% offline.
              </p>
              <div className="flex-cta hero-cta-anim" style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:36 }}>
                <button className="btn-hero-primary" onClick={() => scrollTo("inquiry")}>
                  Get Free Trial
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="btn-hero-secondary" onClick={() => scrollTo("solution")}>See the Platform</button>
                <button className="btn-hero-primary" onClick={handleGoogleSignIn} style={{ background:"#5AC87A", color:"#1C1B17" }}>
                  🚀 Experience Demo
                </button>
              </div>
              <div className="hero-badges-anim" style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {[["🔒","100% offline"],["⚡","3-day setup"],["🛡️","7-day guarantee"],["🏫","Made for India"]].map(([icon,text]) => (
                  <div key={text} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, fontWeight:500, color:"rgba(247,245,239,.62)", background:"rgba(247,245,239,.08)", border:"1px solid rgba(247,245,239,.14)", backdropFilter:"blur(8px)", borderRadius:100, padding:"5px 12px" }}>
                    <span>{icon}</span>{text}
                  </div>
                ))}
              </div>
            </div>
            <div className="hide-mob hero-card-anim">
              <div className="glass-card">
                <div style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 16px", borderBottom:"1px solid rgba(28,27,23,.07)", background:"rgba(250,250,248,.85)" }}>
                  {["#F05A5A","#F0B45A","#5AF07A"].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:c }} />)}
                  <span className="mono" style={{ fontSize:10, color:"rgba(28,27,23,.32)", marginLeft:8 }}>nexaattend — live dashboard</span>
                  <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#3DC87A" }} className="pdot" />
                    <span className="mono" style={{ fontSize:9, color:"#1B7A45", fontWeight:600, letterSpacing:".08em" }}>LIVE</span>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"rgba(250,250,248,.7)", borderBottom:"1px solid rgba(28,27,23,.06)" }}>
                  {[{l:"Present",v:"284",c:"#1B7A45"},{l:"Late",v:"12",c:"#9A6B0A"},{l:"Absent",v:"8",c:"#8A2A1A"}].map(s => (
                    <div key={s.l} style={{ padding:"14px 10px", textAlign:"center", borderRight:"1px solid rgba(28,27,23,.06)" }}>
                      <div className="serif" style={{ fontSize:28, color:s.c, lineHeight:1 }}>{s.v}</div>
                      <div className="mono" style={{ fontSize:9, color:"rgba(28,27,23,.38)", marginTop:3, textTransform:"uppercase", letterSpacing:".06em" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"12px 14px 14px", background:"rgba(255,255,255,.6)" }}>
                  <div className="mono" style={{ fontSize:9, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(28,27,23,.28)", marginBottom:8 }}>Recognition Log</div>
                  {logs.slice(0, logIndex).map((log,i) => (
                    <div key={i} className="log-row" style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 7px", borderRadius:4, background:i%2===0?"rgba(28,27,23,.02)":"transparent", marginBottom:1 }}>
                      <span className="mono" style={{ color:"rgba(28,27,23,.25)", minWidth:52, fontSize:10 }}>{log.time}</span>
                      <span className="mono" style={{ color:"#1C1B17", fontWeight:500, flex:1, fontSize:12 }}>{log.name}</span>
                      <span className="mono" style={{ color:"rgba(28,27,23,.32)", fontSize:10 }}>{log.cls}</span>
                      <span className="mono" style={{ fontSize:9, textTransform:"uppercase", letterSpacing:".06em", fontWeight:700,
                        color:log.status==="present"?"#1B7A45":log.status==="late"?"#9A6B0A":"#8A2A1A" }}>{log.status}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"10px 14px", background:"rgba(42,107,74,.08)", borderTop:"1px solid rgba(28,27,23,.05)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, color:"rgba(28,27,23,.45)" }}>Today's attendance rate</span>
                  <span className="serif" style={{ fontSize:18, color:"#1B7A45", fontWeight:700 }}>96.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:80, zIndex:3, background:"linear-gradient(to bottom,transparent,#1C1B17)", pointerEvents:"none" }} />
      </main>

      {/* ── Ticker ── */}
      <div style={{ background:"#1C1B17", padding:"13px 0", overflow:"hidden" }}>
        <div className="ticker-inner">
          {[...Array(2)].flatMap(() => ["◆ Works 100% Offline","◆ AI Face Recognition","◆ 3-Day Setup","◆ Student + Staff + Payroll","◆ 7-Day Money-Back Guarantee","◆ No ID Cards Needed","◆ Built for Indian Schools","◆ Data Never Leaves Your Premises","◆ Free Lifetime Updates","◆ Ahmedabad-Based Team"])
            .map((item,i) => <span key={i} className="mono" style={{ fontSize:10, letterSpacing:".14em", color:"rgba(247,245,239,.55)", whiteSpace:"nowrap", textTransform:"uppercase" }}>{item}</span>)}
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div style={{ background:"#FFFFFF", borderTop:"1px solid rgba(28,27,23,.06)", borderBottom:"1px solid rgba(28,27,23,.06)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 6%", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:32, textAlign:"center" }}>
          {[
            { target:500, suffix:"+", label:"Schools Onboarded",   color:"#1B4D3E" },
            { target:250000, suffix:"+", label:"Students Managed", color:"#1A2B4A" },
            { target:99, suffix:"%",  label:"Face Recog. Accuracy",color:"#3D1A4A" },
            { target:3, suffix:" days", label:"Average Setup Time", color:"#4A2B0A" },
          ].map((s,i) => (
            <FadeIn key={i} delay={i*0.1}>
              <div>
                <div className="serif" style={{ fontSize:"clamp(2rem,4vw,3rem)", color:s.color, lineHeight:1, marginBottom:6, fontWeight:700 }}>
                  <AnimatedNumber target={s.target} suffix={s.suffix} />
                </div>
                <div style={{ fontSize:13, color:"rgba(28,27,23,.5)", fontWeight:500 }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── Demo Video ── */}
      <section id="demo-video" style={{ background:"#1C1B17", padding:"80px 6% 88px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:800, height:400, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(42,107,74,.13),transparent 70%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1000, margin:"0 auto", position:"relative" }}>
          <FadeIn style={{ textAlign:"center", marginBottom:48 }}>
            <div className="pill pill-dark" style={{ justifyContent:"center" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#5AC87A" }} className="pdot" />
              Live Product Demo
            </div>
            <h2 className="serif" style={{ fontSize:"clamp(1.9rem,4vw,3rem)", lineHeight:1.08, letterSpacing:"-.022em", color:"#F7F5EF", marginBottom:14 }}>
              See NexaAttend<br /><em style={{ color:"#5AC87A", fontStyle:"italic" }}>in action.</em>
            </h2>
            <p style={{ fontSize:15, color:"rgba(247,245,239,.5)", maxWidth:480, margin:"0 auto", lineHeight:1.85 }}>A real walkthrough of the portal — login, dashboard, attendance marking, and reports.</p>
          </FadeIn>
          <FadeIn delay={0.1}><DemoVideoPlayer /></FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginTop:36 }}>
              {[{icon:"🎯",label:"Portal Login",desc:"Secure role-based access"},{icon:"📊",label:"Live Dashboard",desc:"Real-time attendance data"},{icon:"🤳",label:"Face Recognition",desc:"AI marks students instantly"},{icon:"📋",label:"Instant Reports",desc:"One-click PDF exports"}].map((f,i) => (
                <div key={i} style={{ background:"rgba(247,245,239,.04)", border:"1px solid rgba(247,245,239,.08)", borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#F7F5EF", marginBottom:2 }}>{f.label}</div>
                    <div style={{ fontSize:11.5, color:"rgba(247,245,239,.38)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Problem ── */}
      <section id="problem" className="sec" style={{ background:"#F7F5EF" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <FadeIn>
            <div className="pill pill-green">The Problem</div>
            <h2 className="serif" style={{ fontSize:"clamp(1.8rem,4vw,3rem)", lineHeight:1.1, letterSpacing:"-.02em", maxWidth:700, marginBottom:12 }}>
              Manual systems are costing your school more than you realise.
            </h2>
            <p style={{ fontSize:15, color:"rgba(28,27,23,.5)", maxWidth:580, marginBottom:48, lineHeight:1.85 }}>Most Indian schools treat these as unavoidable. They aren't.</p>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            {[
              {n:"01",h:"2–3 hours lost every day",      b:"Teachers spend 15–20 minutes per class calling names. Multiply across every class — that's teaching time permanently gone.", accent:"#8A2A1A"},
              {n:"02",h:"Proxy attendance undetected",    b:"Students mark absent friends 'present'. Registers can't verify faces. Face recognition stops this the first day.", accent:"#9A6B0A"},
              {n:"03",h:"Five disconnected systems",      b:"Register, WhatsApp, Excel payroll, manual fees, printed reports. The data never lines up.", accent:"#1B5C3A"},
              {n:"04",h:"₹3+ Lakh lost to fee leakage",  b:"Late payments, reconciliation errors, and uncollected fees go unnoticed. Schools lose ₹3–5 lakh annually.", accent:"#B85C1A"},
              {n:"05",h:"No accountability for transport",b:"No real-time tracking, no handover verification. Children dropped at wrong stops or left in vehicles.", accent:"#A93226"},
            ].map((p,i) => (
              <FadeIn key={i} delay={i*0.08}>
                <div className="card" style={{ borderTop:`3px solid ${p.accent}` }}>
                  <div className="mono" style={{ fontSize:11, color:p.accent, fontWeight:600, letterSpacing:".1em", marginBottom:14 }}>{p.n}</div>
                  <h3 style={{ fontSize:17, fontWeight:600, lineHeight:1.35, marginBottom:10 }}>{p.h}</h3>
                  <p style={{ fontSize:14, color:"rgba(28,27,23,.54)", lineHeight:1.8 }}>{p.b}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Before / After comparison */}
          <FadeIn delay={0.2}>
            <div style={{ marginTop:56, background:"#FFFFFF", borderRadius:16, border:"1px solid rgba(28,27,23,.07)", overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
                <div style={{ padding:"24px 28px", borderRight:"1px solid rgba(28,27,23,.07)" }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#8A2A1A", marginBottom:16 }}>❌ Before NexaAttend</div>
                  {["15–20 min attendance per class","Proxy attendance goes unnoticed","5 separate tools for everything","Manual fee tracking & leakage","Paper reports take hours","No parent visibility"].map(t=>(
                    <div key={t} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(28,27,23,.05)", alignItems:"center" }}>
                      <span style={{ color:"#8A2A1A", fontSize:16, flexShrink:0 }}>✗</span>
                      <span style={{ fontSize:13.5, color:"rgba(28,27,23,.65)" }}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"24px 28px", background:"rgba(42,107,74,.025)" }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#1B5C3A", marginBottom:16 }}>✓ After NexaAttend</div>
                  {["60 sec for 30 students via AI","Zero proxy — face-verified only","One platform for everything","Automated fee alerts & tracking","One-click PDF reports instantly","Real-time WhatsApp parent alerts"].map(t=>(
                    <div key={t} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(42,107,74,.07)", alignItems:"center" }}>
                      <span style={{ color:"#2A6B4A", fontSize:16, flexShrink:0, fontWeight:700 }}>✓</span>
                      <span style={{ fontSize:13.5, color:"rgba(28,27,23,.75)", fontWeight:500 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Solution ── */}
      <section id="solution" className="sec" style={{ background:"#1C1B17", color:"#F7F5EF", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-120, right:-120, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(42,107,74,.12),transparent 70%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative" }}>
          <FadeIn>
            <div className="pill pill-dark">The Platform</div>
            <h2 className="serif" style={{ fontSize:"clamp(1.9rem,4.5vw,3.4rem)", lineHeight:1.06, letterSpacing:"-.022em", marginBottom:20, color:"#F7F5EF" }}>
              One System That Runs<br /><em style={{ color:"#5AC87A", fontStyle:"italic" }}>Your Entire Institute.</em>
            </h2>
            <p style={{ fontSize:16, color:"rgba(247,245,239,.55)", maxWidth:540, marginBottom:52, lineHeight:1.85 }}>Attendance is just one piece. NexaAttend is a complete ERP — students, staff, payroll, and operations, all in one system.</p>
          </FadeIn>
          <div className="g2" style={{ marginBottom:24 }}>
            {modules.map((mod,i) => (
              <FadeIn key={i} delay={i*0.07}>
                <div style={{ background:"rgba(247,245,239,.04)", border:"1px solid rgba(247,245,239,.09)", borderRadius:12, padding:"28px 26px", transition:"all .3s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(247,245,239,.07)";e.currentTarget.style.borderColor="rgba(247,245,239,.16)"}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(247,245,239,.04)";e.currentTarget.style.borderColor="rgba(247,245,239,.09)"}}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:`${mod.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#5AC87A" }}>{mod.icon}</div>
                    <h3 style={{ fontSize:17, fontWeight:600, color:"#F7F5EF" }}>{mod.title}</h3>
                  </div>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
                    {mod.features.map((f,fi) => (
                      <li key={fi} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                        <span style={{ color:"#5AC87A", flexShrink:0, fontSize:13, marginTop:1 }}>✓</span>
                        <span style={{ fontSize:13.5, color:"rgba(247,245,239,.65)", lineHeight:1.6 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
          {/* All features grid */}
          <FadeIn delay={0.2}>
            <div style={{ background:"rgba(247,245,239,.03)", border:"1px solid rgba(247,245,239,.07)", borderRadius:12, padding:"28px 32px" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(247,245,239,.3)", marginBottom:20 }}>All Modules Included</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"12px 24px" }}>
                {["Student Management","AI Face Attendance","Exam Management","Assignment Tracking","Fee Collection","Payroll Automation","Staff HR","Leave Management","WhatsApp Alerts","Custom Reports","AI Analytics","Offline-First Storage"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13.5, color:"rgba(247,245,239,.55)" }}>
                    <span style={{ color:"#5AC87A", fontWeight:700 }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="sec" style={{ background:"#F7F5EF", position:"relative" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:2 }}>
          <FadeIn style={{ textAlign:"center", marginBottom:48 }}>
            <div className="pill pill-green" style={{ justifyContent:"center" }}>Transparent Pricing · No Hidden Fees</div>
            <h2 className="serif" style={{ fontSize:"clamp(2rem,4.5vw,3.2rem)", lineHeight:1.08, letterSpacing:"-.022em", marginBottom:12 }}>Simple, Flat Pricing</h2>
            <p style={{ fontSize:16, color:"rgba(28,27,23,.58)", maxWidth:480, margin:"0 auto", lineHeight:1.85 }}>One price per school size. No per-student fees. No surprises.</p>
          </FadeIn>
          <FadeIn>
            <div style={{ background:"linear-gradient(135deg,#FFF8E8,#FFFBF0)", border:"1.5px solid #D4A433", borderRadius:12, padding:"14px 20px", marginBottom:36, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <span style={{ fontSize:20 }}>⚡</span>
              <div>
                <strong style={{ fontSize:14, color:"#7A5000" }}>Founding Member Offer: One-time setup ₹75,000 → ₹45,000 on all plans.</strong>
                <span style={{ fontSize:13.5, color:"#9A6B0A" }}> Limited slots. Once filled, returns to ₹75,000 permanently.</span>
              </div>
            </div>
          </FadeIn>
          <FadeIn>
            <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:44, flexWrap:"wrap" }}>
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setSelectedPlan(p.id)} className={`plan-btn ${selectedPlan===p.id?"plan-btn-active":"plan-btn-inactive"}`}>
                  {p.name}
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:".06em", background:selectedPlan===p.id?"rgba(247,245,239,.18)":"rgba(42,107,74,.1)", color:selectedPlan===p.id?"#F7F5EF":"#1B5C3A", padding:"2px 8px", borderRadius:100 }}>⭐</span>
                </button>
              ))}
            </div>
          </FadeIn>
          <FadeIn>
            <div style={{ background:"#FFFFFF", border:`2px solid ${plan.color}22`, borderRadius:20, overflow:"hidden", boxShadow:"0 24px 64px rgba(28,27,23,.07)", marginBottom:24, transition:"all .35s" }}>
              <div style={{ background:plan.color, padding:"28px 36px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:20 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(247,245,239,.45)", marginBottom:6 }}>{plan.name} Plan · Up to {plan.students} students</div>
                  <div className="serif" style={{ fontSize:"clamp(1.2rem,2.5vw,1.7rem)", color:"#F7F5EF", lineHeight:1.2 }}>
                    {plan.id==="basic" ? "Perfect for smaller schools." : plan.id==="standard" ? "The most popular choice. Full ERP." : "For large schools and institutes."}
                  </div>
                </div>
                <div style={{ background:"#5AC87A", color:"#1C1B17", fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", padding:"7px 18px", borderRadius:100, flexShrink:0 }}>⭐ {plan.badge}</div>
              </div>
              <div style={{ padding:"32px 36px", borderBottom:"1px solid rgba(28,27,23,.07)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:20, marginBottom:32 }}>
                  <div style={{ background:"rgba(28,27,23,.02)", borderRadius:12, padding:"20px 22px", border:"1px solid rgba(28,27,23,.05)" }}>
                    <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(28,27,23,.38)", marginBottom:8 }}>Monthly Fee</div>
                    <div className="serif" style={{ fontSize:40, color:"#1C1B17", lineHeight:1, marginBottom:4 }}>{fmt(plan.monthly)}</div>
                    <div style={{ fontSize:12, color:"#1B7A45", fontWeight:600, marginTop:10 }}>≈ ₹{Math.round(plan.monthly/plan.students)}/student</div>
                  </div>
                  <div style={{ background:"rgba(42,107,74,.04)", borderRadius:12, padding:"20px 22px", border:"1px solid rgba(42,107,74,.15)", position:"relative" }}>
                    <div style={{ position:"absolute", top:-10, right:16, background:"#2A6B4A", color:"#F7F5EF", fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:100 }}>SAVE ₹30,000</div>
                    <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(28,27,23,.38)", marginBottom:8 }}>One-Time Setup</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                      <div className="serif" style={{ fontSize:40, color:"#2A6B4A", lineHeight:1 }}>{fmt(plan.setupDiscounted)}</div>
                      <div className="serif" style={{ fontSize:18, color:"rgba(28,27,23,.3)", textDecoration:"line-through" }}>{fmt(plan.setup)}</div>
                    </div>
                    <div style={{ fontSize:12, color:"#1B7A45", fontWeight:600, marginTop:10 }}>Founding member price</div>
                  </div>
                  <div style={{ background:"rgba(28,27,23,.02)", borderRadius:12, padding:"20px 22px", border:"1px solid rgba(28,27,23,.05)" }}>
                    <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(28,27,23,.38)", marginBottom:14 }}>Always Included</div>
                    {[["👤",`Up to ${plan.students} students`],["📷","2 cameras"],["🛠️","3-day setup"],["🛡️","7-day guarantee"]].map(([icon,text]) => (
                      <div key={text} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, fontSize:13, color:"rgba(28,27,23,.65)" }}>
                        <span style={{ fontSize:14 }}>{icon}</span>{text}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"8px 24px" }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13.5, color:"rgba(28,27,23,.7)" }}>
                      <span style={{ color:"#2A6B4A", fontWeight:700, flexShrink:0, marginTop:1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:"22px 36px", background:"rgba(28,27,23,.015)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                <div style={{ fontSize:13.5, color:"rgba(28,27,23,.5)", lineHeight:1.7 }}>7-day money-back guarantee · No lock-in · Free 7-day trial first</div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <a href="https://wa.me/919974724656" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#1C1B17", color:"#F7F5EF", borderRadius:8, padding:"12px 22px", fontFamily:"'Instrument Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer", textDecoration:"none" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#2A6B4A"} onMouseLeave={e=>e.currentTarget.style.background="#1C1B17"}>
                    💬 WhatsApp for {plan.name}
                  </a>
                  <button onClick={() => scrollTo("inquiry")} style={{ display:"inline-flex", alignItems:"center", gap:8, background:"transparent", color:"#1C1B17", border:"1.5px solid rgba(28,27,23,.2)", borderRadius:8, padding:"11px 20px", fontFamily:"'Instrument Sans',sans-serif", fontSize:14, fontWeight:500, cursor:"pointer" }}>
                    Book Free Demo →
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
          {/* Guarantee card */}
          <FadeIn>
            <div style={{ background:"#FFFFFF", border:"2px solid rgba(42,107,74,.18)", borderRadius:16, padding:"28px 32px", display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:44, lineHeight:1, flexShrink:0 }}>🛡️</span>
              <div style={{ flex:1 }}>
                <h3 className="serif" style={{ fontSize:20, color:"#1C1B17", marginBottom:6 }}>7-Day Performance Guarantee</h3>
                <p style={{ fontSize:14, color:"rgba(28,27,23,.58)", lineHeight:1.75, margin:0 }}>
                  Use NexaAttend for 7 days. If it doesn't measurably save staff time, reduce attendance errors, and simplify daily operations — full refund. No conditions, no fine print, no paperwork.
                </p>
              </div>
              <button onClick={() => scrollTo("inquiry")} style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#2A6B4A", color:"#F7F5EF", border:"none", borderRadius:8, padding:"13px 22px", fontFamily:"'Instrument Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}
                onMouseEnter={e=>e.currentTarget.style.background="#1B4D3E"} onMouseLeave={e=>e.currentTarget.style.background="#2A6B4A"}>
                Start Free Trial →
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="process" className="sec" style={{ background:"#FFFFFF" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <FadeIn>
            <div className="pill pill-green">How It Works</div>
            <h2 className="serif" style={{ fontSize:"clamp(1.8rem,3.8vw,2.8rem)", letterSpacing:"-.02em", marginBottom:10 }}>From demo to live in 3 days.</h2>
            <p style={{ fontSize:15, color:"rgba(28,27,23,.5)", marginBottom:48, lineHeight:1.8 }}>We handle everything. You make one decision.</p>
          </FadeIn>
          <div className="g4" style={{ gap:24 }}>
            {[
              {step:"01",icon:"📞",title:"Book a Free Demo",     body:"WhatsApp or call us. We'll visit your school or connect online — no cost, no commitment, no pressure."},
              {step:"02",icon:"🛠️",title:"Free 7-Day Trial",     body:"We install NexaAttend and run a live trial with your actual students and staff. You see the numbers yourself."},
              {step:"03",icon:"✓", title:"You Decide",           body:"Trial convinced you? Great. Not sure? Ask more questions. Our 7-day guarantee backs every decision."},
              {step:"04",icon:"🚀",title:"Go Live in 3 Days",    body:"Staff trained. Reports automated. From day four, NexaAttend runs in the background — and just works."},
            ].map((s,i) => (
              <FadeIn key={i} delay={i*0.08}>
                <div>
                  <div style={{ width:48, height:48, borderRadius:12, background:i===3?"#2A6B4A":"rgba(42,107,74,.07)", border:i===3?"none":"1px solid rgba(42,107,74,.15)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18, fontSize:20 }}>{s.icon}</div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:".12em", color:"#2A6B4A", fontWeight:600, marginBottom:8 }}>STEP {s.step}</div>
                  <h3 style={{ fontSize:16, fontWeight:600, marginBottom:8, lineHeight:1.3 }}>{s.title}</h3>
                  <p style={{ fontSize:13.5, color:"rgba(28,27,23,.54)", lineHeight:1.8 }}>{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section id="trust" className="sec" style={{ background:"#F7F5EF" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="g2" style={{ gap:60, alignItems:"center" }}>
            <FadeIn>
              <div className="pill pill-green">Why Trust Us</div>
              <h2 className="serif" style={{ fontSize:"clamp(1.7rem,3.6vw,2.6rem)", lineHeight:1.12, letterSpacing:"-.02em", marginBottom:18 }}>
                Built in Ahmedabad, for Indian schools, by someone who actually visits them.
              </h2>
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
                {["Your data never leaves your school premises — ever","Direct WhatsApp access to the founding developer","7-day money-back guarantee, no conditions","India-based support, not a foreign ticket system","Every onboarding personally overseen by the founder","Works when your internet doesn't — fully offline"].map(t => (
                  <div key={t} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <span style={{ color:"#2A6B4A", fontWeight:700, flexShrink:0, marginTop:1 }}>✓</span>
                    <span style={{ fontSize:14, color:"#1C1B17", lineHeight:1.65 }}>{t}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card" style={{ borderLeft:"4px solid #2A6B4A", borderRadius:"0 12px 12px 0" }}>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"#2A6B4A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>👤</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>Shah Tishya</div>
                    <div className="mono" style={{ fontSize:9, color:"rgba(28,27,23,.38)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>Founder · Nova Teach Solution · Ahmedabad</div>
                    <p style={{ fontSize:13.5, color:"rgba(28,27,23,.6)", lineHeight:1.8, fontStyle:"italic" }}>
                      "I built NexaAttend because I was tired of seeing schools run on 5 disconnected systems when one well-made tool could replace all of them."
                    </p>
                    <div style={{ marginTop:12, display:"flex", gap:8 }}>
                      <a href="https://wa.me/919974724656" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12.5, fontWeight:500, color:"#1B5C3A", textDecoration:"none" }}>💬 WhatsApp directly</a>
                      <span style={{ color:"rgba(28,27,23,.2)" }}>·</span>
                      <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12.5, fontWeight:500, color:"#1B5C3A", textDecoration:"none" }}>
                        <LiIcon /> LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* Testimonials */}
              <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  {name:"Principal Meera Iyer",school:"Sunrise Academy, Pune",quote:"Face recognition has saved our teachers 1.5 hours daily. Proxy attendance dropped to zero.",stars:5},
                  {name:"Ramesh K.",school:"Saraswati Vidyalaya, Ahmedabad",quote:"The offline-first approach is a game changer. Reports are instant.",stars:5},
                ].map((t,i) => (
                  <div key={i} className="card" style={{ background:"#FAFAF8" }}>
                    <div style={{ display:"flex", gap:2, marginBottom:10, color:"#F5B042", fontSize:13 }}>{"★".repeat(t.stars)}</div>
                    <p style={{ fontSize:13, lineHeight:1.7, marginBottom:10, fontStyle:"italic", color:"rgba(28,27,23,.65)" }}>"{t.quote}"</p>
                    <div style={{ fontWeight:600, fontSize:13 }}>{t.name}</div>
                    <div style={{ fontSize:11.5, color:"rgba(28,27,23,.45)" }}>{t.school}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="sec" style={{ background:"#FFFFFF" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <FadeIn style={{ textAlign:"center", marginBottom:44 }}>
            <div className="pill pill-green" style={{ justifyContent:"center" }}>Frequently Asked Questions</div>
            <h2 className="serif" style={{ fontSize:"clamp(1.7rem,3.5vw,2.4rem)", letterSpacing:"-.02em" }}>Everything you need to know</h2>
          </FadeIn>
          <FadeIn>
            {faqs.map((faq,i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setActiveFaq(activeFaq===i ? null : i)}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize:18, color:"rgba(28,27,23,.35)", transition:"transform .22s", transform:activeFaq===i?"rotate(45deg)":"none", flexShrink:0 }}>+</span>
                </button>
                {activeFaq===i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ── Inquiry Form ── */}
      <section id="inquiry" className="sec" style={{ background:"#F7F5EF" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <FadeIn style={{ textAlign:"center", marginBottom:44 }}>
            <div className="pill pill-green" style={{ justifyContent:"center" }}>Free Demo — No Obligation</div>
            <h2 className="serif" style={{ fontSize:"clamp(1.9rem,4vw,3rem)", lineHeight:1.08, letterSpacing:"-.022em", marginBottom:12 }}>Book Your Free School Demo Today.</h2>
            <p style={{ fontSize:15, color:"rgba(28,27,23,.52)", maxWidth:500, margin:"0 auto", lineHeight:1.85 }}>
              We visit your school (or connect online), show you the complete system live, and answer every question — completely free. No contract. No pressure.
            </p>
          </FadeIn>
          <div className="g2" style={{ gap:48, alignItems:"flex-start" }}>
            <FadeIn><InquiryForm /></FadeIn>
            <FadeIn delay={0.1}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {[
                  {icon:"⚡",title:"Response within 24 hours",    body:"We reply to every inquiry personally — by WhatsApp or phone — within one business day."},
                  {icon:"🏫",title:"Demo at your school or online", body:"We visit Ahmedabad schools in person. For other Gujarat cities, we connect live via video call."},
                  {icon:"🛡️",title:"No contract, no commitment",    body:"The demo is free. The 7-day trial is free. You only pay if you're happy to continue."},
                  {icon:"🔒",title:"Your data stays with you",      body:"All student data stored locally on your premises. Nothing goes to any cloud."},
                ].map((t,i) => (
                  <div key={i} style={{ background:"#FFFFFF", border:"1px solid rgba(28,27,23,.07)", borderRadius:12, padding:"20px 22px", display:"flex", gap:14, alignItems:"flex-start" }}>
                    <span style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:"#1C1B17", marginBottom:5 }}>{t.title}</div>
                      <p style={{ fontSize:13, color:"rgba(28,27,23,.52)", lineHeight:1.75, margin:0 }}>{t.body}</p>
                    </div>
                  </div>
                ))}
                <div style={{ background:"#2A6B4A", borderRadius:12, padding:"22px 24px" }}>
                  <div style={{ fontSize:13, color:"rgba(247,245,239,.55)", marginBottom:6, fontWeight:500 }}>Prefer to message directly?</div>
                  <a href="https://wa.me/919974724656" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", marginBottom:12 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.858 1.5 9c0 1.32.337 2.56.928 3.638L1.5 16.5l3.987-.9A7.46 7.46 0 009 16.5c4.142 0 7.5-3.358 7.5-7.5S13.142 1.5 9 1.5z" fill="#25D366" stroke="#25D366" strokeWidth=".5"/><path d="M12.5 10.9c-.2-.1-1.15-.57-1.33-.63-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.22.14-.42.05a5.3 5.3 0 01-2.6-2.28c-.2-.33.2-.31.56-1.04.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.44-.16-.38-.33-.32-.44-.33h-.38c-.13 0-.34.05-.52.25s-.68.67-.68 1.62.7 1.88.79 2.01c.1.13 1.36 2.08 3.3 2.92 1.22.53 1.7.57 2.31.48.37-.06 1.15-.47 1.31-.92.16-.45.16-.84.11-.92-.05-.08-.18-.13-.38-.22z" fill="#fff"/></svg>
                    <span style={{ fontSize:15, fontWeight:600, color:"#F7F5EF" }}>WhatsApp +91 99747 24656</span>
                  </a>
                  <a href="tel:+919974724656" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                    <span style={{ fontSize:16 }}>📞</span>
                    <span style={{ fontSize:14, fontWeight:500, color:"rgba(247,245,239,.75)" }}>+91 99747 24656</span>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Sticky Demo CTA ── */}
      {!showDemoModal && !user && (
        <button onClick={handleGoogleSignIn} style={{
          position:"fixed", bottom:24, right:24, zIndex:99,
          background:"#2A6B4A", color:"#F7F5EF", border:"none", borderRadius:60,
          padding:"12px 20px", fontSize:14, fontWeight:"bold", cursor:"pointer",
          boxShadow:"0 4px 20px rgba(42,107,74,.4), 0 2px 8px rgba(0,0,0,.15)",
          display:"flex", alignItems:"center", gap:8, fontFamily:"'Instrument Sans',sans-serif",
          transition:"all .22s",
        }} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px) scale(1.04)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
          🚀 Experience Demo
        </button>
      )}

      {/* ── Demo Modal ── */}
      {showDemoModal && trialExpiry && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
          <div style={{ background:"#F7F5EF", borderRadius:24, width:"96%", maxWidth:1200, maxHeight:"94vh", overflow:"auto", position:"relative", boxShadow:"0 48px 120px rgba(0,0,0,.5)" }}>
            <DemoDashboard user={user} trialExpiryDate={trialExpiry} onClose={() => setShowDemoModal(false)} onSignOut={handleSignOut} />
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={{ background:"#111110", padding:"48px 6% 28px", color:"#F7F5EF" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div className="g2" style={{ gap:48, paddingBottom:36, borderBottom:"1px solid rgba(247,245,239,.07)" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:28, height:28, background:"#2A6B4A", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div className="serif" style={{ fontSize:16 }}>NexaAttend</div>
                  <div style={{ fontSize:9, letterSpacing:".12em", textTransform:"uppercase", color:"#2A6B4A" }}>by Nova Teach Solution</div>
                </div>
              </div>
              <p style={{ fontSize:13, color:"rgba(247,245,239,.35)", lineHeight:1.85, maxWidth:300 }}>Complete School ERP with AI face recognition. Offline-first. Flat pricing. 7-day guarantee.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
              <div>
                <div className="mono" style={{ fontSize:10, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(247,245,239,.25)", marginBottom:14 }}>Product</div>
                {[["Platform","solution"],["Pricing","pricing"],["How It Works","process"],["Book Demo","inquiry"]].map(([l,id]) => (
                  <div key={l} style={{ marginBottom:10 }}>
                    <button style={{ background:"none", border:"none", color:"rgba(247,245,239,.45)", fontSize:13, cursor:"pointer", padding:0, fontFamily:"'Instrument Sans',sans-serif" }}
                      onMouseEnter={e=>e.target.style.color="#F7F5EF"} onMouseLeave={e=>e.target.style.color="rgba(247,245,239,.45)"}
                      onClick={() => scrollTo(id)}>{l}</button>
                  </div>
                ))}
              </div>
              <div>
                <div className="mono" style={{ fontSize:10, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(247,245,239,.25)", marginBottom:14 }}>Legal & Contact</div>
                {[["Privacy Policy",() => navigateTo("/privacy-policy")],["Terms of Service",() => navigateTo("/terms")]].map(([l,fn]) => (
                  <div key={l} style={{ marginBottom:10 }}>
                    <button onClick={fn} style={{ background:"none", border:"none", color:"rgba(247,245,239,.45)", fontSize:13, cursor:"pointer", padding:0, fontFamily:"'Instrument Sans',sans-serif" }}
                      onMouseEnter={e=>e.target.style.color="#F7F5EF"} onMouseLeave={e=>e.target.style.color="rgba(247,245,239,.45)"}>{l}</button>
                  </div>
                ))}
                <div style={{ fontSize:13, color:"rgba(247,245,239,.35)", lineHeight:2.2, marginTop:12 }}>
                  <div>+91 99747 24656</div><div>Ahmedabad, Gujarat</div>
                </div>
                <a href="https://linkedin.com/company/nova-teach-solutions" target="_blank" rel="noopener noreferrer"
                  style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:7, fontSize:13, color:"rgba(247,245,239,.45)", textDecoration:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#F7F5EF"} onMouseLeave={e=>e.currentTarget.style.color="rgba(247,245,239,.45)"}>
                  <LiIcon /> LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div style={{ paddingTop:22, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <div style={{ fontSize:12, color:"rgba(247,245,239,.22)" }}>© {new Date().getFullYear()} Nova Teach Solution. Founded by Shah Tishya.</div>
            <div style={{ fontSize:12, color:"rgba(247,245,239,.22)" }}>Ahmedabad, Gujarat, India</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
