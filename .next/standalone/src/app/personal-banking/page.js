import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { Wallet, PiggyBank, TrendingUp, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";

const accounts = [
  { icon: Wallet, title: "Checking", body: "No minimum balance, no monthly maintenance fees, instant access to your money." },
  { icon: PiggyBank, title: "Savings", body: "Competitive, transparent rates on every dollar you set aside — no tiers, no fine print." },
  { icon: TrendingUp, title: "Investment", body: "A dedicated account to start building long-term wealth alongside everyday banking." },
];

const perks = [
  "No minimum balance on any account",
  "Free instant transfers between your accounts",
  "Real-time spending notifications",
  "Cancel or freeze a card in seconds",
];

export default function PersonalBankingPage() {
  return (
    <InfoLayout title="Personal Banking" subtitle="Everyday accounts and tools designed around how you actually spend, save, and plan for the future.">
      {/* image + perks intro, not a card grid */}
      <div className="flex flex-col lg:flex-row items-center gap-10 mb-16">
        <div className="flex-1 w-full">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
            <img
              src="https://images.unsplash.com/photo-1758273705998-05655eea4635?fm=jpg&q=80&w=1200&auto=format&fit=crop"
              alt="Member checking her balance and card on her phone"
              className="w-full h-[280px] object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Built around real life, not fine print</h2>
          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* account types — horizontal band, not a repeating card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 glass rounded-2xl overflow-hidden">
        {accounts.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.title} className="p-6 sm:p-8">
              <Icon className="w-6 h-6 text-apex-400 mb-4" />
              <h3 className="text-base font-semibold text-slate-100 mb-2">{a.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{a.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 glass rounded-2xl p-6 sm:p-8 border border-apex-500/10">
        <p className="text-slate-300 text-sm sm:text-base">Open your first account in under three minutes — no branch visit required.</p>
        <Link
          href="/register"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all whitespace-nowrap"
        >
          Open an Account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoLayout>
  );
}
