import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { User, Car, Home, CreditCard, ArrowRight, FileText, Search, CheckCircle2, Banknote } from "lucide-react";

const rates = [
  { icon: User, title: "Personal Loans", rate: "15.49%", unit: "APR*" },
  { icon: Car, title: "Auto Loans", rate: "15.49%", unit: "APR*" },
  { icon: Home, title: "Home Loans", rate: "15.49%", unit: "APR*" },
  { icon: CreditCard, title: "Credit Cards", rate: "4.00%", unit: "APR*" },
];

const steps = [
  { icon: FileText, title: "Apply", body: "Two-minute application from your dashboard, no paperwork." },
  { icon: Search, title: "Review", body: "We review your profile and give you a decision, usually within 24 hours." },
  { icon: CheckCircle2, title: "Approve", body: "Accept your terms — clear rate, clear schedule, no surprises." },
  { icon: Banknote, title: "Fund", body: "Funds land in your account, often the same day you're approved." },
];

export default function LoansCreditPage() {
  return (
    <InfoLayout title="Loans & Credit" subtitle="Straightforward lending with rates based on your profile, not hidden fees.">
      {/* rate band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10 glass rounded-2xl overflow-hidden mb-16">
        {rates.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="p-5 sm:p-6 text-center">
              <Icon className="w-5 h-5 text-apex-400 mx-auto mb-3" />
              <p className="text-2xl font-bold gradient-text">{r.rate}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">{r.unit}</p>
              <p className="mt-2 text-xs sm:text-sm text-slate-300">{r.title}</p>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500 -mt-12 mb-16">
        *Annual Percentage Rate. Rates subject to change and depend on creditworthiness.
      </p>

      {/* process timeline */}
      <h2 className="text-xl font-bold text-slate-100 text-center mb-10">How financing works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
        <div className="hidden sm:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-apex-500/40 via-emerald-500/40 to-apex-500/40" />
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="relative text-center">
              <div className="relative z-10 w-12 h-12 mx-auto rounded-full bg-slate-900 border border-apex-500/30 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-apex-400" />
              </div>
              <p className="text-xs text-slate-600 mb-1">Step {i + 1}</p>
              <h3 className="text-sm font-semibold text-slate-100 mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-16 glass rounded-2xl p-6 sm:p-8 text-center border border-apex-500/10">
        <p className="text-slate-300">Check your rate without affecting your credit score.</p>
        <Link
          href="/contact"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoLayout>
  );
}
