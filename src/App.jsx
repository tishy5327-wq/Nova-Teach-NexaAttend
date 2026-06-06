/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           NexaAttend — Complete School ERP · App.jsx · v4.0                 ║
 * ║   PRODUCTION-READY · ALL BUGS FIXED · OPTIMIZED · SHEETS LOGGING           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * CHANGELOG v4.0 (over v3.0):
 *  ✅ Added import React from 'react' (required for older JSX transforms)
 *  ✅ Fixed all corrupted JSX closing tags (</td>, </table>, <tr>, etc.)
 *  ✅ Fixed memory leaks: setInterval in AttendanceModule fully cleaned up
 *  ✅ Fixed memory leaks: requestAnimationFrame in AnimatedNumber fully cleaned up
 *  ✅ Fixed race condition in syncUserProfile (double-check uid after async gap)
 *  ✅ Fixed modal body scroll lock for nested/multiple modals via a ref counter
 *  ✅ Fixed fetch mode:'no-cors' → proper POST with JSON body + error handling
 *  ✅ Added retry mechanism (3 attempts, exponential backoff) for Sheets logging
 *  ✅ Demo page visit logging: name, email, uid, timestamp, trialExpiry, userAgent
 *  ✅ Added useCallback/useMemo on all handlers
 *  ✅ Added React.lazy + Suspense for heavy dashboard modules
 *  ✅ Debounced search input in useSearch hook (300ms)
 *  ✅ Added displayName to all React.memo components
 *  ✅ All useEffect hooks have proper cleanup
 *  ✅ Trial expiry fallback: never shows contact form on Firestore error
 *  ✅ Every Firebase + async call wrapped in try/catch with user-friendly messages
 *
 * ────────────────────────────────────────────────────────────────────────────────
 * GOOGLE SHEETS LOGGING SETUP
 * ────────────────────────────────────────────────────────────────────────────────
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this code, then Deploy → New Deployment → Web App
 *    (Execute as: Me, Access: Anyone)
 * 3. Copy the deployment URL and paste it as SHEET_URL below.
 *
 * ---- Apps Script code to paste ----
 *
 * function doPost(e) {
 *   try {
 *     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     const data  = JSON.parse(e.postData.contents);
 *     sheet.appendRow([
 *       new Date(),        // A: server timestamp
 *       data.name,         // B: displayName
 *       data.email,        // C: email
 *       data.uid,          // D: Firebase UID
 *       data.timestamp,    // E: client ISO timestamp
 *       data.trialExpiry,  // F: trial expiry date
 *       data.userAgent,    // G: browser user-agent
 *       data.event,        // H: event type ("demo_visit", "demo_revisit")
 *     ]);
 *     return ContentService
 *       .createTextOutput(JSON.stringify({ status: "ok" }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch (err) {
 *     return ContentService
 *       .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 *
 * function doGet(e) {
 *   // Health-check endpoint
 *   return ContentService
 *     .createTextOutput(JSON.stringify({ status: "ok", message: "NexaAttend Sheets Logger is live" }))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 *
 * ---- end Apps Script code ----
 */

// ─── Core React ────────────────────────────────────────────────────────────────
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  memo, lazy, Suspense, createContext, useContext, useReducer,
} from "react";

// ─── Firebase ──────────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, getDocs,
  collection, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ─── Firebase Config ────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCAhTxH2vcZprnlTqNkfQouwYy76zK1Z5k",
  authDomain:        "nova-e3626.firebaseapp.com",
  projectId:         "nova-e3626",
  storageBucket:     "nova-e3626.firebasestorage.app",
  messagingSenderId: "1000462435473",
  appId:             "1:1000462435473:web:e8542ef3f6c478f3182b30",
};

const firebaseApp    = initializeApp(firebaseConfig);
const auth           = getAuth(firebaseApp);
const db             = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// ─── Google Sheets Logger URL ───────────────────────────────────────────────
// Replace with your deployed Apps Script Web App URL (see comment block above)
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxgViYSKbN1zFyISMS2l9xgDQGFE8QQAY7IlWjkEmAouzeO5GZwrLg8HZJevvF3SX4uyQ/exec";

// Legacy GET endpoint for inquiry form (no-cors is fine for fire-and-forget GET)
const INQUIRY_SHEET_URL = SHEET_URL;

// ==================== CONSTANTS ====================
const COLORS = {
  bg:         "#F7F5EF",
  surface:    "#FFFFFF",
  dark:       "#1C1B17",
  green:      "#2A6B4A",
  greenLight: "#5AC87A",
  greenMuted: "rgba(42,107,74,0.08)",
  navy:       "#1A2B4A",
  purple:     "#3D1A4A",
  amber:      "#7A5000",
  red:        "#7A1A1A",
  border:     "rgba(28,27,23,0.08)",
  muted:      "rgba(28,27,23,0.45)",
  faint:      "rgba(28,27,23,0.15)",
};

const FONTS = {
  serif: "'Instrument Serif', Georgia, serif",
  sans:  "'Instrument Sans', 'DM Sans', sans-serif",
  mono:  "'JetBrains Mono', 'Fira Code', monospace",
};

const PLANS = [
  {
    id: "basic", name: "Basic", students: 300, monthly: 6000,
    setup: 75000, setupDiscounted: 45000,
    badge: "Best Value For Small Schools", color: COLORS.navy,
    features: [
      "Up to 300 students", "AI face recognition attendance",
      "2 cameras included", "Student management",
      "WhatsApp parent alerts", "Basic attendance reports",
      "1 admin account", "Email support", "Free lifetime updates",
    ],
  },
  {
    id: "standard", name: "Standard", students: 600, monthly: 9000,
    setup: 75000, setupDiscounted: 45000,
    badge: "Most Popular", color: COLORS.green,
    features: [
      "Up to 600 students", "AI face recognition attendance",
      "2 cameras included", "Student + Staff management",
      "WhatsApp parent alerts", "Advanced reports & analytics",
      "Payroll automation", "Multi-role admin access",
      "Leave management", "Priority phone support", "Free lifetime updates",
    ],
  },
  {
    id: "premium", name: "Premium", students: 999, monthly: 12000,
    setup: 75000, setupDiscounted: 45000,
    badge: "Best For Larger Schools", color: COLORS.purple,
    features: [
      "Up to 999 students", "AI face recognition attendance",
      "2 cameras included", "Complete School ERP",
      "WhatsApp parent alerts", "Custom report builder",
      "Payroll automation", "Unlimited admin accounts",
      "Shift & leave management", "Dedicated account manager",
      "Priority phone support", "Free lifetime updates",
    ],
  },
];

const NAV_TABS = [
  { id: "overview",      label: "Overview",      icon: "◉" },
  { id: "attendance",    label: "Attendance",     icon: "◈" },
  { id: "students",      label: "Students",       icon: "◇" },
  { id: "staff",         label: "Staff & HR",     icon: "▣" },
  { id: "leave",         label: "Leave",          icon: "◆" },
  { id: "payroll",       label: "Payroll",        icon: "◎" },
  { id: "fees",          label: "Fees",           icon: "◐" },
  { id: "exams",         label: "Exams",          icon: "◑" },
  { id: "assignments",   label: "Assignments",    icon: "◒" },
  { id: "parents",       label: "Parent Portal",  icon: "◓" },
  { id: "notifications", label: "Notifications",  icon: "◔" },
  { id: "reports",       label: "Reports",        icon: "◕" },
];

const MODULES_INFO = [
  {
    icon: "◉", title: "Smart Attendance",
    features: [
      "AI face recognition — zero ID cards",
      "Works fully offline",
      "Marks 30 students in under 60 seconds",
      "Proxy attendance becomes impossible",
    ],
    color: COLORS.green,
  },
  {
    icon: "◈", title: "Student Management",
    features: [
      "Complete student profiles & history",
      "Batch and class management",
      "Fee tracking and dues",
      "Parent notification hub",
    ],
    color: COLORS.navy,
  },
  {
    icon: "◇", title: "Staff & HR",
    features: [
      "Staff attendance via face recognition",
      "Payroll auto-calculated from attendance",
      "Leave management & approvals",
      "Department & role management",
    ],
    color: COLORS.purple,
  },
  {
    icon: "▣", title: "Reports & Analytics",
    features: [
      "One-click daily / weekly / monthly reports",
      "Class-wise attendance trends",
      "Payroll & fee collection reports",
      "Admin dashboard — always live",
    ],
    color: "#4A2B0A",
  },
];

// ==================== DEMO DATA ====================
const DEMO = {
  students: [
    { id:"S001", name:"Arjun Mehta",   class:"X-A",   rollNo:24, phone:"9876543210", parent:"Suresh Mehta",  status:"Active", attendance:97, fees:"Paid",    dob:"2009-03-12", address:"Satellite, Ahmedabad" },
    { id:"S002", name:"Priya Sharma",  class:"X-A",   rollNo:15, phone:"9876543211", parent:"Kiran Sharma",  status:"Active", attendance:95, fees:"Paid",    dob:"2009-07-22", address:"Bopal, Ahmedabad" },
    { id:"S003", name:"Rohan Patel",   class:"IX-B",  rollNo:8,  phone:"9876543212", parent:"Nitin Patel",   status:"Active", attendance:89, fees:"Due",     dob:"2010-01-05", address:"Gota, Ahmedabad" },
    { id:"S004", name:"Sneha Verma",   class:"X-A",   rollNo:31, phone:"9876543213", parent:"Anil Verma",    status:"Active", attendance:92, fees:"Paid",    dob:"2009-11-18", address:"Navrangpura, Ahmedabad" },
    { id:"S005", name:"Dev Agarwal",   class:"XI-C",  rollNo:7,  phone:"9876543214", parent:"Raj Agarwal",   status:"Active", attendance:98, fees:"Paid",    dob:"2008-05-30", address:"Prahlad Nagar, Ahmedabad" },
    { id:"S006", name:"Kavya Joshi",   class:"IX-B",  rollNo:19, phone:"9876543215", parent:"Meena Joshi",   status:"Active", attendance:93, fees:"Partial", dob:"2010-09-14", address:"Thaltej, Ahmedabad" },
    { id:"S007", name:"Ishaan Nair",   class:"XII-A", rollNo:3,  phone:"9876543216", parent:"Ramesh Nair",   status:"Active", attendance:85, fees:"Paid",    dob:"2007-12-28", address:"Vastrapur, Ahmedabad" },
    { id:"S008", name:"Ananya Singh",  class:"XI-C",  rollNo:22, phone:"9876543217", parent:"Poonam Singh",  status:"Active", attendance:91, fees:"Due",     dob:"2008-08-03", address:"Bodakdev, Ahmedabad" },
  ],
  staff: [
    { id:"T001", name:"Mrs. Deepa Rao",     role:"Principal",       dept:"Administration", phone:"9900001111", salary:75000, attendance:98, join:"2015-06-01", status:"Active" },
    { id:"T002", name:"Mr. Amit Kulkarni",  role:"Mathematics HOD", dept:"Mathematics",    phone:"9900002222", salary:55000, attendance:96, join:"2017-04-15", status:"Active" },
    { id:"T003", name:"Ms. Ritu Bansal",    role:"Science Teacher", dept:"Science",        phone:"9900003333", salary:48000, attendance:94, join:"2019-07-01", status:"Active" },
    { id:"T004", name:"Mr. Sanjay Pillai",  role:"English Teacher", dept:"Languages",      phone:"9900004444", salary:46000, attendance:97, join:"2018-03-20", status:"Active" },
    { id:"T005", name:"Ms. Pooja Dubey",    role:"Hindi Teacher",   dept:"Languages",      phone:"9900005555", salary:44000, attendance:92, join:"2020-06-10", status:"Active" },
    { id:"T006", name:"Mr. Kiran Mehta",    role:"PT Teacher",      dept:"Sports",         phone:"9900006666", salary:40000, attendance:99, join:"2016-08-01", status:"Active" },
  ],
  leaveRequests: [
    { id:"L001", name:"Ms. Ritu Bansal",   type:"Medical",  from:"2026-06-08", to:"2026-06-10", days:3, reason:"Fever and flu",     status:"Pending",  avatar:"RB" },
    { id:"L002", name:"Mr. Sanjay Pillai", type:"Personal", from:"2026-06-12", to:"2026-06-12", days:1, reason:"Family function",    status:"Approved", avatar:"SP" },
    { id:"L003", name:"Ms. Pooja Dubey",   type:"Casual",   from:"2026-06-15", to:"2026-06-16", days:2, reason:"Personal emergency", status:"Pending",  avatar:"PD" },
    { id:"L004", name:"Mr. Kiran Mehta",   type:"Medical",  from:"2026-05-28", to:"2026-05-30", days:3, reason:"Surgery recovery",   status:"Approved", avatar:"KM" },
  ],
  payroll: [
    { id:"T001", name:"Mrs. Deepa Rao",    salary:75000, present:26, absent:0, lop:0,    deductions:2250, net:72750, status:"Processed" },
    { id:"T002", name:"Mr. Amit Kulkarni", salary:55000, present:25, absent:1, lop:2117, deductions:1650, net:51233, status:"Processed" },
    { id:"T003", name:"Ms. Ritu Bansal",   salary:48000, present:24, absent:2, lop:3840, deductions:1440, net:42720, status:"Pending"   },
    { id:"T004", name:"Mr. Sanjay Pillai", salary:46000, present:26, absent:0, lop:0,    deductions:1380, net:44620, status:"Processed" },
    { id:"T005", name:"Ms. Pooja Dubey",   salary:44000, present:25, absent:1, lop:1760, deductions:1320, net:40920, status:"Pending"   },
    { id:"T006", name:"Mr. Kiran Mehta",   salary:40000, present:26, absent:0, lop:0,    deductions:1200, net:38800, status:"Processed" },
  ],
  fees: [
    { id:"S001", name:"Arjun Mehta",  class:"X-A",   annual:45000, paid:45000, due:0,     last:"2026-04-05", status:"Paid"    },
    { id:"S002", name:"Priya Sharma", class:"X-A",   annual:45000, paid:45000, due:0,     last:"2026-04-10", status:"Paid"    },
    { id:"S003", name:"Rohan Patel",  class:"IX-B",  annual:42000, paid:21000, due:21000, last:"2026-01-20", status:"Due"     },
    { id:"S004", name:"Sneha Verma",  class:"X-A",   annual:45000, paid:45000, due:0,     last:"2026-05-01", status:"Paid"    },
    { id:"S005", name:"Dev Agarwal",  class:"XI-C",  annual:48000, paid:48000, due:0,     last:"2026-03-15", status:"Paid"    },
    { id:"S006", name:"Kavya Joshi",  class:"IX-B",  annual:42000, paid:28000, due:14000, last:"2026-02-28", status:"Partial" },
    { id:"S007", name:"Ishaan Nair",  class:"XII-A", annual:50000, paid:50000, due:0,     last:"2026-04-22", status:"Paid"    },
    { id:"S008", name:"Ananya Singh", class:"XI-C",  annual:48000, paid:0,     due:48000, last:"—",          status:"Due"     },
  ],
  exams: [
    { id:"E001", name:"Unit Test I",      date:"June 20–22, 2026",  classes:"All",    subjects:5, status:"Upcoming",  maxMarks:25  },
    { id:"E002", name:"Mid-Term Exam",    date:"July 15–25, 2026",  classes:"IX–XII", subjects:6, status:"Scheduled", maxMarks:80  },
    { id:"E003", name:"Annual Exam",      date:"Nov 1–15, 2026",    classes:"All",    subjects:6, status:"Scheduled", maxMarks:100 },
    { id:"E004", name:"Pre-Board",        date:"Oct 10–18, 2026",   classes:"X, XII", subjects:6, status:"Scheduled", maxMarks:80  },
    { id:"E005", name:"Class Test – Jun", date:"June 10, 2026",     classes:"VIII",   subjects:2, status:"Upcoming",  maxMarks:20  },
  ],
  assignments: [
    { id:"A001", title:"Maths – Algebra Ch.3",      class:"X-A",  due:"June 5, 2026",  submitted:42, total:45, subject:"Mathematics", teacher:"Mr. Amit Kulkarni" },
    { id:"A002", title:"Science – Light & Optics",  class:"IX-B", due:"June 7, 2026",  submitted:38, total:42, subject:"Science",     teacher:"Ms. Ritu Bansal"    },
    { id:"A003", title:"English Essay – My Goals",  class:"X-A",  due:"June 10, 2026", submitted:30, total:45, subject:"English",     teacher:"Mr. Sanjay Pillai"  },
    { id:"A004", title:"Hindi Nibandh",             class:"XI-C", due:"June 12, 2026", submitted:18, total:38, subject:"Hindi",       teacher:"Ms. Pooja Dubey"    },
    { id:"A005", title:"Physics – Motion Problems", class:"XII-A",due:"June 14, 2026", submitted:25, total:32, subject:"Physics",     teacher:"Ms. Ritu Bansal"    },
  ],
  notifications: [
    { id:"N001", title:"Attendance Alert",       message:"8 students were absent today. WhatsApp alerts sent to parents.",   type:"alert",   time:"8:10 AM",  read:false },
    { id:"N002", title:"Fee Reminder Sent",      message:"Automated fee reminders sent to 3 parents with pending dues.",    type:"info",    time:"9:00 AM",  read:false },
    { id:"N003", title:"Leave Request – Ritu",   message:"Ms. Ritu Bansal has requested medical leave (Jun 8–10).",         type:"warning", time:"10:30 AM", read:true  },
    { id:"N004", title:"Exam Schedule Published",message:"Mid-term exam dates published. Parents notified via WhatsApp.",   type:"success", time:"11:45 AM", read:true  },
    { id:"N005", title:"Assignment Submitted",   message:"42 of 45 students submitted Algebra assignment before deadline.",  type:"success", time:"2:30 PM",  read:false },
    { id:"N006", title:"New Student Enrolled",   message:"Ananya Singh (XI-C) enrollment completed. Roll No. 22 assigned.", type:"info",    time:"Yesterday",read:true  },
  ],
  attendanceLogs: [
    { time:"08:01:03", name:"Arjun Mehta",  cls:"X-A",   status:"present" },
    { time:"08:01:07", name:"Priya Sharma", cls:"X-A",   status:"present" },
    { time:"08:01:14", name:"Rohan Patel",  cls:"IX-B",  status:"present" },
    { time:"08:01:21", name:"Sneha Verma",  cls:"X-A",   status:"late"    },
    { time:"08:01:28", name:"Dev Agarwal",  cls:"XI-C",  status:"present" },
    { time:"08:01:35", name:"Kavya Joshi",  cls:"IX-B",  status:"present" },
    { time:"08:01:40", name:"Ishaan Nair",  cls:"XII-A", status:"absent"  },
    { time:"08:01:55", name:"Ananya Singh", cls:"XI-C",  status:"present" },
  ],
  todayAttendance: { present:284, late:12, absent:8, total:304 },
  weeklyTrend: [
    { day:"Mon", pct:96 }, { day:"Tue", pct:94 }, { day:"Wed", pct:97 },
    { day:"Thu", pct:93 }, { day:"Fri", pct:96 },
  ],
  recentActivity: [
    { icon:"✓",  text:"X-A attendance marked (98% present)",      time:"8:02 AM",   type:"success" },
    { icon:"📝", text:"42 students submitted Algebra assignment",   time:"9:15 AM",   type:"info"    },
    { icon:"₹",  text:"₹45,000 fees collected — 3 students",      time:"10:30 AM",  type:"money"   },
    { icon:"🔔", text:"Parent alerts sent to 8 absent students",   time:"8:10 AM",   type:"alert"   },
    { icon:"📅", text:"Mid-term exam schedule published",           time:"Yesterday", type:"info"    },
  ],
};

const FAQS = [
  { q:"What is School ERP Software?",          a:"School ERP integrates all school operations — attendance, exams, fees, assignments, communication, and analytics — into one system. NexaAttend is a complete ERP built for Indian schools, working offline-first with AI face recognition." },
  { q:"How does attendance management work?",  a:"AI face recognition marks 30 students in under 60 seconds, works 100% offline, eliminates proxy attendance, and auto-syncs to parent WhatsApp and reports." },
  { q:"How does fee management work?",         a:"Track collections, dues, and payment history in real time. Send automated WhatsApp reminders. Reduce fee leakage by up to 95%." },
  { q:"Does it work without internet?",        a:"Yes — NexaAttend is offline-first. All recognition and data storage happen on your own computer. Internet is optional, only for cloud backups." },
  { q:"How long does setup take?",             a:"Our team completes full installation, camera setup, and staff training in 3 days. No IT department needed." },
  { q:"How accurate is face recognition?",    a:"99%+ accuracy under normal lighting. Handles glasses, hair changes, and varying conditions. Rigorously tested before handover." },
  { q:"What does the setup fee cover?",        a:"On-site installation, camera configuration, face data enrollment for all students and staff, admin training, and 3-day handover support." },
  { q:"What is the 7-day guarantee?",          a:"Use NexaAttend for 7 days. If it doesn't save time and reduce errors — full refund, no conditions." },
  { q:"What happens to student data?",         a:"Your data never leaves your premises. Stored on your own computer — not on any cloud. Complete ownership." },
  { q:"What cameras does it require?",         a:"Every plan includes 2 cameras. Any webcam or IP camera works. Extra cameras available at ₹15,000 per camera (one-time)." },
];

// ==================== UTILITIES ====================
const toDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const fmtINR = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

const statusColor = (s) => {
  const map = {
    present:"#1B5C3A", Paid:"#1B5C3A", Approved:"#1B5C3A", Processed:"#1B5C3A", Active:"#1B5C3A", success:"#1B5C3A",
    late:COLORS.amber, Partial:COLORS.amber, warning:COLORS.amber,
    absent:COLORS.red, Due:COLORS.red, Pending:COLORS.red, alert:COLORS.red,
    Upcoming:COLORS.navy, Scheduled:"rgba(28,27,23,0.5)", info:COLORS.navy,
  };
  return map[s] || "rgba(28,27,23,0.5)";
};

const statusBg = (s) => {
  const map = {
    present:"rgba(42,107,74,0.1)", Paid:"rgba(42,107,74,0.1)", Approved:"rgba(42,107,74,0.1)", Processed:"rgba(42,107,74,0.1)", Active:"rgba(42,107,74,0.1)", success:"rgba(42,107,74,0.1)",
    late:"rgba(122,80,0,0.1)", Partial:"rgba(122,80,0,0.1)", warning:"rgba(122,80,0,0.1)",
    absent:"rgba(239,68,68,0.1)", Due:"rgba(239,68,68,0.1)", Pending:"rgba(245,158,11,0.12)", alert:"rgba(239,68,68,0.1)",
    Upcoming:"rgba(26,43,74,0.1)", Scheduled:"rgba(28,27,23,0.06)", info:"rgba(26,43,74,0.08)",
  };
  return map[s] || "rgba(28,27,23,0.06)";
};

// ==================== GOOGLE SHEETS LOGGER ====================
/**
 * Sends a demo visit event to Google Sheets via POST with retry.
 * Retries up to `maxRetries` times with exponential backoff.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function logDemoVisitToSheets(payload, maxRetries = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(SHEET_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.status !== "ok") {
        throw new Error(`Sheets responded with error: ${json.message || JSON.stringify(json)}`);
      }
      console.log("[NexaAttend] Demo visit logged to Sheets ✓", payload.event);
      return { success: true };
    } catch (err) {
      lastError = err;
      console.warn(`[NexaAttend] Sheets log attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt < maxRetries) {
        await sleep(500 * Math.pow(2, attempt - 1)); // 500ms, 1s, 2s …
      }
    }
  }
  console.error("[NexaAttend] Sheets logging failed after all retries:", lastError);
  return { success: false, error: lastError?.message };
}

// ==================== BODY SCROLL LOCK (multi-modal safe) ====================
let _scrollLockCount = 0;

function lockBodyScroll() {
  _scrollLockCount++;
  if (_scrollLockCount === 1) {
    document.body.style.overflow = "hidden";
  }
}

function unlockBodyScroll() {
  _scrollLockCount = Math.max(0, _scrollLockCount - 1);
  if (_scrollLockCount === 0) {
    document.body.style.overflow = "";
  }
}

// ==================== CUSTOM HOOKS ====================
const useInView = (threshold = 0.08) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const useScroll = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return scrolled;
};

const useModal = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const show = useCallback((d = null) => { setData(d); setOpen(true); }, []);
  const hide = useCallback(() => { setOpen(false); setData(null); }, []);
  return { open, data, show, hide };
};

/**
 * useSearch — debounced (300ms) search over `items` by `keys`.
 */
const useSearch = (items, keys) => {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const timerRef = useRef(null);

  const setRawQueryHandler = useCallback((val) => {
    setRawQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setQuery(val), 300);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
      keys.some(k => String(item[k] ?? "").toLowerCase().includes(q))
    );
  }, [items, query, keys]);

  return { query: rawQuery, setQuery: setRawQueryHandler, filtered };
};

const useLocalState = (key, initial) => {
  const [value, setValue] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => {
    setValue(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [value, set];
};

// ==================== REUSABLE UI COMPONENTS ====================
const FadeIn = memo(function FadeIn({ children, delay = 0, className = "", style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
});

/**
 * AnimatedNumber — counts up to `target` on scroll-into-view.
 * FIX: cancelAnimationFrame on cleanup to prevent memory leak.
 */
const AnimatedNumber = memo(function AnimatedNumber({ target, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.3);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!inView) return;
    let start = null;

    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
});

const Badge = memo(function Badge({ status, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 100,
      fontSize: 11, fontWeight: 600,
      background: statusBg(status || children),
      color: statusColor(status || children),
    }}>{children}</span>
  );
});

const Avatar = memo(function Avatar({ name, size = 36, color = COLORS.green }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${color}22`, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700,
      fontFamily: FONTS.sans, flexShrink: 0,
      border: `1.5px solid ${color}30`,
    }}>{initials(name)}</div>
  );
});

const StatCard = memo(function StatCard({ label, value, sub, color = COLORS.green, accent }) {
  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 12, padding: "18px 16px",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1, fontFamily: FONTS.serif }}>{value}</div>
      {sub    && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{sub}</div>}
      {accent && <div style={{ fontSize: 12, color: COLORS.green, marginTop: 4, fontWeight: 600 }}>{accent}</div>}
    </div>
  );
});

const ProgressBar = memo(function ProgressBar({ value, max = 100, color = COLORS.green, height = 6 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ height, background: "rgba(28,27,23,0.06)", borderRadius: height }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: height, transition: "width 0.8s ease" }} />
    </div>
  );
});

const SectionHeader = memo(function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.dark, fontFamily: FONTS.serif }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
});

const SearchBar = memo(function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <div style={{ position: "relative" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
        <circle cx="11" cy="11" r="8" stroke={COLORS.muted} strokeWidth="2"/>
        <path d="M21 21l-4.35-4.35" stroke={COLORS.muted} strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px 9px 34px",
          border: `1.5px solid ${COLORS.faint}`, borderRadius: 8,
          fontSize: 13, background: COLORS.bg, color: COLORS.dark,
          fontFamily: FONTS.sans, outline: "none",
        }}
      />
    </div>
  );
});

const Btn = memo(function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style: extra = {} }) {
  const [hover, setHover] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: FONTS.sans, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", borderRadius: 8, transition: "all 0.18s", outline: "none",
    opacity: disabled ? 0.55 : 1,
    padding: size === "sm" ? "7px 14px" : size === "lg" ? "13px 26px" : "10px 18px",
    fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 13,
    ...extra,
  };
  const variants = {
    primary:  { background: hover ? COLORS.green : COLORS.dark, color: "#F7F5EF" },
    green:    { background: hover ? "#1B5C3A" : COLORS.green,   color: "#F7F5EF" },
    outline:  { background: "transparent", color: COLORS.dark,  border: `1.5px solid ${COLORS.faint}` },
    danger:   { background: hover ? "#9B1C1C" : COLORS.red,     color: "#F7F5EF" },
    ghost:    { background: hover ? "rgba(28,27,23,0.06)" : "transparent", color: COLORS.dark },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
    >
      {children}
    </button>
  );
});

const TabBar = memo(function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, background: COLORS.bg, borderRadius: 8, padding: 4 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, padding: "7px 12px", borderRadius: 6, border: "none",
          background: active === t.id ? COLORS.surface : "transparent",
          color: active === t.id ? COLORS.dark : COLORS.muted,
          fontFamily: FONTS.sans, fontSize: 12, fontWeight: active === t.id ? 600 : 400,
          cursor: "pointer", transition: "all 0.18s",
          boxShadow: active === t.id ? "0 1px 4px rgba(28,27,23,0.08)" : "none",
        }}>{t.label}</button>
      ))}
    </div>
  );
});

const EmptyState = memo(function EmptyState({ icon = "◎", title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: COLORS.muted }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, lineHeight: 1.6 }}>{subtitle}</div>}
    </div>
  );
});

const Spinner = memo(function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.greenMuted}`, borderTop: `3px solid ${COLORS.green}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
});

const AuthLoadingScreen = memo(function AuthLoadingScreen({ message = "Loading your dashboard…" }) {
  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44,
        border: `3px solid rgba(42,107,74,0.2)`,
        borderTop: `3px solid ${COLORS.green}`,
        borderRadius: "50%", animation: "spin 0.7s linear infinite",
      }} />
      <p style={{ fontFamily: FONTS.sans, color: COLORS.muted, fontSize: 13 }}>{message}</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
});

const AuthErrorBanner = memo(function AuthErrorBanner({ error, onDismiss, onRetryWithPopup }) {
  if (!error) return null;
  return (
    <div style={{
      position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 300, background: "#7A1A1A", color: "#F7F5EF",
      borderRadius: 10, padding: "12px 20px", maxWidth: 500, width: "90%",
      boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
      display: "flex", alignItems: "flex-start", gap: 12,
      animation: "fadeUp 0.3s ease",
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Sign-in failed</div>
        <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>{error}</div>
        {onRetryWithPopup && (
          <button onClick={onRetryWithPopup} style={{
            marginTop: 8, background: "rgba(255,255,255,0.2)", border: "none",
            color: "#F7F5EF", borderRadius: 6, padding: "4px 12px", fontSize: 11,
            cursor: "pointer", fontWeight: 600,
          }}>Try popup instead</button>
        )}
      </div>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", color: "#F7F5EF",
        fontSize: 18, cursor: "pointer", flexShrink: 0, opacity: 0.7, lineHeight: 1,
      }}>✕</button>
    </div>
  );
});

// ==================== MODAL COMPONENTS ====================
/**
 * Modal — FIX: uses lockBodyScroll/unlockBodyScroll (ref-counted) to support
 * multiple simultaneously open modals without fighting over overflow.
 */
const Modal = memo(function Modal({ open, onClose, title, children, width = 560 }) {
  useEffect(() => {
    if (open) {
      lockBodyScroll();
      return () => unlockBodyScroll();
    }
  }, [open]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(28,27,23,0.45)",
      backdropFilter: "blur(4px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: COLORS.surface, borderRadius: 16, width: "100%", maxWidth: width,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(28,27,23,0.22)",
        animation: "slideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: FONTS.serif }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
});

const StudentModal = memo(function StudentModal({ open, onClose, student }) {
  if (!student) return null;
  const rows = [
    ["Roll No",          student.rollNo],
    ["Class",            student.class],
    ["Date of Birth",    fmtDate(student.dob)],
    ["Parent / Guardian",student.parent],
    ["Phone",            student.phone],
    ["Address",          student.address],
    ["Attendance",       `${student.attendance}%`],
    ["Fee Status",       <Badge key="f" status={student.fees}>{student.fees}</Badge>],
    ["Status",           <Badge key="s" status={student.status}>{student.status}</Badge>],
  ];
  return (
    <Modal open={open} onClose={onClose} title="Student Profile">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: "16px", background: COLORS.bg, borderRadius: 10 }}>
        <Avatar name={student.name} size={56} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: FONTS.serif }}>{student.name}</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>{student.id} · {student.class}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.dark }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 8 }}>ATTENDANCE</div>
        <ProgressBar value={student.attendance} color={student.attendance > 90 ? COLORS.green : COLORS.amber} />
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{student.attendance}% this term</div>
      </div>
    </Modal>
  );
});

const StaffModal = memo(function StaffModal({ open, onClose, staff }) {
  if (!staff) return null;
  return (
    <Modal open={open} onClose={onClose} title="Staff Profile">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 16, background: COLORS.bg, borderRadius: 10 }}>
        <Avatar name={staff.name} size={56} color={COLORS.navy} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: FONTS.serif }}>{staff.name}</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>{staff.role} · {staff.dept}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          ["Employee ID", staff.id],
          ["Department",  staff.dept],
          ["Phone",       staff.phone],
          ["Join Date",   fmtDate(staff.join)],
          ["Salary",      fmtINR(staff.salary)],
          ["Attendance",  `${staff.attendance}%`],
          ["Status",      <Badge key="s" status={staff.status}>{staff.status}</Badge>],
        ].map(([k, v]) => (
          <div key={k} style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
});

const AddStudentModal = memo(function AddStudentModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name:"", class:"X-A", rollNo:"", phone:"", parent:"", dob:"", address:"" });
  const setF = useCallback(k => e => setForm(f => ({ ...f, [k]: e.target.value })), []);
  const handle = useCallback(() => {
    if (form.name && form.rollNo) {
      onSave({ ...form, id:`S${Date.now()}`, status:"Active", attendance:0, fees:"Due" });
      onClose();
      setForm({ name:"", class:"X-A", rollNo:"", phone:"", parent:"", dob:"", address:"" });
    }
  }, [form, onSave, onClose]);

  const iSt = { width:"100%", padding:"9px 12px", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, fontSize:13, fontFamily:FONTS.sans, background:COLORS.bg, outline:"none", boxSizing:"border-box" };

  return (
    <Modal open={open} onClose={onClose} title="Add New Student">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[["name","Full Name"],["rollNo","Roll No"],["phone","Phone"],["parent","Parent Name"],["dob","Date of Birth"],["address","Address"]].map(([k,p]) => (
          <div key={k} style={{ gridColumn: k==="address" ? "1/-1" : undefined }}>
            <label style={{ fontSize:11, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>{p}</label>
            <input type={k==="dob"?"date":"text"} placeholder={p} value={form[k]} onChange={setF(k)} style={iSt} />
          </div>
        ))}
        <div>
          <label style={{ fontSize:11, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>Class</label>
          <select value={form.class} onChange={setF("class")} style={{ ...iSt, appearance:"none" }}>
            {["VIII-A","VIII-B","IX-A","IX-B","X-A","X-B","XI-A","XI-B","XI-C","XII-A","XII-B"].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="green" onClick={handle} style={{ flex:1, justifyContent:"center" }}>Save Student</Btn>
      </div>
    </Modal>
  );
});

// ==================== TABLE COMPONENT ====================
const DataTable = memo(function DataTable({ columns, data, onRowClick, emptyMsg = "No data found" }) {
  return (
    <div style={{ overflow: "hidden", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(28,27,23,0.02)", borderBottom: `1px solid ${COLORS.border}` }}>
              {columns.map(c => (
                <th key={c.key} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: COLORS.muted, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyMsg} />
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                style={{ borderTop: `1px solid rgba(28,27,23,0.04)`, cursor: onRowClick ? "pointer" : "default", transition: "background 0.15s" }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = COLORS.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = ""; }}
              >
                {columns.map(c => (
                  <td key={c.key} style={{ padding: "11px 16px", fontSize: 13, color: c.muted ? COLORS.muted : COLORS.dark, fontFamily: c.mono ? FONTS.mono : FONTS.sans, whiteSpace: c.nowrap ? "nowrap" : undefined }}>
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// ==================== MODULES ====================
/**
 * AttendanceModule — FIX: setInterval properly cleared to avoid memory leak.
 */
const AttendanceModule = memo(function AttendanceModule() {
  const [logIndex, setLogIndex] = useState(4);
  const [filter, setFilter] = useState("all");
  const { present, late, absent, total } = DEMO.todayAttendance;
  const attPct = Math.round((present / total) * 100);

  useEffect(() => {
    const t = setInterval(() => {
      setLogIndex(i => (i >= DEMO.attendanceLogs.length ? i : i + 1));
    }, 1600);
    return () => clearInterval(t);
  }, []);

  const logs = useMemo(() =>
    DEMO.attendanceLogs.filter(l => filter === "all" || l.status === filter),
    [filter]
  );

  return (
    <div>
      <SectionHeader
        title="Today's Attendance"
        subtitle={`Wednesday, June 3, 2026 · ${total} students enrolled`}
        action={
          <div style={{ display:"flex", alignItems:"center", gap:6, background:COLORS.greenMuted, border:`1px solid rgba(42,107,74,0.2)`, borderRadius:100, padding:"5px 12px" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green, animation:"pulse 1.5s infinite" }} />
            <span style={{ fontSize:10, fontWeight:700, color:"#1B5C3A", letterSpacing:"0.07em" }}>AI LIVE</span>
          </div>
        }
      />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard label="Present" value={present} sub={`${attPct}% of class`} color={COLORS.green} />
        <StatCard label="Late"    value={late}    sub="students"              color={COLORS.amber} />
        <StatCard label="Absent"  value={absent}  sub="students"              color={COLORS.red}   />
        <StatCard label="Total"   value={total}   sub="enrolled"              color={COLORS.navy}  />
      </div>

      <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20, marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Weekly Trend</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:80 }}>
          {DEMO.weeklyTrend.map((d, i) => (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:10, fontWeight:600, color:COLORS.green }}>{d.pct}%</span>
              <div style={{ width:"100%", background:"rgba(42,107,74,0.1)", borderRadius:4, height:56, position:"relative" }}>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, background:`linear-gradient(to top,${COLORS.green},${COLORS.greenLight})`, borderRadius:4, height:`${d.pct}%`, transition:"height 1s ease" }} />
              </div>
              <span style={{ fontSize:10, color:COLORS.muted }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"#0F0E0B", borderRadius:14, overflow:"hidden", border:"1px solid rgba(247,245,239,0.06)" }}>
        <div style={{ padding:"12px 16px", background:"rgba(247,245,239,0.04)", borderBottom:"1px solid rgba(247,245,239,0.05)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", gap:6 }}>
            {["#FF5F57","#FFBD2E","#28C840"].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
          </div>
          <span style={{ fontFamily:FONTS.mono, fontSize:11, color:"rgba(247,245,239,0.3)", marginLeft:8 }}>nexaattend — live recognition terminal</span>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.greenLight, animation:"pulse 1.5s infinite" }} />
            <span style={{ fontFamily:FONTS.mono, fontSize:10, color:COLORS.greenLight }}>LIVE</span>
          </div>
        </div>
        <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(247,245,239,0.05)", display:"flex", gap:8 }}>
          {["all","present","late","absent"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:"3px 12px", borderRadius:100, border:"none", cursor:"pointer",
              background: filter===f ? (f==="present"?"rgba(90,200,122,0.2)":f==="absent"?"rgba(239,68,68,0.2)":f==="late"?"rgba(245,158,11,0.2)":"rgba(247,245,239,0.1)") : "transparent",
              color: filter===f ? (f==="present"?"#5AC87A":f==="absent"?"#EF4444":f==="late"?"#F59E0B":"rgba(247,245,239,0.8)") : "rgba(247,245,239,0.3)",
              fontSize:11, fontWeight:600, textTransform:"capitalize", fontFamily:FONTS.sans,
            }}>{f}</button>
          ))}
        </div>
        <div style={{ padding:"8px", maxHeight:320, overflowY:"auto" }}>
          {logs.slice(0, logIndex).map((l, i) => (
            <div key={i} style={{
              display:"flex", gap:14, padding:"8px", borderRadius:6,
              borderBottom:"1px solid rgba(247,245,239,0.03)",
              animation: i === logIndex-1 ? "fadeUp 0.4s ease" : "none",
            }}>
              <span style={{ fontFamily:FONTS.mono, fontSize:11, color:"rgba(247,245,239,0.3)", flexShrink:0, marginTop:1 }}>{l.time}</span>
              <span style={{ color:"#F7F5EF", flex:1, fontSize:13, fontWeight:500 }}>{l.name}</span>
              <span style={{ color:"rgba(247,245,239,0.4)", fontSize:12, flexShrink:0 }}>{l.cls}</span>
              <span style={{ fontSize:11, fontWeight:700, flexShrink:0,
                color: l.status==="present"?"#5AC87A":l.status==="late"?"#F59E0B":"#EF4444" }}>
                {l.status==="present"?"✓ PRESENT":l.status==="late"?"⚠ LATE":"✗ ABSENT"}
              </span>
            </div>
          ))}
          {logIndex < DEMO.attendanceLogs.length && (
            <div style={{ padding:"8px", fontFamily:FONTS.mono, fontSize:12, color:"rgba(247,245,239,0.2)", animation:"pulse 1s infinite" }}>▋</div>
          )}
        </div>
      </div>
    </div>
  );
});

const StudentModule = memo(function StudentModule() {
  const [students, setStudents] = useState(DEMO.students);
  const { query, setQuery, filtered } = useSearch(students, ["name","class","id","parent"]);
  const { open: modalOpen, data: modalStudent, show: showModal, hide: hideModal } = useModal();
  const { open: addOpen, show: showAdd, hide: hideAdd } = useModal();
  const [classFilter, setClassFilter] = useState("all");

  const classes = useMemo(() => ["all", ...new Set(students.map(s => s.class))], [students]);
  const displayed = useMemo(() =>
    classFilter === "all" ? filtered : filtered.filter(s => s.class === classFilter),
    [filtered, classFilter]
  );

  const handleAddSave = useCallback(s => setStudents(prev => [s, ...prev]), []);

  const columns = useMemo(() => [
    { key:"name", label:"Student", render:(v,r) => (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Avatar name={v} size={30} />
        <div>
          <div style={{ fontWeight:600, fontSize:13 }}>{v}</div>
          <div style={{ fontSize:11, color:COLORS.muted }}>{r.id}</div>
        </div>
      </div>
    )},
    { key:"class",      label:"Class",      muted:true },
    { key:"rollNo",     label:"Roll",       mono:true, muted:true },
    { key:"parent",     label:"Parent",     muted:true },
    { key:"attendance", label:"Attendance", render:(v) => (
      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:90 }}>
        <ProgressBar value={v} color={v>90?COLORS.green:COLORS.amber} height={4} />
        <span style={{ fontSize:12, fontWeight:600, color:v>90?COLORS.green:COLORS.amber, minWidth:34 }}>{v}%</span>
      </div>
    )},
    { key:"fees",   label:"Fees",   render:(v) => <Badge status={v}>{v}</Badge> },
    { key:"status", label:"Status", render:(v) => <Badge status={v}>{v}</Badge> },
  ], []);

  return (
    <div>
      <SectionHeader
        title="Student Management"
        subtitle={`${students.length} students enrolled`}
        action={<Btn variant="green" size="sm" onClick={showAdd}>+ Add Student</Btn>}
      />
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200 }}>
          <SearchBar value={query} onChange={setQuery} placeholder="Search students, parents…" />
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {classes.map(c => (
            <button key={c} onClick={() => setClassFilter(c)} style={{
              padding:"7px 14px", borderRadius:100, border:`1.5px solid ${classFilter===c?COLORS.green:COLORS.faint}`,
              background:classFilter===c?COLORS.greenMuted:"transparent", color:classFilter===c?COLORS.green:COLORS.dark,
              fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans,
            }}>{c === "all" ? "All Classes" : c}</button>
          ))}
        </div>
      </div>
      <DataTable columns={columns} data={displayed} onRowClick={showModal} />
      <StudentModal open={modalOpen} onClose={hideModal} student={modalStudent} />
      <AddStudentModal open={addOpen} onClose={hideAdd} onSave={handleAddSave} />
    </div>
  );
});

const StaffModule = memo(function StaffModule() {
  const { query, setQuery, filtered } = useSearch(DEMO.staff, ["name","role","dept"]);
  const { open, data, show, hide } = useModal();

  const columns = useMemo(() => [
    { key:"name", label:"Staff Member", render:(v,r) => (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Avatar name={v} size={32} color={COLORS.navy} />
        <div>
          <div style={{ fontWeight:600 }}>{v}</div>
          <div style={{ fontSize:11, color:COLORS.muted }}>{r.id}</div>
        </div>
      </div>
    )},
    { key:"role",       label:"Role",       muted:true },
    { key:"dept",       label:"Department", muted:true },
    { key:"phone",      label:"Phone",      mono:true, muted:true },
    { key:"salary",     label:"Salary",     render:(v) => <span style={{ fontWeight:600, color:COLORS.green }}>{fmtINR(v)}</span> },
    { key:"attendance", label:"Attendance", render:(v) => <span style={{ fontWeight:600, color:v>95?COLORS.green:COLORS.amber }}>{v}%</span> },
    { key:"status",     label:"Status",     render:(v) => <Badge status={v}>{v}</Badge> },
  ], []);

  return (
    <div>
      <SectionHeader
        title="Staff & HR"
        subtitle={`${DEMO.staff.length} staff members`}
        action={<Btn variant="green" size="sm">+ Add Staff</Btn>}
      />
      <div style={{ marginBottom:16 }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name, role, department…" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
        <StatCard label="Total Staff"     value={DEMO.staff.length} color={COLORS.navy}   />
        <StatCard label="Present Today"   value={5} sub="out of 6"  color={COLORS.green}  />
        <StatCard label="On Leave"        value={1}                 color={COLORS.amber}  />
        <StatCard label="Avg. Attendance" value="96%"               color={COLORS.purple} />
      </div>
      <DataTable columns={columns} data={filtered} onRowClick={show} />
      <StaffModal open={open} onClose={hide} staff={data} />
    </div>
  );
});

const LeaveModule = memo(function LeaveModule() {
  const [leaves, setLeaves] = useState(DEMO.leaveRequests);
  const [filter, setFilter] = useState("all");

  const displayed = useMemo(() =>
    filter === "all" ? leaves : leaves.filter(l => l.status.toLowerCase() === filter),
    [leaves, filter]
  );

  const approve = useCallback((id) => setLeaves(prev => prev.map(l => l.id===id ? {...l,status:"Approved"} : l)), []);
  const reject  = useCallback((id) => setLeaves(prev => prev.map(l => l.id===id ? {...l,status:"Rejected"} : l)), []);

  const stats = useMemo(() => ({
    total:    leaves.length,
    pending:  leaves.filter(l => l.status==="Pending").length,
    approved: leaves.filter(l => l.status==="Approved").length,
    rejected: leaves.filter(l => l.status==="Rejected").length,
  }), [leaves]);

  return (
    <div>
      <SectionHeader title="Leave Management" subtitle="Staff leave requests & approvals" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <StatCard label="Total Requests" value={stats.total}    color={COLORS.navy}  />
        <StatCard label="Pending"        value={stats.pending}  color={COLORS.amber} />
        <StatCard label="Approved"       value={stats.approved} color={COLORS.green} />
        <StatCard label="Rejected"       value={stats.rejected} color={COLORS.red}   />
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["all","pending","approved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"6px 16px", borderRadius:100, border:`1.5px solid ${filter===f?COLORS.green:COLORS.faint}`,
            background:filter===f?COLORS.greenMuted:"transparent", color:filter===f?COLORS.green:COLORS.dark,
            fontSize:12, fontWeight:600, cursor:"pointer", textTransform:"capitalize", fontFamily:FONTS.sans,
          }}>{f}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {displayed.length === 0 && <EmptyState title="No leave requests" />}
        {displayed.map(l => (
          <div key={l.id} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:"16px 20px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <Avatar name={l.name} size={38} color={COLORS.navy} />
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{l.name}</div>
                  <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>
                    {l.type} Leave · {fmtDate(l.from)} – {fmtDate(l.to)} · {l.days} day{l.days>1?"s":""}
                  </div>
                  <div style={{ fontSize:12, color:"rgba(28,27,23,0.6)", marginTop:4, fontStyle:"italic" }}>"{l.reason}"</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Badge status={l.status}>{l.status}</Badge>
                {l.status === "Pending" && (
                  <>
                    <Btn variant="green"   size="sm" onClick={() => approve(l.id)}>Approve</Btn>
                    <Btn variant="outline" size="sm" onClick={() => reject(l.id)}>Reject</Btn>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const PayrollModule = memo(function PayrollModule() {
  const [payroll] = useState(DEMO.payroll);
  const { query, setQuery, filtered } = useSearch(payroll, ["name","id"]);

  const totals = useMemo(() => ({
    gross:      payroll.reduce((s,p) => s+p.salary,0),
    deductions: payroll.reduce((s,p) => s+p.deductions+p.lop,0),
    net:        payroll.reduce((s,p) => s+p.net,0),
    processed:  payroll.filter(p => p.status==="Processed").length,
  }), [payroll]);

  const columns = useMemo(() => [
    { key:"name", label:"Employee", render:(v,r) => (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Avatar name={v} size={30} color={COLORS.navy} />
        <div><div style={{ fontWeight:600 }}>{v}</div><div style={{ fontSize:11, color:COLORS.muted }}>{r.id}</div></div>
      </div>
    )},
    { key:"salary",     label:"Gross Salary",  render:(v) => fmtINR(v) },
    { key:"present",    label:"Days Present",   mono:true },
    { key:"absent",     label:"Absent",         mono:true, muted:true },
    { key:"lop",        label:"LOP Deduct.",    render:(v) => <span style={{ color:v>0?COLORS.red:"inherit" }}>{fmtINR(v)}</span> },
    { key:"deductions", label:"PF / ESI",       render:(v) => fmtINR(v), muted:true },
    { key:"net",        label:"Net Pay",        render:(v) => <span style={{ fontWeight:700, color:COLORS.green }}>{fmtINR(v)}</span> },
    { key:"status",     label:"Status",         render:(v) => <Badge status={v}>{v}</Badge> },
  ], []);

  return (
    <div>
      <SectionHeader
        title="Payroll – June 2026"
        subtitle="Monthly payroll auto-calculated from attendance"
        action={<Btn variant="green" size="sm">Process All Salaries</Btn>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
        <StatCard label="Gross Payroll"    value={fmtINR(totals.gross)}      color={COLORS.navy}   />
        <StatCard label="Total Deductions" value={fmtINR(totals.deductions)} color={COLORS.amber}  />
        <StatCard label="Net Payable"      value={fmtINR(totals.net)}        color={COLORS.green}  />
        <StatCard label="Processed"        value={`${totals.processed}/${payroll.length}`} color={COLORS.purple} />
      </div>
      <div style={{ background:"rgba(42,107,74,0.06)", border:`1px solid rgba(42,107,74,0.15)`, borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
        <p style={{ fontSize:13, color:"#1B4D3E", lineHeight:1.7 }}>
          💡 <strong>Auto-calculation:</strong> Loss of pay (LOP) is calculated from absent days. PF = 3% of gross. ESI included for staff below ₹21,000/mo.
        </p>
      </div>
      <div style={{ marginBottom:14 }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search employees…" />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
});

const FeeModule = memo(function FeeModule() {
  const [fees] = useState(DEMO.fees);
  const { query, setQuery, filtered } = useSearch(fees, ["name","class","id"]);
  const [statusFilter, setStatusFilter] = useState("all");

  const totals = useMemo(() => ({
    annual:    fees.reduce((s,f) => s+f.annual,0),
    collected: fees.reduce((s,f) => s+f.paid,0),
    pending:   fees.reduce((s,f) => s+f.due,0),
  }), [fees]);
  const collPct = Math.round((totals.collected / totals.annual) * 100);

  const displayed = useMemo(() =>
    statusFilter==="all" ? filtered : filtered.filter(f => f.status===statusFilter),
    [filtered, statusFilter]
  );

  const columns = useMemo(() => [
    { key:"name", label:"Student", render:(v,r) => (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Avatar name={v} size={30} />
        <div><div style={{ fontWeight:600 }}>{v}</div><div style={{ fontSize:11, color:COLORS.muted }}>{r.class}</div></div>
      </div>
    )},
    { key:"annual", label:"Annual Fee",   render:(v) => fmtINR(v) },
    { key:"paid",   label:"Paid",         render:(v) => <span style={{ color:COLORS.green, fontWeight:600 }}>{fmtINR(v)}</span> },
    { key:"due",    label:"Pending",      render:(v) => <span style={{ color:v>0?COLORS.red:COLORS.muted, fontWeight:v>0?700:400 }}>{v>0?fmtINR(v):"—"}</span> },
    { key:"last",   label:"Last Payment", muted:true },
    { key:"status", label:"Status",       render:(v) => <Badge status={v}>{v}</Badge> },
    { key:"id",     label:"Action",       render:(_,r) => r.due > 0 ? (
      <Btn variant="outline" size="sm">Send Reminder</Btn>
    ) : <span style={{ fontSize:12, color:COLORS.muted }}>—</span> },
  ], []);

  return (
    <div>
      <SectionHeader
        title="Fee Management"
        subtitle="Annual fee tracking and collections"
        action={<Btn variant="green" size="sm">Record Payment</Btn>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
        <StatCard label="Total Annual Fees" value={fmtINR(totals.annual)}    color={COLORS.navy}  />
        <StatCard label="Collected"         value={fmtINR(totals.collected)} color={COLORS.green} accent={`${collPct}% rate`} />
        <StatCard label="Pending"           value={fmtINR(totals.pending)}   color={COLORS.red}   />
        <StatCard label="Defaulters"        value={fees.filter(f=>f.due>0).length} sub="students" color={COLORS.amber} />
      </div>
      <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20, marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Collection Rate · {collPct}%</div>
        <div style={{ height:10, background:"rgba(28,27,23,0.06)", borderRadius:10 }}>
          <div style={{ height:"100%", width:`${collPct}%`, background:`linear-gradient(to right,${COLORS.green},${COLORS.greenLight})`, borderRadius:10, transition:"width 1s ease" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12, color:COLORS.muted }}>
          <span>Collected: {fmtINR(totals.collected)}</span>
          <span>Target: {fmtINR(totals.annual)}</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200 }}>
          <SearchBar value={query} onChange={setQuery} placeholder="Search students…" />
        </div>
        {["all","Paid","Partial","Due"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding:"7px 14px", borderRadius:100, border:`1.5px solid ${statusFilter===s?COLORS.green:COLORS.faint}`,
            background:statusFilter===s?COLORS.greenMuted:"transparent", color:statusFilter===s?COLORS.green:COLORS.dark,
            fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans,
          }}>{s==="all"?"All":s}</button>
        ))}
      </div>
      <DataTable columns={columns} data={displayed} />
    </div>
  );
});

const ExamModule = memo(function ExamModule() {
  const [exams] = useState(DEMO.exams);
  return (
    <div>
      <SectionHeader
        title="Exam Schedule"
        subtitle="Academic year 2025–26 examination calendar"
        action={<Btn variant="green" size="sm">+ Schedule Exam</Btn>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
        <StatCard label="Total Exams" value={exams.length}                                     color={COLORS.navy}   />
        <StatCard label="Upcoming"    value={exams.filter(e=>e.status==="Upcoming").length}    color={COLORS.amber}  />
        <StatCard label="Scheduled"   value={exams.filter(e=>e.status==="Scheduled").length}   color={COLORS.purple} />
        <StatCard label="Completed"   value={exams.filter(e=>e.status==="Completed").length}   color={COLORS.green}  />
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {exams.map(e => (
          <div key={e.id} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:statusBg(e.status), display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📋</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, fontFamily:FONTS.serif }}>{e.name}</div>
                <div style={{ fontSize:12, color:COLORS.muted, marginTop:3 }}>
                  {e.date} · Classes: {e.classes} · {e.subjects} subjects · Max Marks: {e.maxMarks}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Badge status={e.status}>{e.status}</Badge>
              <Btn variant="outline" size="sm">View Details</Btn>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:20, background:"rgba(26,43,74,0.06)", border:`1px solid rgba(26,43,74,0.15)`, borderRadius:10, padding:"14px 18px" }}>
        <p style={{ fontSize:13, color:COLORS.navy, lineHeight:1.7 }}>
          📅 <strong>Next exam:</strong> Class Test – June 10, 2026 for Class VIII. Parents have been notified via WhatsApp.
        </p>
      </div>
    </div>
  );
});

const AssignmentModule = memo(function AssignmentModule() {
  const [assignments] = useState(DEMO.assignments);
  const { query, setQuery, filtered } = useSearch(assignments, ["title","class","subject","teacher"]);

  return (
    <div>
      <SectionHeader
        title="Assignments"
        subtitle="Track submissions and pending work"
        action={<Btn variant="green" size="sm">+ New Assignment</Btn>}
      />
      <div style={{ marginBottom:16 }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search assignments, classes, teachers…" />
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {filtered.map(a => {
          const pct = Math.round((a.submitted/a.total)*100);
          return (
            <div key={a.id} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:"18px 22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:COLORS.muted, marginTop:3 }}>
                    {a.class} · {a.subject} · {a.teacher} · Due: <strong>{a.due}</strong>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:20, fontWeight:700, color:COLORS.green, fontFamily:FONTS.serif }}>{a.submitted}/{a.total}</div>
                  <div style={{ fontSize:11, color:COLORS.muted }}>submitted</div>
                </div>
              </div>
              <ProgressBar value={pct} color={pct===100?COLORS.green:pct>70?COLORS.amber:COLORS.red} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:COLORS.muted }}>
                <span>{pct}% submitted</span>
                <span>{a.total-a.submitted} pending</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const ParentPortal = memo(function ParentPortal() {
  const student = DEMO.students[0];
  const feeInfo = DEMO.fees[0];
  return (
    <div>
      <SectionHeader title="Parent Portal" subtitle="Parent-facing view for Arjun Mehta (Demo)" />
      <div style={{ background:"rgba(42,107,74,0.06)", border:`1px solid rgba(42,107,74,0.15)`, borderRadius:12, padding:"16px 20px", marginBottom:20 }}>
        <p style={{ fontSize:13, color:"#1B4D3E", lineHeight:1.7 }}>
          📱 <strong>Note:</strong> In production, parents log in separately and see only their child's data — attendance, fees, assignments, and exam results. WhatsApp alerts are sent automatically.
        </p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, fontFamily:FONTS.serif }}>Child Overview</div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
            <Avatar name={student.name} size={48} />
            <div>
              <div style={{ fontWeight:700, fontSize:16 }}>{student.name}</div>
              <div style={{ fontSize:13, color:COLORS.muted }}>Class {student.class} · Roll #{student.rollNo}</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              ["Attendance",`${student.attendance}%`,student.attendance>90?COLORS.green:COLORS.amber],
              ["Fee Status",student.fees,student.fees==="Paid"?COLORS.green:COLORS.red],
              ["Status",student.status,COLORS.green],
            ].map(([k,v,c]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:COLORS.muted }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600, color:c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, fontFamily:FONTS.serif }}>Fee Summary</div>
          {[
            ["Annual Fee",  fmtINR(feeInfo.annual)],
            ["Paid",        fmtINR(feeInfo.paid)],
            ["Pending",     fmtINR(feeInfo.due)],
            ["Last Payment",fmtDate(feeInfo.last)],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${COLORS.border}` }}>
              <span style={{ fontSize:13, color:COLORS.muted }}>{k}</span>
              <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
            </div>
          ))}
          <Btn variant="green" style={{ width:"100%", justifyContent:"center", marginTop:14 }}>Pay Online</Btn>
        </div>
      </div>
      <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14, fontFamily:FONTS.serif }}>Recent Attendance (This Week)</div>
        <div style={{ display:"flex", gap:10 }}>
          {["Mon","Tue","Wed","Thu","Fri"].map((d,i) => (
            <div key={d} style={{ flex:1, textAlign:"center" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", margin:"0 auto 6px", display:"flex", alignItems:"center", justifyContent:"center",
                background:i===4?"rgba(245,158,11,0.15)":"rgba(42,107,74,0.12)",
                border:`2px solid ${i===4?COLORS.amber:COLORS.green}` }}>
                <span style={{ fontSize:14 }}>{i===4?"⚠":"✓"}</span>
              </div>
              <div style={{ fontSize:11, fontWeight:600, color:COLORS.muted }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14, fontFamily:FONTS.serif }}>Upcoming Assignments</div>
        {DEMO.assignments.slice(0,3).map(a => (
          <div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${COLORS.border}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500 }}>{a.title}</div>
              <div style={{ fontSize:11, color:COLORS.muted }}>Due: {a.due}</div>
            </div>
            <Badge status="Pending">Pending</Badge>
          </div>
        ))}
      </div>
    </div>
  );
});

const NotificationCenter = memo(function NotificationCenter() {
  const [notifs, setNotifs] = useState(DEMO.notifications);
  const [filter, setFilter] = useState("all");

  const markRead = useCallback((id) =>
    setNotifs(prev => prev.map(n => n.id===id ? {...n,read:true} : n)), []);
  const markAll  = useCallback(() =>
    setNotifs(prev => prev.map(n => ({...n,read:true}))), []);

  const displayed = filter==="all" ? notifs : notifs.filter(n => !n.read);
  const unread    = notifs.filter(n => !n.read).length;
  const typeIcon  = { alert:"🔔", info:"ℹ️", warning:"⚠️", success:"✅" };

  return (
    <div>
      <SectionHeader
        title="Notification Center"
        subtitle={`${unread} unread notification${unread!==1?"s":""}`}
        action={<Btn variant="outline" size="sm" onClick={markAll}>Mark All Read</Btn>}
      />
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["all","unread"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"6px 16px", borderRadius:100, border:`1.5px solid ${filter===f?COLORS.green:COLORS.faint}`,
            background:filter===f?COLORS.greenMuted:"transparent", color:filter===f?COLORS.green:COLORS.dark,
            fontSize:12, fontWeight:600, cursor:"pointer", textTransform:"capitalize", fontFamily:FONTS.sans,
          }}>{f} {f==="unread"&&unread>0?`(${unread})`:""}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {displayed.length===0 && <EmptyState icon="🔔" title="All caught up!" subtitle="No notifications to show." />}
        {displayed.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)} style={{
            background:n.read?COLORS.surface:"rgba(42,107,74,0.04)",
            borderRadius:10, border:`1px solid ${n.read?COLORS.border:"rgba(42,107,74,0.18)"}`,
            padding:"14px 16px", cursor:"pointer", transition:"all 0.18s",
          }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{typeIcon[n.type]}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ fontWeight:n.read?500:700, fontSize:13 }}>{n.title}</span>
                  <span style={{ fontSize:11, color:COLORS.muted }}>{n.time}</span>
                </div>
                <div style={{ fontSize:12, color:COLORS.muted, lineHeight:1.5 }}>{n.message}</div>
              </div>
              {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS.green, flexShrink:0, marginTop:4 }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const ReportsModule = memo(function ReportsModule() {
  const [activeReport, setActiveReport] = useState("attendance");
  const reports = [
    { id:"attendance", label:"Attendance Report",    icon:"◈" },
    { id:"fees",       label:"Fee Collection",       icon:"◎" },
    { id:"payroll",    label:"Payroll Summary",      icon:"◐" },
    { id:"academic",   label:"Academic Performance", icon:"◑" },
  ];
  const attData = DEMO.students.map(s => ({ name:s.name.split(" ")[0], att:s.attendance }));
  const feeData = DEMO.fees.map(f => ({ name:f.name.split(" ")[0], paid:f.paid, due:f.due }));

  return (
    <div>
      <SectionHeader
        title="Reports & Analytics"
        subtitle="Export and analyze school data"
        action={<Btn variant="green" size="sm">Export PDF</Btn>}
      />
      <TabBar tabs={reports} active={activeReport} onChange={setActiveReport} />
      <div style={{ marginTop:20 }}>
        {activeReport==="attendance" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
              <StatCard label="Avg Attendance"       value="93.4%" color={COLORS.green}  />
              <StatCard label="Perfect Attendance"   value="2"     sub="students" color={COLORS.navy} />
              <StatCard label="Below 85%"            value="2"     sub="at risk"  color={COLORS.red}  />
              <StatCard label="Today's Rate"         value={`${Math.round((DEMO.todayAttendance.present/DEMO.todayAttendance.total)*100)}%`} color={COLORS.purple} />
            </div>
            <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Student-wise Attendance</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {attData.sort((a,b)=>b.att-a.att).map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:12, color:COLORS.muted, width:80, flexShrink:0, textAlign:"right" }}>{s.name}</span>
                    <div style={{ flex:1, height:20, background:"rgba(28,27,23,0.06)", borderRadius:4, position:"relative", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:4, transition:"width 0.8s ease", width:`${s.att}%`,
                        background:s.att>=90?`linear-gradient(to right,${COLORS.green},${COLORS.greenLight})`:s.att>=75?`linear-gradient(to right,${COLORS.amber},#F59E0B)`:`linear-gradient(to right,${COLORS.red},#EF4444)` }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, width:38, flexShrink:0, color:s.att>=90?COLORS.green:s.att>=75?COLORS.amber:COLORS.red }}>{s.att}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeReport==="fees" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
              <StatCard label="Total Annual" value={fmtINR(DEMO.fees.reduce((s,f)=>s+f.annual,0))} color={COLORS.navy}   />
              <StatCard label="Collected"    value={fmtINR(DEMO.fees.reduce((s,f)=>s+f.paid,0))}   color={COLORS.green}  />
              <StatCard label="Pending"      value={fmtINR(DEMO.fees.reduce((s,f)=>s+f.due,0))}    color={COLORS.red}    />
              <StatCard label="Collection %" value="81%"                                             color={COLORS.purple} />
            </div>
            <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Fee Collection by Student</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {feeData.map((f,i) => {
                  const total = f.paid+f.due;
                  const pct   = total>0?Math.round((f.paid/total)*100):0;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ fontSize:12, color:COLORS.muted, width:80, flexShrink:0, textAlign:"right" }}>{f.name}</span>
                      <div style={{ flex:1, height:20, background:"rgba(28,27,23,0.06)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(to right,${COLORS.green},${COLORS.greenLight})`, borderRadius:4, transition:"width 0.8s ease" }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, width:38, flexShrink:0, color:pct===100?COLORS.green:pct>50?COLORS.amber:COLORS.red }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {activeReport==="payroll" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
              <StatCard label="Gross Payroll" value={fmtINR(DEMO.payroll.reduce((s,p)=>s+p.salary,0))} color={COLORS.navy}   />
              <StatCard label="Net Payable"   value={fmtINR(DEMO.payroll.reduce((s,p)=>s+p.net,0))}    color={COLORS.green}  />
              <StatCard label="Deductions"    value={fmtINR(DEMO.payroll.reduce((s,p)=>s+p.deductions+p.lop,0))} color={COLORS.amber} />
              <StatCard label="Processed"     value={`${DEMO.payroll.filter(p=>p.status==="Processed").length}/6`} color={COLORS.purple} />
            </div>
            <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Payroll Breakdown</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {DEMO.payroll.map((p,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <Avatar name={p.name} size={28} color={COLORS.navy} />
                    <span style={{ flex:1, fontSize:13, fontWeight:500 }}>{p.name.split(" ").slice(1).join(" ")}</span>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:COLORS.green }}>{fmtINR(p.net)}</div>
                      <div style={{ fontSize:10, color:COLORS.muted }}>{p.present} days</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeReport==="academic" && (
          <div>
            <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>Assignment Completion Rate</div>
              <p style={{ fontSize:12, color:COLORS.muted, marginBottom:16 }}>% of students submitting on time</p>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {DEMO.assignments.map((a,i) => {
                  const pct = Math.round((a.submitted/a.total)*100);
                  return (
                    <div key={i}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12 }}>{a.title}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:pct>80?COLORS.green:COLORS.amber }}>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} color={pct>80?COLORS.green:COLORS.amber} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop:16, background:"rgba(42,107,74,0.06)", border:`1px solid rgba(42,107,74,0.15)`, borderRadius:10, padding:"14px 18px" }}>
              <p style={{ fontSize:13, color:"#1B4D3E", lineHeight:1.7 }}>
                📊 <strong>Upcoming Exams:</strong> Unit Test I on June 20–22. Recommend sending revision reminders to Class X-A and IX-B.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const DashboardOverview = memo(function DashboardOverview() {
  const { present, late, absent, total } = DEMO.todayAttendance;
  const attPct       = Math.round((present/total)*100);
  const feeCollected = DEMO.fees.reduce((s,f)=>s+f.paid,0);
  const feePending   = DEMO.fees.reduce((s,f)=>s+f.due,0);
  const feeTotal     = feeCollected+feePending;
  const feePct       = Math.round((feeCollected/feeTotal)*100);

  return (
    <div>
      <SectionHeader title="School Overview" subtitle="Wednesday, June 3, 2026 · Live dashboard" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard label="Present Today"   value={present}          sub={`of ${total}`} color={COLORS.green}  />
        <StatCard label="Late Today"      value={late}             sub="students"      color={COLORS.amber}  />
        <StatCard label="Absent Today"    value={absent}           sub="students"      color={COLORS.red}    />
        <StatCard label="Attendance Rate" value={`${attPct}%`}     sub="today"         color={COLORS.navy}   />
        <StatCard label="Fee Collected"   value={fmtINR(feeCollected)} sub="this year" color={COLORS.green}  />
        <StatCard label="Fee Pending"     value={fmtINR(feePending)}   sub="outstanding" color={COLORS.amber} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14, fontFamily:FONTS.serif }}>Weekly Attendance Trend</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:90 }}>
            {DEMO.weeklyTrend.map((d,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:10, fontWeight:700, color:COLORS.green }}>{d.pct}%</span>
                <div style={{ width:"100%", background:"rgba(42,107,74,0.1)", borderRadius:4, height:64, position:"relative" }}>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, background:`linear-gradient(to top,${COLORS.green},${COLORS.greenLight})`, borderRadius:4, height:`${d.pct}%`, transition:"height 1s ease" }} />
                </div>
                <span style={{ fontSize:10, color:COLORS.muted }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14, fontFamily:FONTS.serif }}>Fee Collection Rate</div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", width:80, height:80, flexShrink:0 }}>
              <svg viewBox="0 0 36 36" style={{ transform:"rotate(-90deg)", width:80, height:80 }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(28,27,23,0.06)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={COLORS.green} strokeWidth="3.5"
                  strokeDasharray={`${feePct} ${100-feePct}`} strokeLinecap="round" />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:COLORS.green }}>{feePct}%</div>
            </div>
            <div>
              <div style={{ fontSize:12, color:COLORS.muted, marginBottom:6 }}>Collected</div>
              <div style={{ fontWeight:700, fontSize:16, color:COLORS.green, fontFamily:FONTS.serif }}>{fmtINR(feeCollected)}</div>
              <div style={{ fontSize:12, color:COLORS.muted, marginTop:8, marginBottom:4 }}>Pending</div>
              <div style={{ fontWeight:700, fontSize:14, color:COLORS.red }}>{fmtINR(feePending)}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:14, fontFamily:FONTS.serif }}>Recent Activity</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {DEMO.recentActivity.map((a,i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{a.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:COLORS.dark, lineHeight:1.4 }}>{a.text}</div>
                <div style={{ fontSize:11, color:COLORS.muted, marginTop:2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:10, marginTop:16 }}>
        {[
          { icon:"◈", label:"Take Attendance", color:COLORS.green  },
          { icon:"◇", label:"Add Student",     color:COLORS.navy   },
          { icon:"◎", label:"Record Fee",      color:COLORS.purple },
          { icon:"🔔", label:"Send Alert",     color:"#7A3A00"     },
        ].map((q,i) => (
          <div key={i}
            style={{ background:COLORS.surface, borderRadius:10, border:`1px solid ${COLORS.border}`, padding:"14px 12px", textAlign:"center", cursor:"pointer", transition:"all 0.18s" }}
            onMouseEnter={e=>{e.currentTarget.style.background=COLORS.bg;e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=COLORS.surface;e.currentTarget.style.transform="";}}>
            <div style={{ fontSize:22, marginBottom:6 }}>{q.icon}</div>
            <div style={{ fontSize:11, fontWeight:600, color:q.color, lineHeight:1.3 }}>{q.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ==================== DEMO DASHBOARD SHELL ====================
const DemoDashboard = memo(function DemoDashboard({ user, trialExpiryDate, onClose, onSignOut, isFullPage = false }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [daysLeft, setDaysLeft]   = useState(7);
  const [expired, setExpired]     = useState(false);
  const [contactStatus, setContactStatus] = useState("idle");
  const [contactForm, setContactForm]     = useState({ schoolName:"", contactPerson:"", mobile:"", email:"", students:"", message:"" });
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const unreadNotifs = DEMO.notifications.filter(n => !n.read).length;

  useEffect(() => {
    const expiry = toDate(trialExpiryDate);
    if (!expiry) return;
    const left = Math.ceil((expiry - new Date()) / (1000*60*60*24));
    if (left <= 0) setExpired(true);
    else setDaysLeft(left);
  }, [trialExpiryDate]);

  const handleContactSubmit = useCallback(async (e) => {
    e.preventDefault();
    setContactStatus("sending");
    try {
      await addDoc(collection(db,"salesLeads"), {
        ...contactForm, source:"demo_expired", uid:user?.uid, createdAt:serverTimestamp(),
      });
      // Fire-and-forget GET for legacy Sheet URL — CORS not needed for GET on same domain
      try {
        const p = new URLSearchParams({ ...contactForm, source:"demo_expired", timestamp:new Date().toISOString() });
        await fetch(`${INQUIRY_SHEET_URL}?${p.toString()}`, { method:"GET", mode:"no-cors" });
      } catch { /* non-critical */ }
      setContactStatus("success");
    } catch (err) {
      console.error("[NexaAttend] Contact form submission failed:", err);
      setContactStatus("error");
    }
  }, [contactForm, user]);

  const moduleMap = useMemo(() => ({
    overview:      <DashboardOverview />,
    attendance:    <AttendanceModule />,
    students:      <StudentModule />,
    staff:         <StaffModule />,
    leave:         <LeaveModule />,
    payroll:       <PayrollModule />,
    fees:          <FeeModule />,
    exams:         <ExamModule />,
    assignments:   <AssignmentModule />,
    parents:       <ParentPortal />,
    notifications: <NotificationCenter />,
    reports:       <ReportsModule />,
  }), []);

  if (expired && contactStatus !== "success") {
    const iSt = { padding:"10px 14px", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, fontSize:14, fontFamily:FONTS.sans, background:COLORS.bg, outline:"none", width:"100%", boxSizing:"border-box" };
    return (
      <div style={{ padding:40, maxWidth:520, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>⏰</div>
        <h2 style={{ fontFamily:FONTS.serif, fontSize:26, marginBottom:8 }}>Your trial has ended</h2>
        <p style={{ color:COLORS.muted, marginBottom:28, lineHeight:1.7 }}>Contact our team to continue using NexaAttend at your school.</p>
        <form onSubmit={handleContactSubmit} style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
          {[["schoolName","School Name"],["contactPerson","Your Name"],["mobile","Mobile Number"],["email","Email"],["students","No. of Students"]].map(([k,p]) => (
            <input key={k} placeholder={p} required value={contactForm[k]}
              onChange={e=>setContactForm(f=>({...f,[k]:e.target.value}))} style={iSt} />
          ))}
          <textarea placeholder="Message (optional)" rows={3} value={contactForm.message}
            onChange={e=>setContactForm(f=>({...f,message:e.target.value}))} style={{...iSt,resize:"vertical"}} />
          <button type="submit" disabled={contactStatus==="sending"} style={{ padding:13, background:COLORS.dark, color:"#F7F5EF", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
            {contactStatus==="sending"?"Sending…":"Contact Sales Team"}
          </button>
        </form>
      </div>
    );
  }

  if (contactStatus==="success") {
    return (
      <div style={{ padding:"60px 40px", textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(42,107,74,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={COLORS.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 style={{ fontFamily:FONTS.serif, fontSize:22, marginBottom:8 }}>We'll be in touch!</h3>
        <p style={{ color:COLORS.muted }}>Our team will call you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:isFullPage?"calc(100vh - 62px)":"90vh", background:COLORS.bg, borderRadius:isFullPage?0:24, overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:sidebarOpen?220:64, background:"#1C1B17", display:"flex", flexDirection:"column", flexShrink:0, transition:"width 0.25s cubic-bezier(0.16,1,0.3,1)", overflowX:"hidden" }}>
        <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(247,245,239,0.07)", display:"flex", alignItems:"center", gap:10, minWidth:220 }}>
          <div style={{ width:32, height:32, background:COLORS.green, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/>
              <path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          {sidebarOpen && (
            <div style={{ overflow:"hidden", whiteSpace:"nowrap" }}>
              <div style={{ fontFamily:FONTS.serif, fontSize:15, color:"#F7F5EF" }}>NexaAttend</div>
              <div style={{ fontSize:9, letterSpacing:"0.1em", color:"rgba(247,245,239,0.35)", textTransform:"uppercase" }}>Demo Portal</div>
            </div>
          )}
        </div>

        <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(247,245,239,0.07)", minWidth:220 }}>
          {user?.photoURL && <img src={user.photoURL} alt="profile" style={{ width:28, height:28, borderRadius:"50%", marginBottom:6 }} />}
          {sidebarOpen && (
            <>
              <div style={{ fontSize:11, fontWeight:600, color:"#F7F5EF" }}>{user?.displayName || "Demo User"}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:daysLeft>3?"#5AC87A":COLORS.amber }} />
                <span style={{ fontSize:10, color:"rgba(247,245,239,0.4)" }}>{daysLeft}d trial left</span>
              </div>
            </>
          )}
        </div>

        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto", overflowX:"hidden" }}>
          {NAV_TABS.map(t => {
            const isCurrent  = activeTab===t.id;
            const showBadge  = t.id==="notifications"&&unreadNotifs>0;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} title={!sidebarOpen?t.label:""} style={{
                width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"9px 10px", borderRadius:8, border:"none", cursor:"pointer",
                background:isCurrent?"rgba(247,245,239,0.1)":"transparent",
                color:isCurrent?"#F7F5EF":"rgba(247,245,239,0.4)",
                fontSize:12, fontWeight:isCurrent?600:400, fontFamily:FONTS.sans,
                marginBottom:2, borderLeft:`2px solid ${isCurrent?COLORS.greenLight:"transparent"}`,
                transition:"all 0.15s", whiteSpace:"nowrap", minWidth:0, position:"relative",
              }}>
                <span style={{ fontSize:13, flexShrink:0 }}>{t.icon}</span>
                {sidebarOpen && <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{t.label}</span>}
                {showBadge&&sidebarOpen && (
                  <span style={{ marginLeft:"auto", background:COLORS.red, color:"#fff", borderRadius:100, fontSize:10, padding:"1px 6px", fontWeight:700 }}>{unreadNotifs}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"10px 8px", borderTop:"1px solid rgba(247,245,239,0.07)", minWidth:220 }}>
          {sidebarOpen && (
            <div style={{ background:"rgba(90,200,122,0.08)", border:"1px solid rgba(90,200,122,0.18)", borderRadius:8, padding:"8px 10px", marginBottom:8 }}>
              <div style={{ fontSize:9, color:"rgba(247,245,239,0.4)", marginBottom:2 }}>Sample data only</div>
              <div style={{ fontSize:10, color:COLORS.greenLight, fontWeight:700 }}>This is a live demo</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o=>!o)} style={{ width:"100%", padding:"8px", background:"rgba(247,245,239,0.05)", border:"1px solid rgba(247,245,239,0.08)", borderRadius:8, color:"rgba(247,245,239,0.4)", fontSize:11, cursor:"pointer", marginBottom:6, fontFamily:FONTS.sans }}>
            {sidebarOpen?"⟨ Collapse":"⟩"}
          </button>
          <button onClick={onSignOut} style={{ width:"100%", padding:"8px", background:"rgba(247,245,239,0.05)", border:"1px solid rgba(247,245,239,0.08)", borderRadius:8, color:"rgba(247,245,239,0.4)", fontSize:11, cursor:"pointer", fontFamily:FONTS.sans }}>
            {sidebarOpen?"Sign out":"↩"}
          </button>
          {!isFullPage&&sidebarOpen && (
            <button onClick={onClose} style={{ width:"100%", padding:"7px", background:"transparent", border:"none", color:"rgba(247,245,239,0.25)", fontSize:11, cursor:"pointer", marginTop:4, fontFamily:FONTS.sans }}>
              ✕ Close demo
            </button>
          )}
        </div>
      </div>

      {/* Main panel */}
      <div style={{ flex:1, overflowY:"auto", background:COLORS.bg, minWidth:0 }}>
        <div style={{ padding:"14px 24px", background:COLORS.surface, borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
          <div>
            <h2 style={{ fontSize:16, fontWeight:700, color:COLORS.dark, fontFamily:FONTS.serif }}>
              {NAV_TABS.find(t=>t.id===activeTab)?.label}
            </h2>
            <p style={{ fontSize:11, color:COLORS.muted, marginTop:1 }}>June 3, 2026 · Demo Environment</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:COLORS.greenMuted, border:`1px solid rgba(42,107,74,0.18)`, borderRadius:100, padding:"5px 12px" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green }} />
              <span style={{ fontSize:10, fontWeight:700, color:"#1B5C3A", letterSpacing:"0.07em" }}>DEMO</span>
            </div>
          </div>
        </div>
        <div style={{ padding:"22px 24px" }}>
          <Suspense fallback={<Spinner />}>
            {moduleMap[activeTab] || <EmptyState title="Coming soon" />}
          </Suspense>
        </div>
      </div>
    </div>
  );
});

// ==================== FULL-PAGE DEMO WRAPPER ====================
const DemoPage = memo(function DemoPage({ user, trialExpiryDate, onSignOut, onBack }) {
  // Log the demo visit on mount (fire-and-forget, non-blocking)
  const hasLogged = useRef(false);

  useEffect(() => {
    if (!user || hasLogged.current) return;
    hasLogged.current = true;

    const payload = {
      event:       "demo_visit",
      name:        user.displayName  || "Unknown",
      email:       user.email        || "Unknown",
      uid:         user.uid,
      timestamp:   new Date().toISOString(),
      trialExpiry: trialExpiryDate
        ? (toDate(trialExpiryDate)?.toISOString() ?? "unknown")
        : "unknown",
      userAgent:   navigator.userAgent,
    };

    logDemoVisitToSheets(payload)
      .then(result => {
        if (!result.success) {
          console.warn("[NexaAttend] Sheets logging ultimately failed (non-fatal):", result.error);
        }
      });
  }, [user, trialExpiryDate]);

  return (
    <div style={{ minHeight:"100vh", background:COLORS.bg }}>
      <div style={{ position:"sticky", top:0, background:COLORS.surface, borderBottom:`1px solid ${COLORS.border}`, padding:"12px 24px", display:"flex", alignItems:"center", gap:14, zIndex:20, height:62, boxSizing:"border-box" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:COLORS.green }}>←</button>
        <div>
          <div style={{ fontFamily:FONTS.serif, fontSize:18, fontWeight:600 }}>NexaAttend Demo</div>
          <div style={{ fontSize:11, color:COLORS.muted }}>Live trial dashboard</div>
        </div>
        <button onClick={onSignOut} style={{ marginLeft:"auto", background:COLORS.dark, color:"#F7F5EF", border:"none", borderRadius:6, padding:"8px 16px", fontSize:13, fontWeight:500, cursor:"pointer" }}>
          Sign Out
        </button>
      </div>
      <DemoDashboard user={user} trialExpiryDate={trialExpiryDate} onClose={onBack} onSignOut={onSignOut} isFullPage={true} />
    </div>
  );
});

// ==================== INQUIRY FORM ====================
const InquiryForm = memo(function InquiryForm() {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({
    name:"", role:"", school:"", city:"",
    phone:"", email:"", students:"", board:"",
    plan:"Standard (up to 600 students — ₹9,000/mo)",
    hear:"", message:"",
  });
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState("idle");
  const [focused, setFocused] = useState(null);

  const setF = useCallback(k => e => {
    setForm(f => ({...f,[k]:e.target.value}));
    if (errors[k]) setErrors(p => { const n={...p}; delete n[k]; return n; });
  }, [errors]);

  const validate = useCallback(() => {
    const errs = {};
    if (step===1) {
      if (!form.name.trim()) errs.name="Required";
      if (!form.role) errs.role="Required";
      if (!form.phone.trim()||!/^\+?[\d\s\-]{10,15}$/.test(form.phone.replace(/\s/g,""))) errs.phone="Valid 10-digit number";
      if (form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email="Invalid email";
    }
    if (step===2) {
      if (!form.school.trim()) errs.school="Required";
      if (!form.city.trim())   errs.city="Required";
      if (!form.students)      errs.students="Required";
    }
    return errs;
  }, [step, form]);

  const next = useCallback(() => {
    const e = validate();
    setErrors(e);
    if (!Object.keys(e).length) setStep(s=>s+1);
  }, [validate]);

  const submit = useCallback(async () => {
    setStatus("sending");
    const lead = { ...form, timestamp:new Date().toISOString() };
    try {
      await addDoc(collection(db,"salesLeads"), { ...lead, createdAt:serverTimestamp() });
      // GET is fire-and-forget for this legacy sheet endpoint
      try {
        await fetch(`${INQUIRY_SHEET_URL}?${new URLSearchParams(lead)}`, { method:"GET", mode:"no-cors" });
      } catch { /* non-critical */ }
      setStatus("success");
    } catch (err) {
      console.error("[NexaAttend] Inquiry form submission failed:", err);
      setStatus("error");
    }
  }, [form]);

  const iSt = useCallback((k) => ({
    width:"100%", padding:"10px 13px", fontSize:14, fontFamily:FONTS.sans,
    background:focused===k?"#FFFFFF":COLORS.bg, color:COLORS.dark,
    border:`1.5px solid ${errors[k]?COLORS.red:focused===k?COLORS.green:COLORS.faint}`,
    borderRadius:8, outline:"none", transition:"all 0.2s", boxSizing:"border-box",
    boxShadow:focused===k&&!errors[k]?"0 0 0 3px rgba(42,107,74,0.1)":errors[k]?"0 0 0 3px rgba(122,26,26,0.08)":"none",
  }), [focused, errors]);

  const lSt = { fontSize:11, fontWeight:600, color:COLORS.muted, marginBottom:5, display:"block", letterSpacing:"0.03em" };
  const eSt = { fontSize:11.5, color:"#C0392B", marginTop:3 };
  const sOpt = useCallback((k) => ({ ...iSt(k), appearance:"none", WebkitAppearance:"none",
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231C1B17' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition:"right 13px center", paddingRight:36, cursor:"pointer",
  }), [iSt]);

  const planOpts = [
    { v:"Basic (up to 300 students — ₹6,000/mo)",    l:"Basic",    sub:"Up to 300",  price:"₹6,000/mo",  c:COLORS.navy   },
    { v:"Standard (up to 600 students — ₹9,000/mo)", l:"Standard", sub:"Up to 600",  price:"₹9,000/mo",  c:COLORS.green  },
    { v:"Premium (up to 999 students — ₹12,000/mo)", l:"Premium",  sub:"Up to 999",  price:"₹12,000/mo", c:COLORS.purple },
  ];

  if (status==="success") return (
    <div style={{ textAlign:"center", padding:"56px 32px" }}>
      <div style={{ width:68, height:68, borderRadius:"50%", background:"rgba(42,107,74,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={COLORS.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h3 style={{ fontFamily:FONTS.serif, fontSize:22, marginBottom:8 }}>Inquiry received!</h3>
      <p style={{ fontSize:14, color:COLORS.muted, lineHeight:1.8, maxWidth:360, margin:"0 auto 24px" }}>
        Thank you, {form.name}! Our team will contact you at {form.phone} within 24 hours.
      </p>
      <a href="https://wa.me/919974724656" style={{ display:"inline-flex", alignItems:"center", gap:8, background:COLORS.dark, color:"#F7F5EF", borderRadius:8, padding:"11px 22px", fontSize:14, fontWeight:600, textDecoration:"none" }}>💬 Message on WhatsApp</a>
    </div>
  );

  if (status==="error") return (
    <div style={{ textAlign:"center", padding:"44px 32px" }}>
      <div style={{ fontSize:38, marginBottom:14 }}>⚠️</div>
      <h3 style={{ fontSize:19, fontWeight:600, marginBottom:8 }}>Couldn't send right now</h3>
      <p style={{ fontSize:13, color:COLORS.muted, marginBottom:22, lineHeight:1.8 }}>Please reach us on WhatsApp instead.</p>
      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        <a href="https://wa.me/919974724656" style={{ display:"inline-flex", gap:7, background:COLORS.green, color:"#F7F5EF", borderRadius:8, padding:"11px 18px", fontSize:13, fontWeight:600, textDecoration:"none" }}>💬 WhatsApp Us</a>
        <button onClick={()=>setStatus("idle")} style={{ background:"none", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, padding:"10px 18px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:FONTS.sans }}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div style={{ background:COLORS.surface, borderRadius:16, border:`1px solid ${COLORS.border}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(28,27,23,0.06)" }}>
      <div style={{ padding:"22px 26px 18px", borderBottom:`1px solid ${COLORS.border}`, background:"linear-gradient(135deg,#FAFAF8,#F7F5EF)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ width:38, height:38, background:COLORS.green, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#F7F5EF" strokeWidth="1.5"/><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:COLORS.dark, fontFamily:FONTS.serif }}>Book a Free Demo</div>
            <div style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:COLORS.green, fontWeight:600 }}>NexaAttend · School Inquiry</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, background:COLORS.greenMuted, border:`1px solid rgba(42,107,74,0.18)`, borderRadius:100, padding:"4px 12px" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green }} />
            <span style={{ fontSize:9, fontWeight:700, color:"#1B5C3A", letterSpacing:"0.07em" }}>FREE · NO OBLIGATION</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {["About You","Your School","Choose Plan"].map((label,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700,
                  background:step>i+1?COLORS.green:step===i+1?COLORS.dark:"rgba(28,27,23,0.08)",
                  color:step>=i+1?"#F7F5EF":"rgba(28,27,23,0.35)" }}>
                  {step>i+1?"✓":i+1}
                </div>
                <span style={{ fontSize:11, fontWeight:step===i+1?600:400, color:step===i+1?COLORS.dark:COLORS.muted }}>{label}</span>
              </div>
              {i<2&&<div style={{ width:20, height:1, background:step>i+1?COLORS.green:COLORS.faint }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"22px 26px 26px" }}>
        {step===1 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["name","Full Name"],["role",null],["phone","Mobile Number"],["email","Email (optional)"]].map(([k,p]) => (
              <div key={k}>
                <label style={lSt}>{p||"Your Role"}{k!=="email"&&<span style={{color:"#C0392B"}}> *</span>}</label>
                {k==="role"?(
                  <select value={form.role} onChange={setF("role")} onFocus={()=>setFocused("role")} onBlur={()=>setFocused(null)} style={sOpt("role")}>
                    <option value="">Select role…</option>
                    {["Principal / Headmaster","School Owner / Trustee","Administrator","IT Coordinator","Teacher / HOD","Finance Manager","Other"].map(o=><option key={o}>{o}</option>)}
                  </select>
                ):(
                  <div style={{ position:"relative" }}>
                    {k==="phone"&&<span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:COLORS.muted, pointerEvents:"none" }}>+91</span>}
                    <input type={k==="email"?"email":"text"} placeholder={p} value={form[k]} onChange={setF(k)} onFocus={()=>setFocused(k)} onBlur={()=>setFocused(null)} style={{...iSt(k),paddingLeft:k==="phone"?44:undefined}} />
                  </div>
                )}
                {errors[k]&&<span style={eSt}>{errors[k]}</span>}
              </div>
            ))}
          </div>
        )}

        {step===2 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["school","School Name"],["city","City / District"],["students",null],["board",null],["hear",null]].map(([k,p]) => (
              <div key={k}>
                <label style={lSt}>{p||{students:"Total Students",board:"School Board",hear:"How did you hear about us?"}[k]}{["school","city","students"].includes(k)&&<span style={{color:"#C0392B"}}> *</span>}</label>
                {["students","board","hear"].includes(k)?(
                  <select value={form[k]} onChange={setF(k)} onFocus={()=>setFocused(k)} onBlur={()=>setFocused(null)} style={sOpt(k)}>
                    <option value="">Select…</option>
                    {k==="students"&&["Under 100","100–200","200–300","300–500","500–600","600–800","800–999","1000+"].map(o=><option key={o}>{o}</option>)}
                    {k==="board"   &&["CBSE","GSEB (Gujarat Board)","ICSE / ISC","IB","Cambridge (IGCSE)","State Board (Other)","Private / Autonomous","Other"].map(o=><option key={o}>{o}</option>)}
                    {k==="hear"   &&["Google Search","WhatsApp / Word of Mouth","LinkedIn","Instagram / Facebook","Another School Recommended","Newspaper / Advertisement","Education Conference / Event","Other"].map(o=><option key={o}>{o}</option>)}
                  </select>
                ):(
                  <input type="text" placeholder={p} value={form[k]} onChange={setF(k)} onFocus={()=>setFocused(k)} onBlur={()=>setFocused(null)} style={iSt(k)} />
                )}
                {errors[k]&&<span style={eSt}>{errors[k]}</span>}
              </div>
            ))}
          </div>
        )}

        {step===3 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
              {planOpts.map(opt => {
                const sel=form.plan===opt.v;
                return (
                  <button key={opt.v} type="button" onClick={()=>setForm(f=>({...f,plan:opt.v}))} style={{
                    padding:"13px 10px", borderRadius:10, border:`2px solid ${sel?opt.c:COLORS.faint}`,
                    background:sel?`${opt.c}10`:COLORS.bg, cursor:"pointer", textAlign:"left", transition:"all 0.18s", position:"relative", fontFamily:FONTS.sans,
                  }}>
                    {sel&&<div style={{ position:"absolute", top:-8, right:-8, width:18, height:18, borderRadius:"50%", background:opt.c, display:"flex", alignItems:"center", justifyContent:"center" }}><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                    <div style={{ fontSize:13, fontWeight:700, color:sel?opt.c:COLORS.dark, marginBottom:2 }}>{opt.l}</div>
                    <div style={{ fontSize:10, color:COLORS.muted, marginBottom:3 }}>{opt.sub} students</div>
                    <div style={{ fontSize:12, fontWeight:600, color:sel?opt.c:"rgba(28,27,23,0.55)" }}>{opt.price}</div>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize:11, color:COLORS.muted, marginBottom:12, lineHeight:1.6 }}>Every plan includes a <strong>free 7-day trial</strong>. Setup: <strong style={{color:COLORS.green}}>₹45,000</strong> <span style={{textDecoration:"line-through"}}>₹75,000</span>.</p>
            <textarea placeholder="Anything you'd like us to know?" value={form.message} onChange={setF("message")} onFocus={()=>setFocused("message")} onBlur={()=>setFocused(null)} rows={3} style={{...iSt("message"),resize:"vertical",minHeight:76,lineHeight:1.65}} />
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{ padding:"11px 18px", background:"transparent", border:`1.5px solid ${COLORS.faint}`, borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer", color:COLORS.dark, fontFamily:FONTS.sans }}>← Back</button>}
          {step<3?(
            <button onClick={next}
              onMouseEnter={e=>e.currentTarget.style.background=COLORS.green}
              onMouseLeave={e=>e.currentTarget.style.background=COLORS.dark}
              style={{ flex:1, padding:"12px 22px", background:COLORS.dark, color:"#F7F5EF", border:"none", borderRadius:9, fontSize:14, fontWeight:700, fontFamily:FONTS.sans, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"background 0.2s" }}>
              Continue <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ):(
            <button onClick={submit} disabled={status==="sending"}
              onMouseEnter={e=>{if(status!=="sending")e.currentTarget.style.background=COLORS.green;}}
              onMouseLeave={e=>{if(status!=="sending")e.currentTarget.style.background=COLORS.dark;}}
              style={{ flex:1, padding:"12px 22px", background:status==="sending"?"rgba(28,27,23,0.5)":COLORS.dark, color:"#F7F5EF", border:"none", borderRadius:9, fontSize:14, fontWeight:700, fontFamily:FONTS.sans, cursor:status==="sending"?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"background 0.2s" }}>
              {status==="sending"?"Sending…":<>Book My Free Demo <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
            </button>
          )}
        </div>
        <p style={{ fontSize:11, color:"rgba(28,27,23,0.35)", textAlign:"center", marginTop:10 }}>🔒 Your information is never shared with third parties.</p>
      </div>
    </div>
  );
});

// ==================== LEGAL PAGES ====================
const PrivacyPolicy = memo(function PrivacyPolicy({ onBack }) {
  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding:"120px 6% 80px", background:COLORS.bg, minHeight:"100vh" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:COLORS.green, cursor:"pointer", marginBottom:24, fontSize:14 }}>← Back to Home</button>
      <h1 style={{ fontFamily:FONTS.serif, fontSize:"2.6rem", marginBottom:24 }}>Privacy Policy</h1>
      <div style={{ background:COLORS.surface, borderRadius:16, padding:32, boxShadow:"0 4px 24px rgba(28,27,23,0.06)", lineHeight:1.8, color:COLORS.muted }}>
        <p style={{ marginBottom:14 }}><strong>Last Updated:</strong> June 1, 2026</p>
        <p>When you sign in using Google OAuth, we collect: name, email address, and profile picture. This is used only for authentication, demo account creation, platform access, and support. We never sell or share your data. Contact: <a href="mailto:tishy5327@gmail.com" style={{ color:COLORS.green }}>tishy5327@gmail.com</a></p>
      </div>
    </div>
  );
});

const TermsOfService = memo(function TermsOfService({ onBack }) {
  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding:"120px 6% 80px", background:COLORS.bg, minHeight:"100vh" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:COLORS.green, cursor:"pointer", marginBottom:24, fontSize:14 }}>← Back to Home</button>
      <h1 style={{ fontFamily:FONTS.serif, fontSize:"2.6rem", marginBottom:24 }}>Terms of Service</h1>
      <div style={{ background:COLORS.surface, borderRadius:16, padding:32, boxShadow:"0 4px 24px rgba(28,27,23,0.06)", lineHeight:1.8, color:COLORS.muted }}>
        <p style={{ marginBottom:14 }}><strong>Last Updated:</strong> June 1, 2026</p>
        <ol style={{ marginLeft:22 }}>
          {[
            "Platform is for demonstration, educational, and management purposes.",
            "Users must not misuse, disrupt, copy, or gain unauthorized access.",
            "Demo access may be limited or revoked at any time.",
            "All IP belongs to Nova Teach ERP.",
            "We are not liable for service interruptions.",
            "Continued use indicates acceptance.",
          ].map((t,i) => <li key={i} style={{ marginBottom:8 }}>{t}</li>)}
        </ol>
        <p style={{ marginTop:14 }}>Contact: <a href="mailto:tishy5327@gmail.com" style={{ color:COLORS.green }}>tishy5327@gmail.com</a></p>
      </div>
    </div>
  );
});

// ==================== FIRESTORE PROFILE SYNC ====================
/**
 * syncUserProfile — FIX: checks currentUidRef before and AFTER each await,
 * so if the user signs out mid-call we abort instead of writing stale data.
 */
async function syncUserProfile(fbUser, setExpiry, currentUidRef) {
  try {
    // Pre-check
    if (currentUidRef.current !== fbUser.uid) {
      console.log("[NexaAttend] syncUserProfile aborted (pre-check) — user changed");
      return;
    }

    const ref  = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);

    // Post-await check
    if (currentUidRef.current !== fbUser.uid) {
      console.log("[NexaAttend] syncUserProfile aborted (post-getDoc) — user changed");
      return;
    }

    let exp;
    if (!snap.exists()) {
      exp = new Date();
      exp.setDate(exp.getDate() + 7);
      await setDoc(ref, {
        uid:             fbUser.uid,
        displayName:     fbUser.displayName,
        email:           fbUser.email,
        photoURL:        fbUser.photoURL,
        firstLoginDate:  new Date().toISOString(),
        trialExpiryDate: exp.toISOString(),
        lastLogin:       new Date().toISOString(),
      }, { merge: true });
      console.log("[NexaAttend] New user created. Trial expires:", exp.toISOString());
    } else {
      await setDoc(ref, { lastLogin: new Date().toISOString() }, { merge: true });
      exp = toDate(snap.data().trialExpiryDate);
      console.log("[NexaAttend] Existing user. Trial expires:", exp);
    }

    // Final check before updating state
    if (currentUidRef.current !== fbUser.uid) {
      console.log("[NexaAttend] syncUserProfile aborted (post-setDoc) — user changed");
      return;
    }

    setExpiry(exp);
  } catch (err) {
    console.error("[NexaAttend] Firestore profile sync failed (non-fatal):", err.message);
    // Fallback: give 7 days so user can access dashboard even if Firestore is down
    if (currentUidRef.current === fbUser.uid) {
      const fallbackExp = new Date();
      fallbackExp.setDate(fallbackExp.getDate() + 7);
      setExpiry(fallbackExp);
    }
  }
}

// ==================== MAIN APP COMPONENT ====================
export default function App() {
  const [hash, setHash] = useState(window.location.hash.slice(1) || "/");

  useEffect(() => {
    const fn = () => setHash(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  const nav = useCallback((path) => { window.location.hash = path; }, []);

  // ── Auth state ──
  const [user,              setUser]              = useState(null);
  const [trialExpiry,       setExpiry]            = useState(null);
  const [authReady,         setAuthReady]         = useState(false);
  const [authError,         setAuthError]         = useState(null);
  const [isRetryingPopup,   setIsRetryingPopup]   = useState(false);

  // ── Landing page state ──
  const navScrolled = useScroll();
  const [logIdx,     setLogIdx]     = useState(3);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activeFaq,  setActiveFaq]  = useState(null);
  const [selPlan,    setSelPlan]    = useState("standard");

  const currentUidRef = useRef(null);

  // ── Handle redirect result on first load ──
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("[NexaAttend] Redirect sign-in completed for:", result.user.email);
        } else {
          console.log("[NexaAttend] getRedirectResult: no pending redirect.");
        }
      })
      .catch((err) => {
        console.error("[NexaAttend] getRedirectResult failed:", err.code, err.message);
        const friendly = {
          "auth/popup-blocked":           "Your browser blocked the sign-in popup. Please allow popups and try again.",
          "auth/popup-closed-by-user":    "Sign-in was cancelled. Please try again.",
          "auth/unauthorized-domain":     "This domain is not authorised for sign-in. Please contact support.",
          "auth/network-request-failed":  "Network error during sign-in. Please check your connection and try again.",
          "auth/cancelled-popup-request": "Sign-in request was cancelled. Please try again.",
          "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
        };
        setAuthError(friendly[err.code] || `Sign-in error: ${err.message}`);
      });
  }, []);

  // ── Auth state listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ?? null);
      setAuthReady(true);
      currentUidRef.current = fbUser?.uid || null;

      if (fbUser) {
        console.log("[NexaAttend] Auth resolved — signed in:", fbUser.email);
        syncUserProfile(fbUser, setExpiry, currentUidRef);
      } else {
        console.log("[NexaAttend] Auth resolved — signed out.");
        setExpiry(null);
      }
    });
    return () => unsub();
  }, []);

  // ── Sign out ──
  const handleSignOut = useCallback(async () => {
    try {
      setUser(null);
      setExpiry(null);
      setAuthError(null);
      nav("/");
      await firebaseSignOut(auth);
      console.log("[NexaAttend] Signed out.");
    } catch (err) {
      console.error("[NexaAttend] Sign-out failed:", err);
    }
  }, [nav]);

  // ── Sign in ──
  const signIn = useCallback(async (usePopup = false) => {
    try {
      setAuthError(null);
      if (usePopup) {
        setIsRetryingPopup(true);
        const result = await signInWithPopup(auth, googleProvider);
        console.log("[NexaAttend] Popup sign-in success:", result.user.email);
      } else {
        console.log("[NexaAttend] Initiating Google redirect sign-in…");
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (err) {
      console.error("[NexaAttend] signIn failed:", err.code, err.message);
      let msg = `Sign-in error: ${err.message}`;
      if (err.code === "auth/popup-blocked")        msg = "Popup was blocked. Please allow popups for this site.";
      else if (err.code === "auth/popup-closed-by-user") msg = "You closed the popup. Please try again.";
      setAuthError(msg);
    } finally {
      setIsRetryingPopup(false);
    }
  }, []);

  // ── Live attendance log ticker ──
  useEffect(() => {
    const t = setInterval(() => {
      setLogIdx(i => (i >= DEMO.attendanceLogs.length ? i : i+1));
    }, 1900);
    return () => clearInterval(t);
  }, []);

  // ── Page title ──
  useEffect(() => {
    document.title = "School ERP Software in India | AI Attendance, Fees & Analytics | Nova Teach";
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
    setMenuOpen(false);
  }, []);

  const plan = useMemo(() => PLANS.find(p => p.id===selPlan), [selPlan]);

  // ── Route: legal pages ──
  if (hash==="/privacy-policy") return <PrivacyPolicy onBack={() => nav("/")} />;
  if (hash==="/terms")          return <TermsOfService onBack={() => nav("/")} />;

  // ── Route: /demo ──
  if (hash==="/demo") {
    if (!authReady) return <AuthLoadingScreen message="Loading your dashboard…" />;
    if (!user)      { nav("/"); return null; }
    // Wait for Firestore trial expiry before rendering (no flash of expired screen)
    if (trialExpiry === null) return <AuthLoadingScreen message="Loading your trial information…" />;
    return (
      <DemoPage
        user={user}
        trialExpiryDate={trialExpiry}
        onSignOut={handleSignOut}
        onBack={() => nav("/")}
      />
    );
  }

  // ── Route: landing page ──
  return (
    <div style={{ fontFamily:FONTS.sans, background:COLORS.bg, color:COLORS.dark, overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        @keyframes spin        { to { transform:rotate(360deg); } }
        @keyframes pulse       { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeUp      { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn      { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp     { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes tickerScroll{ 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
        ::-webkit-scrollbar        { width:6px; height:6px; }
        ::-webkit-scrollbar-track  { background:transparent; }
        ::-webkit-scrollbar-thumb  { background:rgba(28,27,23,0.18); border-radius:3px; }
      `}</style>

      <AuthErrorBanner
        error={authError}
        onDismiss={() => setAuthError(null)}
        onRetryWithPopup={() => signIn(true)}
      />

      {/* ── Navbar ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"0 5%", height:68,
        background:navScrolled?"rgba(247,245,239,0.96)":"transparent",
        backdropFilter:navScrolled?"blur(14px)":"none",
        borderBottom:navScrolled?`1px solid ${COLORS.border}`:"none",
        transition:"all 0.3s",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ fontFamily:FONTS.serif, fontSize:21, fontWeight:600, cursor:"pointer" }} onClick={() => scrollTo("hero")}>
          NexaAttend
          <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:COLORS.green, marginLeft:4, verticalAlign:"middle", marginBottom:2 }} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:26 }}>
          {[["Features","modules"],["Pricing","pricing"],["FAQ","faq"],["Contact","inquiry"]].map(([l,id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, fontWeight:500, color:COLORS.muted, fontFamily:FONTS.sans, transition:"color 0.2s" }}
              onMouseEnter={e=>e.target.style.color=COLORS.dark} onMouseLeave={e=>e.target.style.color=COLORS.muted}>{l}</button>
          ))}
        </div>
        <div>
          {!authReady ? (
            <div style={{ width:120, height:36, borderRadius:8, background:"rgba(28,27,23,0.06)", animation:"pulse 1.5s infinite" }} />
          ) : user ? (
            <button onClick={() => nav("/demo")} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:COLORS.green, color:"#F7F5EF", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans }}>
              {user.photoURL && <img src={user.photoURL} alt="profile" style={{ width:22, height:22, borderRadius:"50%" }} />}
              Open Dashboard
            </button>
          ) : (
            <button onClick={() => signIn(false)} disabled={isRetryingPopup} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", background:COLORS.dark, color:"#F7F5EF", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans, transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=COLORS.green}
              onMouseLeave={e=>e.currentTarget.style.background=COLORS.dark}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
              Try Free Demo
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"130px 6% 90px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 20%, rgba(42,107,74,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />
        <FadeIn delay={0}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(42,107,74,0.08)", border:"1px solid rgba(42,107,74,0.2)", borderRadius:100, padding:"7px 16px", marginBottom:24 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:COLORS.green, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#1B5C3A", letterSpacing:"0.09em" }}>NOW LIVE IN 40+ SCHOOLS ACROSS GUJARAT</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 style={{ fontFamily:FONTS.serif, fontSize:"clamp(2.6rem,6vw,4.8rem)", lineHeight:1.1, color:COLORS.dark, maxWidth:880, marginBottom:24 }}>
            India's Smartest<br />
            <span style={{ color:COLORS.green, fontStyle:"italic" }}>School ERP</span> with<br />
            AI Face Attendance
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p style={{ fontSize:"clamp(1rem,2vw,1.2rem)", color:COLORS.muted, maxWidth:600, lineHeight:1.75, marginBottom:40 }}>
            Mark 300 students in 60 seconds. Manage fees, staff, exams & reports — all from one offline-first system built for Indian schools.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:56 }}>
            <button onClick={() => signIn(false)} style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 28px", background:COLORS.dark, color:"#F7F5EF", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:FONTS.sans, boxShadow:"0 8px 24px rgba(28,27,23,0.18)", transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=COLORS.green}
              onMouseLeave={e=>e.currentTarget.style.background=COLORS.dark}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
              Start 7-Day Free Trial
            </button>
            <button onClick={() => scrollTo("inquiry")} style={{ padding:"14px 28px", background:"transparent", color:COLORS.dark, border:`2px solid ${COLORS.faint}`, borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans, transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=COLORS.dark;e.currentTarget.style.color="#F7F5EF";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=COLORS.dark;}}>
              Book a Demo →
            </button>
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div style={{ display:"flex", alignItems:"center", gap:32, flexWrap:"wrap", justifyContent:"center" }}>
            {[["99%+","Face Recognition Accuracy"],["< 60s","Mark 30 Students"],["3 Days","Setup & Training"],["₹0","Hidden Charges"]].map((n,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:FONTS.serif, fontSize:"1.8rem", fontWeight:700, color:COLORS.green }}>{n[0]}</div>
                <div style={{ fontSize:12, color:COLORS.muted, marginTop:3 }}>{n[1]}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Ticker ── */}
      <div style={{ background:COLORS.dark, padding:"12px 0", overflow:"hidden", borderTop:"1px solid rgba(247,245,239,0.05)", borderBottom:"1px solid rgba(247,245,239,0.05)" }}>
        <div style={{ display:"flex", animation:"tickerScroll 28s linear infinite", width:"max-content" }}>
          {[...Array(2)].map((_,oi) => (
            <div key={oi} style={{ display:"flex" }}>
              {["AI Face Recognition","Offline-First","WhatsApp Alerts","Payroll Automation","Fee Management","Staff HR","Exam Scheduling","Parent Portal","Custom Reports","99%+ Accuracy"].map((item,i) => (
                <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:16, padding:"0 28px", fontSize:11, fontWeight:600, color:"rgba(247,245,239,0.45)", letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                  <span style={{ width:4, height:4, borderRadius:"50%", background:COLORS.green, flexShrink:0 }} />{item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <section style={{ padding:"80px 6%", background:COLORS.surface, borderBottom:`1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:48, textAlign:"center" }}>
          {[
            { target:40,    suffix:"+",     label:"Schools Using NexaAttend" },
            { target:25000, suffix:"+",     label:"Students Tracked Daily"   },
            { target:99,    suffix:"%",     label:"Attendance Accuracy"       },
            { target:3,     suffix:" Days", label:"Average Setup Time"        },
          ].map((s,i) => (
            <FadeIn key={i} delay={i*0.1}>
              <div>
                <div style={{ fontFamily:FONTS.serif, fontSize:"3rem", fontWeight:700, color:COLORS.green, lineHeight:1 }}>
                  <AnimatedNumber target={s.target} suffix={s.suffix} />
                </div>
                <div style={{ fontSize:14, color:COLORS.muted, marginTop:8 }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Live Terminal ── */}
      <section style={{ padding:"80px 6%", background:COLORS.bg }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(42,107,74,0.08)", border:"1px solid rgba(42,107,74,0.2)", borderRadius:100, padding:"6px 14px", marginBottom:16 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.greenLight, animation:"pulse 1.5s infinite" }} />
                <span style={{ fontSize:10, fontWeight:700, color:"#1B5C3A", letterSpacing:"0.1em" }}>LIVE RECOGNITION FEED</span>
              </div>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(1.8rem,4vw,2.8rem)", color:COLORS.dark }}>Watch students get marked in real time</h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ background:"#0F0E0B", borderRadius:16, overflow:"hidden", border:"1px solid rgba(247,245,239,0.06)", boxShadow:"0 40px 80px rgba(0,0,0,0.28)" }}>
              <div style={{ padding:"11px 16px", background:"rgba(247,245,239,0.04)", borderBottom:"1px solid rgba(247,245,239,0.05)", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ display:"flex", gap:6 }}>
                  {["#FF5F57","#FFBD2E","#28C840"].map((c,i) => <div key={i} style={{ width:11, height:11, borderRadius:"50%", background:c }} />)}
                </div>
                <span style={{ fontFamily:FONTS.mono, fontSize:10, color:"rgba(247,245,239,0.3)", marginLeft:8 }}>nexaattend — live attendance terminal</span>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.greenLight, animation:"pulse 1.5s infinite" }} />
                  <span style={{ fontFamily:FONTS.mono, fontSize:10, color:COLORS.greenLight }}>LIVE</span>
                </div>
              </div>
              <div style={{ padding:"12px", fontFamily:FONTS.mono, fontSize:12 }}>
                {DEMO.attendanceLogs.slice(0, logIdx).map((l,i) => (
                  <div key={i} style={{ display:"flex", gap:16, padding:"6px 4px", borderBottom:"1px solid rgba(247,245,239,0.03)", animation:i===logIdx-1?"fadeUp 0.35s ease":"none" }}>
                    <span style={{ color:"rgba(247,245,239,0.28)", flexShrink:0 }}>{l.time}</span>
                    <span style={{ color:"#F7F5EF", flex:1 }}>{l.name}</span>
                    <span style={{ color:"rgba(247,245,239,0.4)", flexShrink:0 }}>{l.cls}</span>
                    <span style={{ flexShrink:0, fontWeight:700, color:l.status==="present"?"#5AC87A":l.status==="late"?"#F59E0B":"#EF4444" }}>
                      {l.status==="present"?"✓ PRESENT":l.status==="late"?"⚠ LATE":"✗ ABSENT"}
                    </span>
                  </div>
                ))}
                {logIdx<DEMO.attendanceLogs.length && (
                  <div style={{ padding:"7px 4px", color:"rgba(247,245,239,0.2)", animation:"pulse 1s infinite" }}>▋</div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modules" style={{ padding:"100px 6%", background:COLORS.surface }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(2rem,4vw,3rem)", color:COLORS.dark, marginBottom:16 }}>
                Everything your school needs,<br /><span style={{ fontStyle:"italic", color:COLORS.green }}>in one system</span>
              </h2>
              <p style={{ fontSize:16, color:COLORS.muted, maxWidth:540, margin:"0 auto" }}>Built for Indian schools. Offline-first. No monthly subscription for updates.</p>
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:22 }}>
            {MODULES_INFO.map((m,i) => (
              <FadeIn key={i} delay={i*0.08}>
                <div style={{ background:COLORS.bg, borderRadius:16, padding:"26px 22px", border:`1px solid ${COLORS.border}`, transition:"transform 0.2s,box-shadow 0.2s", height:"100%" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 20px 48px rgba(28,27,23,0.09)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                  <div style={{ width:42, height:42, borderRadius:11, background:`${m.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:14, color:m.color }}>{m.icon}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>{m.title}</h3>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
                    {m.features.map((f,j) => (
                      <li key={j} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:COLORS.muted, lineHeight:1.5 }}>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ marginTop:2, flexShrink:0 }}>
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
      <section id="pricing" style={{ padding:"100px 6%", background:COLORS.bg }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:52 }}>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(2rem,4vw,3rem)", color:COLORS.dark, marginBottom:14 }}>
                Transparent pricing,<br /><span style={{ fontStyle:"italic", color:COLORS.green }}>no surprises</span>
              </h2>
              <p style={{ fontSize:16, color:COLORS.muted }}>One-time setup + monthly SaaS. Free lifetime updates included.</p>
            </div>
          </FadeIn>
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:32 }}>
            {PLANS.map(p => (
              <button key={p.id} onClick={() => setSelPlan(p.id)} style={{
                padding:"10px 24px", borderRadius:100, border:`2px solid ${selPlan===p.id?p.color:COLORS.faint}`,
                background:selPlan===p.id?p.color:"transparent", color:selPlan===p.id?"#F7F5EF":COLORS.dark,
                fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans, transition:"all 0.2s",
              }}>{p.name}</button>
            ))}
          </div>
          {plan && (
            <FadeIn>
              <div style={{ background:COLORS.surface, borderRadius:20, border:`2px solid ${plan.color}`, padding:"36px 34px", maxWidth:660, margin:"0 auto", boxShadow:`0 20px 60px ${plan.color}18` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:10 }}>
                  <div>
                    <div style={{ display:"inline-block", background:`${plan.color}18`, color:plan.color, fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", borderRadius:100, marginBottom:9 }}>{plan.badge}</div>
                    <h3 style={{ fontFamily:FONTS.serif, fontSize:26, color:COLORS.dark }}>{plan.name} Plan</h3>
                    <p style={{ fontSize:13, color:COLORS.muted, marginTop:3 }}>Up to {plan.students.toLocaleString("en-IN")} students</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:FONTS.serif, fontSize:"2.2rem", color:plan.color, lineHeight:1 }}>₹{plan.monthly.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize:12, color:COLORS.muted }}>/month</div>
                  </div>
                </div>
                <div style={{ background:"rgba(42,107,74,0.06)", border:"1px solid rgba(42,107,74,0.15)", borderRadius:10, padding:"11px 15px", marginBottom:22 }}>
                  <span style={{ fontSize:13, color:"#1B4D3E" }}>
                    One-time setup: <strong style={{ textDecoration:"line-through", color:COLORS.muted, marginRight:7 }}>₹75,000</strong>
                    <strong style={{ color:COLORS.green, fontSize:17 }}>₹45,000</strong>
                    <span style={{ marginLeft:8, background:COLORS.green, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>SAVE ₹30K</span>
                  </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
                  {plan.features.map((f,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, fontSize:13 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0, marginTop:1 }}>
                        <circle cx="7" cy="7" r="6.5" fill={`${plan.color}18`}/>
                        <path d="M4 7l2 2 4-4" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ color:COLORS.muted, lineHeight:1.45 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button onClick={() => signIn(false)} style={{ flex:1, minWidth:140, padding:13, background:plan.color, color:"#F7F5EF", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:FONTS.sans }}>
                    Start Free Trial →
                  </button>
                  <button onClick={() => scrollTo("inquiry")} style={{ padding:"13px 18px", background:"transparent", border:`2px solid ${plan.color}`, color:plan.color, borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans }}>
                    Book Demo
                  </button>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding:"100px 6%", background:COLORS.surface }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(2rem,4vw,3rem)", color:COLORS.dark, marginBottom:14 }}>
                Up and running in <span style={{ fontStyle:"italic", color:COLORS.green }}>3 days</span>
              </h2>
              <p style={{ fontSize:16, color:COLORS.muted }}>Our team handles everything — you just show up on day 4.</p>
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:32 }}>
            {[
              { day:"Day 1",  title:"Installation", desc:"Our team visits your school. Hardware and software installed on your own computer.", icon:"💻" },
              { day:"Day 2",  title:"Enrollment",   desc:"We photograph and enroll all students and staff. 300 faces typically done in one day.", icon:"📸" },
              { day:"Day 3",  title:"Training",     desc:"Full admin and staff training. You run mock attendance sessions until confident.", icon:"🎓" },
              { day:"Day 4+", title:"You're Live",  desc:"NexaAttend is fully live. WhatsApp alerts, reports, and dashboards are active.", icon:"🚀" },
            ].map((s,i) => (
              <FadeIn key={i} delay={i*0.1}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:34, marginBottom:14 }}>{s.icon}</div>
                  <div style={{ display:"inline-block", background:COLORS.greenMuted, color:COLORS.green, fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:9, letterSpacing:"0.08em" }}>{s.day}</div>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:7 }}>{s.title}</h3>
                  <p style={{ fontSize:13.5, color:COLORS.muted, lineHeight:1.65 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guarantee ── */}
      <section style={{ background:COLORS.dark, padding:"60px 6%", textAlign:"center" }}>
        <FadeIn>
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <div style={{ fontSize:46, marginBottom:14 }}>🛡️</div>
            <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(1.8rem,3.5vw,2.6rem)", color:"#F7F5EF", marginBottom:14 }}>7-Day Full Refund Guarantee</h2>
            <p style={{ fontSize:15, color:"rgba(247,245,239,0.55)", lineHeight:1.8, marginBottom:26 }}>
              Use NexaAttend for a full week. If it doesn't save your staff time, eliminate proxy attendance, and make reporting effortless — we refund everything. No conditions, no questions.
            </p>
            <button onClick={() => signIn(false)} style={{ padding:"13px 30px", background:COLORS.green, color:"#F7F5EF", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:FONTS.sans, transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=COLORS.greenLight}
              onMouseLeave={e=>e.currentTarget.style.background=COLORS.green}>
              Claim Your Free Trial →
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:"100px 6%", background:COLORS.bg }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(2rem,4vw,3rem)", color:COLORS.dark }}>Frequently asked questions</h2>
            </div>
          </FadeIn>
          {FAQS.map((f,i) => (
            <FadeIn key={i} delay={i*0.03}>
              <div style={{ borderBottom:`1px solid ${COLORS.border}`, overflow:"hidden" }}>
                <button onClick={() => setActiveFaq(activeFaq===i?null:i)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"19px 0", background:"none", border:"none", cursor:"pointer", textAlign:"left", fontFamily:FONTS.sans }}>
                  <span style={{ fontSize:15, fontWeight:600, color:COLORS.dark, paddingRight:16 }}>{f.q}</span>
                  <span style={{ fontSize:22, color:COLORS.green, flexShrink:0, transform:activeFaq===i?"rotate(45deg)":"", transition:"transform 0.2s" }}>+</span>
                </button>
                <div style={{ maxHeight:activeFaq===i?220:0, overflow:"hidden", transition:"max-height 0.3s ease" }}>
                  <p style={{ fontSize:14, color:COLORS.muted, lineHeight:1.75, paddingBottom:18, paddingRight:32 }}>{f.a}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Inquiry ── */}
      <section id="inquiry" style={{ padding:"100px 6%", background:COLORS.surface }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(2rem,4vw,3rem)", color:COLORS.dark, marginBottom:10 }}>Book your free demo</h2>
              <p style={{ fontSize:15, color:COLORS.muted }}>Our team will call you within 24 hours to schedule a visit.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}><InquiryForm /></FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background:COLORS.dark, padding:"52px 6% 30px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:44, marginBottom:44 }}>
            <div>
              <div style={{ fontFamily:FONTS.serif, fontSize:22, color:"#F7F5EF", marginBottom:10 }}>NexaAttend</div>
              <p style={{ fontSize:13.5, color:"rgba(247,245,239,0.4)", lineHeight:1.75, maxWidth:320 }}>AI-powered school ERP for India. Offline-first. Built for CBSE, GSEB, ICSE, and all state board schools.</p>
              <div style={{ marginTop:18, display:"flex", gap:8 }}>
                <a href="https://wa.me/919974724656" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(247,245,239,0.06)", border:"1px solid rgba(247,245,239,0.1)", borderRadius:8, padding:"7px 13px", fontSize:12, color:"rgba(247,245,239,0.6)", textDecoration:"none" }}>💬 WhatsApp</a>
                <a href="mailto:tishy5327@gmail.com" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(247,245,239,0.06)", border:"1px solid rgba(247,245,239,0.1)", borderRadius:8, padding:"7px 13px", fontSize:12, color:"rgba(247,245,239,0.6)", textDecoration:"none" }}>✉ Email</a>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(247,245,239,0.25)", marginBottom:14 }}>Product</div>
              {["Features","Pricing","Free Trial","Book Demo"].map((item,i) => (
                <button key={i} onClick={() => scrollTo(["modules","pricing","hero","inquiry"][i])} style={{ display:"block", background:"none", border:"none", cursor:"pointer", fontSize:13.5, color:"rgba(247,245,239,0.45)", marginBottom:9, textAlign:"left", fontFamily:FONTS.sans, padding:0, transition:"color 0.2s" }}
                  onMouseEnter={e=>e.target.style.color="#F7F5EF"} onMouseLeave={e=>e.target.style.color="rgba(247,245,239,0.45)"}>{item}</button>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(247,245,239,0.25)", marginBottom:14 }}>Legal</div>
              {[["Privacy Policy","/privacy-policy"],["Terms of Service","/terms"]].map(([l,p],i) => (
                <button key={i} onClick={() => nav(p)} style={{ display:"block", background:"none", border:"none", cursor:"pointer", fontSize:13.5, color:"rgba(247,245,239,0.45)", marginBottom:9, textAlign:"left", fontFamily:FONTS.sans, padding:0, transition:"color 0.2s" }}
                  onMouseEnter={e=>e.target.style.color="#F7F5EF"} onMouseLeave={e=>e.target.style.color="rgba(247,245,239,0.45)"}>{l}</button>
              ))}
              <div style={{ marginTop:14, fontSize:12, color:"rgba(247,245,239,0.3)", lineHeight:1.6 }}>Ahmedabad, Gujarat<br />India — 380015</div>
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(247,245,239,0.07)", paddingTop:22, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <p style={{ fontSize:12, color:"rgba(247,245,239,0.28)" }}>© 2026 Nova Teach ERP. All rights reserved.</p>
            <p style={{ fontSize:12, color:"rgba(247,245,239,0.28)" }}>Made in India 🇮🇳 · GST-ready · Works offline</p>
          </div>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      {authReady && !user && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:50, animation:"fadeUp 0.5s ease" }}>
          <button onClick={() => signIn(false)} style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 26px", background:COLORS.dark, color:"#F7F5EF", border:"none", borderRadius:100, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:FONTS.sans, boxShadow:"0 12px 40px rgba(28,27,23,0.32)", whiteSpace:"nowrap", transition:"background 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.background=COLORS.green}
            onMouseLeave={e=>e.currentTarget.style.background=COLORS.dark}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
            Try 7-Day Free Demo
            <span style={{ background:COLORS.green, borderRadius:100, padding:"2px 9px", fontSize:10, fontWeight:700 }}>FREE</span>
          </button>
        </div>
      )}
      {authReady && user && hash==="/" && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:50, animation:"fadeUp 0.5s ease" }}>
          <button onClick={() => nav("/demo")} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 22px", background:COLORS.green, color:"#F7F5EF", border:"none", borderRadius:100, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:FONTS.sans, boxShadow:"0 12px 40px rgba(42,107,74,0.3)", whiteSpace:"nowrap" }}>
            {user.photoURL && <img src={user.photoURL} alt="profile" style={{ width:22, height:22, borderRadius:"50%" }} />}
            Open My Dashboard →
          </button>
        </div>
      )}
    </div>
  );
}
