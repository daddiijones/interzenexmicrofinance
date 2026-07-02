import InfoLayout from "@/components/InfoLayout";

const sections = [
  { title: "1. Acceptance of Terms", body: "By accessing or using the Interzenex Microfinance platform you agree to be bound by these Terms of Service. If you do not agree, you may not use our services." },
  { title: "2. Eligibility", body: "You must be at least 18 years of age and a resident of a country we serve to open an account. By registering, you confirm that the information you provide is accurate and that you have the legal right to do so." },
  { title: "3. Account Responsibilities", body: "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately at support@interzenexmicrofinance.online if you suspect unauthorised access." },
  { title: "4. Permitted Use", body: "You agree to use the platform only for lawful purposes. You may not use Interzenex Microfinance to facilitate money laundering, tax evasion, fraud, or any activity that violates applicable laws." },
  { title: "5. Transfer Limits and Approval Codes", body: "We reserve the right to set, adjust, or remove daily transfer limits on any account. Accounts may require an Approval Code to process transfers beyond the permitted daily count. These controls exist to protect you and comply with financial regulations." },
  { title: "6. Fees", body: "Our current fee schedule is published at interzenexmicrofinance.online/pricing. We reserve the right to change fees with 30 days' notice. Continued use of the platform after notice constitutes acceptance." },
  { title: "7. Termination", body: "We may suspend or terminate your account if we believe you have violated these terms, if required by regulation, or if we reasonably suspect fraudulent activity. You may close your account at any time by contacting support." },
  { title: "8. Limitation of Liability", body: "To the maximum extent permitted by law, Interzenex Microfinance is not liable for indirect, incidental, or consequential damages arising from your use of the platform." },
  { title: "9. Governing Law", body: "These terms are governed by the laws of the State of New York, United States. Any disputes shall be resolved in the courts of New York County, NY." },
  { title: "10. Changes to Terms", body: "We may update these Terms at any time. We will notify you by email or in-app notice at least 14 days before material changes take effect." },
];

export default function TermsPage() {
  return (
    <InfoLayout title="Terms of Service" subtitle="Last updated: June 2026">
      <div className="space-y-5">
        <div className="glass rounded-2xl p-6">
          <p className="text-slate-400 leading-relaxed text-sm">
            Please read these Terms of Service carefully before using Interzenex Microfinance. These
            terms form a binding agreement between you and Interzenex Microfinance Ltd.
          </p>
        </div>
        {sections.map((s) => (
          <div key={s.title} className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-100 mb-3">{s.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </InfoLayout>
  );
}
