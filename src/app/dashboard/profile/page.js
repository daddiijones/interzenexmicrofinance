"use client";

import { useState } from "react";
import { useAuthUser, setAuthUser } from "@/lib/useAuthUser";
import {
  User,
  Mail,
  Lock,
  Camera,
  IdCard,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Hash,
  Shield,
  CalendarClock,
} from "lucide-react";

async function uploadFile(file, userId, type) {
  const body = new FormData();
  body.append("file", file);
  body.append("userId", userId);
  body.append("type", type);
  const res = await fetch("/api/upload", { method: "POST", body });
  return res.json();
}

export default function ProfilePage() {
  const user = useAuthUser();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [passportFile, setPassportFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPassport, setUploadingPassport] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState(null);
  const [passportFeedback, setPassportFeedback] = useState(null);

  if (!user) return null;

  async function handleSaveDetails(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const body = { userId: user.id };
    if (name.trim() !== user.name) body.name = name;
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) body.email = email;
    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    if (Object.keys(body).length === 1) {
      setFeedback({ type: "error", message: "No changes to save." });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setAuthUser(json.user);
        setFeedback({ type: "success", message: "Profile updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to update profile." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPhoto() {
    if (!profilePhotoFile) return;
    setUploadingPhoto(true);
    setPhotoFeedback(null);
    try {
      const res = await uploadFile(profilePhotoFile, user.id, "profile");
      if (res.success) {
        setAuthUser({ ...user, profilePhoto: res.path });
        setPhotoFeedback({ type: "success", message: "Profile photo updated." });
        setProfilePhotoFile(null);
      } else {
        setPhotoFeedback({ type: "error", message: res.error || "Upload failed." });
      }
    } catch (err) {
      setPhotoFeedback({ type: "error", message: err.message });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleUploadPassport() {
    if (!passportFile) return;
    setUploadingPassport(true);
    setPassportFeedback(null);
    try {
      const res = await uploadFile(passportFile, user.id, "passport");
      if (res.success) {
        setAuthUser({ ...user, passportDocument: res.path });
        setPassportFeedback({ type: "success", message: "Document uploaded." });
        setPassportFile(null);
      } else {
        setPassportFeedback({ type: "error", message: res.error || "Upload failed." });
      }
    } catch (err) {
      setPassportFeedback({ type: "error", message: err.message });
    } finally {
      setUploadingPassport(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your personal information and documents</p>
      </div>

      {/* Avatar + read-only summary */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {user.profilePhoto ? (
          <img
            src={`/api/files/${user.profilePhoto}`}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover shrink-0 ring-2 ring-apex-500/20"
          />
        ) : (
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-apex-500 to-emerald-500 text-white text-2xl font-bold shrink-0">
            {user.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-white">{user.name}</h2>
          <p className="text-sm text-slate-400">{user.email}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              {user.accountNumber}
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {user.status}
            </span>
            {user.createdAt && (
              <span className="flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" />
                Member since {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Personal details form */}
      <form onSubmit={handleSaveDetails} className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Personal Details</h3>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700/30">
          <p className="text-xs font-semibold text-slate-400 mb-3">Change Password (optional)</p>
          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min. 6 characters)"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-apex-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-apex-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      {/* Profile photo upload */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Profile Photo</h3>
        <label
          htmlFor="profilePhotoUpload"
          className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 border border-dashed border-slate-700/50 rounded-xl text-sm text-slate-400 hover:border-apex-500/40 hover:text-slate-300 cursor-pointer transition-all"
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span className="truncate">{profilePhotoFile ? profilePhotoFile.name : "Choose a new photo (JPG, PNG, WEBP)"}</span>
          <input
            id="profilePhotoUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setProfilePhotoFile(e.target.files?.[0] || null)}
          />
        </label>
        {photoFeedback && (
          <p className={`text-xs ${photoFeedback.type === "success" ? "text-emerald-400" : "text-red-400"}`}>{photoFeedback.message}</p>
        )}
        <button
          type="button"
          onClick={handleUploadPhoto}
          disabled={!profilePhotoFile || uploadingPhoto}
          className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-medium text-apex-400 bg-apex-500/10 border border-apex-500/20 rounded-lg hover:bg-apex-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {uploadingPhoto ? "Uploading…" : "Upload Photo"}
        </button>
      </div>

      {/* Passport / ID upload */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Passport / ID Document</h3>
        <p className="text-xs text-slate-500">
          {user.passportDocument ? "A document is on file." : "No document on file yet."} Only visible to you and Interzenex Microfinance staff.
        </p>
        <label
          htmlFor="passportUpload"
          className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 border border-dashed border-slate-700/50 rounded-xl text-sm text-slate-400 hover:border-apex-500/40 hover:text-slate-300 cursor-pointer transition-all"
        >
          <IdCard className="w-4 h-4 shrink-0" />
          <span className="truncate">{passportFile ? passportFile.name : "Choose a new document (JPG, PNG, or PDF)"}</span>
          <input
            id="passportUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
          />
        </label>
        {passportFeedback && (
          <p className={`text-xs ${passportFeedback.type === "success" ? "text-emerald-400" : "text-red-400"}`}>{passportFeedback.message}</p>
        )}
        <button
          type="button"
          onClick={handleUploadPassport}
          disabled={!passportFile || uploadingPassport}
          className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-medium text-apex-400 bg-apex-500/10 border border-apex-500/20 rounded-lg hover:bg-apex-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {uploadingPassport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IdCard className="w-3.5 h-3.5" />}
          {uploadingPassport ? "Uploading…" : "Upload Document"}
        </button>
      </div>
    </div>
  );
}
