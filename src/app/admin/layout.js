"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuthUser } from "@/lib/useAuthUser";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const user = useAuthUser();
  const authorized = !!user && user.role === "ADMIN";

  useEffect(() => {
    if (!authorized) {
      router.push("/login");
    }
  }, [authorized, router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar role="ADMIN" />
      <main className="flex-1 h-screen overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
