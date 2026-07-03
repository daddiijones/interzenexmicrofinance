import InfoLayout from "@/components/InfoLayout";
import { Code2, Key, Zap, Globe2 } from "lucide-react";

export default function ApiPage() {
  return (
    <InfoLayout title="API" subtitle="Integrate Interzenex Microfinance into your applications with our developer-friendly REST API.">
      <div className="space-y-6">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-apex-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">REST API</h2>
          </div>
          <p className="text-slate-400 leading-relaxed mb-4">
            Our REST API allows you to embed Interzenex Microfinance payments, account management,
            and currency conversion into your own products. All endpoints return JSON and use
            standard HTTP verbs.
          </p>
          <div className="bg-slate-900/60 rounded-xl p-4 font-mono text-sm text-emerald-400 border border-slate-700/50">
            <span className="text-slate-500">Base URL: </span>
            https://api.interzenexmicrofinance.online/v1
          </div>
        </div>

        {[
          { icon: Key, title: "Authentication", body: "All API requests must include a Bearer token in the Authorization header. Generate API keys from your admin dashboard under Settings → API Keys." },
          { icon: Zap, title: "Rate Limits", body: "The API supports up to 1,000 requests per minute per key on the Business plan. Standard and Personal plans are limited to 100 requests per minute." },
          { icon: Globe2, title: "Webhooks", body: "Subscribe to real-time transaction events. We POST a signed payload to your endpoint within 500ms of any account activity." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-apex-400" />
                </div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
            </div>
          );
        })}

        <div className="glass rounded-2xl p-6 border border-apex-500/15 text-center">
          <p className="text-slate-400 text-sm">
            Full documentation and API reference available for Business customers. Contact{" "}
            <a href="mailto:support@interzenexmicrofinance.online" className="text-apex-400 hover:text-apex-300 transition-colors">
              support@interzenexmicrofinance.online
            </a>{" "}
            to request API access.
          </p>
        </div>
      </div>
    </InfoLayout>
  );
}
