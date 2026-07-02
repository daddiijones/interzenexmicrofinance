import InfoLayout from "@/components/InfoLayout";
import { FileText, Download } from "lucide-react";

const releases = [
  { date: "June 2026", title: "Interzenex Microfinance Surpasses 500,000 Active Users Globally", body: "The digital microfinance platform announces a milestone of half a million active customers across 190 countries, citing growth in emerging-market adoption." },
  { date: "March 2026", title: "Launch of Approval Code System — A New Standard in Transfer Authorization", body: "Interzenex Microfinance introduces a patent-pending daily-transfer limit system controlled by admin-issued approval codes, raising the bar for institutional-grade retail banking security." },
  { date: "January 2026", title: "Interzenex Microfinance Expands Currency Support to 140+ World Currencies", body: "Following customer demand from 45 new markets, the platform now supports 140 ISO 4217 currencies for account denomination and cross-currency conversion." },
  { date: "September 2025", title: "Interzenex Microfinance Achieves SOC 2 Type II Certification", body: "An independent audit confirms that Interzenex Microfinance's security, availability, and confidentiality controls meet the AICPA's rigorous Trust Services Criteria." },
];

export default function PressPage() {
  return (
    <InfoLayout title="Press" subtitle="News and announcements from Interzenex Microfinance.">
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="text-base font-semibold text-white mb-2">Media Inquiries</h2>
        <p className="text-sm text-slate-400 mb-3">
          For press inquiries, interview requests, or brand asset downloads, contact our communications team.
        </p>
        <a href="mailto:press@interzenexmicrofinance.online" className="inline-flex items-center gap-2 text-sm text-apex-400 hover:text-apex-300 transition-colors">
          press@interzenexmicrofinance.online →
        </a>
      </div>

      <h2 className="text-lg font-semibold text-white mb-5">Press Releases</h2>
      <div className="space-y-4">
        {releases.map((r) => (
          <div key={r.title} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">{r.date}</span>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">{r.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">{r.body}</p>
            <button className="flex items-center gap-1.5 text-xs text-apex-400 hover:text-apex-300 transition-colors">
              <Download className="w-3 h-3" /> Download PDF
            </button>
          </div>
        ))}
      </div>
    </InfoLayout>
  );
}
