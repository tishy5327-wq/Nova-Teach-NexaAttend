import { useState, useEffect, useCallback, useRef, memo, useMemo, lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  // Brand
  green: "#2A6B4A",
  greenLight: "#5AC87A",
  greenDim: "rgba(42,107,74,0.10)",
  greenGlow: "rgba(42,107,74,0.35)",

  // Secondary
  blue: "#1A2B4A",
  blueDim: "rgba(26,43,74,0.12)",

  // Accent
  purple: "#3D1A4A",
  purpleDim: "rgba(61,26,74,0.10)",
  amber: "#7A5000",
  amberDim: "rgba(122,80,0,0.10)",
  red: "#7A1A1A",
  cyan: "#0E5E63",
  cyanDim: "rgba(14,94,99,0.10)",

  // Backgrounds
  bg: "#F7F5EF",
  card: "#FFFFFF",
  surface: "#FFFFFF",

  // Text
  text: "#1C1B17",
  muted: "rgba(28,27,23,0.75)",
  hint: "rgba(28,27,23,0.45)",

  // Borders
  border: "rgba(28,27,23,0.08)",

  // Gradients
  gradientPrimary:
    "linear-gradient(135deg,#2A6B4A 0%,#5AC87A 100%)",

  gradientDashboard:
    "linear-gradient(135deg,#1A2B4A 0%,#2A6B4A 100%)",

  gradientPremium:
    "linear-gradient(135deg,#3D1A4A 0%,#1A2B4A 100%)"
};

const F = {
  display: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─── Site Config (single source of truth for contact/SEO) ────────────────────
const SITE = {
  name: "NexaAttend",
  legalName: "Nova Teach Solution",
  tagline: "School ERP, LMS & QR Attendance for Indian Schools",
  url: "https://www.nexaattend.com",
  whatsapp: "+919000000000", // TODO: replace with real WhatsApp Business number
  whatsappDisplay: "+91 90000 00000",
  founderEmail: "tishy5327@gmail.com",
  founderName: "Tejas Iyer",
  phone: "+91 90000 00000",
};

const waLink = (msg) => `https://wa.me/${SITE.whatsapp.replace(/[^\d]/g,"")}?text=${encodeURIComponent(msg)}`;

// ─── Demo Data ───────────────────────────────────────────────────────────────
const DEMO_ROLES = [
  { id: "founder", label: "Founder", icon: "🏢", email: "tishy5327@gmail.com", name: "Tejas Iyer", org: "Nova Teach Solution", color: T.purple },
  { id: "owner",   label: "School Owner", icon: "👑", email: "owner@sunriseacademy.in", name: "Dr. Anjali Mehta", org: "Sunrise Academy, Ahmedabad", color: T.green },
  { id: "teacher", label: "Teacher",  icon: "👨‍🏫", email: "amit.kulkarni@sunriseacademy.in", name: "Mr. Amit Kulkarni", org: "Sunrise Academy", color: T.blue },
  { id: "student", label: "Student",  icon: "🎓", email: "arjun.mehta@student.in", name: "Arjun Mehta", org: "Class X-A · Roll 01", color: T.amber },
  { id: "parent",  label: "Parent",   icon: "👪", email: "mehta.parents@gmail.com", name: "Mr. Vikram Mehta", org: "Parent of Arjun Mehta", color: T.cyan },
];

const STUDENTS = [
  { id:"S001", name:"Arjun Mehta",   class:"X-A",  roll:"01", attend:94, fees:"Paid",    grade:"A+", photo:"AM", city:"Satellite" },
  { id:"S002", name:"Priya Sharma",  class:"X-A",  roll:"02", attend:88, fees:"Paid",    grade:"A",  photo:"PS", city:"Bopal" },
  { id:"S003", name:"Rohan Patel",   class:"IX-B", roll:"03", attend:72, fees:"Due",     grade:"B+", photo:"RP", city:"Gota" },
  { id:"S004", name:"Sneha Verma",   class:"X-A",  roll:"04", attend:96, fees:"Paid",    grade:"A+", photo:"SV", city:"Chandkheda" },
  { id:"S005", name:"Dev Agarwal",   class:"XI-C", roll:"05", attend:81, fees:"Partial", grade:"A",  photo:"DA", city:"Thaltej" },
  { id:"S006", name:"Kavya Joshi",   class:"IX-B", roll:"06", attend:91, fees:"Paid",    grade:"A",  photo:"KJ", city:"Prahlad Nagar" },
  { id:"S007", name:"Ishaan Nair",   class:"XII-A",roll:"07", attend:87, fees:"Paid",    grade:"A+", photo:"IN", city:"Vastrapur" },
  { id:"S008", name:"Ananya Singh",  class:"XI-C", roll:"08", attend:79, fees:"Due",     grade:"B",  photo:"AS", city:"Navrangpura" },
  { id:"S009", name:"Mihir Desai",   class:"IX-B", roll:"09", attend:93, fees:"Paid",    grade:"A",  photo:"MD", city:"Maninagar" },
  { id:"S010", name:"Riya Bhatt",    class:"X-A",  roll:"10", attend:85, fees:"Paid",    grade:"A",  photo:"RB", city:"Paldi" },
];

const STAFF = [
  { id:"T001", name:"Mrs. Deepa Rao",      role:"Principal",    dept:"Administration", salary:75000, status:"Active",   exp:"18 yrs" },
  { id:"T002", name:"Mr. Amit Kulkarni",   role:"Maths HOD",    dept:"Mathematics",    salary:58000, status:"Active",   exp:"12 yrs" },
  { id:"T003", name:"Ms. Ritu Bansal",     role:"Science HOD",  dept:"Science",        salary:52000, status:"Active",   exp:"9 yrs"  },
  { id:"T004", name:"Mr. Sanjay Pillai",   role:"English",      dept:"Languages",      salary:49000, status:"Active",   exp:"7 yrs"  },
  { id:"T005", name:"Ms. Pooja Dubey",     role:"Hindi",        dept:"Languages",      salary:46000, status:"Active",   exp:"5 yrs"  },
  { id:"T006", name:"Mr. Kiran Mehta",     role:"P.T. Teacher", dept:"Sports",         salary:40000, status:"On Leave", exp:"8 yrs"  },
];

const COURSES = [
  { id:"C001", code:"MATH-X",  title:"Mathematics X",     sub:"Maths",   emoji:"📐", color:"#22C55E", progress:68, enrolled:true,  rating:4.7, students:284 },
  { id:"C002", code:"SCI-X",   title:"Science X",         sub:"Science", emoji:"🔬", color:"#3B82F6", progress:0,  enrolled:false, rating:4.5, students:272 },
  { id:"C003", code:"ENG-X",   title:"English X",         sub:"English", emoji:"📖", color:"#A855F7", progress:42, enrolled:true,  rating:4.6, students:261 },
  { id:"C004", code:"PHY-XII", title:"Physics XII",       sub:"Physics", emoji:"⚡", color:"#F59E0B", progress:88, enrolled:true,  rating:4.9, students:198 },
  { id:"C005", code:"CS-XI",   title:"Computer Science",  sub:"CS",      emoji:"💻", color:"#06B6D4", progress:0,  enrolled:false, rating:4.8, students:156 },
  { id:"C006", code:"SST-X",   title:"Social Studies X",  sub:"SST",     emoji:"🌏", color:"#EC4899", progress:25, enrolled:true,  rating:4.4, students:259 },
  { id:"C007", code:"HIN-X",   title:"Hindi X",           sub:"Hindi",   emoji:"🪔", color:"#F97316", progress:0,  enrolled:false, rating:4.3, students:248 },
  { id:"C008", code:"PE-IX",   title:"Physical Education",sub:"PE",      emoji:"🏃", color:"#14B8A6", progress:50, enrolled:true,  rating:4.2, students:304 },
];

const QUIZZES = [
  { id:"Q001", title:"Linear Equations",    sub:"Maths",  q:5, time:15, diff:"Medium", best:80, attempts:3,
    questions:[
      { q:"What is the solution of 2x + 4 = 12?", opts:["x = 2","x = 3","x = 4","x = 5"], ans:2 },
      { q:"Which is a linear equation in two variables?", opts:["x² + y = 5","x + y = 5","x·y = 5","x² + y² = 5"], ans:1 },
      { q:"If 3x − 9 = 0, then x equals:", opts:["1","2","3","4"], ans:2 },
      { q:"The graph of y = 4 is a line:", opts:["Through origin","Parallel to x-axis","Parallel to y-axis","At 45°"], ans:1 },
      { q:"How many solutions does x + y = 7 have?", opts:["One","Two","None","Infinitely many"], ans:3 },
    ]},
  { id:"Q002", title:"Periodic Table",       sub:"Science",q:10,time:20, diff:"Easy",   best:90, attempts:1 },
  { id:"Q003", title:"English Comprehension",sub:"English",q:8, time:25, diff:"Medium", best:75, attempts:2 },
  { id:"Q004", title:"World Geography",      sub:"SST",    q:12,time:30, diff:"Hard",   best:0,  attempts:0 },
  { id:"Q005", title:"Python Basics",        sub:"CS",     q:10,time:20, diff:"Easy",   best:100,attempts:5 },
];

const FEES_DATA = [
  { name:"Arjun Mehta",  class:"X-A",  amt:12500, paid:12500, status:"Paid" },
  { name:"Priya Sharma", class:"X-A",  amt:12500, paid:12500, status:"Paid" },
  { name:"Rohan Patel",  class:"IX-B", amt:11000, paid:0,     status:"Due" },
  { name:"Sneha Verma",  class:"X-A",  amt:12500, paid:12500, status:"Paid" },
  { name:"Dev Agarwal",  class:"XI-C", amt:14000, paid:7000,  status:"Partial" },
  { name:"Kavya Joshi",  class:"IX-B", amt:11000, paid:11000, status:"Paid" },
  { name:"Ishaan Nair",  class:"XII-A",amt:15000, paid:15000, status:"Paid" },
  { name:"Ananya Singh", class:"XI-C", amt:14000, paid:0,     status:"Due" },
];

const NOTIFICATIONS_DATA = [
  { id:1, type:"alert",   icon:"⚠️", title:"Fee Due — 3 Students",       body:"Rohan Patel, Dev Agarwal overdue.", time:"2h ago",   read:false },
  { id:2, type:"info",    icon:"📅", title:"Exam Schedule Published",     body:"Half-yearly exams: Jun 20–28.",     time:"4h ago",   read:false },
  { id:3, type:"success", icon:"✅", title:"Attendance Synced",           body:"Today's QR attendance recorded.",  time:"6h ago",   read:true  },
  { id:4, type:"info",    icon:"📚", title:"Assignment Submitted",        body:"22/30 submitted Maths worksheet.", time:"1d ago",   read:true  },
  { id:5, type:"alert",   icon:"🏥", title:"Leave Request",               body:"Mr. Kiran Mehta: 5 days medical.", time:"1d ago",   read:true  },
  { id:6, type:"success", icon:"💰", title:"Payroll Processed",           body:"May 2026 payroll complete.",        time:"2d ago",   read:true  },
];

const GRADEBOOK = [
  { sub:"Mathematics", score:88, t1:82, color:"#22C55E" },
  { sub:"Science",     score:86, t1:80, color:"#3B82F6" },
  { sub:"English",     score:80, t1:76, color:"#A855F7" },
  { sub:"Hindi",       score:78, t1:74, color:"#F97316" },
  { sub:"SST",         score:80, t1:78, color:"#EC4899" },
  { sub:"Comp. Sci",   score:94, t1:90, color:"#06B6D4" },
];

const ATTENDANCE_LOG = [
  { roll:"X-A/01", name:"Arjun Mehta",   time:"08:02", status:"Present", conf:"99.1%" },
  { roll:"X-A/02", name:"Priya Sharma",  time:"08:04", status:"Present", conf:"98.7%" },
  { roll:"IX-B/03",name:"Rohan Patel",   time:"08:18", status:"Late",    conf:"97.2%" },
  { roll:"X-A/04", name:"Sneha Verma",   time:"08:01", status:"Present", conf:"99.5%" },
  { roll:"XI-C/05",name:"Dev Agarwal",   time:"—",     status:"Absent",  conf:"—" },
  { roll:"IX-B/06",name:"Kavya Joshi",   time:"08:06", status:"Present", conf:"98.9%" },
  { roll:"XII-A/07",name:"Ishaan Nair",  time:"08:09", status:"Present", conf:"99.3%" },
  { roll:"XI-C/08",name:"Ananya Singh",  time:"08:25", status:"Late",    conf:"96.8%" },
  { roll:"IX-B/09",name:"Mihir Desai",   time:"08:03", status:"Present", conf:"99.0%" },
  { roll:"X-A/10", name:"Riya Bhatt",    time:"08:07", status:"Present", conf:"98.4%" },
];

const WEEKLY_ATT = [
  { day:"Mon", pct:96, present:292 },
  { day:"Tue", pct:94, present:286 },
  { day:"Wed", pct:97, present:295 },
  { day:"Thu", pct:93, present:283 },
  { day:"Fri", pct:95, present:289 },
];

const EXAMS = [
  { title:"Half-Yearly Mathematics",  date:"2026-06-20", class:"X-A, X-B",   max:100, status:"Upcoming" },
  { title:"Science Practical",        date:"2026-06-18", class:"IX-B",        max:50,  status:"Upcoming" },
  { title:"English Literature",       date:"2026-06-15", class:"X-A, IX-B",   max:80,  status:"Active" },
  { title:"Physics Unit Test",        date:"2026-06-10", class:"XII-A",       max:40,  status:"Active" },
  { title:"Annual Hindi Paper",       date:"2026-05-28", class:"XI-C, X-A",   max:100, status:"Completed" },
];

const ASSIGNMENTS = [
  { title:"Quadratic Equations Practice", class:"X-A",  teacher:"Mr. Kulkarni", due:"Jun 12", sub:22, total:30 },
  { title:"Cell Division Diagram",         class:"IX-B", teacher:"Ms. Bansal",   due:"Jun 14", sub:18, total:28 },
  { title:"Essay: My Favourite Book",      class:"X-A",  teacher:"Mr. Pillai",   due:"Jun 16", sub:25, total:30 },
  { title:"Hindi Paragraph Writing",       class:"XI-C", teacher:"Ms. Dubey",    due:"Jun 18", sub:10, total:32 },
  { title:"Physical Fitness Log",          class:"IX-B", teacher:"Mr. Mehta",    due:"Jun 20", sub:15, total:28 },
];

const FOUNDER_SCHOOLS = [
  { name:"Sunrise Academy",       city:"Ahmedabad",  plan:"Standard", students:304, mrr:4999,  status:"Active",  trial:false },
  { name:"DPS Vadodara",          city:"Vadodara",   plan:"Premium",  students:892, mrr:8999,  status:"Active",  trial:false },
  { name:"St. Xavier's Surat",    city:"Surat",      plan:"Trial",    students:120, mrr:0,     status:"Trial",   trial:true  },
  { name:"Kendriya Vidyalaya",    city:"Rajkot",     plan:"Basic",    students:215, mrr:2999,  status:"Active",  trial:false },
  { name:"Modern School",         city:"Gandhinagar",plan:"Standard", students:450, mrr:4999,  status:"Active",  trial:false },
  { name:"Orchid International",  city:"Mumbai",     plan:"Trial",    students:80,  mrr:0,     status:"Trial",   trial:true  },
];

// ─── Utils ───────────────────────────────────────────────────────────────────
const initials = n => n?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?";
const fmtINR = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;
const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
const statusColor = s => ({
  Paid:"#22C55E", Active:"#22C55E", Present:"#22C55E", Approved:"#22C55E",
  Due:"#EF4444",  Absent:"#EF4444",
  Partial:"#F59E0B", Late:"#F59E0B", Pending:"#F59E0B", "On Leave":"#F59E0B",
  Upcoming:"#3B82F6", Trial:"#A855F7",
  Completed:"#64748B", Default:"#64748B",
}[s] || "#64748B");

const statusBg = s => {
  const c = statusColor(s);
  if(c==="#22C55E") return "rgba(34,197,94,0.12)";
  if(c==="#EF4444") return "rgba(239,68,68,0.12)";
  if(c==="#F59E0B") return "rgba(245,158,11,0.12)";
  if(c==="#3B82F6") return "rgba(59,130,246,0.12)";
  if(c==="#A855F7") return "rgba(168,85,247,0.12)";
  return "rgba(100,116,139,0.12)";
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body,#root{height:100%;background:${T.bg};color:${T.text};font-family:${F.body};}
    a{color:inherit;text-decoration:none;}
    button{cursor:pointer;border:none;font-family:inherit;background:none;}
    input,select,textarea{font-family:inherit;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:${T.hint};border-radius:4px;}
    ::-webkit-scrollbar-thumb:hover{background:${T.muted};}
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
    }
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
    @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(400%)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(34,197,94,.2)}50%{box-shadow:0 0 40px rgba(34,197,94,.5)}}
    @keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
    .fadeUp{animation:fadeUp .4s ease forwards}
    .nav-btn:hover{background:rgba(255,255,255,.06)!important}
    .table-row:hover td{background:rgba(255,255,255,.03)!important}
    .card-hover{transition:all .2s}
    .card-hover:hover{border-color:rgba(28,27,23,.18)!important;transform:translateY(-2px)!important;box-shadow:0 12px 32px rgba(28,27,23,.08)!important}
    .course-card:hover{transform:translateY(-3px)!important;box-shadow:0 12px 40px rgba(0,0,0,.4)!important}
    .btn-primary:hover{filter:brightness(1.08)!important;transform:translateY(-1px)}
    .btn-ghost:hover{background:rgba(28,27,23,.04)!important}
    .btn-dim:hover{border-color:rgba(28,27,23,.25)!important}
    a:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible {
      outline: 2px solid ${T.green}; outline-offset: 2px; border-radius: 4px;
    }
    .lp-link{position:relative}
    .lp-link::after{content:"";position:absolute;left:0;right:100%;bottom:-3px;height:1.5px;background:${T.green};transition:right .2s ease}
    .lp-link:hover::after{right:0}
    @media (max-width: 860px){
      .lp-hide-mobile{display:none!important}
      .lp-grid-2{grid-template-columns:1fr!important}
      .lp-grid-3{grid-template-columns:1fr!important}
      .lp-grid-4{grid-template-columns:repeat(2,1fr)!important}
      .lp-stack-mobile{flex-direction:column!important;align-items:stretch!important}
      .lp-mobile-toggle{display:block!important}
    }
  `}</style>
);

// ─── Shared Components ────────────────────────────────────────────────────────
const Avatar = memo(({ name, size=32, bg=T.green, style={} }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*.35, fontWeight:700, fontFamily:F.display, flexShrink:0, ...style }}>
    {initials(name)}
  </div>
));

const Badge = memo(({ label, status }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:".03em", background:statusBg(status||label), color:statusColor(status||label) }}>
    {label}
  </span>
));

const StatCard = memo(({ label, value, sub, icon, accent=T.green, trend, delay=0 }) => (
  <div className="card-hover" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 22px", transition:"all .2s", position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${accent}, transparent)` }} />
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <div style={{ fontSize:12, color:T.muted, fontWeight:500, marginBottom:10, letterSpacing:".05em", textTransform:"uppercase" }}>{label}</div>
        <div style={{ fontSize:28, fontWeight:700, color:T.text, fontFamily:F.display, lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:12, color:T.muted, marginTop:8 }}>{sub}</div>}
        {trend && <div style={{ fontSize:11, color:T.green, marginTop:6, fontWeight:600 }}>↑ {trend}</div>}
      </div>
      {icon && <div style={{ width:44, height:44, borderRadius:12, background:`${accent}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>}
    </div>
  </div>
));

const ProgressBar = memo(({ value, max=100, color=T.green, height=6, showLabel=false }) => {
  const pct = clamp(Math.round((value/max)*100), 0, 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height, background:T.hint, borderRadius:height, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:height, transition:"width .6s ease" }} />
      </div>
      {showLabel && <span style={{ fontSize:11, fontWeight:600, color:T.muted, minWidth:34, textAlign:"right" }}>{pct}%</span>}
    </div>
  );
});

const Modal = memo(({ open, onClose, width=560, title, children }) => {
  useEffect(() => {
    const h = e => { if(e.key==="Escape") onClose(); };
    if(open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if(!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20, animation:"scaleIn .15s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, width:"100%", maxWidth:width, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 25px 80px rgba(0,0,0,.6)" }}>
        {title && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:`1px solid ${T.border}` }}>
            <h3 style={{ fontSize:17, fontWeight:700, fontFamily:F.display }}>{title}</h3>
            <button onClick={onClose} style={{ color:T.muted, fontSize:20, width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
});

const Btn = memo(({ children, onClick, variant="ghost", size="md", color, style={}, disabled, as, href, target, rel, "aria-label": ariaLabel }) => {
  const sizes = { sm:{fontSize:12,padding:"5px 12px"}, md:{fontSize:13,padding:"8px 16px"}, lg:{fontSize:15,padding:"11px 24px"} };
  const variants = {
    primary: { background:T.green, color:"#fff", fontWeight:700 },
    ghost:   { background:"transparent", color:T.muted, border:`1px solid ${T.border}` },
    dim:     { background:T.card, color:T.text, border:`1px solid ${T.border}` },
    danger:  { background:"rgba(239,68,68,.15)", color:T.red, border:`1px solid rgba(239,68,68,.3)` },
    success: { background:"rgba(34,197,94,.15)", color:T.green, border:`1px solid rgba(34,197,94,.3)` },
    whatsapp:{ background:"#25D366", color:"#fff", fontWeight:700 },
  };
  const v = variants[variant] || variants.ghost;
  const Tag = as || "button";
  return (
    <Tag
      onClick={onClick}
      disabled={Tag==="button" ? disabled : undefined}
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={`btn-${variant}`}
      style={{ ...sizes[size], ...v, borderRadius:8, fontFamily:F.body, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all .15s", opacity:disabled?.5:1, flexShrink:0, cursor:disabled?"default":"pointer", ...style }}
    >
      {children}
    </Tag>
  );
});

const SearchBar = memo(({ value, onChange, placeholder="Search…" }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
    <span style={{ position:"absolute", left:12, fontSize:14, color:T.muted }}>🔍</span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ paddingLeft:36, paddingRight:14, paddingTop:9, paddingBottom:9, background:T.card, border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, color:T.text, width:"100%", outline:"none" }} />
  </div>
));

const TabBar = memo(({ tabs, active, onChange, style={} }) => (
  <div style={{ display:"flex", gap:2, padding:4, background:T.bg, borderRadius:12, ...style }}>
    {tabs.map(t => (
      <button key={t.id} onClick={()=>onChange(t.id)} style={{ padding:"7px 14px", borderRadius:9, fontSize:13, fontWeight: active===t.id?600:400, background: active===t.id?T.card:"transparent", color: active===t.id?T.text:T.muted, transition:"all .15s", whiteSpace:"nowrap" }}>
        {t.icon && <span style={{ marginRight:6 }}>{t.icon}</span>}{t.label}
      </button>
    ))}
  </div>
));

const EmptyState = memo(({ icon="📭", title, subtitle }) => (
  <div style={{ textAlign:"center", padding:"60px 20px", color:T.muted }}>
    <div style={{ fontSize:40, marginBottom:12, filter:"grayscale(50%)" }}>{icon}</div>
    <div style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13 }}>{subtitle}</div>
  </div>
));

const SectionHead = memo(({ title, subtitle, action }) => (
  <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
    <div>
      <h2 style={{ fontSize:17, fontWeight:700, color:T.text, fontFamily:F.display }}>{title}</h2>
      {subtitle && <p style={{ fontSize:12, color:T.muted, marginTop:3 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
));

// ─── QR Attendance Component ──────────────────────────────────────────────────
const QRAttendanceDemo = memo(() => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [counter, setCounter] = useState(0);
  const intervalRef = useRef(null);

  const startScan = () => {
    setScanning(true); setScanned([]); setCounter(0);
    let i = 0;
    intervalRef.current = setInterval(() => {
      if(i >= ATTENDANCE_LOG.length) { clearInterval(intervalRef.current); setScanning(false); return; }
      setScanned(prev => [...prev, ATTENDANCE_LOG[i]]);
      setCounter(c => c + (ATTENDANCE_LOG[i].status === "Present" ? 1 : 0));
      i++;
    }, 500);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const QRCode = () => (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
      <div style={{ width:180, height:180, background:"#fff", borderRadius:16, padding:16, position:"relative", animation:"glow 2s ease-in-out infinite" }}>
        <svg width="148" height="148" viewBox="0 0 148 148">
          {[...Array(7)].map((_,r)=>[...Array(7)].map((_,c)=>{
            const pat=[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
            return pat[r][c]?<rect key={`${r}${c}`} x={c*8} y={r*8} width={7} height={7} fill="#111" rx="1"/>:null;
          }))}
          {[...Array(7)].map((_,r)=>[...Array(7)].map((_,c)=>{
            const pat=[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
            return pat[r][c]?<rect key={`br${r}${c}`} x={c*8+92} y={r*8+92} width={7} height={7} fill="#111" rx="1"/>:null;
          }))}
          {[...Array(7)].map((_,r)=>[...Array(7)].map((_,c)=>{
            const pat=[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
            return pat[r][c]?<rect key={`tr${r}${c}`} x={c*8+92} y={r*8} width={7} height={7} fill="#111" rx="1"/>:null;
          }))}
          {[...Array(30)].map((_,i)=>Math.random()>.5?<rect key={`r${i}`} x={20+Math.floor(i/6)*10} y={70+(i%6)*10} width={8} height={8} fill="#111" rx="1"/>:null)}
          {[...Array(30)].map((_,i)=>Math.random()>.5?<rect key={`c${i}`} x={60+Math.floor(i/6)*8} y={25+(i%6)*9} width={7} height={7} fill="#111" rx="1"/>:null)}
        </svg>
        {scanning && <div style={{ position:"absolute", inset:0, borderRadius:16, overflow:"hidden", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:8 }}>
          <div style={{ width:"100%", height:3, background:`linear-gradient(90deg, transparent, ${T.green}, transparent)`, animation:"scanline 1.5s ease-in-out infinite" }} />
        </div>}
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:12, color:T.muted }}>Class X-A · Session QR</div>
        <div style={{ fontSize:11, fontFamily:F.mono, color:T.hint, marginTop:4 }}>NXA-20260609-XA-0812</div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Present" value={counter || 284} sub="Auto-counted" icon="✅" accent={T.green} />
        <StatCard label="Late" value={12} icon="⏰" accent={T.amber} />
        <StatCard label="Absent" value={8} icon="❌" accent={T.red} />
        <StatCard label="Total" value={304} sub="All students" icon="🎓" accent={T.blue} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24 }}>
        <div style={{ background:T.card, borderRadius:16, padding:24, border:`1px solid ${T.border}` }}>
          <SectionHead title="QR Attendance Scanner" subtitle="Generate and scan QR codes for instant marking" />
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
            {showQR ? <QRCode /> : (
              <div style={{ width:180, height:180, borderRadius:16, background:T.bg, border:`2px dashed ${T.hint}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, color:T.muted }}>
                <span style={{ fontSize:40 }}>📱</span>
                <span style={{ fontSize:12 }}>Tap to generate QR</span>
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="primary" size="md" onClick={() => setShowQR(v=>!v)}>{showQR ? "Hide QR" : "Generate QR"}</Btn>
              <Btn variant="dim" size="md" onClick={startScan} disabled={scanning}>{scanning ? "Scanning…" : "▶ Demo Scan"}</Btn>
            </div>
            {scanning && (
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:T.green }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:T.green, animation:"pulse 1s infinite" }} />
                Live scanning… {scanned.length}/{ATTENDANCE_LOG.length}
              </div>
            )}
            {!scanning && scanned.length > 0 && (
              <div style={{ background:T.greenDim, border:`1px solid ${T.green}40`, borderRadius:12, padding:"12px 16px", textAlign:"center", width:"100%" }}>
                <div style={{ fontSize:22, fontWeight:700, color:T.green }}>{counter} Present</div>
                <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Attendance marked in {(scanned.length * .5).toFixed(1)}s</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ background:T.card, borderRadius:16, padding:24, border:`1px solid ${T.border}` }}>
          <SectionHead title="Weekly Trend" />
          <div style={{ display:"flex", gap:10, alignItems:"flex-end", height:120, marginBottom:12 }}>
            {WEEKLY_ATT.map(d => (
              <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11, fontWeight:700, color:T.green }}>{d.pct}%</span>
                <div style={{ width:"100%", background:T.greenDim, borderRadius:"4px 4px 0 0", height:`${(d.pct-88)*12}px`, minHeight:4, transition:"height .4s ease", boxShadow:`0 0 12px ${T.greenGlow}` }} />
                <span style={{ fontSize:11, color:T.muted }}>{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:12 }}>Monthly Trend</div>
            {[["Jan","97%"],["Feb","95%"],["Mar","96%"],["Apr","94%"],["May","95%"],["Jun","94%"]].map(([m,p]) => (
              <div key={m} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ width:28, fontSize:11, color:T.muted }}>{m}</span>
                <div style={{ flex:1, height:6, background:T.hint, borderRadius:4, overflow:"hidden" }}>
                  <div style={{ width:p, height:"100%", background:T.green, borderRadius:4 }} />
                </div>
                <span style={{ fontSize:11, color:T.green, fontWeight:600, width:32, textAlign:"right" }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:"#0d1117", borderRadius:16, border:`1px solid rgba(34,197,94,.2)`, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:12, fontFamily:F.mono, fontWeight:700, color:T.green, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:T.green, display:"inline-block", animation:"pulse 1.5s infinite" }} />
              LIVE QR SCAN LOG
            </div>
            <div style={{ fontSize:11, color:T.muted, fontFamily:F.mono, marginTop:2 }}>Class X-A · {new Date().toLocaleDateString("en-IN")}</div>
          </div>
          <div style={{ fontSize:11, fontFamily:F.mono, color:T.hint }}>{scanned.length || ATTENDANCE_LOG.length} records</div>
        </div>
        <div style={{ fontFamily:F.mono, fontSize:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"100px 1fr 70px 80px 90px", gap:12, padding:"6px 4px", color:T.hint, fontSize:10, letterSpacing:".06em", borderBottom:`1px solid rgba(255,255,255,.05)`, marginBottom:4 }}>
            <span>ROLL</span><span>STUDENT</span><span>TIME</span><span>STATUS</span><span>CONF.</span>
          </div>
          {(scanned.length ? scanned : ATTENDANCE_LOG).map((s, i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"100px 1fr 70px 80px 90px", gap:12, padding:"7px 4px", borderBottom:"1px solid rgba(255,255,255,.03)", animation:`fadeUp .2s ease forwards`, animationDelay:`${i*.05}s`, opacity:0 }}>
              <span style={{ color:"rgba(255,255,255,.3)", fontFamily:F.mono }}>{s.roll}</span>
              <span style={{ color:"rgba(255,255,255,.9)", fontWeight:500 }}>{s.name}</span>
              <span style={{ color:"rgba(255,255,255,.4)" }}>{s.time}</span>
              <span style={{ color:s.status==="Present"?T.green:s.status==="Late"?"#F59E0B":T.red, fontWeight:600 }}>{s.status}</span>
              <span style={{ color:"rgba(255,255,255,.3)" }}>{s.conf}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── LMS Module ───────────────────────────────────────────────────────────────
const LMSModule = memo(() => {
  const [tab, setTab] = useState("dashboard");
  const [courseModal, setCourseModal] = useState(null);
  const [quizModal, setQuizModal] = useState(null);
  const [quizState, setQuizState] = useState({ step:0, selected:{}, submitted:false });
  const [liveModal, setLiveModal] = useState(false);

  const lmsTabs = [
    { id:"dashboard", icon:"⊞", label:"Dashboard" },
    { id:"courses",   icon:"📚", label:"Courses" },
    { id:"quizzes",   icon:"❓", label:"Quizzes" },
    { id:"library",   icon:"🗂", label:"Library" },
    { id:"gradebook", icon:"📊", label:"Gradebook" },
  ];

  const openQuiz = q => { setQuizModal(q); setQuizState({ step:0, selected:{}, submitted:false }); };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <TabBar tabs={lmsTabs} active={tab} onChange={setTab} />
      </div>

      {tab === "dashboard" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            <StatCard label="Enrolled" value={COURSES.filter(c=>c.enrolled).length} icon="📚" accent={T.green} />
            <StatCard label="In Progress" value={COURSES.filter(c=>c.enrolled&&c.progress>0&&c.progress<100).length} icon="▶️" accent={T.blue} />
            <StatCard label="Completed" value={1} icon="🏆" accent={T.amber} />
            <StatCard label="Avg Score" value="84%" icon="⭐" accent={T.purple} />
          </div>
          <SectionHead title="Continue Learning" subtitle="Pick up where you left off" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:24 }}>
            {COURSES.filter(c=>c.enrolled&&c.progress>0&&c.progress<100).map(c => (
              <div key={c.id} className="card-hover" style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, display:"flex", gap:16, transition:"all .2s", cursor:"pointer" }} onClick={()=>setCourseModal(c)}>
                <div style={{ width:52, height:52, borderRadius:12, background:`${c.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{c.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{c.title}</div>
                  <ProgressBar value={c.progress} color={c.color} showLabel />
                  <div style={{ fontSize:11, color:T.muted, marginTop:6 }}>Last accessed · 2h ago</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <SectionHead title="Live Class" subtitle="Happening now" />
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.red, fontWeight:700 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:T.red, display:"inline-block", animation:"pulse 1s infinite" }} />
                LIVE
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ width:48, height:48, borderRadius:12, background:"rgba(239,68,68,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🔴</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>Physics: Wave Optics</div>
                  <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Ms. Ritu Bansal · 32/40 students joined</div>
                </div>
              </div>
              <Btn variant="danger" size="md" onClick={()=>setLiveModal(true)}>Join Live →</Btn>
            </div>
          </div>
        </div>
      )}

      {tab === "courses" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {COURSES.map(c => (
              <div key={c.id} className="course-card" style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden", cursor:"pointer", transition:"all .2s" }} onClick={()=>setCourseModal(c)}>
                <div style={{ height:88, background:`linear-gradient(135deg, ${c.color}30, ${c.color}10)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, position:"relative" }}>
                  {c.emoji}
                  {c.enrolled && <div style={{ position:"absolute", top:10, right:10, background:T.green, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:10, letterSpacing:".04em" }}>ENROLLED</div>}
                </div>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:c.color, letterSpacing:".07em", marginBottom:4 }}>{c.code}</div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{c.title}</div>
                  <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>{c.sub} · ⭐ {c.rating} · {c.students} students</div>
                  {c.enrolled ? <ProgressBar value={c.progress} color={c.color} showLabel height={4} /> : (
                    <Btn variant="dim" size="sm" style={{ width:"100%", justifyContent:"center" }}>Enroll →</Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "quizzes" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
          {QUIZZES.map(q => (
            <div key={q.id} className="card-hover" style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, transition:"all .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{q.title}</div>
                  <div style={{ fontSize:12, color:T.muted }}>{q.sub} · {q.q} questions · {q.time} min</div>
                </div>
                <Badge label={q.diff} status={q.diff==="Easy"?"Active":q.diff==="Medium"?"Pending":"Due"} />
              </div>
              {q.attempts > 0 && (
                <div style={{ fontSize:12, color:T.muted, marginBottom:12 }}>Best: <span style={{ color:T.green, fontWeight:700 }}>{q.best}%</span> · {q.attempts} attempt{q.attempts>1?"s":""}</div>
              )}
              <Btn variant="primary" size="sm" onClick={()=>openQuiz(q)}>{q.attempts > 0 ? "Retake" : "Start Quiz"}</Btn>
            </div>
          ))}
        </div>
      )}

      {tab === "library" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[
            { title:"NCERT Mathematics X",     type:"PDF",   sub:"Maths",  size:"12 MB",  pages:348 },
            { title:"NCERT Science X",          type:"PDF",   sub:"Science",size:"18 MB",  pages:402 },
            { title:"Maths Formula Sheet",      type:"PDF",   sub:"Maths",  size:"2 MB",   pages:12  },
            { title:"Physics Video Pack XII",   type:"Video", sub:"Physics",size:"1.2 GB", pages:null },
            { title:"Science Lab Manual IX",    type:"PDF",   sub:"Science",size:"8 MB",   pages:180 },
            { title:"CS Python Practicals",     type:"PDF",   sub:"CS",     size:"5 MB",   pages:95  },
          ].map((l,i) => (
            <div key={i} className="card-hover" style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, transition:"all .2s" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>{l.type==="PDF"?"📄":"🎬"}</div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{l.title}</div>
              <div style={{ fontSize:12, color:T.muted, marginBottom:12 }}>{l.type} · {l.size}{l.pages?` · ${l.pages}pp`:""}</div>
              <Btn variant="dim" size="sm">📥 Download</Btn>
            </div>
          ))}
        </div>
      )}

      {tab === "gradebook" && (
        <div>
          <div style={{ background:T.card, borderRadius:16, padding:24, border:`1px solid ${T.border}`, marginBottom:20 }}>
            <SectionHead title="Academic Performance" subtitle="Current & previous term comparison" />
            {GRADEBOOK.map((g,i) => (
              <div key={i} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{g.sub}</span>
                  <div style={{ display:"flex", gap:20, fontSize:12, color:T.muted }}>
                    <span>Term 1: {g.t1}</span>
                    <span style={{ fontWeight:700, color:g.color }}>Term 2: {g.score}</span>
                  </div>
                </div>
                <div style={{ position:"relative", height:8, background:T.hint, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${g.t1}%`, background:`${g.color}40`, borderRadius:8 }} />
                  <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${g.score}%`, background:g.color, borderRadius:8, boxShadow:`0 0 8px ${g.color}60` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {[
              { rank:"🥇", name:"Arjun Mehta", score:"91.3%", class:"X-A" },
              { rank:"🥈", name:"Sneha Verma", score:"89.0%", class:"X-A" },
              { rank:"🥉", name:"Kavya Joshi", score:"87.2%", class:"IX-B" },
            ].map(p => (
              <div key={p.name} className="card-hover" style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, textAlign:"center", transition:"all .2s" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>{p.rank}</div>
                <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
                <div style={{ fontSize:12, color:T.muted }}>{p.class}</div>
                <div style={{ fontSize:22, fontWeight:700, color:T.green, marginTop:8 }}>{p.score}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Modal */}
      <Modal open={!!courseModal} onClose={()=>setCourseModal(null)} width={680} title={courseModal?.title}>
        {courseModal && (
          <div style={{ padding:24 }}>
            <div style={{ height:120, background:`linear-gradient(135deg, ${courseModal.color}30, ${courseModal.color}10)`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:56, marginBottom:20 }}>
              {courseModal.emoji}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
              {[["Students",courseModal.students],["Duration","48 hrs"],["Rating",`⭐ ${courseModal.rating}`],["Level","Class X"],["Progress",`${courseModal.progress}%`]].map(([l,v])=>(
                <div key={l} style={{ textAlign:"center", padding:12, background:T.bg, borderRadius:10 }}>
                  <div style={{ fontSize:14, fontWeight:700 }}>{v}</div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
            {courseModal.enrolled && <div style={{ marginBottom:20 }}><ProgressBar value={courseModal.progress} color={courseModal.color} showLabel height={8} /></div>}
            <p style={{ fontSize:14, color:T.muted, lineHeight:1.7, marginBottom:20 }}>
              Comprehensive CBSE-aligned course covering the complete {courseModal.sub} syllabus with recorded lectures, practice problems, and chapter-wise assessments.
            </p>
            <Btn variant="primary" size="lg" style={{ width:"100%", justifyContent:"center" }}>
              {courseModal.enrolled ? "Continue Learning →" : "Enroll Now →"}
            </Btn>
          </div>
        )}
      </Modal>

      {/* Quiz Modal */}
      <Modal open={!!quizModal} onClose={()=>setQuizModal(null)} width={640} title={quizModal?.title}>
        {quizModal && (() => {
          const qs = quizModal.questions || [];
          if(!qs.length) return (
            <div style={{ padding:24 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
                <StatCard label="Questions" value={quizModal.q} />
                <StatCard label="Time" value={`${quizModal.time} min`} />
                <StatCard label="Difficulty" value={quizModal.diff} />
              </div>
              <Btn variant="primary" size="lg" style={{ width:"100%", justifyContent:"center" }}>Start Quiz</Btn>
            </div>
          );
          const { step, selected, submitted } = quizState;
          if(submitted) {
            const score = qs.reduce((a,q,i)=>a+(selected[i]===q.ans?1:0),0);
            const pct = Math.round(score/qs.length*100);
            return (
              <div style={{ padding:40, textAlign:"center" }}>
                <div style={{ fontSize:60, marginBottom:16 }}>{pct>=80?"🏆":pct>=60?"✅":"📖"}</div>
                <div style={{ fontSize:32, fontWeight:700, color:pct>=80?T.green:T.amber }}>{pct}%</div>
                <div style={{ fontSize:14, color:T.muted, margin:"8px 0 24px" }}>{score}/{qs.length} correct</div>
                <ProgressBar value={score} max={qs.length} color={pct>=80?T.green:T.amber} showLabel />
                <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:24 }}>
                  <Btn variant="primary" onClick={()=>setQuizState({step:0,selected:{},submitted:false})}>Try Again</Btn>
                  <Btn variant="ghost" onClick={()=>setQuizModal(null)}>Close</Btn>
                </div>
              </div>
            );
          }
          const q = qs[step];
          const opts = ["A","B","C","D"];
          return (
            <div style={{ padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <span style={{ fontSize:12, color:T.muted }}>{step+1} / {qs.length}</span>
                <span style={{ fontSize:12, color:T.muted }}>{quizModal.sub}</span>
              </div>
              <ProgressBar value={step+1} max={qs.length} color={T.blue} />
              <div style={{ margin:"20px 0", fontSize:16, fontWeight:600, lineHeight:1.5 }}>{q.q}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
                {q.opts.map((opt,i) => (
                  <button key={i} onClick={()=>setQuizState(s=>({...s,selected:{...s.selected,[step]:i}}))} style={{ padding:"12px 16px", borderRadius:12, textAlign:"left", fontFamily:F.body, fontSize:14, border:`2px solid ${selected[step]===i?T.blue:T.border}`, background:selected[step]===i?T.blueDim:T.bg, color:selected[step]===i?T.blue:T.text, fontWeight:selected[step]===i?600:400, transition:"all .15s", display:"flex", gap:10 }}>
                    <span style={{ fontFamily:F.mono, fontSize:12, color:T.muted, flexShrink:0 }}>{opts[i]}</span>
                    {opt}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <Btn variant="ghost" size="md" onClick={()=>setQuizState(s=>({...s,step:Math.max(0,s.step-1)}))} disabled={step===0}>← Prev</Btn>
                {step < qs.length-1
                  ? <Btn variant="primary" size="md" onClick={()=>setQuizState(s=>({...s,step:s.step+1}))} disabled={selected[step]===undefined}>Next →</Btn>
                  : <Btn variant="primary" size="md" onClick={()=>setQuizState(s=>({...s,submitted:true}))} disabled={selected[step]===undefined}>Submit ✓</Btn>
                }
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Live Class Modal */}
      <Modal open={liveModal} onClose={()=>setLiveModal(false)} width={520} title="Physics: Wave Optics">
        <div style={{ padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:T.red, display:"inline-block", animation:"pulse 1s infinite" }} />
            <span style={{ fontSize:12, fontWeight:700, color:T.red }}>LIVE NOW</span>
            <span style={{ fontSize:12, color:T.muted }}>Started 18 min ago</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
            {[["Teacher","Ms. Ritu Bansal"],["Duration","45 min"],["Attendees","32/40"],["Scheduled","Today 3:00 PM"]].map(([l,v])=>(
              <div key={l} style={{ padding:14, background:T.bg, borderRadius:10 }}>
                <div style={{ fontSize:11, color:T.muted, marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:14, fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
          <Btn variant="danger" size="lg" style={{ width:"100%", justifyContent:"center" }}>🔴 Join Live Class</Btn>
        </div>
      </Modal>
    </div>
  );
});

// ─── AI Features Module ───────────────────────────────────────────────────────
const AIModule = memo(() => {
  const [activeFeature, setActiveFeature] = useState("assignment");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const features = [
    { id:"assignment", icon:"📝", label:"Assignment Generator" },
    { id:"quiz",       icon:"❓", label:"Quiz Generator" },
    { id:"analysis",   icon:"📊", label:"Performance Analysis" },
  ];

  const SAMPLES = {
    assignment: {
      title: "AI Generated Assignment: Quadratic Equations",
      content: [
        "Q1. Solve by factoring: x² + 5x + 6 = 0",
        "Q2. Use the quadratic formula to find roots of: 2x² − 7x + 3 = 0",
        "Q3. A rectangle has perimeter 34 cm. Its area is 72 cm². Find dimensions.",
        "Q4. The sum of squares of two consecutive integers is 365. Find them.",
        "Q5. Bonus: Derive the quadratic formula from ax² + bx + c = 0.",
      ],
      meta: "Difficulty: Medium · Estimated time: 45 min · Marks: 25",
    },
    quiz: {
      title: "AI Generated Quiz: Cell Biology (10 Questions)",
      content: [
        "Q1. Which organelle is called the 'powerhouse of the cell'? (MCQ)",
        "Q2. Differentiate between prokaryotic and eukaryotic cells.",
        "Q3. What is the function of the Golgi apparatus?",
        "Q4. Label the diagram: nucleus, cell wall, chloroplast, mitochondria",
        "Q5. True/False: Animal cells have cell walls.",
      ],
      meta: "Difficulty: Easy-Medium · Time: 20 min · Auto-graded MCQs",
    },
    analysis: {
      title: "AI Performance Analysis: Class X-A",
      content: [
        "📈 Mathematics average improved 6.2% from Term 1 to Term 2.",
        "⚠️ 4 students in the 'at-risk' zone (below 60%) in Science.",
        "🏆 Top performer: Sneha Verma — consistent A+ across all subjects.",
        "💡 Recommendation: Schedule extra remedial sessions for Rohan Patel.",
        "📅 Predicted board exam score range: 82%–91% (Class X-A average).",
      ],
      meta: "Analysis based on 6 subjects · 30 students · 2 terms of data",
    },
  };

  const generate = () => {
    setGenerating(true); setResult(null);
    setTimeout(() => { setResult(SAMPLES[activeFeature]); setGenerating(false); }, 1800);
  };

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="AI Assignments Created" value="47" trend="↑ 12 this week" icon="📝" accent={T.purple} />
        <StatCard label="Quizzes Generated" value="23" trend="↑ 5 this week" icon="❓" accent={T.blue} />
        <StatCard label="Analyses Run" value="8" icon="📊" accent={T.green} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div style={{ background:T.card, borderRadius:16, padding:24, border:`1px solid ${T.border}` }}>
          <SectionHead title="AI Tools" subtitle="Generate content with one click" />
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {features.map(f => (
              <button key={f.id} onClick={()=>{ setActiveFeature(f.id); setResult(null); }} style={{ display:"flex", gap:12, alignItems:"center", padding:"14px 16px", borderRadius:12, border:`1.5px solid ${activeFeature===f.id?T.purple:T.border}`, background:activeFeature===f.id?T.purpleDim:T.bg, transition:"all .15s", textAlign:"left" }}>
                <span style={{ fontSize:22 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:activeFeature===f.id?T.purple:T.text }}>{f.label}</div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>
                    {f.id==="assignment"?"Generate class-specific worksheets and homework":f.id==="quiz"?"Create MCQ, subjective & mixed quizzes":"Analyze student performance and predict outcomes"}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            <div>
              <label style={{ fontSize:12, color:T.muted, display:"block", marginBottom:6 }}>Subject</label>
              <select style={{ width:"100%", padding:"9px 12px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:13 }}>
                {["Mathematics","Science","English","Hindi","SST","Physics","CS"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, color:T.muted, display:"block", marginBottom:6 }}>Class</label>
              <select style={{ width:"100%", padding:"9px 12px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:13 }}>
                {["X-A","X-B","IX-B","XI-C","XII-A"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <Btn variant="primary" size="lg" onClick={generate} disabled={generating} style={{ width:"100%", justifyContent:"center", background:T.purple }}>
            {generating ? (
              <><div style={{ width:14, height:14, border:`2px solid rgba(255,255,255,.3)`, borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} /> Generating…</>
            ) : "✨ Generate with AI"}
          </Btn>
        </div>

        <div style={{ background:T.card, borderRadius:16, padding:24, border:`1px solid ${T.border}` }}>
          <SectionHead title="Result" subtitle="AI-generated content appears here" />
          {generating && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[100,80,90,70,85].map((w,i) => (
                <div key={i} style={{ height:14, borderRadius:7, background:`linear-gradient(90deg, ${T.hint} 25%, ${T.card} 50%, ${T.hint} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", width:`${w}%` }} />
              ))}
            </div>
          )}
          {result && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ display:"flex", align:"center", gap:8, marginBottom:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{result.title}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{result.meta}</div>
                </div>
                <div style={{ padding:"3px 8px", borderRadius:6, background:T.purpleDim, color:T.purple, fontSize:10, fontWeight:700, height:"fit-content" }}>AI</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {result.content.map((line,i) => (
                  <div key={i} style={{ padding:"10px 14px", background:T.bg, borderRadius:10, fontSize:13, color:T.text, borderLeft:`3px solid ${T.purple}40`, lineHeight:1.5 }}>
                    {line}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <Btn variant="success" size="sm">✓ Use This</Btn>
                <Btn variant="ghost" size="sm" onClick={generate}>↻ Regenerate</Btn>
                <Btn variant="ghost" size="sm">📥 Export</Btn>
              </div>
            </div>
          )}
          {!generating && !result && (
            <EmptyState icon="✨" title="AI output appears here" subtitle="Configure your settings and click generate" />
          )}
        </div>
      </div>
    </div>
  );
});

// ─── Reports Module ───────────────────────────────────────────────────────────
const ReportsModule = memo(() => {
  const [reportTab, setReportTab] = useState("attendance");
  const tabs = [
    { id:"attendance", label:"Attendance" },
    { id:"fees",       label:"Fees" },
    { id:"payroll",    label:"Payroll" },
    { id:"academic",   label:"Academic" },
  ];
  const barData = {
    attendance: { data:[{l:"Apr",v:94},{l:"May",v:92},{l:"Jun",v:93}], color:T.green, label:"Attendance Rate" },
    fees: { data:[{l:"Apr",v:88},{l:"May",v:74},{l:"Jun",v:62}], color:T.amber, label:"Collection %" },
    payroll: { data:[{l:"Apr",v:100},{l:"May",v:100},{l:"Jun",v:50}], color:T.blue, label:"Processed %" },
    academic: { data:[{l:"Math",v:88},{l:"Sci",v:86},{l:"Eng",v:80},{l:"Hin",v:78},{l:"SST",v:80},{l:"CS",v:94}], color:T.purple, label:"Avg Score" },
  };
  const { data, color, label } = barData[reportTab];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Avg Attendance" value="93.4%" icon="✅" accent={T.green} />
        <StatCard label="Fee Collection" value="74%" icon="💰" accent={T.amber} />
        <StatCard label="Payroll Done" value="50%" icon="💳" accent={T.blue} />
        <StatCard label="Avg Score" value="84.3%" icon="📚" accent={T.purple} />
      </div>
      <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontSize:16, fontWeight:700, fontFamily:F.display }}>Analytics Dashboard</h3>
          <TabBar tabs={tabs} active={reportTab} onChange={setReportTab} />
        </div>
        <div style={{ padding:24 }}>
          <div style={{ fontSize:12, color:T.muted, marginBottom:16 }}>{label}</div>
          <div style={{ display:"flex", gap:16, alignItems:"flex-end", height:180 }}>
            {data.map(d => (
              <div key={d.l} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color }}>{d.v}%</span>
                <div style={{ width:"100%", background:`${color}18`, borderRadius:"6px 6px 0 0", height:`${d.v*1.6}px`, transition:"height .5s ease", boxShadow:`0 0 16px ${color}30`, background:color }} />
                <span style={{ fontSize:11, color:T.muted }}>{d.l}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn variant="ghost" size="sm">📥 Export PDF</Btn>
            <Btn variant="ghost" size="sm">📊 Export CSV</Btn>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Founder Dashboard ────────────────────────────────────────────────────────
const FounderDashboard = memo(({ user, onLogout }) => {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id:"overview",  icon:"⊞",  label:"Overview" },
    { id:"schools",   icon:"🏫",  label:"Schools" },
    { id:"revenue",   icon:"💰",  label:"Revenue" },
    { id:"trials",    icon:"⏳",  label:"Trials" },
    { id:"analytics", icon:"📊",  label:"Analytics" },
  ];

  const totalMRR = FOUNDER_SCHOOLS.reduce((a,s)=>a+s.mrr,0);

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg }}>
      {/* Sidebar */}
      <div style={{ width:240, background:"#0A0E1A", display:"flex", flexDirection:"column", flexShrink:0, borderRight:`1px solid rgba(168,85,247,.15)` }}>
        <div style={{ padding:"24px 20px 16px" }}>
          <div style={{ fontSize:11, fontFamily:F.mono, fontWeight:700, color:T.purple, letterSpacing:".1em", marginBottom:4 }}>NOVA TEACH</div>
          <div style={{ fontSize:16, fontWeight:800, fontFamily:F.display, color:T.text }}>Control Center</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Founder Dashboard</div>
        </div>
        <div style={{ padding:"0 12px 12px" }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", background:"rgba(168,85,247,.08)", borderRadius:12, border:`1px solid rgba(168,85,247,.2)` }}>
            <Avatar name={user.name} size={32} bg={T.purple} />
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{user.name.split(" ")[0]}</div>
              <div style={{ fontSize:10, color:T.purple, fontWeight:600 }}>FOUNDER</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1, padding:"0 12px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className="nav-btn" style={{ width:"100%", padding:"10px 14px", borderRadius:10, display:"flex", gap:10, alignItems:"center", background: tab===t.id?"rgba(168,85,247,.15)":"transparent", color: tab===t.id?T.purple:T.muted, borderLeft: tab===t.id?`3px solid ${T.purple}`:"3px solid transparent", transition:"all .15s", marginBottom:2, textAlign:"left" }}>
              <span>{t.icon}</span>
              <span style={{ fontSize:13, fontWeight:tab===t.id?600:400 }}>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding:16, borderTop:"1px solid rgba(255,255,255,.06)" }}>
          <button onClick={onLogout} className="nav-btn" style={{ width:"100%", padding:"9px 12px", borderRadius:10, display:"flex", gap:8, alignItems:"center", color:"rgba(239,68,68,.7)", fontSize:13 }}>🚪 Sign Out</button>
        </div>
      </div>

      <div style={{ flex:1, overflow:"auto", padding:28 }}>
        {tab === "overview" && (
          <div className="fadeUp">
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:22, fontWeight:800, fontFamily:F.display }}>Platform Overview</div>
              <div style={{ fontSize:13, color:T.muted }}>Nova Teach Solution · All Schools</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
              <StatCard label="Total Schools" value={FOUNDER_SCHOOLS.length} icon="🏫" accent={T.purple} trend="↑ 2 this month" />
              <StatCard label="Monthly Revenue" value={fmtINR(totalMRR)} icon="💰" accent={T.green} trend="↑ 18% MoM" />
              <StatCard label="Total Students" value="2,061" icon="🎓" accent={T.blue} trend="↑ 304 this month" />
              <StatCard label="Active Trials" value="2" icon="⏳" accent={T.amber} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
              <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                <SectionHead title="Schools Overview" />
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                      {["School","City","Plan","Students","MRR","Status"].map(h => <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted, letterSpacing:".04em" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {FOUNDER_SCHOOLS.map((s,i) => (
                      <tr key={i} className="table-row">
                        {[s.name,s.city,s.plan,s.students,fmtINR(s.mrr),""].map((v,j) => j===5 ? (
                          <td key={j} style={{ padding:"10px 12px" }}><Badge label={s.status} status={s.status} /></td>
                        ) : (
                          <td key={j} style={{ padding:"10px 12px", fontSize:13, color:j===0?T.text:T.muted, fontFamily:j===3||j===4?F.mono:F.body }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid rgba(168,85,247,.25)` }}>
                  <div style={{ fontSize:12, color:T.muted, marginBottom:8 }}>MRR Breakdown</div>
                  {[["Standard (3×)","₹14,997"],["Premium (1×)","₹8,999"],["Basic (1×)","₹2,999"]].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:13, color:T.muted }}>{l}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:T.purple, fontFamily:F.mono }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"linear-gradient(135deg, rgba(34,197,94,.12), rgba(34,197,94,.04))", borderRadius:16, padding:20, border:`1px solid rgba(34,197,94,.3)` }}>
                  <div style={{ fontSize:11, color:T.green, fontWeight:700, marginBottom:6 }}>ARR PROJECTION</div>
                  <div style={{ fontSize:28, fontWeight:800, fontFamily:F.display, color:T.green }}>{fmtINR(totalMRR*12)}</div>
                  <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>Based on current MRR</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "schools" && (
          <div className="fadeUp">
            <SectionHead title="All Schools" subtitle={`${FOUNDER_SCHOOLS.length} schools on platform`} action={<Btn variant="primary" size="sm">+ Onboard School</Btn>} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
              {FOUNDER_SCHOOLS.map((s,i) => (
                <div key={i} className="card-hover" style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, transition:"all .2s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:T.purpleDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🏫</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15 }}>{s.name}</div>
                        <div style={{ fontSize:12, color:T.muted }}>{s.city}</div>
                      </div>
                    </div>
                    <Badge label={s.status} status={s.status} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                    {[["Plan",s.plan],["Students",s.students],["MRR",fmtINR(s.mrr)]].map(([l,v])=>(
                      <div key={l} style={{ background:T.bg, borderRadius:8, padding:10, textAlign:"center" }}>
                        <div style={{ fontSize:13, fontWeight:700 }}>{v}</div>
                        <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === "revenue" || tab === "trials" || tab === "analytics") && (
          <div className="fadeUp">
            <ReportsModule />
          </div>
        )}
      </div>
    </div>
  );
});

// ─── School Owner Dashboard ───────────────────────────────────────────────────
const OwnerDashboard = memo(({ user, onLogout }) => {
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [studentModal, setStudentModal] = useState(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [leavesData, setLeavesData] = useState([
    { name:"Mr. Kiran Mehta", type:"Medical", from:"Jun 8", to:"Jun 12", days:5, status:"Pending", reason:"Surgery" },
    { name:"Ms. Ritu Bansal",  type:"Casual",  from:"Jun 15",to:"Jun 15",days:1, status:"Approved",reason:"Personal" },
    { name:"Mr. Sanjay Pillai",type:"Earned",  from:"Jun 20",to:"Jun 22",days:3, status:"Pending", reason:"Family function" },
  ]);

  const navItems = [
    { id:"overview",       icon:"⊞",  label:"Overview" },
    { id:"attendance",     icon:"📱",  label:"Attendance" },
    { id:"students",       icon:"🎓",  label:"Students" },
    { id:"staff",          icon:"👥",  label:"Staff" },
    { id:"fees",           icon:"💰",  label:"Fees" },
    { id:"exams",          icon:"📝",  label:"Exams" },
    { id:"assignments",    icon:"📚",  label:"Assignments" },
    { id:"lms",            icon:"🖥️",  label:"LMS" },
    { id:"ai",             icon:"✨",  label:"AI Tools" },
    { id:"leave",          icon:"📅",  label:"Leave" },
    { id:"reports",        icon:"📊",  label:"Reports" },
    { id:"notifications",  icon:"🔔",  label:"Notifications" },
    { id:"billing",        icon:"💳",  label:"Billing" },
  ];

  const filteredStudents = STUDENTS.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.class.toLowerCase().includes(search.toLowerCase()));
  const unread = notifications.filter(n=>!n.read).length;

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg }}>
      {/* Sidebar */}
      <div style={{ width:232, background:T.surface, display:"flex", flexDirection:"column", flexShrink:0, borderRight:`1px solid ${T.border}`, overflowY:"auto" }}>
        <div style={{ padding:"20px 16px 12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:T.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏫</div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, fontFamily:F.display, color:T.text }}>NexaAttend</div>
              <div style={{ fontSize:9, fontFamily:F.mono, color:T.muted, letterSpacing:".06em" }}>SCHOOL ERP</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", background:T.card, borderRadius:12 }}>
            <Avatar name={user.name} size={30} bg={T.green} />
            <div>
              <div style={{ fontSize:12, fontWeight:700 }}>{user.name.split(" ")[0]}</div>
              <div style={{ fontSize:10, color:T.green, fontWeight:600 }}>👑 OWNER</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1, padding:"0 8px 8px" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={()=>setTab(n.id)} className="nav-btn" style={{ width:"100%", padding:"9px 14px", borderRadius:10, display:"flex", gap:10, alignItems:"center", background: tab===n.id?T.greenDim:"transparent", color: tab===n.id?T.green:T.muted, borderLeft: tab===n.id?`3px solid ${T.green}`:"3px solid transparent", transition:"all .15s", marginBottom:1, textAlign:"left", position:"relative" }}>
              <span style={{ fontSize:15 }}>{n.icon}</span>
              <span style={{ fontSize:13, fontWeight:tab===n.id?600:400 }}>{n.label}</span>
              {n.id==="notifications" && unread > 0 && <span style={{ marginLeft:"auto", background:T.red, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:10 }}>{unread}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding:12, borderTop:`1px solid ${T.border}` }}>
          <div style={{ background:T.greenDim, borderRadius:12, padding:"10px 14px", marginBottom:10 }}>
            <div style={{ fontSize:10, color:T.green, fontWeight:700 }}>TRIAL — 4 DAYS LEFT</div>
            <ProgressBar value={3} max={7} color={T.green} height={4} />
          </div>
          <button onClick={onLogout} className="nav-btn" style={{ width:"100%", padding:"8px 12px", borderRadius:10, display:"flex", gap:8, alignItems:"center", color:"rgba(239,68,68,.7)", fontSize:12 }}>🚪 Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <h1 style={{ fontSize:16, fontWeight:700, fontFamily:F.display }}>
            {navItems.find(n=>n.id===tab)?.label || "Overview"}
          </h1>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <button onClick={()=>setTab("notifications")} style={{ position:"relative", fontSize:20 }}>
              🔔
              {unread > 0 && <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%", background:T.red, color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{unread}</span>}
            </button>
            <Avatar name={user.name} size={32} bg={T.green} />
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:24 }}>

          {tab === "overview" && (
            <div className="fadeUp">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
                <StatCard label="Total Students" value="304" sub="Enrolled this year" icon="🎓" accent={T.green} trend="↑ 12 this month" />
                <StatCard label="Present Today" value="284" sub="93.4% rate" icon="✅" accent={T.blue} />
                <StatCard label="Fee Collected" value="₹87,500" sub="June 2026" icon="💰" accent={T.amber} />
                <StatCard label="Active Staff" value="5" sub="1 on leave" icon="👥" accent={T.purple} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
                <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                  <SectionHead title="Weekly Attendance" />
                  <div style={{ display:"flex", gap:12, alignItems:"flex-end", height:110 }}>
                    {WEEKLY_ATT.map(d => (
                      <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:T.green }}>{d.pct}%</span>
                        <div style={{ width:"100%", background:T.green, borderRadius:"4px 4px 0 0", height:`${(d.pct-88)*11}px`, minHeight:4, boxShadow:`0 0 10px ${T.greenGlow}` }} />
                        <span style={{ fontSize:11, color:T.muted }}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                  <SectionHead title="Fee Status" />
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:32, fontWeight:800, color:T.green, fontFamily:F.display }}>74%</div>
                    <div style={{ fontSize:12, color:T.muted, marginBottom:16 }}>Collection rate</div>
                    <ProgressBar value={74} showLabel />
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontSize:11, color:T.muted }}>
                      <span>Paid: ₹87.5K</span><span>Due: ₹25K</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
                <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                  <SectionHead title="Recent Activity" />
                  {[
                    { icon:"✅", text:"Attendance taken — Class X-A",        time:"9:12 AM" },
                    { icon:"💰", text:"Fee: Priya Sharma ₹12,500",           time:"10:30 AM" },
                    { icon:"📝", text:"Exam scheduled: Mathematics (X-A)",   time:"11:15 AM" },
                    { icon:"📚", text:"Assignment by Mr. Kulkarni",           time:"12:00 PM" },
                    { icon:"👤", text:"New student: Riya Bhatt enrolled",     time:"2:45 PM" },
                  ].map((a,i) => (
                    <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0", borderBottom:i<4?`1px solid ${T.border}`:"none" }}>
                      <span style={{ fontSize:16 }}>{a.icon}</span>
                      <div style={{ flex:1, fontSize:13 }}>{a.text}</div>
                      <span style={{ fontSize:11, color:T.muted }}>{a.time}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                  <SectionHead title="Quick Overview" />
                  {[
                    { icon:"🎓", label:"Students", val:"304", color:T.green },
                    { icon:"👨‍🏫", label:"Teachers", val:"6",   color:T.blue },
                    { icon:"📚", label:"Courses",  val:"8",   color:T.purple },
                    { icon:"💰", label:"MRR",      val:"₹4.9K",color:T.amber },
                  ].map(t => (
                    <div key={t.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:T.bg, borderRadius:10, marginBottom:8 }}>
                      <span style={{ fontSize:13 }}>{t.icon} {t.label}</span>
                      <span style={{ fontWeight:700, color:t.color }}>{t.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "attendance" && <div className="fadeUp"><QRAttendanceDemo /></div>}

          {tab === "students" && (
            <div className="fadeUp">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
                <StatCard label="Total" value="304" accent={T.green} icon="🎓" />
                <StatCard label="Present Today" value="284" accent={T.blue} icon="✅" />
                <StatCard label="Fee Defaulters" value="3" accent={T.red} icon="⚠️" />
                <StatCard label="New This Month" value="12" accent={T.amber} icon="✨" />
              </div>
              <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ fontSize:15, fontWeight:700, fontFamily:F.display }}>Student Directory</h3>
                  <div style={{ width:260 }}><SearchBar value={search} onChange={setSearch} placeholder="Search students…" /></div>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:T.bg }}>
                      {["Student","Class","Attendance","Grade","Fees","Action"].map(h => <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted, letterSpacing:".04em" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s,i) => (
                      <tr key={s.id} className="table-row">
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                            <Avatar name={s.name} size={32} bg={T.green} />
                            <div>
                              <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                              <div style={{ fontSize:11, color:T.muted }}>Roll #{s.roll}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:T.muted }}>{s.class}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:48, height:4, background:T.hint, borderRadius:4, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${s.attend}%`, background:s.attend>85?T.green:T.red, borderRadius:4 }} />
                            </div>
                            <span style={{ fontSize:12, color:s.attend>85?T.green:T.red, fontWeight:700 }}>{s.attend}%</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px" }}><span style={{ fontSize:13, fontWeight:700, color:T.amber }}>{s.grade}</span></td>
                        <td style={{ padding:"12px 16px" }}><Badge label={s.fees} status={s.fees} /></td>
                        <td style={{ padding:"12px 16px" }}><Btn variant="ghost" size="sm" onClick={()=>setStudentModal(s)}>View →</Btn></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "staff" && (
            <div className="fadeUp">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
                <StatCard label="Total Staff" value="6" accent={T.green} />
                <StatCard label="Active" value="5" accent={T.blue} />
                <StatCard label="On Leave" value="1" accent={T.amber} />
                <StatCard label="Avg Salary" value="₹53K" accent={T.purple} />
              </div>
              <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}` }}>
                  <h3 style={{ fontSize:15, fontWeight:700 }}>Staff Directory</h3>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:T.bg }}>
                      {["Employee","Role","Dept","Experience","Salary","Status"].map(h => <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {STAFF.map(s => (
                      <tr key={s.id} className="table-row">
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                            <Avatar name={s.name} size={32} bg="#1A2B4A" />
                            <span style={{ fontSize:13, fontWeight:600 }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:13 }}>{s.role}</td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:T.muted }}>{s.dept}</td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:T.muted }}>{s.exp}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono }}>{fmtINR(s.salary)}</td>
                        <td style={{ padding:"12px 16px" }}><Badge label={s.status} status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "fees" && (
            <div className="fadeUp">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
                <StatCard label="Total Expected" value="₹1.02L" accent={T.green} icon="💰" />
                <StatCard label="Collected" value="₹87.5K" accent={T.blue} icon="✅" />
                <StatCard label="Due" value="₹25K" accent={T.red} icon="⚠️" />
                <StatCard label="Collection Rate" value="74%" accent={T.amber} icon="📊" />
              </div>
              <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:T.bg }}>
                      {["Student","Class","Amount","Paid","Due","Status"].map(h => <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {FEES_DATA.map((f,i) => (
                      <tr key={i} className="table-row">
                        <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600 }}>{f.name}</td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:T.muted }}>{f.class}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono }}>{fmtINR(f.amt)}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono, color:T.green }}>{fmtINR(f.paid)}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono, color:f.amt-f.paid>0?T.red:T.muted }}>{fmtINR(f.amt-f.paid)}</td>
                        <td style={{ padding:"12px 16px" }}><Badge label={f.status} status={f.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "exams" && (
            <div className="fadeUp">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
                <StatCard label="Total" value="5" accent={T.green} />
                <StatCard label="Upcoming" value="2" accent={T.blue} />
                <StatCard label="Active" value="2" accent={T.amber} />
                <StatCard label="Completed" value="1" accent={T.muted} />
              </div>
              <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}` }}>
                {EXAMS.map((e,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:i<EXAMS.length-1?`1px solid ${T.border}`:"none" }}>
                    <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:T.greenDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📝</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>{e.title}</div>
                        <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Classes: {e.class} · Max: {e.max} marks · {e.date}</div>
                      </div>
                    </div>
                    <Badge label={e.status} status={e.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "assignments" && (
            <div className="fadeUp">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
                {ASSIGNMENTS.map((a,i) => (
                  <div key={i} className="card-hover" style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, transition:"all .2s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15 }}>{a.title}</div>
                        <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>{a.class} · {a.teacher} · Due {a.due}</div>
                      </div>
                      <span style={{ fontSize:22 }}>📚</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.muted, marginBottom:8 }}>
                      <span>Submitted</span>
                      <span style={{ fontWeight:700, color:T.text }}>{a.sub}/{a.total}</span>
                    </div>
                    <ProgressBar value={a.sub} max={a.total} showLabel />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "lms" && <div className="fadeUp"><LMSModule /></div>}
          {tab === "ai"  && <div className="fadeUp"><AIModule /></div>}

          {tab === "leave" && (
            <div className="fadeUp">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
                <StatCard label="Total Requests" value={leavesData.length} accent={T.green} />
                <StatCard label="Pending" value={leavesData.filter(l=>l.status==="Pending").length} accent={T.amber} />
                <StatCard label="Approved" value={leavesData.filter(l=>l.status==="Approved").length} accent={T.green} />
                <StatCard label="Rejected" value={leavesData.filter(l=>l.status==="Rejected").length} accent={T.red} />
              </div>
              <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}` }}>
                {leavesData.map((l,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:i<leavesData.length-1?`1px solid ${T.border}`:"none" }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <Avatar name={l.name} size={38} bg="#1A2B4A" />
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{l.name}</div>
                        <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{l.type} · {l.from}–{l.to} ({l.days}d) · "{l.reason}"</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <Badge label={l.status} status={l.status} />
                      {l.status === "Pending" && (
                        <>
                          <Btn variant="success" size="sm" onClick={()=>setLeavesData(p=>p.map(x=>x===l?{...x,status:"Approved"}:x))}>Approve</Btn>
                          <Btn variant="danger" size="sm" onClick={()=>setLeavesData(p=>p.map(x=>x===l?{...x,status:"Rejected"}:x))}>Reject</Btn>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "reports" && <div className="fadeUp"><ReportsModule /></div>}

          {tab === "notifications" && (
            <div className="fadeUp">
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                <div style={{ fontSize:13, color:T.muted }}>{unread} unread</div>
                <Btn variant="ghost" size="sm" onClick={()=>setNotifications(n=>n.map(x=>({...x,read:true})))}>Mark all read</Btn>
              </div>
              {notifications.map(n => (
                <div key={n.id} onClick={()=>setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))} className="card-hover" style={{ background:T.card, borderRadius:16, padding:16, marginBottom:10, border:`1px solid ${n.read?T.border:T.green}`, display:"flex", gap:14, cursor:"pointer", transition:"all .15s", opacity:n.read?.75:1 }}>
                  <span style={{ fontSize:22 }}>{n.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{n.title}</div>
                    <div style={{ fontSize:13, color:T.muted, marginTop:2 }}>{n.body}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                    <span style={{ fontSize:11, color:T.muted, whiteSpace:"nowrap" }}>{n.time}</span>
                    {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:T.green }} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "billing" && (
            <div className="fadeUp">
              <div style={{ background:`linear-gradient(135deg, rgba(34,197,94,.15), rgba(34,197,94,.05))`, borderRadius:20, padding:28, border:`1px solid rgba(34,197,94,.3)`, marginBottom:24 }}>
                <div style={{ fontSize:11, color:T.green, fontWeight:700, letterSpacing:".08em", marginBottom:8 }}>CURRENT PLAN</div>
                <div style={{ fontSize:28, fontWeight:800, fontFamily:F.display, marginBottom:4 }}>Standard Plan</div>
                <div style={{ fontSize:14, color:T.muted, marginBottom:20 }}>₹4,999/month · Renews Jul 1, 2026</div>
                <div style={{ display:"flex", gap:20, flexWrap:"wrap", fontSize:13, color:T.muted }}>
                  {["500 students","AI QR Attendance","Full LMS","Priority Support"].map(f=><span key={f} style={{ color:T.green }}>✓ {f}</span>)}
                </div>
              </div>
              <SectionHead title="Billing History" />
              <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:T.bg }}>
                      {["Invoice","Date","Plan","Amount","Status"].map(h=><th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id:"INV-006", date:"Jun 1, 2026", plan:"Standard", amt:4999, status:"Paid" },
                      { id:"INV-005", date:"May 1, 2026", plan:"Standard", amt:4999, status:"Paid" },
                      { id:"INV-004", date:"Apr 1, 2026", plan:"Standard", amt:4999, status:"Paid" },
                    ].map(inv => (
                      <tr key={inv.id} className="table-row">
                        <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono, color:T.green }}>{inv.id}</td>
                        <td style={{ padding:"12px 16px", fontSize:13 }}>{inv.date}</td>
                        <td style={{ padding:"12px 16px", fontSize:13 }}>{inv.plan}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono }}>{fmtINR(inv.amt)}</td>
                        <td style={{ padding:"12px 16px" }}><Badge label={inv.status} status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Modal */}
      <Modal open={!!studentModal} onClose={()=>setStudentModal(null)} width={480} title="Student Profile">
        {studentModal && (
          <div style={{ padding:24 }}>
            <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:20 }}>
              <Avatar name={studentModal.name} size={56} bg={T.green} />
              <div>
                <div style={{ fontSize:18, fontWeight:700 }}>{studentModal.name}</div>
                <div style={{ fontSize:13, color:T.muted }}>{studentModal.class} · Roll #{studentModal.roll}</div>
                <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{studentModal.city}, Ahmedabad</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
              <StatCard label="Attendance" value={`${studentModal.attend}%`} accent={studentModal.attend>85?T.green:T.red} />
              <StatCard label="Grade" value={studentModal.grade} accent={T.amber} />
              <StatCard label="Fees" value={studentModal.fees} accent={statusColor(studentModal.fees)} />
            </div>
            <Btn variant="primary" size="md" style={{ width:"100%", justifyContent:"center" }}>View Full Profile</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
});

// ─── Student Dashboard ────────────────────────────────────────────────────────
const StudentDashboard = memo(({ user, onLogout }) => {
  const [tab, setTab] = useState("dashboard");
  const me = STUDENTS[0];
  const tabs = [
    { id:"dashboard",   icon:"⊞", label:"Dashboard" },
    { id:"courses",     icon:"📚", label:"My Courses" },
    { id:"attendance",  icon:"✅", label:"Attendance" },
    { id:"assignments", icon:"📝", label:"Assignments" },
    { id:"grades",      icon:"📊", label:"Grades" },
  ];

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg }}>
      <div style={{ width:220, background:T.surface, display:"flex", flexDirection:"column", flexShrink:0, borderRight:`1px solid ${T.border}` }}>
        <div style={{ padding:"20px 16px 12px" }}>
          <div style={{ fontSize:13, fontWeight:800, fontFamily:F.display, marginBottom:12 }}>NexaAttend</div>
          <div style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", background:T.card, borderRadius:12 }}>
            <Avatar name={user.name} size={30} bg={T.amber} />
            <div>
              <div style={{ fontSize:12, fontWeight:700 }}>{user.name.split(" ")[0]}</div>
              <div style={{ fontSize:10, color:T.amber, fontWeight:600 }}>🎓 STUDENT</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1, padding:"0 8px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className="nav-btn" style={{ width:"100%", padding:"9px 14px", borderRadius:10, display:"flex", gap:10, alignItems:"center", background:tab===t.id?T.amberDim:"transparent", color:tab===t.id?T.amber:T.muted, borderLeft:tab===t.id?`3px solid ${T.amber}`:"3px solid transparent", transition:"all .15s", marginBottom:1, textAlign:"left" }}>
              <span>{t.icon}</span><span style={{ fontSize:13, fontWeight:tab===t.id?600:400 }}>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding:12, borderTop:`1px solid ${T.border}` }}>
          <button onClick={onLogout} className="nav-btn" style={{ width:"100%", padding:"8px 12px", borderRadius:10, display:"flex", gap:8, alignItems:"center", color:"rgba(239,68,68,.7)", fontSize:12 }}>🚪 Sign Out</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:24 }}>
        {tab === "dashboard" && (
          <div className="fadeUp">
            <div style={{ display:"flex", gap:16, alignItems:"center", padding:20, background:T.card, borderRadius:16, marginBottom:24, border:`1px solid ${T.border}` }}>
              <Avatar name={me.name} size={56} bg={T.amber} />
              <div>
                <div style={{ fontSize:20, fontWeight:800, fontFamily:F.display }}>{me.name}</div>
                <div style={{ fontSize:14, color:T.muted }}>{me.class} · Roll #{me.roll} · Sunrise Academy</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
              <StatCard label="Attendance" value={`${me.attend}%`} icon="✅" accent={T.green} />
              <StatCard label="Grade" value={me.grade} icon="⭐" accent={T.amber} />
              <StatCard label="Courses" value={COURSES.filter(c=>c.enrolled).length} icon="📚" accent={T.blue} />
              <StatCard label="Pending Tasks" value="3" icon="📝" accent={T.purple} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
              <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                <SectionHead title="Enrolled Courses" />
                {COURSES.filter(c=>c.enrolled).map(c => (
                  <div key={c.id} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:`${c.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{c.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{c.title}</div>
                      <ProgressBar value={c.progress} color={c.color} height={4} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:c.color }}>{c.progress}%</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                  <SectionHead title="Today" />
                  {[{time:"08:00",sub:"Physics",room:"Lab 2"},{time:"10:00",sub:"Maths",room:"Room 101"},{time:"14:00",sub:"English",room:"Room 203"}].map((c,i)=>(
                    <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i<2?`1px solid ${T.border}`:"none" }}>
                      <span style={{ fontSize:11, color:T.muted, fontFamily:F.mono, minWidth:44 }}>{c.time}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{c.sub}</div>
                        <div style={{ fontSize:11, color:T.muted }}>{c.room}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === "courses" && <div className="fadeUp"><LMSModule /></div>}
        {tab === "grades" && (
          <div className="fadeUp">
            <SectionHead title="My Grades" subtitle="Current term performance" />
            <div style={{ background:T.card, borderRadius:16, padding:24, border:`1px solid ${T.border}` }}>
              {GRADEBOOK.map((g,i) => (
                <div key={i} style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{g.sub}</span>
                    <span style={{ fontWeight:800, color:g.color, fontSize:16 }}>{g.score}/100</span>
                  </div>
                  <ProgressBar value={g.score} color={g.color} showLabel height={8} />
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "attendance" && (
          <div className="fadeUp">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
              <StatCard label="Overall" value={`${me.attend}%`} accent={T.green} />
              <StatCard label="Present" value="132" accent={T.blue} />
              <StatCard label="Absent" value="8" accent={T.red} />
            </div>
            <div style={{ background:T.card, borderRadius:16, padding:24, border:`1px solid ${T.border}` }}>
              <SectionHead title="This Week" />
              <div style={{ display:"flex", gap:20, justifyContent:"space-around" }}>
                {["Mon","Tue","Wed","Thu","Fri"].map((d,i) => (
                  <div key={d} style={{ textAlign:"center" }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", marginBottom:8, background:i!==2?T.greenDim:"rgba(239,68,68,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{i!==2?"✅":"❌"}</div>
                    <div style={{ fontSize:12, color:T.muted }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === "assignments" && (
          <div className="fadeUp">
            {ASSIGNMENTS.slice(0,3).map((a,i) => (
              <div key={i} className="card-hover" style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, marginBottom:12, transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{a.title}</div>
                    <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>{a.class} · Due {a.due}</div>
                  </div>
                  <Btn variant="primary" size="sm">Submit</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Parent Dashboard ─────────────────────────────────────────────────────────
const ParentDashboard = memo(({ user, onLogout }) => {
  const child = STUDENTS[0];
  const week = ["Mon","Tue","Wed","Thu","Fri"].map((d,i)=>({ day:d, present:i!==2 }));
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg }}>
      <div style={{ width:220, background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 16px" }}>
          <div style={{ fontSize:13, fontWeight:800, fontFamily:F.display, marginBottom:12 }}>NexaAttend</div>
          <div style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", background:T.card, borderRadius:12 }}>
            <Avatar name={user.name} size={30} bg={T.cyan} />
            <div>
              <div style={{ fontSize:12, fontWeight:700 }}>{user.name.split(" ")[0]}</div>
              <div style={{ fontSize:10, color:T.cyan, fontWeight:600 }}>👪 PARENT</div>
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="nav-btn" style={{ margin:"auto 12px 12px", padding:"8px 12px", borderRadius:10, display:"flex", gap:8, alignItems:"center", color:"rgba(239,68,68,.7)", fontSize:12 }}>🚪 Sign Out</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:24 }}>
        <div className="fadeUp">
          <div style={{ background:T.card, borderRadius:20, padding:24, marginBottom:24, border:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              <Avatar name={child.name} size={64} bg={T.green} />
              <div>
                <div style={{ fontSize:22, fontWeight:800, fontFamily:F.display }}>{child.name}</div>
                <div style={{ fontSize:14, color:T.muted }}>{child.class} · Roll #{child.roll} · Sunrise Academy</div>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
            <StatCard label="Attendance" value={`${child.attend}%`} icon="✅" accent={T.green} />
            <StatCard label="Fees" value={child.fees} icon="💰" accent={statusColor(child.fees)} />
            <StatCard label="Class Rank" value="#2" icon="🏆" accent={T.amber} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
              <SectionHead title="This Week's Attendance" />
              <div style={{ display:"flex", justifyContent:"space-around" }}>
                {week.map(d => (
                  <div key={d.day} style={{ textAlign:"center" }}>
                    <div style={{ width:42, height:42, borderRadius:"50%", marginBottom:8, background:d.present?T.greenDim:"rgba(239,68,68,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{d.present?"✅":"❌"}</div>
                    <div style={{ fontSize:12, color:T.muted }}>{d.day}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
              <SectionHead title="Academic Scores" />
              {GRADEBOOK.slice(0,4).map((g,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:i<3?`1px solid ${T.border}`:"none" }}>
                  <span style={{ fontSize:13 }}>{g.sub}</span>
                  <span style={{ fontWeight:700, color:g.color }}>{g.score}/100</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
const TeacherDashboard = memo(({ user, onLogout }) => {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id:"overview",    icon:"⊞",  label:"Overview" },
    { id:"attendance",  icon:"📱",  label:"Attendance" },
    { id:"students",    icon:"🎓",  label:"Students" },
    { id:"assignments", icon:"📚",  label:"Assignments" },
    { id:"lms",         icon:"🖥️",  label:"LMS" },
    { id:"ai",          icon:"✨",  label:"AI Tools" },
  ];
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg }}>
      <div style={{ width:220, background:T.surface, display:"flex", flexDirection:"column", flexShrink:0, borderRight:`1px solid ${T.border}` }}>
        <div style={{ padding:"20px 16px 12px" }}>
          <div style={{ fontSize:13, fontWeight:800, fontFamily:F.display, marginBottom:12 }}>NexaAttend</div>
          <div style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", background:T.card, borderRadius:12 }}>
            <Avatar name={user.name} size={30} bg={T.blue} />
            <div>
              <div style={{ fontSize:12, fontWeight:700 }}>{user.name.split(" ")[0]}</div>
              <div style={{ fontSize:10, color:T.blue, fontWeight:600 }}>👨‍🏫 TEACHER</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1, padding:"0 8px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className="nav-btn" style={{ width:"100%", padding:"9px 14px", borderRadius:10, display:"flex", gap:10, alignItems:"center", background:tab===t.id?T.blueDim:"transparent", color:tab===t.id?T.blue:T.muted, borderLeft:tab===t.id?`3px solid ${T.blue}`:"3px solid transparent", transition:"all .15s", marginBottom:1, textAlign:"left" }}>
              <span>{t.icon}</span><span style={{ fontSize:13, fontWeight:tab===t.id?600:400 }}>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding:12, borderTop:`1px solid ${T.border}` }}>
          <button onClick={onLogout} className="nav-btn" style={{ width:"100%", padding:"8px 12px", borderRadius:10, display:"flex", gap:8, alignItems:"center", color:"rgba(239,68,68,.7)", fontSize:12 }}>🚪 Sign Out</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:24 }}>
        {tab === "overview" && (
          <div className="fadeUp">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
              <StatCard label="My Classes" value="3" icon="🏫" accent={T.blue} />
              <StatCard label="Students" value="88" icon="🎓" accent={T.green} />
              <StatCard label="Assignments" value="5" icon="📚" accent={T.amber} />
              <StatCard label="Avg Attendance" value="92%" icon="✅" accent={T.purple} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
              <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                <SectionHead title="My Classes Today" />
                {[{time:"08:00",class:"X-A",sub:"Mathematics",room:"Room 101",students:30},{time:"11:00",class:"IX-B",sub:"Mathematics",room:"Room 205",students:28},{time:"14:00",class:"XI-C",sub:"Mathematics",room:"Lab 1",students:32}].map((c,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<2?`1px solid ${T.border}`:"none" }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <div style={{ fontFamily:F.mono, fontSize:12, color:T.muted, minWidth:48 }}>{c.time}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>Class {c.class} — {c.sub}</div>
                        <div style={{ fontSize:12, color:T.muted }}>{c.room} · {c.students} students</div>
                      </div>
                    </div>
                    <Btn variant="primary" size="sm">Take Attendance</Btn>
                  </div>
                ))}
              </div>
              <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}` }}>
                <SectionHead title="Quick Actions" />
                {[["📝 Create Assignment","Create new"],["❓ Generate Quiz","AI-powered"],["📊 View Reports","Analytics"],["📱 Take Attendance","QR scan"]].map(([l,s])=>(
                  <button key={l} className="nav-btn" style={{ width:"100%", padding:"10px 14px", borderRadius:10, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6, background:T.bg }}>
                    <span style={{ fontSize:13, color:T.text }}>{l}</span>
                    <span style={{ fontSize:11, color:T.muted }}>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === "attendance" && <div className="fadeUp"><QRAttendanceDemo /></div>}
        {tab === "students" && (
          <div className="fadeUp">
            <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:T.bg }}>
                    {["Student","Class","Attendance","Grade"].map(h=><th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {STUDENTS.map(s=>(
                    <tr key={s.id} className="table-row">
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                          <Avatar name={s.name} size={30} bg={T.blue} />
                          <span style={{ fontSize:13, fontWeight:600 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px", fontSize:12, color:T.muted }}>{s.class}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:s.attend>85?T.green:T.red }}>{s.attend}%</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ fontSize:13, fontWeight:700, color:T.amber }}>{s.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === "assignments" && (
          <div className="fadeUp">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <SectionHead title="My Assignments" />
              <Btn variant="primary" size="sm">+ New Assignment</Btn>
            </div>
            {ASSIGNMENTS.map((a,i)=>(
              <div key={i} className="card-hover" style={{ background:T.card, borderRadius:16, padding:20, marginBottom:12, border:`1px solid ${T.border}`, transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{a.title}</div>
                    <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>{a.class} · Due {a.due}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:700 }}>{a.sub}/{a.total}</div>
                    <div style={{ fontSize:11, color:T.muted }}>submitted</div>
                  </div>
                </div>
                <ProgressBar value={a.sub} max={a.total} showLabel />
              </div>
            ))}
          </div>
        )}
        {tab === "lms" && <div className="fadeUp"><LMSModule /></div>}
        {tab === "ai"  && <div className="fadeUp"><AIModule /></div>}
      </div>
    </div>
  );
});

// ─── Login / Role Selector Screen ─────────────────────────────────────────────
const LoginScreen = memo(({ selectedRole, onLogin, onBack }) => {
  if(!selectedRole) return null;
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:520 }}>
        <button onClick={onBack} style={{ fontSize:13, color:T.muted, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>{selectedRole.icon}</div>
          <h2 style={{ fontFamily:F.display, fontSize:28, fontWeight:800, marginBottom:8 }}>Sign in as {selectedRole.label}</h2>
          <p style={{ fontSize:14, color:T.muted }}>{selectedRole.org}</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <button onClick={()=>onLogin(selectedRole)} style={{ padding:"16px 24px", borderRadius:16, border:`1px solid ${T.border}`, background:T.card, color:T.text, fontSize:15, fontWeight:600, display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"all .2s", fontFamily:F.body }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.green}
            onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
            <div style={{ width:40, height:40, borderRadius:12, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, border:`1px solid ${T.border}` }}>G</div>
            <div style={{ textAlign:"left" }}>
              <div>Continue with Google</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:1 }}>{selectedRole.email}</div>
            </div>
          </button>
          <button onClick={()=>onLogin(selectedRole)} style={{ padding:"16px 24px", borderRadius:16, border:`1px solid ${selectedRole.color}40`, background:`${selectedRole.color}10`, color:selectedRole.color, fontSize:15, fontWeight:600, cursor:"pointer", transition:"all .15s", fontFamily:F.body }}
            onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
            onMouseLeave={e=>e.currentTarget.style.filter=""}>
            {selectedRole.icon} Enter Demo Mode
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:24 }}>
          <p style={{ fontSize:12, color:T.muted }}>Demo data only · No real account created</p>
        </div>
        <div style={{ marginTop:32, padding:20, background:T.card, borderRadius:16, border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:12, color:T.muted, marginBottom:12, fontWeight:600 }}>ALSO TRY</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {DEMO_ROLES.map(r => (
              <button key={r.id} onClick={()=>onLogin(r)} style={{ padding:"6px 14px", borderRadius:10, fontSize:12, fontWeight:600, background:T.bg, color:T.muted, border:`1px solid ${T.border}`, cursor:"pointer" }}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Landing Page ──────────────────────────────────────────────────────────
const LP_FEATURES = [
  { icon: "📱", title: "QR Attendance", body: "Students scan a session QR code at the door. Attendance lands in the register before the bell finishes ringing — no rosters, no roll call." },
  { icon: "🖥️", title: "Full LMS", body: "Courses, quizzes, live classes, and a shared library — so teaching and attendance live in one place instead of three different apps." },
  { icon: "✨", title: "AI Tools", body: "Generate assignments, quizzes, and performance analysis in seconds, scoped to the exact class and subject a teacher is standing in front of." },
  { icon: "💰", title: "Fees & Payroll", body: "Track collection by student and class, run payroll for staff, and see exactly what's outstanding without exporting a single spreadsheet." },
  { icon: "📊", title: "Reports", body: "Attendance, academic, and financial trends in one dashboard — built for the conversations a Principal actually has with a Board." },
  { icon: "👪", title: "Parent Visibility", body: "Parents see attendance, grades, and fee status the moment they're updated — fewer calls to the front office, more trust in the school." },
];

const LP_STEPS = [
  { n: "01", title: "Generate the session QR", body: "A teacher opens NexaAttend and generates a one-time QR code for that class period — refreshes automatically so codes can't be shared ahead of time." },
  { n: "02", title: "Students scan in", body: "Each student scans with any phone camera. Attendance is logged with a timestamp and confidence score, instantly, no app install required." },
  { n: "03", title: "Everyone sees it live", body: "Owners see the school-wide dashboard update in real time. Parents get the same record the moment it's marked — present, late, or absent." },
];

const LP_PLANS = [
  { name: "Basic", price: 2999, students: "Up to 250 students", color: T.blue, features: ["QR Attendance", "Student & Staff records", "Fee tracking", "Email support"] },
  { name: "Standard", price: 4999, students: "Up to 500 students", color: T.green, popular: true, features: ["Everything in Basic", "Full LMS & Quizzes", "AI assignment tools", "Priority support"] },
  { name: "Premium", price: 8999, students: "Unlimited students", color: T.purple, features: ["Everything in Standard", "Live classes", "Multi-branch reporting", "Dedicated onboarding"] },
];

const LP_FAQS = [
  { q: "Do students need to install an app?", a: "No. Scanning works with any phone's default camera app — there's nothing to download for students or parents." },
  { q: "What happens if a student doesn't have a phone?", a: "Teachers can mark attendance manually from the same dashboard in a few taps; QR scanning is the fast path, not the only path." },
  { q: "Can we migrate existing student and fee records?", a: "Yes — our onboarding team imports your existing spreadsheets during setup, included in every plan." },
  { q: "Is there a contract or can we cancel anytime?", a: "Plans are billed monthly with no lock-in. You can cancel before your next renewal date at any time." },
];

const LPNavLink = ({ children, href }) => (
  <a href={href} className="lp-link" style={{ fontSize: 14, color: "rgba(28,27,23,0.7)", fontWeight: 500 }}>{children}</a>
);

const LPSectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.green, marginBottom: 12, fontFamily: F.mono }}>
    {children}
  </div>
);

const LandingPage = memo(({ onSelectRole }) => {
  const [scanTick, setScanTick] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setScanTick(t => (t + 1) % ATTENDANCE_LOG.length), 1400);
    return () => clearInterval(id);
  }, []);

  const liveRow = ATTENDANCE_LOG[scanTick];

  return (
    <>
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(247,245,239,0.92)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏫</div>
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 16, color: T.text }}>{SITE.name}</span>
          </div>
          <nav className="lp-hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <LPNavLink href="#features">Features</LPNavLink>
            <LPNavLink href="#how-it-works">How it works</LPNavLink>
            <LPNavLink href="#pricing">Pricing</LPNavLink>
            <LPNavLink href="#faq">FAQ</LPNavLink>
          </nav>
          <div className="lp-hide-mobile" style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" size="md" onClick={() => onSelectRole(DEMO_ROLES[1])}>Sign in</Btn>
            <Btn variant="primary" size="md" onClick={() => onSelectRole(DEMO_ROLES[1])}>Try the demo →</Btn>
          </div>
          <button
            onClick={() => setMobileNavOpen(v => !v)}
            aria-label="Toggle menu"
            style={{ display: "none", fontSize: 22, color: T.text }}
            className="lp-mobile-toggle"
          >
            {mobileNavOpen ? "✕" : "☰"}
          </button>
        </div>
        {mobileNavOpen && (
          <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <LPNavLink href="#features">Features</LPNavLink>
            <LPNavLink href="#how-it-works">How it works</LPNavLink>
            <LPNavLink href="#pricing">Pricing</LPNavLink>
            <LPNavLink href="#faq">FAQ</LPNavLink>
            <Btn variant="primary" size="md" onClick={() => onSelectRole(DEMO_ROLES[1])} style={{ justifyContent: "center", marginTop: 6 }}>Try the demo →</Btn>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 24px 56px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "center" }} className="lp-grid-2">
        <div>
          <LPSectionLabel>School ERP · LMS · QR Attendance</LPSectionLabel>
          <h1 style={{ fontFamily: F.display, fontSize: 46, lineHeight: 1.08, fontWeight: 800, color: T.text, letterSpacing: "-0.01em", marginBottom: 20 }}>
            Attendance marked by the time the bell stops ringing.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: T.muted, marginBottom: 32, maxWidth: 480 }}>
            {SITE.tagline}. One QR scan replaces the register, the LMS replaces three other logins, and every parent sees the same record the school does — the moment it's marked.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }} className="lp-stack-mobile">
            <Btn variant="primary" size="lg" onClick={() => onSelectRole(DEMO_ROLES[1])}>Explore the live demo →</Btn>
            <Btn as="a" href={waLink("Hi, I'd like to know more about NexaAttend for my school.")} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="lg">💬 Chat on WhatsApp</Btn>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 40, flexWrap: "wrap" }}>
            {[["304", "students on Sunrise Academy"], ["6", "schools live across Gujarat"], ["93.4%", "average attendance accuracy"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 800, color: T.green }}>{v}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2, maxWidth: 120 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature element: live mock QR scan ticker */}
        <div style={{ background: "#0d1117", borderRadius: 20, border: `1px solid rgba(34,197,94,.2)`, padding: 24, boxShadow: "0 24px 64px rgba(28,27,23,0.18)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, fontFamily: F.mono, fontWeight: 700, color: T.green, letterSpacing: ".06em" }}>LIVE QR SCAN — CLASS X-A</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: F.mono, color: "rgba(255,255,255,.3)" }}>demo feed</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ width: 132, height: 132, background: "#fff", borderRadius: 14, padding: 12, position: "relative", animation: "glow 2.4s ease-in-out infinite" }}>
              <svg width="108" height="108" viewBox="0 0 108 108">
                {[...Array(7)].map((_, r) => [...Array(7)].map((_, c) => {
                  const pat = [[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
                  return pat[r][c] ? <rect key={`tl${r}${c}`} x={c*6} y={r*6} width={5} height={5} fill="#111" rx="1" /> : null;
                }))}
                {[...Array(7)].map((_, r) => [...Array(7)].map((_, c) => {
                  const pat = [[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
                  return pat[r][c] ? <rect key={`br${r}${c}`} x={c*6+66} y={r*6+66} width={5} height={5} fill="#111" rx="1" /> : null;
                }))}
                {[...Array(7)].map((_, r) => [...Array(7)].map((_, c) => {
                  const pat = [[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
                  return pat[r][c] ? <rect key={`tr${r}${c}`} x={c*6+66} y={r*6} width={5} height={5} fill="#111" rx="1" /> : null;
                }))}
              </svg>
              <div style={{ position: "absolute", inset: 12, borderRadius: 6, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{ width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${T.green}, transparent)`, animation: "scanline 1.8s ease-in-out infinite" }} />
              </div>
            </div>
          </div>

          <div key={scanTick} style={{ background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "10px 14px", animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: F.mono }}>
              <span style={{ color: "rgba(255,255,255,.85)", fontWeight: 600 }}>{liveRow.name}</span>
              <span style={{ color: liveRow.status === "Present" ? T.greenLight : liveRow.status === "Late" ? "#F59E0B" : "#EF4444", fontWeight: 700 }}>{liveRow.status}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4, color: "rgba(255,255,255,.35)", fontFamily: F.mono }}>
              <span>{liveRow.roll}</span>
              <span>{liveRow.time} · {liveRow.conf}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logos / trust strip ──────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: T.card }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px", display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
          {FOUNDER_SCHOOLS.map(s => (
            <span key={s.name} style={{ fontSize: 13, color: T.hint, fontWeight: 600 }}>{s.name}</span>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" style={{ maxWidth: 1180, margin: "0 auto", padding: "88px 24px" }}>
        <div style={{ maxWidth: 560, marginBottom: 48 }}>
          <LPSectionLabel>Everything in one login</LPSectionLabel>
          <h2 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: T.text, marginBottom: 14 }}>Built for how Indian schools actually run.</h2>
          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.6 }}>Six modules, one dashboard — used by Founders, Owners, Teachers, Students, and Parents, each seeing exactly what's relevant to them.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="lp-grid-3">
          {LP_FEATURES.map(f => (
            <div key={f.title} className="card-hover" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, transition: "all .2s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.greenDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, fontFamily: F.display }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: T.card, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "88px 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <LPSectionLabel>From scan to report</LPSectionLabel>
            <h2 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: T.text, marginBottom: 14 }}>Three steps, every period, every day.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }} className="lp-grid-3">
            {LP_STEPS.map((s, i) => (
              <div key={s.n} style={{ position: "relative", paddingLeft: 0 }}>
                <div style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 14 }}>{s.n}</div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, fontFamily: F.display }}>{s.title}</div>
                <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>{s.body}</div>
                {i < LP_STEPS.length - 1 && (
                  <div className="lp-hide-mobile" style={{ position: "absolute", top: 10, right: -16, fontSize: 18, color: T.hint }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" style={{ maxWidth: 1180, margin: "0 auto", padding: "88px 24px" }}>
        <div style={{ maxWidth: 560, marginBottom: 48 }}>
          <LPSectionLabel>Pricing</LPSectionLabel>
          <h2 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: T.text, marginBottom: 14 }}>Priced per school, not per headache.</h2>
          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.6 }}>Every plan includes onboarding and data migration. Cancel anytime — no lock-in contracts.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="lp-grid-3">
          {LP_PLANS.map(p => (
            <div key={p.name} style={{ background: p.popular ? T.text : T.card, color: p.popular ? T.bg : T.text, border: `1px solid ${p.popular ? T.text : T.border}`, borderRadius: 18, padding: 28, position: "relative", display: "flex", flexDirection: "column" }}>
              {p.popular && (
                <div style={{ position: "absolute", top: -12, left: 24, background: T.green, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 20, letterSpacing: ".05em" }}>MOST POPULAR</div>
              )}
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: p.popular ? T.bg : p.color }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: F.display, fontSize: 34, fontWeight: 800 }}>{fmtINR(p.price)}</span>
                <span style={{ fontSize: 13, opacity: 0.6 }}>/month</span>
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.7, marginBottom: 24 }}>{p.students}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, flex: 1 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "flex-start" }}>
                    <span style={{ color: p.popular ? T.greenLight : T.green, flexShrink: 0 }}>✓</span>
                    <span style={{ opacity: 0.85 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Btn
                variant={p.popular ? "primary" : "dim"}
                size="md"
                onClick={() => onSelectRole(DEMO_ROLES[0])}
                style={{ justifyContent: "center", ...(p.popular ? {} : { background: "transparent", color: p.popular ? T.bg : T.text, border: `1px solid ${p.popular ? T.bg : T.border}` }) }}
              >
                Talk to us →
              </Btn>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" style={{ background: T.card, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "88px 24px" }}>
          <div style={{ marginBottom: 40 }}>
            <LPSectionLabel>Questions</LPSectionLabel>
            <h2 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: T.text }}>Frequently asked.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {LP_FAQS.map((f, i) => (
              <div key={f.q} style={{ padding: "22px 0", borderBottom: i < LP_FAQS.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, fontFamily: F.display }}>{f.q}</div>
                <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section style={{ background: T.gradientDashboard, padding: "72px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: F.display, fontSize: 30, fontWeight: 800, color: "#fff", marginBottom: 14 }}>See your school's attendance, fees, and grades in one place — today.</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>No setup required to explore. Pick a role and walk through the real dashboard.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="primary" size="lg" onClick={() => onSelectRole(DEMO_ROLES[1])}>Explore the live demo →</Btn>
            <Btn as="a" href={waLink("Hi, I'd like to know more about NexaAttend for my school.")} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="lg">💬 Chat on WhatsApp</Btn>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{ background: "#0d1117", padding: "56px 24px 28px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32, paddingBottom: 36, borderBottom: "1px solid rgba(247,245,239,0.08)" }} className="lp-grid-4">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏫</div>
                <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 15, color: "#fff" }}>{SITE.name}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(247,245,239,0.45)", lineHeight: 1.6, maxWidth: 240 }}>{SITE.tagline}, by {SITE.legalName}.</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(247,245,239,0.4)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 }}>Product</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Features", "How it works", "Pricing"].map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} style={{ fontSize: 13, color: "rgba(247,245,239,0.65)" }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(247,245,239,0.4)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 }}>Company</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 13, color: "rgba(247,245,239,0.65)" }}>Founded by {SITE.founderName}</span>
                <a href={`mailto:${SITE.founderEmail}`} style={{ fontSize: 13, color: "rgba(247,245,239,0.65)" }}>{SITE.founderEmail}</a>
                <span style={{ fontSize: 13, color: "rgba(247,245,239,0.65)" }}>{SITE.phone}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(247,245,239,0.4)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 }}>Get in touch</div>
              <Btn as="a" href={waLink("Hi, I'd like to know more about NexaAttend for my school.")} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm">💬 WhatsApp us</Btn>
            </div>
          </div>

          <div style={{ paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "rgba(247,245,239,0.22)" }}>
              © {new Date().getFullYear()} {SITE.legalName}. Founded by {SITE.founderName}.
            </div>
            <div style={{ fontSize: 12, color: "rgba(247,245,239,0.22)" }}>{SITE.url.replace("https://", "")}</div>
          </div>
        </div>
      </footer>

      <Analytics />
    </>
  );
});

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | login | app
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const handleSelectRole = role => { setSelectedRole(role); setScreen("login"); };
  const handleLogin = role => { setCurrentUser(role); setScreen("app"); };
  const handleLogout = () => { setCurrentUser(null); setSelectedRole(null); setScreen("landing"); };

  return (
    <>
      <Styles />
      {screen === "landing" && <LandingPage onSelectRole={handleSelectRole} />}
      {screen === "login"   && <LoginScreen selectedRole={selectedRole} onLogin={handleLogin} onBack={()=>setScreen("landing")} />}
      {screen === "app" && currentUser && (() => {
        const p = { user:currentUser, onLogout:handleLogout };
        if(currentUser.id === "founder") return <FounderDashboard {...p} />;
        if(currentUser.id === "owner")   return <OwnerDashboard {...p} />;
        if(currentUser.id === "teacher") return <TeacherDashboard {...p} />;
        if(currentUser.id === "student") return <StudentDashboard {...p} />;
        if(currentUser.id === "parent")  return <ParentDashboard {...p} />;
      })()}
    </>
  );
}
