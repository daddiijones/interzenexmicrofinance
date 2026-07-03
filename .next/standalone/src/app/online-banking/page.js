import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { LayoutDashboard, ArrowLeftRight, BarChart3, FileText, ArrowRight, Wallet } from "lucide-react";

const dashboardFeatures = [
  { icon: LayoutDashboard, title: "One Dashboard, Every Account", body: "Checking, savings, investment, and cards — all in a single real-time view." },
  { icon: ArrowLeftRight, title: "Instant Transfers", body: "Move money between accounts or to anyone else on Interzenex instantly, 24/7." },
  { icon: BarChart3, title: "Spending Insights", body: "Automatic categorization and trend charts so you always know where your money goes." },
  { icon: FileText, title: "Full Statement History", body: "Every transaction, searchable and exportable, from the day you opened your account." },
];

export default function OnlineBankingPage() {
  return (
    <InfoLayout title="Online Banking" subtitle="Full control of your accounts from any browser — no branch visit ever required.">
      {/* browser-frame dashboard mockup */}
      <div className="rounded-2xl overflow-hidden glass shadow-2xl shadow-black/40 mb-16">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10 bg-slate-900/60">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-4 text-[11px] text-slate-500 font-mono">interzenexmicrofinance.online/dashboard</span>
        </div>
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-light rounded-xl p-5">
            <Wallet className="w-4 h-4 text-apex-400 mb-3" />
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">Checking</p>
            <p className="text-xl font-bold text-slate-100 mt-1">$8,204.50</p>
          </div>
          <div className="glass-light rounded-xl p-5">
            <Wallet className="w-4 h-4 text-emerald-400 mb-3" />
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">Savings</p>
            <p className="text-xl font-bold text-slate-100 mt-1">$15,240.00</p>
          </div>
          <div className="glass-light rounded-xl p-5">
            <BarChart3 className="w-4 h-4 text-apex-400 mb-3" />
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">This Month</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">↗ 12.4%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {dashboardFeatures.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="glass rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-apex-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 glass rounded-2xl p-6 sm:p-8 text-center border border-apex-500/10">
        <p className="text-slate-300">Already a member? Sign in to your dashboard now.</p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all"
        >
          Login to Banking
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoLayout>
  );
}
