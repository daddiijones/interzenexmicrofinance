"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUser, clearAuthUser } from "@/lib/useAuthUser";
import {
  LayoutDashboard,
  ArrowUpRight,
  Clock,
  CreditCard,
  Mail,
  HelpCircle,
  Users,
  MessageSquare,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
} from "lucide-react";

const USER_NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transfer", href: "/dashboard/transfer", icon: ArrowUpRight },
  { label: "History", href: "/dashboard/history", icon: Clock },
  { label: "Cards", href: "/dashboard/cards", icon: CreditCard },
  { label: "Emails", href: "/dashboard/emails", icon: Mail },
  { label: "Support", href: "/dashboard/support", icon: HelpCircle },
];

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Tickets", href: "/admin/tickets", icon: MessageSquare },
  { label: "Audit Log", href: "/admin/audit", icon: FileText },
];

export default function Sidebar({ role = "USER", currentPath }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthUser();

  const activePath = currentPath || pathname;
  const navItems = role === "ADMIN" ? ADMIN_NAV : USER_NAV;

  function handleLogout() {
    clearAuthUser();
    router.push("/");
  }

  function isActive(href) {
    if (role === "ADMIN") {
      if (href === "/admin") return activePath === "/admin";
      return activePath.startsWith(href);
    }
    if (href === "/dashboard") return activePath === "/dashboard";
    return activePath.startsWith(href);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-14 px-4 bg-slate-900 border-b border-slate-700/50">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold gradient-text">Interzenex Microfinance</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col h-screen w-72 bg-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${collapsed ? "md:w-20" : "md:w-64"}`}
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-apex-950/30 to-transparent pointer-events-none" />

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute right-4 top-4 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-600/50 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-7 z-50 items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-600/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 shadow-lg"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Logo section */}
        <div className="relative z-10 flex items-center gap-3 px-5 pt-6 pb-6 border-b border-slate-700/40">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500 to-emerald-500 shadow-lg shadow-apex-500/20 shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold gradient-text tracking-tight">
                Interzenex Microfinance
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                {role === "ADMIN" ? "Admin Portal" : "Digital Banking"}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-2">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-apex-500/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                } ${collapsed ? "md:justify-center" : ""}`}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-apex-400 to-apex-600" />
                )}
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${
                    active
                      ? "text-apex-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}

                {/* Tooltip for collapsed state (desktop only) */}
                {collapsed && (
                  <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="relative z-10 border-t border-slate-700/40 px-3 py-4">
          {user && (
            <div
              className={`flex items-center gap-3 ${
                collapsed ? "md:justify-center" : ""
              }`}
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-apex-500 to-emerald-500 text-white text-sm font-bold shrink-0 shadow-md">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-sm font-semibold text-slate-200 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user.email || ""}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
