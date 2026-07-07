"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import {
  FolderOpen,
  Search,
  X,
  AlertTriangle,
  Camera,
  IdCard,
  FileText,
  ExternalLink,
} from "lucide-react";

function isPdf(path) {
  return path && path.toLowerCase().endsWith(".pdf");
}

function DocumentTile({ label, icon: Icon, path, href }) {
  if (!path) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700/50 bg-slate-800/30 py-6">
        <Icon className="w-5 h-5 text-slate-600" />
        <span className="text-[11px] text-slate-600">No {label.toLowerCase()} on file</span>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 group relative rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden hover:border-apex-500/40 transition-all"
    >
      {isPdf(path) ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6">
          <FileText className="w-6 h-6 text-apex-400" />
          <span className="text-[11px] text-slate-400">PDF document</span>
        </div>
      ) : (
        <img src={href} alt={label} className="w-full h-28 object-cover" />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <ExternalLink className="w-4 h-4 text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
        <span className="text-[10px] font-medium text-white flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {label}
        </span>
      </div>
    </a>
  );
}

export default function AdminDocumentsPage() {
  const admin = useAuthUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchUsers = useCallback(async () => {
    if (!admin?.id) return;
    try {
      const res = await fetch(`/api/admin/users?adminId=${admin.id}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.users || []);
      } else {
        setError(json.error || "Failed to load documents");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const usersWithDocs = users.filter((u) => u.profilePhoto || u.passportDocument);

  const filtered = usersWithDocs.filter((u) => {
    if (filter === "PHOTO" && !u.profilePhoto) return false;
    if (filter === "PASSPORT" && !u.passportDocument) return false;
    if (filter === "MISSING" && u.profilePhoto && u.passportDocument) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.accountNumber && u.accountNumber.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-apex-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading documents…</p>
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Documents</h1>
          <p className="text-slate-400 mt-1">Every profile photo and passport/ID users have uploaded</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-apex-500/10 border border-apex-500/20">
          <FolderOpen className="w-4 h-4 text-apex-400" />
          <span className="text-sm font-medium text-apex-400">{usersWithDocs.length} users with uploads</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "ALL", label: "All" },
            { key: "PHOTO", label: "Has Photo" },
            { key: "PASSPORT", label: "Has Passport" },
            { key: "MISSING", label: "Missing One" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                filter === f.key
                  ? "bg-apex-500/15 border-apex-500/30 text-apex-400"
                  : "glass border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u) => (
          <div key={u.id} className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              {u.profilePhoto ? (
                <img
                  src={`/api/files/${u.profilePhoto}`}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-apex-500/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {u.name ? u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <DocumentTile
                label="Profile Photo"
                icon={Camera}
                path={u.profilePhoto}
                href={u.profilePhoto ? `/api/files/${u.profilePhoto}` : null}
              />
              <DocumentTile
                label="Passport / ID"
                icon={IdCard}
                path={u.passportDocument}
                href={u.passportDocument ? `/api/files/${u.passportDocument}?requesterId=${admin.id}` : null}
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full glass rounded-2xl p-12 text-center">
            <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No matching documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
