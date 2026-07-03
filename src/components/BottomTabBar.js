"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, Clock, CreditCard, User } from "lucide-react";

const TABS = [
  { label: "Activity", href: "/dashboard/history", icon: Clock },
  { label: "Transfer", href: "/dashboard/transfer", icon: Send },
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Cards", href: "/dashboard/cards", icon: CreditCard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
                  active ? "bg-apex-500/15" : ""
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? "text-apex-400" : "text-slate-500"}`} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-apex-400" : "text-slate-500"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
