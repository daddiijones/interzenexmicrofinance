import InfoLayout from "@/components/InfoLayout";
import { Shield, Globe2, Users, Award } from "lucide-react";

const stats = [
  { value: "2016", label: "Founded" },
  { value: "190+", label: "Countries served" },
  { value: "500K+", label: "Active customers" },
  { value: "140+", label: "Currencies supported" },
];

const values = [
  { icon: Shield, title: "Security First", body: "Every product decision starts with a security review. We encrypt everything, log every action, and audit continuously." },
  { icon: Globe2, title: "Borderless Finance", body: "We built Interzenex Microfinance because money should move as freely as people do — across borders, currencies, and time zones." },
  { icon: Users, title: "Customer Obsessed", body: "Our support team is available around the clock. We treat every customer inquiry with the same urgency as a production incident." },
  { icon: Award, title: "Transparent by Default", body: "No hidden fees. No surprise markups. Every rate, limit, and charge is visible before you confirm any transaction." },
];

export default function AboutPage() {
  return (
    <InfoLayout title="About Us" subtitle="We built Interzenex Microfinance to make banking work for everyone, everywhere.">
      {/* Mission */}
      <div className="glass rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          Interzenex Microfinance was founded on a simple conviction: modern financial infrastructure
          should not be locked behind geography, citizenship, or account minimums. We set out to
          rebuild digital banking from first principles — fast, transparent, and built for the
          globally connected individual.
        </p>
        <p className="text-slate-400 leading-relaxed">
          Today, we serve customers in 190+ countries, support 140+ currencies, and process
          billions in transfers every month. Our platform is licensed, regulated, and fully
          FDIC-insured up to $250,000 per depositor.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-extrabold gradient-text">{s.value}</p>
            <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <h2 className="text-xl font-bold text-white mb-6">Our Values</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {values.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="glass rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-apex-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">{v.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{v.body}</p>
            </div>
          );
        })}
      </div>
    </InfoLayout>
  );
}
