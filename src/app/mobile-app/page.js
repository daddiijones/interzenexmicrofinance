import Link from "next/link";
import InfoLayout from "@/components/InfoLayout";
import { Smartphone, Fingerprint, Bell, Send, ArrowRight, Zap } from "lucide-react";

const appFeatures = [
  { icon: Smartphone, title: "No Install Needed", body: "Runs beautifully in your phone's browser — add it to your home screen for a native-app feel." },
  { icon: Fingerprint, title: "Fast, Secure Sign-In", body: "Email OTP verification on every login, without slowing you down." },
  { icon: Bell, title: "Real-Time Alerts", body: "Get notified the moment money moves in or out of your account." },
  { icon: Send, title: "Transfer From Anywhere", body: "Send money, pay bills, and manage cards in a couple of taps." },
];

export default function MobileAppPage() {
  return (
    <InfoLayout title="Mobile Banking" subtitle="Your whole bank, in your pocket — built mobile-first from day one.">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* phone frame mockup */}
        <div className="flex-1 flex justify-center">
          <div className="w-[220px] h-[440px] rounded-[2.5rem] border-4 border-slate-800 bg-slate-900 shadow-2xl shadow-black/40 p-2 relative overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-800 rounded-full z-10" />
            <div className="h-full rounded-[2rem] bg-gradient-to-b from-slate-900 to-slate-950 pt-8 px-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <Bell className="w-4 h-4 text-slate-500" />
              </div>
              <div className="glass-light rounded-xl p-3 mt-4">
                <p className="text-[9px] text-slate-500 uppercase">Total Balance</p>
                <p className="text-lg font-bold text-slate-100">$23,444.50</p>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between glass-light rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-apex-500/20" />
                    <div className="h-1.5 w-14 rounded-full bg-slate-700" />
                  </div>
                  <div className="h-1.5 w-8 rounded-full bg-emerald-500/50" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* feature list */}
        <div className="flex-1 space-y-5 w-full">
          {appFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-apex-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16 glass rounded-2xl p-6 sm:p-8 text-center border border-apex-500/10">
        <p className="text-slate-300">Open Interzenex Microfinance on your phone&apos;s browser and bank on the go, right now.</p>
        <Link
          href="/register"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoLayout>
  );
}
