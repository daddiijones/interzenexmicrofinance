import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { Globe2, RefreshCcw, ShieldCheck, ArrowRight, MapPin } from "lucide-react";

const stats = [
  { value: "2M+", label: "Partner ATMs worldwide" },
  { value: "190+", label: "Countries covered" },
  { value: "$0", label: "Fee-free withdrawals" },
];

const points = [
  { icon: Globe2, title: "Global Partner Network", body: "Fee-free withdrawals at millions of partner ATMs worldwide — no branch network required." },
  { icon: RefreshCcw, title: "Automatic Fee Reimbursement", body: "Use an out-of-network ATM anyway? Eligible fees are reimbursed automatically, no forms." },
  { icon: ShieldCheck, title: "Freeze Anytime", body: "Misplace your card near an ATM? Freeze it instantly from your dashboard." },
];

export default function AtmLocationsPage() {
  return (
    <InfoLayout title="ATM Access" subtitle="As a digital-first bank, we skip the branch network — and pass the savings on to you through fee-free ATM access worldwide.">
      {/* globe-centric visual */}
      <div className="relative glass rounded-3xl p-10 sm:p-16 mb-16 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
          <Globe2 className="w-64 h-64 text-apex-400" strokeWidth={0.5} />
        </div>
        <div className="relative grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold gradient-text">{s.value}</p>
              <p className="mt-2 text-[11px] sm:text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {points.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="flex items-start gap-4 glass rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-apex-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100 mb-1">{p.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 glass rounded-2xl p-6 sm:p-8 text-center border border-apex-500/10">
        <MapPin className="w-5 h-5 text-apex-400 mx-auto mb-3" />
        <p className="text-slate-300">Questions about ATM access in your area? Our support team can help.</p>
        <Link
          href="/contact"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all"
        >
          Contact Support
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoLayout>
  );
}
