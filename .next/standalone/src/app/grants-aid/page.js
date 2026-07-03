import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { HeartHandshake, GraduationCap, Store, LifeBuoy, ArrowRight, Quote } from "lucide-react";

const programs = [
  { icon: Store, title: "Small Business Grants", body: "Non-repayable funding for qualifying small businesses looking to launch or expand, awarded quarterly." },
  { icon: GraduationCap, title: "Financial Literacy Program", body: "Free workshops and one-on-one coaching to help members build budgeting and credit-building skills." },
  { icon: LifeBuoy, title: "Hardship Assistance", body: "Temporary fee waivers and flexible repayment plans for members facing unexpected financial hardship." },
];

export default function GrantsAidPage() {
  return (
    <InfoLayout title="Grants & Aid" subtitle="Banking should help members move forward, not hold them back. Here's how we give back beyond the account.">
      {/* editorial photo + pull quote */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40 mb-4">
        <img
          src="https://images.unsplash.com/photo-1686771416282-3888ddaf249b?fm=jpg&q=80&w=1400&auto=format&fit=crop"
          alt="Interzenex relationship manager supporting a member in person"
          className="w-full h-[260px] sm:h-[340px] object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <Quote className="w-6 h-6 text-emerald-400/80 mb-3" />
          <p className="text-lg sm:text-xl text-white font-medium max-w-2xl leading-snug">
            &ldquo;A grant covered the deposit on our first storefront. We wouldn&apos;t
            have opened without it.&rdquo;
          </p>
          <p className="mt-3 text-xs sm:text-sm text-slate-300">Small Business Grants recipient, 2025 cohort</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12">
        {programs.map((p) => {
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

      <div className="mt-10 flex items-center gap-4 glass rounded-2xl p-6 sm:p-8 border border-apex-500/10">
        <HeartHandshake className="w-8 h-8 text-emerald-400 shrink-0 hidden sm:block" />
        <div className="flex-1">
          <p className="text-slate-300 text-sm sm:text-base">
            Interested in applying, or want to nominate a community partner? We&apos;d love to hear from you.
          </p>
        </div>
        <Link
          href="/contact"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all whitespace-nowrap"
        >
          Get in Touch
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoLayout>
  );
}
