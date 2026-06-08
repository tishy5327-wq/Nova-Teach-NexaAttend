import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut,
  setPersistence, browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, addDoc,
  collection, serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAhTxH2vcZprnlTqNkfQouwYy76zK1Z5k",
  authDomain: "nova-e3626.firebaseapp.com",
  projectId: "nova-e3626",
  storageBucket: "nova-e3626.firebasestorage.app",
  messagingSenderId: "1000462435473",
  appId: "1:1000462435473:web:e8542ef3f6c478f3182b30",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
setPersistence(auth, browserLocalPersistence).catch(() => {});

const SHEET_URL = "https://script.google.com/macros/s/AKfycbxgViYSKbN1zFyISMS2l9xgDQGFE8QQAY7IlWjkEmAouzeO5GZwrLg8HZJevvF3SX4uyQ/exec";

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
  leaveRequests: [
    { id: "L001", name: "Ms. Ritu Bansal", type: "Medical", from: "2026-06-08", to: "2026-06-10", days: 3, reason: "Fever and flu", status: "Pending" },
    { id: "L002", name: "Mr. Sanjay Pillai", type: "Personal", from: "2026-06-12", to: "2026-06-12", days: 1, reason: "Family function", status: "Approved" },
    { id: "L003", name: "Ms. Pooja Dubey", type: "Casual", from: "2026-06-15", to: "2026-06-16", days: 2, reason: "Personal emergency", status: "Pending" },
    { id: "L004", name: "Mr. Kiran Mehta", type: "Medical", from: "2026-05-28", to: "2026-05-30", days: 3, reason: "Surgery recovery", status: "Approved" },
  ],
  payroll: [
    { id: "T001", name: "Mrs. Deepa Rao", salary: 75000, present: 26, absent: 0, lop: 0, deductions: 2250, net: 72750, status: "Processed" },
    { id: "T002", name: "Mr. Amit Kulkarni", salary: 55000, present: 25, absent: 1, lop: 2117, deductions: 1650, net: 51233, status: "Processed" },
    { id: "T003", name: "Ms. Ritu Bansal", salary: 48000, present: 24, absent: 2, lop: 3840, deductions: 1440, net: 42720, status: "Pending" },
    { id: "T004", name: "Mr. Sanjay Pillai", salary: 46000, present: 26, absent: 0, lop: 0, deductions: 1380, net: 44620, status: "Processed" },
    { id: "T005", name: "Ms. Pooja Dubey", salary: 44000, present: 25, absent: 1, lop: 1760, deductions: 1320, net: 40920, status: "Pending" },
    { id: "T006", name: "Mr. Kiran Mehta", salary: 40000, present: 26, absent: 0, lop: 0, deductions: 1200, net: 38800, status: "Processed" },
  ],
  fees: [
    { id: "S001", name: "Arjun Mehta", class: "X-A", annual: 45000, paid: 45000, due: 0, last: "2026-04-05", status: "Paid" },
    { id: "S002", name: "Priya Sharma", class: "X-A", annual: 45000, paid: 45000, due: 0, last: "2026-04-10", status: "Paid" },
    { id: "S003", name: "Rohan Patel", class: "IX-B", annual: 42000, paid: 21000, due: 21000, last: "2026-01-20", status: "Due" },
    { id: "S004", name: "Sneha Verma", class: "X-A", annual: 45000, paid: 45000, due: 0, last: "2026-05-01", status: "Paid" },
    { id: "S005", name: "Dev Agarwal", class: "XI-C", annual: 48000, paid: 48000, due: 0, last: "2026-03-15", status: "Paid" },
    { id: "S006", name: "Kavya Joshi", class: "IX-B", annual: 42000, paid: 28000, due: 14000, last: "2026-02-28", status: "Partial" },
    { id: "S007", name: "Ishaan Nair", class: "XII-A", annual: 50000, paid: 50000, due: 0, last: "2026-04-22", status: "Paid" },
    { id: "S008", name: "Ananya Singh", class: "XI-C", annual: 48000, paid: 0, due: 48000, last: "—", status: "Due" },
  ],
  exams: [
    { id: "E001", name: "Unit Test I", date: "June 20–22, 2026", classes: "All", subjects: 5, status: "Upcoming", maxMarks: 25 },
    { id: "E002", name: "Mid-Term Exam", date: "July 15–25, 2026", classes: "IX–XII", subjects: 6, status: "Scheduled", maxMarks: 80 },
    { id: "E003", name: "Annual Exam", date: "Nov 1–15, 2026", classes: "All", subjects: 6, status: "Scheduled", maxMarks: 100 },
    { id: "E004", name: "Pre-Board", date: "Oct 10–18, 2026", classes: "X, XII", subjects: 6, status: "Scheduled", maxMarks: 80 },
    { id: "E005", name: "Class Test – Jun", date: "June 10, 2026", classes: "VIII", subjects: 2, status: "Upcoming", maxMarks: 20 },
  ],
  assignments: [
    { id: "A001", title: "Maths – Algebra Ch.3", class: "X-A", due: "June 5, 2026", submitted: 42, total: 45, subject: "Mathematics", teacher: "Mr. Amit Kulkarni" },
    { id: "A002", title: "Science – Light & Optics", class: "IX-B", due: "June 7, 2026", submitted: 38, total: 42, subject: "Science", teacher: "Ms. Ritu Bansal" },
    { id: "A003", title: "English Essay – My Goals", class: "X-A", due: "June 10, 2026", submitted: 30, total: 45, subject: "English", teacher: "Mr. Sanjay Pillai" },
    { id: "A004", title: "Hindi Nibandh", class: "XI-C", due: "June 12, 2026", submitted: 18, total: 38, subject: "Hindi", teacher: "Ms. Pooja Dubey" },
    { id: "A005", title: "Physics – Motion Problems", class: "XII-A", due: "June 14, 2026", submitted: 25, total: 32, subject: "Physics", teacher: "Ms. Ritu Bansal" },
  ],
  notifications: [
    { id: "N001", title: "Attendance Alert", message: "8 students were absent today.", type: "alert", time: "8:10 AM", read: false },
    { id: "N002", title: "Fee Reminder Sent", message: "Reminders sent to 3 parents.", type: "info", time: "9:00 AM", read: false },
    { id: "N003", title: "Leave Request – Ritu", message: "Ms. Ritu Bansal has requested leave.", type: "warning", time: "10:30 AM", read: true },
    { id: "N004", title: "Exam Schedule Published", message: "Mid-term exam dates are out.", type: "success", time: "11:45 AM", read: true },
    { id: "N005", title: "Assignment Submitted", message: "42 of 45 students submitted.", type: "success", time: "2:30 PM", read: false },
    { id: "N006", title: "New Student Enrolled", message: "Ananya Singh enrolled in XI-C.", type: "info", time: "Yesterday", read: true },
  ],
  attendanceLogs: [
    { time: "08:01:03", name: "Arjun Mehta", cls: "X-A", status: "present" },
    { time: "08:01:07", name: "Priya Sharma", cls: "X-A", status: "present" },
    { time: "08:01:14", name: "Rohan Patel", cls: "IX-B", status: "present" },
    { time: "08:01:21", name: "Sneha Verma", cls: "X-A", status: "late" },
    { time: "08:01:28", name: "Dev Agarwal", cls: "XI-C", status: "present" },
    { time: "08:01:35", name: "Kavya Joshi", cls: "IX-B", status: "present" },
    { time: "08:01:40", name: "Ishaan Nair", cls: "XII-A", status: "absent" },
    { time: "08:01:55", name: "Ananya Singh", cls: "XI-C", status: "present" },
  ],
  todayAttendance: { present: 284, late: 12, absent: 8, total: 304 },
  weeklyTrend: [
    { day: "Mon", pct: 96 }, { day: "Tue", pct: 94 }, { day: "Wed", pct: 97 },
    { day: "Thu", pct: 93 }, { day: "Fri", pct: 96 },
  ],
  recentActivity: [
    { icon: "✓", text: "X-A attendance marked (98% present)", time: "8:02 AM" },
    { icon: "📝", text: "42 students submitted Algebra assignment", time: "9:15 AM" },
    { icon: "₹", text: "₹45,000 fees collected", time: "10:30 AM" },
    { icon: "🔔", text: "Parent alerts sent to 8 absent students", time: "8:10 AM" },
    { icon: "📅", text: "Mid-term exam schedule published", time: "Yesterday" },
  ],
};

const DEMO_LMS = {
  courses: [
    { id: "C001", code: "MATH-X", title: "Mathematics – Class X", subtitle: "CBSE · Algebra, Geometry & Trigonometry", subject: "mathematics", subjectLabel: "Mathematics", grade: "X",
      teacher: "Mr. Amit Kulkarni", teacherId: "T002", description: "Master Class X mathematics with our comprehensive course covering algebra, geometry, trigonometry, statistics, and probability.",
      thumbnail: "📐", color: C.navy, cover: `linear-gradient(135deg, ${C.navy} 0%, #3A5A8A 100%)`,
      duration: "40 hours", modules: 6, lessons: 48, quizzes: 8, enrolled: 45, capacity: 50, rating: 4.8, reviews: 124,
      tags: ["Algebra", "Geometry", "Trigonometry"], progress: 68, lastAccessed: "2 hours ago", nextLesson: "Quadratic Equations – Problem Solving",
      certificate: true, live: true, enrolled2: true,
      syllabus: [
        { id: "M1", title: "Algebra Foundations", lessons: 8, duration: "8h", completed: 8 },
        { id: "M2", title: "Quadratic Equations", lessons: 6, duration: "6h", completed: 4 },
        { id: "M3", title: "Arithmetic Progressions", lessons: 4, duration: "4h", completed: 0 },
        { id: "M4", title: "Triangles & Geometry", lessons: 10, duration: "10h", completed: 0 },
        { id: "M5", title: "Trigonometry", lessons: 9, duration: "9h", completed: 0 },
        { id: "M6", title: "Statistics & Probability", lessons: 6, duration: "6h", completed: 0 },
      ] },
    { id: "C002", code: "SCI-X", title: "Science – Class X", subtitle: "CBSE · Physics, Chemistry, Biology", subject: "science", subjectLabel: "Science", grade: "X",
      teacher: "Ms. Ritu Bansal", teacherId: "T003", description: "Explore science with our integrated Class X course covering physics, chemistry, and biology.",
      thumbnail: "🔬", color: C.green, cover: `linear-gradient(135deg, ${C.green} 0%, ${C.greenLight} 100%)`,
      duration: "45 hours", modules: 7, lessons: 54, quizzes: 10, enrolled: 42, capacity: 50, rating: 4.7, reviews: 98,
      tags: ["Physics", "Chemistry", "Biology"], progress: 0, lastAccessed: "Never", nextLesson: null,
      certificate: true, live: true, enrolled2: false,
      syllabus: [
        { id: "M1", title: "Chemical Reactions", lessons: 8, duration: "8h", completed: 0 },
        { id: "M2", title: "Acids, Bases & Salts", lessons: 6, duration: "6h", completed: 0 },
        { id: "M3", title: "Light & Reflection", lessons: 9, duration: "9h", completed: 0 },
        { id: "M4", title: "Electricity & Magnetism", lessons: 10, duration: "10h", completed: 0 },
        { id: "M5", title: "Life Processes", lessons: 8, duration: "8h", completed: 0 },
      ] },
    { id: "C003", code: "ENG-X", title: "English Literature & Grammar", subtitle: "CBSE Class X", subject: "english", subjectLabel: "English", grade: "X",
      teacher: "Mr. Sanjay Pillai", teacherId: "T004", description: "Develop strong English language skills through literature analysis and creative writing.",
      thumbnail: "📚", color: C.purple, cover: `linear-gradient(135deg, ${C.purple} 0%, #6D3A7A 100%)`,
      duration: "35 hours", modules: 5, lessons: 42, quizzes: 6, enrolled: 38, capacity: 45, rating: 4.6, reviews: 76,
      tags: ["Literature", "Grammar", "Writing"], progress: 42, lastAccessed: "Yesterday", nextLesson: "Writing Workshop – Narrative Essays",
      certificate: true, live: false, enrolled2: true,
      syllabus: [
        { id: "M1", title: "Reading Comprehension", lessons: 8, duration: "8h", completed: 8 },
        { id: "M2", title: "Grammar & Sentence Structure", lessons: 9, duration: "9h", completed: 7 },
        { id: "M3", title: "Literature – Prose", lessons: 10, duration: "10h", completed: 3 },
      ] },
    { id: "C004", code: "HIN-X", title: "Hindi Vyakaran aur Sahitya", subtitle: "CBSE Class X · Hindi", subject: "hindi", subjectLabel: "Hindi", grade: "X",
      teacher: "Ms. Pooja Dubey", teacherId: "T005", description: "हिंदी साहित्य और व्याकरण का संपूर्ण अध्ययन।",
      thumbnail: "📖", color: C.amber, cover: `linear-gradient(135deg, ${C.amber} 0%, #B07000 100%)`,
      duration: "30 hours", modules: 5, lessons: 36, quizzes: 5, enrolled: 35, capacity: 45, rating: 4.5, reviews: 62,
      tags: ["साहित्य", "व्याकरण", "निबंध"], progress: 0, lastAccessed: "Never", nextLesson: null,
      certificate: true, live: false, enrolled2: false,
      syllabus: [
        { id: "M1", title: "व्याकरण", lessons: 8, duration: "8h", completed: 0 },
        { id: "M2", title: "कविता संग्रह", lessons: 7, duration: "7h", completed: 0 },
      ] },
    { id: "C005", code: "SST-X", title: "Social Studies – Class X", subtitle: "History, Geography, Civics & Economics", subject: "social", subjectLabel: "Social Studies", grade: "X",
      teacher: "Mr. Sanjay Pillai", teacherId: "T004", description: "Comprehensive coverage of Class X Social Studies.",
      thumbnail: "🌍", color: "#4A2B0A", cover: `linear-gradient(135deg, #4A2B0A 0%, #7A4A1A 100%)`,
      duration: "38 hours", modules: 6, lessons: 45, quizzes: 7, enrolled: 40, capacity: 50, rating: 4.4, reviews: 54,
      tags: ["History", "Geography", "Civics"], progress: 25, lastAccessed: "3 days ago", nextLesson: "Indian National Movement",
      certificate: true, live: false, enrolled2: true,
      syllabus: [
        { id: "M1", title: "Indian History – Ancient", lessons: 8, duration: "8h", completed: 8 },
        { id: "M2", title: "Indian History – Modern", lessons: 9, duration: "9h", completed: 2 },
      ] },
    { id: "C006", code: "PHY-XII", title: "Physics – Class XII", subtitle: "CBSE Class XII · Advanced Physics", subject: "physics", subjectLabel: "Physics", grade: "XII",
      teacher: "Ms. Ritu Bansal", teacherId: "T003", description: "Master Class XII Physics with mechanics, electromagnetism, optics, and modern physics.",
      thumbnail: "⚛️", color: "#1A2B5A", cover: `linear-gradient(135deg, #1A2B5A 0%, #3A4B7A 100%)`,
      duration: "60 hours", modules: 10, lessons: 72, quizzes: 12, enrolled: 32, capacity: 40, rating: 4.9, reviews: 156,
      tags: ["Mechanics", "Electromagnetism", "Optics"], progress: 88, lastAccessed: "5h ago", nextLesson: "EMI – Final Review",
      certificate: true, live: true, enrolled2: true,
      syllabus: [
        { id: "M1", title: "Electrostatics", lessons: 8, duration: "8h", completed: 8 },
        { id: "M2", title: "Current Electricity", lessons: 7, duration: "7h", completed: 7 },
      ] },
    { id: "C007", code: "CS-XI", title: "Computer Science – Class XI", subtitle: "Programming & Data Structures", subject: "computer", subjectLabel: "Computer Sci.", grade: "XI",
      teacher: "Mr. Amit Kulkarni", teacherId: "T002", description: "Learn Python, data structures, algorithms, and databases.",
      thumbnail: "💻", color: "#1A4A4A", cover: `linear-gradient(135deg, #1A4A4A 0%, #3A7A7A 100%)`,
      duration: "50 hours", modules: 8, lessons: 60, quizzes: 10, enrolled: 28, capacity: 40, rating: 4.7, reviews: 84,
      tags: ["Python", "Data Structures", "Algorithms"], progress: 0, lastAccessed: "Never", nextLesson: null,
      certificate: true, live: false, enrolled2: false,
      syllabus: [
        { id: "M1", title: "Computer Systems", lessons: 6, duration: "6h", completed: 0 },
        { id: "M2", title: "Introduction to Python", lessons: 8, duration: "8h", completed: 0 },
      ] },
    { id: "C008", code: "PE-IX", title: "Physical Education – Class IX", subtitle: "Sports, Fitness & Health", subject: "physical", subjectLabel: "Physical Ed.", grade: "IX",
      teacher: "Mr. Kiran Mehta", teacherId: "T006", description: "Comprehensive physical education covering sports and fitness.",
      thumbnail: "⚽", color: "#5A2A4A", cover: `linear-gradient(135deg, #5A2A4A 0%, #7A4A6A 100%)`,
      duration: "25 hours", modules: 4, lessons: 30, quizzes: 4, enrolled: 55, capacity: 60, rating: 4.5, reviews: 42,
      tags: ["Sports", "Fitness", "Health"], progress: 50, lastAccessed: "1 week ago", nextLesson: "Football – Advanced",
      certificate: false, live: false, enrolled2: true,
      syllabus: [
        { id: "M1", title: "Fitness Fundamentals", lessons: 7, duration: "7h", completed: 7 },
        { id: "M2", title: "Team Sports", lessons: 8, duration: "8h", completed: 4 },
      ] },
  ],
  quizzes: [
    { id: "Q001", courseId: "C001", title: "Algebra – Linear Equations", description: "Test your understanding of linear equations.",
      duration: 20, totalMarks: 20, questions: 10, difficulty: "Easy", attempts: 234, avgScore: 76, status: "completed", lastScore: 85, bestScore: 95,
      questionsData: [
        { q: "What is a linear equation?", options: ["An equation with degree 1", "An equation with degree 2", "An equation with degree 3", "An equation with no solution"], correct: 0 },
        { q: "The standard form of a linear equation in two variables is:", options: ["ax + by + c = 0", "ax² + bx + c = 0", "ax + by = c", "a/x + b/y = 1"], correct: 0 },
        { q: "How many solutions does a linear equation in two variables have?", options: ["One", "Two", "Infinitely many", "None"], correct: 2 },
        { q: "If 2x + 3 = 11, what is x?", options: ["3", "4", "5", "6"], correct: 1 },
        { q: "The graph of a linear equation is a:", options: ["Curve", "Straight line", "Circle", "Parabola"], correct: 1 },
        { q: "Which method solves a pair of linear equations?", options: ["Substitution", "Elimination", "Graphical", "All of the above"], correct: 3 },
        { q: "If x=2, y=3 solves 3x+ky=12, then k=", options: ["1", "2", "3", "4"], correct: 1 },
        { q: "A linear equation has:", options: ["Only one variable", "Maximum two variables", "No variables", "Infinite variables"], correct: 1 },
        { q: "The point (0, 0) is called:", options: ["x-intercept", "y-intercept", "Origin", "Vertex"], correct: 2 },
        { q: "If y=0, what does 2x+5y=10 become?", options: ["2x=10", "2x+5=10", "5y=10", "2x=5"], correct: 0 },
      ] },
    { id: "Q002", courseId: "C001", title: "Quadratic Equations – Mastery Test", description: "Comprehensive test on quadratic equations.",
      duration: 30, totalMarks: 30, questions: 15, difficulty: "Medium", attempts: 189, avgScore: 68, status: "available", lastScore: null, bestScore: null },
    { id: "Q003", courseId: "C003", title: "English Grammar – Tenses", description: "Master English tenses.",
      duration: 25, totalMarks: 25, questions: 12, difficulty: "Easy", attempts: 312, avgScore: 81, status: "completed", lastScore: 92, bestScore: 96 },
    { id: "Q004", courseId: "C006", title: "Physics – Electromagnetic Induction", description: "Advanced quiz on EMI concepts.",
      duration: 45, totalMarks: 50, questions: 20, difficulty: "Hard", attempts: 78, avgScore: 62, status: "available", lastScore: null, bestScore: null },
    { id: "Q005", courseId: "C005", title: "History – Indian National Movement", description: "Test your knowledge of India's freedom struggle.",
      duration: 20, totalMarks: 20, questions: 10, difficulty: "Medium", attempts: 145, avgScore: 73, status: "locked", lastScore: null, bestScore: null },
  ],
  liveClasses: [
    { id: "LC001", courseId: "C001", title: "Doubt Session: Quadratic Equations", teacher: "Mr. Amit Kulkarni", teacherId: "T002",
      scheduledAt: "2026-06-04T10:00:00", duration: 60, status: "upcoming", attendees: 38, maxAttendees: 50, description: "Live doubt-clearing session for the chapter on Quadratic Equations." },
    { id: "LC002", courseId: "C006", title: "Live Problem Solving: EMI Numericals", teacher: "Ms. Ritu Bansal", teacherId: "T003",
      scheduledAt: "2026-06-03T15:00:00", duration: 90, status: "live", attendees: 28, maxAttendees: 40, description: "Solving 20+ numericals on Electromagnetic Induction." },
    { id: "LC003", courseId: "C003", title: "Writing Workshop – Essays", teacher: "Mr. Sanjay Pillai", teacherId: "T004",
      scheduledAt: "2026-06-05T14:00:00", duration: 75, status: "upcoming", attendees: 22, maxAttendees: 30, description: "Interactive workshop on essay writing." },
    { id: "LC004", courseId: "C001", title: "Trigonometry Crash Course", teacher: "Mr. Amit Kulkarni", teacherId: "T002",
      scheduledAt: "2026-06-02T11:00:00", duration: 120, status: "completed", attendees: 45, maxAttendees: 50, description: "Full 2-hour crash course on Trigonometry basics." },
    { id: "LC005", courseId: "C006", title: "Career Guidance: Physics After XII", teacher: "Ms. Ritu Bansal", teacherId: "T003",
      scheduledAt: "2026-06-06T16:00:00", duration: 60, status: "upcoming", attendees: 34, maxAttendees: 50, description: "Career paths after Class XII Physics." },
  ],
  library: [
    { id: "LB001", title: "NCERT Mathematics Textbook – Class X", type: "pdf", subject: "Mathematics", grade: "X", size: "12.4 MB", pages: 320, uploadedBy: "Admin", downloads: 234, rating: 4.9, cover: "📕", description: "Official NCERT textbook for Class X Mathematics." },
    { id: "LB002", title: "Physics Formula Sheet – Class XII", type: "pdf", subject: "Physics", grade: "XII", size: "2.1 MB", pages: 24, uploadedBy: "Ms. Ritu Bansal", downloads: 456, rating: 4.8, cover: "📐", description: "Complete formula reference for Class XII Physics." },
    { id: "LB003", title: "English Grammar Reference Guide", type: "pdf", subject: "English", grade: "All", size: "5.6 MB", pages: 84, uploadedBy: "Mr. Sanjay Pillai", downloads: 189, rating: 4.7, cover: "📘", description: "Comprehensive grammar reference." },
    { id: "LB004", title: "Hindi Vyakaran Notes – Class X", type: "pdf", subject: "Hindi", grade: "X", size: "3.2 MB", pages: 48, uploadedBy: "Ms. Pooja Dubey", downloads: 142, rating: 4.5, cover: "📗", description: "हिंदी व्याकरण के सभी नियम।" },
    { id: "LB005", title: "Light & Optics – Video Lessons", type: "video", subject: "Science", grade: "X", size: "450 MB", pages: null, uploadedBy: "Ms. Ritu Bansal", downloads: 89, rating: 4.8, cover: "🎬", description: "12 video lessons on light and optics." },
    { id: "LB006", title: "Quadratic Equations Worksheet", type: "pdf", subject: "Mathematics", grade: "X", size: "1.8 MB", pages: 16, uploadedBy: "Mr. Amit Kulkarni", downloads: 312, rating: 4.6, cover: "📒", description: "50+ practice problems with solutions." },
  ],
  gradebook: [
    { subject: "Mathematics", term1: 88, term2: 92, term3: 85, overall: 88.3, grade: "A" },
    { subject: "Science", term1: 82, term2: 85, term3: 90, overall: 85.7, grade: "A" },
    { subject: "English", term1: 78, term2: 82, term3: 80, overall: 80.0, grade: "B+" },
    { subject: "Hindi", term1: 75, term2: 78, term3: 82, overall: 78.3, grade: "B+" },
    { subject: "Social Studies", term1: 80, term2: 77, term3: 84, overall: 80.3, grade: "B+" },
    { subject: "Computer Science", term1: 95, term2: 92, term3: 94, overall: 93.7, grade: "A+" },
  ],
  topPerformers: [
    { name: "Dev Agarwal", class: "XI-C", avg: 96.5, avatar: "DA" },
    { name: "Sneha Verma", class: "X-A", avg: 94.2, avatar: "SV" },
    { name: "Arjun Mehta", class: "X-A", avg: 92.8, avatar: "AM" },
    { name: "Priya Sharma", class: "X-A", avg: 91.4, avatar: "PS" },
  ],
};

const FAQS = [
  { q: "What is School ERP Software?", a: "School ERP integrates all school operations — attendance, exams, fees, assignments, communication, and analytics — into one system." },
  { q: "How does attendance management work?", a: "AI face recognition marks 30 students in under 60 seconds, works 100% offline, eliminates proxy attendance." },
  { q: "How does fee management work?", a: "Track collections, dues, and payment history in real time. Send automated WhatsApp reminders." },
  { q: "Does it work without internet?", a: "Yes — NexaAttend is offline-first. All recognition and data storage happen on your own computer." },
  { q: "How long does setup take?", a: "Our team completes full installation, camera setup, and staff training in 3 days." },
  { q: "How accurate is face recognition?", a: "99%+ accuracy under normal lighting. Handles glasses, hair changes, and varying conditions." },
  { q: "What does the setup fee cover?", a: "On-site installation, camera configuration, face data enrollment, admin training, and 3-day handover support." },
  { q: "What is the 7-day guarantee?", a: "Use NexaAttend for 7 days. If it doesn't save time and reduce errors — full refund, no conditions." },
  { q: "What happens to student data?", a: "Your data never leaves your premises. Stored on your own computer — not on any cloud." },
  { q: "What cameras does it require?", a: "Every plan includes 2 cameras. Any webcam or IP camera works." },
];

// ==================== UTILITIES ====================
const initials = (n = "") => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const fmtINR = (n) => !n && n !== 0 ? "—" : n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (d) => !d ? "—" : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const statusColor = (s) => ({ present: "#1B5C3A", Paid: "#1B5C3A", Approved: "#1B5C3A", Processed: "#1B5C3A", Active: "#1B5C3A", success: "#1B5C3A", live: "#1B5C3A", completed: "#1B5C3A", available: C.navy, Easy: C.green, Medium: C.amber, Hard: C.red, late: C.amber, Partial: C.amber, warning: C.amber, Upcoming: C.navy, Scheduled: "rgba(28,27,23,0.5)", info: C.navy, absent: C.red, Due: C.red, Pending: C.red, alert: C.red, locked: "rgba(28,27,23,0.5)" }[s] || "rgba(28,27,23,0.5)");
const statusBg = (s) => ({ present: "rgba(42,107,74,0.1)", Paid: "rgba(42,107,74,0.1)", Approved: "rgba(42,107,74,0.1)", Processed: "rgba(42,107,74,0.1)", Active: "rgba(42,107,74,0.1)", success: "rgba(42,107,74,0.1)", live: "rgba(90,200,122,0.15)", completed: "rgba(42,107,74,0.08)", available: "rgba(26,43,74,0.08)", Easy: "rgba(42,107,74,0.1)", Medium: "rgba(122,80,0,0.1)", Hard: "rgba(239,68,68,0.1)", late: "rgba(122,80,0,0.1)", Partial: "rgba(122,80,0,0.1)", warning: "rgba(122,80,0,0.1)", Upcoming: "rgba(26,43,74,0.1)", Scheduled: "rgba(28,27,23,0.06)", info: "rgba(26,43,74,0.08)", absent: "rgba(239,68,68,0.1)", Due: "rgba(239,68,68,0.1)", Pending: "rgba(245,158,11,0.12)", alert: "rgba(239,68,68,0.1)", locked: "rgba(28,27,23,0.06)" }[s] || "rgba(28,27,23,0.06)");

// ==================== HOOKS ====================
const useInView = (threshold = 0.08) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const useScroll = () => {
  const [s, setS] = useState(false);
  useEffect(() => {
    const fn = () => setS(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return s;
};

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

// ==================== UI COMPONENTS ====================
const FadeIn = memo(({ children, delay = 0, style = {} }) => {
  const [ref, inView] = useInView();
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
  const v = { primary: { background: h ? C.green : C.dark, color: "#F7F5EF" }, green: { background: h ? "#1B5C3A" : C.green, color: "#F7F5EF" }, outline: { background: "transparent", color: C.dark, border: `1.5px solid ${C.faint}` }, ghost: { background: h ? "rgba(28,27,23,0.06)" : "transparent", color: C.dark } };
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

// ==================== MODAL ====================
const Modal = memo(({ open, onClose, title, children, width = 600 }) => {
  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }
  }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(28,27,23,0.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(28,27,23,0.22)", animation: "slideUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: F.serif }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
});

const StudentModal = memo(({ open, onClose, student }) => {
  if (!student) return null;
  return (
    <Modal open={open} onClose={onClose} title="Student Profile">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 16, background: C.bg, borderRadius: 10 }}>
        <Avatar name={student.name} size={56} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.serif }}>{student.name}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{student.id} · {student.class}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["Roll No", student.rollNo], ["Class", student.class], ["DOB", fmtDate(student.dob)], ["Parent", student.parent], ["Phone", student.phone], ["Address", student.address]].map(([k, v]) => (
          <div key={k} style={{ background: C.bg, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>ATTENDANCE</div>
        <ProgressBar value={student.attendance} color={student.attendance > 90 ? C.green : C.amber} />
      </div>
    </Modal>
  );
});

// ==================== LMS MODALS ====================
const CourseDetailModal = memo(({ open, onClose, course, onEnroll }) => {
  if (!course) return null;
  const [tab, setTab] = useState("overview");
  return (
    <Modal open={open} onClose={onClose} title={course.title} width={720}>
      <div style={{ height: 160, borderRadius: 12, background: course.cover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, marginBottom: 18, color: "#F7F5EF" }}>
        {course.thumbnail}
      </div>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 18 }}>{course.description}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10, marginBottom: 18 }}>
        {[["Duration", course.duration], ["Modules", course.modules], ["Lessons", course.lessons], ["Quizzes", course.quizzes], ["Enrolled", `${course.enrolled}/${course.capacity}`], ["Rating", `⭐ ${course.rating}`]].map(([k, v]) => (
          <div key={k} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["overview", "syllabus", "instructor"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: "none", background: tab === t ? C.surface : "transparent", color: tab === t ? C.dark : C.muted, fontFamily: F.sans, fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: "pointer", textTransform: "capitalize", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{t}</button>
        ))}
      </div>
      {tab === "overview" && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>TAGS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {course.tags.map(t => <span key={t} style={{ padding: "3px 10px", background: `${course.color}15`, color: course.color, borderRadius: 100, fontSize: 11, fontWeight: 600 }}>{t}</span>)}
          </div>
          {course.certificate && <div style={{ padding: "10px 14px", background: C.greenMuted, borderRadius: 8, fontSize: 12, color: "#1B5C3A", marginBottom: 12 }}>🎓 Certificate of completion included</div>}
          {course.live && <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 12 }}>🔴 Live classes available</div>}
        </div>
      )}
      {tab === "syllabus" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {course.syllabus.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.completed === m.lessons ? C.greenMuted : "rgba(28,27,23,0.06)", color: m.completed === m.lessons ? C.green : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{m.completed === m.lessons ? "✓" : m.id.replace("M", "")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{m.lessons} lessons · {m.duration}</div>
              </div>
              {m.completed > 0 && <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{m.completed}/{m.lessons}</div>}
            </div>
          ))}
        </div>
      )}
      {tab === "instructor" && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: C.bg, borderRadius: 10 }}>
          <Avatar name={course.teacher} size={56} color={course.color} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{course.teacher}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{course.subjectLabel} Expert · 8+ years experience</div>
            <div style={{ fontSize: 11, color: course.color, marginTop: 4, fontWeight: 600 }}>⭐ 4.8 average rating</div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        {course.enrolled2 ? (
          <Btn variant="green" style={{ flex: 1, justifyContent: "center" }}>Continue Learning →</Btn>
        ) : (
          <Btn variant="green" style={{ flex: 1, justifyContent: "center" }} onClick={() => onEnroll?.(course)}>Enroll Now — Free</Btn>
        )}
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
  const score = useMemo(() => {
    if (!submitted) return 0;
    return quiz.questionsData.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  }, [submitted, answers, quiz]);

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
              <button key={i} onClick={() => setAnswers(a => ({ ...a, [step]: i }))} style={{ padding: "12px 16px", border: `2px solid ${answers[step] === i ? C.green : C.faint}`, background: answers[step] === i ? C.greenMuted : C.surface, borderRadius: 10, cursor: "pointer", textAlign: "left", fontSize: 13, fontFamily: F.sans, color: C.dark, fontWeight: answers[step] === i ? 600 : 400 }}>
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
            <Btn variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Previous</Btn>
            {step < total - 1 ? <Btn variant="green" disabled={answers[step] === undefined} onClick={() => setStep(s => s + 1)}>Next →</Btn> : <Btn variant="green" disabled={Object.keys(answers).length < total} onClick={() => setSubmitted(true)}>Submit Quiz</Btn>}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>{score / total >= 0.8 ? "🏆" : score / total >= 0.5 ? "👍" : "📚"}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: C.dark, marginBottom: 8, fontFamily: F.serif }}>Quiz Complete!</h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>You scored <strong style={{ color: C.green, fontSize: 20 }}>{score}/{total}</strong> ({Math.round((score / total) * 100)}%)</p>
          <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 20, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10 }}>REVIEW</div>
            {quiz.questionsData.map((q, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < total - 1 ? `1px solid ${C.border}` : "none", fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{i + 1}. {q.q}</div>
                <div style={{ color: answers[i] === q.correct ? C.green : C.red }}>
                  Your answer: {q.options[answers[i]] || "—"} {answers[i] === q.correct ? "✓" : `✗ (Correct: ${q.options[q.correct]})`}
                </div>
              </div>
            ))}
          </div>
          <Btn variant="green" onClick={onClose} style={{ justifyContent: "center", minWidth: 140 }}>Done</Btn>
        </div>
      )}
    </Modal>
  );
});

const LiveClassModal = memo(({ open, onClose, liveClass, course }) => {
  if (!liveClass) return null;
  const scheduledDate = new Date(liveClass.scheduledAt);
  return (
    <Modal open={open} onClose={onClose} title="Live Class Details" width={580}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: liveClass.status === "live" ? "rgba(239,68,68,0.1)" : C.greenMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
          {liveClass.status === "live" ? "🔴" : liveClass.status === "completed" ? "✓" : "📅"}
        </div>
        <div>
          <Badge status={liveClass.status}>{liveClass.status.toUpperCase()}</Badge>
          <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: F.serif, marginTop: 6 }}>{liveClass.title}</h3>
          {course && <div style={{ fontSize: 12, color: C.muted }}>{course.title}</div>}
        </div>
      </div>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 18 }}>{liveClass.description}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {[["Teacher", liveClass.teacher], ["Duration", `${liveClass.duration} min`], ["Scheduled", scheduledDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })], ["Attendees", `${liveClass.attendees}/${liveClass.maxAttendees}`]].map(([k, v]) => (
          <div key={k} style={{ background: C.bg, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
      <Btn variant={liveClass.status === "completed" ? "outline" : "green"} style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>
        {liveClass.status === "live" ? "🎥 Join Live Class" : liveClass.status === "completed" ? "📼 Watch Recording" : "🔔 Add to Calendar"}
      </Btn>
    </Modal>
  );
});

// ==================== LMS SUB-MODULES ====================
const LMSDashboard = memo(({ onOpenCourse, onOpenLiveClass, onOpenQuiz, courses }) => {
  const enrolled = courses.filter(c => c.enrolled2);
  const upcoming = DEMO_LMS.liveClasses.filter(l => l.status !== "completed").length;
  const completed = DEMO_LMS.quizzes.filter(q => q.status === "completed").length;
  const avgProgress = Math.round(enrolled.reduce((a, c) => a + c.progress, 0) / enrolled.length);
  return (
    <div>
      <SectionHeader title="Learning Dashboard" subtitle="Your learning journey at a glance" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Enrolled Courses" value={enrolled.length} color={C.navy} />
        <StatCard label="Avg. Progress" value={`${avgProgress}%`} color={C.green} />
        <StatCard label="Upcoming Classes" value={upcoming} color={C.amber} />
        <StatCard label="Quizzes Completed" value={completed} color={C.purple} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: F.serif }}>Continue Learning</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          {enrolled.slice(0, 3).map(c => (
            <div key={c.id} onClick={() => onOpenCourse(c)} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = ""}>
              <div style={{ height: 80, background: c.cover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{c.thumbnail}</div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Next: {c.nextLesson || "Start learning"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ProgressBar value={c.progress} color={c.color} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: F.serif }}>Upcoming Live Classes</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DEMO_LMS.liveClasses.filter(l => l.status !== "completed").slice(0, 3).map(lc => {
            const course = courses.find(c => c.id === lc.courseId);
            return (
              <div key={lc.id} onClick={() => onOpenLiveClass(lc, course)} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: lc.status === "live" ? "rgba(239,68,68,0.1)" : C.greenMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{lc.status === "live" ? "🔴" : "📅"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lc.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lc.teacher} · {new Date(lc.scheduledAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <Badge status={lc.status}>{lc.status}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const LMSCourses = memo(({ courses, onOpenCourse, onEnroll }) => {
  const [subject, setSubject] = useState("all");
  const [level, setLevel] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => courses.filter(c =>
    (subject === "all" || c.subject === subject) &&
    (level === "all" || c.grade === level) &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  ), [courses, subject, level, search]);
  return (
    <div>
      <SectionHeader title="Course Catalog" subtitle={`${filtered.length} courses available`} />
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchBar value={search} onChange={setSearch} placeholder="Search courses, topics…" /></div>
        <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: "8px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 12, fontFamily: F.sans, background: C.bg, cursor: "pointer" }}>
          {LMS_LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {LMS_SUBJECTS.map(s => (
          <button key={s.id} onClick={() => setSubject(s.id)} style={{ padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${subject === s.id ? s.color : C.faint}`, background: subject === s.id ? `${s.color}15` : "transparent", color: subject === s.id ? s.color : C.dark, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.sans }}>{s.label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {filtered.map(c => (
          <div key={c.id} onClick={() => onOpenCourse(c)} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            <div style={{ height: 100, background: c.cover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, position: "relative" }}>
              {c.thumbnail}
              {c.live && <span style={{ position: "absolute", top: 8, right: 8, background: C.red, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 100, letterSpacing: "0.07em" }}>● LIVE</span>}
              {c.enrolled2 && <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(42,107,74,0.9)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 100 }}>✓ ENROLLED</span>}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: c.color, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.subjectLabel} · Class {c.grade}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 4, marginBottom: 4, fontFamily: F.serif }}>{c.title}</h3>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12, minHeight: 36 }}>{c.subtitle}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: C.muted, marginBottom: 10 }}>
                <span>{c.lessons} lessons · {c.modules} modules</span>
                <span>⭐ {c.rating} ({c.reviews})</span>
              </div>
              {c.enrolled2 ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                    <span style={{ color: C.muted }}>Progress</span>
                    <span style={{ fontWeight: 700, color: c.color }}>{c.progress}%</span>
                  </div>
                  <ProgressBar value={c.progress} color={c.color} height={5} />
                </div>
              ) : (
                <Btn variant="green" size="sm" style={{ width: "100%", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); onEnroll(c); }}>Enroll Free</Btn>
              )}
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState title="No courses found" subtitle="Try adjusting your filters" />}
    </div>
  );
});

const LMSMyLearning = memo(({ courses, onOpenCourse, onOpenQuiz }) => {
  const enrolled = courses.filter(c => c.enrolled2);
  return (
    <div>
      <SectionHeader title="My Learning" subtitle={`${enrolled.length} active courses`} />
      {enrolled.length === 0 ? (
        <EmptyState icon="📚" title="No active courses" subtitle="Enroll in a course from the catalog to start learning" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {enrolled.map(c => (
            <div key={c.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18, display: "flex", gap: 16, alignItems: "center" }} className="nexa-my-learning-card">
              <div style={{ width: 70, height: 70, borderRadius: 12, background: c.cover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{c.thumbnail}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: F.serif }}>{c.title}</h3>
                  <span style={{ fontSize: 11, color: C.muted }}>Last accessed: {c.lastAccessed}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{c.teacher} · {c.lessons} lessons</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <ProgressBar value={c.progress} color={c.color} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.color, minWidth: 36 }}>{c.progress}%</span>
                </div>
                {c.nextLesson && <div style={{ fontSize: 11, color: C.dark, marginTop: 6 }}>📌 Next: {c.nextLesson}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                <Btn variant="green" size="sm" onClick={() => onOpenCourse(c)}>Continue</Btn>
                <Btn variant="outline" size="sm" onClick={() => { const q = DEMO_LMS.quizzes.find(q => q.courseId === c.id); if (q) onOpenQuiz(q); }}>Take Quiz</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const LMSQuizzes = memo(({ onOpenQuiz, courses }) => {
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => DEMO_LMS.quizzes.filter(q => filter === "all" || q.status === filter), [filter]);
  return (
    <div>
      <SectionHeader title="Quizzes & Tests" subtitle="Test your knowledge" />
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "available", "completed", "locked"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 100, border: `1.5px solid ${filter === f ? C.green : C.faint}`, background: filter === f ? C.greenMuted : "transparent", color: filter === f ? C.green : C.dark, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", fontFamily: F.sans }}>{f}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
        {filtered.map(q => {
          const course = courses.find(c => c.id === q.courseId);
          return (
            <div key={q.id} onClick={() => q.status !== "locked" && onOpenQuiz(q)} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18, cursor: q.status === "locked" ? "not-allowed" : "pointer", opacity: q.status === "locked" ? 0.6 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <Badge status={q.difficulty}>{q.difficulty}</Badge>
                <Badge status={q.status}>{q.status}</Badge>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: F.serif, marginBottom: 6 }}>{q.title}</h3>
              {course && <div style={{ fontSize: 11, color: course.color, fontWeight: 600, marginBottom: 8 }}>{course.title}</div>}
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>{q.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, fontSize: 11, marginBottom: 12 }}>
                {[["Q", q.questions], ["Mins", q.duration], ["Marks", q.totalMarks]].map(([k, v]) => (
                  <div key={k} style={{ background: C.bg, borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{v}</div>
                    <div style={{ color: C.muted, fontSize: 10 }}>{k}</div>
                  </div>
                ))}
              </div>
              {q.status === "completed" && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: C.greenMuted, borderRadius: 8, fontSize: 12 }}>
                  <span style={{ color: "#1B5C3A" }}>Best: <strong>{q.bestScore}%</strong></span>
                  <span style={{ color: "#1B5C3A" }}>Last: <strong>{q.lastScore}%</strong></span>
                </div>
              )}
              {q.status === "available" && <Btn variant="green" size="sm" style={{ width: "100%", justifyContent: "center" }}>Start Quiz →</Btn>}
              {q.status === "locked" && <div style={{ textAlign: "center", fontSize: 11, color: C.muted }}>🔒 Enroll in the course to unlock</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
});

const LMSLiveClasses = memo(({ onOpenLiveClass, courses }) => {
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => DEMO_LMS.liveClasses.filter(l => filter === "all" || l.status === filter), [filter]);
  return (
    <div>
      <SectionHeader title="Live Classes" subtitle="Join interactive sessions with teachers" />
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "live", "upcoming", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 100, border: `1.5px solid ${filter === f ? C.green : C.faint}`, background: filter === f ? C.greenMuted : "transparent", color: filter === f ? C.green : C.dark, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", fontFamily: F.sans }}>{f}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(lc => {
          const course = courses.find(c => c.id === lc.courseId);
          return (
            <div key={lc.id} onClick={() => onOpenLiveClass(lc, course)} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18, cursor: "pointer", display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: 12, background: lc.status === "live" ? "rgba(239,68,68,0.1)" : lc.status === "completed" ? C.greenMuted : "rgba(26,43,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                {lc.status === "live" ? "🔴" : lc.status === "completed" ? "✓" : "📅"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <Badge status={lc.status}>{lc.status === "live" ? "● LIVE NOW" : lc.status.toUpperCase()}</Badge>
                  {course && <span style={{ fontSize: 11, color: course.color, fontWeight: 600 }}>{course.subjectLabel}</span>}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: F.serif, marginBottom: 4 }}>{lc.title}</h3>
                <div style={{ fontSize: 12, color: C.muted }}>{lc.teacher} · {new Date(lc.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {lc.duration} min</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{lc.attendees}/{lc.maxAttendees}</div>
                <div style={{ fontSize: 11, color: C.muted }}>attending</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const LMSLibrary = memo(() => {
  const [subject, setSubject] = useState("all");
  const filtered = useMemo(() => DEMO_LMS.library.filter(l => subject === "all" || l.subject === subject), [subject]);
  return (
    <div>
      <SectionHeader title="Digital Library" subtitle={`${filtered.length} study materials available`} />
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ id: "all", label: "All" }, ...LMS_SUBJECTS.filter(s => s.id !== "all")].map(s => (
          <button key={s.id} onClick={() => setSubject(s.id)} style={{ padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${subject === s.id ? s.color : C.faint}`, background: subject === s.id ? `${s.color}15` : "transparent", color: subject === s.id ? s.color : C.dark, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.sans }}>{s.label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
        {filtered.map(item => (
          <div key={item.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 50, height: 60, background: C.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{item.cover}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Badge status={item.type === "pdf" ? "info" : "live"}>{item.type.toUpperCase()}</Badge>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginTop: 6, lineHeight: 1.35 }}>{item.title}</h3>
              </div>
            </div>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>{item.description}</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 12 }}>
              <span>📦 {item.size}</span>
              {item.pages && <span>📄 {item.pages} pages</span>}
              <span>⬇ {item.downloads}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>⭐ {item.rating}</span>
              <Btn variant="green" size="sm">Download</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const LMSGradebook = memo(() => {
  return (
    <div>
      <SectionHeader title="Gradebook" subtitle="Your academic performance by subject" action={<Btn variant="green" size="sm">+ Add Marks</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Overall Average" value="84.4%" color={C.green} accent="Excellent" />
        <StatCard label="Highest Score" value="98%" sub="in Computer Science" color={C.navy} />
        <StatCard label="Class Rank" value="3rd" sub="of 45 students" color={C.purple} />
        <StatCard label="Subjects" value={DEMO_LMS.gradebook.length} color={C.amber} />
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 22, marginBottom: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: F.serif }}>Subject-wise Performance</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {DEMO_LMS.gradebook.map((g, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{g.subject}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>T1: {g.term1} | T2: {g.term2} | T3: {g.term3}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{g.overall}%</span>
                  <Badge status={g.grade === "A+" ? "live" : g.grade.startsWith("A") ? "present" : "warning"}>{g.grade}</Badge>
                </div>
              </div>
              <ProgressBar value={g.overall} color={g.overall >= 90 ? C.green : g.overall >= 75 ? C.navy : C.amber} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 22 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, fontFamily: F.serif }}>🏆 Class Top Performers</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {DEMO_LMS.topPerformers.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.amber, minWidth: 24 }}>#{i + 1}</div>
              <Avatar name={p.name} size={36} color={C.green} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{p.class} · {p.avg}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const LMSModule = memo(() => {
  const [tab, setTab] = useState("dashboard");
  const { open: courseOpen, data: courseData, show: showCourse, hide: hideCourse } = useModal();
  const { open: quizOpen, data: quizData, show: showQuiz, hide: hideQuiz } = useModal();
  const { open: liveOpen, data: liveData, show: showLive, hide: hideLive } = useModal();
  const [courses, setCourses] = useState(DEMO_LMS.courses);

  const handleEnroll = useCallback((course) => {
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, enrolled2: true, progress: 0 } : c));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 10, padding: 4, marginBottom: 22, overflowX: "auto" }}>
        {LMS_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "8px 14px", borderRadius: 7, border: "none", background: tab === t.id ? C.surface : "transparent", color: tab === t.id ? C.dark : C.muted, fontFamily: F.sans, fontSize: 12, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      {tab === "dashboard" && <LMSDashboard courses={courses} onOpenCourse={showCourse} onOpenLiveClass={(lc, c) => showLive({ live: lc, course: c })} onOpenQuiz={showQuiz} />}
      {tab === "courses" && <LMSCourses courses={courses} onOpenCourse={showCourse} onEnroll={handleEnroll} />}
      {tab === "learning" && <LMSMyLearning courses={courses} onOpenCourse={showCourse} onOpenQuiz={showQuiz} />}
      {tab === "quizzes" && <LMSQuizzes onOpenQuiz={showQuiz} courses={courses} />}
      {tab === "live" && <LMSLiveClasses onOpenLiveClass={(lc, c) => showLive({ live: lc, course: c })} courses={courses} />}
      {tab === "library" && <LMSLibrary />}
      {tab === "gradebook" && <LMSGradebook />}

      <CourseDetailModal open={courseOpen} onClose={hideCourse} course={courseData} onEnroll={handleEnroll} />
      <QuizPlayerModal open={quizOpen} onClose={hideQuiz} quiz={quizData} />
      <LiveClassModal open={liveOpen} onClose={hideLive} liveClass={liveData?.live} course={liveData?.course} />
    </div>
  );
});

// ==================== EXISTING MODULES ====================
const AttendanceModule = memo(() => {
  const { present, late, absent, total } = DEMO.todayAttendance;
  return (
    <div>
      <SectionHeader title="Today's Attendance" subtitle={`Wednesday, June 3, 2026 · ${total} students enrolled`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Present" value={present} color={C.green} />
        <StatCard label="Late" value={late} color={C.amber} />
        <StatCard label="Absent" value={absent} color={C.red} />
        <StatCard label="Total" value={total} color={C.navy} />
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Weekly Trend</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 80 }}>
          {DEMO.weeklyTrend.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: C.green }}>{d.pct}%</span>
              <div style={{ width: "100%", background: "rgba(42,107,74,0.1)", borderRadius: 4, height: 56, position: "relative" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(to top,${C.green},${C.greenLight})`, borderRadius: 4, height: `${d.pct}%` }} />
              </div>
              <span style={{ fontSize: 10, color: C.muted }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const StudentModule = memo(() => {
  const [students, setStudents] = useState(DEMO.students);
  const { query, setQuery, filtered } = useSearch(students, ["name", "class", "id", "parent"]);
  const { open, data, show, hide } = useModal();
  const columns = useMemo(() => [
    { key: "name", label: "Student", render: (v, r) => <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={v} size={30} /><div><div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div><div style={{ fontSize: 11, color: C.muted }}>{r.id}</div></div></div> },
    { key: "class", label: "Class" },
    { key: "rollNo", label: "Roll" },
    { key: "parent", label: "Parent" },
    { key: "attendance", label: "Attendance", render: (v) => <span style={{ fontWeight: 600, color: v > 90 ? C.green : C.amber }}>{v}%</span> },
    { key: "fees", label: "Fees", render: (v) => <Badge status={v}>{v}</Badge> },
  ], []);
  return (
    <div>
      <SectionHeader title="Student Management" subtitle={`${students.length} students enrolled`} action={<Btn variant="green" size="sm">+ Add Student</Btn>} />
      <div style={{ marginBottom: 14 }}><SearchBar value={query} onChange={setQuery} placeholder="Search students…" /></div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{columns.map(c => <th key={c.key} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{c.label}</th>)}</tr></thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id} onClick={() => show(row)} style={{ borderTop: `1px solid rgba(28,27,23,0.04)`, cursor: "pointer" }}>
                {columns.map(c => <td key={c.key} style={{ padding: "11px 16px", fontSize: 13 }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StudentModal open={open} onClose={hide} student={data} />
    </div>
  );
});

const StaffModule = memo(() => {
  const { query, setQuery, filtered } = useSearch(DEMO.staff, ["name", "role", "dept"]);
  const { open, data, show, hide } = useModal();
  const columns = useMemo(() => [
    { key: "name", label: "Staff", render: (v, r) => <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={v} size={30} color={C.navy} /><div><div style={{ fontWeight: 600 }}>{v}</div><div style={{ fontSize: 11, color: C.muted }}>{r.id}</div></div></div> },
    { key: "role", label: "Role" },
    { key: "dept", label: "Department" },
    { key: "salary", label: "Salary", render: (v) => <span style={{ fontWeight: 600, color: C.green }}>{fmtINR(v)}</span> },
    { key: "attendance", label: "Attendance", render: (v) => <span style={{ fontWeight: 600 }}>{v}%</span> },
    { key: "status", label: "Status", render: (v) => <Badge status={v}>{v}</Badge> },
  ], []);
  return (
    <div>
      <SectionHeader title="Staff & HR" subtitle={`${DEMO.staff.length} staff members`} />
      <div style={{ marginBottom: 14 }}><SearchBar value={query} onChange={setQuery} placeholder="Search staff…" /></div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{columns.map(c => <th key={c.key} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{c.label}</th>)}</tr></thead>
          <tbody>{filtered.map((row, i) => <tr key={row.id} onClick={() => show(row)} style={{ borderTop: `1px solid rgba(28,27,23,0.04)`, cursor: "pointer" }}>{columns.map(c => <td key={c.key} style={{ padding: "11px 16px", fontSize: 13 }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <Modal open={open} onClose={hide} title="Staff Profile">
        {data && <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, background: C.bg, borderRadius: 10 }}><Avatar name={data.name} size={56} color={C.navy} /><div><div style={{ fontSize: 18, fontWeight: 700 }}>{data.name}</div><div style={{ fontSize: 13, color: C.muted }}>{data.role} · {data.dept}</div></div></div>}
      </Modal>
    </div>
  );
});

const LeaveModule = memo(() => {
  const [leaves] = useState(DEMO.leaveRequests);
  return (
    <div>
      <SectionHeader title="Leave Management" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {leaves.map(l => (
          <div key={l.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={l.name} size={38} color={C.navy} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{l.type} · {fmtDate(l.from)} – {fmtDate(l.to)} · {l.days}d</div>
              </div>
            </div>
            <Badge status={l.status}>{l.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
});

const PayrollModule = memo(() => {
  const totals = DEMO.payroll.reduce((s, p) => s + p.net, 0);
  return (
    <div>
      <SectionHeader title="Payroll" subtitle="Monthly payroll" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Net" value={fmtINR(totals)} color={C.green} />
        <StatCard label="Processed" value={DEMO.payroll.filter(p => p.status === "Processed").length} color={C.navy} />
        <StatCard label="Pending" value={DEMO.payroll.filter(p => p.status === "Pending").length} color={C.amber} />
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{["Employee", "Salary", "Present", "Net Pay", "Status"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
          <tbody>{DEMO.payroll.map(p => <tr key={p.id} style={{ borderTop: `1px solid rgba(28,27,23,0.04)` }}><td style={{ padding: "11px 16px", fontSize: 13 }}>{p.name}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{fmtINR(p.salary)}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{p.present}</td><td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: C.green }}>{fmtINR(p.net)}</td><td style={{ padding: "11px 16px" }}><Badge status={p.status}>{p.status}</Badge></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
});

const FeeModule = memo(() => {
  const collected = DEMO.fees.reduce((s, f) => s + f.paid, 0);
  const pending = DEMO.fees.reduce((s, f) => s + f.due, 0);
  return (
    <div>
      <SectionHeader title="Fee Management" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Collected" value={fmtINR(collected)} color={C.green} />
        <StatCard label="Pending" value={fmtINR(pending)} color={C.red} />
        <StatCard label="Defaulters" value={DEMO.fees.filter(f => f.due > 0).length} color={C.amber} />
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(28,27,23,0.02)" }}>{["Student", "Class", "Annual", "Paid", "Due", "Status"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
          <tbody>{DEMO.fees.map(f => <tr key={f.id} style={{ borderTop: `1px solid rgba(28,27,23,0.04)` }}><td style={{ padding: "11px 16px", fontSize: 13 }}>{f.name}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{f.class}</td><td style={{ padding: "11px 16px", fontSize: 13 }}>{fmtINR(f.annual)}</td><td style={{ padding: "11px 16px", fontSize: 13, color: C.green, fontWeight: 600 }}>{fmtINR(f.paid)}</td><td style={{ padding: "11px 16px", fontSize: 13, color: f.due > 0 ? C.red : C.muted, fontWeight: f.due > 0 ? 700 : 400 }}>{f.due > 0 ? fmtINR(f.due) : "—"}</td><td style={{ padding: "11px 16px" }}><Badge status={f.status}>{f.status}</Badge></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
});

const ExamModule = memo(() => (
  <div>
    <SectionHeader title="Exam Schedule" />
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {DEMO.exams.map(e => (
        <div key={e.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, fontFamily: F.serif }}>{e.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{e.date} · {e.classes} · Max: {e.maxMarks}</div>
          </div>
          <Badge status={e.status}>{e.status}</Badge>
        </div>
      ))}
    </div>
  </div>
));

const AssignmentModule = memo(() => (
  <div>
    <SectionHeader title="Assignments" />
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {DEMO.assignments.map(a => {
        const pct = Math.round((a.submitted / a.total) * 100);
        return (
          <div key={a.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{a.class} · {a.teacher} · Due: {a.due}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>{a.submitted}/{a.total}</div>
                <div style={{ fontSize: 11, color: C.muted }}>submitted</div>
              </div>
            </div>
            <ProgressBar value={pct} color={pct === 100 ? C.green : pct > 70 ? C.amber : C.red} />
          </div>
        );
      })}
    </div>
  </div>
));

const ParentPortal = memo(() => {
  const s = DEMO.students[0];
  return (
    <div>
      <SectionHeader title="Parent Portal" subtitle={`View for ${s.name}`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <Avatar name={s.name} size={48} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
              <div style={{ fontSize: 13, color: C.muted }}>Class {s.class} · Roll #{s.rollNo}</div>
            </div>
          </div>
          {[["Attendance", `${s.attendance}%`], ["Fees", s.fees], ["Status", s.status]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.muted }}>{k}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, fontFamily: F.serif }}>Recent Attendance</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
              <div key={d} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", background: i === 4 ? "rgba(245,158,11,0.15)" : "rgba(42,107,74,0.12)", border: `2px solid ${i === 4 ? C.amber : C.green}` }}><span style={{ fontSize: 13 }}>{i === 4 ? "⚠" : "✓"}</span></div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const NotificationCenter = memo(() => {
  const [notifs, setNotifs] = useState(DEMO.notifications);
  return (
    <div>
      <SectionHeader title="Notification Center" action={<Btn variant="outline" size="sm" onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))}>Mark All Read</Btn>} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifs.map(n => (
          <div key={n.id} style={{ background: n.read ? C.surface : "rgba(42,107,74,0.04)", borderRadius: 10, border: `1px solid ${n.read ? C.border : "rgba(42,107,74,0.18)"}`, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: n.read ? 500 : 700, fontSize: 13 }}>{n.title}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{n.time}</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

const ReportsModule = memo(() => (
  <div>
    <SectionHeader title="Reports & Analytics" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 20 }}>
      <StatCard label="Avg Attendance" value="93.4%" color={C.green} />
      <StatCard label="Today's Rate" value="93%" color={C.navy} />
      <StatCard label="Fees Collected" value={fmtINR(DEMO.fees.reduce((s, f) => s + f.paid, 0))} color={C.green} />
    </div>
    <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Student-wise Attendance</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DEMO.students.sort((a, b) => b.attendance - a.attendance).map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.muted, width: 80, textAlign: "right" }}>{s.name.split(" ")[0]}</span>
            <div style={{ flex: 1, height: 18, background: "rgba(28,27,23,0.06)", borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${s.attendance}%`, background: s.attendance >= 90 ? `linear-gradient(to right,${C.green},${C.greenLight})` : C.amber, borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, width: 38, color: s.attendance >= 90 ? C.green : C.amber }}>{s.attendance}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
));

const DashboardOverview = memo(() => {
  const { present, total } = DEMO.todayAttendance;
  const feeCollected = DEMO.fees.reduce((s, f) => s + f.paid, 0);
  return (
    <div>
      <SectionHeader title="School Overview" subtitle="Live dashboard" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Present Today" value={present} sub={`of ${total}`} color={C.green} />
        <StatCard label="Attendance Rate" value={`${Math.round((present / total) * 100)}%`} color={C.navy} />
        <StatCard label="Fee Collected" value={fmtINR(feeCollected)} color={C.green} />
        <StatCard label="Total Students" value={DEMO.students.length} color={C.purple} />
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, fontFamily: F.serif }}>Recent Activity</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DEMO.recentActivity.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 16 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{a.text}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ==================== DASHBOARD SHELL ====================
const DemoDashboard = memo(({ user, trialExpiryDate, onSignOut }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const moduleMap = useMemo(() => ({
    overview: <DashboardOverview />, attendance: <AttendanceModule />, students: <StudentModule />,
    staff: <StaffModule />, leave: <LeaveModule />, payroll: <PayrollModule />, fees: <FeeModule />,
    exams: <ExamModule />, assignments: <AssignmentModule />, lms: <LMSModule />,
    parents: <ParentPortal />, notifications: <NotificationCenter />, reports: <ReportsModule />,
  }), []);
  const unreadNotifs = DEMO.notifications.filter(n => !n.read).length;
  return (
    <div className="nexa-demo-shell" style={{ display: "flex", height: "calc(100vh - 62px)", background: C.bg, overflow: "hidden" }}>
      <div className="nexa-sidebar" style={{ width: sidebarOpen ? 220 : 64, background: "#1C1B17", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.25s" }}>
        <div style={{ padding: "18px 16px", borderBottom: "1px solid rgba(247,245,239,0.07)" }}>
          <div style={{ fontFamily: F.serif, fontSize: 15, color: "#F7F5EF" }}>{sidebarOpen && "NexaAttend"}</div>
          {sidebarOpen && <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(247,245,239,0.35)", textTransform: "uppercase" }}>Demo Portal</div>}
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {NAV_TABS.map(t => {
            const isCurrent = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: isCurrent ? "rgba(247,245,239,0.1)" : "transparent", color: isCurrent ? "#F7F5EF" : "rgba(247,245,239,0.4)", fontSize: 12, fontWeight: isCurrent ? 600 : 400, fontFamily: F.sans, marginBottom: 2, borderLeft: `2px solid ${isCurrent ? C.greenLight : "transparent"}` }}>
                <span style={{ fontSize: 13 }}>{t.icon}</span>
                {sidebarOpen && <span>{t.label}</span>}
                {t.id === "notifications" && unreadNotifs > 0 && sidebarOpen && <span style={{ marginLeft: "auto", background: C.red, color: "#fff", borderRadius: 100, fontSize: 10, padding: "1px 6px" }}>{unreadNotifs}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(247,245,239,0.07)" }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ width: "100%", padding: "8px", background: "rgba(247,245,239,0.05)", border: "1px solid rgba(247,245,239,0.08)", borderRadius: 8, color: "rgba(247,245,239,0.4)", fontSize: 11, cursor: "pointer", marginBottom: 6, fontFamily: F.sans }}>{sidebarOpen ? "⟨ Collapse" : "⟩"}</button>
          <button onClick={onSignOut} style={{ width: "100%", padding: "8px", background: "rgba(247,245,239,0.05)", border: "1px solid rgba(247,245,239,0.08)", borderRadius: 8, color: "rgba(247,245,239,0.4)", fontSize: 11, cursor: "pointer", fontFamily: F.sans }}>{sidebarOpen ? "Sign out" : "↩"}</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ padding: "14px 24px", background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: F.serif }}>{NAV_TABS.find(t => t.id === activeTab)?.label}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.greenMuted, borderRadius: 100, padding: "5px 12px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#1B5C3A" }}>DEMO</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "22px 24px" }}>{moduleMap[activeTab]}</div>
      </div>
    </div>
  );
});

const DemoPage = memo(({ user, onSignOut, onBack }) => (
  <div style={{ minHeight: "100vh", background: C.bg }}>
    <div style={{ position: "sticky", top: 0, background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 14, zIndex: 20, height: 62, boxSizing: "border-box" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.green }}>←</button>
      <div>
        <div style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 600 }}>NexaAttend Demo</div>
        <div style={{ fontSize: 11, color: C.muted }}>Live trial dashboard</div>
      </div>
      <button onClick={onSignOut} style={{ marginLeft: "auto", background: C.dark, color: "#F7F5EF", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Sign Out</button>
    </div>
    <DemoDashboard user={user} onSignOut={onSignOut} />
  </div>
));

// ==================== INQUIRY FORM ====================
const InquiryForm = memo(() => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", role: "", school: "", city: "", phone: "", email: "", students: "", plan: "Standard", hear: "" });
  const [status, setStatus] = useState("idle");
  const setF = useCallback(k => e => setForm(f => ({ ...f, [k]: e.target.value })), []);

  if (status === "success") return <div style={{ textAlign: "center", padding: "40px 20px" }}><div style={{ fontSize: 50 }}>✓</div><h3 style={{ fontFamily: F.serif, fontSize: 22, marginTop: 12 }}>Thank you!</h3><p style={{ color: C.muted, marginTop: 6 }}>We'll contact you within 24 hours.</p></div>;

  return (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= i ? C.green : C.faint }} />)}
      </div>
      {step === 1 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input placeholder="Name *" value={form.name} onChange={setF("name")} style={{ padding: "10px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans }} />
        <select value={form.role} onChange={setF("role")} style={{ padding: "10px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans }}><option value="">Select role…</option><option>Principal</option><option>Owner</option><option>Admin</option></select>
        <input placeholder="Phone *" value={form.phone} onChange={setF("phone")} style={{ padding: "10px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans }} />
        <input placeholder="Email" value={form.email} onChange={setF("email")} style={{ padding: "10px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans }} />
      </div>}
      {step === 2 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input placeholder="School Name *" value={form.school} onChange={setF("school")} style={{ padding: "10px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans }} />
        <input placeholder="City *" value={form.city} onChange={setF("city")} style={{ padding: "10px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans }} />
        <select value={form.students} onChange={setF("students")} style={{ padding: "10px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans }}><option value="">No. of students *</option><option>Under 100</option><option>100-300</option><option>300-600</option><option>600+</option></select>
        <select value={form.hear} onChange={setF("hear")} style={{ padding: "10px 12px", border: `1.5px solid ${C.faint}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans }}><option value="">How did you hear?</option><option>Google</option><option>WhatsApp</option><option>Reference</option></select>
      </div>}
      {step === 3 && <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[{ v: "Basic", p: "₹6,000/mo" }, { v: "Standard", p: "₹9,000/mo" }, { v: "Premium", p: "₹12,000/mo" }].map(opt => (
          <button key={opt.v} onClick={() => setForm(f => ({ ...f, plan: opt.v }))} style={{ padding: 16, border: `2px solid ${form.plan === opt.v ? C.green : C.faint}`, background: form.plan === opt.v ? C.greenMuted : C.bg, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{opt.v}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{opt.p}</div>
          </button>
        ))}
      </div>}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        {step > 1 && <button onClick={() => setStep(s => s - 1)} style={{ padding: "11px 18px", background: "transparent", border: `1.5px solid ${C.faint}`, borderRadius: 9, fontSize: 13, cursor: "pointer" }}>Back</button>}
        {step < 3 ? <button onClick={() => setStep(s => s + 1)} style={{ flex: 1, padding: "11px", background: C.dark, color: "#F7F5EF", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Continue</button>
          : <button onClick={async () => { setStatus("sending"); try { await addDoc(collection(db, "salesLeads"), { ...form, createdAt: serverTimestamp() }); } catch {} setStatus("success"); }} style={{ flex: 1, padding: "11px", background: C.dark, color: "#F7F5EF", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Submit</button>}
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
    try {
      setSigningIn(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => { await firebaseSignOut(auth); nav("/"); }, [nav]);

  useEffect(() => { document.title = "School ERP Software | NexaAttend"; }, []);

  if (hash === "/demo") {
    if (!authReady) return <AuthLoadingScreen />;
    if (!user) { nav("/"); return null; }
    return <DemoPage user={user} onSignOut={signOut} onBack={() => nav("/")} />;
  }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ fontFamily: F.sans, background: C.bg, color: C.dark }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'); * { margin:0; padding:0; box-sizing:border-box; } html { scroll-behavior:smooth; } @keyframes spin { to { transform:rotate(360deg); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } } @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } } @keyframes fadeIn { from { opacity:0; } to { opacity:1; } } @keyframes tickerScroll { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }`}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 5%", height: 68, background: navScrolled ? "rgba(247,245,239,0.96)" : "transparent", backdropFilter: navScrolled ? "blur(14px)" : "none", borderBottom: navScrolled ? `1px solid ${C.border}` : "none", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: F.serif, fontSize: 21, fontWeight: 600, cursor: "pointer" }} onClick={() => scrollTo("hero")}>NexaAttend<span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.green, marginLeft: 4 }} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[["Features", "modules"], ["Pricing", "pricing"], ["FAQ", "faq"]].map(([l, id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: C.muted, fontFamily: F.sans }}>{l}</button>
          ))}
          {user ? <button onClick={() => nav("/demo")} style={{ padding: "9px 18px", background: C.green, color: "#F7F5EF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Open Dashboard</button>
            : <button onClick={signIn} disabled={signingIn} style={{ padding: "9px 18px", background: C.dark, color: "#F7F5EF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: signingIn ? 0.7 : 1 }}>{signingIn ? "Signing in…" : "Try Free Demo"}</button>}
        </div>
      </nav>

      <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "130px 6% 90px", textAlign: "center" }}>
        <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(42,107,74,0.08)", border: "1px solid rgba(42,107,74,0.2)", borderRadius: 100, padding: "7px 16px", marginBottom: 24 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} /><span style={{ fontSize: 11, fontWeight: 700, color: "#1B5C3A", letterSpacing: "0.09em" }}>NOW LIVE IN 40+ SCHOOLS</span></div></FadeIn>
        <FadeIn delay={0.1}><h1 style={{ fontFamily: F.serif, fontSize: "clamp(2.4rem,5.5vw,4.5rem)", lineHeight: 1.1, marginBottom: 24 }}>India's Smartest<br /><span style={{ color: C.green, fontStyle: "italic" }}>School ERP</span> with<br />AI Face Attendance</h1></FadeIn>
        <FadeIn delay={0.2}><p style={{ fontSize: 18, color: C.muted, maxWidth: 600, lineHeight: 1.7, marginBottom: 40 }}>Mark 300 students in 60 seconds. Manage fees, staff, exams, and learning — all from one offline-first system.</p></FadeIn>
        <FadeIn delay={0.3}><div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={signIn} disabled={signingIn} style={{ padding: "14px 28px", background: C.dark, color: "#F7F5EF", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.sans }}>{signingIn ? "Signing in…" : "Start 7-Day Free Trial"}</button>
          <button onClick={() => scrollTo("inquiry")} style={{ padding: "14px 28px", background: "transparent", color: C.dark, border: `2px solid ${C.faint}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Book a Demo →</button>
        </div></FadeIn>
        <FadeIn delay={0.4}><div style={{ display: "flex", gap: 32, marginTop: 56, flexWrap: "wrap", justifyContent: "center" }}>
          {[["99%+", "Face Accuracy"], ["< 60s", "30 Students"], ["3 Days", "Setup"], ["₹0", "Hidden Fees"]].map(([n, l], i) => (
            <div key={i} style={{ textAlign: "center" }}><div style={{ fontFamily: F.serif, fontSize: "1.8rem", fontWeight: 700, color: C.green }}>{n}</div><div style={{ fontSize: 12, color: C.muted }}>{l}</div></div>
          ))}
        </div></FadeIn>
      </section>

      <section id="modules" style={{ padding: "100px 6%", background: C.surface }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: F.serif, fontSize: "clamp(2rem,4vw,3rem)", textAlign: "center", marginBottom: 50 }}>Everything you need, <span style={{ fontStyle: "italic", color: C.green }}>in one system</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22 }}>
            {MODULES_INFO.map((m, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 16, padding: 26, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 28, marginBottom: 14, color: m.color }}>{m.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{m.title}</h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {m.features.map((f, j) => <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: C.muted }}>✓ {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: "100px 6%", background: C.bg }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontFamily: F.serif, fontSize: "clamp(2rem,4vw,3rem)", textAlign: "center", marginBottom: 40 }}>Simple <span style={{ fontStyle: "italic", color: C.green }}>pricing</span></h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 30 }}>
            {PLANS.map(p => (
              <button key={p.id} onClick={() => setSelPlan(p.id)} style={{ padding: "10px 24px", borderRadius: 100, border: `2px solid ${selPlan === p.id ? p.color : C.faint}`, background: selPlan === p.id ? p.color : "transparent", color: selPlan === p.id ? "#F7F5EF" : C.dark, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{p.name}</button>
            ))}
          </div>
          {plan && (
            <div style={{ background: C.surface, borderRadius: 20, border: `2px solid ${plan.color}`, padding: 32 }}>
              <h3 style={{ fontFamily: F.serif, fontSize: 26, marginBottom: 6 }}>{plan.name} Plan</h3>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Up to {plan.students} students</p>
              <div style={{ fontFamily: F.serif, fontSize: "2.2rem", color: plan.color }}>₹{plan.monthly.toLocaleString("en-IN")}<span style={{ fontSize: 14, color: C.muted }}>/mo</span></div>
              <div style={{ background: C.greenMuted, padding: 12, borderRadius: 10, margin: "16px 0", fontSize: 13, color: "#1B4D3E" }}>Setup: <strong style={{ textDecoration: "line-through", color: C.muted }}>₹75,000</strong> <strong style={{ color: C.green, fontSize: 17 }}>₹45,000</strong></div>
              <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {plan.features.map((f, i) => <li key={i} style={{ fontSize: 13, color: C.muted }}>✓ {f}</li>)}
              </ul>
              <button onClick={signIn} disabled={signingIn} style={{ width: "100%", padding: 13, background: plan.color, color: "#F7F5EF", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{signingIn ? "Signing in…" : "Start Free Trial →"}</button>
            </div>
          )}
        </div>
      </section>

      <section id="faq" style={{ padding: "100px 6%", background: C.surface }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <h2 style={{ fontFamily: F.serif, fontSize: "clamp(2rem,4vw,3rem)", textAlign: "center", marginBottom: 40 }}>FAQ</h2>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{f.q}</span>
                <span style={{ fontSize: 20, color: C.green }}>{activeFaq === i ? "−" : "+"}</span>
              </button>
              {activeFaq === i && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, paddingBottom: 18 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section id="inquiry" style={{ padding: "100px 6%", background: C.bg }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontFamily: F.serif, fontSize: "clamp(2rem,4vw,3rem)", textAlign: "center", marginBottom: 30 }}>Book your free demo</h2>
          <InquiryForm />
        </div>
      </section>

      <footer style={{ background: C.dark, padding: "40px 6%", textAlign: "center", color: "rgba(247,245,239,0.4)" }}>
        <p style={{ fontSize: 13 }}>© 2026 Nova Teach ERP. All rights reserved.</p>
      </footer>
    </div>
  );
}                      
