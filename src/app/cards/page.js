import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { CreditCard, Snowflake, Bell, Globe2, ArrowRight, Wifi } from "lucide-react";

const cardFeatures = [
  { icon: CreditCard, title: "Virtual & Physical Cards", body: "Get a virtual card instantly on signup, with a physical card shipped at no extra cost." },
  { icon: Snowflake, title: "Instant Freeze", body: "Lost your card, or just want a spending pause? Freeze it in seconds from your dashboard." },
  { icon: Bell, title: "Real-Time Alerts", body: "A notification the moment your card is used — no surprise charges days later." },
  { icon: Globe2, title: "International Usage Toggle", body: "Turn international spending on before you travel, off when you don't need it." },
];

export default function CardsPage() {
  return (
    <InfoLayout title="Cards" subtitle="Find the perfect card for your lifestyle and spending habits, with rates that stay competitive.">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* CSS card mockup */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[320px] h-[200px] rounded-2xl bg-gradient-to-br from-apex-600 via-apex-500 to-emerald-500 p-6 shadow-2xl shadow-apex-500/20 rotate-[-4deg] hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between">
              <div className="w-10 h-7 rounded-md bg-white/20 backdrop-blur-sm" />
              <Wifi className="w-5 h-5 text-white/80 rotate-90" />
            </div>
            <p className="mt-8 text-white font-mono text-lg tracking-widest">•••• •••• •••• 4821</p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">Card Holder</p>
                <p className="text-sm text-white font-medium">Interzenex Member</p>
              </div>
              <span className="text-white font-bold text-lg italic">Interzenex</span>
            </div>
          </div>
        </div>

        {/* feature list */}
        <div className="flex-1 space-y-5 w-full">
          {cardFeatures.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-apex-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 mb-1">{c.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16 glass rounded-2xl p-6 sm:p-8 text-center border border-apex-500/10">
        <p className="text-slate-300">Every account comes with a free virtual debit card from day one.</p>
        <Link
          href="/register"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all"
        >
          Open an Account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoLayout>
  );
}
