import InfoLayout from "@/components/InfoLayout";
import { Globe2, Shield, CreditCard, TrendingUp, Send, Lock, Zap, BarChart3, KeyRound, Phone } from "lucide-react";

const features = [
  { icon: Globe2, title: "Multi-Currency Accounts", body: "Hold, send, and receive money in 140+ currencies. Your account automatically converts at real-time rates with no hidden markup." },
  { icon: Shield, title: "Bank-Level Security", body: "AES-256 encryption, biometric login support, and an Approval Code system that gate-keeps every high-volume transfer." },
  { icon: Send, title: "Instant Global Transfers", body: "Transfer to any Interzenex Microfinance account instantly. External bank transfers are processed same business day." },
  { icon: CreditCard, title: "Smart Debit Cards", body: "Virtual and physical cards with real-time spend controls, instant freeze, international usage toggle, and custom daily limits." },
  { icon: TrendingUp, title: "Real-Time Analytics", body: "Interactive dashboards, spending breakdowns by category, and balance projections to keep your finances in view." },
  { icon: KeyRound, title: "Approval Code System", body: "Admins set a daily transfer count per account. Once reached, an Approval Code is required — a genuine second layer of authorization." },
  { icon: Lock, title: "Email OTP Login", body: "Every login requires a fresh one-time passcode sent to your registered email, eliminating password-only attack vectors." },
  { icon: BarChart3, title: "Full Transaction History", body: "Every transfer, deposit, withdrawal, and bill payment logged with timestamps, amounts, counterparties, and status." },
  { icon: Zap, title: "Instant Account Opening", body: "Sign up in under 3 minutes. Choose your home country and base currency, and your accounts are ready immediately." },
  { icon: Phone, title: "24/7 Support", body: "Raise a support ticket from inside the app at any time. Our team reviews and responds to every request personally." },
];

export default function FeaturesPage() {
  return (
    <InfoLayout title="Features" subtitle="Everything you need to manage money globally — built into one secure platform.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="glass rounded-2xl p-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:from-apex-500/30 group-hover:to-emerald-500/30 transition-colors">
                <Icon className="w-5 h-5 text-apex-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
            </div>
          );
        })}
      </div>
    </InfoLayout>
  );
}
