import InfoLayout from "@/components/InfoLayout";

const licenses = [
  { name: "Next.js", version: "16.x", license: "MIT", author: "Vercel, Inc." },
  { name: "React", version: "19.x", license: "MIT", author: "Meta Platforms, Inc." },
  { name: "Tailwind CSS", version: "4.x", license: "MIT", author: "Tailwind Labs" },
  { name: "Prisma", version: "5.x", license: "Apache 2.0", author: "Prisma Data, Inc." },
  { name: "Lucide React", version: "1.x", license: "ISC", author: "Lucide Contributors" },
  { name: "Recharts", version: "3.x", license: "MIT", author: "Recharts Group" },
  { name: "bcryptjs", version: "3.x", license: "MIT", author: "Dominik Schorkmann" },
  { name: "nodemailer", version: "6.x", license: "MIT", author: "Andris Reinman" },
];

export default function LicensesPage() {
  return (
    <InfoLayout title="Licenses" subtitle="Open-source software used in the Interzenex Microfinance platform.">
      <div className="glass rounded-2xl p-6 mb-6">
        <p className="text-slate-400 text-sm leading-relaxed">
          Interzenex Microfinance is built on open-source software. We are grateful to the
          maintainers and contributors of the following projects. Respective licences are reproduced
          in full in our repository and available on request.
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Package</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Version</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Licence</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Author</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((l, i) => (
              <tr key={l.name} className={i < licenses.length - 1 ? "border-b border-slate-700/30" : ""}>
                <td className="px-5 py-3.5 font-semibold text-slate-200">{l.name}</td>
                <td className="px-5 py-3.5 text-slate-500 font-mono text-xs hidden sm:table-cell">{l.version}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-apex-500/10 text-apex-400 text-xs font-medium">{l.license}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{l.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InfoLayout>
  );
}
