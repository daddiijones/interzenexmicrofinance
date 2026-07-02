"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import {
  Users,
  Search,
  X,
  Save,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldOff,
  Shield,
  Wallet,
  Mail,
  Hash,
  Edit3,
  Loader2,
} from "lucide-react";

const STATUS_CONFIG = {
  ACTIVE: {
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  RESTRICTED: {
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    icon: ShieldAlert,
  },
  SUSPENDED: {
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    icon: ShieldOff,
  },
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export default function AdminUsersPage() {
  const admin = useAuthUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Editable form state
  const [form, setForm] = useState({
    dailyLimit: "",
    status: "ACTIVE",
    transferCount: "5",
    restrictionMessage: "",
    approvalCode: "",
  });

  // Account balance editing
  const [accountBalances, setAccountBalances] = useState({});
  const [savingBalances, setSavingBalances] = useState(false);
  const [balanceFeedback, setBalanceFeedback] = useState(null);

  const fetchUsers = useCallback(async () => {
    if (!admin?.id) return;
    try {
      const res = await fetch(`/api/admin/users?adminId=${admin.id}`);
      const json = await res.json();

      if (json.success) {
        setUsers(json.users || []);
      } else {
        setError(json.error || "Failed to load users");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    if (!admin?.id) return;

    async function loadUsers() {
      try {
        const res = await fetch(`/api/admin/users?adminId=${admin.id}`);
        const json = await res.json();

        if (json.success) {
          setUsers(json.users || []);
        } else {
          setError(json.error || "Failed to load users");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [admin]);

  const openDrawer = (user) => {
    setSelectedUser(user);
    setForm({
      dailyLimit: user.dailyLimit || "",
      status: user.status || "ACTIVE",
      transferCount: user.transferCount ?? "5",
      restrictionMessage: user.restrictionMessage || "",
      approvalCode: user.approvalCode || "",
    });
    const balances = {};
    (user.accounts || []).forEach(acc => {
      balances[acc.id] = String(acc.balance ?? "0");
    });
    setAccountBalances(balances);
    setFeedback(null);
    setBalanceFeedback(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setFeedback(null);
    }, 300);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setFeedback(null);

    try {
      if (!admin?.id) return;

      const res = await fetch(`/api/admin/users/${selectedUser.id}/limits`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          dailyLimit: form.dailyLimit,
          status: form.status,
          transferCount: form.transferCount,
          restrictionMessage: form.restrictionMessage,
          approvalCode: form.approvalCode,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setFeedback({ type: "success", message: "User settings updated successfully." });
        // Refresh users list
        await fetchUsers();
        // Update selected user with new data
        if (json.user) {
          setSelectedUser((prev) => ({ ...prev, ...json.user }));
        }
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to update user." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBalances = async () => {
    if (!admin?.id || !selectedUser) return;
    setSavingBalances(true);
    setBalanceFeedback(null);

    const accounts = selectedUser.accounts || [];
    const errors = [];

    for (const acc of accounts) {
      const newBalance = parseFloat(accountBalances[acc.id]);
      if (isNaN(newBalance)) continue;
      if (newBalance === acc.balance) continue; // unchanged

      try {
        const res = await fetch(`/api/admin/accounts/${acc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId: admin.id, balance: newBalance }),
        });
        const json = await res.json();
        if (!json.success) errors.push(`${acc.type}: ${json.error}`);
      } catch (err) {
        errors.push(`${acc.type}: ${err.message}`);
      }
    }

    if (errors.length) {
      setBalanceFeedback({ type: "error", message: errors.join("; ") });
    } else {
      setBalanceFeedback({ type: "success", message: "Account balances updated successfully." });
      await fetchUsers();
      // Sync updated accounts into the selected user
      const updated = users.find(u => u.id === selectedUser.id);
      if (updated) setSelectedUser(updated);
    }
    setSavingBalances(false);
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.accountNumber && user.accountNumber.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading users…</p>
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
            User Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage accounts, limits, and restrictions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-apex-500/10 border border-apex-500/20">
            <Users className="w-4 h-4 text-apex-400" />
            <span className="text-sm font-medium text-apex-400">
              {users.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, email, or account number…"
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

      {/* Users Table */}
      <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  Account Number
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  Daily Limit
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  Spent Today
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filteredUsers.map((user) => {
                const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.ACTIVE;
                return (
                  <tr
                    key={user.id}
                    onClick={() => openDrawer(user)}
                    className="group hover:bg-slate-800/30 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name
                            ? user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-400 font-mono">
                        {user.accountNumber || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusCfg.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                        />
                        {user.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-300">
                        {formatCurrency(user.dailyLimit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-400">
                        {formatCurrency(user.spentToday || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(user);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-apex-400 bg-apex-500/10 hover:bg-apex-500/20 border border-apex-500/20 transition-all duration-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      {searchQuery
                        ? "No users match your search"
                        : "No users found"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Out Drawer */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg z-50 transform transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-slate-900 border-l border-slate-700/50 flex flex-col overflow-hidden shadow-2xl">
          {selectedUser && (
            <>
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/40 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                    {selectedUser.name
                      ? selectedUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "U"}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {selectedUser.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      User ID: {selectedUser.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* User Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    User Information
                  </h3>
                  <div className="glass-light rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">
                        {selectedUser.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300 font-mono">
                        {selectedUser.accountNumber || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${
                          STATUS_CONFIG[selectedUser.status]?.color ||
                          STATUS_CONFIG.ACTIVE.color
                        }`}
                      >
                        {selectedUser.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accounts / Balances — editable */}
                {selectedUser.accounts && selectedUser.accounts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Accounts &amp; Balances
                    </h3>
                    <div className="space-y-2">
                      {selectedUser.accounts.map((acc) => (
                        <div
                          key={acc.id}
                          className="glass-light rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-apex-400 shrink-0" />
                            <span className="text-sm font-medium text-slate-200">
                              {acc.type}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono ml-auto">
                              {acc.accountNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 shrink-0">
                              {acc.currency}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={accountBalances[acc.id] ?? acc.balance}
                              onChange={(e) =>
                                setAccountBalances((prev) => ({
                                  ...prev,
                                  [acc.id]: e.target.value,
                                }))
                              }
                              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-emerald-400 font-semibold focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {balanceFeedback && (
                      <div
                        className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in ${
                          balanceFeedback.type === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {balanceFeedback.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                        )}
                        {balanceFeedback.message}
                      </div>
                    )}

                    <button
                      onClick={handleSaveBalances}
                      disabled={savingBalances}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {savingBalances ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving Balances…
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Update Account Balances
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Editable Fields */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Settings & Restrictions
                  </h3>

                  {/* Daily Limit */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Daily Limit ($)
                    </label>
                    <input
                      type="number"
                      value={form.dailyLimit}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          dailyLimit: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all duration-200"
                      placeholder="e.g. 50000"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Account Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="RESTRICTED">RESTRICTED</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>

                  {/* Transfer Count */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-400">
                        Daily Transfer Limit
                        <span className="ml-1 text-slate-600">(0 = unlimited)</span>
                      </label>
                      {selectedUser && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">
                            Used today:
                            <span className={`ml-1 font-semibold ${
                              selectedUser.transfersRemaining === 0
                                ? "text-red-400"
                                : "text-amber-400"
                            }`}>
                              {selectedUser.transfersToday ?? 0}
                            </span>
                            {selectedUser.transferCount > 0 && (
                              <span className="text-slate-600"> / {selectedUser.transferCount}</span>
                            )}
                          </span>
                          {selectedUser.transfersRemaining !== null && (
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                              selectedUser.transfersRemaining === 0
                                ? "bg-red-500/10 text-red-400"
                                : selectedUser.transfersRemaining <= 1
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {selectedUser.transfersRemaining} left
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.transferCount}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          transferCount: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all duration-200"
                      placeholder="e.g. 5"
                    />
                  </div>

                  {/* Restriction Message */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Restriction Message
                    </label>
                    <textarea
                      value={form.restrictionMessage}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          restrictionMessage: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all duration-200 resize-none"
                      placeholder="Message shown to user when daily transfer count is reached…"
                    />
                  </div>

                  {/* Approval Code */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Approval Code
                    </label>
                    <input
                      type="text"
                      value={form.approvalCode}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          approvalCode: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all duration-200 font-mono tracking-wider"
                      placeholder="e.g. APR-1234"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-600">
                      User must enter this code when their daily transfer count is exhausted.
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                {feedback && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in ${
                      feedback.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    )}
                    {feedback.message}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-slate-700/40 bg-slate-900/80">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-apex-600 to-apex-500 hover:from-apex-500 hover:to-apex-400 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-shine shadow-lg shadow-apex-500/20"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
