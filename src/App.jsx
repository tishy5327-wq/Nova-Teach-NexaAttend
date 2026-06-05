import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, onAuthStateChanged, signOut,
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

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxgViYSKbN1zFyISMS2l9xgDQGFE8QQAY7IlWjkEmAouzeO5GZwrLg8HZJevvF3SX4uyQ/exec";

/* ─── Normalize any date format to JS Date ─── */
const toDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();          // Firestore Timestamp
  if (value instanceof Date) return value;           // already a Date
  const d = new Date(value);                         // ISO string or number
  return isNaN(d.getTime()) ? null : d;
};

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

/* ─── DemoDashboard ─── */
const DemoDashboard = ({ user, trialExpiryDate, onClose, onSignOut, isFullPage = false }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [daysLeft, setDaysLeft] = useState(7);
  const [expired, setExpired] = useState(false);
  const [contactStatus, setContactStatus] = useState("idle");
  const [contactForm, setContactForm] = useState({
    schoolName:"", contactPerson:"", mobile:"", email:"", students:"", message:""
  });

  useEffect(() => {
    const expiry = toDate(trialExpiryDate);
    if (!expiry) return;
    const left = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
    if (left <= 0) setExpired(true);
    else setDaysLeft(left);
  }, [trialExpiryDate]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("sending");
    try {
      await addDoc(collection(db, "salesLeads"), {
        ...contactForm, source:"demo_expired", uid:user?.uid, createdAt:serverTimestamp()
      });
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
        <p style={{ color:"rgba(28,27,23,0.55)", marginBottom:28, lineHeight:1.7 }}>
          Contact our team to continue using NexaAttend at your school.
        </p>
        <form onSubmit={handleContactSubmit} style={{ display:"flex", flexDirection:"column", gap:12, textAlign:"left" }}>
          {[["schoolName","School Name"],["contactPerson","Your Name"],["mobile","Mobile Number"],["email","Email"],["students","No. of Students"]].map(([k,p]) => (
            <input key={k} placeholder={p} required value={contactForm[k]}
              onChange={e => setContactForm(f=>({...f,[k]:e.target.value}))}
              style={{ padding:"11px 14px", borderRadius:8, border:"1.5px solid rgba(28,27,23,0.15)", fontSize:14, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }} />
          ))}
          <textarea placeholder="Message (optional)" rows={3} value={contactForm.message}
            onChange={e => setContactForm(f=>({...f,message:e.target.value}))}
            style={{ padding:"11px 14px", borderRadius:8, border:"1.5px solid rgba(28,27,23,0.15)", fontSize:14, resize:"vertical", fontFamily:"'Instrument Sans',sans-serif" }} />
          <button type="submit" disabled={contactStatus==="sending"}
            style={{ padding:"13px", background:"#1C1B17", color:"#F7F5EF", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#2A6B4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, marginBottom:8 }}>We'll be in touch!</h3>
        <p style={{ color:"rgba(28,27,23,0.55)" }}>Our team will call you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height: isFullPage ? "calc(100vh - 62px)" : "90vh", background:"#F7F5EF", borderRadius: isFullPage ? 0 : 24, overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:220, background:"#1C1B17", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"22px 20px 16px", borderBottom:"1px solid rgba(247,245,239,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, background:"#2A6B4A", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/>
                <path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:15, color:"#F7F5EF" }}>NexaAttend</div>
              <div style={{ fontSize:9, letterSpacing:"0.1em", color:"rgba(247,245,239,0.35)", textTransform:"uppercase" }}>Demo Portal</div>
            </div>
          </div>
        </div>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(247,245,239,0.07)" }}>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" style={{ width:32, height:32, borderRadius:"50%", marginBottom:8 }} />
          )}
          <div style={{ fontSize:12, fontWeight:600, color:"#F7F5EF", marginBottom:2 }}>{user?.displayName || "Demo User"}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background: daysLeft > 3 ? "#5AC87A" : "#F59E0B" }} />
            <span style={{ fontSize:10, color:"rgba(247,245,239,0.45)", letterSpacing:"0.04em" }}>{daysLeft}d trial left</span>
          </div>
        </div>
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
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(247,245,239,0.07)" }}>
          <div style={{ background:"rgba(90,200,122,0.1)", border:"1px solid rgba(90,200,122,0.2)", borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
            <div style={{ fontSize:10, color:"rgba(247,245,239,0.5)", marginBottom:4 }}>Sample data only</div>
            <div style={{ fontSize:11, color:"#5AC87A", fontWeight:600 }}>This is a live demo</div>
          </div>
          <button onClick={onSignOut} style={{ width:"100%", padding:"9px", background:"rgba(247,245,239,0.06)", border:"1px solid rgba(247,245,239,0.1)", borderRadius:8, color:"rgba(247,245,239,0.5)", fontSize:12, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
            Sign out
          </button>
          {!isFullPage && (
            <button onClick={onClose} style={{ width:"100%", padding:"9px", background:"transparent", border:"none", color:"rgba(247,245,239,0.3)", fontSize:12, cursor:"pointer", marginTop:4, fontFamily:"'Instrument Sans',sans-serif" }}>
              ✕ Close demo
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflowY:"auto", background:"#F7F5EF" }}>
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
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:24 }}>
                {[
                  { label:"Present Today",   value:`${DemoData.todayAttendance.present}`, sub:`of ${DemoData.todayAttendance.total}`, color:"#1B4D3E" },
                  { label:"Late Today",      value:`${DemoData.todayAttendance.late}`,    sub:"students",   color:"#7A5000" },
                  { label:"Absent Today",    value:`${DemoData.todayAttendance.absent}`,  sub:"students",   color:"#7A1A1A" },
                  { label:"Attendance Rate", value:`${attPct}%`,                          sub:"today",      color:"#1A2B6A" },
                  { label:"Fee Collected",   value:`₹${(DemoData.fees.collected/100000).toFixed(1)}L`, sub:"this month", color:"#1B4D3E" },
                  { label:"Fee Pending",     value:`₹${(DemoData.fees.pending/100000).toFixed(1)}L`,  sub:"outstanding",color:"#7A3A00" },
                ].map((s,i) => (
                  <div key={i} style={{ background:"#FFFFFF", border:"1px solid rgba(28,27,23,0.07)", borderRadius:12, padding:"18px 16px", borderTop:`3px solid ${s.color}` }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"rgba(28,27,23,0.45)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:700, color:s.color, lineHeight:1, fontFamily:"'Instrument Serif',serif" }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"rgba(28,27,23,0.38)", marginTop:4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
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
                      <tr key={i} style={{ borderTop:"1px solid rgba(28,27,23,0.04)" }}>
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
                  {DemoData.students.map((s) => (
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

/* ─── DemoPage: Full-page wrapper ─── */
const DemoPage = ({ user, trialExpiryDate, onSignOut, onBack }) => {
  return (
    <div style={{ minHeight:"100vh", background:"#F7F5EF" }}>
      <div style={{ position:"sticky", top:0, background:"#FFFFFF", borderBottom:"1px solid rgba(28,27,23,0.07)", padding:"12px 28px", display:"flex", alignItems:"center", gap:16, zIndex:20, height:62, boxSizing:"border-box" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#2A6B4A", lineHeight:1 }}>←</button>
        <div>
          <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:18, fontWeight:600 }}>NexaAttend Demo</div>
          <div style={{ fontSize:11, color:"rgba(28,27,23,0.45)" }}>Live trial dashboard</div>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <button onClick={onSignOut} style={{ background:"#1C1B17", color:"#F7F5EF", border:"none", borderRadius:6, padding:"8px 16px", fontSize:13, fontWeight:500, cursor:"pointer" }}>
            Sign Out
          </button>
        </div>
      </div>
      <DemoDashboard
        user={user}
        trialExpiryDate={trialExpiryDate}
        onClose={onBack}
        onSignOut={onSignOut}
        isFullPage={true}
      />
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
    if (!form.name.trim()) errs.name = "Required";
    if (!form.role) errs.role = "Required";
    if (!form.phone.trim() || !/^\+?[\d\s\-]{10,15}$/.test(form.phone.replace(/\s/g,""))) errs.phone = "Valid 10-digit number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    return errs;
  };
  const validateStep2 = () => {
    const errs = {};
    if (!form.school.trim()) errs.school = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.students) errs.students = "Required";
    return errs;
  };

  const nextStep = () => {
    const errs = step===1 ? validateStep1() : validateStep2();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(s => s+1);
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
        {step === 1 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={lStyle}>Full Name <span style={{ color:"#C0392B" }}>*</span></label>
                <input type="text" placeholder="e.g. Rajesh Sharma" value={form.name} onChange={setField("name")} onFocus={()=>setFocusedField("name")} onBlur={()=>setFocusedField(null)} style={iStyle("name")} autoComplete="name" />
                {errors.name && <span style={eStyle}>{errors.name}</span>}
              </div>
              <div>
                <label style={lStyle}>Your Role <span style={{ color:"#C0392B" }}>*</span></label>
                <select value={form.role} onChange={setField("role")} onFocus={()=>setFocusedField("role")} onBlur={()=>setFocusedField(null)} style={sStyle("role")}>
                  <option value="">Select role…</option>
                  <option>Principal / Headmaster</option><option>School Owner / Trustee</option>
                  <option>Administrator</option><option>IT Coordinator</option>
                  <option>Teacher / HOD</option><option>Finance Manager</option><option>Other</option>
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
                  <option>CBSE</option><option>GSEB (Gujarat Board)</option><option>ICSE / ISC</option>
                  <option>IB (International Baccalaureate)</option><option>Cambridge (IGCSE)</option>
                  <option>State Board (Other)</option><option>Private / Autonomous</option><option>Other</option>
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
                    {isSelected && (
                      <div style={{ position:"absolute", top:-8, right:-8, width:20, height:20, borderRadius:"50%", background:opt.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
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
          {["Platform is for demonstration, educational, and management purposes.","Users must not misuse, disrupt, copy, or gain unauthorized access.","Demo access may be limited or revoked at any time.","All IP belongs to Nova Teach ERP.","We are not liable for service interruptions.","Continued use indicates acceptance."].map((t,i) => (
            <li key={i} style={{ marginBottom:8 }}>{t}</li>
          ))}
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
  /* ─── Hash-based routing ─── */
  const [currentHash, setCurrentHash] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const fn = () => setCurrentHash(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  const navigateTo = (path) => { window.location.hash = path; };

  /* ── Auth + trial state ──
     authReady: true once onAuthStateChanged fires AND Firestore data is loaded
     We hold the /demo route behind authReady to prevent flicker / race conditions.
  */
  const [user, setUser] = useState(null);
  const [trialExpiry, setTrialExpiry] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  /* ─── UI state ─── */
  const [navScrolled, setNavScrolled] = useState(false);
  const [logIndex, setLogIndex] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("standard");

  /* ─── Handle redirect result from Firebase ─── */
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect sign-in error:", err);
    });
  }, []);

  /* ─── Auth state listener ───
     FIX: We load Firestore data inside the listener and only set authReady AFTER
     all data is available. This eliminates the race condition.
  ─── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          let expiry;
          if (!snap.exists()) {
            expiry = new Date();
            expiry.setDate(expiry.getDate() + 7);
            await setDoc(ref, {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              firstLoginDate: new Date().toISOString(),
              trialExpiryDate: expiry.toISOString(),
              lastLogin: new Date().toISOString(),
            });
          } else {
            expiry = toDate(snap.data().trialExpiryDate);
          }
          // Set user and expiry atomically before marking auth as ready
          setUser(firebaseUser);
          setTrialExpiry(expiry);
        } catch (err) {
          console.error("Firestore error:", err);
          setUser(firebaseUser);
          setTrialExpiry(null);
        }
      } else {
        // FIX: Clear state synchronously on sign-out to prevent stale data
        setUser(null);
        setTrialExpiry(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  /* ─── Sign in ─── */
  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error("Sign-in error:", err);
      alert("Sign in failed. Please try again.");
    }
  };

  /* ─── Sign out — FIX: clear local state first, then Firebase ─── */
  const handleSignOut = async () => {
    setUser(null);
    setTrialExpiry(null);
    navigateTo("/");
    await signOut(auth);
  };

  /* ─── Scroll & ticker effects ─── */
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

  /* ─── Static page routes ─── */
  if (currentHash === "/privacy-policy") return <PrivacyPolicy onBack={() => navigateTo("/")} />;
  if (currentHash === "/terms") return <TermsOfService onBack={() => navigateTo("/")} />;

  /* ─── /demo route ───
     FIX: Show loading spinner until authReady. Only then decide whether user
     is authenticated and trial is valid. This prevents any flash of the wrong page.
  ─── */
  if (currentHash === "/demo") {
    if (!authReady) {
      return (
        <div style={{ minHeight:"100vh", background:"#F7F5EF", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:48, height:48, border:"3px solid rgba(42,107,74,0.2)", borderTop:"3px solid #2A6B4A", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
            <p style={{ fontFamily:"'Instrument Sans',sans-serif", color:"rgba(28,27,23,0.5)", fontSize:14 }}>Loading your dashboard…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      );
    }
    // Check auth and trial validity
    const expiry = toDate(trialExpiry);
    if (!user) {
      navigateTo("/");
      return null;
    }
    // Allow expired trial to reach DemoDashboard — it shows the contact form internally
    return (
      <DemoPage
        user={user}
        trialExpiryDate={trialExpiry}
        onSignOut={handleSignOut}
        onBack={() => navigateTo("/")}
      />
    );
  }

  /* ─── FAQs ─── */
  const faqs = [
    { q:"What is School ERP Software?",           a:"School ERP integrates all school operations — attendance, exams, fees, assignments, communication, and analytics — into one system. NexaAttend is a complete ERP built for Indian schools, working offline-first with AI face recognition." },
    { q:"How does attendance management work?",   a:"AI face recognition marks 30 students in under 60 seconds, works 100% offline, eliminates proxy attendance, and auto-syncs to parent WhatsApp and reports." },
    { q:"How does fee management work?",          a:"Track collections, dues, and payment history in real time. Send automated WhatsApp reminders. Reduce fee leakage by up to 95%." },
    { q:"Does it work without internet?",         a:"Yes — NexaAttend is offline-first. All recognition and data storage happen on your own computer. Internet is optional, only for cloud backups." },
    { q:"How long does setup take?",              a:"Our team completes full installation, camera setup, and staff training in 3 days. No IT department needed." },
    { q:"How accurate is face recognition?",      a:"99%+ accuracy under normal lighting. Handles glasses, hair changes, and varying conditions. Rigorously tested before handover." },
    { q:"What does the setup fee cover?",         a:"On-site installation, camera configuration, face data enrollment for all students and staff, admin training, and 3-day handover support." },
    { q:"What is the 7-day guarantee?",           a:"Use NexaAttend for 7 days. If it doesn't save time and reduce errors — full refund, no conditions." },
    { q:"What happens to student data?",          a:"Your data never leaves your premises. Stored on your own computer — not on any cloud. Complete ownership." },
    { q:"What cameras does it require?",          a:"Every plan includes 2 cameras. Any webcam or IP camera works. Extra cameras available at ₹15,000 per camera (one-time)." },
  ];

  /* ══════════════════════
     LANDING PAGE
  ══════════════════════ */
  return (
    <div style={{ fontFamily:"'Instrument Sans','DM Sans',sans-serif", background:"#F7F5EF", color:"#1C1B17", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }
        body { background: #F7F5EF; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"0 5%",
        background: navScrolled ? "rgba(247,245,239,0.95)" : "transparent",
        backdropFilter: navScrolled ? "blur(12px)" : "none",
        borderBottom: navScrolled ? "1px solid rgba(28,27,23,0.07)" : "none",
        transition:"all 0.3s",
        display:"flex", alignItems:"center", justifyContent:"space-between", height:68,
      }}>
        <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:20, fontWeight:600, color:"#1C1B17", cursor:"pointer" }} onClick={() => scrollTo("hero")}>
          NexaAttend
          <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#2A6B4A", marginLeft:4, verticalAlign:"middle", marginBottom:2 }} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:28 }} className="desktop-nav">
          {[["Features","modules"],["Pricing","pricing"],["FAQ","faq"],["Contact","inquiry"]].map(([label,id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, fontWeight:500, color:"rgba(28,27,23,0.65)", fontFamily:"'Instrument Sans',sans-serif", transition:"color 0.2s" }}
              onMouseEnter={e=>e.target.style.color="#1C1B17"} onMouseLeave={e=>e.target.style.color="rgba(28,27,23,0.65)"}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {authReady && user ? (
            <button onClick={() => navigateTo("/demo")}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:"#2A6B4A", color:"#F7F5EF", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
              {user.photoURL && <img src={user.photoURL} alt="" style={{ width:22, height:22, borderRadius:"50%" }} />}
              Open Dashboard
            </button>
          ) : (
            <button onClick={handleGoogleSignIn}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:"#1C1B17", color:"#F7F5EF", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}
              onMouseEnter={e=>e.currentTarget.style.background="#2A6B4A"} onMouseLeave={e=>e.currentTarget.style.background="#1C1B17"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
              Try Free Demo
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section id="hero" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 6% 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 20%, rgba(42,107,74,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />
        <FadeIn delay={0}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(42,107,74,0.08)", border:"1px solid rgba(42,107,74,0.2)", borderRadius:100, padding:"7px 16px", marginBottom:24 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#2A6B4A", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:12, fontWeight:600, color:"#1B5C3A", letterSpacing:"0.08em" }}>NOW LIVE IN 40+ SCHOOLS ACROSS GUJARAT</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(2.6rem,6vw,4.8rem)", lineHeight:1.1, color:"#1C1B17", maxWidth:900, marginBottom:24 }}>
            India's Smartest<br />
            <span style={{ color:"#2A6B4A", fontStyle:"italic" }}>School ERP</span> with<br />
            AI Face Attendance
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p style={{ fontSize:"clamp(1rem,2vw,1.2rem)", color:"rgba(28,27,23,0.6)", maxWidth:620, lineHeight:1.75, marginBottom:40 }}>
            Mark 300 students in 60 seconds. Manage fees, staff, exams & reports — all from one offline-first system built for Indian schools.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:56 }}>
            <button onClick={handleGoogleSignIn}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 28px", background:"#1C1B17", color:"#F7F5EF", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", boxShadow:"0 8px 24px rgba(28,27,23,0.18)" }}
              onMouseEnter={e=>e.currentTarget.style.background="#2A6B4A"} onMouseLeave={e=>e.currentTarget.style.background="#1C1B17"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
              Start 7-Day Free Trial
            </button>
            <button onClick={() => scrollTo("inquiry")}
              style={{ padding:"14px 28px", background:"transparent", color:"#1C1B17", border:"2px solid rgba(28,27,23,0.2)", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}
              onMouseEnter={e=>{e.currentTarget.style.background="#1C1B17";e.currentTarget.style.color="#F7F5EF";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#1C1B17";}}>
              Book a Demo →
            </button>
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap", justifyContent:"center" }}>
            {[["99%+","Face Recognition Accuracy"],["< 60s","Attendance for 30 Students"],["3 Days","Setup & Training"],["₹0","Hidden Charges"]].map(([num,label],i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:"1.8rem", fontWeight:700, color:"#2A6B4A" }}>{num}</div>
                <div style={{ fontSize:12, color:"rgba(28,27,23,0.5)", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Scrolling Ticker ── */}
      <div style={{ background:"#1C1B17", padding:"12px 0", overflow:"hidden", borderTop:"1px solid rgba(247,245,239,0.05)", borderBottom:"1px solid rgba(247,245,239,0.05)" }}>
        <div style={{ display:"flex", animation:"tickerScroll 28s linear infinite", width:"max-content" }}>
          {[...Array(2)].map((_,outerIdx) => (
            <div key={outerIdx} style={{ display:"flex", gap:0 }}>
              {["AI Face Recognition","Offline-First","WhatsApp Alerts","Payroll Automation","Fee Management","Staff HR","Exam Scheduling","Parent Portal","Custom Reports","99%+ Accuracy"].map((item,i) => (
                <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:16, padding:"0 28px", fontSize:12, fontWeight:600, color:"rgba(247,245,239,0.55)", letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                  <span style={{ width:4, height:4, borderRadius:"50%", background:"#2A6B4A", flexShrink:0 }} />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <section style={{ padding:"80px 6%", background:"#FFFFFF", borderBottom:"1px solid rgba(28,27,23,0.06)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:48, textAlign:"center" }}>
          {[
            { target:40, suffix:"+", label:"Schools Using NexaAttend" },
            { target:25000, suffix:"+", label:"Students Tracked Daily" },
            { target:99, suffix:"%", label:"Attendance Accuracy" },
            { target:3, suffix:" Days", label:"Average Setup Time" },
          ].map((s,i) => (
            <FadeIn key={i} delay={i*0.1}>
              <div>
                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:"3rem", fontWeight:700, color:"#2A6B4A", lineHeight:1 }}>
                  <AnimatedNumber target={s.target} suffix={s.suffix} />
                </div>
                <div style={{ fontSize:14, color:"rgba(28,27,23,0.5)", marginTop:8 }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Live Terminal Demo ── */}
      <section style={{ padding:"80px 6%", background:"#F7F5EF" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(42,107,74,0.08)", border:"1px solid rgba(42,107,74,0.2)", borderRadius:100, padding:"6px 14px", marginBottom:16 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#5AC87A", animation:"pulse 1.5s infinite" }} />
                <span style={{ fontSize:11, fontWeight:600, color:"#1B5C3A", letterSpacing:"0.1em" }}>LIVE RECOGNITION FEED</span>
              </div>
              <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", color:"#1C1B17" }}>Watch students get marked in real time</h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ background:"#0F0E0B", borderRadius:16, overflow:"hidden", border:"1px solid rgba(247,245,239,0.06)", boxShadow:"0 40px 80px rgba(0,0,0,0.3)" }}>
              <div style={{ padding:"12px 16px", background:"rgba(247,245,239,0.04)", borderBottom:"1px solid rgba(247,245,239,0.05)", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ display:"flex", gap:6 }}>
                  {["#FF5F57","#FFBD2E","#28C840"].map((c,i) => <div key={i} style={{ width:12, height:12, borderRadius:"50%", background:c }} />)}
                </div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(247,245,239,0.3)", marginLeft:8 }}>nexaattend — live attendance terminal</span>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#5AC87A", animation:"pulse 1.5s infinite" }} />
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#5AC87A" }}>LIVE</span>
                </div>
              </div>
              <div style={{ padding:"16px", fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
                {logs.slice(0, logIndex).map((l,i) => (
                  <div key={i} style={{ display:"flex", gap:16, padding:"6px 0", borderBottom:"1px solid rgba(247,245,239,0.04)", animation: i===logIndex-1 ? "fadeUp 0.4s ease" : "none" }}>
                    <span style={{ color:"rgba(247,245,239,0.3)", flexShrink:0 }}>{l.time}</span>
                    <span style={{ color:"#F7F5EF", flex:1 }}>{l.name}</span>
                    <span style={{ color:"rgba(247,245,239,0.45)", flexShrink:0 }}>{l.cls}</span>
                    <span style={{ flexShrink:0, color: l.status==="present" ? "#5AC87A" : l.status==="late" ? "#F59E0B" : "#EF4444", fontWeight:600 }}>
                      {l.status==="present" ? "✓ PRESENT" : l.status==="late" ? "⚠ LATE" : "✗ ABSENT"}
                    </span>
                  </div>
                ))}
                {logIndex < logs.length && (
                  <div style={{ padding:"8px 0", color:"rgba(247,245,239,0.2)", animation:"pulse 1s infinite" }}>▋</div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modules" style={{ padding:"100px 6%", background:"#FFFFFF" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(2rem,4vw,3rem)", color:"#1C1B17", marginBottom:16 }}>
                Everything your school needs,<br /><span style={{ fontStyle:"italic", color:"#2A6B4A" }}>in one system</span>
              </h2>
              <p style={{ fontSize:16, color:"rgba(28,27,23,0.55)", maxWidth:560, margin:"0 auto" }}>
                Built for Indian schools. Offline-first. No monthly subscription for updates.
              </p>
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:24 }}>
            {modules.map((m,i) => (
              <FadeIn key={i} delay={i*0.08}>
                <div style={{ background:"#F7F5EF", borderRadius:16, padding:"28px 24px", border:"1px solid rgba(28,27,23,0.06)", transition:"transform 0.2s, box-shadow 0.2s", height:"100%" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 20px 48px rgba(28,27,23,0.1)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${m.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:16, color:m.color }}>
                    {m.icon}
                  </div>
                  <h3 style={{ fontSize:17, fontWeight:700, color:"#1C1B17", marginBottom:12 }}>{m.title}</h3>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
                    {m.features.map((f,j) => (
                      <li key={j} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13.5, color:"rgba(28,27,23,0.65)", lineHeight:1.5 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop:2, flexShrink:0 }}>
                          <path d="M2.5 7.5l3 3 6-6" stroke={m.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding:"100px 6%", background:"#F7F5EF" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:52 }}>
              <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(2rem,4vw,3rem)", color:"#1C1B17", marginBottom:16 }}>
                Transparent pricing,<br /><span style={{ fontStyle:"italic", color:"#2A6B4A" }}>no surprises</span>
              </h2>
              <p style={{ fontSize:16, color:"rgba(28,27,23,0.55)" }}>One-time setup + monthly SaaS. Free lifetime updates included.</p>
            </div>
          </FadeIn>

          {/* Plan selector */}
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:36 }}>
            {PLANS.map(p => (
              <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                style={{ padding:"10px 24px", borderRadius:100, border:`2px solid ${selectedPlan===p.id ? p.color : "rgba(28,27,23,0.15)"}`, background: selectedPlan===p.id ? p.color : "transparent", color: selectedPlan===p.id ? "#F7F5EF" : "#1C1B17", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", transition:"all 0.2s" }}>
                {p.name}
              </button>
            ))}
          </div>

          {/* Selected plan card */}
          {plan && (
            <FadeIn>
              <div style={{ background:"#FFFFFF", borderRadius:20, border:`2px solid ${plan.color}`, padding:"40px 36px", maxWidth:680, margin:"0 auto", boxShadow:`0 20px 60px ${plan.color}18` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ display:"inline-block", background:`${plan.color}15`, color:plan.color, fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{plan.badge}</div>
                    <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, color:"#1C1B17" }}>{plan.name} Plan</h3>
                    <p style={{ fontSize:14, color:"rgba(28,27,23,0.5)", marginTop:4 }}>Up to {plan.students.toLocaleString("en-IN")} students</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:"2.4rem", color:plan.color, lineHeight:1 }}>₹{plan.monthly.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize:13, color:"rgba(28,27,23,0.45)" }}>/month</div>
                  </div>
                </div>
                <div style={{ background:"rgba(42,107,74,0.06)", border:"1px solid rgba(42,107,74,0.15)", borderRadius:10, padding:"12px 16px", marginBottom:24 }}>
                  <span style={{ fontSize:14, color:"#1B4D3E" }}>
                    One-time setup: <strong style={{ textDecoration:"line-through", color:"rgba(28,27,23,0.4)", marginRight:8 }}>{fmt(plan.setup)}</strong>
                    <strong style={{ color:"#2A6B4A", fontSize:17 }}>{fmt(plan.setupDiscounted)}</strong>
                    <span style={{ marginLeft:8, background:"#2A6B4A", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>SAVE ₹30K</span>
                  </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:28 }}>
                  {plan.features.map((f,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13.5 }}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink:0, marginTop:1 }}>
                        <circle cx="7.5" cy="7.5" r="7" fill={`${plan.color}20`}/>
                        <path d="M4.5 7.5l2 2 4-4" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ color:"rgba(28,27,23,0.7)", lineHeight:1.45 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button onClick={handleGoogleSignIn}
                    style={{ flex:1, minWidth:160, padding:"14px", background:plan.color, color:"#F7F5EF", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
                    Start Free Trial →
                  </button>
                  <button onClick={() => scrollTo("inquiry")}
                    style={{ padding:"14px 20px", background:"transparent", border:`2px solid ${plan.color}`, color:plan.color, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
                    Book Demo
                  </button>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding:"100px 6%", background:"#FFFFFF" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(2rem,4vw,3rem)", color:"#1C1B17", marginBottom:16 }}>
                Up and running in <span style={{ fontStyle:"italic", color:"#2A6B4A" }}>3 days</span>
              </h2>
              <p style={{ fontSize:16, color:"rgba(28,27,23,0.55)" }}>Our team handles everything — you just show up on day 4.</p>
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:32 }}>
            {[
              { day:"Day 1", title:"Installation", desc:"Our team visits your school. Hardware and software installed on your own computer.", icon:"💻" },
              { day:"Day 2", title:"Enrollment", desc:"We photograph and enroll all students and staff. 300 faces typically done in one day.", icon:"📸" },
              { day:"Day 3", title:"Training", desc:"Full admin and staff training. You run mock attendance sessions until confident.", icon:"🎓" },
              { day:"Day 4+", title:"You're Live", desc:"NexaAttend is fully live. WhatsApp alerts, reports, and dashboards are active.", icon:"🚀" },
            ].map((s,i) => (
              <FadeIn key={i} delay={i*0.1}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:36, marginBottom:16 }}>{s.icon}</div>
                  <div style={{ display:"inline-block", background:"rgba(42,107,74,0.08)", color:"#2A6B4A", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10, letterSpacing:"0.08em" }}>{s.day}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                  <p style={{ fontSize:14, color:"rgba(28,27,23,0.55)", lineHeight:1.65 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guarantee Strip ── */}
      <section style={{ background:"#1C1B17", padding:"60px 6%", textAlign:"center" }}>
        <FadeIn>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🛡️</div>
            <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)", color:"#F7F5EF", marginBottom:16 }}>
              7-Day Full Refund Guarantee
            </h2>
            <p style={{ fontSize:16, color:"rgba(247,245,239,0.6)", lineHeight:1.75, marginBottom:28 }}>
              Use NexaAttend for a full week. If it doesn't save your staff time, eliminate proxy attendance, and make reporting effortless — we refund everything. No conditions, no questions.
            </p>
            <button onClick={handleGoogleSignIn}
              style={{ padding:"14px 32px", background:"#2A6B4A", color:"#F7F5EF", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}
              onMouseEnter={e=>e.currentTarget.style.background="#5AC87A"} onMouseLeave={e=>e.currentTarget.style.background="#2A6B4A"}>
              Claim Your Free Trial →
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:"100px 6%", background:"#F7F5EF" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:52 }}>
              <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(2rem,4vw,3rem)", color:"#1C1B17", marginBottom:12 }}>
                Frequently asked questions
              </h2>
            </div>
          </FadeIn>
          {faqs.map((faq,i) => (
            <FadeIn key={i} delay={i*0.04}>
              <div style={{ borderBottom:"1px solid rgba(28,27,23,0.08)", overflow:"hidden" }}>
                <button onClick={() => setActiveFaq(activeFaq===i ? null : i)}
                  style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 0", background:"none", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"'Instrument Sans',sans-serif" }}>
                  <span style={{ fontSize:16, fontWeight:600, color:"#1C1B17", paddingRight:16 }}>{faq.q}</span>
                  <span style={{ fontSize:22, color:"#2A6B4A", flexShrink:0, transform: activeFaq===i ? "rotate(45deg)" : "rotate(0)", transition:"transform 0.2s" }}>+</span>
                </button>
                <div style={{ maxHeight: activeFaq===i ? 200 : 0, overflow:"hidden", transition:"max-height 0.3s ease" }}>
                  <p style={{ fontSize:15, color:"rgba(28,27,23,0.65)", lineHeight:1.75, paddingBottom:20, paddingRight:32 }}>{faq.a}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Inquiry Form ── */}
      <section id="inquiry" style={{ padding:"100px 6%", background:"#FFFFFF" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:44 }}>
              <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(2rem,4vw,3rem)", color:"#1C1B17", marginBottom:12 }}>
                Book your free demo
              </h2>
              <p style={{ fontSize:16, color:"rgba(28,27,23,0.55)" }}>Our team will call you within 24 hours to schedule a visit.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <InquiryForm />
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background:"#1C1B17", padding:"56px 6% 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:48, marginBottom:48, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:22, color:"#F7F5EF", marginBottom:12 }}>NexaAttend</div>
              <p style={{ fontSize:14, color:"rgba(247,245,239,0.45)", lineHeight:1.75, maxWidth:320 }}>
                AI-powered school ERP for India. Offline-first. Built for CBSE, GSEB, ICSE, and all state board schools.
              </p>
              <div style={{ marginTop:20, display:"flex", gap:10 }}>
                <a href="https://wa.me/919974724656" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(247,245,239,0.06)", border:"1px solid rgba(247,245,239,0.1)", borderRadius:8, padding:"8px 14px", fontSize:13, color:"rgba(247,245,239,0.65)", textDecoration:"none" }}>💬 WhatsApp</a>
                <a href="mailto:tishy5327@gmail.com" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(247,245,239,0.06)", border:"1px solid rgba(247,245,239,0.1)", borderRadius:8, padding:"8px 14px", fontSize:13, color:"rgba(247,245,239,0.65)", textDecoration:"none" }}>✉ Email</a>
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(247,245,239,0.3)", marginBottom:16 }}>Product</div>
              {["Features","Pricing","Free Trial","Book Demo"].map((item,i) => (
                <button key={i} onClick={() => scrollTo(["modules","pricing","hero","inquiry"][i])} style={{ display:"block", background:"none", border:"none", cursor:"pointer", fontSize:14, color:"rgba(247,245,239,0.5)", marginBottom:10, textAlign:"left", fontFamily:"'Instrument Sans',sans-serif", padding:0 }}
                  onMouseEnter={e=>e.target.style.color="#F7F5EF"} onMouseLeave={e=>e.target.style.color="rgba(247,245,239,0.5)"}>
                  {item}
                </button>
              ))}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(247,245,239,0.3)", marginBottom:16 }}>Legal</div>
              {[["Privacy Policy","/privacy-policy"],["Terms of Service","/terms"]].map(([label,path],i) => (
                <button key={i} onClick={() => navigateTo(path)} style={{ display:"block", background:"none", border:"none", cursor:"pointer", fontSize:14, color:"rgba(247,245,239,0.5)", marginBottom:10, textAlign:"left", fontFamily:"'Instrument Sans',sans-serif", padding:0 }}
                  onMouseEnter={e=>e.target.style.color="#F7F5EF"} onMouseLeave={e=>e.target.style.color="rgba(247,245,239,0.5)"}>
                  {label}
                </button>
              ))}
              <div style={{ marginTop:16, fontSize:13, color:"rgba(247,245,239,0.35)", lineHeight:1.6 }}>
                Ahmedabad, Gujarat<br />India — 380015
              </div>
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(247,245,239,0.07)", paddingTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <p style={{ fontSize:13, color:"rgba(247,245,239,0.3)" }}>© 2026 Nova Teach ERP. All rights reserved.</p>
            <p style={{ fontSize:13, color:"rgba(247,245,239,0.3)" }}>Made in India 🇮🇳 · GST-ready · Works offline</p>
          </div>
        </div>
      </footer>

      {/* ── Sticky Demo CTA (shows when not signed in) ── */}
      {authReady && !user && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:50, animation:"fadeUp 0.5s ease" }}>
          <button onClick={handleGoogleSignIn}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 28px", background:"#1C1B17", color:"#F7F5EF", border:"none", borderRadius:100, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", boxShadow:"0 12px 40px rgba(28,27,23,0.35)", whiteSpace:"nowrap" }}
            onMouseEnter={e=>e.currentTarget.style.background="#2A6B4A"} onMouseLeave={e=>e.currentTarget.style.background="#1C1B17"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
            Try 7-Day Free Demo
            <span style={{ background:"#2A6B4A", borderRadius:100, padding:"2px 10px", fontSize:11, fontWeight:700, marginLeft:4 }}>FREE</span>
          </button>
        </div>
      )}

      {/* ── Signed-in banner → open dashboard ── */}
      {authReady && user && currentHash === "/" && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:50, animation:"fadeUp 0.5s ease" }}>
          <button onClick={() => navigateTo("/demo")}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 24px", background:"#2A6B4A", color:"#F7F5EF", border:"none", borderRadius:100, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", boxShadow:"0 12px 40px rgba(42,107,74,0.35)", whiteSpace:"nowrap" }}>
            {user.photoURL && <img src={user.photoURL} alt="" style={{ width:24, height:24, borderRadius:"50%" }} />}
            Open My Dashboard →
          </button>
        </div>
      )}

    </div>
  );
}
