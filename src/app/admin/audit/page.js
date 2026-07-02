"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Search,
  X,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Shield,
  KeyRound,
  Users,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { useAuthUser } from "@/lib/useAuthUser";

const ACTION_CONFIG = {
  TRANSFER_LIMIT_BYPASS: {
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    icon: KeyRound,
  },
  LIMIT_BYPASS_COT: {
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    icon: KeyRound,
  },
  UPDATE_USER_LIMITS: {
    color: "bg-apex-500/10 text-apex-400 border-apex-500/20",
    dot: "bg-apex-400",
    icon: Shield,
  },
  REPLY_SUPPORT_TICKET: {
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
    icon: MessageSquare,
  },
};

const DEFAULT_ACTION = {
  color: "bg-slate-700/30 text-slate-400 border-slate-600/30",
  dot: "bg-slate-500",
  icon: FileText,
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AuditLogPage() {
  const admin = useAuthUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!admin?.id) return;

    async function loadLogs() {
      try {
        const res = await fetch(`/api/admin/users?adminId=${admin.id}`);
        const data = await res.json();
        if (data.success) {
          setLogs(data.auditLogs || []);
        } else {
          setError(data.error || "Failed to load audit logs");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [admin]);

  const actionTypes = useMemo(
    () => ["ALL", ...new Set(logs.map((l) => l.action))],
    [logs]
  );

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;
      const matchesSearch =
        !search ||
        log.adminName?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.details?.toLowerCase().includes(search.toLowerCase());
      return matchesAction && matchesSearch;
    });
  }, [logs, search, actionFilter]);

  async function refresh() {
    if (!admin?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?adminId=${admin.id}`);
      const data = await res.json();
      if (data.success) setLogs(data.auditLogs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading audit log…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Audit Log
          </h1>
          <p className="text-slate-400 mt-1">
            Full history of all admin actions and system events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-apex-500/10 border border-apex-500/20">
            <FileText className="w-4 h-4 text-apex-400" />
            <span className="text-sm font-medium text-apex-400">
              {filtered.length} events
            </span>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 animate-slide-up"
        style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by action, admin, or details…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl glass text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action filter */}
        <div className="relative w-full sm:w-56">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl glass text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all cursor-pointer"
          >
            {actionTypes.map((a) => (
              <option key={a} value={a} className="bg-slate-900">
                {a === "ALL" ? "All Actions" : a.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Log list */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No audit events found</p>
        </div>
      ) : (
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
          {filtered.map((log) => {
            const cfg = ACTION_CONFIG[log.action] || DEFAULT_ACTION;
            const Icon = cfg.icon;
            const isExpanded = expanded === log.id;

            return (
              <div
                key={log.id}
                className="glass rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : log.id)}
                  className="w-full flex items-start sm:items-center gap-4 px-5 py-4 text-left hover:bg-white/2 transition-colors"
                >
                  {/* Dot + icon */}
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl border shrink-0 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium text-slate-200 truncate">
                          {log.adminName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500 hidden sm:block">
                          {formatDate(log.createdAt)}
                        </span>
                        <span className="text-xs text-slate-500 sm:hidden">
                          {timeAgo(log.createdAt)}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                      {log.details}
                    </p>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-700/30 pt-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500 mb-1">Event ID</p>
                        <p className="text-slate-300 font-mono">#{log.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Performed by</p>
                        <p className="text-slate-300">{log.adminName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Timestamp</p>
                        <p className="text-slate-300">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-slate-500 text-xs mb-1">Details</p>
                      <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-700/30">
                        {log.details}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
