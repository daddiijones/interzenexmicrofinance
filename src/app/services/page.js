import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { Wallet, CreditCard, BarChart3, Handshake, TrendingUp, Smartphone, ArrowRight } from "lucide-react";

const categories = [
  {
    label: "For You",
    title: "Personal Banking",
    href: "/personal-banking",
    icon: Wallet,
    body: "Checking, savings, and investment accounts built around how you actually live.",
  },
  {
    label: "For Your Business",
    title: "Business Banking",
    href: "/business-banking",
    icon: Handshake,
    body: "Accounts, payroll, and lending tools to help your business operate and grow.",
  },
  {
    label: "Borrow",
    title: "Loans & Credit",
    href: "/loans-credit",
    icon: BarChart3,
    body: "Personal, auto, home loans, and credit cards with clear, competitive rates.",
  },
  {
    label: "Spend",
    title: "Cards",
    href: "/cards",
    icon: CreditCard,
    body: "Virtual and physical cards with real-time controls and zero surprise fees.",
  },
  {
    label: "Grow",
    title: "Wealth & Retirement",
    href: "/personal-banking",
    icon: TrendingUp,
    body: "Investment and retirement planning support for the long game.",
  },
  {
    label: "Anywhere",
    title: "Online & Mobile",
    href: "/mobile-app",
    icon: Smartphone,
    body: "Your whole bank on any device — no branch visit, ever.",
  },
];

export default function ServicesPage() {
  return (
    <InfoLayout title="Our Services" subtitle="Comprehensive banking solutions tailored to wherever you are in your financial journey.">
      <div className="space-y-4">
        {categories.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              href={c.href}
              className="group flex items-center gap-6 glass rounded-2xl p-5 sm:p-6 hover:bg-white/[0.04] transition-colors"
            >
              <span className="hidden sm:block text-3xl font-bold text-slate-800 group-hover:text-slate-700 transition-colors w-12 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-apex-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-apex-400 uppercase tracking-wider">{c.label}</p>
                <h3 className="text-base sm:text-lg font-semibold text-slate-100">{c.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mt-0.5">{c.body}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-apex-400 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          );
        })}
      </div>

      <div className="mt-10 glass rounded-2xl p-6 sm:p-8 text-center border border-apex-500/10">
        <p className="text-slate-300">
          Not sure where to start? Our team can walk you through the right mix of accounts for your goals.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all"
        >
          Talk to Our Team
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoLayout>
  );
}
