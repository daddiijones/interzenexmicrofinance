"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import { COUNTRIES, getCountryCurrency, countryFlag } from "@/lib/countries";
import { CURRENCIES } from "@/lib/currencies";
import {
  Users,
  Search,
  X,
  Save,
  ChevronRight,
  ChevronDown,
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
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  Coins,
  Globe2,
  User,
  Camera,
  IdCard,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

async function uploadFile(file, userId, type) {
  const body = new FormData();
  body.append("file", file);
  body.append("userId", userId);
  body.append("type", type);
  const res = await fetch("/api/upload", { method: "POST", body });
  return res.json();
}

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
  PENDING_APPROVAL: {
    color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    dot: "bg-sky-400",
    icon: Clock,
  },
  REJECTED: {
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

  // Create-user modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    country: "US",
    currency: "USD",
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFeedback, setCreateFeedback] = useState(null);
  const [createProfilePhotoFile, setCreateProfilePhotoFile] = useState(null);
  const [createPassportFile, setCreatePassportFile] = useState(null);

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

  const handleQuickStatus = async (newStatus) => {
    if (!admin?.id || !selectedUser) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/limits`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", message: `Account ${newStatus === "ACTIVE" ? "approved" : "rejected"}.` });
        setForm((prev) => ({ ...prev, status: newStatus }));
        setSelectedUser((prev) => ({ ...prev, ...json.user }));
        await fetchUsers();
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to update status." });
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

  const openCreateModal = () => {
    setCreateForm({ name: "", email: "", password: "", country: "US", currency: "USD" });
    setCreateFeedback(null);
    setShowCreatePassword(false);
    setCreateProfilePhotoFile(null);
    setCreatePassportFile(null);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setTimeout(() => setCreateFeedback(null), 300);
  };

  const handleCreateCountryChange = (e) => {
    const countryCode = e.target.value;
    setCreateForm((prev) => ({
      ...prev,
      country: countryCode,
      currency: getCountryCurrency(countryCode),
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!admin?.id) return;

    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      setCreateFeedback({ type: "error", message: "Name, email, and password are required." });
      return;
    }
    if (createForm.password.length < 6) {
      setCreateFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    setCreating(true);
    setCreateFeedback(null);

    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
          country: createForm.country,
          currency: createForm.currency,
        }),
      });
      const json = await res.json();

      if (json.success) {
        if (createProfilePhotoFile) {
          await uploadFile(createProfilePhotoFile, json.user.id, "profile");
        }
        if (createPassportFile) {
          await uploadFile(createPassportFile, json.user.id, "passport");
        }
        setCreateFeedback({ type: "success", message: `Account created for ${json.user.email}.` });
        await fetchUsers();
        setTimeout(() => closeCreateModal(), 1200);
      } else {
        setCreateFeedback({ type: "error", message: json.error || "Failed to create user." });
      }
    } catch (err) {
      setCreateFeedback({ type: "error", message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const pendingCount = users.filter((u) => u.status === "PENDING_APPROVAL").length;

  const filteredUsers = users
    .filter((user) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (user.name && user.name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.accountNumber && user.accountNumber.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const aPending = a.status === "PENDING_APPROVAL" ? 0 : 1;
      const bPending = b.status === "PENDING_APPROVAL" ? 0 : 1;
      return aPending - bPending;
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
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-medium text-sky-400">
                {pendingCount} pending approval
              </span>
            </div>
          )}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-apex-600 to-apex-500 hover:from-apex-500 hover:to-apex-400 text-white text-sm font-semibold transition-all duration-200 btn-shine shadow-lg shadow-apex-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
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
                        {user.profilePhoto ? (
                          <img
                            src={`/api/files/${user.profilePhoto}`}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-apex-500/10"
                          />
                        ) : (
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
                        )}
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
                  {selectedUser.profilePhoto ? (
                    <img
                      src={`/api/files/${selectedUser.profilePhoto}`}
                      alt={selectedUser.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-apex-500/20"
                    />
                  ) : (
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
                  )}
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

                {/* Quick approve/reject — always available, not just while pending */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleQuickStatus("ACTIVE")}
                    disabled={saving || selectedUser.status === "ACTIVE"}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleQuickStatus("REJECTED")}
                    disabled={saving || selectedUser.status === "REJECTED"}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </button>
                </div>
                {selectedUser.status === "PENDING_APPROVAL" && (
                  <p className="-mt-3 text-xs text-sky-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    This account is waiting on your review to unlock dashboard access.
                  </p>
                )}

                {/* Passport / ID — admin-only view */}
                {selectedUser.passportDocument && admin?.id && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Passport / ID Document
                    </h3>
                    <a
                      href={`/api/files/${selectedUser.passportDocument}?requesterId=${admin.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 glass-light rounded-xl p-4 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-apex-500/10 flex items-center justify-center shrink-0">
                        <IdCard className="w-4 h-4 text-apex-400" />
                      </div>
                      <span className="text-sm text-apex-400">View uploaded document</span>
                    </a>
                  </div>
                )}

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
                      <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                      <option value="REJECTED">REJECTED</option>
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

      {/* Create User Modal */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center px-4 transition-opacity duration-300 ${
          createModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCreateModal}
      >
        <div
          className={`w-full max-w-md glass rounded-2xl shadow-2xl shadow-black/30 transform transition-all duration-300 ${
            createModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/40">
            <div>
              <h2 className="text-lg font-semibold text-white">Create User</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sets up a full account exactly like self-registration
              </p>
            </div>
            <button
              onClick={closeCreateModal}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="px-6 py-5 space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showCreatePassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Share this password with the user directly — it's set exactly as typed here.
              </p>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Country
              </label>
              <div className="relative">
                <Globe2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={createForm.country}
                  onChange={handleCreateCountryChange}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-800 text-white">
                      {countryFlag(c.code)} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Base Currency
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={createForm.currency}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, currency: e.target.value }))}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-800 text-white">
                      {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Profile photo */}
            <div>
              <label htmlFor="createProfilePhoto" className="block text-sm font-medium text-slate-300 mb-1.5">
                Profile Photo <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <label
                htmlFor="createProfilePhoto"
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 border border-dashed border-slate-700/50 rounded-xl text-sm text-slate-400 hover:border-apex-500/40 hover:text-slate-300 cursor-pointer transition-all"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span className="truncate">{createProfilePhotoFile ? createProfilePhotoFile.name : "Upload a photo (JPG, PNG, WEBP)"}</span>
                <input
                  id="createProfilePhoto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setCreateProfilePhotoFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Passport / ID */}
            <div>
              <label htmlFor="createPassportDoc" className="block text-sm font-medium text-slate-300 mb-1.5">
                Passport / ID Document <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <label
                htmlFor="createPassportDoc"
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 border border-dashed border-slate-700/50 rounded-xl text-sm text-slate-400 hover:border-apex-500/40 hover:text-slate-300 cursor-pointer transition-all"
              >
                <IdCard className="w-4 h-4 shrink-0" />
                <span className="truncate">{createPassportFile ? createPassportFile.name : "Upload for verification (JPG, PNG, or PDF)"}</span>
                <input
                  id="createPassportDoc"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setCreatePassportFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Feedback */}
            {createFeedback && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in ${
                  createFeedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {createFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                {createFeedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed btn-shine"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
