"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuthUser, setAuthUser } from "@/lib/useAuthUser";
import { formatCurrency } from "@/lib/currencies";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PiggyBank,
  TrendingUp,
  Send,
  CreditCard,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const ACCOUNT_CONFIG = {
  CHECKING: {
    icon: Wallet,
    gradient: "from-apex-500 to-apex-700",
    shadow: "shadow-apex-500/20",
    accent: "text-apex-400",
    bgAccent: "bg-apex-500/10",
    label: "Checking Account",
  },
  SAVINGS: {
    icon: PiggyBank,
    gradient: "from-emerald-500 to-emerald-700",
    shadow: "shadow-emerald-500/20",
    accent: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
    label: "Savings Account",
  },
  INVESTMENT: {
    icon: TrendingUp,
    gradient: "from-purple-500 to-purple-700",
    shadow: "shadow-purple-500/20",
    accent: "text-purple-400",
    bgAccent: "bg-purple-500/10",
    label: "Investment Account",
  },
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 shadow-xl border border-slate-700/50">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-white">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const user = useAuthUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refresh account balances from the server on every visit so the dashboard
  // always reflects the latest state after any transfers made elsewhere.
  useEffect(() => {
    if (!user?.id) return;

    async function refreshAccounts() {
      try {
        const res = await fetch(`/api/user?userId=${user.id}`);
        const data = await res.json();
        if (data.success) setAuthUser(data.user);
      } catch {
        // non-critical
      }
    }
    refreshAccounts();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchTransactions() {
      try {
        const res = await fetch(`/api/transactions?userId=${user.id}`);
        const data = await res.json();
        if (data.success && data.transactions) {
          setTransactions(data.transactions);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user?.id]);

  // Accounts from user object, sorted by type priority
  const accounts = useMemo(() => {
    if (!user?.accounts) return [];
    const order = { CHECKING: 0, SAVINGS: 1, INVESTMENT: 2 };
    return [...user.accounts].sort(
      (a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99)
    );
  }, [user]);

  // Spending chart: daily spending over last 30 days
  const spendingData = useMemo(() => {
    if (!user || !transactions.length) return [];

    const userAccountNumbers = (user.accounts || []).map(
      (a) => a.accountNumber
    );
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build a map of day -> total spending
    const dailyMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = 0;
    }

    transactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      if (txDate < thirtyDaysAgo) return;
      const key = txDate.toISOString().split("T")[0];

      // Only count outgoing transactions (where user is sender)
      if (
        userAccountNumbers.includes(tx.senderAccountNumber) &&
        key in dailyMap
      ) {
        dailyMap[key] += tx.amount;
      }
    });

    return Object.entries(dailyMap).map(([date, amount]) => ({
      date: formatShortDate(date),
      amount: Number(amount.toFixed(2)),
    }));
  }, [transactions, user]);

  // Recent 8 transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 8);
  }, [transactions]);

  // Determine if transaction is sent or received
  function getTransactionDirection(tx) {
    if (!user?.accounts) return "received";
    const userAccountNumbers = user.accounts.map((a) => a.accountNumber);
    return userAccountNumbers.includes(tx.senderAccountNumber)
      ? "sent"
      : "received";
  }

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {getGreeting()},{" "}
          <span className="gradient-text">
            {user.name?.split(" ")[0] || "User"}
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">{todayStr}</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((account, idx) => {
          const config = ACCOUNT_CONFIG[account.type] || ACCOUNT_CONFIG.CHECKING;
          const Icon = config.icon;
          return (
            <div
              key={account.id}
              className="glass rounded-2xl p-5 card-hover animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${config.bgAccent}`}
                >
                  <Icon className={`w-5 h-5 ${config.accent}`} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {account.currency}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-1">
                {config.label}
              </p>
              <p className="text-2xl font-bold text-white tracking-tight">
                {formatCurrency(account.balance, account.currency)}
              </p>
              <p className="text-[11px] text-slate-600 mt-2 font-mono">
                •••• {account.accountNumber?.slice(-4) || "0000"}
              </p>
            </div>
          );
        })}
        {/* If user has fewer than 3 accounts, show placeholder cards */}
        {accounts.length === 0 && (
          <div className="col-span-3 glass rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-sm">No accounts found.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
        <Link
          href="/dashboard/transfer"
          className="glass-light rounded-2xl p-5 flex items-center gap-4 card-hover group"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-apex-500/10 group-hover:bg-apex-500/20 transition-colors">
            <Send className="w-5 h-5 text-apex-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Send Money</p>
            <p className="text-xs text-slate-500">Transfer funds instantly</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>

        <Link
          href="/dashboard/cards"
          className="glass-light rounded-2xl p-5 flex items-center gap-4 card-hover group"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">View Cards</p>
            <p className="text-xs text-slate-500">Manage your cards</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>

        <Link
          href="/dashboard/history"
          className="glass-light rounded-2xl p-5 flex items-center gap-4 card-hover group"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              Transaction History
            </p>
            <p className="text-xs text-slate-500">View all transactions</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>
      </div>

      {/* Spending Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Spending Chart */}
        <div
          className="lg:col-span-3 glass rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: "400ms", animationFillMode: "both" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">
                Spending Overview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 30 days</p>
            </div>
          </div>
          {spendingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={spendingData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="spendingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(51, 65, 85, 0.4)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(51, 65, 85, 0.4)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#spendingGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#22c55e",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px]">
              <p className="text-sm text-slate-500">
                No spending data available
              </p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div
          className="lg:col-span-2 glass rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: "500ms", animationFillMode: "both" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">
              Recent Transactions
            </h2>
            <Link
              href="/dashboard/history"
              className="text-xs text-apex-400 hover:text-apex-300 font-medium transition-colors"
            >
              View All
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-1">
              {recentTransactions.map((tx) => {
                const direction = getTransactionDirection(tx);
                const isSent = direction === "sent";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors"
                  >
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                        isSent ? "bg-red-500/10" : "bg-emerald-500/10"
                      }`}
                    >
                      {isSent ? (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">
                        {tx.description || (isSent ? `To ${tx.receiverName}` : `From ${tx.senderName || "Unknown"}`)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold whitespace-nowrap ${
                        isSent ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {isSent ? "-" : "+"}
                      {formatCurrency(tx.amount, tx.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-slate-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
