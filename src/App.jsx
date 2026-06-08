/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           NexaAttend — Complete School ERP + LMS + Trial + RBAC · v8.0     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * v8.0 FIXES & ADDITIONS:
 *  ✅ Robust Firestore error handling with retry + offline detection
 *  ✅ Loading / Offline / Error / Retry states throughout
 *  ✅ Document existence validation before reading
 *  ✅ Detailed dev-mode error logging
 *  ✅ Role-Based Access Control (owner / admin / teacher)
 *  ✅ RoleGuard component for protected routes
 *  ✅ Role stored in Firestore, validated server-side
 *  ✅ Firestore security rules updated
 *  ✅ useRole() hook + RoleContext
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
  createContext, useContext,
} from "react";

import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged,
  signOut as firebaseSignOut, setPersistence, browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, addDoc, collection,
  serverTimestamp, Timestamp, enableIndexedDbPersistence,
} from "firebase/firestore";

// ==================== FIREBASE SETUP ====================
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

setPersistence(auth, browserLocalPersistence).catch(() => {});

// Enable offline persistence (with try/catch for multi-tab scenarios)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("[NexaAttend] Persistence disabled: multiple tabs open");
    } else if (err.code === "unimplemented") {
      console.warn("[NexaAttend] Persistence not supported on this browser");
    }
  });
} catch (e) { /* noop */ }

// ==================== DEV CONFIG ====================
const IS_DEV = process.env.NODE_ENV !== "production" || window.location.hostname === "localhost";
const logDev = (label, data) => {
  if (IS_DEV) console.log(`[NexaAttend:${label}]`, data);
};
const logErr = (label, err) => {
  if (IS_DEV) console.error(`[NexaAttend:${label}]`, err);
};

// ==================== CONSTANTS ====================
const C = {
  bg: "#F7F5EF", surface: "#FFFFFF", dark: "#1C1B17", green: "#2A6B4A",
  greenLight: "#5AC87A", greenMuted: "rgba(42,107,74,0.08)", navy: "#1A2B4A",
  purple: "#3D1A4A", amber: "#7A5000", red: "#7A1A1A",
  border: "rgba(28,27,23,0.08)", muted: "rgba(28,27,23,0.45)", faint: "rgba(28,27,23,0.15)",
};

const F = {
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'Instrument Sans', 'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const TRIAL_DAYS = 7;
const PLAN_TYPES = ["trial", "monthly", "yearly", "enterprise"];
const STATUS_TYPES = ["active", "expired", "suspended"];
const ROLES = {
  OWNER: "owner", ADMIN: "admin", TEACHER: "teacher",
};

const ROLE_PERMISSIONS = {
  owner: [
    "manage_subscription", "manage_billing", "manage_settings",
    "manage_students", "manage_staff", "manage_teachers", "manage_admins",
    "take_attendance", "create_exams", "grade_exams", "create_assignments",
    "view_reports", "export_reports", "manage_lms", "suspend_users",
    "view_audit_logs", "delete_organization",
  ],
  admin: [
    "manage_students", "manage_staff", "manage_teachers",
    "take_attendance", "create_exams", "grade_exams", "create_assignments",
    "view_reports", "export_reports", "manage_lms",
  ],
  teacher: [
    "view_students", "take_attendance", "create_exams", "grade_exams",
    "create_assignments", "view_lms",
  ],
};

const PLANS = [
  { id: "basic", name: "Basic", students: 300, monthly: 6000, setup: 75000, setupDiscounted: 45000, badge: "Best Value", color: C.navy,
    features: ["Up to 300 students", "AI face recognition", "2 cameras", "Student management", "WhatsApp alerts", "1 admin account", "Free updates"] },
  { id: "standard", name: "Standard", students: 600, monthly: 9000, setup: 75000, setupDiscounted: 45000, badge: "Most Popular", color: C.green,
    features: ["Up to 600 students", "AI face recognition", "2 cameras", "Student + Staff", "Advanced reports", "Payroll automation", "Multi-role admin", "Priority support"] },
  { id: "premium", name: "Premium", students: 999, monthly: 12000, setup: 75000, setupDiscounted: 45000, badge: "Best for Large", color: C.purple,
    features: ["Up to 999 students", "AI face recognition", "2 cameras", "Complete ERP", "Custom reports", "Payroll automation", "Unlimited admins", "Dedicated manager"] },
];

const NAV_TABS = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "attendance", label: "Attendance", icon: "◈" },
  { id: "students", label: "Students", icon: "◇" },
  { id: "staff", label: "Staff & HR", icon: "▣" },
  { id: "leave", label: "Leave", icon: "◆" },
  { id: "payroll", label: "Payroll", icon: "◎" },
  { id: "fees", label: "Fees", icon: "◐" },
  { id: "exams", label: "Exams", icon: "◑" },
  { id: "assignments", label: "Assignments", icon: "◒" },
  { id: "lms", label: "LMS", icon: "▤" },
  { id: "parents", label: "Parent Portal", icon: "◓" },
  { id: "notifications", label: "Notifications", icon: "◔" },
  { id: "reports", label: "Reports", icon: "◕" },
  { id: "team", label: "Team & Roles", icon: "◐", ownerOnly: true },
  { id: "billing", label: "Billing", icon: "◑", ownerOnly: true },
];

const LMS_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "▤" },
  { id: "courses", label: "All Courses", icon: "▦" },
  { id: "learning", label: "My Learning", icon: "◧" },
  { id: "quizzes", label: "Quizzes", icon: "◨" },
  { id: "live", label: "Live Classes", icon: "◩" },
  { id: "library", label: "Library", icon: "◪" },
  { id: "gradebook", label: "Gradebook", icon: "▬" },
];

const LMS_SUBJECTS = [
  { id: "all", label: "All Subjects", color: C.dark },
  { id: "mathematics", label: "Mathematics", color: C.navy },
  { id: "science", label: "Science", color: C.green },
  { id: "english", label: "English", color: C.purple },
  { id: "hindi", label: "Hindi", color: C.amber },
  { id: "social", label: "Social Studies", color: "#4A2B0A" },
  { id: "computer", label: "Computer Sci.", color: "#1A4A4A" },
  { id: "physics", label: "Physics", color: "#1A2B5A" },
];

const LMS_LEVELS = [
  { id: "all", label: "All Levels" },
  { id: "IX", label: "Class IX" },
  { id: "X", label: "Class X" },
  { id: "XI", label: "Class XI" },
  { id: "XII", label: "Class XII" },
];

const MODULES_INFO = [
  { icon: "◉", title: "Smart Attendance", features: ["AI face recognition", "Works offline", "30 students in 60s", "No proxy"], color: C.green },
  { icon: "◈", title: "Student Management", features: ["Full profiles", "Class management", "Fee tracking", "Parent hub"], color: C.navy },
  { icon: "◇", title: "Staff & HR", features: ["Staff attendance", "Auto payroll", "Leave mgmt", "Departments"], color: C.purple },
  { icon: "▣", title: "Reports & Analytics", features: ["Daily/weekly reports", "Trends", "Fee reports", "Live dashboard"], color: "#4A2B0A" },
];

// ==================== DEMO DATA ====================
const DEMO = {
  students: [
    { id: "S001", name: "Arjun Mehta", class: "X-A", rollNo: 24, phone: "9876543210", parent: "Suresh Mehta", status: "Active", attendance: 97, fees: "Paid", dob: "2009-03-12", address: "Satellite, Ahmedabad" },
    { id: "S002", name: "Priya Sharma", class: "X-A", rollNo: 15, phone: "9876543211", parent: "Kiran Sharma", status: "Active", attendance: 95, fees: "Paid", dob: "2009-07-22", address: "Bopal, Ahmedabad" },
    { id: "S003", name: "Rohan Patel", class: "IX-B", rollNo: 8, phone: "9876543212", parent: "Nitin Patel", status: "Active", attendance: 89, fees: "Due", dob: "2010-01-05", address: "Gota, Ahmedabad" },
    { id: "S004", name: "Sneha Verma", class: "X-A", rollNo: 31, phone: "9876543213", parent: "Anil Verma", status: "Active", attendance: 92, fees: "Paid", dob: "2009-11-18", address: "Navrangpura, Ahmedabad" },
    { id: "S005", name: "Dev Agarwal", class: "XI-C", rollNo: 7, phone: "9876543214", parent: "Raj Agarwal", status: "Active", attendance: 98, fees: "Paid", dob: "2008-05-30", address: "Prahlad Nagar, Ahmedabad" },
    { id: "S006", name: "Kavya Joshi", class: "IX-B", rollNo: 19, phone: "9876543215", parent: "Meena Joshi", status: "Active", attendance: 93, fees: "Partial", dob: "2010-09-14", address: "Thaltej, Ahmedabad" },
    { id: "S007", name: "Ishaan Nair", class: "XII-A", rollNo: 3, phone: "9876543216", parent: "Ramesh Nair", status: "Active", attendance: 85, fees: "Paid", dob: "2007-12-28", address: "Vastrapur, Ahmedabad" },
    { id: "S008", name: "Ananya Singh", class: "XI-C", rollNo: 22, phone: "9876543217", parent: "Poonam Singh", status: "Active", attendance: 91, fees: "Due", dob: "2008-08-03", address: "Bodakdev, Ahmedabad" },
  ],
  staff: [
    { id: "T001", name: "Mrs. Deepa Rao", role: "Principal", dept: "Administration", phone: "9900001111", salary: 75000, attendance: 98, join: "2015-06-01", status: "Active" },
    { id: "T002", name: "Mr. Amit Kulkarni", role: "Mathematics HOD", dept: "Mathematics", phone: "9900002222", salary: 55000, attendance: 96, join: "2017-04-15", status: "Active" },
    { id: "T003", name: "Ms. Ritu Bansal", role: "Science Teacher", dept: "Science", phone: "9900003333", salary: 48000, attendance: 94, join: "2019-07-01", status: "Active" },
    { id: "T004", name: "Mr. Sanjay Pillai", role: "English Teacher", dept: "Languages", phone: "9900004444", salary: 46000, attendance: 97, join: "2018-03-20", status: "Active" },
    { id: "T005", name: "Ms. Pooja Dubey", role: "Hindi Teacher", dept: "Languages", phone: "9900005555", salary: 44000, attendance: 92, join: "2020-06-10", status: "Active" },
    { id: "T006", name: "Mr. Kiran Mehta", role: "PT Teacher", dept: "Sports", phone: "9900006666", salary: 40000, attendance: 99, join: "2016-08-01", status: "Active" },
  ],
  teamMembers: [
    { id: "M001", name: "Mrs. Deepa Rao", email: "deepa.principal@school.in", role: "admin", status: "Active", joined: "2026-01-15" },
    { id: "M002", name: "Mr. Amit Kulkarni", email: "amit.k@school.in", role: "teacher", status: "Active", joined: "2026-02-01" },
    { id: "M003", name: "Ms. Ritu Bansal", email: "ritu.b@school.in", role: "teacher", status: "Active", joined: "2026-02-10" },
  ],
  billing: {
    plan: "trial", status: "active", daysLeft: 5,
    nextBilling: "—", amount: "₹0", trialEndDate: "2026-06-10",
    paymentMethod: null, invoices: [
      { id: "INV-001", date: "2026-01-15", amount: "₹45,000", status: "Paid", description: "Setup Fee" },
    ],
  },
  leaveRequests: [
    { id: "L001", name: "Ms. Ritu Bansal", type: "Medical", from: "2026-06-08", to: "2026-06-10", days: 3, reason: "Fever and flu", status: "Pending" },
    { id: "L002", name: "Mr. Sanjay Pillai", type: "Personal", from: "2026-06-12", to: "2026-06-12", days: 1, reason: "Family function", status: "Approved" },
    { id: "L003", name: "Ms. Pooja Dubey", type: "Casual", from: "2026-06-15", to: "2026-06-16", days: 2, reason: "Personal emergency", status: "Pending" },
  ],
  payroll: [
    { id: "T001", name: "Mrs. Deepa Rao", salary: 75000, present: 26, absent: 0, lop: 0, deductions: 2250, net: 72750, status: "Processed" },
    { id: "T002", name: "Mr. Amit Kulkarni", salary: 55000, present: 25, absent: 1, lop: 2117, deductions: 1650, net: 51233, status: "Processed" },
    { id: "T003", name: "Ms. Ritu Bansal", salary: 48000, present: 24, absent: 2, lop: 3840, deductions: 1440, net: 42720, status: "Pending" },
    { id: "T004", name: "Mr. Sanjay Pillai", salary: 46000, present: 26, absent: 0, lop: 0, deductions: 1380, net: 44620, status: "Processed" },
  ],
  fees: [
    { id: "S001", name: "Arjun Mehta", class: "X-A", annual: 45000, paid: 45000, due: 0, last: "2026-04-05", status: "Paid" },
    { id: "S002", name: "Priya Sharma", class: "X-A", annual: 45000, paid: 45000, due: 0, last: "2026-04-10", status: "Paid" },
    { id: "S003", name: "Rohan Patel", class: "IX-B", annual: 42000, paid: 21000, due: 21000, last: "2026-01-20", status: "Due" },
    { id: "S005", name: "Dev Agarwal", class: "XI-C", annual: 48000, paid: 48000, due: 0, last: "2026-03-15", status: "Paid" },
    { id: "S008", name: "Ananya Singh", class: "XI-C", annual: 48000, paid: 0, due: 48000, last: "—", status: "Due" },
  ],
  exams: [
    { id: "E001", name: "Unit Test I", date: "June 20–22, 2026", classes: "All", subjects: 5, status: "Upcoming", maxMarks: 25 },
    { id: "E002", name: "Mid-Term Exam", date: "July 15–25, 2026", classes: "IX–XII", subjects: 6, status: "Scheduled", maxMarks: 80 },
  ],
  assignments: [
    { id: "A001", title: "Maths – Algebra Ch.3", class: "X-A", due: "June 5, 2026", submitted: 42, total: 45, subject: "Mathematics", teacher: "Mr. Amit Kulkarni" },
    { id: "A002", title: "Science – Light & Optics", class: "IX-B", due: "June 7, 2026", submitted: 38, total: 42, subject: "Science", teacher: "Ms. Ritu Bansal" },
  ],
  notifications: [
    { id: "N001", title: "Attendance Alert", message: "8 students were absent today.", type: "alert", time: "8:10 AM", read: false },
    { id: "N002", title: "Fee Reminder Sent", message: "Reminders sent to 3 parents.", type: "info", time: "9:00 AM", read: false },
  ],
  todayAttendance: { present: 284, late: 12, absent: 8, total: 304 },
  weeklyTrend: [
    { day: "Mon", pct: 96 }, { day: "Tue", pct: 94 }, { day: "Wed", pct: 97 },
    { day: "Thu", pct: 93 }, { day: "Fri", pct: 96 },
  ],
  recentActivity: [
    { icon: "✓", text: "X-A attendance marked (98% present)", time: "8:02 AM" },
    { icon: "📝", text: "42 students submitted Algebra assignment", time: "9:15 AM" },
  ],
};

const DEMO_LMS = {
  courses: [
    { id: "C001", code: "MATH-X", title: "Mathematics – Class X", subtitle: "CBSE · Algebra, Geometry & Trigonometry", subject: "mathematics", subjectLabel: "Mathematics", grade: "X",
      teacher: "Mr. Amit Kulkarni", description: "Master Class X mathematics.", thumbnail: "📐", color: C.navy,
      cover: `linear-gradient(135deg, ${C.navy} 0%, #3A5A8A 100%)`,
      duration: "40 hours", modules: 6, lessons: 48, enrolled: 45, capacity: 50, rating: 4.8, reviews: 124,
      progress: 68, lastAccessed: "2 hours ago", nextLesson: "Quadratic Equations", enrolled2: true,
      syllabus: [
        { id: "M1", title: "Algebra Foundations", lessons: 8, duration: "8h", completed: 8 },
        { id: "M2", title: "Quadratic Equations", lessons: 6, duration: "6h", completed: 4 },
      ] },
    { id: "C002", code: "SCI-X", title: "Science – Class X", subtitle: "CBSE", subject: "science", subjectLabel: "Science", grade: "X",
      teacher: "Ms. Ritu Bansal", description: "Explore science.", thumbnail: "🔬", color: C.green,
      cover: `linear-gradient(135deg, ${C.green} 0%, ${C.greenLight} 100%)`,
      duration: "45 hours", modules: 7, lessons: 54, enrolled: 42, capacity: 50, rating: 4.7, reviews: 98,
      progress: 0, lastAccessed: "Never", nextLesson: null, enrolled2: false,
      syllabus: [{ id: "M1", title: "Chemical Reactions", lessons: 8, duration: "8h", completed: 0 }] },
  ],
  quizzes: [
    { id: "Q001", courseId: "C001", title: "Algebra – Linear Equations", description: "Test your knowledge.", duration: 20, totalMarks: 20, questions: 5, difficulty: "Easy", status: "available", lastScore: null, bestScore: null,
      questionsData: [
        { q: "What is a linear equation?", options: ["Degree 1", "Degree 2", "Degree 3", "No solution"], correct: 0 },
        { q: "Standard form:", options: ["ax+by+c=0", "ax²+bx+c=0", "ax+by=c", "a/x+b/y=1"], correct: 0 },
        { q: "Solutions of linear eq:", options: ["One", "Two", "Infinitely many", "None"], correct: 2 },
      ] },
  ],
  liveClasses: [
    { id: "LC001", title: "Doubt Session: Quadratic Equations", teacher: "Mr. Amit Kulkarni", scheduledAt: "2026-06-04T10:00:00", duration: 60, status: "upcoming", description: "Live doubt-clearing." },
    { id: "LC002", title: "Live Problem Solving: EMI", teacher: "Ms. Ritu Bansal", scheduledAt: "2026-06-03T15:00:00", duration: 90, status: "live", description: "Solving 20+ numericals." },
  ],
  library: [
    { id: "LB001", title: "NCERT Mathematics – Class X", type: "pdf", subject: "Mathematics", grade: "X", size: "12.4 MB", cover: "📕", description: "Official NCERT textbook." },
    { id: "LB002", title: "Physics Formula Sheet", type: "pdf", subject: "Physics", grade: "XII", size: "2.1 MB", cover: "📐", description: "Formula reference." },
  ],
  gradebook: [
    { subject: "Mathematics", overall: 88.3, grade: "A" },
    { subject: "Science", overall: 85.7, grade: "A" },
    { subject: "English", overall: 80.0, grade: "B+" },
  ],
};

const FAQS = [
  { q: "What is School ERP Software?", a: "School ERP integrates all school operations into one system." },
  { q: "How does attendance management work?", a: "AI face recognition marks 30 students in under 60 seconds." },
  { q: "How does fee management work?", a: "Track collections and send automated WhatsApp reminders." },
  { q: "Does it work without internet?", a: "Yes — NexaAttend is offline-first." },
  { q: "How long does setup take?", a: "Our team completes installation in 3 days." },
  { q: "What is the 7-day guarantee?", a: "Full refund if not satisfied within 7 days." },
  { q: "What happens to student data?", a: "Data never leaves your premises." },
  { q: "What cameras does it require?", a: "Every plan includes 2 cameras." },
];

// ==================== UTILITIES ====================
const initials = (n = "") => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const fmtINR = (n) => !n && n !== 0 ? "—" : n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (d) => !d ? "—" : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const statusColor = (s) => ({ present: "#1B5C3A", Paid: "#1B5C3A", Approved: "#1B5C3A", Processed: "#1B5C3A", Active: "#1B5C3A", success: "#1B5C3A", live: "#1B5C3A", completed: "#1B5C3A", available: C.navy, Easy: C.green, Medium: C.amber, Hard: C.red, late: C.amber, Partial: C.amber, warning: C.amber, Upcoming: C.navy, Scheduled: "rgba(28,27,23,0.5)", info: C.navy, absent: C.red, Due: C.red, Pending: C.red, alert: C.red, locked: "rgba(28,27,23,0.5)" }[s] || "rgba(28,27,23,0.5)");
const statusBg = (s) => ({ present: "rgba(42,107,74,0.1)", Paid: "rgba(42,107,74,0.1)", Approved: "rgba(42,107,74,0.1)", Processed: "rgba(42,107,74,0.1)", Active: "rgba(42,107,74,0.1)", success: "rgba(42,107,74,0.1)", live: "rgba(90,200,122,0.15)", completed: "rgba(42,107,74,0.08)", available: "rgba(26,43,74,0.08)", Easy: "rgba(42,107,74,0.1)", Medium: "rgba(122,80,0,0.1)", Hard: "rgba(239,68,68,0.1)", late: "rgba(122,80,0,0.1)", Partial: "rgba(122,80,0,0.1)", warning: "rgba(122,80,0,0.1)", Upcoming: "rgba(26,43,74,0.1)", Scheduled: "rgba(28,27,23,0.06)", info: "rgba(26,43,74,0.08)", absent: "rgba(239,68,68,0.1)", Due: "rgba(239,68,68,0.1)", Pending: "rgba(245,158,11,0.12)", alert: "rgba(239,68,68,0.1)", locked: "rgba(28,27,23,0.06)" }[s] || "rgba(28,27,23,0.06)");

// ==================== FIRESTORE ERROR HANDLER ====================
function isOfflineError(err) {
  if (!err) return false;
  const code = err.code || "";
  const msg = (err.message || "").toLowerCase();
  return (
    code === "unavailable" ||
    code === "internal-error" ||
    msg.includes("offline") ||
    msg.includes("failed to get document") ||
    msg.includes("network") ||
    !navigator.onLine
  );
}

function parseFirestoreError(err) {
  if (!err) return { code: "unknown", message: "Unknown error", isOffline: false, isPermission: false };
  const code = err.code || "unknown";
  const message = err.message || "An error occurred";
  return {
    code,
    message,
    isOffline: isOfflineError(err),
    isPermission: code === "permission-denied" || code === "unauthenticated",
    isNotFound: code === "not-found",
  };
}

// Retry wrapper for Firestore calls
async function withRetry(fn, maxRetries = 3) {
  let lastErr;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const parsed = parseFirestoreError(err);
      logErr("retry", { attempt: i + 1, code: parsed.code, message: parsed.message });
      if (parsed.isOffline) throw err;
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 500));
      }
    }
  }
  throw lastErr;
}

// ==================== TRIAL & ORG BUSINESS LOGIC ====================
function computeTrialEndDate(startDate = new Date()) {
  const end = new Date(startDate);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return Timestamp.fromDate(end);
}

function isTrialActive(organization, serverNow = new Date()) {
  if (!organization) return false;
  if (organization.status === "suspended" || organization.status === "expired") return false;
  if (!PLAN_TYPES.includes(organization.plan)) return false;
  if (organization.plan === "trial") {
    if (!organization.trialEndDate) return false;
    const endDate = organization.trialEndDate.toDate
      ? organization.trialEndDate.toDate()
      : new Date(organization.trialEndDate);
    return serverNow < endDate && organization.status === "active";
  }
  return organization.status === "active";
}

function getDaysRemaining(organization, serverNow = new Date()) {
  if (!organization?.trialEndDate) return 0;
  const endDate = organization.trialEndDate.toDate
    ? organization.trialEndDate.toDate()
    : new Date(organization.trialEndDate);
  const ms = endDate.getTime() - serverNow.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

async function ensureOrganization(user) {
  if (!user?.uid) throw new Error("No user");
  const orgRef = doc(db, "organizations", user.uid);
  try {
    const orgSnap = await withRetry(() => getDoc(orgRef));
    if (orgSnap.exists()) {
      logDev("ensureOrg", "existing");
      return { id: orgSnap.id, ...orgSnap.data(), _exists: true };
    }
    logDev("ensureOrg", "creating new");
    const trialEnd = computeTrialEndDate();
    const newOrg = {
      role: ROLES.OWNER,
      plan: "trial",
      status: "active",
      trialStartDate: serverTimestamp(),
      trialEndDate: trialEnd,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerUid: user.uid,
      ownerEmail: user.email,
      ownerName: user.displayName || "",
      subscription: {
        plan: "trial",
        status: "active",
        trialEndDate: trialEnd,
        seats: 1,
      },
    };
    await withRetry(() => setDoc(orgRef, newOrg));
    const fresh = await withRetry(() => getDoc(orgRef));
    return { id: fresh.id, ...fresh.data(), _exists: true };
  } catch (err) {
    logErr("ensureOrg", err);
    throw err;
  }
}

async function refreshOrganization(uid) {
  if (!uid) return null;
  const orgRef = doc(db, "organizations", uid);
  try {
    const orgSnap = await withRetry(() => getDoc(orgRef));
    if (!orgSnap.exists()) {
      logDev("refreshOrg", "not found");
      return null;
    }
    return { id: orgSnap.id, ...orgSnap.data() };
  } catch (err) {
    logErr("refreshOrg", err);
    throw err;
  }
}

async function fetchMemberRole(orgId, userUid) {
  if (!orgId || !userUid) return null;
  try {
    const memberRef = doc(db, "organizations", orgId, "members", userUid);
    const memberSnap = await withRetry(() => getDoc(memberRef));
    if (!memberSnap.exists()) return null;
    return { id: memberSnap.id, ...memberSnap.data() };
  } catch (err) {
    logErr("fetchMemberRole", err);
    return null;
  }
}

function hasPermission(role, permission) {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

// ==================== CONTEXTS ====================
const TrialContext = createContext(null);
const RoleContext = createContext(null);

function TrialProvider({ children, user }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    const onOnline = () => { setIsOffline(false); if (user) refresh(); };
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [user]);

  const load = useCallback(async () => {
    if (!user?.uid) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const org = await ensureOrganization(user);
      setOrganization(org);
    } catch (err) {
      const parsed = parseFirestoreError(err);
      logErr("trialLoad", parsed);
      if (parsed.isOffline) setError({ type: "offline", message: "You are offline. Reconnect to continue." });
      else if (parsed.isPermission) setError({ type: "permission", message: "You don't have permission to access this." });
      else setError({ type: "unknown", message: parsed.message });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const org = await refreshOrganization(user.uid);
      if (org) setOrganization(org);
    } catch (err) {
      logErr("trialRefresh", err);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user?.uid) return;
    refreshTimerRef.current = setInterval(() => {
      if (navigator.onLine) refresh();
    }, 60000);
    return () => clearInterval(refreshTimerRef.current);
  }, [user, refresh]);

  const isActive = useMemo(() => isTrialActive(organization), [organization]);
  const daysLeft = useMemo(() => getDaysRemaining(organization), [organization]);
  const isExpired = useMemo(() => organization && !isActive, [organization, isActive]);

  const value = useMemo(() => ({
    organization, loading, error, isActive, isExpired, daysLeft, isOffline, refresh,
  }), [organization, loading, error, isActive, isExpired, daysLeft, isOffline, refresh]);

  return <TrialContext.Provider value={value}>{children}</TrialContext.Provider>;
}

function useTrial() {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error("useTrial must be used within TrialProvider");
  return ctx;
}

function RoleProvider({ children, user, organization }) {
  const [role, setRole] = useState(ROLES.OWNER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !organization) {
      setRole(null);
      setLoading(false);
      return;
    }
    const determineRole = async () => {
      setLoading(true);
      setError(null);
      try {
        // Owner is the Firebase Auth user whose UID matches the org document ID
        if (organization.ownerUid === user.uid) {
          setRole(ROLES.OWNER);
        } else {
          // Check members subcollection
          const member = await fetchMemberRole(organization.id, user.uid);
          setRole(member?.role || ROLES.TEACHER);
        }
      } catch (err) {
        logErr("roleLoad", err);
        setError(parseFirestoreError(err).message);
        setRole(ROLES.TEACHER);
      } finally {
        setLoading(false);
      }
    };
    determineRole();
  }, [user, organization]);

  const permissions = useMemo(() => ROLE_PERMISSIONS[role] || [], [role]);
  const can = useCallback((perm) => hasPermission(role, perm), [role]);

  const value = useMemo(() => ({ role, permissions, can, loading, error, isOwner: role === ROLES.OWNER, isAdmin: role === ROLES.ADMIN, isTeacher: role === ROLES.TEACHER }), [role, permissions, can, loading, error]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

// ==================== UI COMPONENTS ====================
const FadeIn = memo(({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`, ...style }}>{children}</div>;
});

const Badge = memo(({ status, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: statusBg(status || children), color: statusColor(status || children) }}>{children}</span>
));

const Avatar = memo(({ name, size = 36, color = C.green }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}22`, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, fontFamily: F.sans, flexShrink: 0, border: `1.5px solid ${color}30` }}>{initials(name)}</div>
));

const StatCard = memo(({ label, value, sub, color = C.green, accent }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px", borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1, fontFamily: F.serif }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
    {accent && <div style={{ fontSize: 12, color: C.green, marginTop: 4, fontWeight: 600 }}>{accent}</div>}
  </div>
));

const ProgressBar = memo(({ value, max = 100, color = C.green, height = 6 }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return <div style={{ height, background: "rgba(28,27,23,0.06)", borderRadius: height }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: height, transition: "width 0.8s ease" }} /></div>;
});

const SectionHeader = memo(({ title, subtitle, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: F.serif }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
));

const SearchBar = memo(({ value, onChange, placeholder = "Search…" }) => (
  <div style={{ position: "relative" }}>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "9px 12px 9px 34px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, background: C.bg, color: C.dark, fontFamily: F.sans, outline: "none", boxSizing: "border-box" }} />
    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }}>🔍</span>
  </div>
));

const Btn = memo(({ children, onClick, variant = "primary", size = "md", disabled = false, style: extra = {} }) => {
  const [h, sH] = useState(false);
  const base = { display: "inline-flex", alignItems: "center", gap: 6, fontFamily: F.sans, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", borderRadius: 8, transition: "all 0.18s", outline: "none", opacity: disabled ? 0.55 : 1, padding: size === "sm" ? "7px 14px" : size === "lg" ? "13px 26px" : "10px 18px", fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 13, ...extra };
  const v = { primary: { background: h ? C.green : C.dark, color: "#F7F5EF" }, green: { background: h ? "#1B5C3A" : C.green, color: "#F7F5EF" }, outline: { background: "transparent", color: C.dark, border: `1.5px solid ${C.faint}` }, danger: { background: h ? "#9B1C1C" : C.red, color: "#F7F5EF" }, ghost: { background: h ? "rgba(28,27,23,0.06)" : "transparent", color: C.dark } };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v[variant] }} onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)} disabled={disabled}>{children}</button>;
});

const EmptyState = memo(({ icon = "◎", title, subtitle }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: C.muted }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: C.dark, marginBottom: 6 }}>{title}</div>
    {subtitle && <div style={{ fontSize: 13, lineHeight: 1.6 }}>{subtitle}</div>}
  </div>
));

const Spinner = memo(() => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}><div style={{ width: 32, height: 32, border: `3px solid ${C.greenMuted}`, borderTop: `3px solid ${C.green}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /></div>);

const AuthLoadingScreen = memo(({ message = "Loading…" }) => (
  <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
    <div style={{ width: 44, height: 44, border: `3px solid rgba(42,107,74,0.2)`, borderTop: `3px solid ${C.green}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <p style={{ fontFamily: F.sans, color: C.muted, fontSize: 13 }}>{message}</p>
  </div>
));

// ==================== OFFLINE / ERROR SCREENS ====================
const OfflineScreen = memo(({ onRetry }) => (
  <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ maxWidth: 440, background: C.surface, borderRadius: 16, padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>📡</div>
      <h2 style={{ fontFamily: F.serif, fontSize: 24, marginBottom: 10, color: C.dark }}>You're offline</h2>
      <p style={{ color: C.muted, marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>We can't reach NexaAttend servers right now. Check your internet connection and try again.</p>
      <Btn variant="green" onClick={onRetry} style={{ justifyContent: "center", minWidth: 140 }}>🔄 Retry</Btn>
    </div>
  </div>
));

const ErrorScreen = memo(({ error, onRetry }) => (
  <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ maxWidth: 440, background: C.surface, borderRadius: 16, padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ fontFamily: F.serif, fontSize: 22, marginBottom: 10, color: C.dark }}>Connection issue</h2>
      <p style={{ color: C.muted, marginBottom: 8, fontSize: 14 }}>{error?.message || "Something went wrong"}</p>
      {IS_DEV && error?.code && <p style={{ fontSize: 11, color: C.muted, fontFamily: F.mono, marginBottom: 20 }}>Code: {error.code}</p>}
      <Btn variant="green" onClick={onRetry} style={{ justifyContent: "center", minWidth: 140 }}>🔄 Retry</Btn>
    </div>
  </div>
));

// ==================== EXPIRED TRIAL PAGE ====================
const ExpiredTrialPage = memo(({ organization, onLogout }) => (
  <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.dark} 0%, #2A2620 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: F.sans }}>
    <div style={{ maxWidth: 540, width: "100%", background: C.surface, borderRadius: 20, padding: "48px 40px", textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>⏰</div>
      <div style={{ display: "inline-block", background: "rgba(122,26,26,0.1)", color: C.red, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100, marginBottom: 16 }}>Trial Expired</div>
      <h1 style={{ fontFamily: F.serif, fontSize: "2rem", color: C.dark, marginBottom: 14 }}>Your 7-Day Free Trial Has Expired</h1>
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>Your trial period has ended. Upgrade your plan to continue using NexaAttend.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => window.open("https://wa.me/919974724656?text=I want to upgrade my NexaAttend plan", "_blank")} style={{ padding: "14px 22px", background: C.green, color: "#F7F5EF", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>⬆ Upgrade Plan</button>
        <button onClick={() => window.open("https://wa.me/919974724656", "_blank")} style={{ padding: "14px 22px", background: "transparent", color: C.dark, border: `1.5px solid ${C.faint}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>💬 Contact Support</button>
        <button onClick={onLogout} style={{ padding: "12px 22px", background: "transparent", color: C.muted, border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>↩ Logout</button>
      </div>
    </div>
  </div>
));

// ==================== TRIAL GUARD ====================
const TrialGuard = memo(({ children }) => {
  const { loading, isActive, isExpired, organization, error, isOffline, refresh } = useTrial();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);
  const liveCheck = useMemo(() => organization ? isTrialActive(organization, new Date(now)) : true, [organization, now]);
  if (loading) return <AuthLoadingScreen message="Verifying your subscription…" />;
  if (isOffline) return <OfflineScreen onRetry={refresh} />;
  if (error?.type === "unknown") return <ErrorScreen error={error} onRetry={refresh} />;
  if (!liveCheck || isExpired) return <ExpiredTrialPage organization={organization} onLogout={() => firebaseSignOut(auth)} />;
  return children;
});

// ==================== ROLE GUARD ====================
const RoleGuard = memo(({ permission, children, fallback }) => {
  const { can, loading, isOwner } = useRole();
  if (loading) return <AuthLoadingScreen message="Verifying permissions…" />;
  if (!can(permission)) {
    return fallback || (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, marginBottom: 8, color: C.dark }}>Owner Access Required</h3>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Only the organization owner can access this section.</p>
        {!isOwner && <p style={{ color: C.muted, fontSize: 12 }}>Your role doesn't include the required permission: <code style={{ background: C.bg, padding: "2px 6px", borderRadius: 4 }}>{permission}</code></p>}
      </div>
    );
  }
  return children;
});

// ==================== TRIAL STATUS BANNER ====================
const TrialStatusBanner = memo(() => {
  const { organization, daysLeft, isActive } = useTrial();
  if (!organization || !isActive) return null;
  if (organization.plan !== "trial") return null;
  const color = daysLeft <= 1 ? C.red : daysLeft <= 3 ? C.amber : C.green;
  const bgColor = daysLeft <= 1 ? "rgba(122,26,26,0.08)" : daysLeft <= 3 ? "rgba(122,80,0,0.08)" : C.greenMuted;
  return (
    <div style={{ background: bgColor, borderBottom: `1px solid ${color}30`, padding: "8px 18px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 12, color, fontWeight: 500 }}>
      <span>⏰</span>
      <span><strong>{daysLeft} {daysLeft === 1 ? "day" : "days"}</strong> left in your free trial</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <a href="#" onClick={e => { e.preventDefault(); window.open("https://wa.me/919974724656", "_blank"); }} style={{ color, fontWeight: 600, textDecoration: "underline" }}>Upgrade now</a>
    </div>
  );
});

// ==================== ROLE BADGE ====================
const RoleBadge = memo(() => {
  const { role } = useRole();
  if (!role) return null;
  const config = {
    owner: { color: C.green, label: "OWNER", icon: "👑" },
    admin: { color: C.navy, label: "ADMIN", icon: "🛡️" },
    teacher: { color: C.amber, label: "TEACHER", icon: "📚" },
  }[role];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700, background: `${config.color}18`, color: config.color, letterSpacing: "0.08em" }}>
      <span>{config.icon}</span>{config.label}
    </span>
  );
});

// ==================== MODAL ====================
const Modal = memo(({ open, onClose, title, children, width = 600 }) => {
  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }
  }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(28,27,23,0.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(28,27,23,0.22)" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: F.serif }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted }}>✕</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
});

const useModal = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const show = useCallback((d = null) => { setData(d); setOpen(true); }, []);
  const hide = useCallback(() => { setOpen(false); setData(null); }, []);
  return { open, data, show, hide };
};

const useSearch = (items, keys) => {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item => keys.some(k => String(item[k] ?? "").toLowerCase().includes(q)));
  }, [items, query, keys]);
  return { query, setQuery, filtered };
};

// ==================== LMS MODALS ====================
const CourseDetailModal = memo(({ open, onClose, course, onEnroll }) => {
  if (!course) return null;
  return (
    <Modal open={open} onClose={onClose} title={course.title} width={720}>
      <div style={{ height: 160, borderRadius: 12, background: course.cover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, marginBottom: 18, color: "#F7F5EF" }}>{course.thumbnail}</div>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 18 }}>{course.description}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10, marginBottom: 18 }}>
        {[["Duration", course.duration], ["Modules", course.modules], ["Lessons", course.lessons], ["Rating", `⭐ ${course.rating}`]].map(([k, v]) => (
          <div key={k} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        {course.enrolled2 ? <Btn variant="green" style={{ flex: 1, justifyContent: "center" }}>Continue Learning →</Btn>
          : <Btn variant="green" style={{ flex: 1, justifyContent: "center" }} onClick={() => onEnroll?.(course)}>Enroll Now — Free</Btn>}
        <Btn variant="outline" onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
});

const QuizPlayerModal = memo(({ open, onClose, quiz }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  if (!quiz || !quiz.questionsData) return null;
  const total = quiz.questionsData.length;
  const currentQ = quiz.questionsData[step];
  const score = useMemo(() => submitted ? quiz.questionsData.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0) : 0, [submitted, answers, quiz]);
  useEffect(() => { if (open) { setStep(0); setAnswers({}); setSubmitted(false); } }, [open, quiz?.id]);
  return (
    <Modal open={open} onClose={onClose} title={quiz.title} width={680}>
      {!submitted ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 12, color: C.muted }}>
            <span>Question {step + 1} of {total}</span>
            <span>{quiz.duration} min · {quiz.totalMarks} marks</span>
          </div>
          <div style={{ height: 4, background: "rgba(28,27,23,0.06)", borderRadius: 2, marginBottom: 18 }}>
            <div style={{ height: "100%", width: `${((step + 1) / total) * 100}%`, background: C.green, borderRadius: 2, transition: "width 0.3s" }} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 18, fontFamily: F.serif }}>{currentQ.q}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {currentQ.options.map((opt, i) => (
              <button key={i} onClick={() => setAnswers(a => ({ ...a, [step]: i }))} style={{ padding: "12px 16px", border: `2px solid ${answers[step] === i ? C.green : C.faint}`, background: answers[step] === i ? C.greenMuted : C.surface, borderRadius: 10, cursor: "pointer", textAlign: "left", fontSize: 13, color: C.dark, fontWeight: answers[step] === i ? 600 : 400 }}>{String.fromCharCode(65 + i)}. {opt}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
            <Btn variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Previous</Btn>
            {step < total - 1 ? <Btn variant="green" disabled={answers[step] === undefined} onClick={() => setStep(s => s + 1)}>Next →</Btn> : <Btn variant="green" disabled={Object.keys(answers).length < total} onClick={() => setSubmitted(true)}>Submit Quiz</Btn>}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>{score / total >= 0.8 ? "🏆" : "👍"}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, fontFamily: F.serif }}>Quiz Complete!</h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>You scored <strong style={{ color: C.green, fontSize: 20 }}>{score}/{total}</strong></p>
          <Btn variant="green" onClick={onClose} style={{ justifyContent: "center", minWidth: 140 }}>Done</Btn>
        </div>
      )}
    </Modal>
  );
});

// ==================== LMS MODULE ====================
const LMSModule = memo(() => {
  const [tab, setTab] = useState("dashboard");
  const { open: courseOpen, data: courseData, show: showCourse, hide: hideCourse } = useModal();
  const { open: quizOpen, data: quizData, show: showQuiz, hide: hideQuiz } = useModal();
  const [courses, setCourses] = useState(DEMO_LMS.courses);
  const handleEnroll = useCallback((course) => setCourses(prev => prev.map(c => c.id === course.id ? { ...c, enrolled2: true, progress: 0 } : c)), []);
  return (
    <div>
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 10, padding: 4, marginBottom: 22, overflowX: "auto" }}>
        {LMS_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "8px 14px", borderRadius: 7, border: "none", background: tab === t.id ? C.surface : "transparent", color: tab === t.id ? C.dark : C.muted, fontFamily: F.sans, fontSize: 12, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>{t.icon} {t.label}</button>
        ))}
      </div>
      {tab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 }}>
            <StatCard label="Enrolled" value={courses.filter(c => c.enrolled2).length} color={C.navy} />
            <StatCard label="Available" value={courses.length} color={C.green} />
            <StatCard label="Quizzes" value={DEMO_LMS.quizzes.length} color={C.purple} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: F.serif }}>Continue Learning</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
            {courses.filter(c => c.enrolled2).slice(0, 3).map(c => (
              <div key={c.id} onClick={() => showCourse(c)} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ height: 80, background: c.cover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{c.thumbnail}</div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{c.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ProgressBar value={c.progress} color={c.color} /><span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "courses" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {courses.map(c => (
              <div key={c.id} onClick={() => showCourse(c)} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ height: 100, background: c.cover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>{c.thumbnail}</div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: F.serif }}>{c.title}</h3>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{c.subtitle}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: C.muted }}>
                    <span>{c.lessons} lessons</span><span>⭐ {c.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "quizzes" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          {DEMO_LMS.quizzes.map(q => (
            <div key={q.id} onClick={() => showQuiz(q)} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18, cursor: "pointer" }}>
              <Badge status={q.difficulty}>{q.difficulty}</Badge>
              <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: F.serif, margin: "8px 0 6px" }}>{q.title}</h3>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{q.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, fontSize: 11 }}>
                {[["Q", q.questions], ["Mins", q.duration], ["Marks", q.totalMarks]].map(([k, v]) => (
                  <div key={k} style={{ background: C.bg, borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div><div style={{ color: C.muted, fontSize: 10 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "library" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {DEMO_LMS.library.map(item => (
            <div key={item.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 50, height: 60, background: C.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{item.cover}</div>
                <div>
                  <Badge status="info">{item.type.toUpperCase()}</Badge>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "gradebook" && (
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 22 }}>
          {DEMO_LMS.gradebook.map((g, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{g.subject}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{g.overall}% · {g.grade}</span>
              </div>
              <ProgressBar value={g.overall} color={C.green} />
            </div>
          ))}
        </div>
      )}
      <CourseDetailModal open={courseOpen} onClose={hideCourse} course={courseData} onEnroll={handleEnroll} />
      <QuizPlayerModal open={quizOpen} onClose={hideQuiz} quiz={quizData} />
    </div>
  );
});

// ==================== EXISTING MODULES (abbreviated for length) ====================
const AttendanceModule = memo(() => {
  const { present, late, absent, total } = DEMO.todayAttendance;
  return (
    <div>
      <SectionHeader title="Today's Attendance" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Present" value={present} color={C.green} />
        <StatCard label="Late" value={late} color={C.amber} />
        <StatCard label="Absent" value={absent} color={C.red} />
        <StatCard label="Total" value={total} color={C.navy} />
      </div>
    </div>
  );
});

const StudentModule = memo(() => {
  const [students] = useState(DEMO.students);
  const { query, setQuery, filtered } = useSearch(students, ["name", "class", "id"]);
  return (
    <div>
      <SectionHeader title="Student Management" subtitle={`${students.length} students`} action={<Btn variant="green" size="sm">+ Add Student</Btn>} />
      <div style={{ marginBottom: 14 }}><SearchBar value={query} onChange={setQuery} placeholder="Search…" /></div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{["Student", "Class", "Roll", "Attendance", "Fees"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(row => <tr key={row.id} style={{ borderTop: `1px solid rgba(28,27,23,0.04)` }}><td style={{ padding: "11px 16px", fontSize: 13 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={row.name} size={28} /><span style={{ fontWeight: 600 }}>{row.name}</span></div></td><td style={{ padding: "11px 16px", fontSize: 13 }}>{row.class}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{row.rollNo}</td><td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: row.attendance > 90 ? C.green : C.amber }}>{row.attendance}%</td><td style={{ padding: "11px 16px" }}><Badge status={row.fees}>{row.fees}</Badge></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
});

const StaffModule = memo(() => <div><SectionHeader title="Staff & HR" /><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>{DEMO.staff.map(s => <div key={s.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, display: "flex", alignItems: "center", gap: 12 }}><Avatar name={s.name} size={40} color={C.navy} /><div><div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div><div style={{ fontSize: 12, color: C.muted }}>{s.role} · {s.dept}</div></div></div>)}</div></div>);

const LeaveModule = memo(() => <div><SectionHeader title="Leave Management" /><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{DEMO.leaveRequests.map(l => <div key={l.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar name={l.name} size={36} color={C.navy} /><div><div style={{ fontWeight: 700, fontSize: 14 }}>{l.name}</div><div style={{ fontSize: 12, color: C.muted }}>{l.type} · {l.days}d</div></div></div><Badge status={l.status}>{l.status}</Badge></div>)}</div></div>);

const PayrollModule = memo(() => <div><SectionHeader title="Payroll" /><div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{["Employee", "Salary", "Net", "Status"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{h}</th>)}</tr></thead><tbody>{DEMO.payroll.map(p => <tr key={p.id} style={{ borderTop: `1px solid rgba(28,27,23,0.04)` }}><td style={{ padding: "11px 16px", fontSize: 13 }}>{p.name}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{fmtINR(p.salary)}</td><td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: C.green }}>{fmtINR(p.net)}</td><td style={{ padding: "11px 16px" }}><Badge status={p.status}>{p.status}</Badge></td></tr>)}</tbody></table></div></div>);

const FeeModule = memo(() => <div><SectionHeader title="Fee Management" /><div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{["Student", "Class", "Paid", "Due", "Status"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{h}</th>)}</tr></thead><tbody>{DEMO.fees.map(f => <tr key={f.id} style={{ borderTop: `1px solid rgba(28,27,23,0.04)` }}><td style={{ padding: "11px 16px", fontSize: 13 }}>{f.name}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{f.class}</td><td style={{ padding: "11px 16px", fontSize: 13, color: C.green, fontWeight: 600 }}>{fmtINR(f.paid)}</td><td style={{ padding: "11px 16px", fontSize: 13, color: f.due > 0 ? C.red : C.muted }}>{f.due > 0 ? fmtINR(f.due) : "—"}</td><td style={{ padding: "11px 16px" }}><Badge status={f.status}>{f.status}</Badge></td></tr>)}</tbody></table></div></div>);

const ExamModule = memo(() => <div><SectionHeader title="Exam Schedule" /><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{DEMO.exams.map(e => <div key={e.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontWeight: 700, fontSize: 15, fontFamily: F.serif }}>{e.name}</div><div style={{ fontSize: 12, color: C.muted }}>{e.date}</div></div><Badge status={e.status}>{e.status}</Badge></div>)}</div></div>);

const AssignmentModule = memo(() => <div><SectionHeader title="Assignments" /><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{DEMO.assignments.map(a => { const pct = Math.round((a.submitted / a.total) * 100); return <div key={a.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700 }}>{a.title}</div><div style={{ fontSize: 12, color: C.muted }}>{a.class} · Due: {a.due}</div></div><div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>{a.submitted}/{a.total}</div></div><ProgressBar value={pct} color={C.green} /></div>; })}</div></div>);

const ParentPortal = memo(() => <div><SectionHeader title="Parent Portal" /><div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Avatar name={DEMO.students[0].name} size={48} /><div><div style={{ fontWeight: 700, fontSize: 16 }}>{DEMO.students[0].name}</div><div style={{ fontSize: 13, color: C.muted }}>Class {DEMO.students[0].class}</div></div></div></div></div>);

const NotificationCenter = memo(() => <div><SectionHeader title="Notifications" /><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{DEMO.notifications.map(n => <div key={n.id} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</span><span style={{ fontSize: 11, color: C.muted }}>{n.time}</span></div><div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{n.message}</div></div>)}</div></div>);

const ReportsModule = memo(() => <div><SectionHeader title="Reports" /><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}><StatCard label="Avg Attendance" value="93.4%" color={C.green} /></div></div>);

const DashboardOverview = memo(() => <div><SectionHeader title="School Overview" /><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}><StatCard label="Present" value={DEMO.todayAttendance.present} color={C.green} /><StatCard label="Total Students" value={DEMO.students.length} color={C.purple} /></div></div>);

// ==================== NEW: TEAM & BILLING (Owner-only) ====================
const TeamModule = memo(() => {
  const { can } = useRole();
  if (!can("manage_admins")) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, marginBottom: 8 }}>Owner Access Required</h3>
        <p style={{ color: C.muted, fontSize: 14 }}>Only the organization owner can manage team members.</p>
      </div>
    );
  }
  return (
    <div>
      <SectionHeader title="Team & Roles" subtitle={`${DEMO.teamMembers.length + 1} members`} action={<Btn variant="green" size="sm">+ Invite Member</Btn>} />
      <div style={{ background: "rgba(42,107,74,0.06)", border: "1px solid rgba(42,107,74,0.15)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#1B4D3E" }}>
        👑 <strong>You are the Owner</strong> — the supreme authority of this organization. You can manage subscription, billing, teachers, students, and all settings.
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{["Member", "Email", "Role", "Status", "Joined", "Actions"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
          <tbody>
            <tr style={{ borderTop: `1px solid rgba(28,27,23,0.04)`, background: "rgba(42,107,74,0.04)" }}>
              <td style={{ padding: "11px 16px", fontSize: 13 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name="Owner" size={28} color={C.green} /><span style={{ fontWeight: 600 }}>You (Owner)</span></div></td>
              <td style={{ padding: "11px 16px", fontSize: 13 }}>owner@school.in</td>
              <td style={{ padding: "11px 16px" }}><RoleBadgeCustom role="owner" /></td>
              <td style={{ padding: "11px 16px" }}><Badge status="Active">Active</Badge></td>
              <td style={{ padding: "11px 16px", fontSize: 12, color: C.muted }}>Since signup</td>
              <td style={{ padding: "11px 16px" }}><span style={{ fontSize: 12, color: C.muted }}>—</span></td>
            </tr>
            {DEMO.teamMembers.map(m => (
              <tr key={m.id} style={{ borderTop: `1px solid rgba(28,27,23,0.04)` }}>
                <td style={{ padding: "11px 16px", fontSize: 13 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={m.name} size={28} color={m.role === "admin" ? C.navy : C.amber} /><span style={{ fontWeight: 600 }}>{m.name}</span></div></td>
                <td style={{ padding: "11px 16px", fontSize: 13 }}>{m.email}</td>
                <td style={{ padding: "11px 16px" }}><RoleBadgeCustom role={m.role} /></td>
                <td style={{ padding: "11px 16px" }}><Badge status={m.status}>{m.status}</Badge></td>
                <td style={{ padding: "11px 16px", fontSize: 12, color: C.muted }}>{m.joined}</td>
                <td style={{ padding: "11px 16px" }}><Btn variant="outline" size="sm">Manage</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Role Permissions</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
            <div key={role} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}>
              <RoleBadgeCustom role={role} />
              <div style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
                {perms.length} permissions granted
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>
                {perms.slice(0, 4).join(", ")}{perms.length > 4 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const RoleBadgeCustom = memo(({ role }) => {
  const config = { owner: { color: C.green, label: "OWNER", icon: "👑" }, admin: { color: C.navy, label: "ADMIN", icon: "🛡️" }, teacher: { color: C.amber, label: "TEACHER", icon: "📚" } }[role];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 100, fontSize: 10, fontWeight: 700, background: `${config.color}18`, color: config.color, letterSpacing: "0.06em" }}><span>{config.icon}</span>{config.label}</span>;
});

const BillingModule = memo(() => {
  const { can } = useRole();
  if (!can("manage_billing")) {
    return <div style={{ padding: 40, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div><h3 style={{ fontFamily: F.serif, fontSize: 20, marginBottom: 8 }}>Owner Access Required</h3><p style={{ color: C.muted, fontSize: 14 }}>Only the owner can view and manage billing.</p></div>;
  }
  return (
    <div>
      <SectionHeader title="Billing & Subscription" />
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Current Plan</div>
            <div style={{ fontFamily: F.serif, fontSize: 24, color: C.dark, marginTop: 4 }}>7-Day Free Trial</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Trial ends: <strong>{DEMO.billing.trialEndDate}</strong></div>
          </div>
          <Btn variant="green">⬆ Upgrade Now</Btn>
        </div>
      </div>
      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Invoices</h4>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{["Invoice", "Date", "Description", "Amount", "Status"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
          <tbody>{DEMO.billing.invoices.map(i => <tr key={i.id} style={{ borderTop: `1px solid rgba(28,27,23,0.04)` }}><td style={{ padding: "11px 16px", fontSize: 13, fontFamily: F.mono }}>{i.id}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{i.date}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{i.description}</td><td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600 }}>{i.amount}</td><td style={{ padding: "11px 16px" }}><Badge status={i.status}>{i.status}</Badge></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
});

// ==================== DASHBOARD SHELL ====================
const DemoDashboard = memo(({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { role, isOwner, can } = useRole();

  const moduleMap = useMemo(() => ({
    overview: <DashboardOverview />, attendance: <AttendanceModule />, students: <StudentModule />,
    staff: <StaffModule />, leave: <LeaveModule />, payroll: <PayrollModule />, fees: <FeeModule />,
    exams: <ExamModule />, assignments: <AssignmentModule />, lms: <LMSModule />,
    parents: <ParentPortal />, notifications: <NotificationCenter />, reports: <ReportsModule />,
    team: <TeamModule />, billing: <BillingModule />,
  }), [role]);

  const visibleTabs = useMemo(() => NAV_TABS.filter(t => !t.ownerOnly || isOwner), [isOwner]);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 62px)", background: C.bg, overflow: "hidden" }}>
      <div style={{ width: sidebarOpen ? 240 : 64, background: "#1C1B17", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.25s" }}>
        <div style={{ padding: "18px 16px", borderBottom: "1px solid rgba(247,245,239,0.07)" }}>
          {sidebarOpen && <div style={{ fontFamily: F.serif, fontSize: 15, color: "#F7F5EF" }}>NexaAttend</div>}
          {sidebarOpen && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><RoleBadge /></div>}
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {visibleTabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: activeTab === t.id ? "rgba(247,245,239,0.1)" : "transparent", color: activeTab === t.id ? "#F7F5EF" : "rgba(247,245,239,0.4)", fontSize: 12, fontWeight: activeTab === t.id ? 600 : 400, fontFamily: F.sans, marginBottom: 2, borderLeft: `2px solid ${activeTab === t.id ? C.greenLight : "transparent"}` }}>
              <span style={{ fontSize: 13 }}>{t.icon}</span>
              {sidebarOpen && <span style={{ flex: 1 }}>{t.label}</span>}
              {t.ownerOnly && sidebarOpen && <span style={{ fontSize: 10 }}>👑</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(247,245,239,0.07)" }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ width: "100%", padding: "8px", background: "rgba(247,245,239,0.05)", border: "none", borderRadius: 8, color: "rgba(247,245,239,0.4)", fontSize: 11, cursor: "pointer", marginBottom: 6 }}>{sidebarOpen ? "⟨" : "⟩"}</button>
          <button onClick={onSignOut} style={{ width: "100%", padding: "8px", background: "rgba(247,245,239,0.05)", border: "none", borderRadius: 8, color: "rgba(247,245,239,0.4)", fontSize: 11, cursor: "pointer" }}>{sidebarOpen ? "Sign out" : "↩"}</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ padding: "14px 24px", background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: F.serif }}>{NAV_TABS.find(t => t.id === activeTab)?.label}</h2>
        </div>
        <div style={{ padding: "22px 24px" }}>{moduleMap[activeTab]}</div>
      </div>
    </div>
  );
});

// ==================== MAIN APP ====================
export default function App() {
  const [hash, setHash] = useState(window.location.hash.slice(1) || "/");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const nav = useCallback((p) => { window.location.hash = p; }, []);
  const navScrolled = useScroll();
  const [activeFaq, setActiveFaq] = useState(null);
  const [selPlan, setSelPlan] = useState("standard");
  const plan = useMemo(() => PLANS.find(p => p.id === selPlan), [selPlan]);

  useEffect(() => {
    const fn = () => setHash(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ?? null);
      setAuthReady(true);
      if (fbUser && (hash === "/" || hash === "")) nav("/demo");
    });
    return () => unsub();
  }, [hash, nav]);

  const signIn = useCallback(async () => {
    try { setSigningIn(true); await signInWithPopup(auth, googleProvider); }
    catch (err) { logErr("signIn", err); }
    finally { setSigningIn(false); }
  }, []);

  const signOut = useCallback(async () => { await firebaseSignOut(auth); nav("/"); }, [nav]);

  useEffect(() => { document.title = "NexaAttend — School ERP"; }, []);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  if (hash === "/demo") {
    if (!authReady) return <AuthLoadingScreen />;
    if (!user) { nav("/"); return null; }
    return (
      <TrialProvider user={user}>
        <TrialGuard>
          <RoleProvider user={user}>
            <div style={{ minHeight: "100vh", background: C.bg }}>
              <div style={{ position: "sticky", top: 0, background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 14, zIndex: 20, height: 62, boxSizing: "border-box" }}>
                <button onClick={() => nav("/")} style={{ background: "none", border: "none", cursor: "pointer",
