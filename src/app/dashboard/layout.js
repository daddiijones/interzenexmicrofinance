"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuthUser } from "@/lib/useAuthUser";
import { Clock, ShieldCheck, MessageCircle } from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const user = useAuthUser();
  const authorized = !!user?.id;
  const pendingApproval = authorized && user.status === "PENDING_APPROVAL";

  useEffect(() => {
    if (!authorized) {
      router.push("/login");
    }
  }, [authorized, router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (pendingApproval) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-950">
        <Sidebar role="USER" />
        <main className="flex-1 h-screen overflow-y-auto pt-14 md:pt-0 flex items-center justify-center px-4">
          <div className="glass rounded-2xl p-8 sm:p-10 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
              <Clock className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Account Under Review</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Thanks for signing up, {user.name?.split(" ")[0] || "there"}. Your account is
              being reviewed by our team — this usually includes verifying the identity
              document you provided. You&apos;ll have full access to transfers, cards, and
              your dashboard as soon as it&apos;s approved.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Approvals are typically completed within 24 hours
            </div>
            <a
              href="mailto:support@interzenexmicrofinance.online"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-300 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar role="USER" />
      <main className="flex-1 h-screen overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
