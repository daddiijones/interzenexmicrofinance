import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { Building2, Users, Send, FileBarChart, ArrowRight } from "lucide-react";

const stats = [
  { value: "140+", label: "Currencies for payroll" },
  { value: "24hr", label: "Typical lending decision" },
  { value: "0", label: "Monthly account fees" },
];

const offerings = [
  { icon: Building2, title: "Business Checking", body: "A dedicated account to separate business and personal finances, with real-time balance visibility." },
  { icon: Send, title: "Cross-Border Payroll", body: "Pay contractors and employees in 140+ currencies without the delays of traditional wires." },
  { icon: Users, title: "Team Access Controls", body: "Add teammates with scoped permissions so the right people can act without full account access." },
  { icon: FileBarChart, title: "Business Lending", body: "Working capital and growth financing with straightforward terms, sized to your business." },
];

export default function BusinessBankingPage() {
  return (
    <InfoLayout title="Business Banking" subtitle="Accounts, payroll, and lending tools built to help your business operate and grow.">
      {/* stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-16">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl sm:text-4xl font-bold gradient-text">{s.value}</p>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* image + offerings side by side */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 w-full lg:sticky lg:top-24">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
            <img
              src="https://images.unsplash.com/photo-1758873269276-9518d0cb4a0b?fm=jpg&q=80&w=1200&auto=format&fit=crop"
              alt="Business team collaborating on their Interzenex account"
              className="w-full h-[320px] object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex-1 space-y-5">
          {offerings.map((o) => {
            const Icon = o.icon;
            return (
              <div key={o.title} className="flex items-start gap-4 glass rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-apex-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 mb-1">{o.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{o.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 glass rounded-2xl p-6 sm:p-8 text-center border border-apex-500/10">
        <p className="text-slate-300">Running a business across borders? Let&apos;s talk about what you need.</p>
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
