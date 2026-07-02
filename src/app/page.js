"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { CURRENCIES, convertCurrency, getCurrencySymbol } from "@/lib/currencies";
import {
  Shield,
  Globe,
  CreditCard,
  TrendingUp,
  ArrowRight,
  ArrowLeftRight,
  Menu,
  X,
  MessageCircle,
  Mail,
  Link2,
  ChevronRight,
  ChevronDown,
  Zap,
  Lock,
  BarChart3,
  UserPlus,
  ShieldCheck,
  Wallet,
  Send,
  Star,
  BadgeCheck,
  KeyRound,
  Award,
  Activity,
  Quote,
  HelpCircle,
  Handshake,
  Smartphone,
  Gift,
  Users,
  CheckCircle2,
  PhoneCall,
  Fingerprint,
} from "lucide-react";

/* ──────────────────────── animated counter hook ──────────────────────── */
function useCounter(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [end, duration, startOnView]);

  return { count, ref };
}

/* ──────────────────────── stat card ──────────────────────── */
function StatCard({ value, suffix, label }) {
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const prefix = value.replace(/[0-9.]/g, "").replace(suffix || "", "");
  const { count, ref } = useCounter(numericValue, 2200);

  const displayValue =
    numericValue >= 100
      ? prefix + count.toLocaleString()
      : prefix + (count / 100).toFixed(2);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-bold gradient-text">
        {numericValue < 100
          ? prefix + (count === 0 ? "0" : (count / (100 / numericValue)).toFixed(2))
          : prefix + count.toLocaleString()}
        {suffix && <span>{suffix}</span>}
      </p>
      <p className="mt-2 text-slate-400 text-sm md:text-base">{label}</p>
    </div>
  );
}

/* ──────────────────────── features data ──────────────────────── */
const features = [
  {
    icon: Globe,
    title: "Multi-Currency Transfers",
    description:
      "Send and receive money in 50+ currencies with real-time exchange rates and zero hidden fees.",
  },
  {
    icon: Shield,
    title: "Military-Grade Security",
    description:
      "AES-256 encryption, biometric authentication, and real-time fraud monitoring protect every transaction.",
  },
  {
    icon: CreditCard,
    title: "Smart Cards",
    description:
      "Virtual and physical cards with dynamic spending controls, instant freeze, and smart rewards.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description:
      "AI-powered insights, cashflow forecasting, and interactive dashboards to manage your wealth.",
  },
];

/* ──────────────────────── stats data ──────────────────────── */
const stats = [
  { value: "$2400", suffix: "M+", label: "Transactions Processed" },
  { value: "150", suffix: "+", label: "Countries Served" },
  { value: "9999", suffix: "%", label: "Platform Uptime" },
  { value: "500000", suffix: "+", label: "Active Users" },
];

/* ──────────────────────── nav links ──────────────────────── */
// `id` → smooth-scroll anchor on the landing page; `href` → full page navigation
const navLinks = [
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Rates", id: "rates" },
  { label: "Security", id: "security" },
  { label: "About", id: "about" },
  { label: "Contact", href: "/contact" },
];

/* ──────────────────────── how it works data ──────────────────────── */
const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in under 3 minutes with just your name, email, and country — no paperwork, no branch visits.",
  },
  {
    icon: ShieldCheck,
    title: "Verify Your Identity",
    description:
      "A one-time code is emailed to you on every login, so your account stays protected from the very first sign-in.",
  },
  {
    icon: Wallet,
    title: "Fund Your Account",
    description:
      "Add money in your local currency — Interzenex Microfinance supports 140+ currencies across 190+ countries out of the box.",
  },
  {
    icon: Send,
    title: "Send Anywhere",
    description:
      "Transfer funds globally in seconds with transparent, real-time conversion rates and no hidden fees.",
  },
];

/* ──────────────────────── security features data ──────────────────────── */
const securityFeatures = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description: "Every transaction and stored credential is encrypted end-to-end, in transit and at rest.",
  },
  {
    icon: ShieldCheck,
    title: "Email OTP Verification",
    description: "A fresh one-time passcode is required on every login attempt before access is granted.",
  },
  {
    icon: Activity,
    title: "Real-Time Fraud Monitoring",
    description: "Every transfer is screened instantly against unusual activity and spending patterns.",
  },
  {
    icon: KeyRound,
    title: "Approval Code Verification",
    description: "Once you reach your daily transfer count, an Approval Code is required before further transfers can complete.",
  },
  {
    icon: BadgeCheck,
    title: "FDIC Insured",
    description: "Deposits are protected up to $250,000 per depositor, per ownership category.",
  },
  {
    icon: Award,
    title: "SOC 2 Type II Certified",
    description: "Independently audited security, availability, and confidentiality controls.",
  },
];

/* ──────────────────────── testimonials data ──────────────────────── */
const testimonials = [
  {
    quote:
      "Interzenex Microfinance made it possible for my agency to pay contractors in twelve countries without the usual wire delays or surprise fees.",
    name: "Amara Okafor",
    role: "Agency Owner, Lagos",
    avatar:
      "https://images.unsplash.com/photo-1611432579402-7037e3e2c1e4?fm=jpg&q=80&w=256&auto=format&fit=crop",
  },
  {
    quote:
      "Switching from my old bank saved me hundreds of dollars a month in international transfer fees alone.",
    name: "Daniel Kowalski",
    role: "Freelance Consultant, Toronto",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?fm=jpg&q=80&w=256&auto=format&fit=crop",
  },
  {
    quote:
      "The OTP login and Approval Code verification give me real peace of mind — it actually feels like a bank that takes security seriously.",
    name: "Priya Ramesh",
    role: "Product Manager, Singapore",
    avatar:
      "https://images.unsplash.com/photo-1573496527892-904f897eb744?fm=jpg&q=80&w=256&auto=format&fit=crop",
  },
];

/* ──────────────────────── mobile banking highlights ──────────────────────── */
const mobileBankingPoints = [
  "Biometric face & fingerprint login on every device",
  "Instant push notifications for every transaction",
  "One-tap transfers to saved recipients",
  "Freeze or unfreeze your card in seconds",
];

/* ──────────────────────── faq data ──────────────────────── */
const faqs = [
  {
    question: "Is my money safe with Interzenex Microfinance?",
    answer:
      "Yes. Deposits are FDIC insured up to $250,000, all data is protected with AES-256 encryption, and every login requires a one-time email passcode in addition to your password.",
  },
  {
    question: "Which countries and currencies do you support?",
    answer:
      "Interzenex Microfinance supports accounts and transfers across 190+ countries and 140+ world currencies, with your base currency automatically suggested from the country you select at signup.",
  },
  {
    question: "What is an Approval Code and when do I need one?",
    answer:
      "An Approval Code is a secure verification code assigned to your account by your bank admin. Once you reach your daily transfer count limit, you'll be asked to enter it to authorise any additional transfers for that day.",
  },
  {
    question: "Are there any monthly fees?",
    answer:
      "No. There are no monthly maintenance fees and no minimum balance requirements. Currency conversion uses transparent, real-time rates with no hidden markups.",
  },
  {
    question: "How long do international transfers take?",
    answer:
      "Transfers between Interzenex Microfinance accounts complete instantly. Transfers to external banks are typically processed within the same business day.",
  },
];

/* ──────────────────────── main component ──────────────────────── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      {/* ─── background ambient glow ─── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-apex-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* ───────────────── NAVBAR ───────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-apex-500/25 group-hover:shadow-apex-500/40 transition-shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Interzenex</span>
            </Link>

            {/* desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.id ?? link.href}
                  href={link.href ?? `#${link.id}`}
                  className="text-sm text-slate-300 hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-gradient-to-r after:from-apex-500 after:to-emerald-500 after:transition-all after:duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-lg hover:shadow-lg hover:shadow-apex-500/25 transition-all btn-shine"
              >
                Get Started
              </Link>
            </div>

            {/* mobile toggle */}
            <button
              className="md:hidden p-2 text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/5 animate-fade-in">
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.id ?? link.href}
                  href={link.href ?? `#${link.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-300 hover:text-white py-2 text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white/10" />
              <Link href="/login" className="text-slate-300 hover:text-white py-2 text-sm">
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-center text-sm font-medium text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative z-10 pt-32 md:pt-44 pb-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* text */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-xs text-slate-300 mb-6">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SOC 2 Type II Certified — Bank-level security</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
              Banking{" "}
              <span className="gradient-text">Without</span>
              <br />
              Boundaries
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Multi-currency accounts, instant global transfers, and AI-powered
              financial insights — all in one premium digital banking platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl shadow-xl shadow-apex-500/20 hover:shadow-apex-500/40 transition-all btn-shine"
              >
                Open Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-slate-300 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
              >
                Explore Features
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                FDIC Insured
              </span>
              <span>•</span>
              <span>No Monthly Fees</span>
              <span>•</span>
              <span>24/7 Support</span>
            </div>
          </div>

          {/* floating graphic */}
          <div className="flex-1 relative flex items-center justify-center animate-slide-up">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96">
              {/* main orb */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-apex-500/30 to-emerald-500/20 blur-xl animate-pulse-soft" />
              <div className="absolute inset-12 rounded-full bg-gradient-to-tr from-apex-600/40 to-emerald-400/30 animate-float" />
              {/* rings */}
              <div className="absolute inset-0 rounded-full border border-apex-500/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-emerald-500/10 animate-[spin_25s_linear_infinite_reverse]" />
              <div className="absolute inset-10 rounded-full border border-apex-400/15 animate-[spin_30s_linear_infinite]" />
              {/* floating cards */}
              <div className="absolute top-6 right-4 glass rounded-xl px-4 py-3 animate-float shadow-xl shadow-black/20">
                <p className="text-[10px] text-slate-400">Transfer Sent</p>
                <p className="text-sm font-bold text-emerald-400">+$12,450.00</p>
              </div>
              <div className="absolute bottom-10 left-0 glass rounded-xl px-4 py-3 animate-float [animation-delay:1s] shadow-xl shadow-black/20">
                <p className="text-[10px] text-slate-400">Portfolio</p>
                <p className="text-sm font-bold text-apex-400">↗ 24.8%</p>
              </div>
              <div className="absolute bottom-4 right-8 glass rounded-xl px-4 py-3 animate-float [animation-delay:0.5s] shadow-xl shadow-black/20">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-apex-400" />
                  <span className="text-xs text-slate-300">Analytics</span>
                </div>
              </div>
              {/* center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-apex-500/30">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── PROMO BANNER ───────────────── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-apex-500/20 animate-fade-in">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="hidden sm:flex w-11 h-11 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-apex-400" />
              </div>
              <p className="text-sm sm:text-base text-slate-200">
                <span className="font-semibold text-white">Limited time:</span>{" "}
                Get a{" "}
                <span className="gradient-text font-bold">$50 welcome bonus</span>{" "}
                when you open and fund a new account this month.
              </p>
            </div>
            <Link
              href="/register"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-lg hover:shadow-lg hover:shadow-apex-500/25 transition-all btn-shine whitespace-nowrap"
            >
              Claim Offer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────── HUMAN TOUCH ───────────────── */}
      <section className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* image */}
          <div className="flex-1 w-full animate-slide-up">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
              <img
                src="https://images.unsplash.com/photo-1686771416282-3888ddaf249b?fm=jpg&q=80&w=1200&auto=format&fit=crop"
                alt="Interzenex Microfinance relationship manager meeting with a customer in a branch office"
                className="w-full h-[320px] sm:h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/0 to-slate-950/0" />
              <div className="absolute bottom-5 left-5 right-5 glass rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20 shrink-0">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Real people, real support</p>
                  <p className="text-[11px] text-slate-400">Average response time under 2 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* text */}
          <div className="flex-1 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              Human Support
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Banking With a{" "}
              <span className="gradient-text">Human Touch</span>
            </h2>
            <p className="mt-6 text-slate-400 leading-relaxed">
              Behind every account is a real relationship manager, not just a
              chatbot. Whether you&apos;re opening your first account or
              structuring a cross-border payroll run, our team is available
              around the clock to help — by phone, live chat, or email.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Dedicated relationship managers" },
                { icon: PhoneCall, label: "24/7 live phone & chat support" },
                { icon: Handshake, label: "In-branch appointments available" },
                { icon: Fingerprint, label: "Verified, background-checked staff" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-apex-500/10 border border-apex-500/20 shrink-0">
                      <Icon className="w-4 h-4 text-apex-400" />
                    </div>
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section id="features" className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Everything You Need to{" "}
              <span className="gradient-text">Manage Money</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed for the modern global citizen. From instant
              transfers to intelligent analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="glass card-hover rounded-2xl p-6 md:p-8 group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center mb-5 group-hover:from-apex-500/30 group-hover:to-emerald-500/30 transition-colors">
                    <Icon className="w-6 h-6 text-apex-400 group-hover:text-apex-300 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-100">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-apex-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how-it-works" className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Banking in{" "}
              <span className="gradient-text">Four Simple Steps</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              From sign-up to your first global transfer, Interzenex Microfinance keeps
              every step fast, transparent, and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative glass card-hover rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-apex-400" />
                    </div>
                    <span className="text-3xl font-bold text-slate-700/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-100">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── MOBILE BANKING SPOTLIGHT ───────────────── */}
      <section className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          {/* text */}
          <div className="flex-1 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              Mobile Banking
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Your Whole Bank,{" "}
              <span className="gradient-text">In Your Pocket</span>
            </h2>
            <p className="mt-6 text-slate-400 leading-relaxed">
              Check balances, move money, and manage your cards from anywhere —
              the Interzenex Microfinance experience is built mobile-first, so a
              full banking session takes seconds, not minutes.
            </p>
            <ul className="mt-8 space-y-3">
              {mobileBankingPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">{point}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all btn-shine"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* image */}
          <div className="flex-1 w-full animate-slide-up">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
              <img
                src="https://images.unsplash.com/photo-1758519291442-6a34815b0ae3?fm=jpg&q=80&w=1200&auto=format&fit=crop"
                alt="Customer smiling while paying with a card and mobile banking app"
                className="w-full h-[320px] sm:h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/0 to-slate-950/0" />
              <div className="absolute top-5 right-5 glass rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg shadow-black/20">
                <Smartphone className="w-4 h-4 text-apex-400" />
                <span className="text-xs font-medium text-slate-200">4.9★ App Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── RATES / CURRENCY CALCULATOR ───────────────── */}
      <section id="rates" className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              Rates
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              140+ Currencies.{" "}
              <span className="gradient-text">One Transparent Rate.</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Get an instant sense of what your money is worth abroad — no
              account required.
            </p>
          </div>

          <CurrencyCalculator />
        </div>
      </section>

      {/* ───────────────── SECURITY ───────────────── */}
      <section id="security" className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              Security
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Protected by{" "}
              <span className="gradient-text">Design, Not Afterthought</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Every layer of Interzenex Microfinance — from login to transfer — is built
              around keeping your money and identity safe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass card-hover rounded-2xl p-6 md:p-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-apex-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-100">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── STATS ───────────────── */}
      <section id="results" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto glass rounded-3xl p-10 md:p-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {/* $2.4B+ */}
            <StatItem end={2.4} prefix="$" suffix="B+" label="Transactions Processed" decimals={1} />
            <StatItem end={150} prefix="" suffix="+" label="Countries Served" />
            <StatItem end={99.99} prefix="" suffix="%" label="Platform Uptime" decimals={2} />
            <StatItem end={500} prefix="" suffix="K+" label="Active Users" />
          </div>
        </div>
      </section>

      {/* ───────────────── TESTIMONIALS ───────────────── */}
      <section className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Trusted by{" "}
              <span className="gradient-text">Global Citizens</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass card-hover rounded-2xl p-6 md:p-8 flex flex-col">
                <Quote className="w-6 h-6 text-apex-400/60 mb-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-apex-500/20"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── ABOUT ───────────────── */}
      <section id="about" className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              About Interzenex Microfinance
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Built for a World{" "}
              <span className="gradient-text">Without Borders</span>
            </h2>
            <p className="mt-6 text-slate-400 leading-relaxed">
              Interzenex Microfinance was founded on a simple idea: money shouldn&apos;t
              stop at a border. We built a digital bank from the ground up
              for people who live, work, and earn across multiple countries
              and currencies — without the delays and fees traditional banks
              tack on.
            </p>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Today, Interzenex Microfinance serves customers across 190+ countries with
              support for 140+ world currencies, backed by bank-level
              security and a team obsessed with making global money
              movement feel instant.
            </p>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40 animate-slide-up">
              <img
                src="https://images.unsplash.com/photo-1758873269276-9518d0cb4a0b?fm=jpg&q=80&w=1200&auto=format&fit=crop"
                alt="Diverse Interzenex Microfinance team collaborating in the office"
                className="w-full h-[220px] sm:h-[260px] object-cover"
                loading="lazy"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Founded", value: "2016" },
                { label: "Headquarters", value: "New York, NY" },
                { label: "Customers", value: "500K+" },
                { label: "Countries", value: "190+" },
              ].map((fact) => (
                <div key={fact.label} className="glass rounded-2xl p-6 text-center">
                  <p className="text-2xl font-bold gradient-text">{fact.value}</p>
                  <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ ───────────────── */}
      <section id="faq" className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-sm font-medium text-apex-400 tracking-widest uppercase mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.question} question={f.question} answer={f.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA ───────────────── */}
      <section className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl">
          {/* gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-apex-600 via-apex-500 to-emerald-500 opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent)]" />

          <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Ready to Elevate Your Finances?
            </h2>
            <p className="mt-4 text-white/80 max-w-lg mx-auto text-sm sm:text-base">
              Join 500,000+ users who trust Interzenex Microfinance for borderless, secure,
              and intelligent banking.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 px-10 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-xl shadow-black/20 group"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">Interzenex</span>
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Modern digital banking for the global citizen. Secure, fast, and
                intelligent.
              </p>
            </div>

            {/* links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><a href="/features" className="hover:text-slate-300 transition-colors">Features</a></li>
                <li><a href="/security" className="hover:text-slate-300 transition-colors">Security</a></li>
                <li><a href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</a></li>
                <li><a href="/api-page" className="hover:text-slate-300 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><a href="/about" className="hover:text-slate-300 transition-colors">About</a></li>
                <li><a href="/careers" className="hover:text-slate-300 transition-colors">Careers</a></li>
                <li><a href="/blog" className="hover:text-slate-300 transition-colors">Blog</a></li>
                <li><a href="/press" className="hover:text-slate-300 transition-colors">Press</a></li>
                <li><a href="/contact" className="hover:text-slate-300 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-slate-300 transition-colors">Cookie Policy</a></li>
                <li><a href="/licenses" className="hover:text-slate-300 transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} interzenexmicrofinance.online. All rights reserved. FDIC
              Insured.
            </p>
            <div className="flex items-center gap-4">
              <a href="/contact" className="text-slate-600 hover:text-slate-300 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="/blog" className="text-slate-600 hover:text-slate-300 transition-colors">
                <Link2 className="w-4 h-4" />
              </a>
              <a href="mailto:support@interzenexmicrofinance.online" className="text-slate-600 hover:text-slate-300 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── stat item with intersection-driven counter ─── */
function StatItem({ end, prefix = "", suffix = "", label, decimals = 0 }) {
  const [display, setDisplay] = useState(decimals > 0 ? `${prefix}0` : `${prefix}0`);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2200;
          const startTime = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = eased * end;
            setDisplay(
              prefix + val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            );
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [end, prefix, decimals]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
        {display}
        <span>{suffix}</span>
      </p>
      <p className="mt-2 text-slate-400 text-xs sm:text-sm">{label}</p>
    </div>
  );
}

/* ─── interactive currency calculator ─── */
function CurrencyCalculator() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  const result = useMemo(() => {
    const numeric = parseFloat(amount);
    if (!numeric || numeric < 0) return 0;
    return convertCurrency(numeric, from, to);
  }, [amount, from, to]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 animate-slide-up">
      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
        {/* from */}
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
            You send
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all"
            />
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-800">
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* swap */}
        <button
          onClick={swap}
          className="self-center md:self-end md:mb-1 flex items-center justify-center w-10 h-10 rounded-full bg-apex-500/10 border border-apex-500/20 text-apex-400 hover:bg-apex-500/20 transition-colors shrink-0"
          aria-label="Swap currencies"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* to */}
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
            Recipient gets
          </label>
          <div className="flex gap-2">
            <div className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-lg font-semibold text-emerald-400 truncate">
              {getCurrencySymbol(to)}
              {result.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </div>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-800">
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Indicative rate · 1 {from} ≈{" "}
        {convertCurrency(1, from, to).toLocaleString("en-US", { maximumFractionDigits: 4 })}{" "}
        {to} · Live rates apply at transfer time.
      </p>
    </div>
  );
}

/* ─── collapsible FAQ row ─── */
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="flex items-center gap-3 text-sm sm:text-base font-medium text-slate-100">
          <HelpCircle className="w-4 h-4 text-apex-400 shrink-0" />
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 -mt-1 animate-fade-in">
          <p className="text-sm text-slate-400 leading-relaxed pl-7">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
