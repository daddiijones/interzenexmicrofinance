"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import {
  Receipt,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  Loader2,
  CalendarClock,
  Check,
} from "lucide-react";

const STATUS_CONFIG = {
  COMPLETED: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  PENDING: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  REJECTED: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
  FAILED: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

function formatCurrency(value, currency = "USD") {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocal(dateStr) {
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminTransactionsPage() {
  const admin = useAuthUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [editingDateId, setEditingDateId] = useState(null);
  const [dateValue, setDateValue] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!admin?.id) return;
    try {
      const res = await fetch(`/api/admin/users?adminId=${admin.id}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.transactions || []);
      } else {
        setError(json.error || "Failed to load transactions");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function handleStatusChange(txId, newStatus) {
    if (!admin?.id) return;
    setUpdatingId(txId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status: newStatus } : t)));
        setFeedback({ type: "success", message: `Transaction #${txId} marked ${newStatus}.` });
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to update status." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDateChange(txId) {
    if (!admin?.id || !dateValue) return;
    setUpdatingId(txId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin.id, createdAt: new Date(dateValue).toISOString() }),
      });
      const json = await res.json();
      if (json.success) {
        setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, createdAt: json.transaction.createdAt } : t)));
        setFeedback({ type: "success", message: `Transaction #${txId} date updated.` });
        setEditingDateId(null);
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to update date." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = transactions.filter((tx) => {
    if (statusFilter !== "ALL" && tx.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (tx.senderName && tx.senderName.toLowerCase().includes(q)) ||
      (tx.receiverName && tx.receiverName.toLowerCase().includes(q)) ||
      (tx.receiverAccountNumber && tx.receiverAccountNumber.toLowerCase().includes(q)) ||
      (tx.description && tx.description.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading transactions…</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-slate-400 mt-1">Review and manage the status of any transfer</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-apex-500/10 border border-apex-500/20">
          <Receipt className="w-4 h-4 text-apex-400" />
          <span className="text-sm font-medium text-apex-400">{transactions.length} shown</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, account number, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl glass text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {["ALL", "COMPLETED", "PENDING", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                statusFilter === s
                  ? "bg-apex-500/15 border-apex-500/30 text-apex-400"
                  : "glass border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {feedback.message}
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filtered.map((tx) => {
                const statusCfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusCfg.icon;
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-apex-500/10 flex items-center justify-center shrink-0">
                          <ArrowUpRight className="w-4 h-4 text-apex-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {tx.senderName || "—"} → {tx.receiverName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{tx.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs text-slate-400">{tx.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-200">
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {editingDateId === tx.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="datetime-local"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            className="text-xs bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-apex-500/40"
                          />
                          {updatingId === tx.id ? (
                            <Loader2 className="w-4 h-4 text-slate-500 animate-spin shrink-0" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleDateChange(tx.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                title="Save date"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingDateId(null)}
                                className="p-1.5 rounded-lg bg-slate-700/40 text-slate-400 hover:text-slate-200"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingDateId(tx.id);
                            setDateValue(toDatetimeLocal(tx.createdAt));
                          }}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-apex-400 transition-colors group"
                          title="Backdate this transaction"
                        >
                          {formatDate(tx.createdAt)}
                          <CalendarClock className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {tx.status}
                        </span>
                        {updatingId === tx.id ? (
                          <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                        ) : (
                          <select
                            value={tx.status}
                            onChange={(e) => handleStatusChange(tx.id, e.target.value)}
                            className="text-xs bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-apex-500/40 cursor-pointer"
                          >
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">No transactions match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
