"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  MessageSquare,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  Send,
  Loader2,
  Inbox,
  User,
  RefreshCw,
} from "lucide-react";
import { useAuthUser } from "@/lib/useAuthUser";

const STATUS_CONFIG = {
  OPEN: {
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    icon: Clock,
  },
  RESOLVED: {
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
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

function Avatar({ name }) {
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-apex-500 to-emerald-500 text-white text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

export default function AdminTicketsPage() {
  const admin = useAuthUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);

  // Per-ticket reply state
  const [replyText, setReplyText] = useState({});
  const [saving, setSaving] = useState({});
  const [feedback, setFeedback] = useState({});

  const loadTickets = useCallback(async () => {
    if (!admin?.id) return;
    try {
      const res = await fetch(`/api/support?adminId=${admin.id}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        setError(data.error || "Failed to load tickets");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    if (!admin?.id) return;

    async function load() {
      try {
        const res = await fetch(`/api/support?adminId=${admin.id}`);
        const data = await res.json();
        if (data.success) {
          setTickets(data.tickets || []);
        } else {
          setError(data.error || "Failed to load tickets");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [admin]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus =
        statusFilter === "ALL" || t.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        t.subject?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q) ||
        t.user?.name?.toLowerCase().includes(q) ||
        t.user?.email?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, statusFilter]);

  const openCount = tickets.filter((t) => t.status === "OPEN").length;

  async function handleReply(ticketId, currentStatus) {
    if (!admin?.id) return;
    const reply = (replyText[ticketId] || "").trim();
    if (!reply) return;

    setSaving((s) => ({ ...s, [ticketId]: true }));
    setFeedback((f) => ({ ...f, [ticketId]: null }));

    try {
      const res = await fetch(`/api/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          adminReply: reply,
          status: "RESOLVED",
        }),
      });
      const data = await res.json();

      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? data.ticket : t))
        );
        setReplyText((r) => ({ ...r, [ticketId]: "" }));
        setFeedback((f) => ({
          ...f,
          [ticketId]: { type: "success", message: "Reply sent and ticket resolved." },
        }));
        setTimeout(
          () =>
            setFeedback((f) => ({ ...f, [ticketId]: null })),
          3000
        );
      } else {
        setFeedback((f) => ({
          ...f,
          [ticketId]: { type: "error", message: data.error || "Failed to send reply." },
        }));
      }
    } catch (err) {
      setFeedback((f) => ({
        ...f,
        [ticketId]: { type: "error", message: err.message },
      }));
    } finally {
      setSaving((s) => ({ ...s, [ticketId]: false }));
    }
  }

  async function toggleStatus(ticket) {
    if (!admin?.id) return;
    const newStatus = ticket.status === "OPEN" ? "RESOLVED" : "OPEN";
    setSaving((s) => ({ ...s, [ticket.id]: true }));

    try {
      const res = await fetch(`/api/support/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          adminReply: ticket.adminReply || "",
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? data.ticket : t))
        );
      }
    } catch {
      // silent
    } finally {
      setSaving((s) => ({ ...s, [ticket.id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading tickets…</p>
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
            Support Tickets
          </h1>
          <p className="text-slate-400 mt-1">
            Review and reply to customer support requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          {openCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">
                {openCount} open
              </span>
            </div>
          )}
          <button
            onClick={loadTickets}
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
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by subject, message, or customer…"
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

        {/* Status tabs */}
        <div className="flex rounded-xl glass overflow-hidden border border-slate-700/50 shrink-0">
          {["ALL", "OPEN", "RESOLVED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-apex-500/20 text-apex-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {s === "ALL"
                ? `All (${tickets.length})`
                : s === "OPEN"
                ? `Open (${tickets.filter((t) => t.status === "OPEN").length})`
                : `Resolved (${tickets.filter((t) => t.status === "RESOLVED").length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No tickets match your filters</p>
        </div>
      ) : (
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
          {filtered.map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
            const StatusIcon = cfg.icon;
            const isExpanded = expanded === ticket.id;
            const isSaving = saving[ticket.id];

            return (
              <div key={ticket.id} className="glass rounded-2xl overflow-hidden">
                {/* Ticket header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : ticket.id)}
                  className="w-full flex items-start sm:items-center gap-4 px-5 py-4 text-left hover:bg-white/2 transition-colors"
                >
                  <Avatar name={ticket.user?.name} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {ticket.status}
                        </span>
                        <span className="text-sm font-medium text-slate-100 truncate">
                          {ticket.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500">
                          {timeAgo(ticket.createdAt)}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <User className="w-3 h-3" />
                      <span>
                        {ticket.user?.name || "Unknown"} · {ticket.user?.email}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-700/30 px-5 py-4 space-y-4 animate-fade-in">
                    {/* Customer message */}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        Customer Message
                      </p>
                      <div className="bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-700/30">
                        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {ticket.message}
                        </p>
                        <p className="mt-2 text-[11px] text-slate-500">
                          {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Existing admin reply */}
                    {ticket.adminReply && (
                      <div>
                        <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">
                          Admin Reply
                        </p>
                        <div className="bg-emerald-500/5 rounded-xl px-4 py-3 border border-emerald-500/20">
                          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {ticket.adminReply}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Reply form */}
                    <div>
                      <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                        {ticket.adminReply ? "Update Reply" : "Write a Reply"}
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Type your response to the customer…"
                        value={replyText[ticket.id] || ""}
                        onChange={(e) =>
                          setReplyText((r) => ({
                            ...r,
                            [ticket.id]: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 resize-none transition-all"
                      />

                      {feedback[ticket.id] && (
                        <div
                          className={`mt-2 text-xs px-3 py-2 rounded-lg ${
                            feedback[ticket.id].type === "success"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {feedback[ticket.id].message}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 gap-3">
                        <button
                          onClick={() => toggleStatus(ticket)}
                          disabled={isSaving}
                          className={`text-xs px-3 py-2 rounded-lg border transition-all disabled:opacity-50 ${
                            ticket.status === "OPEN"
                              ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          }`}
                        >
                          Mark as {ticket.status === "OPEN" ? "Resolved" : "Open"}
                        </button>

                        <button
                          onClick={() => handleReply(ticket.id, ticket.status)}
                          disabled={
                            isSaving || !(replyText[ticket.id] || "").trim()
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-apex-500 to-emerald-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-apex-500/20 transition-all btn-shine"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Sending…
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              Send Reply
                            </>
                          )}
                        </button>
                      </div>
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
