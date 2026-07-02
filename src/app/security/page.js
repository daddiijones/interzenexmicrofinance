import InfoLayout from "@/components/InfoLayout";
import { Lock, ShieldCheck, Activity, KeyRound, BadgeCheck, Award, Eye, Server } from "lucide-react";

const pillars = [
  { icon: Lock, title: "AES-256 Encryption", body: "All data is encrypted at rest and in transit using AES-256, the same standard used by financial institutions and governments worldwide." },
  { icon: ShieldCheck, title: "Email OTP on Every Login", body: "No session is started without a one-time passcode delivered to your registered email. Codes expire in 5 minutes and cannot be reused." },
  { icon: Activity, title: "Real-Time Fraud Monitoring", body: "Every transfer is screened against behavioural baselines and flagged automatically if unusual patterns are detected." },
  { icon: KeyRound, title: "Approval Code System", body: "Once a user's daily transfer count is exhausted, an admin-issued Approval Code is required before further transactions can proceed." },
  { icon: BadgeCheck, title: "FDIC Insured", body: "Customer deposits are insured by the Federal Deposit Insurance Corporation up to $250,000 per depositor, per ownership category." },
  { icon: Award, title: "SOC 2 Type II Certified", body: "Independently audited security, availability, processing integrity, confidentiality, and privacy controls — verified annually." },
  { icon: Eye, title: "Full Audit Logging", body: "Every admin action, approval code bypass, and limit change is permanently logged and viewable in the admin audit trail." },
  { icon: Server, title: "99.99% Uptime SLA", body: "Redundant infrastructure with automatic failover ensures your banking is available whenever you need it, wherever you are." },
];

export default function SecurityPage() {
  return (
    <InfoLayout title="Security" subtitle="We treat your money and data with the same care a vault engineer would — by design, not afterthought.">
      <div className="glass rounded-2xl p-6 sm:p-8 mb-8 border border-emerald-500/10">
        <p className="text-slate-300 leading-relaxed">
          At Interzenex Microfinance, security is not a feature — it is the foundation every other
          feature is built on. Our multi-layered approach combines encryption, identity verification,
          behavioural monitoring, and regulatory compliance to give you the highest possible assurance
          that your money is safe.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="glass rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-apex-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 glass rounded-2xl p-6 text-center">
        <p className="text-slate-400 text-sm">
          Found a security vulnerability? Report it responsibly to{" "}
          <a href="mailto:security@interzenexmicrofinance.online" className="text-apex-400 hover:text-apex-300 transition-colors">
            security@interzenexmicrofinance.online
          </a>
        </p>
      </div>
    </InfoLayout>
  );
}
