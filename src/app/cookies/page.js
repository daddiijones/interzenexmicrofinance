import InfoLayout from "@/components/InfoLayout";

const cookies = [
  { name: "session_token", type: "Essential", purpose: "Keeps you logged in during your browser session. Expires when you close your browser or after 24 hours of inactivity.", canOptOut: "No — required to use the platform." },
  { name: "csrf_token", type: "Essential", purpose: "Prevents cross-site request forgery attacks on your account.", canOptOut: "No — required for security." },
  { name: "_analytics", type: "Analytics", purpose: "Helps us understand which features are used most, so we can improve the platform. No personally identifiable information is included.", canOptOut: "Yes — disable in your browser settings." },
  { name: "theme_pref", type: "Preference", purpose: "Stores your display preferences (e.g., collapsed sidebar state).", canOptOut: "Yes — clearing your cookies will reset preferences." },
];

export default function CookiesPage() {
  return (
    <InfoLayout title="Cookie Policy" subtitle="Last updated: June 2026">
      <div className="space-y-5">
        <div className="glass rounded-2xl p-6">
          <p className="text-slate-400 leading-relaxed text-sm">
            Interzenex Microfinance uses a minimal set of cookies necessary to operate the platform
            securely. We do not use advertising cookies or sell cookie data to third parties.
          </p>
        </div>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cookie</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Purpose</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Opt-out</th>
              </tr>
            </thead>
            <tbody>
              {cookies.map((c, i) => (
                <tr key={c.name} className={i < cookies.length - 1 ? "border-b border-slate-700/30" : ""}>
                  <td className="px-5 py-4 font-mono text-xs text-apex-400">{c.name}</td>
                  <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">{c.type}</td>
                  <td className="px-5 py-4 text-slate-400 hidden md:table-cell text-xs leading-relaxed">{c.purpose}</td>
                  <td className="px-5 py-4 text-slate-500 hidden lg:table-cell text-xs">{c.canOptOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-slate-400">
            To manage cookies, use your browser&apos;s built-in privacy settings. For questions, contact{" "}
            <a href="mailto:privacy@interzenexmicrofinance.online" className="text-apex-400 hover:text-apex-300 transition-colors">
              privacy@interzenexmicrofinance.online
            </a>.
          </p>
        </div>
      </div>
    </InfoLayout>
  );
}
