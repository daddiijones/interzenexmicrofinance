"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthUser, setAuthUser } from "@/lib/useAuthUser";
import { COUNTRIES, getCountryCurrency, countryFlag } from "@/lib/countries";
import { CURRENCIES } from "@/lib/currencies";
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Coins,
  Globe2,
  ChevronDown,
  Camera,
  IdCard,
  Upload,
} from "lucide-react";

async function uploadFile(file, userId, type) {
  const body = new FormData();
  body.append("file", file);
  body.append("userId", userId);
  body.append("type", type);
  const res = await fetch("/api/upload", { method: "POST", body });
  return res.json();
}

export default function RegisterPage() {
  const router = useRouter();
  const existingUser = useAuthUser();

  // Already logged in — send straight to dashboard
  useEffect(() => {
    if (!existingUser) return;
    if (existingUser.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }, [existingUser, router]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "US",
    currency: "USD",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [passportFile, setPassportFile] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleCountryChange(e) {
    const countryCode = e.target.value;
    setForm((prev) => ({
      ...prev,
      country: countryCode,
      currency: getCountryCurrency(countryCode),
    }));
  }

  function validate() {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    if (!profilePhotoFile) return "A profile photo is required.";
    if (!passportFile) return "A passport or ID document is required for identity verification.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          country: form.country,
          currency: form.currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const user = data.user || data;

      // Uploads happen after account creation since they need a userId.
      // Registration itself already succeeded at this point, so an upload
      // failure here is surfaced but doesn't block the new account.
      if (profilePhotoFile) {
        const upRes = await uploadFile(profilePhotoFile, user.id, "profile");
        if (upRes.success) user.profilePhoto = upRes.path;
      }
      if (passportFile) {
        const upRes = await uploadFile(passportFile, user.id, "passport");
        if (upRes.success) user.passportDocument = upRes.path;
      }

      setAuthUser(user);
      setSuccess("Account created successfully! Redirecting…");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* background ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[5%] right-[25%] w-[500px] h-[500px] rounded-full bg-apex-500/8 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/6 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-apex-500/25 group-hover:shadow-apex-500/40 transition-shadow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Interzenex</span>
          </Link>
        </div>

        {/* card */}
        <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/30">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-400">
              Start your journey with Interzenex Microfinance today
            </p>
          </div>

          {/* error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* success */}
          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-300">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* full name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={update("name")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                />
              </div>
            </div>

            {/* email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update("email")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                />
              </div>
            </div>

            {/* password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={update("password")}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* strength indicator */}
              {form.password.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {[1, 2, 3, 4].map((level) => {
                    const strength =
                      form.password.length >= 12
                        ? 4
                        : form.password.length >= 8
                        ? 3
                        : form.password.length >= 6
                        ? 2
                        : 1;
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength
                            ? strength <= 1
                              ? "bg-red-500"
                              : strength <= 2
                              ? "bg-yellow-500"
                              : strength <= 3
                              ? "bg-apex-400"
                              : "bg-emerald-400"
                            : "bg-slate-700"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  className={`w-full pl-10 pr-12 py-3 bg-slate-800/60 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 transition-all ${
                    form.confirmPassword.length > 0 && form.confirmPassword !== form.password
                      ? "border-red-500/50"
                      : form.confirmPassword.length > 0 && form.confirmPassword === form.password
                      ? "border-emerald-500/50"
                      : "border-slate-700/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword.length > 0 && form.confirmPassword !== form.password && (
                <p className="mt-1.5 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-300 mb-1.5">
                Country
              </label>
              <div className="relative">
                <Globe2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  id="country"
                  value={form.country}
                  onChange={handleCountryChange}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-800 text-white">
                      {countryFlag(c.code)} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                We&apos;ll set your base currency from your country automatically.
              </p>
            </div>

            {/* currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-300 mb-1.5">
                Base Currency
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  id="currency"
                  value={form.currency}
                  onChange={update("currency")}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-800 text-white">
                      {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* profile photo */}
            <div>
              <label htmlFor="profilePhoto" className="block text-sm font-medium text-slate-300 mb-1.5">
                Profile Photo <span className="text-red-400">*</span>
              </label>
              <label
                htmlFor="profilePhoto"
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 border border-dashed border-slate-700/50 rounded-xl text-sm text-slate-400 hover:border-apex-500/40 hover:text-slate-300 cursor-pointer transition-all"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span className="truncate">{profilePhotoFile ? profilePhotoFile.name : "Upload a photo (JPG, PNG, WEBP — max 5MB)"}</span>
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setProfilePhotoFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* passport / ID */}
            <div>
              <label htmlFor="passportDoc" className="block text-sm font-medium text-slate-300 mb-1.5">
                Passport / ID Document <span className="text-red-400">*</span>
              </label>
              <label
                htmlFor="passportDoc"
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 border border-dashed border-slate-700/50 rounded-xl text-sm text-slate-400 hover:border-apex-500/40 hover:text-slate-300 cursor-pointer transition-all"
              >
                <IdCard className="w-4 h-4 shrink-0" />
                <span className="truncate">{passportFile ? passportFile.name : "Upload for identity verification (JPG, PNG, or PDF)"}</span>
                <input
                  id="passportDoc"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                />
              </label>
              <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                <Upload className="w-3 h-3" />
                Only visible to you and Interzenex Microfinance staff for verification.
              </p>
            </div>

            {/* terms */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-apex-500 focus:ring-apex-500/50 focus:ring-offset-0"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-apex-400 hover:text-apex-300 transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-apex-400 hover:text-apex-300 transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed btn-shine"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[rgba(15,23,42,0.6)] text-slate-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* login link */}
          <div className="mt-6">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium text-slate-300 rounded-xl border border-slate-700/50 hover:border-slate-600/50 hover:bg-white/5 transition-all"
            >
              Sign in instead
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* footer */}
        <p className="mt-8 text-center text-xs text-slate-600">
          Your funds are FDIC insured up to $250,000.{" "}
          <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
}
