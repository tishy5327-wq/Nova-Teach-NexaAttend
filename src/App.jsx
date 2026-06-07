/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           NexaAttend — Complete School ERP · App.jsx · v6.0                 ║
 * ║   FULL ERP + LMS + ASSESSMENTS + QR ATTENDANCE + FEES + RECEIPTS           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * v6.0 NEW MODULES (all existing v5.0 functionality preserved):
 *  ✅ QR Attendance with dynamic QR, expiry timer, duplicate prevention
 *  ✅ Manual & Subject-wise & Lecture-wise Attendance
 *  ✅ Fees Management with Paid/Pending/Partial/Overdue status
 *  ✅ Receipt System with auto-generated receipt numbers and PDF download
 *  ✅ Student Submission Portal (assignments, documents, leave requests)
 *  ✅ LMS — Courses, Subjects, Chapters, Notes, PDFs, Videos
 *  ✅ Assessment System — MCQ Tests, Question Banks, Results History
 *  ✅ Unique Assignment generation (shuffled questions/values per student)
 *  ✅ Analytics Dashboard with charts
 *  ✅ School License Model (Starter/Professional/Enterprise + 7-day trial)
 *  ✅ Owner bypass account
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  memo, createContext, useContext,
} from "react";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, getDocs,
  collection, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp,
  Timestamp,
} from "firebase/firestore";

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

setPersistence(auth, browserLocalPersistence).catch(err =>
  console.warn("[NexaAttend] setPersistence failed (non-fatal):", err.message)
);

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxgViYSKbN1zFyISMS2l9xgDQGFE8QQAY7IlWjkEmAouzeO5GZwrLg8HZJevvF3SX4uyQ/exec";
const INQUIRY_SHEET_URL = SHEET_URL;
const OWNER_EMAIL = "tishy5327@gmail.com";

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
  { id: "overview",      label: "Overview",       icon: "◉" },
  { id: "attendance",    label: "Attendance",      icon: "◈" },
  { id: "students",      label: "Students",        icon: "◇" },
  { id: "staff",         label: "Staff & HR",      icon: "▣" },
  { id: "leave",         label: "Leave",           icon: "◆" },
  { id: "payroll",       label: "Payroll",         icon: "◎" },
  { id: "fees",          label: "Fees",            icon: "◐" },
  { id: "receipts",      label: "Receipts",        icon: "🧾" },
  { id: "lms",           label: "LMS",             icon: "📚" },
  { id: "assessments",   label: "Assessments",     icon: "📝" },
  { id: "submissions",   label: "Submissions",     icon: "📤" },
  { id: "exams",         label: "Exams",           icon: "◑" },
  { id: "assignments",   label: "Assignments",     icon: "◒" },
  { id: "parents",       label: "Parent Portal",   icon: "◓" },
  { id: "notifications", label: "Notifications",   icon: "◔" },
  { id: "reports",       label: "Reports",         icon: "◕" },
  { id: "analytics",     label: "Analytics",       icon: "📊" },
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
    { id:"F001", studentId:"S001", name:"Arjun Mehta",  class:"X-A",   annual:45000, paid:45000, due:0,     last:"2026-04-05", status:"Paid",    overdue:false },
    { id:"F002", studentId:"S002", name:"Priya Sharma", class:"X-A",   annual:45000, paid:45000, due:0,     last:"2026-04-10", status:"Paid",    overdue:false },
    { id:"F003", studentId:"S003", name:"Rohan Patel",  class:"IX-B",  annual:42000, paid:21000, due:21000, last:"2026-01-20", status:"Overdue", overdue:true  },
    { id:"F004", studentId:"S004", name:"Sneha Verma",  class:"X-A",   annual:45000, paid:45000, due:0,     last:"2026-05-01", status:"Paid",    overdue:false },
    { id:"F005", studentId:"S005", name:"Dev Agarwal",  class:"XI-C",  annual:48000, paid:48000, due:0,     last:"2026-03-15", status:"Paid",    overdue:false },
    { id:"F006", studentId:"S006", name:"Kavya Joshi",  class:"IX-B",  annual:42000, paid:28000, due:14000, last:"2026-02-28", status:"Partial", overdue:false },
    { id:"F007", studentId:"S007", name:"Ishaan Nair",  class:"XII-A", annual:50000, paid:50000, due:0,     last:"2026-04-22", status:"Paid",    overdue:false },
    { id:"F008", studentId:"S008", name:"Ananya Singh", class:"XI-C",  annual:48000, paid:0,     due:48000, last:"—",          status:"Pending", overdue:false },
  ],
  receipts: [
    { id:"R001", receiptNo:"NA-2026-001", studentId:"S001", studentName:"Arjun Mehta",  class:"X-A",   amount:45000, paymentMode:"Online Transfer", date:"2026-04-05", purpose:"Annual Fee 2026-27" },
    { id:"R002", receiptNo:"NA-2026-002", studentId:"S002", studentName:"Priya Sharma", class:"X-A",   amount:45000, paymentMode:"Cheque",          date:"2026-04-10", purpose:"Annual Fee 2026-27" },
    { id:"R003", receiptNo:"NA-2026-003", studentId:"S004", studentName:"Sneha Verma",  class:"X-A",   amount:45000, paymentMode:"Cash",             date:"2026-05-01", purpose:"Annual Fee 2026-27" },
    { id:"R004", receiptNo:"NA-2026-004", studentId:"S005", studentName:"Dev Agarwal",  class:"XI-C",  amount:48000, paymentMode:"UPI",              date:"2026-03-15", purpose:"Annual Fee 2026-27" },
    { id:"R005", receiptNo:"NA-2026-005", studentId:"S006", studentName:"Kavya Joshi",  class:"IX-B",  amount:14000, paymentMode:"Cash",             date:"2026-02-28", purpose:"First Installment" },
    { id:"R006", receiptNo:"NA-2026-006", studentId:"S007", studentName:"Ishaan Nair",  class:"XII-A", amount:50000, paymentMode:"Online Transfer",  date:"2026-04-22", purpose:"Annual Fee 2026-27" },
    { id:"R007", receiptNo:"NA-2026-007", studentId:"S006", studentName:"Kavya Joshi",  class:"IX-B",  amount:14000, paymentMode:"UPI",              date:"2026-04-01", purpose:"Second Installment" },
    { id:"R008", receiptNo:"NA-2026-008", studentId:"S003", studentName:"Rohan Patel",  class:"IX-B",  amount:21000, paymentMode:"Cheque",           date:"2026-01-20", purpose:"First Installment" },
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
    { id:"N007", title:"Receipt Generated",      message:"Receipt NA-2026-008 generated for Rohan Patel — ₹21,000.",       type:"success", time:"10:00 AM", read:false },
    { id:"N008", title:"Quiz Completed",         message:"Arjun Mehta scored 18/20 in Physics MCQ Test.",                   type:"success", time:"3:15 PM",  read:false },
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
  courses: [
    { id:"C001", title:"Mathematics Class X",    teacher:"Mr. Amit Kulkarni", subjects:6, notes:18, students:45, status:"Active", class:"X-A" },
    { id:"C002", title:"Science Class IX",        teacher:"Ms. Ritu Bansal",   subjects:4, notes:22, students:42, status:"Active", class:"IX-B" },
    { id:"C003", title:"English Literature XI",   teacher:"Mr. Sanjay Pillai", subjects:3, notes:15, students:38, status:"Active", class:"XI-C" },
    { id:"C004", title:"Physics Class XII",       teacher:"Ms. Ritu Bansal",   subjects:5, notes:30, students:32, status:"Active", class:"XII-A" },
    { id:"C005", title:"Hindi Language IX",       teacher:"Ms. Pooja Dubey",   subjects:3, notes:12, students:42, status:"Active", class:"IX-B" },
  ],
  notes: [
    { id:"M001", courseId:"C001", title:"Algebra – Chapter 3 Notes",       type:"PDF",   size:"2.4 MB",  uploaded:"June 1, 2026",  teacher:"Mr. Amit Kulkarni" },
    { id:"M002", courseId:"C001", title:"Quadratic Equations Summary",      type:"PDF",   size:"1.8 MB",  uploaded:"June 2, 2026",  teacher:"Mr. Amit Kulkarni" },
    { id:"M003", courseId:"C002", title:"Light & Optics – Lecture Notes",   type:"PDF",   size:"3.1 MB",  uploaded:"May 30, 2026",  teacher:"Ms. Ritu Bansal"   },
    { id:"M004", courseId:"C002", title:"Lab Manual – Experiments 1-5",     type:"PDF",   size:"5.6 MB",  uploaded:"June 3, 2026",  teacher:"Ms. Ritu Bansal"   },
    { id:"M005", courseId:"C003", title:"Essay Writing Guide",               type:"DOCX",  size:"0.9 MB",  uploaded:"May 28, 2026",  teacher:"Mr. Sanjay Pillai" },
    { id:"M006", courseId:"C004", title:"Motion & Laws of Motion",           type:"PPT",   size:"8.2 MB",  uploaded:"June 4, 2026",  teacher:"Ms. Ritu Bansal"   },
    { id:"M007", courseId:"C001", title:"Algebra Practice Problems",         type:"PDF",   size:"1.2 MB",  uploaded:"June 5, 2026",  teacher:"Mr. Amit Kulkarni" },
  ],
  quizzes: [
    { id:"Q001", title:"Physics MCQ – Chapter 3",  subject:"Physics",     class:"XII-A", questions:20, timeLimit:30, maxMarks:20, passingMarks:12, createdBy:"Ms. Ritu Bansal",   attempts:28, avgScore:15.2, status:"Active"   },
    { id:"Q002", title:"Maths Unit Test I",        subject:"Mathematics", class:"X-A",   questions:25, timeLimit:45, maxMarks:25, passingMarks:15, createdBy:"Mr. Amit Kulkarni", attempts:42, avgScore:18.7, status:"Active"   },
    { id:"Q003", title:"Science Chapter Quiz",     subject:"Science",     class:"IX-B",  questions:15, timeLimit:20, maxMarks:15, passingMarks:9,  createdBy:"Ms. Ritu Bansal",   attempts:35, avgScore:11.4, status:"Active"   },
    { id:"Q004", title:"English Grammar Test",     subject:"English",     class:"X-A",   questions:20, timeLimit:30, maxMarks:20, passingMarks:12, createdBy:"Mr. Sanjay Pillai", attempts:0,  avgScore:0,    status:"Draft"    },
    { id:"Q005", title:"Hindi Comprehension",      subject:"Hindi",       class:"XI-C",  questions:10, timeLimit:20, maxMarks:10, passingMarks:6,  createdBy:"Ms. Pooja Dubey",   attempts:18, avgScore:7.8,  status:"Completed"},
  ],
  quizResults: [
    { id:"QR001", quizId:"Q001", quizTitle:"Physics MCQ – Ch.3", studentName:"Arjun Mehta",  score:18, maxMarks:20, percentage:90, correct:18, wrong:2,  date:"June 3, 2026", passed:true  },
    { id:"QR002", quizId:"Q001", quizTitle:"Physics MCQ – Ch.3", studentName:"Priya Sharma", score:16, maxMarks:20, percentage:80, correct:16, wrong:4,  date:"June 3, 2026", passed:true  },
    { id:"QR003", quizId:"Q002", quizTitle:"Maths Unit Test I",  studentName:"Arjun Mehta",  score:22, maxMarks:25, percentage:88, correct:22, wrong:3,  date:"June 2, 2026", passed:true  },
    { id:"QR004", quizId:"Q002", quizTitle:"Maths Unit Test I",  studentName:"Sneha Verma",  score:19, maxMarks:25, percentage:76, correct:19, wrong:6,  date:"June 2, 2026", passed:true  },
    { id:"QR005", quizId:"Q003", quizTitle:"Science Chapter Quiz",studentName:"Rohan Patel", score:10, maxMarks:15, percentage:67, correct:10, wrong:5,  date:"June 1, 2026", passed:true  },
    { id:"QR006", quizId:"Q001", quizTitle:"Physics MCQ – Ch.3", studentName:"Ishaan Nair",  score:9,  maxMarks:20, percentage:45, correct:9,  wrong:11, date:"June 3, 2026", passed:false },
  ],
  submissions: [
    { id:"SB001", studentName:"Arjun Mehta",  class:"X-A",  type:"Assignment", title:"Maths Algebra Ch.3",    fileType:"PDF",  size:"1.2 MB", submittedAt:"June 4, 2026 · 9:15 AM", status:"Approved",    assignmentId:"A001" },
    { id:"SB002", studentName:"Priya Sharma", class:"X-A",  type:"Assignment", title:"Maths Algebra Ch.3",    fileType:"PDF",  size:"0.9 MB", submittedAt:"June 4, 2026 · 10:30 AM",status:"Under Review", assignmentId:"A001" },
    { id:"SB003", studentName:"Rohan Patel",  class:"IX-B", type:"Leave",      title:"Medical Leave Request", fileType:"PDF",  size:"0.4 MB", submittedAt:"June 3, 2026 · 8:45 AM", status:"Pending",     assignmentId:null   },
    { id:"SB004", studentName:"Dev Agarwal",  class:"XI-C", type:"Assignment", title:"Hindi Nibandh",         fileType:"DOCX", size:"0.6 MB", submittedAt:"June 5, 2026 · 2:00 PM", status:"Approved",    assignmentId:"A004" },
    { id:"SB005", studentName:"Kavya Joshi",  class:"IX-B", type:"Document",   title:"Birth Certificate",     fileType:"PDF",  size:"0.3 MB", submittedAt:"June 2, 2026 · 11:00 AM",status:"Approved",    assignmentId:null   },
    { id:"SB006", studentName:"Ananya Singh", class:"XI-C", type:"Assignment", title:"Hindi Nibandh",         fileType:"DOCX", size:"0.7 MB", submittedAt:"June 5, 2026 · 3:45 PM", status:"Rejected",    assignmentId:"A004" },
  ],
  subjectAttendance: [
    { subject:"Mathematics", teacher:"Mr. Amit Kulkarni", class:"X-A",  total:48, present:44, percentage:92 },
    { subject:"Science",     teacher:"Ms. Ritu Bansal",   class:"X-A",  total:42, present:38, percentage:91 },
    { subject:"English",     teacher:"Mr. Sanjay Pillai", class:"X-A",  total:36, present:35, percentage:97 },
    { subject:"Hindi",       teacher:"Ms. Pooja Dubey",   class:"XI-C", total:36, present:30, percentage:83 },
    { subject:"Physics",     teacher:"Ms. Ritu Bansal",   class:"XII-A",total:48, present:42, percentage:88 },
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
    present:"#1B5C3A", Paid:"#1B5C3A", Approved:"#1B5C3A", Processed:"#1B5C3A", Active:"#1B5C3A", success:"#1B5C3A", Completed:"#1B5C3A",
    late:COLORS.amber, Partial:COLORS.amber, warning:COLORS.amber, "Under Review":COLORS.amber, Draft:COLORS.amber,
    absent:COLORS.red, Due:COLORS.red, Pending:COLORS.red, alert:COLORS.red, Rejected:COLORS.red, Overdue:COLORS.red, Failed:COLORS.red,
    Upcoming:COLORS.navy, Scheduled:"rgba(28,27,23,0.5)", info:COLORS.navy,
  };
  return map[s] || "rgba(28,27,23,0.5)";
};

const statusBg = (s) => {
  const map = {
    present:"rgba(42,107,74,0.1)", Paid:"rgba(42,107,74,0.1)", Approved:"rgba(42,107,74,0.1)", Processed:"rgba(42,107,74,0.1)", Active:"rgba(42,107,74,0.1)", success:"rgba(42,107,74,0.1)", Completed:"rgba(42,107,74,0.1)",
    late:"rgba(122,80,0,0.1)", Partial:"rgba(122,80,0,0.1)", warning:"rgba(122,80,0,0.1)", "Under Review":"rgba(122,80,0,0.1)", Draft:"rgba(122,80,0,0.1)",
    absent:"rgba(239,68,68,0.1)", Due:"rgba(239,68,68,0.1)", Pending:"rgba(239,68,68,0.1)", alert:"rgba(239,68,68,0.1)", Rejected:"rgba(239,68,68,0.1)", Overdue:"rgba(239,68,68,0.1)", Failed:"rgba(239,68,68,0.1)",
    Upcoming:"rgba(26,43,74,0.1)", Scheduled:"rgba(28,27,23,0.06)", info:"rgba(26,43,74,0.08)",
  };
  return map[s] || "rgba(28,27,23,0.06)";
};

const generateQRData = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "NA-QR-";
  for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

// ==================== GOOGLE SHEETS LOGGER ====================
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
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      if (json.status !== "ok") throw new Error(`Sheets error: ${json.message || JSON.stringify(json)}`);
      return { success: true };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) await sleep(500 * Math.pow(2, attempt - 1));
    }
  }
  return { success: false, error: lastError?.message };
}

// ==================== BODY SCROLL LOCK ====================
let _scrollLockCount = 0;
function lockBodyScroll() {
  _scrollLockCount++;
  if (_scrollLockCount === 1) document.body.style.overflow = "hidden";
}
function unlockBodyScroll() {
  _scrollLockCount = Math.max(0, _scrollLockCount - 1);
  if (_scrollLockCount === 0) document.body.style.overflow = "";
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

const useSearch = (items, keys) => {
  const [rawQuery, setRawQuery] = useState("");
  const [q, setQ] = useState("");
  const timerRef = useRef(null);
  const setRawQueryHandler = useCallback((val) => {
    setRawQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setQ(val), 300);
  }, []);
  useEffect(() => () => clearTimeout(timerRef.current), []);
  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const lq = q.toLowerCase();
    return items.filter(item => keys.some(k => String(item[k] ?? "").toLowerCase().includes(lq)));
  }, [items, q, keys]);
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

const useCountdown = (seconds) => {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);
  const reset = useCallback(() => setRemaining(seconds), [seconds]);
  return { remaining, reset, expired: remaining === 0 };
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
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
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
    <div style={{ display: "flex", gap: 4, background: COLORS.bg, borderRadius: 8, padding: 4, flexWrap:"wrap" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, minWidth: 80, padding: "7px 12px", borderRadius: 6, border: "none",
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
          }}>Try again</button>
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
      onSave({ ...form, id:`S${Date.now()}`, status:"Active", attendance:0, fees:"Pending" });
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
              <tr><td colSpan={columns.length}><EmptyState title={emptyMsg} /></td></tr>
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

// ==================== QR ATTENDANCE MODULE ====================
const QRAttendanceModule = memo(function QRAttendanceModule() {
  const [qrData, setQrData] = useState(() => generateQRData());
  const [expirySeconds, setExpirySeconds] = useState(120);
  const [expired, setExpired] = useState(false);
  const [scanned, setScanned] = useState([]);
  const [attendanceMode, setAttendanceMode] = useState("qr");
  const [manualClass, setManualClass] = useState("X-A");
  const [manualStatus, setManualStatus] = useState({});
  const [subjectFilter, setSubjectFilter] = useState("Mathematics");

  const timerRef = useRef(null);

  useEffect(() => {
    if (expired) return;
    timerRef.current = setInterval(() => {
      setExpirySeconds(s => {
        if (s <= 1) { setExpired(true); clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [expired]);

  const regenerateQR = useCallback(() => {
    setQrData(generateQRData());
    setExpirySeconds(120);
    setExpired(false);
    setScanned([]);
  }, []);

  const simulateScan = useCallback(() => {
    const unscanned = DEMO.students.filter(s => !scanned.find(sc => sc.id === s.id));
    if (unscanned.length === 0) return;
    const student = unscanned[Math.floor(Math.random() * unscanned.length)];
    setScanned(prev => [...prev, { ...student, scanTime: new Date().toLocaleTimeString() }]);
  }, [scanned]);

  const pct = Math.round((expirySeconds / 120) * 100);

  const classStudents = useMemo(() =>
    DEMO.students.filter(s => s.class === manualClass), [manualClass]);

  return (
    <div>
      <SectionHeader title="Attendance" subtitle="QR, Manual, Subject-wise and Lecture-wise attendance" />
      <TabBar
        tabs={[
          { id:"qr", label:"QR Attendance" },
          { id:"manual", label:"Manual Attendance" },
          { id:"subject", label:"Subject-wise" },
          { id:"lecture", label:"Lecture-wise" },
        ]}
        active={attendanceMode}
        onChange={setAttendanceMode}
      />
      <div style={{ marginTop: 20 }}>
        {attendanceMode === "qr" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div style={{ background:COLORS.surface, borderRadius:14, border:`1px solid ${COLORS.border}`, padding:24, textAlign:"center" }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>Dynamic QR Code</div>
              <div style={{ position:"relative", width:160, height:160, margin:"0 auto 16px" }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ position:"absolute", top:0, left:0 }}>
                  <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(28,27,23,0.06)" strokeWidth="6" />
                  <circle cx="80" cy="80" r="72" fill="none"
                    stroke={expired ? COLORS.red : expirySeconds < 30 ? COLORS.amber : COLORS.green}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 72}`}
                    strokeDashoffset={`${2 * Math.PI * 72 * (1 - expirySeconds / 120)}`}
                    style={{ transform:"rotate(-90deg)", transformOrigin:"center", transition:"stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div style={{ position:"absolute", inset:10, background:expired?"rgba(122,26,26,0.06)":COLORS.bg, borderRadius:"50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                  {!expired ? (
                    <>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,8px)", gap:2 }}>
                        {[...Array(25)].map((_, i) => (
                          <div key={i} style={{ width:8, height:8, background: Math.random() > 0.5 ? COLORS.dark : "transparent", borderRadius:1 }} />
                        ))}
                      </div>
                      <div style={{ fontSize:9, fontFamily:FONTS.mono, color:COLORS.muted, marginTop:4 }}>{qrData.slice(-6)}</div>
                    </>
                  ) : (
                    <div style={{ fontSize:28 }}>⏰</div>
                  )}
                </div>
              </div>
              <div style={{ fontSize:12, fontFamily:FONTS.mono, color:COLORS.muted, marginBottom:8 }}>{qrData}</div>
              <div style={{ fontSize:13, fontWeight:700, color:expired?COLORS.red:expirySeconds<30?COLORS.amber:COLORS.green, marginBottom:12 }}>
                {expired ? "QR Expired" : `Expires in ${expirySeconds}s`}
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                <Btn variant="green" size="sm" onClick={regenerateQR}>↻ New QR</Btn>
                <Btn variant="outline" size="sm" onClick={simulateScan} disabled={expired}>Simulate Scan</Btn>
              </div>
              <div style={{ marginTop:14, padding:"10px 14px", background:COLORS.bg, borderRadius:8, fontSize:12, color:COLORS.muted, textAlign:"left" }}>
                <div style={{ fontWeight:600, marginBottom:4 }}>QR Features:</div>
                <div>✓ One scan per student (duplicate prevention)</div>
                <div>✓ Timestamp recorded automatically</div>
                <div>✓ Auto-expires every 2 minutes</div>
              </div>
            </div>
            <div style={{ background:COLORS.surface, borderRadius:14, border:`1px solid ${COLORS.border}`, padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>Scanned Students ({scanned.length}/{DEMO.students.length})</div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green, animation:"pulse 1.5s infinite" }} />
                  <span style={{ fontSize:10, color:COLORS.green, fontWeight:700 }}>LIVE</span>
                </div>
              </div>
              {scanned.length === 0 ? (
                <EmptyState icon="📱" title="No scans yet" subtitle="Students scan the QR code to mark attendance" />
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:320, overflowY:"auto" }}>
                  {scanned.map((s, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:COLORS.bg, borderRadius:8, animation:"fadeUp 0.3s ease" }}>
                      <Avatar name={s.name} size={28} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                        <div style={{ fontSize:11, color:COLORS.muted }}>{s.class} · Roll #{s.rollNo}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <Badge status="present">Present</Badge>
                        <div style={{ fontSize:10, color:COLORS.muted, marginTop:2 }}>{s.scanTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {attendanceMode === "manual" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
              <select value={manualClass} onChange={e=>setManualClass(e.target.value)} style={{ padding:"8px 12px", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, fontSize:13, fontFamily:FONTS.sans, background:COLORS.bg }}>
                {["X-A","X-B","IX-A","IX-B","XI-C","XII-A"].map(c=><option key={c}>{c}</option>)}
              </select>
              <span style={{ fontSize:13, color:COLORS.muted, lineHeight:"36px" }}>Date: June 7, 2026</span>
            </div>
            <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(28,27,23,0.02)", borderBottom:`1px solid ${COLORS.border}` }}>
                    {["Roll","Student","Present","Absent","Late","Half Day"].map(h=>(
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:COLORS.muted, letterSpacing:"0.07em", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map(s => {
                    const cur = manualStatus[s.id] || "present";
                    return (
                      <tr key={s.id} style={{ borderTop:`1px solid rgba(28,27,23,0.04)` }}>
                        <td style={{ padding:"10px 16px", fontSize:13, fontFamily:FONTS.mono, color:COLORS.muted }}>{s.rollNo}</td>
                        <td style={{ padding:"10px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <Avatar name={s.name} size={26} />
                            <span style={{ fontSize:13, fontWeight:500 }}>{s.name}</span>
                          </div>
                        </td>
                        {["present","absent","late","halfday"].map(st => (
                          <td key={st} style={{ padding:"10px 16px" }}>
                            <input type="radio" name={`att-${s.id}`} value={st} checked={cur===st}
                              onChange={() => setManualStatus(prev=>({...prev,[s.id]:st}))}
                              style={{ accentColor:COLORS.green, width:16, height:16 }} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <Btn variant="green">Save Attendance</Btn>
              <Btn variant="outline">Export CSV</Btn>
            </div>
          </div>
        )}

        {attendanceMode === "subject" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
              {DEMO.subjectAttendance.map((sa, i) => (
                <div key={i} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:4 }}>{sa.subject}</div>
                  <div style={{ fontSize:11, color:COLORS.muted, marginBottom:10 }}>{sa.class} · {sa.teacher.split(" ").pop()}</div>
                  <div style={{ fontSize:24, fontWeight:700, color:sa.percentage>=90?COLORS.green:sa.percentage>=75?COLORS.amber:COLORS.red, fontFamily:FONTS.serif }}>{sa.percentage}%</div>
                  <ProgressBar value={sa.percentage} color={sa.percentage>=90?COLORS.green:sa.percentage>=75?COLORS.amber:COLORS.red} height={4} />
                  <div style={{ fontSize:11, color:COLORS.muted, marginTop:6 }}>{sa.present}/{sa.total} lectures</div>
                </div>
              ))}
            </div>
            <SectionHeader title="Subject-wise Attendance Table" subtitle="Mark attendance per subject per lecture" />
            <DataTable
              columns={[
                { key:"subject", label:"Subject" },
                { key:"teacher", label:"Teacher", muted:true },
                { key:"class",   label:"Class",   muted:true },
                { key:"total",   label:"Total Lectures", mono:true },
                { key:"present", label:"Present",  mono:true },
                { key:"percentage", label:"Attendance %", render:(v)=><span style={{fontWeight:700,color:v>=90?COLORS.green:v>=75?COLORS.amber:COLORS.red}}>{v}%</span> },
              ]}
              data={DEMO.subjectAttendance}
            />
          </div>
        )}

        {attendanceMode === "lecture" && (
          <div>
            <div style={{ background:"rgba(26,43,74,0.06)", border:`1px solid rgba(26,43,74,0.15)`, borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
              <p style={{ fontSize:13, color:COLORS.navy, lineHeight:1.7 }}>
                📋 <strong>Lecture-wise Attendance:</strong> Mark attendance for each individual lecture period. Select the period, subject, and class to begin.
              </p>
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
              {["Period 1 — 8:00 AM","Period 2 — 9:00 AM","Period 3 — 10:00 AM","Period 4 — 11:00 AM"].map((p,i)=>(
                <button key={i} onClick={()=>{}} style={{
                  padding:"7px 14px", borderRadius:8, border:`1.5px solid ${i===0?COLORS.green:COLORS.faint}`,
                  background:i===0?COLORS.greenMuted:"transparent", color:i===0?COLORS.green:COLORS.dark,
                  fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans,
                }}>{p}</button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {DEMO.subjectAttendance.slice(0,4).map((sa,i)=>(
                <div key={i} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700 }}>{sa.subject}</div>
                      <div style={{ fontSize:11, color:COLORS.muted }}>{sa.class} · {sa.teacher}</div>
                    </div>
                    <Badge status="Active">Live</Badge>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <Btn variant="green" size="sm">Mark Present</Btn>
                    <Btn variant="outline" size="sm">View Report</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ==================== FEES MODULE (ENHANCED) ====================
const FeeModule = memo(function FeeModule() {
  const [fees, setFees] = useState(DEMO.fees);
  const { query, setQuery, filtered } = useSearch(fees, ["name","class","studentId"]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [addPayModal, setAddPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ amount:"", mode:"Cash", date:"" });

  const totals = useMemo(() => ({
    annual:    fees.reduce((s,f) => s+f.annual,0),
    collected: fees.reduce((s,f) => s+f.paid,0),
    pending:   fees.reduce((s,f) => s+(f.status==="Pending"?f.due:0),0),
    overdue:   fees.reduce((s,f) => s+(f.status==="Overdue"?f.due:0),0),
    partial:   fees.reduce((s,f) => s+(f.status==="Partial"?f.due:0),0),
  }), [fees]);

  const collPct = Math.round((totals.collected / totals.annual) * 100);
  const displayed = useMemo(() =>
    statusFilter==="all" ? filtered : filtered.filter(f => f.status===statusFilter),
    [filtered, statusFilter]
  );

  const handleAddPayment = useCallback((fee) => {
    setAddPayModal(fee);
    setPayForm({ amount: fee.due.toString(), mode:"Cash", date: new Date().toISOString().split("T")[0] });
  }, []);

  const savePayment = useCallback(() => {
    if (!addPayModal || !payForm.amount) return;
    const amt = Math.min(Number(payForm.amount), addPayModal.due);
    setFees(prev => prev.map(f => {
      if (f.id !== addPayModal.id) return f;
      const newPaid = f.paid + amt;
      const newDue  = f.due  - amt;
      return { ...f, paid:newPaid, due:newDue, last:payForm.date, status: newDue<=0 ? "Paid" : f.status==="Overdue" ? "Partial" : "Partial" };
    }));
    setAddPayModal(null);
  }, [addPayModal, payForm]);

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
    { key:"id",     label:"Action",       render:(_,r) => (
      <div style={{ display:"flex", gap:6 }}>
        {r.due > 0 && <Btn variant="green" size="sm" onClick={e=>{e.stopPropagation();handleAddPayment(r);}}>Add Payment</Btn>}
        {r.due > 0 && <Btn variant="outline" size="sm">Reminder</Btn>}
      </div>
    )},
  ], [handleAddPayment]);

  return (
    <div>
      <SectionHeader
        title="Fee Management"
        subtitle="Annual fee tracking and collections"
        action={<Btn variant="green" size="sm">Record Payment</Btn>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:14, marginBottom:20 }}>
        <StatCard label="Total Annual"   value={fmtINR(totals.annual)}    color={COLORS.navy}   />
        <StatCard label="Collected"      value={fmtINR(totals.collected)} color={COLORS.green} accent={`${collPct}% rate`} />
        <StatCard label="Pending"        value={fmtINR(totals.pending)}   color={COLORS.amber}  />
        <StatCard label="Overdue"        value={fmtINR(totals.overdue)}   color={COLORS.red}    />
        <StatCard label="Defaulters"     value={fees.filter(f=>f.due>0).length} sub="students" color={COLORS.purple} />
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
        {["all","Paid","Partial","Pending","Overdue"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding:"7px 14px", borderRadius:100, border:`1.5px solid ${statusFilter===s?COLORS.green:COLORS.faint}`,
            background:statusFilter===s?COLORS.greenMuted:"transparent", color:statusFilter===s?COLORS.green:COLORS.dark,
            fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans,
          }}>{s==="all"?"All":s}</button>
        ))}
      </div>
      <DataTable columns={columns} data={displayed} />
      <Modal open={!!addPayModal} onClose={()=>setAddPayModal(null)} title={`Add Payment — ${addPayModal?.name}`} width={420}>
        {addPayModal && (
          <div>
            <div style={{ background:COLORS.bg, borderRadius:8, padding:"12px 14px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                <span style={{ color:COLORS.muted }}>Pending Amount</span>
                <span style={{ fontWeight:700, color:COLORS.red }}>{fmtINR(addPayModal.due)}</span>
              </div>
            </div>
            {[["Amount (₹)","amount","number"],["Payment Date","date","date"]].map(([l,k,t])=>(
              <div key={k} style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>{l}</label>
                <input type={t} value={payForm[k]} onChange={e=>setPayForm(f=>({...f,[k]:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, fontSize:13, fontFamily:FONTS.sans, background:COLORS.bg, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>Payment Mode</label>
              <select value={payForm.mode} onChange={e=>setPayForm(f=>({...f,mode:e.target.value}))} style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, fontSize:13, fontFamily:FONTS.sans, background:COLORS.bg }}>
                {["Cash","Cheque","UPI","Online Transfer","DD"].map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="outline" onClick={()=>setAddPayModal(null)} style={{ flex:1, justifyContent:"center" }}>Cancel</Btn>
              <Btn variant="green"   onClick={savePayment}              style={{ flex:1, justifyContent:"center" }}>Save Payment</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

// ==================== RECEIPT MODULE ====================
const ReceiptModule = memo(function ReceiptModule() {
  const [receipts] = useState(DEMO.receipts);
  const { query, setQuery, filtered } = useSearch(receipts, ["receiptNo","studentName","class","purpose"]);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  const totalCollected = useMemo(() => receipts.reduce((s,r) => s+r.amount, 0), [receipts]);

  const ReceiptPreview = memo(function ReceiptPreview({ receipt }) {
    if (!receipt) return null;
    return (
      <div style={{ fontFamily:FONTS.sans }}>
        <div style={{ border:`2px solid ${COLORS.dark}`, borderRadius:12, padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:FONTS.serif, fontSize:20, fontWeight:700 }}>NexaAttend</div>
              <div style={{ fontSize:11, color:COLORS.muted }}>Nova Teach ERP · Ahmedabad, Gujarat</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:COLORS.muted }}>RECEIPT</div>
              <div style={{ fontSize:18, fontWeight:700, fontFamily:FONTS.mono, color:COLORS.green }}>{receipt.receiptNo}</div>
            </div>
          </div>
          <div style={{ height:1, background:COLORS.border, marginBottom:16 }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            {[["Student Name",receipt.studentName],["Class",receipt.class],["Date",fmtDate(receipt.date)],["Payment Mode",receipt.paymentMode]].map(([k,v])=>(
              <div key={k}>
                <div style={{ fontSize:10, fontWeight:700, color:COLORS.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background:COLORS.bg, borderRadius:8, padding:"14px 16px", marginBottom:16 }}>
            <div style={{ fontSize:12, color:COLORS.muted, marginBottom:4 }}>Purpose</div>
            <div style={{ fontSize:14, fontWeight:600 }}>{receipt.purpose}</div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:`${COLORS.green}10`, border:`1px solid rgba(42,107,74,0.2)`, borderRadius:8, padding:"14px 16px" }}>
            <div style={{ fontSize:14, fontWeight:600, color:COLORS.green }}>Amount Paid</div>
            <div style={{ fontSize:24, fontWeight:700, color:COLORS.green, fontFamily:FONTS.serif }}>{fmtINR(receipt.amount)}</div>
          </div>
          <div style={{ display:"flex", justifyContent:"center", marginTop:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,8px)", gap:2 }}>
              {[...Array(16)].map((_,i)=>(<div key={i} style={{ width:8, height:8, background:Math.random()>0.5?COLORS.dark:"transparent", borderRadius:1 }} />))}
            </div>
          </div>
          <div style={{ textAlign:"center", fontSize:10, color:COLORS.muted, marginTop:8 }}>QR Verified · {receipt.receiptNo}</div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <Btn variant="green" style={{ flex:1, justifyContent:"center" }}>🖨 Print</Btn>
          <Btn variant="outline" style={{ flex:1, justifyContent:"center" }}>⬇ Download PDF</Btn>
          <Btn variant="ghost" style={{ flex:1, justifyContent:"center" }}>↩ Reprint</Btn>
        </div>
      </div>
    );
  });

  const columns = useMemo(() => [
    { key:"receiptNo",   label:"Receipt No",    mono:true },
    { key:"studentName", label:"Student",       render:(v,r) => (
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <Avatar name={v} size={26} />
        <div><div style={{ fontWeight:600, fontSize:13 }}>{v}</div><div style={{ fontSize:11, color:COLORS.muted }}>{r.class}</div></div>
      </div>
    )},
    { key:"purpose",  label:"Purpose",      muted:true },
    { key:"date",     label:"Date",         render:(v)=>fmtDate(v), muted:true },
    { key:"paymentMode", label:"Mode",      muted:true },
    { key:"amount",   label:"Amount",       render:(v)=><span style={{ fontWeight:700, color:COLORS.green }}>{fmtINR(v)}</span> },
    { key:"id",       label:"Action",       render:(_,r)=>(
      <div style={{ display:"flex", gap:6 }}>
        <Btn variant="outline" size="sm" onClick={e=>{e.stopPropagation();setPreviewReceipt(r);}}>View</Btn>
        <Btn variant="ghost"   size="sm">Print</Btn>
      </div>
    )},
  ], []);

  return (
    <div>
      <SectionHeader
        title="Receipt Management"
        subtitle="Auto-generated receipts with QR verification"
        action={<Btn variant="green" size="sm">+ New Receipt</Btn>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:20 }}>
        <StatCard label="Total Receipts"  value={receipts.length}           color={COLORS.navy}   />
        <StatCard label="Total Collected" value={fmtINR(totalCollected)}    color={COLORS.green}  />
        <StatCard label="This Month"      value={fmtINR(totalCollected)}    color={COLORS.purple} />
        <StatCard label="Today"           value={fmtINR(50000)}             color={COLORS.amber}  />
      </div>
      <div style={{ marginBottom:14 }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search receipts, students, purpose…" />
      </div>
      <DataTable columns={columns} data={filtered} onRowClick={setPreviewReceipt} />
      <Modal open={!!previewReceipt} onClose={()=>setPreviewReceipt(null)} title="Receipt Preview" width={500}>
        <ReceiptPreview receipt={previewReceipt} />
      </Modal>
    </div>
  );
});

// ==================== LMS MODULE ====================
const LMSModule = memo(function LMSModule() {
  const [lmsView, setLmsView] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <div>
      <SectionHeader
        title="Learning Management System"
        subtitle="Courses, study materials, notes and PDFs"
        action={<Btn variant="green" size="sm">+ Create Course</Btn>}
      />
      <TabBar
        tabs={[
          { id:"courses", label:"Courses" },
          { id:"notes",   label:"Study Materials" },
          { id:"videos",  label:"Videos" },
        ]}
        active={lmsView}
        onChange={setLmsView}
      />
      <div style={{ marginTop:20 }}>
        {lmsView === "courses" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
              {DEMO.courses.map(c => (
                <div key={c.id} onClick={() => setSelectedCourse(c)} style={{
                  background:COLORS.surface, borderRadius:14, border:`1px solid ${COLORS.border}`,
                  padding:20, cursor:"pointer", transition:"all 0.2s",
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(28,27,23,0.1)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ width:44, height:44, borderRadius:10, background:COLORS.greenMuted, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📚</div>
                    <Badge status={c.status}>{c.status}</Badge>
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, fontFamily:FONTS.serif, marginBottom:4 }}>{c.title}</div>
                  <div style={{ fontSize:12, color:COLORS.muted, marginBottom:12 }}>{c.teacher} · {c.class}</div>
                  <div style={{ display:"flex", gap:16 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:700, color:COLORS.green }}>{c.subjects}</div>
                      <div style={{ fontSize:10, color:COLORS.muted }}>Subjects</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:700, color:COLORS.navy }}>{c.notes}</div>
                      <div style={{ fontSize:10, color:COLORS.muted }}>Notes</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:700, color:COLORS.purple }}>{c.students}</div>
                      <div style={{ fontSize:10, color:COLORS.muted }}>Students</div>
                    </div>
                  </div>
                  <div style={{ marginTop:14, display:"flex", gap:8 }}>
                    <Btn variant="green" size="sm" style={{ flex:1, justifyContent:"center" }} onClick={e=>{e.stopPropagation();}}>View Course</Btn>
                    <Btn variant="outline" size="sm" onClick={e=>{e.stopPropagation();}}>Edit</Btn>
                  </div>
                </div>
              ))}
              <div style={{ background:COLORS.bg, borderRadius:14, border:`2px dashed ${COLORS.faint}`, padding:20, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", minHeight:200 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=COLORS.green;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=COLORS.faint;}}>
                <div style={{ fontSize:32, color:COLORS.faint }}>+</div>
                <div style={{ fontSize:13, fontWeight:600, color:COLORS.muted }}>Create New Course</div>
              </div>
            </div>
          </div>
        )}

        {lmsView === "notes" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:200 }}>
                <SearchBar value="" onChange={()=>{}} placeholder="Search notes, PDFs, documents…" />
              </div>
              <select style={{ padding:"8px 12px", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, fontSize:13, fontFamily:FONTS.sans, background:COLORS.bg }}>
                <option>All Subjects</option>
                {DEMO.courses.map(c=><option key={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {DEMO.notes.map(n => {
                const typeColor = n.type==="PDF"?COLORS.red:n.type==="DOCX"?COLORS.navy:COLORS.purple;
                const typeIcon  = n.type==="PDF"?"📄":n.type==="DOCX"?"📝":"📊";
                return (
                  <div key={n.id} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:42, height:42, borderRadius:10, background:`${typeColor}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{typeIcon}</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600 }}>{n.title}</div>
                        <div style={{ fontSize:11, color:COLORS.muted, marginTop:2 }}>
                          <span style={{ fontWeight:600, color:typeColor }}>{n.type}</span> · {n.size} · Uploaded {n.uploaded} · {n.teacher}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <Btn variant="green"   size="sm">📖 Open</Btn>
                      <Btn variant="outline" size="sm">⬇ Download</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:16, background:"rgba(42,107,74,0.06)", border:`1px solid rgba(42,107,74,0.15)`, borderRadius:10, padding:"12px 16px" }}>
              <p style={{ fontSize:13, color:"#1B4D3E", lineHeight:1.7 }}>
                📋 <strong>PDF Learning Center:</strong> Students can open PDFs directly in the app, read notes online, and download study materials for offline access.
              </p>
            </div>
          </div>
        )}

        {lmsView === "videos" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
              {[
                { title:"Algebra — Introduction to Quadratics", duration:"18:32", views:124, subject:"Mathematics" },
                { title:"Light & Optics — Refraction Explained", duration:"22:45", views:98,  subject:"Science"     },
                { title:"Essay Structure & Writing Tips",         duration:"14:20", views:87,  subject:"English"     },
                { title:"Newton's Laws — Visual Explanation",     duration:"25:10", views:156, subject:"Physics"     },
              ].map((v,i)=>(
                <div key={i} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, overflow:"hidden" }}>
                  <div style={{ height:120, background:`linear-gradient(135deg,${COLORS.dark},${COLORS.navy})`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>▶</div>
                    <div style={{ position:"absolute", bottom:8, right:8, background:"rgba(0,0,0,0.6)", borderRadius:4, padding:"2px 6px", fontSize:10, color:"#fff", fontFamily:FONTS.mono }}>{v.duration}</div>
                  </div>
                  <div style={{ padding:14 }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>{v.title}</div>
                    <div style={{ fontSize:11, color:COLORS.muted }}>{v.subject} · {v.views} views</div>
                    <Btn variant="green" size="sm" style={{ marginTop:10 }}>▶ Watch Now</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ==================== ASSESSMENT MODULE ====================
const AssessmentModule = memo(function AssessmentModule() {
  const [view, setView] = useState("quizzes");
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizState, setQuizState] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const SAMPLE_QUESTIONS = useMemo(() => [
    { id:1, q:"What is the SI unit of force?",                   opts:["Newton","Joule","Watt","Pascal"],                         ans:0 },
    { id:2, q:"Which law states F = ma?",                        opts:["Newton's 1st Law","Newton's 2nd Law","Newton's 3rd Law","Hooke's Law"], ans:1 },
    { id:3, q:"What is acceleration due to gravity (g)?",        opts:["9.8 m/s²","8.9 m/s²","10.8 m/s²","11 m/s²"],            ans:0 },
    { id:4, q:"A body at rest continues to be at rest due to?",  opts:["Friction","Inertia","Gravity","Momentum"],                ans:1 },
    { id:5, q:"Which is a scalar quantity?",                     opts:["Velocity","Force","Speed","Displacement"],                ans:2 },
  ], []);

  const shuffleArray = useCallback((arr) => [...arr].sort(() => Math.random() - 0.5), []);

  const startQuiz = useCallback((quiz) => {
    const shuffled = shuffleArray(SAMPLE_QUESTIONS).map(q => ({
      ...q, opts: [...q.opts].sort(() => Math.random() - 0.5),
    }));
    setActiveQuiz(quiz);
    setQuizState({ questions: shuffled, timeLeft: quiz.timeLimit * 60 });
    setAnswers({});
    setSubmitted(false);
    setView("taking");
  }, [SAMPLE_QUESTIONS, shuffleArray]);

  useEffect(() => {
    if (view !== "taking" || submitted || !quizState) return;
    if (quizState.timeLeft <= 0) { setSubmitted(true); return; }
    const t = setInterval(() => {
      setQuizState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);
    return () => clearInterval(t);
  }, [view, submitted, quizState]);

  const submitQuiz = useCallback(() => {
    setSubmitted(true);
  }, []);

  const score = useMemo(() => {
    if (!submitted || !quizState) return 0;
    return quizState.questions.reduce((s, q) => s + (answers[q.id] === q.ans ? 1 : 0), 0);
  }, [submitted, quizState, answers]);

  if (view === "taking" && activeQuiz && quizState) {
    const mm = String(Math.floor(quizState.timeLeft/60)).padStart(2,"0");
    const ss = String(quizState.timeLeft%60).padStart(2,"0");
    const totalQ = quizState.questions.length;

    if (submitted) {
      const pct = Math.round((score/totalQ)*100);
      return (
        <div>
          <div style={{ background:COLORS.surface, borderRadius:16, border:`1px solid ${COLORS.border}`, padding:32, maxWidth:480, margin:"0 auto", textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>{pct>=60?"🎉":"😔"}</div>
            <h3 style={{ fontFamily:FONTS.serif, fontSize:22, marginBottom:8 }}>Quiz Complete!</h3>
            <div style={{ fontSize:36, fontWeight:700, color:pct>=60?COLORS.green:COLORS.red, fontFamily:FONTS.serif, marginBottom:4 }}>{score}/{totalQ}</div>
            <div style={{ fontSize:14, color:COLORS.muted, marginBottom:20 }}>{pct}% · {pct>=60?"Passed":"Failed"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              <div style={{ background:COLORS.bg, borderRadius:8, padding:12 }}>
                <div style={{ fontSize:22, fontWeight:700, color:COLORS.green }}>{score}</div>
                <div style={{ fontSize:11, color:COLORS.muted }}>Correct</div>
              </div>
              <div style={{ background:COLORS.bg, borderRadius:8, padding:12 }}>
                <div style={{ fontSize:22, fontWeight:700, color:COLORS.red }}>{totalQ-score}</div>
                <div style={{ fontSize:11, color:COLORS.muted }}>Wrong</div>
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              {quizState.questions.map((q, i) => (
                <div key={q.id} style={{ textAlign:"left", padding:"10px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:6 }}>Q{i+1}. {q.q}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {q.opts.map((opt, oi) => {
                      const isCorrect = oi === q.ans;
                      const isChosen  = answers[q.id] === oi;
                      return (
                        <span key={oi} style={{
                          fontSize:12, padding:"3px 10px", borderRadius:100,
                          background:isCorrect?"rgba(42,107,74,0.12)":isChosen&&!isCorrect?"rgba(122,26,26,0.1)":"rgba(28,27,23,0.04)",
                          color:isCorrect?COLORS.green:isChosen&&!isCorrect?COLORS.red:COLORS.muted,
                          fontWeight:isCorrect||isChosen?700:400,
                          border:`1px solid ${isCorrect?"rgba(42,107,74,0.3)":isChosen&&!isCorrect?"rgba(122,26,26,0.3)":COLORS.faint}`,
                        }}>
                          {isCorrect?"✓ ":isChosen&&!isCorrect?"✗ ":""}{opt}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <Btn variant="green" onClick={()=>{setView("quizzes");setActiveQuiz(null);setQuizState(null);}} style={{ width:"100%", justifyContent:"center" }}>Back to Quizzes</Btn>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, background:COLORS.surface, padding:"14px 18px", borderRadius:12, border:`1px solid ${COLORS.border}` }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{activeQuiz.title}</div>
            <div style={{ fontSize:12, color:COLORS.muted }}>{Object.keys(answers).length}/{totalQ} answered</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:FONTS.mono, color:quizState.timeLeft<60?COLORS.red:COLORS.green }}>{mm}:{ss}</div>
            <Btn variant="green" size="sm" onClick={submitQuiz}>Submit</Btn>
          </div>
        </div>
        <ProgressBar value={Object.keys(answers).length} max={totalQ} />
        <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:16 }}>
          {quizState.questions.map((q, i) => (
            <div key={q.id} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${answers[q.id]!==undefined?COLORS.green:COLORS.border}`, padding:18 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Q{i+1}. {q.q}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {q.opts.map((opt, oi) => (
                  <button key={oi} onClick={()=>setAnswers(prev=>({...prev,[q.id]:oi}))} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8,
                    border:`1.5px solid ${answers[q.id]===oi?COLORS.green:COLORS.faint}`,
                    background:answers[q.id]===oi?COLORS.greenMuted:"transparent",
                    cursor:"pointer", textAlign:"left", fontFamily:FONTS.sans, fontSize:13,
                    color:answers[q.id]===oi?COLORS.green:COLORS.dark, transition:"all 0.15s",
                  }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${answers[q.id]===oi?COLORS.green:COLORS.faint}`, background:answers[q.id]===oi?COLORS.green:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {answers[q.id]===oi && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }} />}
                    </div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Assessments & Quizzes"
        subtitle="MCQ tests, question banks and results"
        action={<Btn variant="green" size="sm">+ Create Quiz</Btn>}
      />
      <TabBar
        tabs={[{id:"quizzes",label:"All Quizzes"},{id:"results",label:"Results History"}]}
        active={view}
        onChange={setView}
      />
      <div style={{ marginTop:20 }}>
        {view === "quizzes" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {DEMO.quizzes.map(quiz => (
              <div key={quiz.id} style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700 }}>{quiz.title}</div>
                    <div style={{ fontSize:12, color:COLORS.muted, marginTop:3 }}>
                      {quiz.subject} · Class {quiz.class} · {quiz.questions} questions · {quiz.timeLimit} min · Max: {quiz.maxMarks} marks · Pass: {quiz.passingMarks}
                    </div>
                    <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>By: {quiz.createdBy} · {quiz.attempts} attempts</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Badge status={quiz.status}>{quiz.status}</Badge>
                    {quiz.status === "Active" && (
                      <Btn variant="green" size="sm" onClick={() => startQuiz(quiz)}>Attempt Now</Btn>
                    )}
                    <Btn variant="outline" size="sm">Edit</Btn>
                  </div>
                </div>
                {quiz.attempts > 0 && (
                  <div style={{ marginTop:12, display:"flex", gap:16, padding:"10px 14px", background:COLORS.bg, borderRadius:8 }}>
                    <div><span style={{ fontSize:12, color:COLORS.muted }}>Avg Score: </span><span style={{ fontWeight:700, color:COLORS.green }}>{quiz.avgScore}/{quiz.maxMarks}</span></div>
                    <div><span style={{ fontSize:12, color:COLORS.muted }}>Completion: </span><span style={{ fontWeight:700 }}>{quiz.attempts} students</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === "results" && (
          <DataTable
            columns={[
              { key:"studentName", label:"Student", render:(v) => (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Avatar name={v} size={26} />
                  <span style={{ fontWeight:600 }}>{v}</span>
                </div>
              )},
              { key:"quizTitle",  label:"Quiz",       muted:true },
              { key:"score",      label:"Score",       render:(v,r) => <span style={{ fontWeight:700, color:COLORS.green }}>{v}/{r.maxMarks}</span> },
              { key:"percentage", label:"%",           render:(v) => <span style={{ fontWeight:700, color:v>=60?COLORS.green:COLORS.red }}>{v}%</span> },
              { key:"correct",    label:"Correct",     mono:true },
              { key:"wrong",      label:"Wrong",       mono:true },
              { key:"date",       label:"Date",        muted:true },
              { key:"passed",     label:"Result",      render:(v) => <Badge status={v?"Approved":"Rejected"}>{v?"Passed":"Failed"}</Badge> },
            ]}
            data={DEMO.quizResults}
          />
        )}
      </div>
    </div>
  );
});

// ==================== SUBMISSION PORTAL ====================
const SubmissionPortal = memo(function SubmissionPortal() {
  const [submissions, setSubmissions] = useState(DEMO.submissions);
  const { query, setQuery, filtered } = useSearch(submissions, ["studentName","title","type"]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title:"", type:"Assignment", file:null });

  const displayed = useMemo(() =>
    typeFilter==="all" ? filtered : filtered.filter(s => s.type===typeFilter), [filtered, typeFilter]);

  const handleStatusChange = useCallback((id, status) => {
    setSubmissions(prev => prev.map(s => s.id===id ? {...s, status} : s));
  }, []);

  const columns = useMemo(() => [
    { key:"studentName", label:"Student", render:(v,r) => (
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <Avatar name={v} size={28} />
        <div><div style={{ fontWeight:600 }}>{v}</div><div style={{ fontSize:11, color:COLORS.muted }}>{r.class}</div></div>
      </div>
    )},
    { key:"type",         label:"Type",      render:(v)=><Badge status={v==="Leave"?"warning":v==="Document"?"info":"success"}>{v}</Badge> },
    { key:"title",        label:"Title",     render:(v)=><span style={{ fontWeight:500 }}>{v}</span> },
    { key:"fileType",     label:"Format",    mono:true, muted:true },
    { key:"size",         label:"Size",      muted:true },
    { key:"submittedAt",  label:"Submitted", muted:true },
    { key:"status",       label:"Status",    render:(v)=><Badge status={v}>{v}</Badge> },
    { key:"id",           label:"Action",    render:(_,r)=>(
      <div style={{ display:"flex", gap:6 }}>
        {r.status==="Pending" || r.status==="Under Review" ? (
          <>
            <Btn variant="green"  size="sm" onClick={e=>{e.stopPropagation();handleStatusChange(r.id,"Approved");}}>Approve</Btn>
            <Btn variant="danger" size="sm" onClick={e=>{e.stopPropagation();handleStatusChange(r.id,"Rejected");}}>Reject</Btn>
          </>
        ) : (
          <Btn variant="ghost" size="sm">View</Btn>
        )}
      </div>
    )},
  ], [handleStatusChange]);

  const stats = useMemo(() => ({
    total:       submissions.length,
    pending:     submissions.filter(s=>s.status==="Pending"||s.status==="Under Review").length,
    approved:    submissions.filter(s=>s.status==="Approved").length,
    rejected:    submissions.filter(s=>s.status==="Rejected").length,
  }), [submissions]);

  return (
    <div>
      <SectionHeader
        title="Student Submission Portal"
        subtitle="Assignments, documents and leave requests from students"
        action={<Btn variant="green" size="sm" onClick={()=>setUploadModal(true)}>+ New Submission</Btn>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <StatCard label="Total"     value={stats.total}    color={COLORS.navy}   />
        <StatCard label="Pending"   value={stats.pending}  color={COLORS.amber}  />
        <StatCard label="Approved"  value={stats.approved} color={COLORS.green}  />
        <StatCard label="Rejected"  value={stats.rejected} color={COLORS.red}    />
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200 }}>
          <SearchBar value={query} onChange={setQuery} placeholder="Search submissions…" />
        </div>
        {["all","Assignment","Document","Leave"].map(t=>(
          <button key={t} onClick={()=>setTypeFilter(t)} style={{
            padding:"7px 14px", borderRadius:100, border:`1.5px solid ${typeFilter===t?COLORS.green:COLORS.faint}`,
            background:typeFilter===t?COLORS.greenMuted:"transparent", color:typeFilter===t?COLORS.green:COLORS.dark,
            fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONTS.sans,
          }}>{t==="all"?"All Types":t}</button>
        ))}
      </div>
      <DataTable columns={columns} data={displayed} />
      <Modal open={uploadModal} onClose={()=>setUploadModal(false)} title="New Submission" width={440}>
        <div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["Title","title"]].map(([l,k])=>(
              <div key={k}>
                <label style={{ fontSize:11, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>{l}</label>
                <input value={uploadForm[k]} onChange={e=>setUploadForm(f=>({...f,[k]:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, fontSize:13, fontFamily:FONTS.sans, background:COLORS.bg, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>Submission Type</label>
              <select value={uploadForm.type} onChange={e=>setUploadForm(f=>({...f,type:e.target.value}))}
                style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, fontSize:13, fontFamily:FONTS.sans, background:COLORS.bg }}>
                <option>Assignment</option>
                <option>Document</option>
                <option>Leave</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>File</label>
              <div style={{ border:`2px dashed ${COLORS.faint}`, borderRadius:8, padding:"24px 16px", textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>📎</div>
                <div style={{ fontSize:13, color:COLORS.muted }}>Click to upload or drag & drop</div>
                <div style={{ fontSize:11, color:COLORS.muted, marginTop:4 }}>PDF, DOCX, Images, ZIP (max 10MB)</div>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <Btn variant="outline" onClick={()=>setUploadModal(false)} style={{ flex:1, justifyContent:"center" }}>Cancel</Btn>
            <Btn variant="green" onClick={()=>setUploadModal(false)} style={{ flex:1, justifyContent:"center" }}>Submit</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
});

// ==================== EXISTING MODULES ====================
const AttendanceModule = memo(function AttendanceModule() {
  return <QRAttendanceModule />;
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
      <div style={{ background:"rgba(42,107,74,0.06)", border:`1px solid rgba(42,107,74,0.15)`, borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
        <p style={{ fontSize:13, color:"#1B4D3E", lineHeight:1.7 }}>
          🔀 <strong>Unique Assignment Generation:</strong> Each student receives a differently shuffled version — different question order, MCQ option order, and numerical values — to reduce copying.
        </p>
      </div>
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
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <Btn variant="outline" size="sm">View Submissions</Btn>
                <Btn variant="ghost"   size="sm">🔀 Shuffle & Send</Btn>
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
          📱 <strong>Note:</strong> In production, parents log in separately and see only their child's data. WhatsApp alerts sent automatically for attendance, fees, and assignments.
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
          </div>
        )}
      </div>
    </div>
  );
});

// ==================== ANALYTICS MODULE ====================
const AnalyticsModule = memo(function AnalyticsModule() {
  const monthlyFees = [
    { month:"Jan", collected:280000 },
    { month:"Feb", collected:320000 },
    { month:"Mar", collected:450000 },
    { month:"Apr", collected:180000 },
    { month:"May", collected:290000 },
    { month:"Jun", collected:95000 },
  ];
  const maxFee = Math.max(...monthlyFees.map(m=>m.collected));

  const quizPerf = [
    { name:"Arjun", score:90 }, { name:"Priya", score:80 },
    { name:"Sneha", score:76 }, { name:"Dev",   score:88 },
    { name:"Kavya", score:67 }, { name:"Rohan", score:72 },
  ];

  return (
    <div>
      <SectionHeader title="Analytics Dashboard" subtitle="Real-time school performance metrics" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard label="Students"     value={DEMO.students.length}   color={COLORS.navy}   />
        <StatCard label="Staff"        value={DEMO.staff.length}      color={COLORS.green}  />
        <StatCard label="Avg Attend."  value="93.4%"                  color={COLORS.purple} />
        <StatCard label="Fee Rate"     value="81%"                    color={COLORS.green}  />
        <StatCard label="Active LMS"   value={DEMO.courses.length}    color={COLORS.navy}   sub="courses" />
        <StatCard label="Quiz Taken"   value={DEMO.quizResults.length}color={COLORS.amber}  sub="results" />
        <StatCard label="Submissions"  value={DEMO.submissions.length}color={COLORS.purple} />
        <StatCard label="Receipts"     value={DEMO.receipts.length}   color={COLORS.green}  />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14, fontFamily:FONTS.serif }}>Monthly Fee Collection Trend</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:100 }}>
            {monthlyFees.map((m,i)=>(
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:9, fontWeight:600, color:COLORS.green }}>{fmtINR(m.collected).replace("₹","")}</span>
                <div style={{ width:"100%", background:"rgba(42,107,74,0.1)", borderRadius:4, height:72, position:"relative" }}>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, background:`linear-gradient(to top,${COLORS.green},${COLORS.greenLight})`, borderRadius:4, height:`${Math.round((m.collected/maxFee)*100)}%`, transition:"height 1s ease" }} />
                </div>
                <span style={{ fontSize:9, color:COLORS.muted }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14, fontFamily:FONTS.serif }}>Quiz Performance</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {quizPerf.map((q,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, color:COLORS.muted, width:44, flexShrink:0 }}>{q.name}</span>
                <div style={{ flex:1, height:16, background:"rgba(28,27,23,0.06)", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${q.score}%`, background:q.score>=80?`linear-gradient(to right,${COLORS.green},${COLORS.greenLight})`:q.score>=60?`linear-gradient(to right,${COLORS.amber},#F59E0B)`:`linear-gradient(to right,${COLORS.red},#EF4444)`, borderRadius:4, transition:"width 0.8s ease" }} />
                </div>
                <span style={{ fontSize:11, fontWeight:700, width:32, color:q.score>=80?COLORS.green:q.score>=60?COLORS.amber:COLORS.red }}>{q.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14, fontFamily:FONTS.serif }}>Attendance by Class</div>
          {[["X-A",97],["IX-B",91],["XI-C",89],["XII-A",85]].map(([cls,pct],i)=>(
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:500 }}>{cls}</span>
                <span style={{ fontSize:12, fontWeight:700, color:pct>=90?COLORS.green:COLORS.amber }}>{pct}%</span>
              </div>
              <ProgressBar value={pct} color={pct>=90?COLORS.green:COLORS.amber} height={6} />
            </div>
          ))}
        </div>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14, fontFamily:FONTS.serif }}>Fee Status Distribution</div>
          {[["Paid",5,COLORS.green],["Partial",1,COLORS.amber],["Pending",1,COLORS.red],["Overdue",1,COLORS.red]].map(([s,n,c],i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:c }} />
                <span style={{ fontSize:12 }}>{s}</span>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:c }}>{n}</span>
            </div>
          ))}
        </div>
        <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14, fontFamily:FONTS.serif }}>Submission Status</div>
          {[["Approved",3,COLORS.green],["Pending",1,COLORS.amber],["Under Review",1,COLORS.amber],["Rejected",1,COLORS.red]].map(([s,n,c],i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:c }} />
                <span style={{ fontSize:12 }}>{s}</span>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:c }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ==================== DASHBOARD OVERVIEW ====================
const DashboardOverview = memo(function DashboardOverview() {
  const { present, late, absent, total } = DEMO.todayAttendance;
  const attPct       = Math.round((present/total)*100);
  const feeCollected = DEMO.fees.reduce((s,f)=>s+f.paid,0);
  const feePending   = DEMO.fees.reduce((s,f)=>s+f.due,0);
  const feeTotal     = feeCollected+feePending;
  const feePct       = Math.round((feeCollected/feeTotal)*100);
  return (
    <div>
      <SectionHeader title="School Overview" subtitle="Wednesday, June 7, 2026 · Live dashboard" />
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
      <div style={{ background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:20, marginBottom:16 }}>
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
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:10 }}>
        {[
          { icon:"◈", label:"Take Attendance", color:COLORS.green  },
          { icon:"◇", label:"Add Student",     color:COLORS.navy   },
          { icon:"◎", label:"Record Fee",      color:COLORS.purple },
          { icon:"📚", label:"Open LMS",       color:"#7A3A00"     },
          { icon:"📝", label:"Create Quiz",    color:COLORS.green  },
          { icon:"🔔", label:"Send Alert",     color:COLORS.red    },
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
  const isOwner = user?.email === OWNER_EMAIL;

  useEffect(() => {
    if (isOwner) { setDaysLeft(999); return; }
    const expiry = toDate(trialExpiryDate);
    if (!expiry) return;
    const left = Math.ceil((expiry - new Date()) / (1000*60*60*24));
    if (left <= 0) setExpired(true);
    else setDaysLeft(left);
  }, [trialExpiryDate, isOwner]);

  const handleContactSubmit = useCallback(async (e) => {
    e.preventDefault();
    setContactStatus("sending");
    try {
      await addDoc(collection(db,"salesLeads"), {
        ...contactForm, source:"demo_expired", uid:user?.uid, createdAt:serverTimestamp(),
      });
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
    receipts:      <ReceiptModule />,
    lms:           <LMSModule />,
    assessments:   <AssessmentModule />,
    submissions:   <SubmissionPortal />,
    exams:         <ExamModule />,
    assignments:   <AssignmentModule />,
    parents:       <ParentPortal />,
    notifications: <NotificationCenter />,
    reports:       <ReportsModule />,
    analytics:     <AnalyticsModule />,
  }), []);

  if (expired && !isOwner && contactStatus !== "success") {
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
              <div style={{ fontSize:9, letterSpacing:"0.1em", color:"rgba(247,245,239,0.35)", textTransform:"uppercase" }}>
                {isOwner ? "Owner Portal" : "Demo Portal"}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(247,245,239,0.07)", minWidth:220 }}>
          {user?.photoURL && <img src={user.photoURL} alt="profile" style={{ width:28, height:28, borderRadius:"50%", marginBottom:6 }} />}
          {sidebarOpen && (
            <>
              <div style={{ fontSize:11, fontWeight:600, color:"#F7F5EF" }}>{user?.displayName || "Demo User"}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:isOwner?"#F59E0B":daysLeft>3?"#5AC87A":COLORS.amber }} />
                <span style={{ fontSize:10, color:"rgba(247,245,239,0.4)" }}>
                  {isOwner ? "Owner — Unlimited" : `${daysLeft}d trial left`}
                </span>
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
            <p style={{ fontSize:11, color:COLORS.muted, marginTop:1 }}>June 7, 2026 · Demo Environment</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {isOwner && (
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:100, padding:"5px 12px" }}>
                <span style={{ fontSize:10, fontWeight:700, color:"#7A5000", letterSpacing:"0.07em" }}>👑 OWNER</span>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:6, background:COLORS.greenMuted, border:`1px solid rgba(42,107,74,0.18)`, borderRadius:100, padding:"5px 12px" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green }} />
              <span style={{ fontSize:10, fontWeight:700, color:"#1B5C3A", letterSpacing:"0.07em" }}>DEMO</span>
            </div>
          </div>
        </div>
        <div style={{ padding:24 }}>
          {moduleMap[activeTab]}
        </div>
      </div>
    </div>
  );
});

// ==================== DEMO PAGE WRAPPER ====================
const DemoPage = memo(function DemoPage({ user, trialExpiryDate, onSignOut, onBack }) {
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const isOwner = user?.email === OWNER_EMAIL;

  useEffect(() => {
    if (!user) return;
    logDemoVisitToSheets({
      name: user.displayName, email: user.email, uid: user.uid,
      timestamp: new Date().toISOString(),
      trialExpiry: trialExpiryDate instanceof Date ? trialExpiryDate.toISOString() : String(trialExpiryDate),
      userAgent: navigator.userAgent, event: "demo_opened_v6",
    });
  }, []);

  const daysLeft = useMemo(() => {
    if (isOwner) return 999;
    const expiry = toDate(trialExpiryDate);
    if (!expiry) return 7;
    return Math.max(0, Math.ceil((expiry - new Date()) / (1000*60*60*24)));
  }, [trialExpiryDate, isOwner]);

  return (
    <div style={{ fontFamily:FONTS.sans, background:COLORS.bg, minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(28,27,23,0.18); border-radius:3px; }
      `}</style>
      {showTrialBanner && !isOwner && daysLeft <= 3 && daysLeft > 0 && (
        <div style={{ background:COLORS.amber, color:"#F7F5EF", padding:"10px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:600 }}>⚠️ {daysLeft} day{daysLeft!==1?"s":""} left in your free trial. Contact us to upgrade.</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{}} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", borderRadius:6, padding:"4px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Upgrade Now</button>
            <button onClick={()=>setShowTrialBanner(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:18 }}>✕</button>
          </div>
        </div>
      )}
      <nav style={{ height:62, background:COLORS.surface, borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ fontFamily:FONTS.serif, fontSize:18, color:COLORS.dark }}>NexaAttend</div>
          <div style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green }} />
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {user?.photoURL && <img src={user.photoURL} alt="profile" style={{ width:30, height:30, borderRadius:"50%", border:`2px solid ${COLORS.green}` }} />}
          <div style={{ fontSize:13 }}>
            <div style={{ fontWeight:600 }}>{user?.displayName}</div>
            <div style={{ fontSize:11, color:COLORS.muted }}>{isOwner ? "Owner — Unlimited Access" : `${daysLeft}d trial remaining`}</div>
          </div>
          <button onClick={onSignOut} style={{ background:"none", border:`1.5px solid ${COLORS.faint}`, borderRadius:8, padding:"7px 14px", fontSize:12, cursor:"pointer", fontFamily:FONTS.sans, color:COLORS.dark }}>Sign out</button>
        </div>
      </nav>
      <DemoDashboard
        user={user}
        trialExpiryDate={trialExpiryDate}
        onSignOut={onSignOut}
        onClose={onBack}
        isFullPage={true}
      />
    </div>
  );
});

// ==================== INQUIRY FORM ====================
const InquiryForm = memo(function InquiryForm() {
  const [step, setStep]     = useState(1);
  const [status, setStatus] = useState("idle");
  const [focused, setFocused] = useState(null);
  const [form, setForm] = useState({
    name:"", phone:"", email:"", school:"", city:"",
    students:"", board:"", hear:"", plan:"standard", message:"",
  });
  const [errors, setErrors] = useState({});

  const setF = useCallback(k => e => setForm(f => ({...f,[k]:e.target.value})), []);
  const iSt  = useCallback(k => ({
    width:"100%", padding:"10px 14px", border:`1.5px solid ${focused===k?COLORS.green:errors[k]?COLORS.red:COLORS.faint}`,
    borderRadius:9, fontSize:13.5, background:"#FAFAF8", color:COLORS.dark,
    fontFamily:FONTS.sans, outline:"none", transition:"border-color 0.18s", boxSizing:"border-box",
  }), [focused, errors]);
  const lSt = { fontSize:12, fontWeight:700, color:COLORS.muted, display:"block", marginBottom:6, letterSpacing:"0.04em" };
  const eSt = { fontSize:11, color:COLORS.red, display:"block", marginTop:4 };
  const sOpt = useCallback(k => ({...iSt(k), appearance:"none", cursor:"pointer"}), [iSt]);

  const planOpts = [
    { v:"basic",    l:"Basic",    sub:"Up to 300", price:"₹6,000/mo", c:COLORS.navy    },
    { v:"standard", l:"Standard", sub:"Up to 600", price:"₹9,000/mo", c:COLORS.green   },
    { v:"premium",  l:"Premium",  sub:"Up to 999", price:"₹12,000/mo",c:COLORS.purple  },
  ];

  const validate = useCallback((s) => {
    const e = {};
    if (s===1) {
      if (!form.name.trim())                      e.name  = "Full name is required";
      if (!/^[6-9]\d{9}$/.test(form.phone.trim()))e.phone = "Enter a valid 10-digit mobile number";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    }
    if (s===2) {
      if (!form.school.trim())  e.school  = "School name is required";
      if (!form.city.trim())    e.city    = "City is required";
      if (!form.students)       e.students= "Please select student count";
    }
    return e;
  }, [form]);

  const next = useCallback(() => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s+1);
  }, [validate, step]);

  const submit = useCallback(async () => {
    setStatus("sending");
    try {
      await addDoc(collection(db,"inquiries"), {
        ...form, source:"landing_v6", createdAt:serverTimestamp(),
        userAgent: navigator.userAgent,
      });
      try {
        const p = new URLSearchParams({ ...form, source:"landing_v6", timestamp:new Date().toISOString() });
        await fetch(`${INQUIRY_SHEET_URL}?${p.toString()}`, { method:"GET", mode:"no-cors" });
      } catch {}
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [form]);

  if (status==="success") {
    return (
      <div style={{ background:COLORS.surface, borderRadius:16, padding:32, textAlign:"center", boxShadow:"0 4px 24px rgba(28,27,23,0.08)" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(42,107,74,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={COLORS.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 style={{ fontFamily:FONTS.serif, fontSize:22, marginBottom:8 }}>Thank you, {form.name.split(" ")[0]}!</h3>
        <p style={{ color:COLORS.muted, lineHeight:1.7 }}>Our team will call you within 24 hours to schedule a visit to <strong>{form.school}</strong>.</p>
      </div>
    );
  }

  return (
    <div style={{ background:COLORS.surface, borderRadius:16, padding:32, boxShadow:"0 4px 24px rgba(28,27,23,0.08)" }}>
      <div style={{ display:"flex", gap:8, marginBottom:28 }}>
        {[1,2,3].map(s=>(
          <div key={s} style={{ flex:1, height:4, borderRadius:4, background:s<=step?COLORS.green:"rgba(28,27,23,0.08)", transition:"background 0.3s" }} />
        ))}
      </div>
      {step===1 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[["name","Full Name"],["email","Email Address"]].map(([k,p]) => (
            <div key={k} style={{ gridColumn:k==="name"?"1/-1":undefined }}>
              <label style={lSt}>{p}{["name","phone"].includes(k)&&<span style={{color:"#C0392B"}}> *</span>}</label>
              <input type={k==="email"?"email":"text"} placeholder={p} value={form[k]} onChange={setF(k)} onFocus={()=>setFocused(k)} onBlur={()=>setFocused(null)} style={iSt(k)} />
              {errors[k]&&<span style={eSt}>{errors[k]}</span>}
            </div>
          ))}
          <div style={{ gridColumn:"1/-1" }}>
            <label style={lSt}>Mobile Number <span style={{color:"#C0392B"}}>*</span></label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:13.5, color:COLORS.muted, pointerEvents:"none" }}>+91</span>
              <input type="tel" placeholder="10-digit mobile" value={form.phone} onChange={setF("phone")} onFocus={()=>setFocused("phone")} onBlur={()=>setFocused(null)} style={{...iSt("phone"), paddingLeft:44}} />
            </div>
            {errors.phone&&<span style={eSt}>{errors.phone}</span>}
          </div>
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
async function syncUserProfile(fbUser, setExpiry, currentUidRef) {
  const TIMEOUT_MS = 5000;
  const withTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), ms)
    );
    return Promise.race([promise, timeout]);
  };
  try {
    if (currentUidRef.current !== fbUser.uid) return;
    const ref  = doc(db, "users", fbUser.uid);
    const snap = await withTimeout(getDoc(ref), TIMEOUT_MS);
    if (currentUidRef.current !== fbUser.uid) return;
    let exp;
    if (!snap.exists()) {
      exp = new Date();
      exp.setDate(exp.getDate() + 7);
      setDoc(ref, {
        uid:             fbUser.uid,
        displayName:     fbUser.displayName,
        email:           fbUser.email,
        photoURL:        fbUser.photoURL,
        firstLoginDate:  new Date().toISOString(),
        trialExpiryDate: exp.toISOString(),
        lastLogin:       new Date().toISOString(),
      }, { merge: true }).catch(e =>
        console.warn("[NexaAttend] setDoc failed (non-fatal):", e.message)
      );
    } else {
      setDoc(ref, { lastLogin: new Date().toISOString() }, { merge: true }).catch(() => {});
      exp = toDate(snap.data().trialExpiryDate);
    }
    if (currentUidRef.current !== fbUser.uid) return;
    setExpiry(exp);
  } catch (err) {
    console.warn("[NexaAttend] Firestore profile sync failed (applying fallback):", err.message);
    if (currentUidRef.current === fbUser.uid) {
      const fallbackExp = new Date();
      fallbackExp.setDate(fallbackExp.getDate() + 7);
      setExpiry(fallbackExp);
    }
  }
}

// ==================== LANDING PAGE SUB-COMPONENTS ====================
const PricingCard = memo(function PricingCard({ plan, onSelect, isSelected, isDark = false }) {
  const bg    = isDark ? COLORS.dark : COLORS.surface;
  const fg    = isDark ? "#F7F5EF" : COLORS.dark;
  const muted = isDark ? "rgba(247,245,239,0.55)" : COLORS.muted;
  return (
    <div
      onClick={() => onSelect(plan.id)}
      style={{
        background: bg, color: fg, borderRadius: 18,
        padding: 28, cursor: "pointer", position: "relative",
        border: `2px solid ${isSelected ? plan.color : (isDark ? "rgba(247,245,239,0.08)" : COLORS.border)}`,
        transition: "all 0.25s", height: "100%",
        transform: isSelected ? "translateY(-4px)" : "none",
        boxShadow: isSelected ? `0 20px 40px ${plan.color}25` : "none",
      }}
    >
      {plan.badge && (
        <div style={{
          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
          background: plan.color, color: "#F7F5EF", borderRadius: 100,
          padding: "4px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
        }}>{plan.badge.toUpperCase()}</div>
      )}
      <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, letterSpacing: "0.1em", marginBottom: 8 }}>{plan.name.toUpperCase()}</div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontFamily: FONTS.serif, fontSize: 36, fontWeight: 700 }}>₹{(plan.monthly/1000).toFixed(0)}K</span>
        <span style={{ fontSize: 13, color: muted, marginLeft: 4 }}>/month</span>
      </div>
      <div style={{ fontSize: 12, color: muted, marginBottom: 20 }}>Up to {plan.students} students · {plan.features.length} features</div>
      <div style={{ height: 1, background: isDark ? "rgba(247,245,239,0.1)" : COLORS.border, margin: "20px 0" }} />
      <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 22 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: isDark ? "rgba(247,245,239,0.85)" : COLORS.muted, marginBottom: 9, lineHeight: 1.5 }}>
            <span style={{ color: plan.color, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div style={{
        background: plan.color, color: "#F7F5EF", borderRadius: 10,
        padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: 13,
        fontFamily: FONTS.sans, transition: "transform 0.18s",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
      onMouseLeave={e => e.currentTarget.style.transform = ""}
      >Choose {plan.name}</div>
    </div>
  );
});

const FaqItem = memo(function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div style={{
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "20px 0",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", gap: 16, background: "none", border: "none",
          padding: 0, cursor: "pointer", textAlign: "left", fontFamily: FONTS.sans,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.dark, lineHeight: 1.5 }}>{q}</span>
        <span style={{
          width: 24, height: 24, borderRadius: "50%",
          background: isOpen ? COLORS.green : "rgba(28,27,23,0.06)",
          color: isOpen ? "#F7F5EF" : COLORS.dark,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0, transition: "all 0.2s", marginTop: 1,
        }}>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.75, marginTop: 12, paddingRight: 40 }}>
          {a}
        </div>
      )}
    </div>
  );
});

// ==================== MAIN APP COMPONENT ====================
export default function App() {
  const [hash, setHash] = useState(window.location.hash.slice(1) || "/");
  const hashRef = useRef(hash);
  useEffect(() => { hashRef.current = hash; }, [hash]);

  useEffect(() => {
    const fn = () => {
      const h = window.location.hash.slice(1) || "/";
      setHash(h);
      hashRef.current = h;
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  const nav = useCallback((path) => { window.location.hash = path; }, []);

  const [user,        setUser]       = useState(null);
  const [trialExpiry, setExpiry]     = useState(null);
  const [authReady,   setAuthReady]  = useState(false);
  const [authError,   setAuthError]  = useState(null);
  const [signingIn,   setSigningIn]  = useState(false);

  const navScrolled = useScroll();
  const [logIdx,    setLogIdx]    = useState(3);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selPlan,   setSelPlan]   = useState("standard");

  const currentUidRef = useRef(null);

  useEffect(() => {
    getRedirectResult(auth)
      .then(result => { if (result?.user) console.log("[NexaAttend] getRedirectResult → redirect sign-in:", result.user.email); })
      .catch(err => {
        const friendly = {
          "auth/popup-blocked":           "Your browser blocked the sign-in popup. Please allow popups and try again.",
          "auth/popup-closed-by-user":    "Sign-in was cancelled. Please try again.",
          "auth/unauthorized-domain":     "This domain is not authorised for sign-in. Please contact support.",
          "auth/network-request-failed":  "Network error during sign-in. Check your connection and try again.",
          "auth/cancelled-popup-request": "Sign-in request was cancelled. Please try again.",
        };
        setAuthError(friendly[err.code] || `Sign-in error: ${err.message}`);
      });

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      console.log("[NexaAttend] onAuthStateChanged →", fbUser ? `signed in: ${fbUser.email}` : "signed out");
      setUser(fbUser ?? null);
      setAuthReady(true);
      currentUidRef.current = fbUser?.uid || null;
      if (fbUser) {
        const currentHash = hashRef.current;
        if (currentHash === "/" || currentHash === "") nav("/demo");
        syncUserProfile(fbUser, setExpiry, currentUidRef);
      } else {
        setExpiry(null);
        if (hashRef.current === "/demo") nav("/");
      }
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setUser(null); setExpiry(null); setAuthError(null); nav("/");
      await firebaseSignOut(auth);
    } catch (err) { console.error("[NexaAttend] Sign-out failed:", err); }
  }, [nav]);

  const signIn = useCallback(async (forceRedirect = false) => {
    try {
      setAuthError(null); setSigningIn(true);
      if (forceRedirect) {
        sessionStorage.setItem("nexaattend_post_login_dest", "/demo");
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("[NexaAttend] Popup sign-in success:", result.user.email);
      }
    } catch (err) {
      let msg = `Sign-in error: ${err.message}`;
      if (err.code === "auth/popup-blocked") {
        msg = "Popup was blocked. Trying redirect sign-in…";
        try { sessionStorage.setItem("nexaattend_post_login_dest", "/demo"); await signInWithRedirect(auth, googleProvider); return; }
        catch (re) { msg = `Popup blocked and redirect also failed: ${re.message}`; }
      } else if (err.code === "auth/popup-closed-by-user") {
        msg = "Sign-in cancelled. Please try again.";
      } else if (err.code === "auth/cancelled-popup-request") {
        setSigningIn(false); return;
      }
      setAuthError(msg);
    } finally { setSigningIn(false); }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setLogIdx(i => (i >= DEMO.attendanceLogs.length ? i : i+1));
    }, 1900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.title = "School ERP Software in India | AI Attendance, Fees & Analytics | Nova Teach";
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  }, []);

  const plan = useMemo(() => PLANS.find(p => p.id===selPlan), [selPlan]);

  if (hash==="/privacy-policy") return <PrivacyPolicy onBack={() => nav("/")} />;
  if (hash==="/terms")          return <TermsOfService onBack={() => nav("/")} />;

  if (hash==="/demo") {
    if (!authReady) return <AuthLoadingScreen message="Loading your dashboard…" />;
    if (!user)      { nav("/"); return null; }
    if (trialExpiry === null) return <AuthLoadingScreen message="Loading your trial information…" />;
    return <DemoPage user={user} trialExpiryDate={trialExpiry} onSignOut={handleSignOut} onBack={() => nav("/")} />;
  }

  // ── Landing page ──
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

      <AuthErrorBanner error={authError} onDismiss={() => setAuthError(null)} onRetryWithPopup={() => signIn(false)} />

      {/* ───────────────  NAVBAR  ─────────────── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"0 5%", height:68,
        background:navScrolled?"rgba(247,245,239,0.96)":"transparent",
        backdropFilter:navScrolled?"blur(14px)":"none",
        borderBottom:navScrolled?`1px solid ${COLORS.border}`:"none",
        transition:"all 0.3s",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ fontFamily:FONTS.serif, fontSize:21, color:COLORS.dark, letterSpacing:"-0.02em", display:"flex", alignItems:"center", gap:8 }}>
          NexaAttend
          <div style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green, display:"inline-block" }} />
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:28 }}>
          {[
            { label:"Modules",   id:"modules"  },
            { label:"Live Demo", id:"demo"     },
            { label:"Plans",     id:"plans"    },
            { label:"FAQ",       id:"faq"      },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                background:"none", border:"none", padding:0,
                fontSize:13, fontWeight:500, fontFamily:FONTS.sans,
                color:COLORS.muted, cursor:"pointer", transition:"color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = COLORS.dark}
              onMouseLeave={e => e.currentTarget.style.color = COLORS.muted}
            >{item.label}</button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {user ? (
            <button onClick={() => nav("/demo")} style={{
              padding:"9px 18px", background:COLORS.dark, color:"#F7F5EF",
              border:"none", borderRadius:8, fontSize:13, fontWeight:600,
              cursor:"pointer", fontFamily:FONTS.sans, display:"flex", alignItems:"center", gap:6,
            }}>Open Dashboard →</button>
          ) : (
            <>
              <button onClick={() => signIn(false)} disabled={signingIn} style={{
                padding:"9px 14px", background:"transparent", color:COLORS.dark,
                border:"none", fontSize:13, fontWeight:500, cursor:signingIn?"not-allowed":"pointer",
                fontFamily:FONTS.sans, opacity:signingIn?0.6:1,
              }}>{signingIn ? "Signing in…" : "Sign in"}</button>
              <button onClick={() => scrollTo("contact")} style={{
                padding:"9px 18px", background:COLORS.dark, color:"#F7F5EF",
                border:"none", borderRadius:8, fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:FONTS.sans, display:"flex", alignItems:"center", gap:6,
              }}>
                Book Free Demo
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ───────────────  HERO  ─────────────── */}
      <section style={{ padding:"140px 5% 60px", position:"relative" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:48, alignItems:"center" }}>
          <div>
            <FadeIn>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:COLORS.greenMuted, border:"1px solid rgba(42,107,74,0.2)",
                borderRadius:100, padding:"5px 12px", marginBottom:22,
              }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green, animation:"pulse 2s infinite" }} />
                <span style={{ fontSize:11, fontWeight:700, color:COLORS.green, letterSpacing:"0.08em" }}>
                  AI-POWERED · OFFLINE-FIRST · BUILT FOR INDIA
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 style={{
                fontFamily:FONTS.serif,
                fontSize:"clamp(2.4rem, 5.4vw, 4.2rem)",
                lineHeight:1.05, letterSpacing:"-0.025em", marginBottom:18, color:COLORS.dark,
              }}>
                The complete <em style={{ fontStyle:"italic", color:COLORS.green }}>school ERP</em> that runs offline, on your premises.
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p style={{ fontSize:17, color:COLORS.muted, lineHeight:1.65, marginBottom:28, maxWidth:560 }}>
                AI face-recognition attendance, fee management, LMS, assessments, payroll, and parent WhatsApp alerts — all in one. Mark 30 students in 60 seconds, even without internet.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:36 }}>
                <button onClick={() => scrollTo("contact")} style={{
                  padding:"14px 26px", background:COLORS.dark, color:"#F7F5EF",
                  border:"none", borderRadius:10, fontSize:14, fontWeight:700,
                  cursor:"pointer", fontFamily:FONTS.sans, display:"flex", alignItems:"center", gap:8,
                }}>
                  Book a Free Demo
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button onClick={() => signIn(false)} disabled={signingIn} style={{
                  padding:"14px 26px", background:"transparent", color:COLORS.dark,
                  border:`1.5px solid ${COLORS.faint}`, borderRadius:10, fontSize:14, fontWeight:600,
                  cursor:signingIn?"not-allowed":"pointer", fontFamily:FONTS.sans, opacity:signingIn?0.6:1,
                }}>{signingIn ? "Signing in…" : "Try 7-Day Free Trial"}</button>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, maxWidth:540 }}>
                {[
                  { target:300, suffix:"+",  label:"Schools trust us"        },
                  { target:99,  suffix:"%",  label:"Face match accuracy"     },
                  { target:7,   suffix:" days", label:"Money-back guarantee" },
                  { target:24,  suffix:"/7", label:"Priority support"        },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily:FONTS.serif, fontSize:24, color:COLORS.dark, fontWeight:700, letterSpacing:"-0.02em" }}>
                      <AnimatedNumber target={s.target} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize:11, color:COLORS.muted, marginTop:2, lineHeight:1.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.25}>
            <div style={{ position:"relative" }}>
              <div style={{
                position:"absolute", inset:-16, background:"rgba(42,107,74,0.06)",
                borderRadius:24, filter:"blur(40px)", zIndex:0,
              }} />
              <div style={{ position:"relative", zIndex:1 }}>
                <InquiryForm />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────────  TRUST LOGOS  ─────────────── */}
      <section style={{ padding:"40px 5%", borderTop:`1px solid ${COLORS.border}`, borderBottom:`1px solid ${COLORS.border}`, background:COLORS.surface }}>
        <div style={{ maxWidth:1280, margin:"0 auto", textAlign:"center" }}>
          <p style={{ fontSize:11, fontWeight:700, color:COLORS.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:18 }}>
            Trusted by 300+ schools across India
          </p>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:48, flexWrap:"wrap", opacity:0.55 }}>
            {["Delhi Public","Ryan International","Kendriya Vidyalaya","DAV Public","Amity International","GD Goenka","Mount Carmel","La Martiniere"].map((n,i) => (
              <div key={i} style={{ fontFamily:FONTS.serif, fontSize:17, color:COLORS.muted, fontStyle:"italic" }}>{n}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────  MODULES  ─────────────── */}
      <section id="modules" style={{ padding:"80px 5%", background:COLORS.surface, borderBottom:`1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <div style={{ fontSize:11, fontWeight:700, color:COLORS.green, letterSpacing:"0.1em", marginBottom:12 }}>FEATURE MODULES</div>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(1.8rem, 3.5vw, 2.6rem)", letterSpacing:"-0.02em", marginBottom:12, color:COLORS.dark }}>
                Everything your school needs, in one system
              </h2>
              <p style={{ fontSize:15, color:COLORS.muted, maxWidth:600, margin:"0 auto", lineHeight:1.7 }}>
                Built for Indian schools. Works offline, syncs when online. No separate licenses, no hidden costs.
              </p>
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:20 }}>
            {MODULES_INFO.map((m, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div
                  style={{
                    background:COLORS.bg, borderRadius:14, padding:28,
                    border:`1px solid ${COLORS.border}`, height:"100%",
                    transition:"all 0.2s", cursor:"default",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(28,27,23,0.08)"; e.currentTarget.style.borderColor = `${m.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  <div style={{
                    width:48, height:48, borderRadius:12,
                    background:`${m.color}15`, color:m.color,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:22, fontWeight:700, marginBottom:18, fontFamily:FONTS.sans,
                  }}>{m.icon}</div>
                  <h3 style={{ fontFamily:FONTS.serif, fontSize:19, marginBottom:14, color:COLORS.dark, letterSpacing:"-0.01em" }}>{m.title}</h3>
                  <ul style={{ listStyle:"none", padding:0, margin:0 }}>
                    {m.features.map((f, fi) => (
                      <li key={fi} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:COLORS.muted, lineHeight:1.6, marginBottom:8 }}>
                        <span style={{ color:m.color, flexShrink:0, marginTop:1, fontWeight:700 }}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────  LIVE DEMO TICKER  ─────────────── */}
      <section id="demo" style={{ padding:"80px 5%" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1.2fr", gap:48, alignItems:"center" }}>
          <FadeIn>
            <div style={{ fontSize:11, fontWeight:700, color:COLORS.green, letterSpacing:"0.1em", marginBottom:12 }}>SEE IT IN ACTION</div>
            <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(1.7rem, 3.2vw, 2.4rem)", letterSpacing:"-0.02em", lineHeight:1.15, marginBottom:16, color:COLORS.dark }}>
              30 students, marked in 60 seconds.
            </h2>
            <p style={{ fontSize:15, color:COLORS.muted, lineHeight:1.7, marginBottom:24 }}>
              Watch attendance stream in real-time. No more roll calls, no paper registers, no proxy. Just walk past the camera — done.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
              {[
                { icon:"⚡", text:"AI face recognition under 2 seconds per student"        },
                { icon:"🔒", text:"Anti-proxy — works even with masks, glasses, hairstyles" },
                { icon:"📱", text:"Parents get WhatsApp alert within 30 seconds"            },
                { icon:"💾", text:"100% offline — never lose data on power cuts"            },
              ].map((p, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, fontSize:14, color:COLORS.dark }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => signIn(false)} disabled={signingIn} style={{
              padding:"12px 22px", background:COLORS.green, color:"#F7F5EF",
              border:"none", borderRadius:9, fontSize:13, fontWeight:700,
              cursor:signingIn?"not-allowed":"pointer", fontFamily:FONTS.sans,
              opacity:signingIn?0.6:1, display:"inline-flex", alignItems:"center", gap:6,
            }}>
              {signingIn ? "Signing in…" : "▶ Try the live demo"}
            </button>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div style={{
              background:COLORS.surface, borderRadius:16, border:`1px solid ${COLORS.border}`,
              overflow:"hidden", boxShadow:"0 8px 32px rgba(28,27,23,0.06)",
            }}>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:COLORS.dark }}>Live Attendance Feed</div>
                  <div style={{ fontSize:11, color:COLORS.muted, marginTop:1 }}>8:01 AM · X-A · IX-B · XI-C · XII-A</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:COLORS.green, animation:"pulse 1.5s infinite" }} />
                  <span style={{ fontSize:10, fontWeight:700, color:COLORS.green, letterSpacing:"0.07em" }}>LIVE</span>
                </div>
              </div>
              <div style={{ padding:8, maxHeight:380, overflowY:"auto" }}>
                {DEMO.attendanceLogs.slice(0, logIdx).map((log, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
                    borderRadius:8, animation:"fadeUp 0.4s ease",
                  }}>
                    <span style={{ fontSize:12, fontFamily:FONTS.mono, color:COLORS.muted, width:70, flexShrink:0 }}>{log.time}</span>
                    <Avatar name={log.name} size={28} />
                    <div style={{ flex:1, fontSize:13, fontWeight:500, color:COLORS.dark }}>{log.name}</div>
                    <div style={{ fontSize:11, color:COLORS.muted }}>Class {log.cls}</div>
                    <Badge status={log.status}>{log.status}</Badge>
                  </div>
                ))}
              </div>
              <div style={{ padding:"12px 18px", background:COLORS.bg, display:"flex", justifyContent:"space-between", fontSize:11, color:COLORS.muted, flexWrap:"wrap", gap:6 }}>
                <span>Showing {Math.min(logIdx, DEMO.attendanceLogs.length)} / {DEMO.attendanceLogs.length} entries</span>
                <span style={{ color:COLORS.green, fontWeight:600 }}>Auto-refreshes every 2s</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────────  PRICING  ─────────────── */}
      <section id="plans" style={{ padding:"80px 5%", background:COLORS.surface, borderTop:`1px solid ${COLORS.border}`, borderBottom:`1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <div style={{ fontSize:11, fontWeight:700, color:COLORS.green, letterSpacing:"0.1em", marginBottom:12 }}>SIMPLE PRICING</div>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(1.8rem, 3.5vw, 2.6rem)", letterSpacing:"-0.02em", marginBottom:12, color:COLORS.dark }}>
                Plans that grow with your school
              </h2>
              <p style={{ fontSize:15, color:COLORS.muted, maxWidth:560, margin:"0 auto", lineHeight:1.7 }}>
                One-time setup of <strong style={{color:COLORS.green}}>₹45,000</strong> <span style={{textDecoration:"line-through"}}>₹75,000</span> covers installation, cameras, training &amp; lifetime updates.
              </p>
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20 }}>
            {PLANS.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.1}>
                <PricingCard plan={p} onSelect={setSelPlan} isSelected={selPlan===p.id} isDark={p.id==="standard"} />
              </FadeIn>
            ))}
          </div>
          {plan && (
            <FadeIn>
              <div style={{ marginTop:32, padding:"20px 24px", background:COLORS.bg, borderRadius:12, border:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:COLORS.muted, letterSpacing:"0.08em" }}>SELECTED PLAN</div>
                  <div style={{ fontFamily:FONTS.serif, fontSize:22, fontWeight:700, color:COLORS.dark, marginTop:2 }}>
                    {plan.name} · ₹{plan.monthly.toLocaleString("en-IN")}/mo
                  </div>
                </div>
                <button onClick={() => scrollTo("contact")} style={{
                  padding:"12px 22px", background:plan.color, color:"#F7F5EF",
                  border:"none", borderRadius:9, fontSize:13, fontWeight:700,
                  cursor:"pointer", fontFamily:FONTS.sans, display:"flex", alignItems:"center", gap:6,
                }}>
                  Get Started with {plan.name}
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ───────────────  FAQ  ─────────────── */}
      <section id="faq" style={{ padding:"80px 5%" }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ fontSize:11, fontWeight:700, color:COLORS.green, letterSpacing:"0.1em", marginBottom:12 }}>QUESTIONS ANSWERED</div>
              <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(1.8rem, 3.5vw, 2.6rem)", letterSpacing:"-0.02em", marginBottom:12, color:COLORS.dark }}>
                Frequently asked
              </h2>
            </div>
          </FadeIn>
          <FadeIn>
            <div style={{ background:COLORS.surface, borderRadius:16, padding:"0 24px", border:`1px solid ${COLORS.border}` }}>
              {FAQS.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} isOpen={activeFaq===i} onToggle={() => setActiveFaq(activeFaq===i ? null : i)} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────────  CONTACT / CTA  ─────────────── */}
      <section id="contact" style={{ padding:"80px 5%", background:COLORS.dark, color:"#F7F5EF" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <FadeIn>
            <div style={{ fontSize:11, fontWeight:700, color:COLORS.greenLight, letterSpacing:"0.1em", marginBottom:12 }}>READY TO START?</div>
            <h2 style={{ fontFamily:FONTS.serif, fontSize:"clamp(1.8rem, 3.5vw, 2.6rem)", letterSpacing:"-0.02em", marginBottom:16, color:"#F7F5EF", lineHeight:1.15 }}>
              See NexaAttend in your school — in 3 days.
            </h2>
            <p style={{ fontSize:15, color:"rgba(247,245,239,0.7)", lineHeight:1.7, marginBottom:28 }}>
              Book a free 30-minute walkthrough. Our team will visit your school, demonstrate the product on your premises, and answer every question.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { icon:"✓", text:"7-day money-back guarantee"                },
                { icon:"✓", text:"On-site installation in 3 days"            },
                { icon:"✓", text:"Free face data enrollment for everyone"    },
                { icon:"✓", text:"Lifetime updates and priority support"     },
              ].map((p, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, fontSize:14, color:"rgba(247,245,239,0.85)" }}>
                  <span style={{ color:COLORS.greenLight, fontWeight:700 }}>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div style={{ background:"rgba(247,245,239,0.04)", borderRadius:18, padding:28, border:"1px solid rgba(247,245,239,0.08)" }}>
              <h3 style={{ fontFamily:FONTS.serif, fontSize:20, color:"#F7F5EF", marginBottom:18 }}>Quick contact</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <a href="tel:+919876543210" style={{ display:"flex", alignItems:"center", gap:12, color:"rgba(247,245,239,0.85)", textDecoration:"none", fontSize:14, padding:"12px 14px", background:"rgba(247,245,239,0.04)", borderRadius:10, border:"1px solid rgba(247,245,239,0.08)" }}>
                  <span style={{ fontSize:18 }}>📞</span>
                  <div>
                    <div style={{ fontSize:11, color:"rgba(247,245,239,0.5)" }}>Call us</div>
                    <div style={{ fontWeight:600, color:"#F7F5EF" }}>+91 98765 43210</div>
                  </div>
                </a>
                <a href="mailto:tishy5327@gmail.com" style={{ display:"flex", alignItems:"center", gap:12, color:"rgba(247,245,239,0.85)", textDecoration:"none", fontSize:14, padding:"12px 14px", background:"rgba(247,245,239,0.04)", borderRadius:10, border:"1px solid rgba(247,245,239,0.08)" }}>
                  <span style={{ fontSize:18 }}>✉️</span>
                  <div>
                    <div style={{ fontSize:11, color:"rgba(247,245,239,0.5)" }}>Email</div>
                    <div style={{ fontWeight:600, color:"#F7F5EF" }}>tishy5327@gmail.com</div>
                  </div>
                </a>
                <a href="https://wa.me/919876543210" style={{ display:"flex", alignItems:"center", gap:12, color:"rgba(247,245,239,0.85)", textDecoration:"none", fontSize:14, padding:"12px 14px", background:"rgba(247,245,239,0.04)", borderRadius:10, border:"1px solid rgba(247,245,239,0.08)" }}>
                  <span style={{ fontSize:18 }}>💬</span>
                  <div>
                    <div style={{ fontSize:11, color:"rgba(247,245,239,0.5)" }}>WhatsApp</div>
                    <div style={{ fontWeight:600, color:"#F7F5EF" }}>+91 98765 43210</div>
                  </div>
                </a>
                <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:14, color:"rgba(247,245,239,0.85)", padding:"12px 14px", background:"rgba(247,245,239,0.04)", borderRadius:10, border:"1px solid rgba(247,245,239,0.08)" }}>
                  <span style={{ fontSize:18 }}>📍</span>
                  <div>
                    <div style={{ fontSize:11, color:"rgba(247,245,239,0.5)" }}>Office</div>
                    <div style={{ fontWeight:600, color:"#F7F5EF" }}>Ahmedabad, Gujarat, India</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────────  FOOTER  ─────────────── */}
      <footer style={{ background:"#14130F", color:"rgba(247,245,239,0.6)", padding:"48px 5% 32px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:40 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <div style={{ fontFamily:FONTS.serif, fontSize:20, color:"#F7F5EF" }}>NexaAttend</div>
                <div style={{ width:6, height:6, borderRadius:"50%", background:COLORS.green }} />
              </div>
              <p style={{ fontSize:13, lineHeight:1.7, color:"rgba(247,245,239,0.5)", maxWidth:340 }}>
                Complete School ERP for Indian schools. AI attendance, fees, LMS, payroll and analytics — all in one offline-first platform.
              </p>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#F7F5EF", letterSpacing:"0.08em", marginBottom:14 }}>PRODUCT</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {["Modules","Live Demo","Plans","Features","Roadmap"].map(l => (
                  <a key={l} href="#" style={{ color:"rgba(247,245,239,0.5)", textDecoration:"none", fontSize:12.5 }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#F7F5EF", letterSpacing:"0.08em", marginBottom:14 }}>COMPANY</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {["About","Customers","Contact","Careers","Blog"].map(l => (
                  <a key={l} href="#" style={{ color:"rgba(247,245,239,0.5)", textDecoration:"none", fontSize:12.5 }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#F7F5EF", letterSpacing:"0.08em", marginBottom:14 }}>LEGAL</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <a href="#/privacy-policy" onClick={() => nav("/privacy-policy")} style={{ color:"rgba(247,245,239,0.5)", textDecoration:"none", fontSize:12.5 }}>Privacy Policy</a>
                <a href="#/terms"           onClick={() => nav("/terms")}           style={{ color:"rgba(247,245,239,0.5)", textDecoration:"none", fontSize:12.5 }}>Terms of Service</a>
                <a href="#" style={{ color:"rgba(247,245,239,0.5)", textDecoration:"none", fontSize:12.5 }}>Refund Policy</a>
                <a href="#" style={{ color:"rgba(247,245,239,0.5)", textDecoration:"none", fontSize:12.5 }}>Data Security</a>
              </div>
            </div>
          </div>
          <div style={{ paddingTop:24, borderTop:"1px solid rgba(247,245,239,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, fontSize:11, color:"rgba(247,245,239,0.35)" }}>
            <span>© 2026 Nova Teach ERP · All rights reserved</span>
            <span>Built with ❤ in Ahmedabad, India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
