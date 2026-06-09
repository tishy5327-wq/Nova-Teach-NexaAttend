/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           NexaAttend — Complete School ERP + LMS · v8.0                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, {
  useState, useEffect, useRef, useCallback, useContext, createContext, memo, useMemo,
} from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithPopup, GoogleAuthProvider, signOut,
  onAuthStateChanged, setPersistence, browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection,
  serverTimestamp, Timestamp, enableIndexedDbPersistence, onSnapshot,
  query, where, getDocs, addDoc,
} from "firebase/firestore";

// ─── Firebase Config ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCAhTxH2vcZprnlTqNkfQouwYy76zK1Z5k",
  authDomain: "nova-e3626.firebaseapp.com",
  projectId: "nova-e3626",
  storageBucket: "nova-e3626.firebasestorage.app",
  messagingSenderId: "1000462435473",
  appId: "1:1000462435473:web:e8542ef3f6c478f3182b30",
};

const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);

setPersistence(auth, browserLocalPersistence).catch(() => {});
enableIndexedDbPersistence(db).catch(() => {});

// ─── Color + Font Tokens ──────────────────────────────────────────────────────
const C = {
  bg: "#F7F5EF",
  surface: "#FFFFFF",
  dark: "#1C1B17",
  green: "#2A6B4A",
  greenLight: "#5AC87A",
  greenMuted: "rgba(42,107,74,0.08)",
  navy: "#1A2B4A",
  purple: "#3D1A4A",
  amber: "#7A5000",
  red: "#7A1A1A",
  border: "rgba(28,27,23,0.08)",
  muted: "rgba(28,27,23,0.45)",
  faint: "rgba(28,27,23,0.15)",
};
const F = {
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'Instrument Sans', 'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ─── Role Permissions ─────────────────────────────────────────────────────────
const ROLE_PERMISSIONS = {
  owner: ["manage_subscription","manage_billing","manage_settings","manage_students","manage_staff","manage_teachers","take_attendance","create_exams","grade_exams","create_assignments","view_reports","export_reports","manage_lms"],
  admin: ["manage_students","manage_staff","take_attendance","create_exams","grade_exams","create_assignments","view_reports","manage_lms"],
  teacher: ["view_students","take_attendance","create_exams","create_assignments","view_lms"],
  student: ["view_own_data"],
  parent: ["view_child_data"],
};

const hasPermission = (role, perm) => (ROLE_PERMISSIONS[role] || []).includes(perm);

// ─── Nav Tabs ────────────────────────────────────────────────────────────────
const NAV_TABS = [
  { id: "overview",      label: "Overview",       icon: "⊞",  roles: ["owner","admin","teacher"] },
  { id: "attendance",    label: "Attendance",     icon: "✅",  roles: ["owner","admin","teacher"] },
  { id: "students",      label: "Students",       icon: "🎓", roles: ["owner","admin","teacher"] },
  { id: "staff",         label: "Staff & HR",     icon: "👥", roles: ["owner","admin"] },
  { id: "leave",         label: "Leave",          icon: "📅", roles: ["owner","admin"] },
  { id: "payroll",       label: "Payroll",        icon: "💰", roles: ["owner","admin"] },
  { id: "fees",          label: "Fees",           icon: "🧾", roles: ["owner","admin"] },
  { id: "exams",         label: "Exams",          icon: "📝", roles: ["owner","admin","teacher"] },
  { id: "assignments",   label: "Assignments",    icon: "📚", roles: ["owner","admin","teacher"] },
  { id: "lms",           label: "LMS",            icon: "🖥️", roles: ["owner","admin","teacher","student"] },
  { id: "parent",        label: "Parent Portal",  icon: "👪", roles: ["owner","parent"] },
  { id: "notifications", label: "Notifications",  icon: "🔔", roles: ["owner","admin","teacher","student","parent"] },
  { id: "reports",       label: "Reports",        icon: "📊", roles: ["owner","admin"] },
  { id: "team",          label: "Team & Roles",   icon: "🛡️", roles: ["owner"], ownerOnly: true },
  { id: "billing",       label: "Billing",        icon: "💳", roles: ["owner"], ownerOnly: true },
];

// ─── Demo Data ───────────────────────────────────────────────────────────────
const DEMO_STUDENTS = [
  { id:"S001", name:"Arjun Mehta",   class:"X-A",  roll:"01", attendance:94, fees:"Paid",    avatar:"AM", address:"Satellite, Ahmedabad" },
  { id:"S002", name:"Priya Sharma",  class:"X-A",  roll:"02", attendance:88, fees:"Paid",    avatar:"PS", address:"Bopal, Ahmedabad" },
  { id:"S003", name:"Rohan Patel",   class:"IX-B", roll:"03", attendance:72, fees:"Due",     avatar:"RP", address:"Gota, Ahmedabad" },
  { id:"S004", name:"Sneha Verma",   class:"X-A",  roll:"04", attendance:96, fees:"Paid",    avatar:"SV", address:"Chandkheda, Ahmedabad" },
  { id:"S005", name:"Dev Agarwal",   class:"XI-C", roll:"05", attendance:81, fees:"Partial", avatar:"DA", address:"Thaltej, Ahmedabad" },
  { id:"S006", name:"Kavya Joshi",   class:"IX-B", roll:"06", attendance:91, fees:"Paid",    avatar:"KJ", address:"Prahlad Nagar, Ahmedabad" },
  { id:"S007", name:"Ishaan Nair",   class:"XII-A",roll:"07", attendance:87, fees:"Paid",    avatar:"IN", address:"Vastrapur, Ahmedabad" },
  { id:"S008", name:"Ananya Singh",  class:"XI-C", roll:"08", attendance:79, fees:"Due",     avatar:"AS", address:"Navrangpura, Ahmedabad" },
];

const DEMO_STAFF = [
  { id:"T001", name:"Mrs. Deepa Rao",      role:"Principal",   dept:"Administration", salary:75000, status:"Active", joined:"2018-06-01" },
  { id:"T002", name:"Mr. Amit Kulkarni",   role:"Maths HOD",   dept:"Mathematics",   salary:58000, status:"Active", joined:"2019-07-15" },
  { id:"T003", name:"Ms. Ritu Bansal",     role:"Science",     dept:"Science",       salary:52000, status:"Active", joined:"2020-03-01" },
  { id:"T004", name:"Mr. Sanjay Pillai",   role:"English",     dept:"Languages",     salary:49000, status:"Active", joined:"2021-08-01" },
  { id:"T005", name:"Ms. Pooja Dubey",     role:"Hindi",       dept:"Languages",     salary:46000, status:"Active", joined:"2022-01-10" },
  { id:"T006", name:"Mr. Kiran Mehta",     role:"PT",          dept:"Sports",        salary:40000, status:"On Leave", joined:"2020-06-01" },
];

const DEMO_LEAVE = [
  { id:"L001", name:"Mr. Kiran Mehta",   type:"Medical",   from:"2026-06-08", to:"2026-06-12", days:5, status:"Pending",  reason:"Surgery recovery" },
  { id:"L002", name:"Ms. Ritu Bansal",   type:"Casual",    from:"2026-06-15", to:"2026-06-15", days:1, status:"Approved", reason:"Personal work" },
  { id:"L003", name:"Mr. Sanjay Pillai", type:"Earned",    from:"2026-06-20", to:"2026-06-22", days:3, status:"Pending",  reason:"Family function" },
  { id:"L004", name:"Ms. Pooja Dubey",   type:"Sick",      from:"2026-06-10", to:"2026-06-10", days:1, status:"Approved", reason:"Fever" },
];

const DEMO_PAYROLL = [
  { id:"P001", name:"Mrs. Deepa Rao",    role:"Principal",  basic:60000, hra:15000, gross:75000, deductions:7500, net:67500, status:"Paid" },
  { id:"P002", name:"Mr. Amit Kulkarni", role:"Maths HOD",  basic:46000, hra:12000, gross:58000, deductions:5800, net:52200, status:"Paid" },
  { id:"P003", name:"Ms. Ritu Bansal",   role:"Science",    basic:42000, hra:10000, gross:52000, deductions:5200, net:46800, status:"Paid" },
  { id:"P004", name:"Mr. Sanjay Pillai", role:"English",    basic:39000, hra:10000, gross:49000, deductions:4900, net:44100, status:"Processing" },
  { id:"P005", name:"Ms. Pooja Dubey",   role:"Hindi",      basic:37000, hra:9000,  gross:46000, deductions:4600, net:41400, status:"Processing" },
  { id:"P006", name:"Mr. Kiran Mehta",   role:"PT",         basic:32000, hra:8000,  gross:40000, deductions:4000, net:36000, status:"Pending" },
];

const DEMO_FEES = [
  { id:"F001", name:"Arjun Mehta",   class:"X-A",  amount:12500, paid:12500, due:0,    status:"Paid",    dueDate:"2026-04-30" },
  { id:"F002", name:"Priya Sharma",  class:"X-A",  amount:12500, paid:12500, due:0,    status:"Paid",    dueDate:"2026-04-30" },
  { id:"F003", name:"Rohan Patel",   class:"IX-B", amount:11000, paid:0,     due:11000,status:"Due",     dueDate:"2026-04-30" },
  { id:"F004", name:"Sneha Verma",   class:"X-A",  amount:12500, paid:12500, due:0,    status:"Paid",    dueDate:"2026-04-30" },
  { id:"F005", name:"Dev Agarwal",   class:"XI-C", amount:14000, paid:7000,  due:7000, status:"Partial", dueDate:"2026-04-30" },
  { id:"F006", name:"Kavya Joshi",   class:"IX-B", amount:11000, paid:11000, due:0,    status:"Paid",    dueDate:"2026-04-30" },
  { id:"F007", name:"Ishaan Nair",   class:"XII-A",amount:15000, paid:15000, due:0,    status:"Paid",    dueDate:"2026-04-30" },
  { id:"F008", name:"Ananya Singh",  class:"XI-C", amount:14000, paid:0,     due:14000,status:"Due",     dueDate:"2026-04-30" },
];

const DEMO_EXAMS = [
  { id:"E001", title:"Half-Yearly Mathematics",   date:"2026-06-20", classes:"X-A, X-B",  maxMarks:100, status:"Upcoming" },
  { id:"E002", title:"Science Practical Test",    date:"2026-06-18", classes:"IX-B",       maxMarks:50,  status:"Upcoming" },
  { id:"E003", title:"English Literature",        date:"2026-06-15", classes:"X-A, IX-B",  maxMarks:80,  status:"Upcoming" },
  { id:"E004", title:"Unit Test — Physics",       date:"2026-06-10", classes:"XII-A",      maxMarks:40,  status:"Active" },
  { id:"E005", title:"Annual Hindi Paper",        date:"2026-05-28", classes:"XI-C, X-A",  maxMarks:100, status:"Completed" },
];

const DEMO_ASSIGNMENTS = [
  { id:"A001", title:"Quadratic Equations Practice", class:"X-A",  teacher:"Mr. Amit Kulkarni", due:"2026-06-12", submitted:22, total:30 },
  { id:"A002", title:"Cell Division Diagram",         class:"IX-B", teacher:"Ms. Ritu Bansal",   due:"2026-06-14", submitted:18, total:28 },
  { id:"A003", title:"Essay: My Favourite Book",      class:"X-A",  teacher:"Mr. Sanjay Pillai", due:"2026-06-16", submitted:25, total:30 },
  { id:"A004", title:"Hindi Paragraph Writing",       class:"XI-C", teacher:"Ms. Pooja Dubey",   due:"2026-06-18", submitted:10, total:32 },
  { id:"A005", title:"Physical Fitness Log",          class:"IX-B", teacher:"Mr. Kiran Mehta",   due:"2026-06-20", submitted:15, total:28 },
];

const DEMO_NOTIFICATIONS = [
  { id:"N001", type:"alert",   title:"Fee Due Reminder",         body:"3 students have overdue fees this month.", time:"2h ago",   read:false },
  { id:"N002", type:"info",    title:"Exam Schedule Published",  body:"Half-yearly exam schedule is now live.",    time:"4h ago",   read:false },
  { id:"N003", type:"success", title:"Attendance Synced",        body:"Today's attendance has been recorded.",     time:"6h ago",   read:true  },
  { id:"N004", type:"info",    title:"Assignment Submission",    body:"22 students submitted Maths assignment.",   time:"1d ago",   read:true  },
  { id:"N005", type:"alert",   title:"Leave Request",            body:"Mr. Kiran Mehta has requested 5 days.",    time:"1d ago",   read:true  },
  { id:"N006", type:"success", title:"Payroll Processed",        body:"May 2026 payroll has been processed.",      time:"2d ago",   read:true  },
];

const DEMO_ACTIVITY = [
  { icon:"✅", text:"Attendance taken for Class X-A",        time:"9:12 AM" },
  { icon:"💰", text:"Fee collected: Priya Sharma ₹12,500",  time:"10:30 AM" },
  { icon:"📝", text:"Exam scheduled: Mathematics (X-A)",    time:"11:15 AM" },
  { icon:"📚", text:"Assignment created by Mr. Kulkarni",   time:"12:00 PM" },
  { icon:"👤", text:"New student enrolled: Rohan Patel",    time:"2:45 PM" },
];

const DEMO_TEAM = [
  { id:"M001", name:"Ravi Kumar",   email:"ravi@nexaattend.in",  role:"admin",   status:"Active", joined:"2025-09-01" },
  { id:"M002", name:"Sunita Ghosh", email:"sunita@nexaattend.in",role:"teacher", status:"Active", joined:"2025-11-15" },
];

const DEMO_INVOICES = [
  { id:"INV001", date:"2026-05-01", amount:4999,  plan:"Standard",  status:"Paid" },
  { id:"INV002", date:"2026-04-01", amount:4999,  plan:"Standard",  status:"Paid" },
  { id:"INV003", date:"2026-03-01", amount:4999,  plan:"Standard",  status:"Paid" },
];

const DEMO_ATTENDANCE_FEED = [
  { roll:"X-A/01", name:"Arjun Mehta",   time:"08:02", status:"Present", confidence:"99.1%" },
  { roll:"X-A/02", name:"Priya Sharma",  time:"08:04", status:"Present", confidence:"98.7%" },
  { roll:"IX-B/03",name:"Rohan Patel",   time:"08:18", status:"Late",    confidence:"97.2%" },
  { roll:"X-A/04", name:"Sneha Verma",   time:"08:01", status:"Present", confidence:"99.5%" },
  { roll:"XI-C/05",name:"Dev Agarwal",   time:"—",     status:"Absent",  confidence:"—" },
  { roll:"IX-B/06",name:"Kavya Joshi",   time:"08:06", status:"Present", confidence:"98.9%" },
  { roll:"XII-A/07",name:"Ishaan Nair",  time:"08:09", status:"Present", confidence:"99.3%" },
  { roll:"XI-C/08",name:"Ananya Singh",  time:"08:25", status:"Late",    confidence:"96.8%" },
];

// ─── LMS Demo Data ────────────────────────────────────────────────────────────
const LMS_COURSES = [
  {
    id:"C001", code:"MATH-X", title:"Mathematics Class X", subject:"Maths", level:"Class X",
    emoji:"📐", color:"#2A6B4A", progress:68, enrolled:true, rating:4.7, students:284,
    duration:"48 hrs", instructor:"Mr. Amit Kulkarni",
    description:"Comprehensive coverage of CBSE Class X Mathematics syllabus with practice problems and shortcuts.",
    modules:[
      "Real Numbers & Euclid's Division", "Polynomials", "Pair of Linear Equations",
      "Quadratic Equations", "Arithmetic Progressions", "Triangles",
      "Coordinate Geometry", "Introduction to Trigonometry", "Circles", "Statistics & Probability",
    ],
  },
  {
    id:"C002", code:"SCI-X", title:"Science Class X", subject:"Science", level:"Class X",
    emoji:"🔬", color:"#1A2B4A", progress:0, enrolled:false, rating:4.5, students:272,
    duration:"52 hrs", instructor:"Ms. Ritu Bansal",
    description:"Physics, Chemistry and Biology for CBSE Class X with NCERT solutions and lab simulations.",
    modules:[
      "Chemical Reactions", "Acids Bases & Salts", "Metals & Non-metals",
      "Life Processes", "Control & Coordination", "Reproduction", "Heredity",
      "Light – Reflection & Refraction", "Electricity", "Magnetic Effects",
    ],
  },
  {
    id:"C003", code:"ENG-X", title:"English Language Class X", subject:"English", level:"Class X",
    emoji:"📖", color:"#3D1A4A", progress:42, enrolled:true, rating:4.6, students:261,
    duration:"36 hrs", instructor:"Mr. Sanjay Pillai",
    description:"First Flight & Footprints Without Feet with grammar, writing, and comprehension practice.",
    modules:[
      "A Letter to God", "Nelson Mandela", "Two Stories About Flying",
      "From the Diary of Anne Frank", "The Hundred Dresses", "Bholi",
      "Grammar: Tenses & Voice", "Writing: Letters & Articles",
    ],
  },
  {
    id:"C004", code:"HIN-X", title:"Hindi Sparsh Class X", subject:"Hindi", level:"Class X",
    emoji:"🪔", color:"#7A5000", progress:0, enrolled:false, rating:4.3, students:248,
    duration:"32 hrs", instructor:"Ms. Pooja Dubey",
    description:"Kshitij and Sparsh textbooks with व्याकरण and creative writing in Hindi.",
    modules:[
      "Kabir ke Dohe", "Meera ke Pad", "Ram-Lakshman-Parshuram Samvad",
      "Aatmakathya", "Vyakaran: Sandhi & Samas", "Nibandh Lekhan", "Patra Lekhan",
    ],
  },
  {
    id:"C005", code:"SST-X", title:"Social Studies Class X", subject:"SST", level:"Class X",
    emoji:"🌏", color:"#5A3A1A", progress:25, enrolled:true, rating:4.4, students:259,
    duration:"44 hrs", instructor:"Mrs. Deepa Rao",
    description:"History, Geography, Political Science, and Economics for CBSE Class X.",
    modules:[
      "Nationalism in Europe", "Nationalism in India", "Age of Industrialisation",
      "Resources & Development", "Forest & Wildlife", "Water Resources",
      "Power Sharing", "Federalism", "Democracy & Diversity", "Money & Credit",
    ],
  },
  {
    id:"C006", code:"PHY-XII", title:"Physics Class XII", subject:"Physics", level:"Class XII",
    emoji:"⚡", color:"#1A1A4A", progress:88, enrolled:true, rating:4.9, students:198,
    duration:"60 hrs", instructor:"Ms. Ritu Bansal",
    description:"Advanced Physics for JEE/NEET aspirants with numerical problem sets and concept videos.",
    modules:[
      "Electric Charges & Fields", "Electrostatic Potential", "Current Electricity",
      "Moving Charges", "Magnetism", "Electromagnetic Induction", "Alternating Current",
      "Electromagnetic Waves", "Ray Optics", "Wave Optics", "Dual Nature",
    ],
  },
  {
    id:"C007", code:"CS-XI", title:"Computer Science Class XI", subject:"CS", level:"Class XI",
    emoji:"💻", color:"#0A3A2A", progress:0, enrolled:false, rating:4.8, students:156,
    duration:"40 hrs", instructor:"Mr. Amit Kulkarni",
    description:"Python programming, data structures, and database fundamentals for CBSE XI.",
    modules:[
      "Introduction to Python", "Flow of Control", "Functions",
      "Strings", "Lists", "Tuples & Dictionaries",
      "File Handling", "Database & SQL",
    ],
  },
  {
    id:"C008", code:"PE-IX", title:"Physical Education IX", subject:"PE", level:"Class IX",
    emoji:"🏃", color:"#4A1A1A", progress:50, enrolled:true, rating:4.2, students:304,
    duration:"20 hrs", instructor:"Mr. Kiran Mehta",
    description:"Physical fitness, yoga, sports theory, and health education for Class IX students.",
    modules:[
      "Physical Fitness Components", "Yoga & Wellness", "Athletics",
      "Team Sports Rules", "Health Education", "First Aid",
    ],
  },
];

const LMS_QUIZZES = [
  {
    id:"Q001", title:"Linear Equations Quiz", subject:"Maths", difficulty:"Medium", questions:5,
    time:15, attempts:3, bestScore:80,
    questionData:[
      { q:"What is the solution of 2x + 4 = 12?", opts:["x = 2","x = 3","x = 4","x = 5"], ans:2 },
      { q:"Which of the following is a linear equation in two variables?", opts:["x² + y = 5","x + y = 5","x × y = 5","x² + y² = 5"], ans:1 },
      { q:"If 3x − 9 = 0, then x equals:", opts:["1","2","3","4"], ans:2 },
      { q:"The graph of y = 4 is a line:", opts:["Through origin","Parallel to x-axis","Parallel to y-axis","At 45°"], ans:1 },
      { q:"How many solutions does x + y = 7 have?", opts:["One","Two","None","Infinitely many"], ans:3 },
    ],
  },
  { id:"Q002", title:"Periodic Table Elements",  subject:"Science", difficulty:"Easy",   questions:10, time:20, attempts:1, bestScore:90 },
  { id:"Q003", title:"Comprehension Challenge",  subject:"English", difficulty:"Medium", questions:8,  time:25, attempts:2, bestScore:75 },
  { id:"Q004", title:"World Map Quiz",           subject:"SST",     difficulty:"Hard",   questions:12, time:30, attempts:0, bestScore:0 },
  { id:"Q005", title:"Python Basics Check",      subject:"CS",      difficulty:"Easy",   questions:10, time:20, attempts:5, bestScore:100 },
];

const LMS_LIBRARY = [
  { id:"LIB001", title:"NCERT Mathematics X",       type:"PDF",   subject:"Maths",  size:"12 MB", pages:348 },
  { id:"LIB002", title:"NCERT Science X",            type:"PDF",   subject:"Science",size:"18 MB", pages:402 },
  { id:"LIB003", title:"Maths Formula Sheet",        type:"PDF",   subject:"Maths",  size:"2 MB",  pages:12  },
  { id:"LIB004", title:"Physics Video Pack – XII",   type:"Video", subject:"Physics",size:"1.2 GB",pages:null },
  { id:"LIB005", title:"Science Lab Manual IX",      type:"PDF",   subject:"Science",size:"8 MB",  pages:180 },
  { id:"LIB006", title:"CS Python Practicals XI",    type:"PDF",   subject:"CS",     size:"5 MB",  pages:95  },
];

const LMS_GRADEBOOK = [
  { subject:"Mathematics", score:88, max:100, term1:82, term2:88, color:"#2A6B4A" },
  { subject:"Science",     score:86, max:100, term1:80, term2:86, color:"#1A2B4A" },
  { subject:"English",     score:80, max:100, term1:76, term2:80, color:"#3D1A4A" },
  { subject:"Hindi",       score:78, max:100, term1:74, term2:78, color:"#7A5000" },
  { subject:"SST",         score:80, max:100, term1:78, term2:80, color:"#5A3A1A" },
  { subject:"Computer Sc.",score:94, max:100, term1:90, term2:94, color:"#0A3A2A" },
];

// ─── Utility Functions ───────────────────────────────────────────────────────
const initials = (name) => name ? name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";

const fmtINR = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${n.toLocaleString("en-IN")}`;
  return `₹${n}`;
};

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : (d.toDate ? d.toDate() : d);
  return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
};

const STATUS_COLORS = {
  Paid:"#2A6B4A", Active:"#2A6B4A", Present:"#2A6B4A", Approved:"#2A6B4A", Enrolled:"#2A6B4A",
  Due:"#7A1A1A", Absent:"#7A1A1A", Rejected:"#7A1A1A", Expired:"#7A1A1A",
  Partial:"#7A5000", Late:"#7A5000", Pending:"#7A5000", Processing:"#7A5000", "On Leave":"#7A5000",
  Upcoming:"#1A2B4A", Completed:"#555", Default:"#555",
};
const statusColor = (s) => STATUS_COLORS[s] || STATUS_COLORS.Default;
const statusBg = (s) => {
  const c = statusColor(s);
  if (c === "#2A6B4A") return "rgba(42,107,74,0.1)";
  if (c === "#7A1A1A") return "rgba(122,26,26,0.1)";
  if (c === "#7A5000") return "rgba(122,80,0,0.1)";
  if (c === "#1A2B4A") return "rgba(26,43,74,0.1)";
  return "rgba(0,0,0,0.06)";
};

const isOfflineError = (err) =>
  err?.code === "unavailable" ||
  /offline|Failed to get document|network error/i.test(err?.message || "");

const parseFirestoreError = (err) => {
  if (isOfflineError(err)) return { type: "offline", message: "You appear to be offline." };
  if (err?.code === "permission-denied") return { type: "auth", message: "Permission denied." };
  return { type: "error", message: err?.message || "Unknown error." };
};

const withRetry = async (fn, retries = 3, delay = 800) => {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
};

const computeTrialEndDate = (start) => {
  const d = start?.toDate ? start.toDate() : new Date(start);
  const end = new Date(d);
  end.setDate(end.getDate() + 7);
  return end;
};

const isTrialActive = (org, now = new Date()) => {
  if (!org) return false;
  if (org.status === "suspended" || org.status === "expired") return false;
  if (org.plan === "trial") {
    const end = org.trialEndDate?.toDate ? org.trialEndDate.toDate() : new Date(org.trialEndDate);
    return org.status === "active" && now < end;
  }
  return org.status === "active";
};

const getDaysRemaining = (org, now = new Date()) => {
  if (!org) return 0;
  const end = org.trialEndDate?.toDate ? org.trialEndDate.toDate() : new Date(org.trialEndDate || Date.now());
  return Math.max(0, Math.ceil((end - now) / 86400000));
};

const ensureOrganization = async (user) => {
  const profileRef = doc(db, "userProfiles", user.uid);
  const snap = await withRetry(() => getDoc(profileRef));
  if (!snap.exists()) return null;
  const profile = snap.data();
  if (!profile.orgId) return null;
  const orgRef = doc(db, "organizations", profile.orgId);
  const orgSnap = await withRetry(() => getDoc(orgRef));
  return orgSnap.exists() ? { id: orgSnap.id, ...orgSnap.data() } : null;
};

const refreshOrganization = async (orgId) => {
  if (!orgId) return null;
  const snap = await withRetry(() => getDoc(doc(db, "organizations", orgId)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

const fetchMemberRole = async (orgId, uid) => {
  const snap = await withRetry(() => getDoc(doc(db, "organizations", orgId, "members", uid)));
  return snap.exists() ? snap.data().role : "teacher";
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{font-size:16px;-webkit-font-smoothing:antialiased;}
    body{background:${C.bg};color:${C.dark};font-family:${F.sans};line-height:1.5;}
    a{color:inherit;text-decoration:none;}
    button{cursor:pointer;border:none;background:none;font-family:inherit;}
    input,select,textarea{font-family:inherit;outline:none;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:${C.faint};border-radius:4px;}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes slideUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
    @keyframes tickerScroll{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
  `}</style>
);

// ─── Contexts ────────────────────────────────────────────────────────────────
const TrialCtx = createContext(null);
const RoleCtx = createContext(null);
const UserProfileCtx = createContext(null);

// ─── Hooks ───────────────────────────────────────────────────────────────────
const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const useScroll = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return scrolled;
};

const useModal = () => {
  const [state, setState] = useState({ open: false, data: null });
  const show = useCallback((data = null) => setState({ open: true, data }), []);
  const hide = useCallback(() => setState({ open: false, data: null }), []);
  return { ...state, show, hide };
};

const useSearch = (items, keys) => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);
  const filtered = useMemo(() => {
    if (!debounced) return items;
    const q = debounced.toLowerCase();
    return items.filter(item => keys.some(k => (item[k] || "").toLowerCase().includes(q)));
  }, [debounced, items, keys]);
  return { query, setQuery, filtered };
};

const useTrial = () => useContext(TrialCtx);
const useRole = () => useContext(RoleCtx);
const useUserProfile = () => useContext(UserProfileCtx);

// ─── Context Providers ───────────────────────────────────────────────────────
const TrialProvider = ({ user, profile, children }) => {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  const loadOrg = useCallback(async () => {
    if (!profile?.orgId) { setLoading(false); return; }
    try {
      const data = await refreshOrganization(profile.orgId);
      setOrg(data); setError(null); setOffline(false);
    } catch (err) {
      const p = parseFirestoreError(err);
      if (p.type === "offline") setOffline(true);
      else setError(p.message);
    } finally { setLoading(false); }
  }, [profile?.orgId]);

  useEffect(() => { loadOrg(); }, [loadOrg]);
  useEffect(() => {
    const t = setInterval(loadOrg, 60000);
    window.addEventListener("online", loadOrg);
    return () => { clearInterval(t); window.removeEventListener("online", loadOrg); };
  }, [loadOrg]);

  const active = isTrialActive(org);
  const days = getDaysRemaining(org);

  return (
    <TrialCtx.Provider value={{ org, loading, error, offline, active, days, refresh: loadOrg }}>
      {children}
    </TrialCtx.Provider>
  );
};

const RoleProvider = ({ user, profile, children }) => {
  const [role, setRole] = useState(profile?.accountType || "owner");
  const can = useCallback((perm) => hasPermission(role, perm), [role]);
  useEffect(() => { if (profile?.accountType) setRole(profile.accountType); }, [profile]);
  return <RoleCtx.Provider value={{ role, can }}>{children}</RoleCtx.Provider>;
};

const UserProfileProvider = ({ user, children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const ref = doc(db, "userProfiles", user.uid);
    const unsub = onSnapshot(ref,
      snap => {
        if (snap.exists()) { setProfile({ id: snap.id, ...snap.data() }); setNeedsOnboarding(false); }
        else setNeedsOnboarding(true);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user?.uid]);

  return (
    <UserProfileCtx.Provider value={{ profile, loading, needsOnboarding, setProfile }}>
      {children}
    </UserProfileCtx.Provider>
  );
};

// ─── Small UI Components ─────────────────────────────────────────────────────
const FadeIn = memo(({ children, delay = 0, style = {} }) => {
  const [ref, inView] = useInView(0.05);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
});

const Badge = memo(({ label, status }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", padding:"2px 10px",
    borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:"0.03em",
    background: statusBg(status || label), color: statusColor(status || label),
  }}>{label}</span>
));

const Avatar = memo(({ name, size = 36, bg = C.green }) => (
  <div style={{
    width:size, height:size, borderRadius:"50%", background:bg,
    display:"flex", alignItems:"center", justifyContent:"center",
    color:"#fff", fontSize:size*0.35, fontWeight:700, fontFamily:F.sans, flexShrink:0,
  }}>{initials(name)}</div>
));

const StatCard = memo(({ label, value, sub, accent = C.green, icon }) => (
  <div style={{
    background:C.surface, borderRadius:12, padding:"16px 20px",
    border:`1px solid ${C.border}`, borderTop:`3px solid ${accent}`,
    boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
      <div>
        <div style={{ fontSize:12, color:C.muted, fontWeight:500, marginBottom:6 }}>{label}</div>
        <div style={{ fontSize:26, fontWeight:700, color:C.dark, lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>{sub}</div>}
      </div>
      {icon && <span style={{ fontSize:22, opacity:0.7 }}>{icon}</span>}
    </div>
  </div>
));

const ProgressBar = memo(({ value, max = 100, color = C.green, height = 6, showLabel = false }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height, background:C.faint, borderRadius:height, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:height, transition:"width 0.4s ease" }} />
      </div>
      {showLabel && <span style={{ fontSize:11, fontWeight:600, color:C.muted, minWidth:32 }}>{pct}%</span>}
    </div>
  );
});

const SectionHeader = memo(({ title, subtitle, action }) => (
  <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
    <div>
      <h2 style={{ fontSize:18, fontWeight:700, color:C.dark }}>{title}</h2>
      {subtitle && <p style={{ fontSize:13, color:C.muted, marginTop:2 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
));

const SearchBar = memo(({ value, onChange, placeholder = "Search…" }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
    <span style={{ position:"absolute", left:10, fontSize:14, color:C.muted, pointerEvents:"none" }}>🔍</span>
    <input
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8,
        border:`1px solid ${C.border}`, borderRadius:8, fontSize:13,
        background:C.surface, color:C.dark, width:"100%",
      }}
    />
  </div>
));

const VARIANTS = {
  primary: { bg:C.dark, color:"#fff" },
  green:   { bg:C.green, color:"#fff" },
  outline: { bg:"transparent", color:C.dark, border:`1px solid ${C.border}` },
  danger:  { bg:C.red, color:"#fff" },
  ghost:   { bg:"transparent", color:C.muted },
};
const SIZES = {
  sm:  { fontSize:12, padding:"5px 12px" },
  md:  { fontSize:13, padding:"8px 16px" },
  lg:  { fontSize:15, padding:"11px 22px" },
};

const Btn = memo(({ variant = "primary", size = "md", children, onClick, disabled, style = {} }) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...s, ...v, borderRadius:8, fontWeight:600, fontFamily:F.sans,
      opacity: disabled ? 0.5 : 1, transition:"all 0.15s", display:"inline-flex",
      alignItems:"center", gap:6, flexShrink:0, border: v.border || "none", ...style,
    }}>{children}</button>
  );
});

const EmptyState = memo(({ icon = "📭", title = "Nothing here", subtitle }) => (
  <div style={{ textAlign:"center", padding:"60px 20px", color:C.muted }}>
    <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
    <div style={{ fontSize:16, fontWeight:600, color:C.dark, marginBottom:4 }}>{title}</div>
    {subtitle && <div style={{ fontSize:13 }}>{subtitle}</div>}
  </div>
));

const Spinner = memo(({ size = 24, color = C.green }) => (
  <div style={{
    width:size, height:size, border:`2px solid ${C.faint}`,
    borderTopColor:color, borderRadius:"50%", animation:"spin 0.7s linear infinite",
  }} />
));

const AuthLoadingScreen = memo(() => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:16, background:C.bg }}>
    <Spinner size={36} />
    <p style={{ color:C.muted, fontSize:14 }}>Loading NexaAttend…</p>
  </div>
));

const OfflineScreen = memo(({ onRetry }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:20, background:C.bg, padding:24 }}>
    <div style={{ fontSize:48 }}>📡</div>
    <h2 style={{ fontFamily:F.serif, fontSize:24 }}>You're offline</h2>
    <p style={{ color:C.muted, textAlign:"center", maxWidth:320 }}>Check your internet connection and try again.</p>
    <Btn onClick={onRetry} variant="green">Retry Connection</Btn>
  </div>
));

const ErrorScreen = memo(({ message, onRetry }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:20, background:C.bg, padding:24 }}>
    <div style={{ fontSize:48 }}>⚠️</div>
    <h2 style={{ fontFamily:F.serif, fontSize:24 }}>Connection issue</h2>
    <p style={{ color:C.muted, textAlign:"center", maxWidth:320 }}>{message || "Something went wrong. Please try again."}</p>
    <Btn onClick={onRetry} variant="green">Try Again</Btn>
  </div>
));

const AccountTypeBadge = memo(({ type }) => {
  const map = { owner:"👑 OWNER", teacher:"👨‍🏫 TEACHER", student:"🎓 STUDENT", parent:"👪 PARENT" };
  const colors = { owner:C.green, teacher:C.navy, student:C.purple, parent:C.amber };
  return (
    <span style={{
      padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700, fontFamily:F.mono,
      letterSpacing:"0.08em", background:statusBg("Active"), color: colors[type] || C.muted, border:`1px solid ${colors[type] || C.faint}`,
    }}>{map[type] || type}</span>
  );
});

const RoleGuard = memo(({ permission, children }) => {
  const { can } = useRole() || { can: () => true };
  if (can(permission)) return children;
  return (
    <div style={{ padding:24, textAlign:"center", color:C.muted, background:C.surface, borderRadius:12, border:`1px solid ${C.border}` }}>
      <div style={{ fontSize:32, marginBottom:8 }}>🔒</div>
      <div style={{ fontWeight:600, color:C.dark, marginBottom:4 }}>Owner Access Required</div>
      <div style={{ fontSize:13 }}>You don't have permission to view this section.</div>
    </div>
  );
});

const TrialStatusBanner = memo(() => {
  const { active, days, org } = useTrial() || {};
  if (!org || org.plan !== "trial") return null;
  const color = days <= 2 ? C.red : days <= 4 ? "#7A5000" : C.green;
  const bg = days <= 2 ? "rgba(122,26,26,0.08)" : days <= 4 ? "rgba(122,80,0,0.08)" : C.greenMuted;
  return (
    <div style={{
      background:bg, borderBottom:`1px solid ${color}20`, padding:"10px 24px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <span style={{ fontSize:13, color, fontWeight:600 }}>
        ⏳ {days > 0 ? `${days} day${days !== 1 ? "s" : ""} left in your free trial` : "Trial expired"}
      </span>
      <Btn size="sm" variant="outline" style={{ fontSize:11, padding:"3px 10px", color, borderColor:color }}>Upgrade Plan</Btn>
    </div>
  );
});

// ─── Modal Shell ─────────────────────────────────────────────────────────────
const Modal = memo(({ open, onClose, width = 560, children }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)",
        display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16, animation:"fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:C.surface, borderRadius:16, width:"100%", maxWidth:width,
          maxHeight:"90vh", overflowY:"auto", animation:"slideUp 0.2s ease",
          boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {children}
      </div>
    </div>
  );
});

// ─── Expired Trial Page ───────────────────────────────────────────────────────
const ExpiredTrialPage = memo(({ onLogout }) => (
  <div style={{
    minHeight:"100vh", background:`linear-gradient(135deg, #0a0e1a 0%, #1a2b4a 100%)`,
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    padding:24, textAlign:"center",
  }}>
    <div style={{ fontSize:56, marginBottom:16, animation:"float 3s ease-in-out infinite" }}>⏰</div>
    <h1 style={{ fontFamily:F.serif, fontSize:32, color:"#fff", marginBottom:8 }}>Your trial has ended</h1>
    <p style={{ color:"rgba(255,255,255,0.6)", fontSize:15, maxWidth:380, marginBottom:40, lineHeight:1.6 }}>
      Your 7-day free trial for NexaAttend has expired. Upgrade to continue managing your school.
    </p>
    <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:280 }}>
      <Btn variant="green" size="lg" style={{ justifyContent:"center", width:"100%" }}>🚀 Upgrade Now</Btn>
      <Btn variant="outline" size="lg" style={{ justifyContent:"center", width:"100%", color:"#fff", borderColor:"rgba(255,255,255,0.25)" }}>
        📞 Contact Sales
      </Btn>
      <button onClick={onLogout} style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginTop:4, fontFamily:F.sans }}>Sign out</button>
    </div>
  </div>
));

// ─── LMS Modals ───────────────────────────────────────────────────────────────
const CourseDetailModal = memo(({ open, onClose, course }) => {
  const [tab, setTab] = useState("overview");
  if (!course) return null;
  const tabs = ["Overview","Syllabus","Instructor"];
  return (
    <Modal open={open} onClose={onClose} width={720}>
      <div style={{ height:160, background:`linear-gradient(135deg, ${course.color}dd, ${course.color}88)`, borderRadius:"16px 16px 0 0", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:64 }}>{course.emoji}</span>
      </div>
      <div style={{ padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:course.color, letterSpacing:"0.06em", marginBottom:4 }}>{course.code}</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:C.dark }}>{course.title}</h2>
          </div>
          <Badge label={course.enrolled ? "Enrolled" : "Not Enrolled"} status={course.enrolled ? "Active" : "Default"} />
        </div>
        <p style={{ color:C.muted, fontSize:14, lineHeight:1.6, marginBottom:20 }}>{course.description}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Students", val:course.students },
            { label:"Duration", val:course.duration },
            { label:"Rating", val:`⭐ ${course.rating}` },
            { label:"Level", val:course.level },
            { label:"Progress", val:`${course.progress}%` },
          ].map(s => (
            <div key={s.label} style={{ textAlign:"center", padding:12, background:C.bg, borderRadius:8 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.dark }}>{s.val}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {course.enrolled && <ProgressBar value={course.progress} showLabel />}
        <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, marginBottom:16, marginTop:20 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())} style={{
              padding:"8px 16px", fontSize:13, fontWeight:600, fontFamily:F.sans, marginBottom:-1,
              borderBottom: tab === t.toLowerCase() ? `2px solid ${C.green}` : "2px solid transparent",
              color: tab === t.toLowerCase() ? C.green : C.muted,
            }}>{t}</button>
          ))}
        </div>
        {tab === "overview" && (
          <div style={{ fontSize:14, color:C.muted, lineHeight:1.7 }}>
            This course covers the complete {course.subject} syllabus for {course.level}. 
            Includes recorded lectures, practice exercises, and chapter-wise tests aligned with CBSE guidelines.
          </div>
        )}
        {tab === "syllabus" && (
          <div>
            {course.modules.map((m, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:C.greenMuted, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.green, flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:13, color:C.dark }}>{m}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "instructor" && (
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            <Avatar name={course.instructor} size={48} bg={course.color} />
            <div>
              <div style={{ fontWeight:600, color:C.dark }}>{course.instructor}</div>
              <div style={{ fontSize:13, color:C.muted }}>Subject Expert · NexaAttend School</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>
                Teaching {course.subject} for 8+ years. CBSE certified educator.
              </div>
            </div>
          </div>
        )}
        <div style={{ marginTop:24, display:"flex", gap:12 }}>
          <Btn variant="green" size="lg" style={{ flex:1, justifyContent:"center" }}>
            {course.enrolled ? "Continue Learning →" : "Enroll Now →"}
          </Btn>
          <Btn variant="outline" size="lg" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </Modal>
  );
});

const QuizPlayerModal = memo(({ open, onClose, quiz }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { if (open) { setCurrent(0); setSelected({}); setSubmitted(false); } }, [open]);
  if (!quiz) return null;
  const questions = quiz.questionData || [];
  if (submitted) {
    const score = questions.reduce((acc, q, i) => acc + (selected[i] === q.ans ? 1 : 0), 0);
    const pct = Math.round((score / questions.length) * 100);
    return (
      <Modal open={open} onClose={onClose} width={680}>
        <div style={{ padding:40, textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "✅" : "📖"}</div>
          <h2 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>
            {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Job!" : "Keep Practicing"}
          </h2>
          <div style={{ fontSize:40, fontWeight:700, color:C.green, margin:"20px 0" }}>{pct}%</div>
          <p style={{ color:C.muted }}>{score}/{questions.length} correct answers</p>
          <div style={{ margin:"24px 0" }}>
            <ProgressBar value={score} max={questions.length} color={pct >= 80 ? C.green : "#7A5000"} />
          </div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <Btn variant="green" onClick={() => { setCurrent(0); setSelected({}); setSubmitted(false); }}>Try Again</Btn>
            <Btn variant="outline" onClick={onClose}>Close</Btn>
          </div>
        </div>
      </Modal>
    );
  }
  if (!questions.length) return (
    <Modal open={open} onClose={onClose} width={680}>
      <div style={{ padding:40 }}>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:12 }}>{quiz.title}</h2>
        <p style={{ color:C.muted }}>This quiz has {quiz.questions} questions across {quiz.subject} topics.</p>
        <div style={{ margin:"20px 0", display:"flex", gap:16 }}>
          <StatCard label="Questions" value={quiz.questions} />
          <StatCard label="Time" value={`${quiz.time} min`} />
          <StatCard label="Difficulty" value={quiz.difficulty} />
        </div>
        <Btn variant="green" size="lg" onClick={onClose}>Start Quiz</Btn>
      </div>
    </Modal>
  );
  const q = questions[current];
  const opts = ["A","B","C","D"];
  return (
    <Modal open={open} onClose={onClose} width={680}>
      <div style={{ padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.muted }}>{quiz.title}</div>
          <div style={{ fontSize:13, color:C.muted }}>Question {current+1}/{questions.length}</div>
        </div>
        <ProgressBar value={current+1} max={questions.length} showLabel={false} />
        <div style={{ margin:"24px 0" }}>
          <div style={{ fontSize:16, fontWeight:600, color:C.dark, lineHeight:1.5, marginBottom:20 }}>{q.q}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {q.opts.map((opt, i) => (
              <button key={i} onClick={() => setSelected(s => ({ ...s, [current]: i }))} style={{
                padding:"12px 16px", borderRadius:10, textAlign:"left", fontFamily:F.sans,
                fontSize:14, border:`2px solid ${selected[current] === i ? C.green : C.border}`,
                background: selected[current] === i ? C.greenMuted : C.surface,
                color: selected[current] === i ? C.green : C.dark, fontWeight: selected[current] === i ? 600 : 400,
                transition:"all 0.15s",
              }}>
                <span style={{ fontFamily:F.mono, fontSize:12, marginRight:10, opacity:0.6 }}>{opts[i]}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <Btn variant="outline" onClick={() => setCurrent(c => Math.max(0, c-1))} disabled={current === 0}>← Prev</Btn>
          {current < questions.length - 1
            ? <Btn variant="green" onClick={() => setCurrent(c => c+1)} disabled={selected[current] === undefined}>Next →</Btn>
            : <Btn variant="green" onClick={() => setSubmitted(true)} disabled={selected[current] === undefined}>Submit ✓</Btn>
          }
        </div>
      </div>
    </Modal>
  );
});

const LiveClassModal = memo(({ open, onClose, cls }) => {
  if (!cls) return null;
  return (
    <Modal open={open} onClose={onClose} width={580}>
      <div style={{ padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:28 }}>{cls.live ? "🔴" : "🎬"}</span>
              <Badge label={cls.live ? "LIVE NOW" : "Recorded"} status={cls.live ? "Active" : "Completed"} />
            </div>
            <h3 style={{ fontSize:18, fontWeight:700, color:C.dark }}>{cls.title}</h3>
          </div>
        </div>
        <p style={{ color:C.muted, fontSize:14, lineHeight:1.6, marginBottom:20 }}>{cls.description}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
          {[
            { label:"Teacher", val:cls.teacher },
            { label:"Duration", val:cls.duration },
            { label:"Scheduled", val:cls.scheduled },
            { label:"Attendees", val:cls.attendees },
          ].map(s => (
            <div key={s.label} style={{ padding:14, background:C.bg, borderRadius:10 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:14, fontWeight:600, color:C.dark }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="green" size="lg" style={{ flex:1, justifyContent:"center" }}>
            {cls.live ? "🔴 Join Live" : "▶ Watch Recording"}
          </Btn>
          <Btn variant="outline" size="md" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </Modal>
  );
});

// ─── Student Modal ────────────────────────────────────────────────────────────
const StudentModal = memo(({ open, onClose, student }) => {
  if (!student) return null;
  return (
    <Modal open={open} onClose={onClose} width={480}>
      <div style={{ padding:24 }}>
        <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:20 }}>
          <Avatar name={student.name} size={52} bg={C.green} />
          <div>
            <h3 style={{ fontSize:18, fontWeight:700, color:C.dark }}>{student.name}</h3>
            <div style={{ fontSize:13, color:C.muted }}>{student.class} · Roll #{student.roll}</div>
          </div>
          <Btn variant="outline" size="sm" onClick={onClose} style={{ marginLeft:"auto" }}>✕</Btn>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          <StatCard label="Attendance" value={`${student.attendance}%`} accent={student.attendance > 85 ? C.green : C.red} />
          <StatCard label="Fee Status" value={student.fees} accent={statusColor(student.fees)} />
        </div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:6 }}>Address</div>
        <div style={{ fontSize:14, color:C.dark, marginBottom:20 }}>{student.address}</div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="green" size="md">View Full Profile</Btn>
          <Btn variant="outline" size="md" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </Modal>
  );
});

// ─── Staff Modal ──────────────────────────────────────────────────────────────
const StaffModal = memo(({ open, onClose, staff }) => {
  if (!staff) return null;
  return (
    <Modal open={open} onClose={onClose} width={480}>
      <div style={{ padding:24 }}>
        <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:20 }}>
          <Avatar name={staff.name} size={52} bg={C.navy} />
          <div>
            <h3 style={{ fontSize:18, fontWeight:700, color:C.dark }}>{staff.name}</h3>
            <div style={{ fontSize:13, color:C.muted }}>{staff.role} · {staff.dept}</div>
          </div>
          <Btn variant="outline" size="sm" onClick={onClose} style={{ marginLeft:"auto" }}>✕</Btn>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          <StatCard label="Salary" value={fmtINR(staff.salary)} accent={C.green} />
          <StatCard label="Status" value={staff.status} accent={statusColor(staff.status)} />
        </div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:4 }}>Joined</div>
        <div style={{ fontSize:14, color:C.dark, marginBottom:20 }}>{fmtDate(staff.joined)}</div>
        <Btn variant="outline" size="md" onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
});

// ─── Dashboard Modules ───────────────────────────────────────────────────────

// 1. Overview
const OverviewModule = memo(() => {
  const weeklyTrend = [
    { day:"Mon", pct:96 }, { day:"Tue", pct:94 }, { day:"Wed", pct:97 }, { day:"Thu", pct:93 }, { day:"Fri", pct:96 },
  ];
  const quickTiles = [
    { icon:"🎓", label:"Students",   val:"304", color:C.green },
    { icon:"👩‍🏫", label:"Teachers",   val:"6",   color:C.navy },
    { icon:"📚", label:"Courses",    val:"8",   color:C.purple },
    { icon:"💰", label:"Collected",  val:"₹87K", color:C.amber },
  ];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Students" value="304" sub="Enrolled this year" accent={C.green} icon="🎓" />
        <StatCard label="Present Today" value="284" sub="93.4% attendance rate" accent={C.navy} icon="✅" />
        <StatCard label="Fee Collected" value="₹87,500" sub="This month" accent={C.amber} icon="💰" />
        <StatCard label="Active Staff" value="5" sub="1 on leave" accent={C.purple} icon="👥" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24, marginBottom:24 }}>
        <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
          <SectionHeader title="Weekly Attendance Trend" subtitle="Mon–Fri this week" />
          <div style={{ display:"flex", gap:12, alignItems:"flex-end", height:120, paddingTop:16 }}>
            {weeklyTrend.map(d => (
              <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.muted }}>{d.pct}%</div>
                <div style={{ width:"100%", background:C.green, borderRadius:"4px 4px 0 0", height:`${(d.pct-88)*10}px`, minHeight:8 }} />
                <div style={{ fontSize:11, color:C.muted }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
          <SectionHeader title="Fee Collection" />
          <div style={{ textAlign:"center", marginTop:8 }}>
            <div style={{ fontSize:28, fontWeight:700, color:C.green }}>74%</div>
            <div style={{ fontSize:12, color:C.muted, margin:"4px 0 16px" }}>Collection rate</div>
            <ProgressBar value={74} showLabel />
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontSize:12, color:C.muted }}>
              <span>Collected: ₹87.5K</span>
              <span>Due: ₹25K</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24, marginBottom:24 }}>
        <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
          <SectionHeader title="Recent Activity" />
          <div>
            {DEMO_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0", borderBottom: i < DEMO_ACTIVITY.length-1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize:18 }}>{a.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:C.dark }}>{a.text}</div>
                </div>
                <div style={{ fontSize:11, color:C.muted, flexShrink:0 }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
          <SectionHeader title="Quick Stats" />
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {quickTiles.map(t => (
              <div key={t.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:8, background:C.bg }}>
                <span style={{ fontSize:14 }}>{t.icon} {t.label}</span>
                <span style={{ fontWeight:700, color:t.color }}>{t.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// 2. Attendance
const AttendanceModule = memo(() => {
  const [filter, setFilter] = useState("All");
  const filters = ["All","Present","Late","Absent"];
  const filtered = DEMO_ATTENDANCE_FEED.filter(s => filter === "All" || s.status === filter);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Present" value="284" sub="93.4%" accent={C.green} icon="✅" />
        <StatCard label="Late" value="12"  sub="3.9%"  accent="#7A5000" icon="⏰" />
        <StatCard label="Absent" value="8"   sub="2.6%"  accent={C.red}   icon="❌" />
        <StatCard label="Total"  value="304" sub="All students" accent={C.navy} icon="🎓" />
      </div>
      <div style={{ background:"#0d1117", borderRadius:12, padding:20, marginBottom:24, border:`1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ color:"#5AC87A", fontSize:13, fontFamily:F.mono, fontWeight:700 }}>● LIVE RECOGNITION FEED</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontFamily:F.mono, marginTop:2 }}>AI Face Attendance · Class X-A · {new Date().toLocaleDateString("en-IN")}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"4px 10px", borderRadius:6, fontSize:11, fontFamily:F.mono, fontWeight:600,
                background: filter === f ? "#2A6B4A" : "rgba(255,255,255,0.06)",
                color: filter === f ? "#5AC87A" : "rgba(255,255,255,0.5)", border:"none",
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ fontFamily:F.mono, fontSize:12 }}>
          {filtered.map((s, i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"100px 1fr 80px 80px 100px", gap:16, padding:"8px 4px", borderBottom:"1px solid rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.7)" }}>
              <span style={{ color:"rgba(255,255,255,0.3)" }}>{s.roll}</span>
              <span style={{ color:"rgba(255,255,255,0.9)" }}>{s.name}</span>
              <span style={{ color:"rgba(255,255,255,0.4)" }}>{s.time}</span>
              <span style={{ color: s.status==="Present" ? "#5AC87A" : s.status==="Late" ? "#f5a623" : "#e05252" }}>{s.status}</span>
              <span style={{ color:"rgba(255,255,255,0.3)" }}>{s.confidence}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// 3. Students
const StudentsModule = memo(() => {
  const modal = useModal();
  const { query, setQuery, filtered } = useSearch(DEMO_STUDENTS, ["name","class","id"]);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Students" value="304" accent={C.green} />
        <StatCard label="Present Today" value="284" accent={C.navy} />
        <StatCard label="Fee Defaulters" value="3" accent={C.red} />
        <StatCard label="New This Month" value="12" accent={C.amber} />
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Student Directory</h3>
          <div style={{ width:260 }}>
            <SearchBar value={query} onChange={setQuery} placeholder="Search students…" />
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["Student","Class","Roll","Attendance","Fees","Action"].map(h => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none", transition:"background 0.15s" }} onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <Avatar name={s.name} size={32} />
                    <span style={{ fontSize:14, fontWeight:500 }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", fontSize:13, color:C.muted }}>{s.class}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:C.muted, fontFamily:F.mono }}>{s.roll}</td>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <ProgressBar value={s.attendance} showLabel={false} height={4} style={{ width:60 }} />
                    <span style={{ fontSize:12, color: s.attendance > 85 ? C.green : C.red, fontWeight:600 }}>{s.attendance}%</span>
                  </div>
                </td>
                <td style={{ padding:"12px 16px" }}><Badge label={s.fees} status={s.fees} /></td>
                <td style={{ padding:"12px 16px" }}>
                  <Btn variant="ghost" size="sm" onClick={() => modal.show(s)}>View →</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StudentModal open={modal.open} onClose={modal.hide} student={modal.data} />
    </div>
  );
});

// 4. Staff & HR
const StaffModule = memo(() => {
  const modal = useModal();
  const { query, setQuery, filtered } = useSearch(DEMO_STAFF, ["name","role","dept"]);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Staff" value="6" accent={C.green} />
        <StatCard label="Active" value="5" accent={C.navy} />
        <StatCard label="On Leave" value="1" accent={C.amber} />
        <StatCard label="Avg Salary" value="₹53K" accent={C.purple} />
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Staff Directory</h3>
          <div style={{ width:260 }}><SearchBar value={query} onChange={setQuery} placeholder="Search staff…" /></div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["Employee","Role","Department","Salary","Status","Action"].map(h => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none" }}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <Avatar name={s.name} size={32} bg={C.navy} />
                    <span style={{ fontSize:14, fontWeight:500 }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>{s.role}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:C.muted }}>{s.dept}</td>
                <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono }}>{fmtINR(s.salary)}</td>
                <td style={{ padding:"12px 16px" }}><Badge label={s.status} status={s.status} /></td>
                <td style={{ padding:"12px 16px" }}>
                  <Btn variant="ghost" size="sm" onClick={() => modal.show(s)}>View →</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StaffModal open={modal.open} onClose={modal.hide} staff={modal.data} />
    </div>
  );
});

// 5. Leave
const LeaveModule = memo(() => {
  const [filter, setFilter] = useState("All");
  const [leaves, setLeaves] = useState(DEMO_LEAVE);
  const filters = ["All","Pending","Approved"];
  const filtered = leaves.filter(l => filter === "All" || l.status === filter);
  const handleAction = (id, status) => setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Requests" value={leaves.length} accent={C.green} />
        <StatCard label="Pending" value={leaves.filter(l=>l.status==="Pending").length} accent={C.amber} />
        <StatCard label="Approved" value={leaves.filter(l=>l.status==="Approved").length} accent={C.green} />
        <StatCard label="Rejected" value={leaves.filter(l=>l.status==="Rejected").length} accent={C.red} />
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Leave Requests</h3>
          <div style={{ display:"flex", gap:6 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600, fontFamily:F.sans,
                background: filter === f ? C.green : C.bg,
                color: filter === f ? "#fff" : C.muted, border:"none",
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div>
          {filtered.map((l, i) => (
            <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <Avatar name={l.name} size={36} bg={C.navy} />
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{l.name}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{l.type} · {fmtDate(l.from)} – {fmtDate(l.to)} · {l.days} day{l.days>1?"s":""}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>"{l.reason}"</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <Badge label={l.status} status={l.status} />
                {l.status === "Pending" && (
                  <>
                    <Btn variant="green" size="sm" onClick={() => handleAction(l.id, "Approved")}>Approve</Btn>
                    <Btn variant="danger" size="sm" onClick={() => handleAction(l.id, "Rejected")}>Reject</Btn>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// 6. Payroll
const PayrollModule = memo(() => {
  const { query, setQuery, filtered } = useSearch(DEMO_PAYROLL, ["name","role"]);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Payroll" value="₹3.2L" sub="June 2026" accent={C.green} />
        <StatCard label="Processed" value="3" accent={C.navy} />
        <StatCard label="Processing" value="2" accent={C.amber} />
        <StatCard label="Pending" value="1" accent={C.red} />
      </div>
      <div style={{ background:C.greenMuted, border:`1px solid ${C.green}30`, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.green }}>
        <strong>💡 Payroll Info:</strong> Payroll for June 2026 is in progress. 3 of 6 employees have been paid. Processing expected to complete by June 10.
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Payroll Register — June 2026</h3>
          <div style={{ width:260 }}><SearchBar value={query} onChange={setQuery} placeholder="Search employees…" /></div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["Employee","Role","Basic","HRA","Gross","Deductions","Net","Status"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none" }}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <Avatar name={p.name} size={28} bg={C.navy} />
                    <span style={{ fontSize:13, fontWeight:500 }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", fontSize:12, color:C.muted }}>{p.role}</td>
                {[p.basic, p.hra, p.gross, p.deductions, p.net].map((v, j) => (
                  <td key={j} style={{ padding:"12px 14px", fontSize:12, fontFamily:F.mono }}>{fmtINR(v)}</td>
                ))}
                <td style={{ padding:"12px 14px" }}><Badge label={p.status} status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// 7. Fees
const FeesModule = memo(() => {
  const [filter, setFilter] = useState("All");
  const { query, setQuery, filtered: searched } = useSearch(DEMO_FEES, ["name","class"]);
  const filtered = searched.filter(f => filter === "All" || f.status === filter);
  const total = DEMO_FEES.reduce((a,f) => a + f.amount, 0);
  const paid = DEMO_FEES.reduce((a,f) => a + f.paid, 0);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Expected" value={fmtINR(total)} accent={C.green} />
        <StatCard label="Collected" value={fmtINR(paid)} accent={C.navy} />
        <StatCard label="Due" value={fmtINR(total-paid)} accent={C.red} />
        <StatCard label="Collection Rate" value={`${Math.round(paid/total*100)}%`} accent={C.amber} />
      </div>
      <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Collection Progress</div>
        <ProgressBar value={paid} max={total} showLabel height={10} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12, color:C.muted }}>
          <span>Collected: {fmtINR(paid)}</span><span>Total: {fmtINR(total)}</span>
        </div>
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Fee Records</h3>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:200 }}><SearchBar value={query} onChange={setQuery} placeholder="Search…" /></div>
            <div style={{ display:"flex", gap:4 }}>
              {["All","Paid","Due","Partial"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding:"5px 10px", borderRadius:6, fontSize:11, fontWeight:600, fontFamily:F.sans,
                  background: filter===f ? C.green : C.bg, color: filter===f ? "#fff" : C.muted, border:"none",
                }}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["Student","Class","Amount","Paid","Due","Status","Due Date"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={f.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none" }}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <Avatar name={f.name} size={28} bg={C.amber} />
                    <span style={{ fontSize:13, fontWeight:500 }}>{f.name}</span>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", fontSize:12, color:C.muted }}>{f.class}</td>
                <td style={{ padding:"12px 14px", fontSize:12, fontFamily:F.mono }}>{fmtINR(f.amount)}</td>
                <td style={{ padding:"12px 14px", fontSize:12, fontFamily:F.mono, color:C.green }}>{fmtINR(f.paid)}</td>
                <td style={{ padding:"12px 14px", fontSize:12, fontFamily:F.mono, color:f.due > 0 ? C.red : C.muted }}>{fmtINR(f.due)}</td>
                <td style={{ padding:"12px 14px" }}><Badge label={f.status} status={f.status} /></td>
                <td style={{ padding:"12px 14px", fontSize:12, color:C.muted }}>{fmtDate(f.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// 8. Exams
const ExamsModule = memo(() => (
  <div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
      <StatCard label="Total Exams" value="5" accent={C.green} />
      <StatCard label="Upcoming" value="3" accent={C.navy} />
      <StatCard label="Active" value="1" accent={C.amber} />
      <StatCard label="Completed" value="1" accent={C.muted} />
    </div>
    <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <h3 style={{ fontSize:15, fontWeight:700 }}>Exam Schedule</h3>
      </div>
      <div>
        {DEMO_EXAMS.map((e, i) => (
          <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom: i < DEMO_EXAMS.length-1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:C.greenMuted, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📝</div>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{e.title}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Classes: {e.classes} · Max: {e.maxMarks} marks</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{fmtDate(e.date)}</div>
              </div>
              <Badge label={e.status} status={e.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

// 9. Assignments
const AssignmentsModule = memo(() => (
  <div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
      <StatCard label="Total" value="5" accent={C.green} />
      <StatCard label="Active" value="4" accent={C.navy} />
      <StatCard label="Avg Submission" value="78%" accent={C.amber} />
      <StatCard label="Overdue" value="1" accent={C.red} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
      {DEMO_ASSIGNMENTS.map(a => (
        <div key={a.id} style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:C.dark, marginBottom:4 }}>{a.title}</div>
              <div style={{ fontSize:12, color:C.muted }}>{a.class} · {a.teacher}</div>
            </div>
            <span style={{ fontSize:20 }}>📚</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.muted, marginBottom:12 }}>
            <span>Due: {fmtDate(a.due)}</span>
            <span style={{ fontWeight:600, color:C.dark }}>{a.submitted}/{a.total} submitted</span>
          </div>
          <ProgressBar value={a.submitted} max={a.total} showLabel />
        </div>
      ))}
    </div>
  </div>
));

// 10. LMS
const LMSModule = memo(() => {
  const [tab, setTab] = useState("dashboard");
  const [levelFilter, setLevelFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [quizFilter, setQuizFilter] = useState("All");
  const { query: courseQuery, setQuery: setCourseQuery, filtered: filteredCourses } = useSearch(LMS_COURSES, ["title","subject","level","code"]);
  const courseModal = useModal();
  const quizModal = useModal();
  const liveModal = useModal();
  const tabs = [
    { id:"dashboard", label:"Dashboard", icon:"⊞" },
    { id:"courses", label:"All Courses", icon:"📚" },
    { id:"quizzes", label:"Quizzes", icon:"❓" },
    { id:"library", label:"Library", icon:"🗂" },
    { id:"gradebook", label:"Gradebook", icon:"📊" },
  ];
  const subjects = ["All","Maths","Science","English","Hindi","SST","Physics","CS","PE"];
  const levels = ["All","Class IX","Class X","Class XI","Class XII"];
  const enrolled = LMS_COURSES.filter(c => c.enrolled);
  const displayCourses = filteredCourses.filter(c => (levelFilter === "All" || c.level.includes(levelFilter.replace("Class ",""))) && (subjectFilter === "All" || c.subject === subjectFilter));

  const liveSessions = [
    { title:"Physics: Wave Optics", teacher:"Ms. Ritu Bansal", duration:"45 min", scheduled:"Today 3:00 PM", attendees:"32/40", live:true, description:"Live session covering Chapter 10 of NCERT Physics XII — interference and diffraction patterns." },
  ];

  return (
    <div>
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, marginBottom:24, overflowX:"auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"10px 18px", fontSize:13, fontWeight:600, fontFamily:F.sans, flexShrink:0,
            borderBottom: tab === t.id ? `2px solid ${C.green}` : "2px solid transparent",
            marginBottom:-1, color: tab === t.id ? C.green : C.muted, background:"none", border:"none",
            borderBottom: tab === t.id ? `2px solid ${C.green}` : "2px solid transparent",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            <StatCard label="Enrolled" value={enrolled.length} accent={C.green} />
            <StatCard label="In Progress" value={enrolled.filter(c=>c.progress>0&&c.progress<100).length} accent={C.navy} />
            <StatCard label="Completed" value={enrolled.filter(c=>c.progress===100).length} accent={C.amber} />
            <StatCard label="Certificates" value="1" accent={C.purple} />
          </div>
          <SectionHeader title="Continue Learning" subtitle="Pick up where you left off" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:24 }}>
            {enrolled.filter(c => c.progress > 0 && c.progress < 100).map(c => (
              <div key={c.id} style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:48, height:48, borderRadius:10, background:`${c.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{c.title}</div>
                  <ProgressBar value={c.progress} showLabel />
                  <Btn variant="ghost" size="sm" style={{ marginTop:8, padding:0, color:C.green }} onClick={() => courseModal.show(c)}>Continue →</Btn>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}`, marginBottom:24 }}>
            <SectionHeader title="Live Classes" subtitle="Happening now" action={<Badge label="1 Live" status="Active" />} />
            {liveSessions.map((ls, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"none" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:"rgba(122,26,26,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🔴</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{ls.title}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{ls.teacher} · {ls.attendees} students</div>
                  </div>
                </div>
                <Btn variant="danger" size="sm" onClick={() => liveModal.show(ls)}>Join Live →</Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "courses" && (
        <div>
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200 }}><SearchBar value={courseQuery} onChange={setCourseQuery} placeholder="Search courses…" /></div>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ padding:"8px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.dark, background:C.surface }}>
              {levels.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
            {subjects.map(s => (
              <button key={s} onClick={() => setSubjectFilter(s)} style={{
                padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600, fontFamily:F.sans,
                background: subjectFilter===s ? C.dark : C.bg, color: subjectFilter===s ? "#fff" : C.muted, border:"none",
              }}>{s}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {displayCourses.map(c => (
              <div key={c.id} style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden", cursor:"pointer", transition:"transform 0.15s, box-shadow 0.15s" }}
                onClick={() => courseModal.show(c)}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ height:80, background:`linear-gradient(135deg, ${c.color}cc, ${c.color}66)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>{c.emoji}</div>
                <div style={{ padding:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:c.color, letterSpacing:"0.06em", marginBottom:4 }}>{c.code}</div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{c.title}</div>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>{c.level} · {c.duration}</div>
                  {c.enrolled && <ProgressBar value={c.progress} showLabel height={4} />}
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                    <span style={{ fontSize:11, color:C.muted }}>⭐ {c.rating} · {c.students} students</span>
                    {c.enrolled ? <Badge label="Enrolled" status="Active" /> : <Badge label="Enroll" status="Default" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "quizzes" && (
        <div>
          <div style={{ display:"flex", gap:6, marginBottom:20 }}>
            {["All","Maths","Science","English","SST","CS"].map(f => (
              <button key={f} onClick={() => setQuizFilter(f)} style={{
                padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600, fontFamily:F.sans,
                background: quizFilter===f ? C.dark : C.bg, color: quizFilter===f ? "#fff" : C.muted, border:"none",
              }}>{f}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
            {LMS_QUIZZES.filter(q => quizFilter === "All" || q.subject === quizFilter).map(q => (
              <div key={q.id} style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{q.title}</div>
                    <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{q.subject} · {q.questions} questions · {q.time} min</div>
                  </div>
                  <Badge label={q.difficulty} status={q.difficulty === "Easy" ? "Active" : q.difficulty === "Medium" ? "Pending" : "Due"} />
                </div>
                {q.attempts > 0 && (
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:12, fontSize:12, color:C.muted }}>
                    <span>Best: {q.bestScore}%</span> · <span>{q.attempts} attempt{q.attempts>1?"s":""}</span>
                  </div>
                )}
                <Btn variant="green" size="sm" onClick={() => quizModal.show(q)}>
                  {q.attempts > 0 ? "Retake Quiz" : "Start Quiz"}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "library" && (
        <div>
          <div style={{ display:"flex", gap:6, marginBottom:20 }}>
            {["All","Maths","Science","Physics","CS"].map(f => (
              <button key={f} onClick={() => setSubjectFilter(f)} style={{
                padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600, fontFamily:F.sans,
                background: subjectFilter===f ? C.dark : C.bg, color: subjectFilter===f ? "#fff" : C.muted, border:"none",
              }}>{f}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {LMS_LIBRARY.filter(l => subjectFilter === "All" || l.subject === subjectFilter).map(l => (
              <div key={l.id} style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:28, flexShrink:0 }}>{l.type === "PDF" ? "📄" : "🎬"}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{l.title}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{l.type} · {l.size}{l.pages ? ` · ${l.pages} pages` : ""}</div>
                  <Btn variant="outline" size="sm" style={{ marginTop:10 }}>Download</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "gradebook" && (
        <div>
          <SectionHeader title="Academic Performance" subtitle="Current term scores" />
          <div style={{ background:C.surface, borderRadius:12, padding:24, border:`1px solid ${C.border}`, marginBottom:24 }}>
            {LMS_GRADEBOOK.map((g, i) => (
              <div key={i} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{g.subject}</span>
                  <div style={{ display:"flex", gap:16, fontSize:12, color:C.muted }}>
                    <span>Term 1: {g.term1}</span>
                    <span style={{ fontWeight:700, color:g.color }}>Term 2: {g.score}</span>
                  </div>
                </div>
                <ProgressBar value={g.score} max={g.max} color={g.color} showLabel height={8} />
              </div>
            ))}
          </div>
          <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
            <SectionHeader title="Top Performers" />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[
                { rank:"🥇", name:"Arjun Mehta",  score:"91%", class:"X-A" },
                { rank:"🥈", name:"Sneha Verma",  score:"89%", class:"X-A" },
                { rank:"🥉", name:"Kavya Joshi",  score:"87%", class:"IX-B" },
              ].map(p => (
                <div key={p.name} style={{ textAlign:"center", padding:16, background:C.bg, borderRadius:10 }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{p.rank}</div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{p.class}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.green, marginTop:4 }}>{p.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CourseDetailModal open={courseModal.open} onClose={courseModal.hide} course={courseModal.data} />
      <QuizPlayerModal open={quizModal.open} onClose={quizModal.hide} quiz={quizModal.data} />
      <LiveClassModal open={liveModal.open} onClose={liveModal.hide} cls={liveModal.data} />
    </div>
  );
});

// 11. Parent Portal
const ParentModule = memo(() => {
  const child = DEMO_STUDENTS[0];
  const week = [
    { day:"Mon", present:true }, { day:"Tue", present:true }, { day:"Wed", present:false },
    { day:"Thu", present:true }, { day:"Fri", present:true },
  ];
  return (
    <div>
      <div style={{ background:C.surface, borderRadius:12, padding:24, border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ display:"flex", gap:20, alignItems:"center" }}>
          <Avatar name={child.name} size={64} bg={C.green} />
          <div>
            <h2 style={{ fontSize:20, fontWeight:700 }}>{child.name}</h2>
            <div style={{ fontSize:14, color:C.muted, marginTop:2 }}>{child.class} · Roll #{child.roll} · {child.address}</div>
            <AccountTypeBadge type="student" />
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Attendance" value={`${child.attendance}%`} accent={C.green} icon="✅" />
        <StatCard label="Fee Status" value={child.fees} accent={statusColor(child.fees)} icon="💰" />
        <StatCard label="Rank in Class" value="#2" accent={C.navy} icon="🏆" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
          <SectionHeader title="This Week's Attendance" />
          <div style={{ display:"flex", gap:12, justifyContent:"space-around" }}>
            {week.map(d => (
              <div key={d.day} style={{ textAlign:"center" }}>
                <div style={{
                  width:40, height:40, borderRadius:"50%", marginBottom:8,
                  background: d.present ? C.greenMuted : "rgba(122,26,26,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                }}>{d.present ? "✅" : "❌"}</div>
                <div style={{ fontSize:12, color:C.muted }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
          <SectionHeader title="Recent Grades" />
          {LMS_GRADEBOOK.slice(0,4).map((g, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize:13 }}>{g.subject}</span>
              <span style={{ fontWeight:700, color:g.color }}>{g.score}/100</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// 12. Notifications
const NotificationsModule = memo(() => {
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const filtered = notifications.filter(n => filter === "All" || (filter === "Unread" && !n.read) || (filter === "Read" && n.read));
  const typeIcon = { alert:"⚠️", info:"ℹ️", success:"✅" };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", gap:6 }}>
          {["All","Unread","Read"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600, fontFamily:F.sans,
              background: filter===f ? C.dark : C.bg, color: filter===f ? "#fff" : C.muted, border:"none",
            }}>{f}</button>
          ))}
        </div>
        <Btn variant="outline" size="sm" onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}>
          Mark all read
        </Btn>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(n => (
          <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{
            background:C.surface, borderRadius:12, padding:16, border:`1px solid ${n.read ? C.border : C.green}`,
            display:"flex", gap:14, alignItems:"flex-start", cursor:"pointer",
            opacity: n.read ? 0.8 : 1, transition:"opacity 0.15s",
          }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{typeIcon[n.type] || "🔔"}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:14, color:C.dark }}>{n.title}</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{n.body}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
              <span style={{ fontSize:11, color:C.muted }}>{n.time}</span>
              {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:C.green }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// 13. Reports
const ReportsModule = memo(() => {
  const [tab, setTab] = useState("attendance");
  const tabs = ["Attendance","Fees","Payroll","Academic"];
  const barData = {
    attendance: [{ l:"Apr", v:94 },{ l:"May", v:92 },{ l:"Jun", v:93 }],
    fees: [{ l:"Apr", v:88 },{ l:"May", v:74 },{ l:"Jun", v:60 }],
    payroll: [{ l:"Apr", v:100 },{ l:"May", v:100 },{ l:"Jun", v:50 }],
    academic: [{ l:"Maths", v:88 },{ l:"Science", v:86 },{ l:"English", v:80 },{ l:"Hindi", v:78 },{ l:"SST", v:80 },{ l:"CS", v:94 }],
  };
  const data = barData[tab] || [];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Attendance Rate" value="93.4%" accent={C.green} />
        <StatCard label="Fee Collection" value="74%" accent={C.amber} />
        <StatCard label="Payroll Done" value="50%" accent={C.navy} />
        <StatCard label="Avg Score" value="84.3%" accent={C.purple} />
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())} style={{
              padding:"12px 20px", fontSize:13, fontWeight:600, fontFamily:F.sans,
              borderBottom: tab === t.toLowerCase() ? `2px solid ${C.green}` : "2px solid transparent",
              marginBottom:-1, color: tab === t.toLowerCase() ? C.green : C.muted, background:"none", border:"none",
              borderBottom: tab===t.toLowerCase() ? `2px solid ${C.green}` : "2px solid transparent",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ padding:24 }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-end", height:160 }}>
            {data.map(d => (
              <div key={d.l} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.dark }}>{d.v}%</span>
                <div style={{ width:"100%", background:C.green, borderRadius:"4px 4px 0 0", height:`${d.v * 1.4}px`, transition:"height 0.4s ease" }} />
                <span style={{ fontSize:11, color:C.muted }}>{d.l}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn variant="outline" size="sm">📥 Export PDF</Btn>
            <Btn variant="outline" size="sm">📊 Export CSV</Btn>
          </div>
        </div>
      </div>
    </div>
  );
});

// 14. Team & Roles
const TeamModule = memo(() => (
  <RoleGuard permission="manage_subscription">
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Members" value={DEMO_TEAM.length + 1} accent={C.green} />
        <StatCard label="Admins" value="1" accent={C.navy} />
        <StatCard label="Teachers" value="1" accent={C.purple} />
        <StatCard label="Pending Invites" value="0" accent={C.amber} />
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:24 }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Team Members</h3>
          <Btn variant="green" size="sm">+ Invite Member</Btn>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["Member","Email","Role","Status","Joined"].map(h => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_TEAM.map((m, i) => (
              <tr key={m.id} style={{ borderBottom: i < DEMO_TEAM.length-1 ? `1px solid ${C.border}` : "none" }}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <Avatar name={m.name} size={32} bg={m.role === "admin" ? C.navy : C.purple} />
                    <span style={{ fontSize:14, fontWeight:500 }}>{m.name}</span>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, color:C.muted }}>{m.email}</td>
                <td style={{ padding:"12px 16px" }}><AccountTypeBadge type={m.role} /></td>
                <td style={{ padding:"12px 16px" }}><Badge label={m.status} status={m.status} /></td>
                <td style={{ padding:"12px 16px", fontSize:12, color:C.muted }}>{fmtDate(m.joined)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SectionHeader title="Role Permissions" subtitle="What each role can access" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {["admin","teacher","student"].map(role => (
          <div key={role} style={{ background:C.surface, borderRadius:12, padding:20, border:`1px solid ${C.border}` }}>
            <AccountTypeBadge type={role} />
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:6 }}>
              {(ROLE_PERMISSIONS[role] || []).map(p => (
                <div key={p} style={{ display:"flex", gap:8, alignItems:"center", fontSize:12 }}>
                  <span style={{ color:C.green }}>✓</span>
                  <span style={{ color:C.muted }}>{p.replace(/_/g," ")}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </RoleGuard>
));

// 15. Billing
const BillingModule = memo(() => (
  <RoleGuard permission="manage_billing">
    <div>
      <div style={{ background:`linear-gradient(135deg, ${C.green}, #1a4a30)`, borderRadius:16, padding:28, color:"#fff", marginBottom:24 }}>
        <div style={{ fontSize:12, opacity:0.7, marginBottom:8 }}>CURRENT PLAN</div>
        <div style={{ fontSize:28, fontWeight:700, marginBottom:4 }}>Standard Plan</div>
        <div style={{ fontSize:14, opacity:0.8, marginBottom:20 }}>₹4,999/month · Renews July 1, 2026</div>
        <div style={{ display:"flex", gap:24, fontSize:13 }}>
          {["Up to 500 students","AI Face Attendance","Full LMS","Priority Support"].map(f => (
            <span key={f} style={{ opacity:0.8 }}>✓ {f}</span>
          ))}
        </div>
      </div>
      <SectionHeader title="Billing History" />
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["Invoice","Date","Plan","Amount","Status"].map(h => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_INVOICES.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: i < DEMO_INVOICES.length-1 ? `1px solid ${C.border}` : "none" }}>
                <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono, color:C.green }}>{inv.id}</td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>{fmtDate(inv.date)}</td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>{inv.plan}</td>
                <td style={{ padding:"12px 16px", fontSize:13, fontFamily:F.mono }}>{fmtINR(inv.amount)}</td>
                <td style={{ padding:"12px 16px" }}><Badge label={inv.status} status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </RoleGuard>
));

// ─── Module Router ────────────────────────────────────────────────────────────
const MODULE_MAP = {
  overview: OverviewModule,
  attendance: AttendanceModule,
  students: StudentsModule,
  staff: StaffModule,
  leave: LeaveModule,
  payroll: PayrollModule,
  fees: FeesModule,
  exams: ExamsModule,
  assignments: AssignmentsModule,
  lms: LMSModule,
  parent: ParentModule,
  notifications: NotificationsModule,
  reports: ReportsModule,
  team: TeamModule,
  billing: BillingModule,
};

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
const Dashboard = memo(({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { role } = useRole() || { role: "owner" };
  const { profile } = useUserProfile() || {};
  const { active, days, org } = useTrial() || { active: true, days: 7, org: null };

  const visibleTabs = NAV_TABS.filter(t => t.roles.includes(role));
  const ActiveModule = MODULE_MAP[activeTab] || OverviewModule;
  const activeNavTab = NAV_TABS.find(t => t.id === activeTab);

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:C.bg }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 60, transition:"width 0.2s ease",
        background:C.dark, display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto",
      }}>
        <div style={{ padding:"20px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {sidebarOpen && (
            <div>
              <div style={{ color:"#fff", fontFamily:F.serif, fontSize:18, fontWeight:400 }}>NexaAttend</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontFamily:F.mono, letterSpacing:"0.08em" }}>SCHOOL ERP</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ color:"rgba(255,255,255,0.5)", fontSize:16, padding:4 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {sidebarOpen && profile && (
          <div style={{ padding:"0 16px 16px", display:"flex", gap:10, alignItems:"center" }}>
            <Avatar name={user.displayName || "User"} size={32} bg={C.green} />
            <div>
              <div style={{ color:"#fff", fontSize:12, fontWeight:600, lineHeight:1.3 }}>{user.displayName?.split(" ")[0]}</div>
              <AccountTypeBadge type={profile.accountType || "owner"} />
            </div>
          </div>
        )}
        <div style={{ flex:1, paddingBottom:16 }}>
          {visibleTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              width:"100%", padding: sidebarOpen ? "10px 16px" : "10px", display:"flex", gap:10,
              alignItems:"center", textAlign:"left", background: activeTab === tab.id ? "rgba(90,200,122,0.12)" : "transparent",
              color: activeTab === tab.id ? C.greenLight : "rgba(255,255,255,0.6)",
              borderLeft: activeTab === tab.id ? `3px solid ${C.greenLight}` : "3px solid transparent",
              transition:"all 0.15s",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{tab.icon}</span>
              {sidebarOpen && <span style={{ fontSize:13, fontWeight:500, whiteSpace:"nowrap" }}>{tab.label}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding:16, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={onLogout} style={{
            width:"100%", padding:"8px 12px", borderRadius:8, background:"rgba(122,26,26,0.15)",
            color:"rgba(255,100,100,0.8)", fontSize:12, fontFamily:F.sans,
            display:"flex", gap:8, alignItems:"center", justifyContent: sidebarOpen ? "flex-start" : "center",
          }}>
            <span>🚪</span>{sidebarOpen && "Sign Out"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <TrialStatusBanner />
        <div style={{ padding:"0 28px", borderBottom:`1px solid ${C.border}`, background:C.surface, display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:56, flexShrink:0 }}>
          <div>
            <h1 style={{ fontSize:16, fontWeight:700, color:C.dark }}>{activeNavTab?.label || "Overview"}</h1>
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <button onClick={() => setActiveTab("notifications")} style={{ fontSize:18, position:"relative" }}>
              🔔
              {DEMO_NOTIFICATIONS.filter(n => !n.read).length > 0 && (
                <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%", background:C.red, color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {DEMO_NOTIFICATIONS.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <Avatar name={user.displayName || "User"} size={32} bg={C.green} />
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <ActiveModule />
        </div>
      </div>
    </div>
  );
});

// ─── Onboarding Flow ──────────────────────────────────────────────────────────
const OnboardingPage = memo(({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState(null);
  const [ownerStep, setOwnerStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [studentId, setStudentId] = useState("");
  const [schoolForm, setSchoolForm] = useState({ name:"", address:"", city:"", state:"Gujarat", phone:"", board:"CBSE", studentCount:300 });
  const [childId, setChildId] = useState("");

  const BOARDS = ["CBSE","ICSE","GSEB","IB","Cambridge"];
  const accountTypes = [
    { type:"owner",   label:"School Owner",  emoji:"👑", desc:"Set up your school's complete ERP. 7-day free trial.",    color:C.green },
    { type:"teacher", label:"Teacher",        emoji:"👨‍🏫", desc:"Join your school and manage classes.",                   color:C.navy },
    { type:"student", label:"Student",        emoji:"🎓", desc:"Access your courses, assignments, grades.",              color:C.purple },
    { type:"parent",  label:"Parent",         emoji:"👪", desc:"Track your child's progress.",                           color:C.amber },
  ];

  const plans = [
    { name:"Basic",    price:"₹2,999/mo",  features:["Up to 200 students","Attendance","Fees","Basic Reports"] },
    { name:"Standard", price:"₹4,999/mo",  features:["Up to 500 students","AI Attendance","Full LMS","Priority Support"] },
    { name:"Premium",  price:"₹8,999/mo",  features:["Unlimited students","All features","Custom branding","Dedicated manager"] },
  ];

  const handleOwnerComplete = async () => {
    setLoading(true); setError(null);
    try {
      const orgId = `org_${user.uid.slice(0,8)}`;
      const now = new Date();
      const trialEnd = new Date(now); trialEnd.setDate(trialEnd.getDate() + 7);
      await withRetry(() => setDoc(doc(db, "organizations", orgId), {
        ...schoolForm, ownerUid: user.uid, plan:"trial", status:"active",
        trialStartDate: serverTimestamp(), trialEndDate: Timestamp.fromDate(trialEnd),
        createdAt: serverTimestamp(),
      }));
      await withRetry(() => setDoc(doc(db, "userProfiles", user.uid), {
        displayName: user.displayName, email: user.email, photoURL: user.photoURL,
        accountType:"owner", orgId, role:"owner", createdAt: serverTimestamp(),
      }));
      onComplete();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleInviteJoin = async () => {
    if (!inviteCode.trim()) { setError("Enter an invite code."); return; }
    setLoading(true); setError(null);
    try {
      await withRetry(() => setDoc(doc(db, "userProfiles", user.uid), {
        displayName: user.displayName, email: user.email, photoURL: user.photoURL,
        accountType, orgId: inviteCode.trim(), role: accountType,
        ...(accountType === "student" ? { studentId } : {}),
        createdAt: serverTimestamp(),
      }));
      onComplete();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleParentLink = async () => {
    if (!childId.trim()) { setError("Enter your child's student ID."); return; }
    setLoading(true); setError(null);
    try {
      await withRetry(() => setDoc(doc(db, "userProfiles", user.uid), {
        displayName: user.displayName, email: user.email, photoURL: user.photoURL,
        accountType:"parent", childStudentId: childId, createdAt: serverTimestamp(),
      }));
      onComplete();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const Card = ({ item }) => (
    <div onClick={() => { setAccountType(item.type); setStep(2); }} style={{
      background:C.surface, border:`2px solid ${accountType === item.type ? item.color : C.border}`,
      borderRadius:16, padding:24, cursor:"pointer", transition:"all 0.2s",
      boxShadow: accountType === item.type ? `0 0 0 4px ${item.color}22` : "none",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; }}
      onMouseLeave={e => { if (accountType !== item.type) e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ fontSize:40, marginBottom:12 }}>{item.emoji}</div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:6, color:item.color }}>{item.label}</div>
      <div style={{ fontSize:13, color:C.muted, lineHeight:1.5 }}>{item.desc}</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:600 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontFamily:F.serif, fontSize:28, color:C.dark }}>NexaAttend</div>
          <h2 style={{ fontFamily:F.serif, fontSize:22, marginTop:8 }}>
            {step === 1 ? "Welcome! What describes you?" : accountType === "owner" ? (ownerStep === 1 ? "Set up your school" : "Choose a plan") : accountType === "parent" ? "Link to your child" : "Join your school"}
          </h2>
          {(accountType === "owner") && step === 2 && (
            <div style={{ height:4, borderRadius:4, background:C.faint, marginTop:16, overflow:"hidden" }}>
              <div style={{ height:"100%", background:C.green, width: ownerStep === 1 ? "50%" : "100%", transition:"width 0.3s" }} />
            </div>
          )}
        </div>

        {step === 1 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {accountTypes.map(item => <Card key={item.type} item={item} />)}
          </div>
        )}

        {step === 2 && accountType === "owner" && ownerStep === 1 && (
          <div style={{ background:C.surface, borderRadius:16, padding:28, border:`1px solid ${C.border}` }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[
                { label:"School Name", key:"name", placeholder:"e.g. Sunrise Academy" },
                { label:"City", key:"city", placeholder:"e.g. Ahmedabad" },
                { label:"Address", key:"address", placeholder:"Full address" },
                { label:"Phone", key:"phone", placeholder:"School contact number" },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.key === "address" ? "1/-1" : "auto" }}>
                  <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>{f.label}</label>
                  <input value={schoolForm[f.key]} onChange={e => setSchoolForm(s => ({ ...s, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width:"100%", padding:"10px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, color:C.dark }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Board</label>
                <select value={schoolForm.board} onChange={e => setSchoolForm(s => ({ ...s, board:e.target.value }))}
                  style={{ width:"100%", padding:"10px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, color:C.dark, background:C.surface }}>
                  {BOARDS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Students: {schoolForm.studentCount}</label>
                <input type="range" min={50} max={2000} step={50} value={schoolForm.studentCount}
                  onChange={e => setSchoolForm(s => ({ ...s, studentCount: +e.target.value }))}
                  style={{ width:"100%", accentColor:C.green }} />
              </div>
            </div>
            <div style={{ marginTop:20, display:"flex", justifyContent:"flex-end" }}>
              <Btn variant="green" size="lg" onClick={() => setOwnerStep(2)} disabled={!schoolForm.name}>Continue →</Btn>
            </div>
          </div>
        )}

        {step === 2 && accountType === "owner" && ownerStep === 2 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
              {plans.map((p, i) => (
                <div key={p.name} style={{
                  background:C.surface, border:`2px solid ${i===1 ? C.green : C.border}`,
                  borderRadius:16, padding:20, textAlign:"center", position:"relative",
                }}>
                  {i===1 && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:C.green, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:10 }}>POPULAR</div>}
                  <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{p.name}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:C.green, marginBottom:12 }}>{p.price}</div>
                  {p.features.map(f => <div key={f} style={{ fontSize:12, color:C.muted, marginBottom:4 }}>✓ {f}</div>)}
                </div>
              ))}
            </div>
            {error && <div style={{ color:C.red, fontSize:13, marginBottom:12, textAlign:"center" }}>{error}</div>}
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <Btn variant="outline" onClick={() => setOwnerStep(1)}>← Back</Btn>
              <Btn variant="green" size="lg" onClick={handleOwnerComplete} disabled={loading}>
                {loading ? "Setting up…" : "Start Free Trial →"}
              </Btn>
            </div>
          </div>
        )}

        {step === 2 && (accountType === "teacher" || accountType === "student") && (
          <div style={{ background:C.surface, borderRadius:16, padding:28, border:`1px solid ${C.border}` }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Invite Code</label>
              <input value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                placeholder="Enter your school's invite code" style={{ fontFamily:F.mono, width:"100%", padding:"12px 14px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:16, letterSpacing:"0.08em", color:C.dark }} />
            </div>
            {accountType === "student" && (
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Student ID</label>
                <input value={studentId} onChange={e => setStudentId(e.target.value)}
                  placeholder="e.g. S001" style={{ width:"100%", padding:"12px 14px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, color:C.dark }} />
              </div>
            )}
            {error && <div style={{ color:C.red, fontSize:13, marginBottom:12 }}>{error}</div>}
            <div style={{ display:"flex", gap:12 }}>
              <Btn variant="outline" onClick={() => setStep(1)}>← Back</Btn>
              <Btn variant="green" size="lg" onClick={handleInviteJoin} disabled={loading}>
                {loading ? "Joining…" : "Join School →"}
              </Btn>
            </div>
          </div>
        )}

        {step === 2 && accountType === "parent" && (
          <div style={{ background:C.surface, borderRadius:16, padding:28, border:`1px solid ${C.border}` }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Child's Student ID</label>
              <input value={childId} onChange={e => setChildId(e.target.value)}
                placeholder="e.g. S001" style={{ width:"100%", padding:"12px 14px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, color:C.dark }} />
            </div>
            {childId && <div style={{ padding:"10px 14px", borderRadius:8, background:C.greenMuted, fontSize:13, color:C.green, marginBottom:16 }}>
              ✓ Linking to student: Arjun Mehta (demo)
            </div>}
            {error && <div style={{ color:C.red, fontSize:13, marginBottom:12 }}>{error}</div>}
            <div style={{ display:"flex", gap:12 }}>
              <Btn variant="outline" onClick={() => setStep(1)}>← Back</Btn>
              <Btn variant="green" size="lg" onClick={handleParentLink} disabled={loading}>
                {loading ? "Linking…" : "Link Account →"}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Landing Page ─────────────────────────────────────────────────────────────
const LandingPage = memo(({ onLogin, loginLoading }) => {
  const scrolled = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activePricingTab, setActivePricingTab] = useState("monthly");

  const tickerItems = [
    "AI Face Attendance","Smart Timetable","Fee Management","Payroll Automation",
    "Live LMS","Parent Portal","Exam Engine","Assignment Tracker",
    "Real-time Reports","Staff HR Module",
  ];

  const features = [
    { icon:"🤖", title:"AI Face Attendance", desc:"Auto-mark attendance using facial recognition. No proxies, no manual entry — just accuracy.", color:C.green },
    { icon:"📚", title:"Full-Featured LMS",  desc:"Courses, quizzes, live classes, library, gradebook — everything your school needs.", color:C.navy },
    { icon:"💰", title:"Fee & Payroll",      desc:"Collect fees online, manage payroll, and get real-time financial dashboards.", color:C.amber },
    { icon:"👪", title:"Parent Portal",      desc:"Keep parents informed with live attendance, fee status, and academic progress.", color:C.purple },
  ];

  const pricingPlans = [
    {
      name:"Basic", monthly:"₹2,999", yearly:"₹27,990", setup:"₹45,000",
      features:["200 students","AI Attendance","Fee Management","Basic LMS","Email Support"],
    },
    {
      name:"Standard", monthly:"₹4,999", yearly:"₹47,990", setup:"₹45,000", popular:true,
      features:["500 students","AI Attendance","Full LMS","Payroll","Parent Portal","Priority Support"],
    },
    {
      name:"Premium", monthly:"₹8,999", yearly:"₹85,990", setup:"₹45,000",
      features:["Unlimited students","All features","Custom branding","API access","Dedicated manager"],
    },
  ];

  const faqs = [
    { q:"Is there really no credit card required?", a:"Absolutely. Your 7-day trial starts the moment you sign up with Google. No card, no billing info, no commitment." },
    { q:"What happens after the trial ends?", a:"You'll see a prompt to choose a plan. Your data stays safe — nothing gets deleted." },
    { q:"How accurate is the AI face attendance?", a:"Our model achieves 99.2% accuracy in typical classroom lighting conditions. It flags low-confidence reads for manual review." },
    { q:"Can parents see attendance in real-time?", a:"Yes. The Parent Portal updates within minutes of attendance being marked each morning." },
    { q:"What boards does NexaAttend support?", a:"CBSE, ICSE, GSEB, IB, Cambridge, and all state boards. The system is curriculum-agnostic." },
    { q:"Is there a setup fee?", a:"Yes, a one-time setup of ₹45,000 (reduced from ₹75,000) covers data migration, customization, and 2 days of on-site training." },
    { q:"Can I import our existing student data?", a:"Yes. We support Excel/CSV import and provide a guided migration tool during onboarding." },
    { q:"Is the data stored in India?", a:"Yes. All data is stored on Google Cloud servers in Mumbai (asia-south1) under Firebase." },
    { q:"How many devices can a teacher use?", a:"Unlimited. NexaAttend is fully web-based and works on any device with a browser." },
    { q:"Do you offer a demo before signup?", a:"Yes — WhatsApp us at +91 98765 43210 or click 'Book a Demo' below for a live walkthrough." },
  ];

  const steps = [
    { n:"1", title:"Sign up free", desc:"Create an account with Google in one click. No card needed." },
    { n:"2", title:"Set up your school", desc:"Add classes, students, and staff in minutes with bulk import." },
    { n:"3", title:"Go live", desc:"Activate AI attendance, share the parent app link, and you're running." },
    { n:"4", title:"Scale up", desc:"As you grow, unlock LMS, payroll, and advanced reports with a click." },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      {/* Navbar */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(247,245,239,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition:"all 0.2s",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:F.serif, fontSize:22, color:C.dark }}>NexaAttend</div>
          <div style={{ display:"flex", gap:32, alignItems:"center" }}>
            <div style={{ display:"flex", gap:24 }}>
              {["Features","Pricing","FAQ"].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize:14, color:C.muted, fontWeight:500 }}>{l}</a>
              ))}
            </div>
            <Btn variant="green" size="md" onClick={onLogin} disabled={loginLoading}>
              {loginLoading ? "Signing in…" : "Start Free Trial"}
            </Btn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"120px 24px 80px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.greenMuted, padding:"6px 16px", borderRadius:20, marginBottom:24 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:C.green, display:"inline-block", animation:"pulse 2s infinite" }} />
          <span style={{ fontSize:12, fontWeight:700, color:C.green, letterSpacing:"0.04em" }}>7-DAY FREE TRIAL · NO CARD REQUIRED</span>
        </div>
        <h1 style={{ fontFamily:F.serif, fontSize:"clamp(36px,5vw,64px)", lineHeight:1.1, color:C.dark, maxWidth:800, margin:"0 auto 24px" }}>
          India's Smartest School ERP with AI Face Attendance
        </h1>
        <p style={{ fontSize:18, color:C.muted, maxWidth:560, margin:"0 auto 40px", lineHeight:1.6 }}>
          One platform for attendance, fees, LMS, payroll, exams, and parent communication — built for Indian schools.
        </p>
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn variant="green" size="lg" onClick={onLogin} disabled={loginLoading} style={{ minWidth:180 }}>
            {loginLoading ? "Signing in…" : "Get Started Free →"}
          </Btn>
          <Btn variant="outline" size="lg">Watch Demo ▶</Btn>
        </div>
        <div style={{ display:"flex", gap:48, justifyContent:"center", marginTop:56, flexWrap:"wrap" }}>
          {[["500+","Schools live"],["1.2L+","Students tracked"],["99.2%","Face accuracy"],["₹0","To start"]].map(([v,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:700, color:C.dark, fontFamily:F.serif }}>{v}</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker */}
      <div style={{ background:C.dark, padding:"14px 0", overflow:"hidden", borderTop:`1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display:"flex", animation:"tickerScroll 20s linear infinite", width:"200%", gap:0 }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ padding:"0 24px", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:500, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ color:C.greenLight }}>★</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ maxWidth:1200, margin:"0 auto", padding:"96px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:C.green, marginBottom:12 }}>MODULES</div>
          <h2 style={{ fontFamily:F.serif, fontSize:"clamp(28px,3vw,44px)", color:C.dark }}>Everything your school needs</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:24 }}>
          {features.map(f => (
            <FadeIn key={f.title}>
              <div style={{ background:C.surface, borderRadius:16, padding:28, border:`1px solid ${C.border}`, height:"100%" }}>
                <div style={{ fontSize:36, marginBottom:16 }}>{f.icon}</div>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8, color:f.color }}>{f.title}</h3>
                <p style={{ fontSize:14, color:C.muted, lineHeight:1.6 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background:C.surface, padding:"96px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:64 }}>
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:C.green, marginBottom:12 }}>HOW IT WORKS</div>
            <h2 style={{ fontFamily:F.serif, fontSize:"clamp(28px,3vw,44px)", color:C.dark }}>Up and running in a day</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:32 }}>
            {steps.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.1}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:C.green, color:"#fff", fontSize:20, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>{s.n}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                  <p style={{ fontSize:14, color:C.muted, lineHeight:1.6 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ maxWidth:1200, margin:"0 auto", padding:"96px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:C.green, marginBottom:12 }}>PRICING</div>
          <h2 style={{ fontFamily:F.serif, fontSize:"clamp(28px,3vw,44px)", color:C.dark, marginBottom:12 }}>Transparent pricing</h2>
          <p style={{ fontSize:15, color:C.muted }}>One-time setup: <s style={{ opacity:0.5 }}>₹75,000</s> → <strong style={{ color:C.green }}>₹45,000</strong> (limited time)</p>
          <div style={{ display:"inline-flex", gap:0, borderRadius:8, border:`1px solid ${C.border}`, marginTop:24, background:C.surface, overflow:"hidden" }}>
            {["monthly","yearly"].map(t => (
              <button key={t} onClick={() => setActivePricingTab(t)} style={{
                padding:"8px 20px", fontSize:13, fontWeight:600, fontFamily:F.sans,
                background: activePricingTab===t ? C.dark : "transparent",
                color: activePricingTab===t ? "#fff" : C.muted, border:"none",
              }}>{t === "yearly" ? "Yearly (2 months free)" : "Monthly"}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
          {pricingPlans.map(p => (
            <FadeIn key={p.name}>
              <div style={{
                background:C.surface, border:`2px solid ${p.popular ? C.green : C.border}`,
                borderRadius:16, padding:28, position:"relative", height:"100%",
                boxShadow: p.popular ? `0 8px 32px rgba(42,107,74,0.15)` : "none",
              }}>
                {p.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:C.green, color:"#fff", fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:12, letterSpacing:"0.06em" }}>MOST POPULAR</div>}
                <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:32, fontWeight:700, color:C.green, marginBottom:4 }}>{activePricingTab==="yearly" ? p.yearly : p.monthly}</div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:24 }}>per {activePricingTab==="yearly" ? "year" : "month"}</div>
                {p.features.map(f => (
                  <div key={f} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
                    <span style={{ color:C.green, fontSize:14 }}>✓</span>
                    <span style={{ fontSize:14, color:C.muted }}>{f}</span>
                  </div>
                ))}
                <Btn variant={p.popular ? "green" : "outline"} size="lg" onClick={onLogin} style={{ width:"100%", justifyContent:"center", marginTop:24 }}>
                  Start 7-Day Trial
                </Btn>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Guarantee Section */}
      <div style={{ background:C.dark, padding:"80px 24px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:20 }}>🛡️</div>
          <h2 style={{ fontFamily:F.serif, fontSize:"clamp(24px,3vw,36px)", color:"#fff", marginBottom:16 }}>7-day free trial, no questions asked</h2>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:16, lineHeight:1.7, marginBottom:32 }}>
            Try every feature — AI attendance, LMS, fee management, reports — completely free for 7 days. No credit card. Cancel anytime.
          </p>
          <Btn variant="green" size="lg" onClick={onLogin} style={{ minWidth:200, justifyContent:"center" }}>
            Start Free Trial Now →
          </Btn>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={{ maxWidth:800, margin:"0 auto", padding:"96px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:C.green, marginBottom:12 }}>FAQ</div>
          <h2 style={{ fontFamily:F.serif, fontSize:"clamp(28px,3vw,44px)", color:C.dark }}>Common questions</h2>
        </div>
        <div>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom:`1px solid ${C.border}`, overflow:"hidden" }}>
              <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} style={{
                width:"100%", padding:"20px 0", display:"flex", justifyContent:"space-between", alignItems:"center",
                textAlign:"left", fontFamily:F.sans, fontSize:15, fontWeight:600, color:C.dark,
              }}>
                {f.q}
                <span style={{ fontSize:18, transform: activeFaq === i ? "rotate(45deg)" : "none", transition:"transform 0.2s", flexShrink:0, marginLeft:16 }}>+</span>
              </button>
              {activeFaq === i && (
                <div style={{ paddingBottom:20, fontSize:14, color:C.muted, lineHeight:1.7, animation:"fadeIn 0.2s ease" }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp CTA */}
      <div style={{ background:C.surface, padding:"64px 24px", textAlign:"center", borderTop:`1px solid ${C.border}` }}>
        <h2 style={{ fontFamily:F.serif, fontSize:28, marginBottom:12 }}>Want a live demo?</h2>
        <p style={{ color:C.muted, marginBottom:24 }}>WhatsApp us and we'll set up a 30-minute walkthrough of NexaAttend for your school.</p>
        <Btn variant="green" size="lg" style={{ minWidth:200, justifyContent:"center" }}>
          📱 Book a Demo on WhatsApp
        </Btn>
      </div>

      {/* Footer */}
      <footer style={{ background:C.dark, padding:"40px 24px", textAlign:"center" }}>
        <div style={{ fontFamily:F.serif, fontSize:20, color:"#fff", marginBottom:8 }}>NexaAttend</div>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>© 2026 NexaAttend. Built for Indian schools.</div>
        <div style={{ display:"flex", gap:24, justifyContent:"center", marginTop:16 }}>
          {["Privacy Policy","Terms of Service","Contact"].map(l => (
            <a key={l} href="#" style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
});

// ─── Trial Guard ──────────────────────────────────────────────────────────────
const TrialGuard = memo(({ user, profile, onLogout, children }) => {
  const { loading, offline, error, active, refresh } = useTrial() || {};
  if (loading) return <AuthLoadingScreen />;
  if (offline) return <OfflineScreen onRetry={refresh} />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (profile?.accountType === "owner" && !active) return <ExpiredTrialPage onLogout={onLogout} />;
  return children;
});

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(undefined);
  const [loginLoading, setLoginLoading] = useState(false);
  const [page, setPage] = useState(() => window.location.hash.replace("#", "") || "/");

  useEffect(() => {
    const h = () => setPage(window.location.hash.replace("#", "") || "/");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const navigate = (p) => { window.location.hash = p; setPage(p); };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) { console.error(e); }
    finally { setLoginLoading(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Loading state while auth initializes
  if (user === undefined) return (<><GlobalStyles /><AuthLoadingScreen /></>);

  // Unauthenticated
  if (!user) return (<><GlobalStyles /><LandingPage onLogin={handleLogin} loginLoading={loginLoading} /></>);

  // Authenticated — wrap in UserProfileProvider
  return (
    <>
      <GlobalStyles />
      <UserProfileProvider user={user}>
        <AuthenticatedApp user={user} onLogout={handleLogout} navigate={navigate} page={page} />
      </UserProfileProvider>
    </>
  );
}

// ─── Authenticated App (split out to access UserProfileCtx) ──────────────────
function AuthenticatedApp({ user, onLogout, navigate, page }) {
  const { profile, loading, needsOnboarding } = useUserProfile();

  useEffect(() => {
    if (!loading && needsOnboarding && page !== "/onboarding") navigate("/onboarding");
    else if (!loading && !needsOnboarding && (page === "/" || page === "/onboarding")) navigate("/demo");
  }, [loading, needsOnboarding, page]);

  if (loading) return <AuthLoadingScreen />;
  if (needsOnboarding || page === "/onboarding") {
    return <OnboardingPage user={user} onComplete={() => navigate("/demo")} />;
  }
  if (page === "/demo" && profile) {
    return (
      <TrialProvider user={user} profile={profile}>
        <RoleProvider user={user} profile={profile}>
          <TrialGuard user={user} profile={profile} onLogout={onLogout}>
            <Dashboard user={user} onLogout={onLogout} />
          </TrialGuard>
        </RoleProvider>
      </TrialProvider>
    );
  }
  return <AuthLoadingScreen />;
}

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FIRESTORE RULES (firestore.rules)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *
 *     function isSignedIn() {
 *       return request.auth != null;
 *     }
 *
 *     function isOrgActive(orgId) {
 *       let org = get(/databases/$(database)/documents/organizations/$(orgId));
 *       return org.data.status == 'active';
 *     }
 *
 *     function isOrgMember(orgId) {
 *       return isSignedIn() &&
 *         exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
 *     }
 *
 *     function isOrgOwner(orgId) {
 *       let org = get(/databases/$(database)/documents/organizations/$(orgId));
 *       return org.data.ownerUid == request.auth.uid;
 *     }
 *
 *     // User profiles — each user reads/writes their own
 *     match /userProfiles/{uid} {
 *       allow read, write: if isSignedIn() && request.auth.uid == uid;
 *     }
 *
 *     // Organizations — owner reads/writes
 *     match /organizations/{orgId} {
 *       allow read: if isSignedIn() && isOrgMember(orgId);
 *       allow write: if isSignedIn() && isOrgOwner(orgId);
 *
 *       // Members subcollection — owner manages
 *       match /members/{uid} {
 *         allow read: if isSignedIn() && isOrgMember(orgId);
 *         allow write: if isSignedIn() && isOrgOwner(orgId);
 *       }
 *
 *       // All other org data — members read/write if org active
 *       match /{document=**} {
 *         allow read, write: if isSignedIn() && isOrgMember(orgId) && isOrgActive(orgId);
 *       }
 *     }
 *
 *     // Invite codes — public read, owner create
 *     match /invites/{code} {
 *       allow read: if true;
 *       allow create: if isSignedIn();
 *     }
 *
 *     // Sales leads — public create only
 *     match /salesLeads/{id} {
 *       allow create: if true;
 *       allow read, update, delete: if false;
 *     }
 *   }
 * }
 */
