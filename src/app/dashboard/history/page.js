"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import { formatCurrency } from "@/lib/currencies";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Loader2,
  History,
  Receipt,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Inbox,
  Calendar,
  ArrowUpDown,
} from "lucide-react";

const FILTER_TABS = [
  { key: "ALL", label: "All", icon: Filter },
  { key: "TRANSFER", label: "Transfers", icon: ArrowUpRight },
  { key: "DEPOSIT", label: "Deposits", icon: TrendingUp },
  { key: "WITHDRAWAL", label: "Withdrawals", icon: TrendingDown },
  { key: "BILL_PAY", label: "Bills", icon: Receipt },
];

const STATUS_STYLES = {
  COMPLETED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  FAILED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const dayMs = 86400000;

  if (diff < dayMs) {
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) {
      const mins = Math.floor(diff / 60000);
      return mins < 1 ? "Just now" : `${mins}m ago`;
    }
    return `${hours}h ago`;
  }

  if (diff < 2 * dayMs) return "Yesterday";

  if (diff < 7 * dayMs) {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: now.getFullYear() !== d.getFullYear() ? "numeric" : undefined,
  });
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const user = useAuthUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sortNewest, setSortNewest] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/transactions?userId=${user.id}`);
      const data = await res.json();

      if (data.success) {
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || "Failed to load transactions.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    async function loadTransactions() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/transactions?userId=${user.id}`);
        const data = await res.json();

        if (data.success) {
          setTransactions(data.transactions || []);
        } else {
          setError(data.error || "Failed to load transactions.");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, [user]);

  const userAccountNumbers = useMemo(() => {
    if (!user?.accounts) return [];
    return user.accounts.map((a) => a.accountNumber);
  }, [user]);

  const isSent = (tx) => {
    return userAccountNumbers.includes(tx.senderAccountNumber);
  };

  const filtered = useMemo(() => {
    let result = [...transactions];

    // Filter by type
    if (activeFilter !== "ALL") {
      result = result.filter(
        (tx) => tx.type?.toUpperCase() === activeFilter
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (tx) =>
          (tx.description || "").toLowerCase().includes(q) ||
          (tx.receiverName || "").toLowerCase().includes(q) ||
          (tx.senderName || "").toLowerCase().includes(q) ||
          (tx.receiverAccountNumber || "").toLowerCase().includes(q) ||
          (tx.senderAccountNumber || "").toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortNewest ? db - da : da - db;
    });

    return result;
  }, [transactions, activeFilter, search, sortNewest]);

  // Summary stats
  const totalSent = useMemo(
    () =>
      transactions
        .filter((tx) => isSent(tx) && tx.status === "COMPLETED")
        .reduce((s, tx) => s + tx.amount, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, userAccountNumbers]
  );

  const totalReceived = useMemo(
    () =>
      transactions
        .filter((tx) => !isSent(tx) && tx.status === "COMPLETED")
        .reduce((s, tx) => s + tx.amount, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, userAccountNumbers]
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-apex-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-apex-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500 to-apex-700 flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Transaction History
              </h1>
              <p className="text-slate-400 text-sm">
                {transactions.length} total transactions
              </p>
            </div>
          </div>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-light text-slate-300 hover:text-white transition-all text-sm self-start"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">
                  Total Sent
                </p>
                <p className="text-xl font-bold text-red-400">
                  -{formatCurrency(totalSent)}
                </p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">
                  Total Received
                </p>
                <p className="text-xl font-bold text-emerald-400">
                  +{formatCurrency(totalReceived)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass rounded-2xl p-5 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description, recipient, or account..."
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all"
            />
          </div>

          {/* Filter Tabs & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-apex-500/20 text-apex-400 border border-apex-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSortNewest(!sortNewest)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors self-start"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortNewest ? "Newest first" : "Oldest first"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 animate-fade-in">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Transaction List */}
        <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-apex-400 animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Loading transactions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium">No transactions found</p>
              <p className="text-slate-500 text-sm mt-1">
                {search
                  ? "Try adjusting your search terms"
                  : "Your transactions will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-900/40 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <div className="col-span-1"></div>
                <div className="col-span-3">Description</div>
                <div className="col-span-3">Recipient / Sender</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1 text-center">Status</div>
              </div>

              {filtered.map((tx, idx) => {
                const sent = isSent(tx);
                const statusStyle = STATUS_STYLES[tx.status] || STATUS_STYLES.PENDING;
                const counterparty = sent ? tx.receiverName : tx.senderName;

                return (
                  <div
                    key={tx.id || idx}
                    className="group px-4 md:px-6 py-4 hover:bg-slate-800/30 transition-colors duration-200"
                  >
                    {/* Desktop Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      {/* Direction Icon */}
                      <div className="col-span-1">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            sent
                              ? "bg-red-500/10"
                              : "bg-emerald-500/10"
                          }`}
                        >
                          {sent ? (
                            <ArrowUpRight className="w-4 h-4 text-red-400" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="col-span-3">
                        <p className="text-white text-sm font-medium truncate">
                          {tx.description || "Transfer"}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {tx.type || "TRANSFER"} • {tx.currency}
                        </p>
                      </div>

                      {/* Counterparty */}
                      <div className="col-span-3">
                        <p className="text-slate-300 text-sm truncate">
                          {counterparty || "—"}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">
                          {sent
                            ? tx.receiverAccountNumber
                            : tx.senderAccountNumber}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="col-span-2">
                        <p className="text-slate-300 text-sm">
                          {formatDate(tx.createdAt)}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatFullDate(tx.createdAt)}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            sent ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {sent ? "-" : "+"}
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 flex justify-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Row */}
                    <div className="md:hidden flex items-center gap-3">
                      {/* Direction Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          sent ? "bg-red-500/10" : "bg-emerald-500/10"
                        }`}
                      >
                        {sent ? (
                          <ArrowUpRight className="w-4.5 h-4.5 text-red-400" />
                        ) : (
                          <ArrowDownLeft className="w-4.5 h-4.5 text-emerald-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white text-sm font-medium truncate">
                            {tx.description || "Transfer"}
                          </p>
                          <p
                            className={`text-sm font-semibold shrink-0 ${
                              sent ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
                            {sent ? "-" : "+"}
                            {formatCurrency(tx.amount, tx.currency)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-slate-500 text-xs truncate">
                            {counterparty || "—"} •{" "}
                            {formatDate(tx.createdAt)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 bg-slate-900/30 border-t border-slate-700/30">
              <p className="text-slate-500 text-xs flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Showing {filtered.length} of {transactions.length} transactions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
