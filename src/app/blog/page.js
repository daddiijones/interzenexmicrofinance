import InfoLayout from "@/components/InfoLayout";
import { Calendar, Clock } from "lucide-react";

const posts = [
  { title: "How Multi-Currency Accounts Are Changing Global Freelancing", date: "June 15, 2026", readTime: "5 min read", category: "Finance", excerpt: "For independent contractors paid in multiple currencies, managing FX exposure used to mean spreadsheets and late-night transfers. We explore how modern microfinance platforms have changed that." },
  { title: "Understanding the Approval Code System: A Safer Way to Authorise High-Volume Transfers", date: "May 28, 2026", readTime: "4 min read", category: "Security", excerpt: "Our Approval Code feature replaces static wire limits with a human-verified override layer. Here is how it works and why we built it." },
  { title: "OTP Login vs. Password-Only: Why We Made Two-Factor Non-Optional", date: "May 10, 2026", readTime: "6 min read", category: "Security", excerpt: "We made email OTP a mandatory part of every login. This is the conversation we had internally before building it — and why we have no regrets." },
  { title: "140 Currencies, One Account: Inside Our Exchange Rate Architecture", date: "April 22, 2026", readTime: "7 min read", category: "Engineering", excerpt: "Supporting 140+ currencies means managing rate tables, conversion precision, and edge cases at scale. Our engineering team walks through the decisions." },
  { title: "From Zero to Banking in 3 Minutes: The Interzenex Microfinance Onboarding Story", date: "April 5, 2026", readTime: "3 min read", category: "Product", excerpt: "We reduced account opening from days to 3 minutes without compromising compliance. Here is how we did it." },
];

const CATEGORY_COLORS = {
  Finance: "bg-emerald-500/10 text-emerald-400",
  Security: "bg-amber-500/10 text-amber-400",
  Engineering: "bg-apex-500/10 text-apex-400",
  Product: "bg-purple-500/10 text-purple-400",
};

export default function BlogPage() {
  return (
    <InfoLayout title="Blog" subtitle="Insights on banking, security, and global finance from the Interzenex Microfinance team.">
      <div className="space-y-5">
        {posts.map((p) => (
          <article key={p.title} className="glass rounded-2xl p-6 group cursor-pointer hover:border-apex-500/15 transition-all">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[p.category] || "bg-slate-700/40 text-slate-400"}`}>
                {p.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />{p.date}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />{p.readTime}
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-100 mb-2 group-hover:text-white transition-colors">{p.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{p.excerpt}</p>
            <p className="mt-3 text-xs text-apex-400 group-hover:text-apex-300 transition-colors">Read article →</p>
          </article>
        ))}
      </div>
    </InfoLayout>
  );
}
