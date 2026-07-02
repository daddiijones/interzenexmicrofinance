import InfoLayout from "@/components/InfoLayout";
import { Briefcase, MapPin, Clock } from "lucide-react";

const openRoles = [
  { title: "Senior Backend Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Designer (UX/UI)", dept: "Design", location: "New York or Remote", type: "Full-time" },
  { title: "Compliance Officer", dept: "Legal & Risk", location: "New York, NY", type: "Full-time" },
  { title: "Customer Support Lead", dept: "Operations", location: "Remote", type: "Full-time" },
  { title: "Growth Marketing Manager", dept: "Marketing", location: "Remote", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <InfoLayout title="Careers" subtitle="Join the team building the future of borderless banking. We're hiring globally.">
      <div className="glass rounded-2xl p-7 mb-8">
        <p className="text-slate-400 leading-relaxed">
          At Interzenex Microfinance we believe great teams build great products. We hire for
          curiosity, ownership, and craft — and we build in the open, move fast, and take security
          seriously. We offer competitive compensation, remote-first flexibility, and the chance
          to work on problems that actually matter to people across the world.
        </p>
      </div>

      <h2 className="text-lg font-semibold text-white mb-5">Open Positions</h2>
      <div className="space-y-3">
        {openRoles.map((r) => (
          <div key={r.title} className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-slate-100">{r.title}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{r.dept}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.type}</span>
              </div>
            </div>
            <a
              href={`mailto:careers@interzenexmicrofinance.online?subject=Application: ${encodeURIComponent(r.title)}`}
              className="shrink-0 px-5 py-2 rounded-xl border border-apex-500/30 text-apex-400 text-sm font-medium hover:bg-apex-500/10 transition-all"
            >
              Apply now
            </a>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-slate-500 text-sm">
        Don&apos;t see the right role? Send your CV to{" "}
        <a href="mailto:careers@interzenexmicrofinance.online" className="text-apex-400 hover:text-apex-300 transition-colors">
          careers@interzenexmicrofinance.online
        </a>
      </p>
    </InfoLayout>
  );
}
