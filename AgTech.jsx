import { getMarketPrices } from "./api/marketApi";
import React, { useState, useMemo } from "react";
import { gradeWheatImage } from "./api/gradingApi";
import {
  Sprout, LayoutDashboard, Package, PlusCircle, ScanLine, TrendingUp,
  LineChart as LineChartIcon, Users, ShoppingCart, Wallet, User, Menu, X,
  Search, ChevronDown, Star, MapPin, Phone, Mail, Lock, Eye, EyeOff,
  Upload, Check, ArrowUpRight, ArrowDownRight, Bell, LogOut, Filter,
  Calendar, Sparkles, Wheat, BadgeCheck, ChevronRight, Camera, Info
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

/* ---------------------------------------------------------------------
   DESIGN TOKENS
   Field notes: this is a mandi (market) ledger, not a generic SaaS app.
   Palette pulls from harvest + soil rather than default cream/terracotta.
--------------------------------------------------------------------- */
const T = {
  bg: "#F6F2E7",        // husk cream
  surface: "#FFFFFF",
  ink: "#1E2A1E",        // soil black-green
  inkSoft: "#5B6B57",
  border: "#E4DBC4",
  primary: "#2C5F35",    // field green
  primaryDark: "#1B3D22",
  primarySoft: "#E4EEDD",
  gold: "#C9932E",       // harvest gold
  goldSoft: "#F6E7C6",
  clay: "#AE4F35",       // clay red (sparing use)
  claySoft: "#F3E0D8",
};

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

/* ---------------------------------------------------------------------
   MOCK DATA
--------------------------------------------------------------------- */
const FARMER = {
  name: "Ramesh Kumar",
  location: "Nagpur, Maharashtra",
  phone: "+91 98765 43210",
  email: "ramesh.kumar@email.com",
  village: "At Post - Sawangi, Taluka - Hingna",
  bank: { name: "State Bank of India", account: "XXXX XXXX 5678", ifsc: "SBIN0012345" },
};

const PRODUCE = [
  { name: "Wheat", qty: 500, unit: "kg", price: 22, status: "Active", change: 4, color: "#C9932E", storage: "Keep below 12% moisture in jute bags on pallets." },
  { name: "Rice", qty: 400, unit: "kg", price: 32, status: "Active", change: 2, color: "#8B7355", storage: "Store dehusked paddy in a cool, dry, pest-free room." },
  { name: "Maize", qty: 600, unit: "kg", price: 19, status: "Active", change: 6, color: "#D9A441", storage: "Dry to 13-14% moisture before bagging for storage." },
  { name: "Soybean", qty: 300, unit: "kg", price: 45, status: "Active", change: -2, color: "#6B8E4E", storage: "Store in airtight bins away from direct sunlight." },
];

const STATS = { totalProduce: 1800, activeListings: 8, orders: 12, earnings: 45680 };

const ORDERS = [
  { id: "#ORD1234", buyer: "Fresh Mart", produce: "Wheat", qty: "100 kg", amount: "₹2,200", status: "Delivered" },
  { id: "#ORD1233", buyer: "Green Basket", produce: "Rice", qty: "200 kg", amount: "₹6,400", status: "Shipped" },
  { id: "#ORD1232", buyer: "Kisan Retailers", produce: "Maize", qty: "300 kg", amount: "₹5,700", status: "Confirmed" },
  { id: "#ORD1231", buyer: "Daily Needs Store", produce: "Soybean", qty: "50 kg", amount: "₹2,250", status: "Pending" },
  { id: "#ORD1230", buyer: "Fresh Mart", produce: "Wheat", qty: "150 kg", amount: "₹3,300", status: "Delivered" },
];

const BUYERS = [
  { name: "Fresh Mart", loc: "Mumbai, Maharashtra", deals: "Grains, Pulses", rating: 4.6, verified: true },
  { name: "Green Basket Pvt. Ltd.", loc: "Pune, Maharashtra", deals: "Grains, Oilseeds, Pulses", rating: 4.8, verified: true },
  { name: "Kisan Retailers", loc: "Nagpur, Maharashtra", deals: "Grains, Pulses", rating: 4.3, verified: true },
  { name: "Daily Needs Store", loc: "Bengaluru, Karnataka", deals: "Grains, Oilseeds", rating: 4.1, verified: false },
];

const MANDI_PRICES = [
  { market: "Azadpur Mandi, Delhi", min: 14, max: 20, avg: 17, change: 5 },
  { market: "Koyambedu, Chennai", min: 16, max: 22, avg: 19, change: 3 },
  { market: "Lasalgaon, Nashik", min: 15, max: 21, avg: 18, change: 2 },
  { market: "Pimpalgaon, Pune", min: 13, max: 18, avg: 15.5, change: -1 },
  { market: "Bangalore Mandi", min: 17, max: 23, avg: 20, change: 4 },
];

const TREND_DATA = [
  { date: "11 Apr", price: 14.5 }, { date: "15 Apr", price: 15.2 }, { date: "19 Apr", price: 16.8 },
  { date: "23 Apr", price: 17.9 }, { date: "27 Apr", price: 17.6 }, { date: "1 May", price: 18.4 },
  { date: "5 May", price: 19.1 }, { date: "9 May", price: 17.8 },
];

const TRANSACTIONS = [
  { date: "06 May 2025", id: "#ORD1234", buyer: "Fresh Mart", amount: "₹1,800", status: "Paid" },
  { date: "08 May 2025", id: "#ORD1233", buyer: "Green Basket", amount: "₹3,200", status: "Paid" },
  { date: "08 May 2025", id: "#ORD1232", buyer: "Kisan Retailers", amount: "₹4,500", status: "Pending" },
  { date: "05 May 2025", id: "#ORD1231", buyer: "Daily Needs Store", amount: "₹2,000", status: "Paid" },
  { date: "03 May 2025", id: "#ORD1230", buyer: "Fresh Mart", amount: "₹2,700", status: "Paid" },
];

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "produce", label: "My Produce", icon: Package },
  { id: "addProduce", label: "Add Produce", icon: PlusCircle },
  { id: "aiGrade", label: "AI Grade", icon: ScanLine },
  { id: "marketPrices", label: "Market Prices", icon: TrendingUp },
  { id: "marketTrends", label: "Market Trends", icon: LineChartIcon },
  { id: "findBuyers", label: "Find Buyers", icon: Users },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "payments", label: "Payments", icon: Wallet },
  { id: "profile", label: "Profile", icon: User },
];

// Every crop the app knows about — current listings plus forecasted ones,
// so a farmer can plan next season from the same list they sell from.
const ALL_CROPS = ["Wheat", "Rice", "Maize", "Soybean", "Chana (Chickpea)", "Mustard", "Groundnut"];

// Demand forecast — surfaced to farmers so they can plan their NEXT sowing
// around what buyers are expected to want, not just today's mandi price.
const DEMAND_FORECAST = [
  { crop: "Chana (Chickpea)", demand: "High demand", change: "+18%", window: "Rabi 2026", color: "#C9932E", reason: "Festive-season stocking and rising demand from dal processors." },
  { crop: "Mustard", demand: "High demand", change: "+14%", window: "Rabi 2026", color: "#D9A441", reason: "Edible-oil import curbs are pushing buyers toward local mustard." },
  { crop: "Groundnut", demand: "Rising demand", change: "+11%", window: "Kharif 2026", color: "#B98A4E", reason: "Oil mills are increasing forward bookings ahead of the season." },
  { crop: "Maize", demand: "Rising demand", change: "+9%", window: "Kharif 2026", color: "#E0A72E", reason: "Ethanol-blending mandates are steadily lifting industrial buying." },
  { crop: "Soybean", demand: "Steady demand", change: "+5%", window: "Kharif 2026", color: "#6B8E4E", reason: "Consistent poultry-feed demand keeps offtake resilient." },
];

/* ---------------------------------------------------------------------
   SMALL SHARED PIECES
--------------------------------------------------------------------- */
function StatusPill({ status }) {
  const map = {
    Delivered: { bg: T.primarySoft, fg: T.primary },
    Shipped: { bg: T.goldSoft, fg: "#8A6412" },
    Confirmed: { bg: "#DDEAF3", fg: "#265A78" },
    Pending: { bg: T.claySoft, fg: T.clay },
    Paid: { bg: T.primarySoft, fg: T.primary },
    Active: { bg: T.primarySoft, fg: T.primary },
  };
  const s = map[status] || { bg: "#EEE", fg: "#555" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.fg, fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fg }} />
      {status}
    </span>
  );
}

function DemandPill({ level }) {
  const map = {
    "High demand": { bg: T.primarySoft, fg: T.primary },
    "Rising demand": { bg: T.goldSoft, fg: "#8A6412" },
    "Steady demand": { bg: "#DDEAF3", fg: "#265A78" },
  };
  const s = map[level] || { bg: "#EEE", fg: "#555" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fg }} />
      {level}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: T.inkSoft, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent + "20" }}>
          <Icon size={16} color={accent} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>{value}</div>
        <div className="text-xs mt-1" style={{ color: T.inkSoft }}>{sub}</div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="text-xs font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: T.gold, fontFamily: "'IBM Plex Mono', monospace" }}>
          {eyebrow}
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>{title}</h1>
      {sub && <p className="text-sm mt-1.5" style={{ color: T.inkSoft }}>{sub}</p>}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block" style={{ color: T.ink }}>
        {label} {required && <span style={{ color: T.clay }}>*</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  border: `1px solid ${T.border}`,
  background: T.surface,
  color: T.ink,
  fontFamily: "'IBM Plex Sans', sans-serif",
};

/* ---------------------------------------------------------------------
   MANDI TICKER — signature element: a live grain-exchange ticker strip
--------------------------------------------------------------------- */
function MandiTicker() {
  const items = [...PRODUCE, ...MANDI_PRICES.slice(0, 3).map((m) => ({
    name: m.market.split(",")[0], price: m.avg, change: m.change, unit: "kg",
  }))];
  const strip = [...items, ...items];
  return (
    <div className="overflow-hidden relative" style={{ background: T.primaryDark }}>
      <div className="flex gap-8 py-2 px-4 ticker-track whitespace-nowrap">
        {strip.map((it, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <span className="text-xs font-semibold uppercase" style={{ color: T.goldSoft }}>{it.name}</span>
            <span className="text-xs" style={{ color: "#fff" }}>₹{it.price}/{it.unit || "kg"}</span>
            <span className="text-xs flex items-center" style={{ color: it.change >= 0 ? "#9FDA9F" : "#F0A98F" }}>
              {it.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(it.change)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        .ticker-track { width: max-content; animation: ticker-scroll 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ticker-track { animation: none; } }
        @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------------------------------
   DEMAND FORECAST MODAL — pops up with next-season crop demand,
   lets the farmer jump straight into listing one of them.
--------------------------------------------------------------------- */
function DemandForecastModal({ open, onClose, onPickCrop }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(30,42,30,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{ background: T.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 px-6 pt-6 pb-4" style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2.5" style={{ background: T.primarySoft }}>
                <Sparkles size={12} color={T.primary} />
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: T.primary, fontFamily: "'IBM Plex Mono', monospace" }}>
                  AI demand forecast
                </span>
              </div>
              <h2 className="text-xl font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>Crops in demand next season</h2>
              <p className="text-sm mt-1" style={{ color: T.inkSoft }}>
                Based on mandi trends and buyer procurement patterns — plan your next sowing around what's about to be wanted.
              </p>
            </div>
            <button onClick={onClose} className="shrink-0"><X size={18} color={T.inkSoft} /></button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {DEMAND_FORECAST.map((c) => (
            <div key={c.crop} className="rounded-xl p-4 flex items-start gap-3.5" style={{ border: `1px solid ${T.border}` }}>
              <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.color + "22" }}>
                <Wheat size={20} color={c.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold" style={{ color: T.ink }}>{c.crop}</span>
                  <DemandPill level={c.demand} />
                </div>
                <p className="text-xs mt-1" style={{ color: T.inkSoft }}>{c.reason}</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <span className="text-xs font-mono font-semibold" style={{ color: T.gold, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {c.change} expected · {c.window}
                  </span>
                  <button
                    onClick={() => onPickCrop(c.crop)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex items-center gap-1.5"
                    style={{ background: T.primary }}
                  >
                    <PlusCircle size={13} /> Add as next produce
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg text-sm font-semibold" style={{ border: `1px solid ${T.border}`, color: T.ink }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   AUTH PAGE
--------------------------------------------------------------------- */
function AuthPage({ onEnter }) {
  const [mode, setMode] = useState("register");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: T.bg }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden" style={{ background: T.primaryDark }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.gold }}>
              <Sprout size={18} color={T.primaryDark} />
            </div>
            <span className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>AgTech</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-6" style={{ background: "rgba(201,147,46,0.18)" }}>
            <Wheat size={13} color={T.gold} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: T.gold, fontFamily: "'IBM Plex Mono', monospace" }}>NO MIDDLEMEN. JUST MANDI-FRESH DEALS.</span>
          </div>
          <h1 className="text-5xl leading-[1.08] font-semibold text-white mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
            Sell smart.<br />Grow more.<br />Earn better.
          </h1>
          <p className="max-w-sm" style={{ color: "#C9D6C4" }}>
            List your harvest, get an instant AI quality grade, and connect straight with verified buyers — at the price your produce actually deserves.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: Users, t: "Direct access to buyers", d: "Sell straight to verified retailers, no agents." },
            { icon: ScanLine, t: "Instant AI grading", d: "Photograph your harvest, get a fair-price grade in seconds." },
            { icon: TrendingUp, t: "Live mandi trends", d: "Know today's price before you agree to one." },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
                <f.icon size={16} color={T.goldSoft} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{f.t}</div>
                <div className="text-xs mt-0.5" style={{ color: "#AAB9A4" }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
              <Sprout size={18} color="#fff" />
            </div>
            <span className="text-lg font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>AgTech</span>
          </div>

          <div className="flex rounded-xl p-1 mb-7" style={{ background: T.primarySoft }}>
            {["register", "login"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                style={{
                  background: mode === m ? T.surface : "transparent",
                  color: mode === m ? T.primary : T.inkSoft,
                  boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {m === "register" ? "Create account" : "Log in"}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold mb-1" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>
            {mode === "register" ? "Register as a farmer" : "Welcome back"}
          </h2>
          <p className="text-sm mb-6" style={{ color: T.inkSoft }}>
            {mode === "register" ? "Takes about two minutes." : "Log in to check today's prices and orders."}
          </p>

          {mode === "register" ? (
            <div className="space-y-4">
              <Field label="Full name" required>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.inkSoft} />
                  <input placeholder="Enter your full name" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
              </Field>
              <Field label="Mobile number" required>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.inkSoft} />
                  <input placeholder="10-digit mobile number" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
              </Field>
              <Field label="Password" required>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.inkSoft} />
                  <input type={showPw ? "text" : "password"} placeholder="Create a strong password" className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPw ? <EyeOff size={16} color={T.inkSoft} /> : <Eye size={16} color={T.inkSoft} />}
                  </button>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="State" required>
                  <select className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none" style={inputStyle}>
                    <option>Maharashtra</option><option>Karnataka</option><option>Punjab</option>
                  </select>
                </Field>
                <Field label="District" required>
                  <select className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none" style={inputStyle}>
                    <option>Nagpur</option><option>Pune</option><option>Nashik</option>
                  </select>
                </Field>
              </div>
              <label className="flex items-start gap-2 text-sm cursor-pointer" style={{ color: T.inkSoft }}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
                I agree to the <a className="underline" style={{ color: T.primary }}>Terms</a> and <a className="underline" style={{ color: T.primary }}>Privacy Policy</a>
              </label>
              <button
                onClick={onEnter}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: T.primary, fontFamily: "'IBM Plex Sans', sans-serif" }}
              >
                Create account <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Mobile number" required>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.inkSoft} />
                  <input placeholder="10-digit mobile number" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
              </Field>
              <Field label="Password" required>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.inkSoft} />
                  <input type={showPw ? "text" : "password"} placeholder="Enter your password" className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPw ? <EyeOff size={16} color={T.inkSoft} /> : <Eye size={16} color={T.inkSoft} />}
                  </button>
                </div>
              </Field>
              <button
                onClick={onEnter}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: T.primary }}
              >
                Log in <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   DASHBOARD
--------------------------------------------------------------------- */
function DashboardPage({ go, onOpenForecast }) {
  return (
    <div>
      <SectionHeading eyebrow="Kharif Season · 2026" title={`Welcome back, ${FARMER.name.split(" ")[0]} 👋`} sub={`${FARMER.location} · here's how your harvest is doing.`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total produce" value={`${STATS.totalProduce} kg`} sub="Across 5 listings" icon={Package} accent={T.primary} />
        <StatCard label="Active listings" value={STATS.activeListings} sub="Currently live" icon={Sprout} accent={T.gold} />
        <StatCard label="Orders" value={STATS.orders} sub="This month" icon={ShoppingCart} accent="#265A78" />
        <StatCard label="Earnings" value={`₹${STATS.earnings.toLocaleString("en-IN")}`} sub="This month" icon={Wallet} accent={T.clay} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>My produce</h3>
            <button onClick={() => go("produce")} className="text-xs font-semibold flex items-center gap-1" style={{ color: T.primary }}>
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRODUCE.map((p) => (
              <div key={p.name} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                <div className="h-16" style={{ background: p.color + "22" }} />
                <div className="p-2.5">
                  <div className="text-sm font-semibold" style={{ color: T.ink }}>{p.name}</div>
                  <div className="text-xs" style={{ color: T.inkSoft }}>{p.qty} {p.unit}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-mono font-semibold" style={{ color: T.gold, fontFamily: "'IBM Plex Mono', monospace" }}>₹{p.price}/kg</span>
                    <StatusPill status={p.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: T.primaryDark }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} color={T.gold} />
            <h3 className="font-semibold text-white text-sm">Today's tip</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: "#C9D6C4" }}>
            Wheat prices are up 4% at Azadpur Mandi this week — a good window to list your remaining 500 kg before the next harvest lands.
          </p>
          <button onClick={() => go("addProduce")} className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2" style={{ background: T.gold, color: T.primaryDark }}>
            <PlusCircle size={15} /> List this batch
          </button>
          <button onClick={onOpenForecast} className="w-full mt-2.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "rgba(255,255,255,0.08)", color: T.goldSoft }}>
            <Sparkles size={15} /> See in-demand crops for next season
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-5 mt-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>Recent orders</h3>
          <button onClick={() => go("orders")} className="text-xs font-semibold flex items-center gap-1" style={{ color: T.primary }}>
            View all <ChevronRight size={13} />
          </button>
        </div>
        <OrdersTable rows={ORDERS.slice(0, 3)} compact />
      </div>
    </div>
  );
}

function MyProducePage({ go }) {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeading eyebrow="Inventory" title="My produce" sub="Everything you currently have listed for buyers." />
        <button onClick={() => go("addProduce")} className="h-fit px-4 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center gap-2" style={{ background: T.primary }}>
          <PlusCircle size={15} /> Add produce
        </button>
      </div>

      <div className="rounded-xl p-3.5 mb-5 flex items-start gap-2.5" style={{ background: T.goldSoft }}>
        <Info size={16} className="mt-0.5 shrink-0" color="#8A6412" />
        <p className="text-xs" style={{ color: "#6B4E0E" }}>
          <span className="font-semibold">Storage tip: </span>
          once an order is confirmed, hold grain in a cool, dry space under 13% moisture, off the floor on pallets, in breathable jute or PP bags, until the buyer's pickup — this keeps quality (and your grade) intact.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRODUCE.map((p) => (
          <div key={p.name} title={p.storage} className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="h-24 flex items-center justify-center" style={{ background: p.color + "22" }}>
              <Wheat size={26} color={p.color} />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold" style={{ color: T.ink }}>{p.name}</span>
                <StatusPill status={p.status} />
              </div>
              <div className="text-xs mb-3" style={{ color: T.inkSoft }}>{p.qty} {p.unit} available</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-semibold" style={{ color: T.gold, fontFamily: "'IBM Plex Mono', monospace" }}>₹{p.price}/kg</span>
                <span className="text-xs flex items-center gap-0.5 font-semibold" style={{ color: p.change >= 0 ? T.primary : T.clay }}>
                  {p.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(p.change)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   ADD PRODUCE
--------------------------------------------------------------------- */
function AddProducePage({ go, prefillCrop, onClearPrefill }) {
  const [photos, setPhotos] = useState(0);
  return (
    <div className="max-w-3xl">
      <SectionHeading eyebrow="New listing" title="Add produce" sub="Give buyers the details they need to make a fair offer." />
      {prefillCrop && (
        <div className="rounded-lg p-3.5 mb-4 flex items-start justify-between gap-3" style={{ background: T.primarySoft }}>
          <div className="flex items-start gap-2 text-sm" style={{ color: T.primary }}>
            <Sparkles size={15} className="mt-0.5 shrink-0" />
            <span>Pre-filled from the demand forecast — buyers are expected to want more <strong>{prefillCrop}</strong> this season.</span>
          </div>
          <button onClick={onClearPrefill} className="shrink-0"><X size={15} color={T.primary} /></button>
        </div>
      )}
      <div className="rounded-2xl p-6 space-y-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Select produce" required>
            <select key={prefillCrop || "default"} defaultValue={prefillCrop || "Wheat"} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
              {ALL_CROPS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Variety (optional)">
            <input placeholder="e.g. Hybrid, Desi" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </Field>
          <Field label="Quantity" required>
            <div className="relative">
              <input placeholder="Enter quantity" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none pr-12" style={inputStyle} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: T.inkSoft }}>kg</span>
            </div>
          </Field>
          <Field label="Expected price" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.inkSoft }}>₹</span>
              <input placeholder="Price per kg" className="w-full pl-7 pr-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
          </Field>
          <Field label="Grade (optional)">
            <select className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
              <option>Not graded yet</option><option>Grade A</option><option>Grade B</option><option>Grade C</option>
            </select>
          </Field>
          <Field label="Harvest date" required>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.inkSoft} />
              <input type="date" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
          </Field>
        </div>
        <Field label="Description (optional)">
          <textarea rows={3} placeholder="Anything buyers should know — irrigation, storage, pesticide use…" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
        </Field>
        <Field label="Photos">
          <button
            onClick={() => setPhotos((p) => Math.min(p + 1, 5))}
            className="w-full rounded-xl py-8 flex flex-col items-center justify-center gap-2 border-2 border-dashed transition hover:bg-black/[0.02]"
            style={{ borderColor: T.border }}
          >
            <Upload size={20} color={T.inkSoft} />
            <span className="text-sm font-medium" style={{ color: T.ink }}>Click to upload or drag and drop</span>
            <span className="text-xs" style={{ color: T.inkSoft }}>PNG, JPG up to 5MB ({photos}/5 added)</span>
          </button>
        </Field>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={onClearPrefill} className="px-5 py-2.5 rounded-lg text-sm font-semibold" style={{ border: `1px solid ${T.border}`, color: T.ink }}>Cancel</button>
          <button onClick={() => { go("produce"); onClearPrefill && onClearPrefill(); }} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center gap-2" style={{ background: T.primary }}>
            <Check size={15} /> Publish listing
          </button>
          <button onClick={() => go("aiGrade")} className="ml-auto text-sm font-semibold flex items-center gap-1.5" style={{ color: T.gold }}>
            <ScanLine size={15} /> Get an AI grade first
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   AI GRADE — signature "stamped seal" result
--------------------------------------------------------------------- */
function AIGradePage() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await gradeWheatImage(file);
      setGrade({
        letter: result.grade,
        label: result.grade === "A" ? "Excellent" : result.grade === "B" ? "Good" : "Fair",
        confidence: 92,
        healthy: result.healthyGrains,
        damaged: result.damagedGrains,
        impurities: result.impurities,
        multiplier: result.priceMultiplier,
      });
      setScanned(true);
    } catch (err) {
      console.error("Grading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const insights = grade
    ? [
        `${grade.healthy} healthy grains detected`,
        `${grade.damaged} damaged grains found`,
        `${grade.impurities} impurities detected`,
        `Price multiplier: ${grade.multiplier}x`,
      ]
    : [];

  return (
    <div className="max-w-4xl">
      <SectionHeading eyebrow="Computer vision" title="AI produce grading" sub="Photograph a sample crate — get a defensible quality grade in seconds, no inspector needed." />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="text-sm font-semibold mb-3" style={{ color: T.ink }}>Upload produce image</div>
          <div className="rounded-xl h-64 flex items-center justify-center relative overflow-hidden" style={{ background: "#C9932E18", border: `1px solid ${T.border}` }}>
            <div className="grid grid-cols-8 gap-1.5 p-4">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="w-4 h-6 rounded-full" style={{ background: T.gold, opacity: 0.5 + (i % 5) * 0.1 }} />
              ))}
            </div>
            {scanned && (
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: T.gold, boxShadow: `0 0 12px ${T.gold}` }} />
            )}
          </div>
          <label className="w-full mt-4 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: T.primary }}>
            <Camera size={15} /> {loading ? "Grading..." : "Scan a sample"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={loading} />
          </label>
        </div>

        <div className="rounded-2xl p-6 flex flex-col items-center justify-center text-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {loading && <div className="text-sm" style={{ color: T.inkSoft }}>Analyzing image…</div>}
          {!loading && scanned && grade ? (
            <>
              <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[3px] border-dashed" style={{ borderColor: T.gold, transform: "rotate(-8deg)" }} />
                <div className="absolute inset-2 rounded-full flex flex-col items-center justify-center" style={{ background: T.primarySoft }}>
                  <span className="text-4xl font-bold" style={{ color: T.primary, fontFamily: "'Fraunces', serif" }}>{grade.letter}</span>
                  <span className="text-[9px] font-semibold tracking-widest" style={{ color: T.primary, fontFamily: "'IBM Plex Mono', monospace" }}>AI VERIFIED</span>
                </div>
              </div>
              <div className="text-lg font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>{grade.label}</div>
              <div className="text-xs mb-5" style={{ color: T.inkSoft }}>Confidence score: {grade.confidence}%</div>
              <div className="w-full text-left space-y-2 mb-2">
                {insights.map((ins, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0" color={T.primary} />
                    <span style={{ color: T.ink }}>{ins}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            !loading && <div className="text-sm" style={{ color: T.inkSoft }}>Upload a photo to see your grade.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   MARKET PRICES
--------------------------------------------------------------------- */
function MarketPricesPage() {
  return (
    <div>
      <SectionHeading eyebrow="Live · updated 06:00 AM" title="Market prices" sub="Daily prices from major mandis, so you never quote blind." />
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
          {ALL_CROPS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
          <option>Grade A</option><option>Grade B</option><option>Grade C</option>
        </select>
        <div className="ml-auto flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg" style={{ background: T.primarySoft, color: T.primary, fontFamily: "'IBM Plex Mono', monospace" }}>
          <Calendar size={13} /> 10 May 2026
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: T.bg }}>
              {["Market", "Min price (₹/kg)", "Max price (₹/kg)", "Avg price (₹/kg)", "Change"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: T.inkSoft }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MANDI_PRICES.map((m, i) => (
              <tr key={m.market} style={{ borderTop: `1px solid ${T.border}` }}>
                <td className="px-5 py-3.5 font-medium flex items-center gap-2" style={{ color: T.ink }}>
                  <MapPin size={13} color={T.inkSoft} /> {m.market}
                </td>
                <td className="px-5 py-3.5 font-mono" style={{ color: T.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{m.min}</td>
                <td className="px-5 py-3.5 font-mono" style={{ color: T.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{m.max}</td>
                <td className="px-5 py-3.5 font-mono font-semibold" style={{ color: T.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{m.avg}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: m.change >= 0 ? T.primary : T.clay }}>
                    {m.change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {Math.abs(m.change)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: T.inkSoft }}>
        <Info size={13} /> Prices are aggregated from major APMC mandis and refresh every morning.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------
   MARKET TRENDS
--------------------------------------------------------------------- */
function MarketTrendsPage() {
  const [range, setRange] = useState("30D");
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    getMarketPrices({ commodityName: "Wheat" })
      .then((data) => setPrices(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <SectionHeading eyebrow="Trend analysis" title="Market trends" sub="Track how wheat prices have moved, so you know when to sell." />
      <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="text-sm font-semibold mb-3" style={{ color: T.ink }}>Live CEDA API response (raw)</div>
        {loading && <p style={{ color: T.inkSoft }}>Loading real data from CEDA...</p>}
        {error && <p style={{ color: T.clay }}>Error: {error}</p>}
        {!loading && !error && (
          <pre className="text-xs overflow-auto p-3 rounded-lg" style={{ background: T.bg, color: T.ink, maxHeight: 400 }}>
            {JSON.stringify(prices, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   FIND BUYERS
--------------------------------------------------------------------- */
function FindBuyersPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => BUYERS.filter((b) => b.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  return (
    <div>
      <SectionHeading eyebrow="Verified network" title="Find buyers" sub="Connect directly with retailers who've been verified by AgTech." />
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.inkSoft} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search buyers by name or company" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>
        <button className="px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ border: `1px solid ${T.border}`, color: T.ink }}>
          <Filter size={14} /> Filters
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((b) => (
          <div key={b.name} className="rounded-2xl p-5 flex items-start gap-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-semibold" style={{ background: T.primarySoft, color: T.primary, fontFamily: "'Fraunces', serif" }}>
              {b.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold truncate" style={{ color: T.ink }}>{b.name}</span>
                {b.verified && <BadgeCheck size={14} color={T.primary} />}
              </div>
              <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: T.inkSoft }}>
                <MapPin size={11} /> {b.loc}
              </div>
              <div className="text-xs mt-1.5" style={{ color: T.inkSoft }}>{b.deals}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: T.gold }}>
                  <Star size={12} fill={T.gold} strokeWidth={0} /> {b.rating}
                </span>
                <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: T.primary }}>Connect</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   ORDERS
--------------------------------------------------------------------- */
function OrdersTable({ rows, compact }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: compact ? "transparent" : T.bg }}>
            {["Order ID", "Buyer", "Produce", "Quantity", "Amount", "Status"].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wide" style={{ color: T.inkSoft }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} style={{ borderTop: `1px solid ${T.border}` }}>
              <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: T.primary, fontFamily: "'IBM Plex Mono', monospace" }}>{o.id}</td>
              <td className="px-4 py-3" style={{ color: T.ink }}>{o.buyer}</td>
              <td className="px-4 py-3" style={{ color: T.ink }}>{o.produce}</td>
              <td className="px-4 py-3" style={{ color: T.inkSoft }}>{o.qty}</td>
              <td className="px-4 py-3 font-mono font-semibold" style={{ color: T.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{o.amount}</td>
              <td className="px-4 py-3"><StatusPill status={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersPage() {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
  const rows = tab === "All" ? ORDERS : ORDERS.filter((o) => o.status === tab);
  return (
    <div>
      <SectionHeading eyebrow="Fulfilment" title="Orders" sub="Manage and track every order from your buyers." />
      <div className="flex gap-1.5 mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition"
            style={{ background: tab === t ? T.primary : T.surface, color: tab === t ? "#fff" : T.inkSoft, border: `1px solid ${tab === t ? T.primary : T.border}` }}>
            {t}
          </button>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {rows.length ? <OrdersTable rows={rows} /> : (
          <div className="py-12 text-center text-sm" style={{ color: T.inkSoft }}>No orders in this stage yet.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   PAYMENTS
--------------------------------------------------------------------- */
function PaymentsPage() {
  return (
    <div>
      <SectionHeading eyebrow="Ledger" title="Payments" sub="Track your earnings and every transaction with buyers." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total earnings" value="₹45,680" sub="This month" icon={Wallet} accent={T.primary} />
        <StatCard label="Paid amount" value="₹38,200" sub="This month" icon={Check} accent="#265A78" />
        <StatCard label="Pending amount" value="₹7,480" sub="This month" icon={Calendar} accent={T.gold} />
      </div>
      <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>Recent transactions</h3>
          <button className="text-xs font-semibold flex items-center gap-1" style={{ color: T.primary }}>View all <ChevronRight size={13} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Date", "Order ID", "Buyer", "Amount", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wide" style={{ color: T.inkSoft }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td className="px-4 py-3 text-xs" style={{ color: T.inkSoft }}>{t.date}</td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: T.primary, fontFamily: "'IBM Plex Mono', monospace" }}>{t.id}</td>
                  <td className="px-4 py-3" style={{ color: T.ink }}>{t.buyer}</td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: T.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{t.amount}</td>
                  <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   PROFILE
--------------------------------------------------------------------- */
function ProfilePage() {
  return (
    <div className="max-w-2xl">
      <SectionHeading eyebrow="Account" title="Profile" sub="Manage your personal and payout information." />
      <div className="rounded-2xl p-6 mb-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-xl" style={{ background: T.primarySoft, color: T.primary, fontFamily: "'Fraunces', serif" }}>
              {FARMER.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="font-semibold text-lg" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>{FARMER.name}</div>
              <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: T.inkSoft }}><Phone size={11} /> {FARMER.phone}</div>
              <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: T.inkSoft }}><Mail size={11} /> {FARMER.email}</div>
            </div>
          </div>
          <button className="text-xs font-semibold" style={{ color: T.primary }}>Edit</button>
        </div>
        <div className="rounded-xl p-4" style={{ background: T.bg }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: T.inkSoft }}>Address</div>
          <div className="text-sm" style={{ color: T.ink }}>{FARMER.village}, {FARMER.location.split(",")[0]}, {FARMER.location} - 441110</div>
        </div>
      </div>

      <div className="rounded-2xl p-6 mb-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>Bank details</h3>
          <button className="text-xs font-semibold" style={{ color: T.primary }}>Edit</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div><div className="text-xs mb-1" style={{ color: T.inkSoft }}>Bank name</div><div style={{ color: T.ink }}>{FARMER.bank.name}</div></div>
          <div><div className="text-xs mb-1" style={{ color: T.inkSoft }}>Account number</div><div className="font-mono" style={{ color: T.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{FARMER.bank.account}</div></div>
          <div><div className="text-xs mb-1" style={{ color: T.inkSoft }}>IFSC code</div><div className="font-mono" style={{ color: T.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{FARMER.bank.ifsc}</div></div>
        </div>
      </div>

      <button className="flex items-center gap-2 text-sm font-semibold" style={{ color: T.clay }}>
        <LogOut size={15} /> Log out
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------
   LAYOUT
--------------------------------------------------------------------- */
function Sidebar({ page, setPage, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-screen lg:h-auto lg:self-stretch w-64 shrink-0 flex flex-col transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: T.primaryDark }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.gold }}>
              <Sprout size={16} color={T.primaryDark} />
            </div>
            <span className="font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>AgTech</span>
          </div>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X size={18} color="#fff" /></button>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition"
                style={{
                  background: active ? "rgba(201,147,46,0.16)" : "transparent",
                  color: active ? T.gold : "#C9D6C4",
                }}
              >
                <item.icon size={17} />
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: T.gold }} />}
              </button>
            );
          })}
        </nav>
        <div className="p-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: "#C9D6C4" }}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ setMobileOpen, page, onOpenForecast }) {
  const current = NAV.find((n) => n.id === page);
  return (
    <div>
      <div className="flex items-center gap-3 px-4 md:px-8 py-4" style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} color={T.ink} /></button>
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: T.inkSoft }}>
          <MapPin size={12} /> Maharashtra, India
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={onOpenForecast}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: T.goldSoft, color: "#8A6412" }}
          >
            <Sparkles size={13} /> Demand forecast
          </button>
          <button className="relative"><Bell size={18} color={T.inkSoft} /><span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: T.clay }} /></button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: T.primarySoft, color: T.primary }}>RK</div>
            <ChevronDown size={14} color={T.inkSoft} />
          </div>
        </div>
      </div>
      <MandiTicker />
    </div>
  );
}

/* ---------------------------------------------------------------------
   APP ROOT
--------------------------------------------------------------------- */
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [prefillCrop, setPrefillCrop] = useState(null);

  const handlePickCrop = (crop) => {
    setPrefillCrop(crop);
    setDemandModalOpen(false);
    setPage("addProduce");
  };

  const pages = {
    dashboard: <DashboardPage go={setPage} onOpenForecast={() => setDemandModalOpen(true)} />,
    produce: <MyProducePage go={setPage} />,
    addProduce: <AddProducePage go={setPage} prefillCrop={prefillCrop} onClearPrefill={() => setPrefillCrop(null)} />,
    aiGrade: <AIGradePage />,
    marketPrices: <MarketPricesPage />,
    marketTrends: <MarketTrendsPage />,
    findBuyers: <FindBuyersPage />,
    orders: <OrdersPage />,
    payments: <PaymentsPage />,
    profile: <ProfilePage />,
  };

  if (!authed) {
    return (
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <AuthPage onEnter={() => { setAuthed(true); setDemandModalOpen(true); }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: T.bg, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar setMobileOpen={setMobileOpen} page={page} onOpenForecast={() => setDemandModalOpen(true)} />
        <main className="flex-1 p-4 md:p-8">{pages[page]}</main>
      </div>
      <DemandForecastModal open={demandModalOpen} onClose={() => setDemandModalOpen(false)} onPickCrop={handlePickCrop} />
    </div>
  );
}
