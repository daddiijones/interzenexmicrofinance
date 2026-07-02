"use client";

import { useState, useEffect } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import { getCurrencySymbol } from "@/lib/currencies";
import {
  Mail,
  MailOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Shield,
  Loader2,
  Inbox,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Building2,
  CreditCard,
  FileText,
} from "lucide-react";

function generateEmailFromTransaction(tx, userAccountNumbers) {
  const isSender = userAccountNumbers.includes(tx.senderAccountNumber);
  const isDebit = isSender;
  const amount = tx.amount?.toFixed(2) || "0.00";
  const currency = tx.currency || "USD";
  const currencySymbol = getCurrencySymbol(currency);

  const otherParty = isDebit
    ? tx.receiverName || "Unknown"
    : tx.senderName || "Unknown";

  const subject = isDebit
    ? `Debit Alert: ${currencySymbol}${amount} sent to ${otherParty}`
    : `Credit Alert: ${currencySymbol}${amount} received from ${otherParty}`;

  const preview = isDebit
    ? `A debit transaction of ${currencySymbol}${amount} has been processed from your account.`
    : `You have received ${currencySymbol}${amount} into your account.`;

  return {
    id: tx.id,
    subject,
    preview,
    isDebit,
    amount,
    currency,
    currencySymbol,
    otherParty,
    description: tx.description || "Bank Transfer",
    date: tx.createdAt,
    status: tx.status,
    type: tx.type,
    senderAccount: tx.senderAccountNumber,
    receiverAccount: tx.receiverAccountNumber,
    receiverBank: tx.receiverBank || "Interzenex Microfinance",
    convertedAmount: tx.convertedAmount,
    conversionRate: tx.conversionRate,
    read: false,
  };
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EmailsPage() {
  const user = useAuthUser();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readEmails, setReadEmails] = useState(new Set());
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchTransactions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/transactions?userId=${user.id}`);
        const data = await res.json();

        if (data.success && data.transactions) {
          const userAccounts = user.accounts
            ? user.accounts.map((a) => a.accountNumber)
            : [user.accountNumber];

          const emailList = data.transactions.map((tx) =>
            generateEmailFromTransaction(tx, userAccounts)
          );

          setEmails(emailList);
          if (emailList.length > 0) {
            setSelectedEmail(emailList[0]);
            setReadEmails(new Set([emailList[0].id]));
          }
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user]);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setReadEmails((prev) => new Set([...prev, email.id]));
    setShowMobileDetail(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="glass rounded-2xl p-8 text-center">
          <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = emails.filter((e) => !readEmails.has(e.id)).length;

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500 to-apex-700 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            Email Notifications
          </h1>
          <p className="text-slate-400 ml-[52px]">
            Transaction alerts and banking notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-apex-600/20 text-apex-400 rounded-full text-xs font-semibold">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="glass rounded-2xl flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-apex-400 animate-spin" />
          </div>
        ) : emails.length === 0 ? (
          <div className="glass rounded-2xl flex flex-col items-center justify-center py-32">
            <Inbox className="w-20 h-20 text-slate-700 mb-4" />
            <p className="text-slate-400 text-lg font-medium">
              No notifications yet
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Transaction alerts will appear here
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden animate-slide-up">
            <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
              {/* Left Panel - Email List */}
              <div
                className={`w-full md:w-[380px] lg:w-[420px] border-r border-slate-700/30 flex flex-col shrink-0 ${
                  showMobileDetail ? "hidden md:flex" : "flex"
                }`}
              >
                {/* List Header */}
                <div className="px-5 py-4 border-b border-slate-700/30 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">
                      Inbox
                    </span>
                    <span className="text-xs text-slate-500">
                      ({emails.length})
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 bg-apex-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                {/* Email List */}
                <div className="flex-1 overflow-y-auto">
                  {emails.map((email) => {
                    const isRead = readEmails.has(email.id);
                    const isSelected = selectedEmail?.id === email.id;

                    return (
                      <button
                        key={email.id}
                        onClick={() => handleSelectEmail(email)}
                        className={`w-full text-left px-5 py-4 border-b border-slate-800/50 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-apex-950/40 border-l-2 border-l-apex-500"
                            : "hover:bg-slate-800/30 border-l-2 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Unread Dot */}
                          <div className="mt-2 shrink-0">
                            {!isRead ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-apex-500 shadow-lg shadow-apex-500/30" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                            )}
                          </div>

                          {/* Icon */}
                          <div
                            className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              email.isDebit
                                ? "bg-red-500/10"
                                : "bg-emerald-500/10"
                            }`}
                          >
                            {email.isDebit ? (
                              <ArrowUpRight className="w-4 h-4 text-red-400" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm truncate ${
                                  !isRead
                                    ? "text-white font-semibold"
                                    : "text-slate-300 font-medium"
                                }`}
                              >
                                {email.subject}
                              </p>
                              <span className="text-[10px] text-slate-500 shrink-0">
                                {formatDate(email.date)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-1">
                              {email.preview}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel - Email Content */}
              <div
                className={`flex-1 flex flex-col min-w-0 ${
                  !showMobileDetail ? "hidden md:flex" : "flex"
                }`}
              >
                {selectedEmail ? (
                  <>
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setShowMobileDetail(false)}
                      className="md:hidden px-5 py-3 border-b border-slate-700/30 flex items-center gap-2 text-apex-400 text-sm font-medium hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back to inbox
                    </button>

                    {/* Email Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="max-w-3xl mx-auto p-6 sm:p-8">
                        {/* Email Header */}
                        <div className="mb-8">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                selectedEmail.isDebit
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-emerald-500/15 text-emerald-400"
                              }`}
                            >
                              {selectedEmail.isDebit ? "Debit" : "Credit"} Alert
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                              <Clock className="w-3 h-3" />
                              {formatFullDate(selectedEmail.date)}
                            </div>
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {selectedEmail.subject}
                          </h2>
                        </div>

                        {/* Simulated Email Card */}
                        <div className="rounded-2xl overflow-hidden border border-slate-700/40">
                          {/* Bank Header */}
                          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 border-b border-slate-700/30">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500 to-apex-700 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-white font-bold text-lg">
                                  Interzenex Microfinance
                                </h3>
                                <p className="text-slate-400 text-xs">
                                  Secure Transaction Notification
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Notification Type */}
                          <div
                            className={`px-6 py-4 border-b border-slate-700/30 ${
                              selectedEmail.isDebit
                                ? "bg-red-950/20"
                                : "bg-emerald-950/20"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  selectedEmail.isDebit
                                    ? "bg-red-500/20"
                                    : "bg-emerald-500/20"
                                }`}
                              >
                                {selectedEmail.isDebit ? (
                                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                                ) : (
                                  <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                                )}
                              </div>
                              <div>
                                <h4
                                  className={`font-semibold text-lg ${
                                    selectedEmail.isDebit
                                      ? "text-red-400"
                                      : "text-emerald-400"
                                  }`}
                                >
                                  {selectedEmail.isDebit
                                    ? "Debit Notification"
                                    : "Credit Notification"}
                                </h4>
                                <p className="text-slate-400 text-sm">
                                  {selectedEmail.isDebit
                                    ? "A debit transaction has been processed on your account"
                                    : "A credit has been received into your account"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Amount Highlight */}
                          <div className="px-6 py-6 border-b border-slate-700/30 text-center bg-slate-900/40">
                            <p className="text-slate-400 text-sm mb-1">
                              Transaction Amount
                            </p>
                            <p
                              className={`text-4xl font-bold ${
                                selectedEmail.isDebit
                                  ? "text-red-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {selectedEmail.isDebit ? "-" : "+"}
                              {selectedEmail.currencySymbol}
                              {parseFloat(selectedEmail.amount).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">
                              {selectedEmail.currency}
                            </p>
                          </div>

                          {/* Transaction Details Table */}
                          <div className="px-6 py-5 border-b border-slate-700/30 bg-slate-900/20">
                            <h5 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              Transaction Details
                            </h5>

                            <div className="space-y-3">
                              {[
                                {
                                  label: "Date & Time",
                                  value: formatFullDate(selectedEmail.date),
                                },
                                {
                                  label: "Amount",
                                  value: `${selectedEmail.currencySymbol}${parseFloat(selectedEmail.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${selectedEmail.currency}`,
                                },
                                {
                                  label: "Type",
                                  value:
                                    selectedEmail.type
                                      ?.replace("_", " ")
                                      .charAt(0)
                                      .toUpperCase() +
                                    selectedEmail.type
                                      ?.replace("_", " ")
                                      .slice(1)
                                      .toLowerCase(),
                                },
                                {
                                  label: "Description",
                                  value: selectedEmail.description,
                                },
                                {
                                  label: selectedEmail.isDebit
                                    ? "To Account"
                                    : "From Account",
                                  value: selectedEmail.isDebit
                                    ? `${selectedEmail.receiverAccount} (${selectedEmail.receiverBank})`
                                    : selectedEmail.senderAccount || "External",
                                },
                                {
                                  label: "Status",
                                  value: selectedEmail.status,
                                  badge: true,
                                },
                                ...(selectedEmail.conversionRate &&
                                selectedEmail.conversionRate !== 1
                                  ? [
                                      {
                                        label: "Conversion Rate",
                                        value: `1:${selectedEmail.conversionRate}`,
                                      },
                                      {
                                        label: "Converted Amount",
                                        value: `${selectedEmail.convertedAmount?.toFixed(2)}`,
                                      },
                                    ]
                                  : []),
                              ].map((row) => (
                                <div
                                  key={row.label}
                                  className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0"
                                >
                                  <span className="text-sm text-slate-400">
                                    {row.label}
                                  </span>
                                  {row.badge ? (
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                        row.value === "COMPLETED"
                                          ? "bg-emerald-500/15 text-emerald-400"
                                          : row.value === "PENDING"
                                          ? "bg-amber-500/15 text-amber-400"
                                          : "bg-red-500/15 text-red-400"
                                      }`}
                                    >
                                      {row.value}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-white font-medium text-right max-w-[60%] break-words">
                                      {row.value}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Security Footer */}
                          <div className="px-6 py-4 bg-slate-900/60">
                            <div className="flex items-start gap-3">
                              <Shield className="w-5 h-5 text-apex-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  <span className="text-white font-medium">
                                    Security Notice:
                                  </span>{" "}
                                  If you did not authorize this transaction,
                                  please contact Interzenex Microfinance Support immediately
                                  or freeze your card in the Cards section. Do
                                  not share your banking credentials with anyone.
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] text-slate-500">
                                  Verified by Interzenex Security
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-600">
                                Ref: TXN-{selectedEmail.id?.toString().padStart(8, "0")}
                              </span>
                            </div>
                          </div>

                          {/* Email footer */}
                          <div className="px-6 py-3 bg-slate-950/50 text-center">
                            <p className="text-[10px] text-slate-600">
                              This is an automated notification from Interzenex Microfinance.
                              Please do not reply to this email. For inquiries,
                              visit our Support Center or call 1-800-APEX-BANK.
                            </p>
                            <p className="text-[10px] text-slate-700 mt-1">
                              © 2026 interzenexmicrofinance.online. All rights reserved. Member
                              FDIC.
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-6 flex items-center gap-3">
                          {selectedEmail.isDebit && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors">
                              <AlertTriangle className="w-4 h-4" />
                              Report Issue
                            </button>
                          )}
                          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-300 border border-slate-700/50 rounded-lg text-sm font-medium hover:bg-slate-700/50 transition-colors">
                            <CreditCard className="w-4 h-4" />
                            View Card
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MailOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg font-medium">
                        Select an email to read
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        Choose a notification from the list
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
