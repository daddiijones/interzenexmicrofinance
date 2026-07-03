"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthUser, setAuthUser } from "@/lib/useAuthUser";
import { CURRENCIES, formatCurrency } from "@/lib/currencies";
import {
  Send,
  ChevronDown,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Lock,
  X,
  ArrowRight,
  Wallet,
  User,
  Building2,
  DollarSign,
  FileText,
  Copy,
  CheckCheck,
  Globe2,
  Signal,
  Banknote,
  Landmark,
  Plane,
  Share2,
  Printer,
} from "lucide-react";

/* ─── Processing Animation Steps ─── */
const PROCESS_STEPS = [
  {
    id: 1,
    icon: Globe2,
    label: "Connecting to bank",
    detail: "Establishing secure connection…",
    color: "text-apex-400",
    bg: "bg-apex-500/15",
    duration: 2200,
  },
  {
    id: 2,
    icon: ShieldCheck,
    label: "Authentication handshake",
    detail: "Verifying your identity and session…",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    duration: 2400,
  },
  {
    id: 3,
    icon: Signal,
    label: "Connected",
    detail: "Secure channel established",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    duration: 1800,
  },
  {
    id: 4,
    icon: Banknote,
    label: "Initialising transfer",
    detail: "Routing funds to recipient account…",
    color: "text-apex-400",
    bg: "bg-apex-500/15",
    duration: 2500,
  },
  {
    id: 5,
    icon: CheckCircle2,
    label: "Transfer complete",
    detail: "Funds delivered successfully",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    duration: 1500,
  },
];

/* ─── Processing Modal ─── */
function ProcessingModal({ onDone }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    let cancelled = false;

    function advance() {
      if (cancelled) return;
      const step = PROCESS_STEPS[idx];
      if (!step) return;

      setTimeout(() => {
        if (cancelled) return;
        idx += 1;
        if (idx < PROCESS_STEPS.length) {
          setStepIndex(idx);
          advance();
        } else {
          setDone(true);
          setTimeout(() => { if (!cancelled) onDone(); }, 500);
        }
      }, step.duration);
    }

    advance();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const step = PROCESS_STEPS[stepIndex];
  const progress = ((stepIndex + (done ? 1 : 0)) / PROCESS_STEPS.length) * 100;
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div className="glass relative z-10 w-full max-w-sm rounded-2xl p-8 animate-slide-up border border-slate-700/40">
        {/* Progress bar */}
        <div className="h-1 w-full bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-apex-500 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Animated icon */}
        <div className="flex justify-center mb-6">
          <div className={`relative w-20 h-20 rounded-full ${step.bg} flex items-center justify-center`}>
            {/* outer pulse ring */}
            <div className={`absolute inset-0 rounded-full ${step.bg} animate-ping opacity-40`} />
            <Icon className={`w-9 h-9 ${step.color} relative z-10`} />
          </div>
        </div>

        {/* Step label */}
        <h3 className="text-center text-lg font-bold text-white mb-1 transition-all duration-300">
          {step.label}
        </h3>
        <p className="text-center text-slate-400 text-sm mb-8 transition-all duration-300">
          {step.detail}
        </p>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2">
          {PROCESS_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`rounded-full transition-all duration-300 ${
                i < stepIndex
                  ? "w-5 h-2 bg-emerald-400"
                  : i === stepIndex
                  ? "w-5 h-2 bg-apex-400"
                  : "w-2 h-2 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Security note */}
        <p className="mt-6 text-center text-[11px] text-slate-600 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          256-bit SSL · Interzenex Secure Transfer Protocol
        </p>
      </div>
    </div>
  );
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function maskAccountNumber(num) {
  if (!num || num.length < 4) return num;
  return "••••" + num.slice(-4);
}

/* ─── Success Modal ─── */
function SuccessModal({ transaction, onClose }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.id?.toString() || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `Transfer Successful\n${formatCurrency(transaction.amount, transaction.currency)} to ${transaction.receiverName}\nRef: INTE-${transaction.id}\n${formatDateTime(transaction.createdAt)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Transfer Receipt", text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    navigator.clipboard.writeText(text);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:block print:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div id="receipt-content" className="glass relative z-10 w-full max-w-md rounded-2xl p-8 animate-slide-up print:shadow-none print:bg-white print:text-black print:max-w-full print:rounded-none">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Checkmark */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse-soft print:bg-emerald-100">
              <div className="w-14 h-14 rounded-full bg-emerald-500/30 flex items-center justify-center print:bg-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-fade-in print:text-emerald-600" />
              </div>
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-xl print:hidden" />
          </div>
          <h2 className="text-2xl font-bold text-white print:text-black">Transfer Successful</h2>
          <p className="text-slate-400 text-sm mt-1 print:text-slate-600">
            Your transfer has been processed
          </p>
        </div>

        {/* Receipt */}
        <div className="space-y-3 bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 print:bg-white print:border-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">From Account</span>
            <span className="text-white text-sm font-medium">
              {maskAccountNumber(transaction.senderAccountNumber)}
            </span>
          </div>
          <div className="border-t border-slate-700/50" />
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm">To</span>
            <div className="text-right">
              <p className="text-white text-sm font-medium">
                {transaction.receiverName}
              </p>
              <p className="text-slate-500 text-xs">
                {transaction.receiverAccountNumber} • {transaction.receiverBank}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700/50" />
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Amount</span>
            <span className="text-emerald-400 text-lg font-bold">
              {formatCurrency(transaction.amount, transaction.currency)}
            </span>
          </div>
          <div className="border-t border-slate-700/50" />
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Currency</span>
            <span className="text-white text-sm font-medium">
              {transaction.currency}
            </span>
          </div>
          <div className="border-t border-slate-700/50" />
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Date & Time</span>
            <span className="text-white text-sm font-medium">
              {formatDateTime(transaction.createdAt)}
            </span>
          </div>
          <div className="border-t border-slate-700/50" />
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Transaction ID</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-mono">
                #{transaction.id}
              </span>
              <button
                onClick={handleCopy}
                className="text-slate-500 hover:text-apex-400 transition-colors"
              >
                {copied ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Share / Print */}
        <div className="grid grid-cols-2 gap-3 mt-6 print:hidden">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {shared ? "Copied!" : "Share"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>

        {/* Done button */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-apex-600 to-apex-500 text-white font-semibold hover:from-apex-500 hover:to-apex-400 transition-all duration-300 btn-shine print:hidden"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ─── Approval Code Modal ─── */
function ApprovalCodeModal({
  restrictionMessage,
  onSubmit,
  onClose,
  loading,
  error,
}) {
  const [approvalCode, setApprovalCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!approvalCode.trim()) return;
    onSubmit(approvalCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — no click-to-close for security modal */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-8 animate-slide-up border border-amber-500/20">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white text-center">
            Approval Code Required
          </h2>
        </div>

        {/* Restriction Message */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-amber-200/80 text-sm leading-relaxed text-center">
            {restrictionMessage}
          </p>
        </div>

        {/* Approval Code Input */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-apex-400" />
              Enter Approval Code
            </div>
          </label>
          <div className="relative">
            <input
              type="text"
              value={approvalCode}
              onChange={(e) => setApprovalCode(e.target.value.toUpperCase())}
              placeholder="Enter your Approval Code"
              className="w-full bg-slate-900/80 border border-slate-600/50 rounded-xl px-4 py-3.5 text-white font-mono text-center text-lg tracking-[0.3em] placeholder:tracking-normal placeholder:text-slate-500 placeholder:font-sans placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all"
              autoFocus
              autoComplete="off"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 animate-fade-in">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !approvalCode.trim()}
            className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-apex-600 to-apex-500 text-white font-semibold hover:from-apex-500 hover:to-apex-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 btn-shine"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                Authorise Transfer
              </>
            )}
          </button>
        </form>

        {/* Security footer */}
        <p className="text-slate-500 text-xs text-center mt-4 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          256-bit encrypted · Interzenex Secure Transfer Protocol
        </p>
      </div>
    </div>
  );
}

/* ─── Confirmation Modal ─── */
function ConfirmModal({ details, onConfirm, onEdit, loading }) {
  const { senderAccount, receiverName, receiverAccount, receiverBank,
          swiftCode, iban, sortCode, routingNumber,
          amount, currency, reference, transferType } = details;

  const rows = [
    { label: "From Account", value: `${senderAccount?.type} ••••${String(senderAccount?.accountNumber || "").slice(-4)} (${senderAccount?.currency} ${Number(senderAccount?.balance||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})})` },
    { label: "Beneficiary Name", value: receiverName },
    transferType === "INTERNATIONAL"
      ? { label: "IBAN", value: iban || receiverAccount }
      : { label: "Account Number", value: receiverAccount },
    { label: "Bank", value: receiverBank },
    swiftCode && transferType === "INTERNATIONAL" && { label: "SWIFT / BIC", value: swiftCode },
    sortCode && transferType === "LOCAL" && { label: "Sort Code", value: sortCode },
    routingNumber && transferType === "LOCAL" && { label: "Routing Number", value: routingNumber },
    { label: "Amount", value: `${currency} ${Number(amount).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}` },
    reference && { label: "Reference", value: reference },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onEdit} />
      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-7 animate-slide-up border border-slate-700/40">
        <h2 className="text-lg font-bold text-white mb-1">Confirm Transfer</h2>
        <p className="text-slate-400 text-sm mb-5">Please review the details before sending.</p>

        <div className="space-y-2 mb-6">
          {rows.map(r => (
            <div key={r.label} className="flex justify-between gap-3 text-sm py-2 border-b border-slate-700/30 last:border-0">
              <span className="text-slate-400 shrink-0">{r.label}</span>
              <span className="text-slate-200 font-medium text-right break-all">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 mb-5">
          <p className="text-amber-300/80 text-xs text-center">
            Once confirmed, this transfer cannot be reversed. Verify the beneficiary details carefully.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 py-3 rounded-xl border border-slate-700/50 text-slate-300 text-sm font-medium hover:bg-white/5 transition-all"
          >
            Edit Details
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-apex-600 to-emerald-500 text-white text-sm font-semibold hover:from-apex-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-shine flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</> : <><Send className="w-4 h-4" />Confirm Transfer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Transfer Page ─── */
export default function TransferPage() {
  const user = useAuthUser();
  const accounts = user?.accounts || [];
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [transferType, setTransferType] = useState("LOCAL"); // "LOCAL" | "INTERNATIONAL"
  const [receiverName, setReceiverName] = useState("");
  const [receiverAccount, setReceiverAccount] = useState("");
  const [receiverBank, setReceiverBank] = useState("Interzenex Microfinance");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [confirmDetails, setConfirmDetails] = useState(null);
  // processingMode: "success" | "approval" — determines what shows after the animation
  const [processingMode, setProcessingMode] = useState("success");
  const [processingTx, setProcessingTx] = useState(null);
  const [successTx, setSuccessTx] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null); // holds restriction message for after animation
  const [approvalModal, setApprovalModal] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalError, setApprovalError] = useState("");

  const effectiveAccountId =
    selectedAccountId || accounts[0]?.id?.toString() || "";

  const selectedAccount = accounts.find(
    (a) => a.id.toString() === effectiveAccountId
  );

  const resetForm = () => {
    setReceiverName("");
    setReceiverAccount("");
    setReceiverBank("Interzenex Microfinance");
    setSwiftCode("");
    setIban("");
    setSortCode("");
    setRoutingNumber("");
    setAmount("");
    setDescription("");
    setReference("");
    setError("");
  };

  // Re-fetch the full user from the server and persist to the auth store so
  // every component (dashboard, sidebar, history) shows the correct balance.
  async function refreshUser() {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/user?userId=${user.id}`);
      const data = await res.json();
      if (data.success) setAuthUser(data.user);
    } catch {
      // non-critical — UI will still reflect the local optimistic update
    }
  }

  const buildDescription = useCallback(() => {
    const parts = [description.trim()];
    if (reference.trim()) parts.push(`Ref: ${reference.trim()}`);
    if (transferType === "INTERNATIONAL") {
      if (swiftCode.trim()) parts.push(`SWIFT/BIC: ${swiftCode.trim().toUpperCase()}`);
      if (iban.trim()) parts.push(`IBAN: ${iban.trim().toUpperCase()}`);
    } else {
      if (sortCode.trim()) parts.push(`Sort Code: ${sortCode.trim()}`);
      if (routingNumber.trim()) parts.push(`Routing: ${routingNumber.trim()}`);
    }
    return parts.filter(Boolean).join(" | ") || `Transfer to ${receiverName.trim()}`;
  }, [description, reference, transferType, swiftCode, iban, sortCode, routingNumber, receiverName]);

  const buildPayload = useCallback(
    (approvalCode) => ({
      userId: user?.id,
      senderAccountId: parseInt(effectiveAccountId),
      receiverAccountNumber: (transferType === "INTERNATIONAL" && iban.trim() ? iban.trim() : receiverAccount.trim()),
      receiverBank: receiverBank.trim(),
      receiverName: receiverName.trim(),
      amount: parseFloat(amount),
      currency,
      description: buildDescription(),
      ...(approvalCode ? { approvalCode } : {}),
    }),
    [
      user, effectiveAccountId, transferType, iban, receiverAccount,
      receiverBank, receiverName, amount, currency, buildDescription,
    ]
  );

  // Step 1: validate and show confirmation modal
  const handleTransfer = (e) => {
    e.preventDefault();
    setError("");

    const accountId = transferType === "INTERNATIONAL" ? iban.trim() || receiverAccount.trim() : receiverAccount.trim();

    if (!effectiveAccountId || !receiverName.trim() || !accountId || !amount) {
      setError("Please fill in all required fields.");
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (transferType === "INTERNATIONAL" && !swiftCode.trim() && !iban.trim()) {
      setError("Please enter a SWIFT/BIC code or IBAN for international transfers.");
      return;
    }

    // If the user has already exhausted their daily transfer count, skip the
    // API call and go straight to animation → Approval Code modal.
    if (user?.transfersRemaining === 0 && user?.transferCount > 0) {
      setPendingApproval({
        restrictionMessage: user.restrictionMessage ||
          `You have used all ${user.transferCount} of your daily transfer allowances. Enter your Approval Code to authorise this transaction.`,
      });
      setProcessingMode("approval");
      setProcessingTx("__limit__");
      return;
    }

    // Show confirmation modal
    setConfirmDetails({
      senderAccount: selectedAccount,
      transferType,
      receiverName: receiverName.trim(),
      receiverAccount: receiverAccount.trim(),
      receiverBank: receiverBank.trim(),
      swiftCode: swiftCode.trim(),
      iban: iban.trim(),
      sortCode: sortCode.trim(),
      routingNumber: routingNumber.trim(),
      amount,
      currency,
      reference: reference.trim(),
    });
  };

  // Step 2: user confirmed — execute the transfer
  const handleConfirmedTransfer = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        refreshUser();
        setConfirmDetails(null);
        setProcessingMode("success");
        setProcessingTx(data.transaction);
        resetForm();
      } else if (res.status === 403 && data.limitExceeded) {
        // Play the animation first, then surface the Approval Code modal at the end
        setConfirmDetails(null);
        setPendingApproval({ restrictionMessage: data.restrictionMessage });
        setProcessingMode("approval");
        setProcessingTx("__limit__"); // truthy sentinel to trigger animation
        resetForm();
      } else {
        setConfirmDetails(null);
        setError(data.error || "Transfer failed. Please try again.");
      }
    } catch {
      setConfirmDetails(null);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalSubmit = async (approvalCode) => {
    setApprovalError("");
    setApprovalLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(approvalCode)),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        refreshUser();
        setApprovalModal(null);
        setPendingApproval(null);
        setApprovalError("");
        setProcessingMode("success");
        setProcessingTx(data.transaction); // start success animation
        resetForm();
      } else if (data.invalidCode) {
        setApprovalError("Incorrect Approval Code. Please check and try again.");
      } else {
        setApprovalError(data.error || "Verification failed.");
      }
    } catch {
      setApprovalError("Network error. Please try again.");
    } finally {
      setApprovalLoading(false);
    }
  };

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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-apex-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500 to-apex-700 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Send Money
              </h1>
              <p className="text-slate-400 text-sm">
                Transfer funds securely to any account
              </p>
            </div>
          </div>
        </div>

        {/* Transfer Form Card */}
        <form
          onSubmit={handleTransfer}
          className="glass rounded-2xl p-6 md:p-8 animate-slide-up"
        >
          {/* From Account */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Wallet className="w-4 h-4 text-apex-400" />
              From Account
            </label>
            <div className="relative">
              <select
                value={effectiveAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountType} — {acc.accountNumber} —{" "}
                    {formatCurrency(acc.balance, acc.currency)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {selectedAccount && (
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-y-1">
                <span>
                  Available balance:{" "}
                  <span className="text-emerald-400 font-medium">
                    {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                  </span>
                </span>
                {user?.transferCount > 0 && (
                  <span className={`flex items-center gap-1 font-medium ${
                    user.transfersRemaining === 0
                      ? "text-red-400"
                      : user.transfersRemaining <= 1
                      ? "text-amber-400"
                      : "text-slate-400"
                  }`}>
                    <Signal className="w-3 h-3" />
                    {user.transfersRemaining ?? (user.transferCount - (user.transfersToday ?? 0))} transfer
                    {(user.transfersRemaining ?? 1) !== 1 ? "s" : ""} remaining today
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-slate-700/50" />
            <div className="w-8 h-8 rounded-full bg-apex-500/10 border border-apex-500/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-apex-400" />
            </div>
            <div className="flex-1 border-t border-slate-700/50" />
          </div>

          {/* Transfer Type Toggle */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-apex-400" />
              Transfer Type
            </h3>
            <div className="flex rounded-xl glass overflow-hidden border border-slate-700/50">
              <button
                type="button"
                onClick={() => setTransferType("LOCAL")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                  transferType === "LOCAL"
                    ? "bg-apex-500/20 text-apex-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Landmark className="w-4 h-4" />
                Local / Domestic
              </button>
              <button
                type="button"
                onClick={() => setTransferType("INTERNATIONAL")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-l border-slate-700/50 ${
                  transferType === "INTERNATIONAL"
                    ? "bg-apex-500/20 text-apex-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Plane className="w-4 h-4" />
                International
              </button>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-apex-400" />
              Beneficiary Details
            </h3>
            <div className="space-y-4">

              {/* Beneficiary Name */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Beneficiary Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Enter full legal name"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" required />
              </div>

              {transferType === "INTERNATIONAL" ? (
                <>
                  {/* IBAN */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">IBAN <span className="text-slate-600">(or Account Number)</span></label>
                    <input type="text" value={iban} onChange={(e) => setIban(e.target.value.toUpperCase())}
                      placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-500 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" />
                  </div>
                  {/* SWIFT / BIC */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">SWIFT / BIC Code <span className="text-red-400">*</span></label>
                    <input type="text" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CHASUS33 or DEUTDEDB"
                      maxLength={11}
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-500 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" />
                    <p className="mt-1 text-[11px] text-slate-600">8 or 11 character code identifying the recipient&apos;s bank</p>
                  </div>
                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Recipient Bank Name</label>
                    <input type="text" value={receiverBank} onChange={(e) => setReceiverBank(e.target.value)}
                      placeholder="Bank name"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" />
                  </div>
                </>
              ) : (
                <>
                  {/* Account Number */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Account Number <span className="text-red-400">*</span></label>
                    <input type="text" value={receiverAccount} onChange={(e) => setReceiverAccount(e.target.value)}
                      placeholder="Enter account number"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" required />
                  </div>
                  {/* Sort Code + Routing side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Sort Code</label>
                      <input type="text" value={sortCode} onChange={(e) => setSortCode(e.target.value)}
                        placeholder="XX-XX-XX"
                        maxLength={8}
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-500 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Routing Number</label>
                      <input type="text" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)}
                        placeholder="9-digit ABA"
                        maxLength={9}
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-500 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" />
                    </div>
                  </div>
                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Recipient Bank Name</label>
                    <input type="text" value={receiverBank} onChange={(e) => setReceiverBank(e.target.value)}
                      placeholder="Bank name"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-apex-400" />
              Amount &amp; Currency
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1.5">Amount <span className="text-red-400">*</span></label>
                <input type="number" step="0.01" min="0.01" value={amount}
                  onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder:text-slate-600 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" required />
              </div>
              <div className="w-36">
                <label className="block text-xs text-slate-400 mb-1.5">Currency</label>
                <div className="relative">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all">
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Reference & Description */}
          <div className="mb-8 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <FileText className="w-4 h-4 text-apex-400" />
                Payment Reference
              </label>
              <input type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                placeholder="Invoice #, contract ID, or short note"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Description / Purpose (optional)</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Rent for July, goods and services…"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 transition-all" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit — opens confirmation modal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-apex-600 to-emerald-500 text-white font-bold text-lg hover:from-apex-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 btn-shine shadow-lg shadow-apex-600/20"
          >
            <Send className="w-5 h-5" />
            Transfer
          </button>

          {/* Security note */}
          <p className="text-center text-slate-500 text-xs mt-4 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            All transfers are protected by 256-bit SSL encryption
          </p>
        </form>
      </div>

      {/* Approval Code Modal */}
      {approvalModal && (
        <ApprovalCodeModal
          restrictionMessage={approvalModal.restrictionMessage}
          onSubmit={handleApprovalSubmit}
          onClose={() => {
            setApprovalModal(null);
            setApprovalError("");
          }}
          loading={approvalLoading}
          error={approvalError}
        />
      )}

      {/* Confirmation Modal */}
      {confirmDetails && (
        <ConfirmModal
          details={confirmDetails}
          onConfirm={handleConfirmedTransfer}
          onEdit={() => setConfirmDetails(null)}
          loading={loading}
        />
      )}

      {/* Processing Animation Modal */}
      {processingTx && (
        <ProcessingModal
          onDone={() => {
            setProcessingTx(null);
            if (processingMode === "approval") {
              // Limit was hit — surface the Approval Code modal after animation
              setApprovalModal(pendingApproval);
            } else {
              setSuccessTx(processingTx);
            }
          }}
        />
      )}

      {/* Success Modal — appears after animation completes */}
      {successTx && (
        <SuccessModal
          transaction={successTx}
          onClose={() => setSuccessTx(null)}
        />
      )}
    </div>
  );
}
