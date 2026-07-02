import InfoLayout from "@/components/InfoLayout";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Personal",
    price: "Free",
    period: "forever",
    highlight: false,
    features: [
      "Up to 5 transfers per day",
      "Multi-currency checking & savings",
      "Email OTP security on every login",
      "24/7 online support",
      "FDIC insured up to $250,000",
      "140+ world currencies",
    ],
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/ month",
    highlight: true,
    features: [
      "Unlimited daily transfers",
      "Priority customer support",
      "Advanced spending analytics",
      "International wire transfers",
      "Custom approval code management",
      "Dedicated account manager",
    ],
  },
  {
    name: "Business",
    price: "Custom",
    period: "pricing",
    highlight: false,
    features: [
      "Everything in Premium",
      "Team sub-accounts",
      "API access for integrations",
      "Custom daily transfer limits",
      "Volume-based FX rates",
      "SLA-backed support",
    ],
  },
];

export default function PricingPage() {
  return (
    <InfoLayout title="Pricing" subtitle="Transparent pricing with no hidden fees. Start free, scale when you need to.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`glass rounded-2xl p-7 flex flex-col ${
              p.highlight ? "border border-apex-500/30 relative" : ""
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-apex-500 to-emerald-500 text-white text-xs font-semibold">
                Most popular
              </span>
            )}
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{p.name}</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-white">{p.price}</span>
                <span className="text-slate-500 text-sm mb-1">{p.period}</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/register"
              className={`mt-8 block text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                p.highlight
                  ? "bg-gradient-to-r from-apex-600 to-emerald-500 text-white hover:from-apex-500 hover:to-emerald-400 btn-shine"
                  : "border border-slate-700/50 text-slate-300 hover:bg-white/5"
              }`}
            >
              {p.price === "Custom" ? "Contact us" : "Get started"}
            </a>
          </div>
        ))}
      </div>

      <p className="text-center text-slate-500 text-sm mt-10">
        All plans include 256-bit encryption, real-time fraud monitoring, and FDIC insurance.
        No setup fees. Cancel anytime.
      </p>
    </InfoLayout>
  );
}
