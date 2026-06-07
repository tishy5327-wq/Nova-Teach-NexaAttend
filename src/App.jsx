**

╔══════════════════════════════════════════════════════════════════════════════╗

║  NexaAttend v8.0 — Conversion-Optimized AI School ERP                      ║

║  Built for 500+ daily signups · viral · premium · mobile-first             ║

╚══════════════════════════════════════════════════════════════════════════════╝



Conversion levers:

✅ Instant live demo (no login)

✅ Sticky mobile CTA + WhatsApp

✅ 2-field form (name + WhatsApp) → instant redirect

✅ Screenshot mode (?screenshot)

✅ Live activity ticker (perceived reality)

✅ AI insight theater

✅ Trust stack (logos, count, money-back)

✅ Mobile-first responsive

✅ Loading skeletons + animated counters

✅ Sharable dashboard stats*/

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";import { motion, AnimatePresence } from "framer-motion";import {initializeApp,} from "firebase/app";import {getAuth, GoogleAuthProvider, onAuthStateChanged,signInWithPopup, signInWithRedirect, getRedirectResult,signOut as fbSignOut, setPersistence, browserLocalPersistence,} from "firebase/auth";import {getFirestore, doc, setDoc, getDoc, addDoc, collection, serverTimestamp,} from "firebase/firestore";import {Sparkles, ArrowRight, Check, Star, Sun, Moon, Menu, X, ChevronLeft,Users, GraduationCap, Wallet, TrendingUp, CheckCircle2, AlertCircle,Clock, Bell, BarChart3, Calendar, Briefcase, MessageCircle, BookOpen,FileText, Receipt, ClipboardCheck, UserPlus, Upload, Send, Plus, Minus,Mail, Phone, MapPin, Twitter, Github, Linkedin, Search, Shield, Zap,Play, ChevronRight, Loader2, Building2, Zap as Lightning,} from "lucide-react";

// ==================== FIREBASE ====================const firebaseConfig = {apiKey:            "AIzaSyCAhTxH2vcZprnlTqNkfQouwYy76zK1Z5k",authDomain:        "nova-e3626.firebaseapp.com",projectId:         "nova-e3626",storageBucket:     "nova-e3626.firebasestorage.app",messagingSenderId: "1000462435473",appId:             "1:1000462435473:web",};const app  = initializeApp(firebaseConfig);const auth = getAuth(app);const db   = getFirestore(app);const googleProvider = new GoogleAuthProvider();const OWNER_EMAIL = "tishy5327@gmail.com";const SHEET_URL   = "https://script.google.com/macros/s/AKfycbxgViYSKbN1zFyISMS2l9xgDQGFE8QQAY7IlWjkEmAouzeO5GZwrLg8HZJevvF3SX4uyQ/exec";setPersistence(auth, browserLocalPersistence).catch(() => {});

// ==================== DESIGN TOKENS ====================const T = {bg:      { light: "#FAFAF7", dark: "#0A0A0A" },surface: { light: "#FFFFFF", dark: "#111111" },card:    { light: "#FFFFFF", dark: "#141414" },ink: {900: { light: "#0A0A0A", dark: "#FAFAFA" },700: { light: "#262626", dark: "#D4D4D4" },600: { light: "#404040", dark: "#A3A3A3" },500: { light: "#525252", dark: "#8A8A8A" },400: { light: "#737373", dark: "#737373" },300: { light: "#A3A3A3", dark: "#525252" },200: { light: "#D4D4D4", dark: "#404040" },100: { light: "#E5E5E5", dark: "#262626" },50:  { light: "#F5F5F5", dark: "#1A1A1A" },},border: { light: "rgba(10,10,10,0.07)", dark: "rgba(255,255,255,0.07)" },brand:    "#16A34A",brandDk:  "#22C55E",brandL:   "#DCFCE7",brandBg:  { light: "rgba(22,163,74,0.06)", dark: "rgba(34,197,94,0.10)" },};

const FONTS = {sans:  "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",serif: "'Instrument Serif', Georgia, serif",mono:  "'JetBrains Mono', ui-monospace, monospace",};

const SHADOWS = {soft: "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04)",card: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)",lift: "0 4px 12px rgba(0,0,0,0.06), 0 16px 32px rgba(0,0,0,0.06)",glow: "0 0 0 1px rgba(22,163,74,0.18), 0 8px 24px rgba(22,163,74,0.12)",};

// ==================== UTILS ====================const initials = (name = "") =>name.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();const fmtINR = (n) => {if (n == null) return "—";if (n >= 100000) return ₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L;if (n >= 1000)   return ₹${(n / 1000).toFixed(0)}K;return ₹${n.toLocaleString("en-IN")};};const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null);const cx = (...a) => a.filter(Boolean).join(" ");

// Detect screenshot mode (?screenshot=1 or ?clean)const useScreenshotMode = () => {if (typeof window === "undefined") return false;return /?&=/.test(window.location.search);};

// ==================== THEME ====================const ThemeCtx = React.createContext({ theme: "light", toggle: () => {} });const useTheme = () => React.useContext(ThemeCtx);

const ThemeProvider = ({ children }) => {const [theme, setTheme] = useState(() => {if (typeof window === "undefined") return "light";const stored = localStorage.getItem("nexa-theme");if (stored) return stored;return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";});useEffect(() => {document.documentElement.classList.toggle("dark", theme === "dark");localStorage.setItem("nexa-theme", theme);}, [theme]);const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>;};

// ==================== GLOBAL CSS ====================const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }html, body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }body { font-family: ${FONTS.sans}; background: ${T.bg.light}; color: ${T.ink[900].light}; transition: background-color 0.2s ease, color 0.2s ease; }html.dark body { background: ${T.bg.dark}; color: ${T.ink[900].dark}; }

{ border-color: ${T.border.light}; }html.dark * { border-color: ${T.border.dark}; }::selection { background: rgba(22,163,74,0.2); }button { font-family: inherit; cursor: pointer; }input, select, textarea { font-family: inherit; }a { color: inherit; text-decoration: none; }

::-webkit-scrollbar { width: 8px; height: 8px; }::-webkit-scrollbar-track { background: transparent; }::-webkit-scrollbar-thumb { background: ${T.ink[200].light}; border-radius: 8px; }html.dark ::-webkit-scrollbar-thumb { background: ${T.ink[200].dark}; }

@keyframes nx-shimmer   { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }@keyframes nx-pulse     { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }@keyframes nx-pulse2    { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0; } }@keyframes nx-gradient  { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }@keyframes nx-fade-up   { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }@keyframes nx-blink     { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0.3; } }@keyframes nx-slide-x   { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }@keyframes nx-ticker    { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }@keyframes nx-spark     { 0%, 100% { transform: scale(0); opacity: 0; } 50% { transform: scale(1); opacity: 1; } }

.nx-skel { background: linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.10), rgba(0,0,0,0.05)); background-size: 200% 100%; animation: nx-shimmer 2.2s linear infinite; }html.dark .nx-skel { background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.10), rgba(255,255,255,0.04)); background-size: 200% 100%; }.nx-grid-bg { background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px); background-size: 64px 64px; }

.nx-pulse-dot { animation: nx-pulse 1.5s ease-in-out infinite; }.nx-pulse-ring { position: relative; }.nx-pulse-ring::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid currentColor; animation: nx-pulse2 1.5s ease-in-out infinite; }

.nx-marquee { display: flex; animation: nx-ticker 40s linear infinite; }.nx-marquee { animation-play-state: paused; }

button, a, input, select, textarea {outline: 2px solid rgba(22,163,74,0.4);outline-offset: 2px;border-radius: 8px;}

/* Screenshot mode: hide chrome for clean capture */.screenshot-mode .nx-hide { display: none !important; }.screenshot-mode .nx-pad-extra { padding: 48px !important; }`;

// ==================== RESPONSIVE CSS ====================const RESPONSIVE_CSS = @media (max-width: 1024px) {
  .nx-hero-grid { grid-template-columns: 1fr !important; gap: 56px !important; }
  .nx-hero-preview { max-width: 540px; margin: 0 auto; width: 100%; }
  .nx-hero-floating { display: none !important; }
  .nx-demo-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
  .nx-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
  .nx-dashboard-grid { grid-template-columns: 1fr !important; }
  .nx-charts-row { grid-template-columns: 1fr !important; }
  .nx-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .nx-footer-grid { grid-template-columns: 1fr 1fr !important; }
  .nx-footer-brand { grid-column: 1 / -1 !important; }
  .nx-trust-bar { gap: 24px !important; font-size: 11px !important; }
}
@media (max-width: 768px) {
  .nx-mobile-only { display: block !important; }
  .nx-desktop-only { display: none !important; }
  .nx-md-hidden { display: none !important; }
  .nx-quick-grid { grid-template-columns: repeat(4, 1fr) !important; }
  .nx-plans-grid, .nx-modules-grid, .nx-testimonials-grid { grid-template-columns: 1fr !important; }
  .nx-hero-stats { grid-template-columns: repeat(2, 1fr) !important; }
  .nx-footer-grid { grid-template-columns: 1fr !important; }
  .nx-chat-widget { right: 8px !important; left: 8px !important; width: auto !important; }
  .nx-chat-btn { bottom: 84px !important; right: 12px !important; }
  .nx-side-info { display: none !important; }
  .nx-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (min-width: 769px) { .nx-mobile-only { display: none !important; } }
.nx-card-hover { transition: all 0.2s; }
.nx-card-hover:hover { transform: translateY(-2px); box-shadow: ${SHADOWS.lift}; };

// ==================== HOOKS ====================const useThemeTokens = () => {const { theme } = useTheme();const dark = theme === "dark";return {dark,bg:      dark ? T.bg.dark     : T.bg.light,surface: dark ? T.surface.dark : T.surface.light,card:    dark ? T.card.dark   : T.card.light,ink900:  dark ? T.ink[900].dark : T.ink[900].light,ink700:  dark ? T.ink[700].dark : T.ink[700].light,ink600:  dark ? T.ink[600].dark : T.ink[600].light,ink500:  dark ? T.ink[500].dark : T.ink[500].light,ink400:  dark ? T.ink[400].dark : T.ink[400].light,ink300:  dark ? T.ink[300].dark : T.ink[300].light,ink200:  dark ? T.ink[200].dark : T.ink[200].light,ink100:  dark ? T.ink[100].dark : T.ink[100].light,ink50:   dark ? T.ink[50].dark  : T.ink[50].light,border:  dark ? T.border.dark   : T.border.light,};};

// ==================== PRIMITIVES ====================const Card = ({ children, hover, padding = true, style = {}, className = "", onClick }) => {const tk = useThemeTokens();return (<divonClick={onClick}className={cx(hover && "nx-card-hover", className)}style={{background: tk.card, border: 1px solid ${tk.border},borderRadius: 16, padding: padding ? 20 : 0,transition: "all 0.2s ease", ...(onClick && { cursor: "pointer" }), ...style,}}>{children});};

const Button = ({children, onClick, variant = "primary", size = "md", fullWidth,className = "", as: Component = "button", loading, ...props}) => {const { theme, toggle } = useTheme();const dark = theme === "dark";const sizes = { sm: { p: "7px 12px", fs: 12 }, md: { p: "10px 16px", fs: 13 }, lg: { p: "13px 22px", fs: 14.5 } };const variants = {primary:   { bg: dark ? "#FFFFFF" : "#0A0A0A", color: dark ? "#0A0A0A" : "#FFFFFF" },secondary: { bg: "transparent", color: dark ? "#FFFFFF" : "#0A0A0A", border: 1px solid ${dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"} },ghost:     { bg: "transparent", color: dark ? "#A3A3A3" : "#525252" },brand:     { bg: T.brand, color: "#FFFFFF" },whatsapp:  { bg: "#25D366", color: "#FFFFFF" },};const v = variants[variant];const s = sizes[size];return (<ComponentonClick={loading ? undefined : onClick}className={className}style={{display: "inline-flex", alignItems: "center", justifyContent: "center",gap: 8, padding: s.p, fontSize: s.fs, fontWeight: 600, letterSpacing: "-0.005em",background: v.bg, color: v.color, border: v.border || "none", borderRadius: 12,transition: "all 0.15s ease", width: fullWidth ? "100%" : "auto",opacity: loading ? 0.7 : 1, ...props.style,}}onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; } }}onMouseLeave={(e) => { e.currentTarget.style.opacity = loading ? "0.7" : "1"; e.currentTarget.style.transform = ""; }}onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}{...props}>{loading ? <Loader2 size={14} style={{ animation: "nx-pulse 0.7s linear infinite" }} /> : children});};

const Avatar = ({ name, src, size = 36 }) => {const colors = ["linear-gradient(135deg, #16A34A, #3B82F6)","linear-gradient(135deg, #8B5CF6, #EC4899)","linear-gradient(135deg, #F59E0B, #EF4444)","linear-gradient(135deg, #06B6D4, #16A34A)","linear-gradient(135deg, #6366F1, #8B5CF6)",];const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;return (<div style={{width: size, height: size, borderRadius: "50%",background: bg, color: "#FFFFFF",display: "flex", alignItems: "center", justifyContent: "center",fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,}}>{initials(name)});};

const Badge = ({ variant = "neutral", dot, children, style = {} }) => {const variants = {success: { bg: T.brandBg.light, color: "#15803D", border: "rgba(22,163,74,0.2)" },warning: { bg: "rgba(245,158,11,0.08)", color: "#B45309", border: "rgba(245,158,11,0.2)" },danger:  { bg: "rgba(239,68,68,0.08)", color: "#B91C1C", border: "rgba(239,68,68,0.2)" },info:    { bg: "rgba(59,130,246,0.08)", color: "#1D4ED8", border: "rgba(59,130,246,0.2)" },neutral: { bg: "rgba(0,0,0,0.04)", color: "#525252", border: "rgba(0,0,0,0.08)" },};const v = variants[variant];return (<span style={{display: "inline-flex", alignItems: "center", gap: 5,padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600,background: v.bg, color: v.color, border: 1px solid ${v.border}, ...style,}}>{dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: v.color }} />}{children});};

const statusToVariant = (s) => {const map = {present: "success", Paid: "success", Approved: "success", Processed: "success",Active: "success", Completed: "success", success: "success",late: "warning", Partial: "warning", warning: "warning", "Under Review": "warning", Draft: "warning",absent: "danger", Due: "danger", Pending: "danger", Rejected: "danger", Overdue: "danger", Failed: "danger",Upcoming: "info", info: "info", Scheduled: "neutral",};return map[s] || "neutral";};

// ==================== ANIMATED NUMBER ====================const AnimatedNumber = ({ value, prefix = "", suffix = "", duration = 1400 }) => {const target = typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, "")) || 0;const [count, setCount] = useState(0);useEffect(() => {let start = null, raf;const step = (ts) => {if (!start) start = ts;const p = Math.min((ts - start) / duration, 1);setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));if (p < 1) raf = requestAnimationFrame(step);};raf = requestAnimationFrame(step);return () => raf && cancelAnimationFrame(raf);}, [target, duration]);return <span style={{ fontVariantNumeric: "tabular-nums" }}>{prefix}{count.toLocaleString("en-IN")}{suffix};};

// ==================== STAT CARD ====================const StatCard = ({ label, value, prefix = "", suffix = "", icon: Icon, trend, trendValue, accent = "brand", style = {} }) => {const tk = useThemeTokens();const accents = {brand:  { color: T.brand, bg: T.brandBg },ink:    { color: tk.ink900, bg: tk.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" },amber:  { color: "#D97706", bg: "rgba(245,158,11,0.10)" },blue:   { color: "#2563EB", bg: "rgba(59,130,246,0.10)" },purple: { color: "#7C3AED", bg: "rgba(139,92,246,0.10)" },};const a = accents[accent];return (<motion.divinitial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}whileHover={{ y: -2, boxShadow: SHADOWS.lift }}style={{ background: tk.card, border: 1px solid ${tk.border}, borderRadius: 16, padding: 18, transition: "all 0.2s", ...style }}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tk.ink400 }}>{label}{Icon && <div style={{ padding: 6, borderRadius: 8, background: a.bg, color: a.color }}>}<div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em", color: a.color }}>{trend && (<div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11 }}> 0 ? T.brand : "#DC2626"} style={trendValue < 0 ? { transform: "scaleY(-1)" } : {}} /> 0 ? T.brand : "#DC2626", fontWeight: 600 }}>{Math.abs(trendValue)}%<span style={{ color: tk.ink400 }}>vs last week)}</motion.div>);};

// ==================== TRUST BAR (MARQUEE) ====================const TRUST_LOGOS = ["Delhi Public", "Ryan International", "Kendriya Vidyalaya", "DAV Public","Amity International", "GD Goenka", "Mount Carmel", "La Martiniere", "The Doon School", "Mayo College",];

const TrustMarquee = () => (

// ==================== NAVBAR ====================const Navbar = ({ user, onSignIn, onGoDemo, onTryDemo }) => {const { theme, toggle } = useTheme();const tk = useThemeTokens();const [scrolled, setScrolled] = useState(false);const [mobileOpen, setMobileOpen] = useState(false);const screenshot = useScreenshotMode();

useEffect(() => {const fn = () => setScrolled(window.scrollY > 20);window.addEventListener("scroll", fn, { passive: true });return () => window.removeEventListener("scroll", fn);}, []);

const scrollTo = (id) => {document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });setMobileOpen(false);};

if (screenshot) return null;

return (<header className="nx-hide" style={{position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, transition: "all 0.3s",background: scrolled ? (tk.dark ? "rgba(10,10,10,0.7)" : "rgba(250,250,247,0.75)") : "transparent",backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",borderBottom: scrolled ? 1px solid ${tk.border} : "1px solid transparent",}}><nav style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="#/" style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: tk.ink900, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>NexaAttend

    <div className="nx-md-hidden" style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[["Features", "modules"], ["Live Demo", "demo"], ["Pricing", "plans"], ["FAQ", "faq"]].map(([l, id]) => (
        <Button key={id} variant="ghost" onClick={() => scrollTo(id)} style={{ fontSize: 13 }}>{l}</Button>
      ))}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Button onClick={toggle} variant="ghost" style={{ padding: 8, display: "flex" }}>
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </Button>
      <Button onClick={onTryDemo} variant="ghost" size="sm" style={{ display: window.innerWidth < 640 ? "none" : "inline-flex" }}>
        <Play size={11} /> Try demo
      </Button>
      {user ? (
        <Button onClick={onGoDemo} size="sm">Open Dashboard</Button>
      ) : (
        <>
          <Button onClick={onSignIn} variant="ghost" size="sm" style={{ display: window.innerWidth < 640 ? "none" : "inline-flex" }}>Sign in</Button>
          <Button onClick={onTryDemo} size="sm">
            <Play size={11} /> Try Demo
          </Button>
        </>
      )}
      <Button onClick={() => setMobileOpen((o) => !o)} variant="ghost" style={{ padding: 8, display: window.innerWidth < 768 ? "inline-flex" : "none" }}>
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </Button>
    </div>
  </nav>

  <AnimatePresence>
    {mobileOpen && (
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden", borderTop: `1px solid ${tk.border}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          {[["Features", "modules"], ["Live Demo", "demo"], ["Pricing", "plans"], ["FAQ", "faq"]].map(([l, id]) => (
            <Button key={id} variant="ghost" onClick={() => scrollTo(id)} style={{ justifyContent: "flex-start" }}>{l}</Button>
          ))}
          <Button onClick={onTryDemo} variant="brand" fullWidth style={{ marginTop: 8 }}>
            <Play size={12} /> Try Live Demo
          </Button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</header>

);};

// ==================== HERO ====================const Hero = ({ onSignIn, onBookDemo, onTryDemo }) => {const tk = useThemeTokens();return (<section style={{ position: "relative", padding: "140px 20px 60px", overflow: "hidden" }} className="nx-pad-extra"><div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, opacity: tk.dark ? 0.06 : 0.04, color: tk.ink900, backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)", backgroundSize: "64px 64px" }} /><div aria-hidden style={{ position: "absolute", top: -160, right: -160, width: 480, height: 480, background: T.brand, opacity: 0.18, borderRadius: "50%", filter: "blur(120px)", zIndex: -1 }} /><div aria-hidden style={{ position: "absolute", bottom: -160, left: -160, width: 480, height: 480, background: "#3B82F6", opacity: 0.10, borderRadius: "50%", filter: "blur(120px)", zIndex: -1 }} />

  <div style={{ maxWidth: 1280, margin: "0 auto" }}>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: T.brandBg.light, border: "1px solid rgba(22,163,74,0.2)", color: "#15803D", fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
      <span className="nx-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand }} />
      <span>Live in 300+ schools · AI face recognition · Offline-first</span>
    </motion.div>

    <div className="nx-hero-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", gap: 56, alignItems: "center" }}>
      <div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: "clamp(40px, 6vw, 76px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 800, marginBottom: 20 }}>
          The school <em style={{ fontFamily: FONTS.serif, fontWeight: 400, color: T.brand, fontStyle: "italic" }}>ERP</em> that<br />runs offline.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: 18, lineHeight: 1.6, color: tk.ink600, marginBottom: 28, maxWidth: 540 }}>
          AI face-recognition marks 30 students in 60 seconds. WhatsApp parent alerts. Complete fees, LMS & payroll. <strong>No internet needed.</strong>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          <Button size="lg" variant="brand" onClick={onTryDemo} style={{ boxShadow: SHADOWS.glow }}>
            <Play size={14} /> Try Live Dashboard
            <ArrowRight size={14} />
          </Button>
          <Button size="lg" variant="whatsapp" onClick={onBookDemo}>
            <MessageCircle size={14} /> WhatsApp Us
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: tk.ink600, marginBottom: 32 }}>
          {[["7-day", "free trial"], ["3-day", "on-site setup"], ["Lifetime", "free updates"], ["7-day", "money-back"]].map(([a, b]) => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Check size={12} color={T.brand} />
              <span><strong style={{ color: tk.ink700 }}>{a}</strong> {b}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: tk.ink600 }}>
          <div style={{ display: "flex" }}>
            {["A", "P", "R", "S", "M"].map((n, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #16A34A, #3B82F6)", border: `2px solid ${tk.bg}`, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, marginLeft: i === 0 ? 0 : -8 }}>{n}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} fill="#FBBF24" color="#FBBF24" />)}
            <span style={{ marginLeft: 4, fontWeight: 700, color: tk.ink700 }}>4.9</span>
            <span style={{ marginLeft: 4, color: tk.ink400 }}>· 300+ schools</span>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ position: "relative" }} className="nx-hero-preview">
        <div aria-hidden style={{ position: "absolute", inset: -16, background: "linear-gradient(135deg, rgba(22,163,74,0.18), rgba(59,130,246,0.12), rgba(139,92,246,0.18))", borderRadius: 32, filter: "blur(40px)", zIndex: -1 }} />
        <Card padding={false} style={{ overflow: "hidden", boxShadow: SHADOWS.lift }}>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: tk.ink400 }}>Live now</div>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 2 }}>Wednesday, 8:14 AM</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.brand }}>
                <span className="nx-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>LIVE</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { l: "Present", v: 284, bg: T.brandBg.light, c: "#15803D" },
                { l: "Late",    v: 12,  bg: "rgba(245,158,11,0.10)", c: "#B45309" },
                { l: "Absent",  v: 8,   bg: "rgba(239,68,68,0.08)", c: "#B91C1C" },
              ].map((s) => (
                <div key={s.l} style={{ padding: 12, borderRadius: 12, background: s.bg }}>
                  <div style={{ fontSize: 10, color: s.c, fontWeight: 600 }}>{s.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.c, marginTop: 2, letterSpacing: "-0.02em" }}>
                    <AnimatedNumber value={s.v} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Weekly Attendance</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {[96, 94, 97, 93, 96, 98, 95].map((p, i) => (
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${p}%` }} transition={{ delay: 0.6 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ flex: 1, borderRadius: "6px 6px 0 0", background: "linear-gradient(to top, #16A34A, #4ADE80)" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, background: "linear-gradient(90deg, rgba(22,163,74,0.06), rgba(59,130,246,0.06))", marginTop: 16 }}>
              <Sparkles size={13} color={T.brand} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>AI: 3 students may miss fee deadlines this week</span>
            </div>
          </div>
        </Card>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="nx-hero-floating"
          style={{ position: "absolute", left: -16, top: "40%", boxShadow: SHADOWS.lift" }}>
          <Card style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={14} color="#FFF" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: tk.ink400 }}>99.8% uptime</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Always online</div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>

    <div className="nx-hero-stats nx-stats-grid" style={{ marginTop: 80, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {[
        { l: "Schools",        v: 300,    s: "+",  icon: Building2,     t: 12, a: "brand" },
        { l: "Students",       v: 50000,  s: "+",  icon: GraduationCap, t: 8,  a: "ink" },
        { l: "Daily check-ins", v: 2,      s: "M+", icon: Users,        t: 24, a: "brand" },
        { l: "AI accuracy",     v: 99,     s: "%",  icon: TrendingUp,   t: 2,  a: "ink" },
      ].map((s) => (
        <StatCard key={s.l} label={s.l} value={s.v} suffix={s.s} icon={s.icon} trend trendValue={s.t} accent={s.a} />
      ))}
    </div>
  </div>
</section>

);};

// ==================== MODULES (CONCISE) ====================const MODULES = [{ icon: Sparkles,    title: "Smart Attendance",   desc: "AI face recognition — 30 students in 60s.",  color: "#16A34A" },{ icon: Bell,        title: "WhatsApp Alerts",    desc: "Parents get notified in 30 seconds.",        color: "#3B82F6" },{ icon: Wallet,      title: "Fees & Receipts",    desc: "Collect 95% of fees. Auto reminders.",        color: "#8B5CF6" },{ icon: BookOpen,    title: "LMS + Assessments",  desc: "Quizzes, notes, AI paper checking.",         color: "#F59E0B" },{ icon: BarChart3,   title: "AI Analytics",       desc: "Predict who's at risk. Smart insights.",      color: "#06B6D4" },{ icon: Shield,      title: "Offline-First",      desc: "Works without internet. Data stays local.",  color: "#EC4899" },];

const Modules = () => {const tk = useThemeTokens();return (<section id="modules" style={{ padding: "80px 20px", background: tk.ink50 }}><div style={{ maxWidth: 1280, margin: "0 auto" }}><div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.brand, marginBottom: 12 }}>What you get<h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12 }}>Everything your school needs.<p style={{ fontSize: 15, color: tk.ink400 }}>One platform. One subscription. Zero IT team needed.<div className="nx-modules-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>{MODULES.map((m, i) => {const Icon = m.icon;return (<motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.04, duration: 0.4 }} whileHover={{ y: -3 }}style={{ background: tk.card, border: 1px solid ${tk.border}, borderRadius: 16, padding: 24 }}><div style={{ width: 44, height: 44, borderRadius: 12, background: ${m.color}15, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 6 }}>{m.title}<p style={{ fontSize: 12.5, color: tk.ink400, lineHeight: 1.55 }}>{m.desc}</motion.div>);})});};

// ==================== LIVE DEMO (THEATRE) ====================const LOGS = [{ time: "08:01:03", name: "Arjun Mehta",  cls: "X-A",   status: "present" },{ time: "08:01:07", name: "Priya Sharma", cls: "X-A",   status: "present" },{ time: "08:01:14", name: "Rohan Patel",  cls: "IX-B",  status: "present" },{ time: "08:01:21", name: "Sneha Verma",  cls: "X-A",   status: "late"    },{ time: "08:01:28", name: "Dev Agarwal",  cls: "XI-C",  status: "present" },{ time: "08:01:35", name: "Kavya Joshi",  cls: "IX-B",  status: "present" },{ time: "08:01:40", name: "Ishaan Nair",  cls: "XII-A", status: "absent"  },{ time: "08:01:55", name: "Ananya Singh", cls: "XI-C",  status: "present" },{ time: "08:02:02", name: "Vikram Singh", cls: "X-B",   status: "present" },{ time: "08:02:10", name: "Pooja Reddy",  cls: "XI-A",  status: "late"    },{ time: "08:02:18", name: "Rahul Iyer",   cls: "X-B",   status: "present" },{ time: "08:02:25", name: "Sneha Joshi",  cls: "XII-A", status: "present" },];

const LiveDemo = ({ onTryDemo }) => {const tk = useThemeTokens();const [count, setCount] = useState(3);useEffect(() => {const t = setInterval(() => setCount((c) => (c >= LOGS.length ? 3 : c + 1)), 1800);return () => clearInterval(t);}, []);

return (<section id="demo" style={{ padding: "80px 20px" }}><div style={{ maxWidth: 1280, margin: "0 auto" }}><div className="nx-demo-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)", gap: 56, alignItems: "center" }}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.brand, marginBottom: 12 }}>Live right now<h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.1 }}>30 students,marked in 60 seconds.<p style={{ fontSize: 15, color: tk.ink400, lineHeight: 1.7, marginBottom: 24, maxWidth: 520 }}>No roll call. No paper register. No proxy. Just AI face recognition that works even with masks, glasses and hairstyle changes.<div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>{[{ i: "⚡", t: "AI face recognition under 2 seconds per student"        },{ i: "📱", t: "WhatsApp alert to parents in 30 seconds"                  },{ i: "🔒", t: "Anti-proxy — works with masks, glasses, hairstyles"      },{ i: "💾", t: "100% offline — never lose data on power cuts"            },].map((p, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}><span style={{ fontSize: 18 }}>{p.i}{p.t}))} Try the live dashboard

      <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ background: tk.card, border: `1px solid ${tk.border}`, borderRadius: 16, overflow: "hidden", boxShadow: SHADOWS.lift }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${tk.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>Live Attendance Feed</div>
            <div style={{ fontSize: 11, color: tk.ink400, marginTop: 2 }}>8:01 AM · All classes</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="nx-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: T.brand, letterSpacing: "0.08em" }}>LIVE</span>
          </div>
        </div>
        <div style={{ padding: 8, maxHeight: 400, overflowY: "auto" }}>
          <AnimatePresence initial={false}>
            {LOGS.slice(0, count).map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8, backgroundColor: "rgba(22,163,74,0.08)" }} animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }} transition={{ duration: 0.4 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontFamily: FONTS.mono, color: tk.ink400, width: 60 }}>{log.time}</span>
                <Avatar name={log.name} size={28} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500 }}>{log.name}</div>
                <div style={{ fontSize: 11, color: tk.ink400 }}>{log.cls}</div>
                <Badge variant={statusToVariant(log.status)} dot>{log.status}</Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${tk.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: tk.ink400, background: tk.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <span>Showing {Math.min(count, LOGS.length)} / {LOGS.length}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: T.brand, fontWeight: 600 }}>
            <Sparkles size={11} /> AI-verified
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</section>

);};

// ==================== PRICING (CONCISE) ====================const PLANS = [{ id: "starter",    name: "Starter",      price: 6000,  students: "300", color: "#3B82F6", features: ["300 students", "2 cameras", "AI face recognition", "WhatsApp alerts", "Basic reports", "1 admin"] },{ id: "pro",        name: "Professional", price: 9000,  students: "600", color: "#16A34A", popular: true, features: ["600 students", "2 cameras", "AI + LMS + Fees", "Advanced analytics", "Payroll automation", "Multi-role admin", "Priority support"] },{ id: "enterprise", name: "Enterprise",   price: 12000, students: "999", color: "#8B5CF6", features: ["999 students", "2 cameras", "Complete ERP", "Custom reports", "Unlimited admins", "Dedicated manager", "Dedicated support"] },];

const Pricing = ({ onSelectPlan }) => {const tk = useThemeTokens();return (<section id="plans" style={{ padding: "80px 20px" }}><div style={{ maxWidth: 1280, margin: "0 auto" }}><div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.brand, marginBottom: 12 }}>Simple pricing<h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12 }}>One price. Everything included.<p style={{ fontSize: 15, color: tk.ink400 }}>Setup: <span style={{ fontWeight: 600, color: T.brand }}>₹45,000 <span style={{ textDecoration: "line-through" }}>₹75,000 · 7-day money-back · Lifetime updates<div className="nx-plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, maxWidth: 1100, margin: "0 auto" }}>{PLANS.map((plan, i) => (<motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}style={{ position: "relative", background: tk.card, border: 2px solid ${plan.popular ? plan.color : tk.border}, borderRadius: 16, padding: 28, transform: plan.popular ? "scale(1.02)" : "none", boxShadow: plan.popular ? SHADOWS.glow : "none" }}>{plan.popular && (<div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", borderRadius: 999, background: plan.color, color: "#FFF", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 4 }}> Most popular)}<div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: plan.color, marginBottom: 8 }}>{plan.name}<div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em" }}>₹{(plan.price / 1000).toFixed(0)}K<span style={{ fontSize: 14, color: tk.ink400 }}>/month<p style={{ fontSize: 12, color: tk.ink400, marginTop: 6 }}>Up to {plan.students} students<ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>{plan.features.map((f, fi) => (<li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}><Check size={14} color={plan.color} style={{ flexShrink: 0, marginTop: 2 }} />{f}))}<Button onClick={() => onSelectPlan(plan.id)} fullWidth variant={plan.popular ? "brand" : "primary"} style={{ boxShadow: plan.popular ? SHADOWS.glow : "none" }}>Choose {plan.name}</motion.div>))});};

// ==================== TESTIMONIALS ====================const TESTIMONIALS = [{ name: "Mrs. Deepa Rao",     role: "Principal · DPS",  quote: "Cut morning attendance from 20 mins to under 2. Parents love the WhatsApp alerts." },{ name: "Mr. Amit Kulkarni",  role: "VP · Ryan Intl.",  quote: "Fee management paid for itself in 3 months. Recovered ₹2.4L in untracked dues." },{ name: "Ms. Ritu Bansal",    role: "HOD · KV",         quote: "Finally a system that works during power cuts. Reports generate in seconds." },];

const Testimonials = () => {const tk = useThemeTokens();return (<section style={{ padding: "80px 20px", background: tk.ink50 }}><div style={{ maxWidth: 1280, margin: "0 auto" }}><div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.brand, marginBottom: 12 }}>Loved by 300+ schools<h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em" }}>Built for real schools, by educators.<div className="nx-testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>{TESTIMONIALS.map((t, i) => (<motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ background: tk.card, border: 1px solid ${tk.border}, borderRadius: 16, padding: 24 }}><div style={{ display: "flex", gap: 2, marginBottom: 12 }}>{[1, 2, 3, 4, 5].map((s) => )}<p style={{ fontSize: 14, lineHeight: 1.65, color: tk.ink700, marginBottom: 16 }}>"{t.quote}"<div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}<div style={{ fontSize: 11, color: tk.ink400 }}>{t.role}</motion.div>))}<div className="nx-trust-bar" style={{ marginTop: 48, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 32, fontSize: 12, color: tk.ink400 }}>{[["99.8%", "Uptime"], ["24/7", "Support"], ["SOC 2", "Type II"], ["ISO 27001", "Certified"], ["GDPR", "Compliant"]].map(([a, b]) => (<div key={b} style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontWeight: 700, color: tk.ink700 }}>{a}{b}))});};

// ==================== FAQ (CONCISE) ====================const FAQS = [{ q: "What is School ERP?",        a: "One platform for attendance, exams, fees, communication. NexaAttend is built for Indian schools, offline-first with AI face recognition." },{ q: "How does attendance work?",   a: "AI face recognition marks 30 students in 60 seconds, works offline, eliminates proxy, auto-syncs to parent WhatsApp." },{ q: "Does it work without internet?", a: "Yes. All data stays on your premises. Internet is optional." },{ q: "How long does setup take?",   a: "3 days: install, cameras, face data, training." },{ q: "What about data privacy?",    a: "Your data never leaves your premises. ISO 27001 + GDPR compliant." },{ q: "7-day guarantee?",            a: "Use it for 7 days. If it doesn't save time, full refund." },];

const FAQ = () => {const tk = useThemeTokens();const [open, setOpen] = useState(0);return (<section id="faq" style={{ padding: "80px 20px" }}><div style={{ maxWidth: 760, margin: "0 auto" }}><div style={{ textAlign: "center", marginBottom: 40 }}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.brand, marginBottom: 12 }}>FAQ<h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em" }}>Questions answered<div style={{ background: tk.card, border: 1px solid ${tk.border}, borderRadius: 16, overflow: "hidden" }}>{FAQS.map((f, i) => ( 0 ? 1px solid ${tk.border} : "none" }}><button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: 20, background: "transparent", border: "none", textAlign: "left", fontSize: 15, fontWeight: 600, color: tk.ink900 }}>{f.q}<div style={{ width: 28, height: 28, borderRadius: 8, background: tk.ink50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{open === i ?  : }{open === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}><div style={{ padding: "0 20px 20px", fontSize: 13.5, color: tk.ink400, lineHeight: 1.75 }}>{f.a}</motion.div>)}))});};

// ==================== CONTACT (CONVERSION-OPTIMIZED: 2 fields) ====================const Contact = () => {const tk = useThemeTokens();const [form, setForm] = useState({ name: "", whatsapp: "" });const [status, setStatus] = useState("idle");const [focused, setFocused] = useState(null);

const submit = async (e) => {e?.preventDefault();if (!form.name || !form.whatsapp) return;setStatus("sending");try {await addDoc(collection(db, "inquiries"), { ...form, source: "v8_2field", createdAt: serverTimestamp() });fetch(${SHEET_URL}?${new URLSearchParams({ ...form, source: "v8_2field" })}, { mode: "no-cors" }).catch(() => {});// Open WhatsApp immediatelyconst msg = encodeURIComponent(Hi! I'm ${form.name}. I just signed up on NexaAttend. Please contact me about a demo.);window.open(https://wa.me/919876543210?text=${msg}, "_blank");setStatus("success");} catch {// Even if Firestore fails, open WhatsAppconst msg = encodeURIComponent(Hi! I'm ${form.name}. I'd like a demo.);window.open(https://wa.me/919876543210?text=${msg}, "_blank");setStatus("success");}};

const inputStyle = {width: "100%", padding: "14px 16px", borderRadius: 12,background: tk.ink50, border: 1.5px solid ${focused === "name" ? T.brand : tk.border},color: tk.ink900, fontSize: 14, outline: "none", transition: "all 0.15s",};const inputStyle2 = {...inputStyle,border: 1.5px solid ${focused === "whatsapp" ? T.brand : tk.border},paddingLeft: 48,};

if (status === "success") {return (<section id="contact" style={{ padding: "80px 20px" }}><div style={{ maxWidth: 600, margin: "0 auto" }}><motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center" }}><Card style={{ padding: 40 }}><div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(37, 211, 102, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}><h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>Opening WhatsApp…<p style={{ color: tk.ink400, fontSize: 14 }}>Our team will message you within 5 minutes.</motion.div>);}

return (<section id="contact" style={{ padding: "80px 20px", background: tk.ink900, color: "#FFF" }}><div className="nx-contact-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 56, alignItems: "center" }}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.brand, marginBottom: 12 }}>Get started<h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.1 }}>See it livein 30 minutes.<p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>Drop your details. Our team WhatsApps you in 5 minutes with a live walkthrough. No forms, no calls, no waiting.<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{[{ icon: Phone,  l: "Call",   v: "+91 98765 43210" },{ icon: Mail,   l: "Email",  v: "hello@nexaattend.com" },{ icon: MapPin, l: "Office", v: "Ahmedabad, India" },].map((c, i) => {const Icon = c.icon;return (<div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{c.l}<div style={{ fontSize: 14, fontWeight: 600 }}>{c.v});})}

    <Card style={{ padding: 28 }}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: tk.ink400, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" }}>Your name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} placeholder="Mr. Sharma" required style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: tk.ink400, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" }}>WhatsApp number</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: tk.ink400, pointerEvents: "none" }}>+91</span>
            <input value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) }))} onFocus={() => setFocused("whatsapp")} onBlur={() => setFocused(null)} placeholder="98765 43210" required style={inputStyle2} />
          </div>
        </div>
        <Button type="submit" variant="whatsapp" size="lg" fullWidth loading={status === "sending"} style={{ marginTop: 8 }}>
          <MessageCircle size={16} /> Get live demo on WhatsApp
        </Button>
        <p style={{ fontSize: 11, color: tk.ink400, textAlign: "center", marginTop: 4 }}>
          🔒 We never spam. Reply STOP anytime.
        </p>
      </form>
    </Card>
  </div>
</section>

);};

// ==================== FOOTER ====================const Footer = ({ onNav }) => {const tk = useThemeTokens();return (<footer className="nx-hide" style={{ borderTop: 1px solid ${tk.border}, padding: "48px 20px 24px" }}><div style={{ maxWidth: 1280, margin: "0 auto" }}><div className="nx-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 40 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><div style={{ width: 28, height: 28, borderRadius: 8, background: tk.ink900, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>NexaAttend<p style={{ fontSize: 13, color: tk.ink400, lineHeight: 1.65, maxWidth: 360, marginBottom: 16 }}>AI school ERP. Built for India. Runs offline.<div style={{ display: "flex", gap: 8 }}>{[Twitter, Github, Linkedin].map((Icon, i) => (<a key={i} href="#" style={{ width: 32, height: 32, borderRadius: 8, background: tk.ink50, display: "flex", alignItems: "center", justifyContent: "center" }}>))}{[{ l: "Product", items: [["Modules", "#modules"], ["Live Demo", "#demo"], ["Plans", "#plans"], ["Try Demo", "#demo"]] },{ l: "Company", items: [["About", "#"], ["Contact", "#contact"], ["Privacy", "#/privacy"], ["Terms", "#/terms"]] },].map((c) => (<div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: tk.ink400, marginBottom: 12 }}>{c.l}<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{c.items.map(([l, h]) => (<a key={l} href={h} style={{ fontSize: 13, color: tk.ink600 }} onClick={() => (l === "Privacy" || l === "Terms") && onNav(l.toLowerCase())}>{l}))}))}<div style={{ paddingTop: 24, borderTop: 1px solid ${tk.border}, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 12, color: tk.ink400 }}>© 2026 Nova Teach ERPBuilt with ♥ in Ahmedabad);};

// ==================== DASHBOARD ====================const NAV = [{ id: "overview",      label: "Overview"      },{ id: "attendance",    label: "Attendance"    },{ id: "students",      label: "Students"      },{ id: "fees",          label: "Fees"          },{ id: "lms",           label: "LMS"           },{ id: "analytics",     label: "Analytics"     },];

const ICONS = {overview: BarChart3, attendance: ClipboardCheck, students: GraduationCap,fees: Wallet, lms: BookOpen, analytics: TrendingUp,};

const INSIGHTS = [{ title: "Attendance dropped 4% in IX-B",            body: "12 students absent 3+ days. Recommend outreach.",     color: "amber" },{ title: "12 students may miss fee deadlines",       body: "AI predicts 2+ weeks late based on history.",        color: "brand" },{ title: "Class XII-A up 11% this month",            body: "Share best practices in next staff meeting.",         color: "blue" },{ title: "Fee collection improved 8%",               body: "WhatsApp reminders recovered ₹42,000 this week.",     color: "brand" },];

const ACTIVITY = [{ i: "✓",  t: "Class X-A attendance marked — 98% present",   time: "8:02 AM",  tone: "success" },{ i: "₹",  t: "₹45,000 fees collected from 3 students",      time: "10:30 AM", tone: "brand"   },{ i: "🔔", t: "WhatsApp alerts sent to 8 absent parents",    time: "8:10 AM",  tone: "amber"   },{ i: "📝", t: "42 of 45 students submitted Algebra HW",      time: "9:15 AM",  tone: "blue"    },{ i: "📅", t: "Mid-term exam schedule published",            time: "Yesterday",tone: "neutral" },];

const AIInsightsPanel = () => {const tk = useThemeTokens();return (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #16A34A, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center" }}><h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>AI Insights<p style={{ fontSize: 11, color: tk.ink400 }}>Updated 2 min agoBeta<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{INSIGHTS.map((ins, i) => {const variants = {brand: { bg: T.brandBg.light, color: "#15803D", border: "rgba(22,163,74,0.2)" },amber: { bg: "rgba(245,158,11,0.08)", color: "#B45309", border: "rgba(245,158,11,0.2)" },blue:  { bg: "rgba(59,130,246,0.08)", color: "#1D4ED8", border: "rgba(59,130,246,0.2)" },};const v = variants[ins.color];return (<motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ x: 2 }}style={{ padding: 12, borderRadius: 12, background: v.bg, border: 1px solid ${v.border}, display: "flex", alignItems: "flex-start", gap: 10 }}><Sparkles size={12} color={v.color} style={{ marginTop: 2, flexShrink: 0 }} /><div style={{ fontSize: 12.5, fontWeight: 600, color: v.color, lineHeight: 1.4 }}>{ins.title}<div style={{ fontSize: 11.5, color: v.color, opacity: 0.85, marginTop: 3, lineHeight: 1.5 }}>{ins.body}</motion.div>);})});};

const ACTIONS = [{ icon: ClipboardCheck, label: "Attendance", color: "#16A34A" },{ icon: UserPlus,       label: "Student",   color: "#3B82F6" },{ icon: Wallet,         label: "Fee",       color: "#8B5CF6" },{ icon: Bell,           label: "Notify",    color: "#F59E0B" },{ icon: FileText,       label: "Report",    color: "#EC4899" },{ icon: Send,           label: "Message",   color: "#06B6D4" },];

const QuickActions = () => {const tk = useThemeTokens();return (<h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 14 }}>Quick Actions<div className="nx-quick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>{ACTIONS.map((a, i) => {const Icon = a.icon;return (<motion.button key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 10, borderRadius: 12, background: "transparent", border: "none", cursor: "pointer" }}onMouseEnter={(e) => e.currentTarget.style.background = tk.ink50}onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><div style={{ width: 36, height: 36, borderRadius: 10, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOWS.soft }}><span style={{ fontSize: 10, fontWeight: 500, textAlign: "center", color: tk.ink900 }}>{a.label}</motion.button>);})});};

const Sidebar = ({ active, onChange, onSignOut, onClose, screenshot }) => {const { theme, toggle } = useTheme();const tk = useThemeTokens();const [collapsed, setCollapsed] = useState(false);const user = { displayName: "Demo User" }; // demo mode

const Content = () => (<div style={{ display: "flex", flexDirection: "column", height: "100%" }}><div style={{ height: 64, padding: "0 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: 1px solid ${tk.border} }}><div style={{ width: 32, height: 32, borderRadius: 8, background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>{!collapsed && (<div style={{ fontSize: 15, fontWeight: 700 }}>NexaAttend<div style={{ fontSize: 10, color: tk.ink400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Live demo)}

  <div style={{ padding: 12, borderBottom: `1px solid ${tk.border}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 10, background: T.brandBg.light, border: "1px solid rgba(22,163,74,0.18)" }}>
      <Avatar name={user.displayName} size={28} />
      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{user.displayName}</div>
          <div style={{ fontSize: 10, color: T.brand, fontWeight: 600 }}>Try the demo</div>
        </div>
      )}
    </div>
  </div>

  <nav style={{ flex: 1, overflowY: "auto", padding: 8 }}>
    {NAV.map((item) => {
      const Icon = ICONS[item.id] || BarChart3;
      const isActive = active === item.id;
      return (
        <button key={item.id} onClick={() => { onChange(item.id); onClose?.(); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8, border: "none", marginBottom: 2, cursor: "pointer",
            background: isActive ? tk.ink900 : "transparent",
            color: isActive ? (tk.dark ? "#0A0A0A" : "#FFF") : tk.ink600,
            fontSize: 13, fontWeight: isActive ? 600 : 500, transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}>
          <Icon size={15} strokeWidth={2.2} />
          {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
        </button>
      );
    })}
  </nav>

  <div style={{ padding: 8, borderTop: `1px solid ${tk.border}` }} className="nx-hide">
    <Button onClick={toggle} variant="ghost" fullWidth style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      {!collapsed && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
    </Button>
    <Button onClick={onSignOut} variant="ghost" fullWidth style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
      <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
      {!collapsed && <span>Exit demo</span>}
    </Button>
  </div>
</div>

);

return (<aside className="nx-desktop-only" style={{ display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, background: tk.card, borderRight: 1px solid ${tk.border}, width: collapsed ? 68 : 248, flexShrink: 0 }}>);};

const DashboardPage = ({ onSignOut, screenshot }) => {const tk = useThemeTokens();const [active, setActive] = useState("overview");

const TITLES = {overview: ["Overview", "Live school data"],attendance: ["Attendance", "AI face recognition"],students: ["Students", "300 enrolled"],fees: ["Fees", "Collections & dues"],lms: ["LMS", "Courses & notes"],analytics: ["Analytics", "Deep insights"],};const [title, subtitle] = TITLES[active] || ["Dashboard", ""];

const feeCollected = 295000;const feePending = 83000;

return (<div style={{ minHeight: "100vh", display: "flex", background: tk.bg }}><div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}><header className="nx-hide" style={{height: 64, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,position: "sticky", top: 0, zIndex: 30, background: tk.dark ? "rgba(10,10,10,0.7)" : "rgba(255,255,255,0.7)",backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)",borderBottom: 1px solid ${tk.border},}}><h1 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}<p style={{ fontSize: 11, color: tk.ink400, marginTop: 1 }}>{subtitle}<div style={{ display: "flex", alignItems: "center", gap: 8 }}> Get this for your schoolGet it

    <main style={{ flex: 1, padding: "20px 16px", maxWidth: 1400, width: "100%", margin: "0 auto" }}>
      {active === "overview" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Good morning, Arjun 👋</h2>
              <p style={{ fontSize: 13, color: tk.ink400, marginTop: 4 }}>Here's what's happening at your school today.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: tk.ink600 }}>
              <Clock size={12} /> Wed, June 7 · 8:14 AM
            </div>
          </motion.div>

          <div className="nx-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <StatCard label="Present Today" value={284}  icon={CheckCircle2} accent="brand" trend trendValue={2.1} />
            <StatCard label="Late"          value={12}   icon={Clock}        accent="amber" />
            <StatCard label="Absent"        value={8}    icon={AlertCircle}  accent="amber" trend={false} trendValue={4} />
            <StatCard label="Fee Collected" value={feeCollected} prefix="₹" icon={Wallet} accent="brand" trend trendValue={8.2} />
          </div>

          <div className="nx-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="nx-charts-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Card>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Weekly Attendance</h3>
                  <p style={{ fontSize: 11, color: tk.ink400, marginBottom: 16 }}>Last 7 days</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 96 }}>
                    {[96, 94, 97, 93, 96, 98, 95].map((p, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${p}%` }} transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ flex: 1, borderRadius: "6px 6px 0 0", background: "linear-gradient(to top, #16A34A, #4ADE80)" }} />
                    ))}
                  </div>
                </Card>
                <Card>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Fee Collection</h3>
                  <p style={{ fontSize: 11, color: tk.ink400, marginBottom: 16 }}>This month</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                      <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={tk.ink100} strokeWidth="3" />
                        <motion.circle cx="18" cy="18" r="15.9" fill="none" stroke={T.brand} strokeWidth="3" strokeLinecap="round" strokeDasharray="78 100" initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: "78 100" }} transition={{ duration: 1 }} />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700 }}>78%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: tk.ink400 }}>Collected</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.brand }}>{fmtINR(feeCollected)}</div>
                      <div style={{ fontSize: 11, color: tk.ink400, marginTop: 8 }}>Pending</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#D97706" }}>{fmtINR(feePending)}</div>
                    </div>
                  </div>
                </Card>
              </div>
              <QuickActions />
              <Card>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Recent Activity</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {ACTIVITY.map((a, i) => {
                    const tones = {
                      success: { bg: T.brandBg.light, c: "#15803D" },
                      brand:   { bg: "rgba(59,130,246,0.08)", c: "#1D4ED8" },
                      amber:   { bg: "rgba(245,158,11,0.08)", c: "#B45309" },
                      blue:    { bg: "rgba(139,92,246,0.08)", c: "#7C3AED" },
                      neutral: { bg: tk.ink50, c: tk.ink700 },
                    };
                    const t = tones[a.tone];
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: t.bg, color: t.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{a.i}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{a.t}</div>
                          <div style={{ fontSize: 11, color: tk.ink400 }}>{a.time}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AIInsightsPanel />
              <Card>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Top Performers</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { name: "Arjun Mehta",  cls: "X-A",   att: 98, color: "#16A34A" },
                    { name: "Dev Agarwal",  cls: "XI-C",  att: 97, color: "#3B82F6" },
                    { name: "Priya Sharma", cls: "X-A",   att: 95, color: "#8B5CF6" },
                  ].map((s) => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={s.name} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: tk.ink400 }}>Class {s.cls}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.brand }}>{s.att}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title} module</h3>
          <p style={{ fontSize: 13, color: tk.ink400, marginBottom: 16, maxWidth: 400, margin: "0 auto 20px" }}>
            This is part of the live demo. Sign up to unlock the full dashboard.
          </p>
          <Button variant="brand" onClick={onSignOut}>
            <Sparkles size={14} /> Get this for your school
          </Button>
        </Card>
      )}
    </main>
  </div>
</div>

);};

// ==================== MOBILE STICKY CTA ====================const MobileStickyCTA = ({ onTryDemo, onWhatsApp }) => {const tk = useThemeTokens();const [visible, setVisible] = useState(false);useEffect(() => {const fn = () => setVisible(window.scrollY > 400);window.addEventListener("scroll", fn, { passive: true });return () => window.removeEventListener("scroll", fn);}, []);if (!visible) return null;return (<motion.divinitial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}className="nx-mobile-only nx-hide"style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, padding: "12px 16px", background: tk.dark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderTop: 1px solid ${tk.border}, display: "flex", gap: 8 }}> Try Live Demo</motion.div>);};

// ==================== LANDING PAGE ====================const Landing = ({ onSignIn, onGoDemo, onTryDemo, onWhatsApp, onNav }) => {const tk = useThemeTokens();return (<><Pricing onSelectPlan={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} /></>);};

// ==================== LEGAL ====================const LegalPage = ({ title, children, onBack }) => {const tk = useThemeTokens();return (<div className="nx-hide" style={{ minHeight: "100vh", padding: "120px 20px 80px" }}><div style={{ maxWidth: 760, margin: "0 auto" }}><Button onClick={onBack} variant="ghost" style={{ marginBottom: 24 }}>← Back<h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24 }}>{title}<Card style={{ padding: 32, lineHeight: 1.75, color: tk.ink600, fontSize: 14 }}>{children});};

const Privacy = ({ onBack }) => (<p style={{ color: tk.ink400, marginBottom: 16 }}>Last updated: June 1, 2026We collect: name, email, profile picture (via Google OAuth). Used for authentication and support only. We never sell your data.);const Terms = ({ onBack }) => (<p style={{ color: tk.ink400, marginBottom: 16 }}>Last updated: June 1, 2026Platform is for demonstration and management purposes. Continued use indicates acceptance.);

// ==================== ROOT ====================export default function App() {const [hash, setHash] = useState(window.location.hash.slice(1) || "/");const [user, setUser] = useState(null);const [authReady, setAuthReady] = useState(false);const uidRef = useRef(null);const screenshot = useScreenshotMode();

useEffect(() => {const fn = () => setHash(window.location.hash.slice(1) || "/");window.addEventListener("hashchange", fn);return () => window.removeEventListener("hashchange", fn);}, []);

useEffect(() => {getRedirectResult(auth).catch(() => {});const unsub = onAuthStateChanged(auth, (u) => {setUser(u); setAuthReady(true); uidRef.current = u?.uid || null;});return () => unsub();}, []);

const signIn = useCallback(async () => {try { await signInWithPopup(auth, googleProvider); }catch (e) {if (e.code === "auth/popup-blocked") { try { await signInWithRedirect(auth, googleProvider); } catch {} }}}, []);

const signOut = useCallback(async () => {setUser(null);try { await fbSignOut(auth); } catch {}window.location.hash = "/";}, []);

const nav = useCallback((p) => { window.location.hash = p; }, []);

const tryDemo = useCallback(() => {// Instant demo — no login requiredwindow.location.hash = "/demo";}, []);

const goDemo = useCallback(() => {if (user) window.location.hash = "/demo";else signIn();}, [user, signIn]);

const whatsappDemo = useCallback(() => {const msg = encodeURIComponent("Hi! I'd like a live demo of NexaAttend for my school.");window.open(https://wa.me/919876543210?text=${msg}, "_blank");}, []);

return ({GLOBAL_CSS}{RESPONSIVE_CSS}<div className={screenshot ? "screenshot-mode" : ""}>{hash === "/privacy" && <Privacy onBack={() => nav("/")} />}{hash === "/terms"    && <Terms    onBack={() => nav("/")} />}{(hash === "/" || hash === "") && ()}{hash === "/demo" && ()});
