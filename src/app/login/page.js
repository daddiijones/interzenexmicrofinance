"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthUser, setAuthUser } from "@/lib/useAuthUser";
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const existingUser = useAuthUser();

  // Already logged in — skip the login page entirely
  useEffect(() => {
    if (!existingUser) return;
    if (existingUser.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }, [existingUser, router]);

  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP step state
  const [otpUserId, setOtpUserId] = useState(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || data.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Credentials accepted — move to OTP verification step.
      setOtpUserId(data.userId);
      setCooldown(data.cooldown || 60);
      setStep("otp");
      setLoading(false);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: otpUserId, code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid code. Please try again.");
        setVerifying(false);
        return;
      }

      const user = data.user;
      setAuthUser(user);

      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setError("");
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: otpUserId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Could not resend code.");
        if (data.retryAfter) setCooldown(data.retryAfter);
        return;
      }

      setCooldown(data.cooldown || 60);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  function backToCredentials() {
    setStep("credentials");
    setCode("");
    setError("");
    setCooldown(0);
    setOtpUserId(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* background ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-apex-500/8 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-emerald-500/6 blur-[100px]" />
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
          {step === "credentials" ? (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-400">
                Sign in to access your account
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <button
                onClick={backToCredentials}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-apex-500/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5 text-apex-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Verify it&apos;s you</h1>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Enter the 6-digit code we emailed to{" "}
                <span className="text-slate-300 font-medium">{email}</span>
              </p>
            </div>
          )}

          {/* error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {step === "credentials" ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* remember / forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-apex-500 focus:ring-apex-500/50 focus:ring-offset-0"
                />
                Remember me
              </label>
              <a href="#" className="text-apex-400 hover:text-apex-300 transition-colors">
                Forgot password?
              </a>
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
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* otp code */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-1.5">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-center text-2xl font-mono tracking-[0.4em] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                autoFocus
              />
              <p className="mt-2 text-xs text-slate-500">
                Code expires in 5 minutes.
              </p>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={verifying || code.trim().length < 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed btn-shine"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify &amp; Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* resend */}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="w-full text-center text-sm text-slate-400 hover:text-apex-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:text-slate-400"
            >
              {resending
                ? "Sending…"
                : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend code"}
            </button>
          </form>
          )}

          {/* divider */}
          {step === "credentials" && (
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[rgba(15,23,42,0.6)] text-slate-500">
                New to Interzenex Microfinance?
              </span>
            </div>
          </div>
          )}

          {/* register link */}
          {step === "credentials" && (
          <div className="mt-6">
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium text-slate-300 rounded-xl border border-slate-700/50 hover:border-slate-600/50 hover:bg-white/5 transition-all"
            >
              Create an account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          )}
        </div>

        {/* footer */}
        <p className="mt-8 text-center text-xs text-slate-600">
          By signing in, you agree to our{" "}
          <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
