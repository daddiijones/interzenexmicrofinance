"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  Users,
  Ticket,
  Landmark,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function formatCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 shadow-2xl border border-slate-700/50">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-white">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const stored = localStorage.getItem("apex_user");
        if (!stored) return;
        const admin = JSON.parse(stored);

        const res = await fetch(`/api/admin/users?adminId=${admin.id}`);
        const json = await res.json();

        if (json.success) {
          setData(json);
        } else {
          setError(json.error || "Failed to load data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (!data?.transactions) return [];
    const grouped = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(5, 10);
      grouped[key] = 0;
    }

    data.transactions.forEach((tx) => {
      const key = new Date(tx.createdAt).toISOString().slice(5, 10);
      if (grouped[key] !== undefined) {
        grouped[key] += parseFloat(tx.amount || 0);
      }
    });

    return Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount,
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Total Deposits",
        value: formatCurrency(data.stats?.totalDeposits || 0),
        icon: DollarSign,
        color: "from-emerald-500 to-emerald-600",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-400",
      },
      {
        label: "Total Users",
        value: data.users?.length || 0,
        icon: Users,
        color: "from-apex-500 to-apex-600",
        iconBg: "bg-apex-500/10",
        iconColor: "text-apex-400",
      },
      {
        label: "Open Tickets",
        value: data.stats?.activeTicketsCount || 0,
        icon: Ticket,
        color: "from-amber-500 to-orange-500",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-400",
      },
      {
        label: "Pending Loans",
        value: data.stats?.pendingLoansCount || 0,
        icon: Landmark,
        color: "from-purple-500 to-violet-500",
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-400",
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-1">
          System overview and performance metrics
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 card-hover animate-slide-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-xl ${stat.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  Live
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Transaction Volume Chart */}
        <div className="lg:col-span-3 glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Transaction Volume
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily volume over the last 30 days
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40">
              <div className="w-2 h-2 rounded-full bg-apex-500" />
              <span className="text-xs text-slate-400">Volume</span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  interval={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                  }
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.amount > 0
                          ? `rgba(34,197,94,${0.4 + (index / chartData.length) * 0.6})`
                          : "rgba(34,197,94,0.15)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "500ms", animationFillMode: "backwards" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest transactions across all users
              </p>
            </div>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {data?.transactions?.slice(0, 10).map((tx, index) => (
              <div
                key={tx.id || index}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20 hover:border-slate-700/50 transition-all duration-200"
              >
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                    tx.type === "DEPOSIT" || tx.type === "CREDIT"
                      ? "bg-emerald-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  {tx.type === "DEPOSIT" || tx.type === "CREDIT" ? (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {tx.senderName || tx.description || "Transaction"}
                    </p>
                    <span
                      className={`text-sm font-semibold ml-2 ${
                        tx.type === "DEPOSIT" || tx.type === "CREDIT"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "CREDIT"
                        ? "+"
                        : "-"}
                      ${Number(tx.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-slate-500 truncate">
                      {tx.receiverName ? `→ ${tx.receiverName}` : tx.type}
                    </p>
                    <span className="text-[11px] text-slate-500 ml-2 flex-shrink-0">
                      {timeAgo(tx.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {(!data?.transactions || data.transactions.length === 0) && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">
                  No recent transactions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
