"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import {
  Headphones,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Inbox,
  ShieldCheck,
} from "lucide-react";

export default function SupportPage() {
  const user = useAuthUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [expandedTicket, setExpandedTicket] = useState(null);

  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/support?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    async function loadTickets() {
      try {
        setLoading(true);
        const res = await fetch(`/api/support?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setTickets(data.tickets || []);
        }
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        setSubject("");
        setMessage("");
        fetchTickets();
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        setSubmitError(data.error || "Failed to create ticket");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="glass rounded-2xl p-8 text-center">
          <Headphones className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading support center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500 to-apex-700 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            Support Center
          </h1>
          <p className="text-slate-400 ml-[52px]">
            Get help with your account or report issues
          </p>
        </div>

        {/* New Ticket Form */}
        <div className="glass rounded-2xl p-6 sm:p-8 mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Create New Ticket
              </h2>
              <p className="text-slate-400 text-xs">
                Describe your issue and our team will respond shortly
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all duration-200"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/50 focus:border-apex-500/50 transition-all duration-200 resize-none"
                required
              />
            </div>

            {/* Error */}
            {submitError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            {/* Success */}
            {submitSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Ticket submitted successfully! We&apos;ll respond soon.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !message.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-apex-600 to-apex-700 text-white rounded-xl font-medium hover:from-apex-500 hover:to-apex-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-shine shadow-lg shadow-apex-600/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Tickets */}
        <div
          className="glass rounded-2xl p-6 sm:p-8 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-apex-500/20 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-apex-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Your Tickets</h2>
              <p className="text-slate-400 text-xs">
                {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-apex-400 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">
                No support tickets yet
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Create a new ticket above if you need help
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket, index) => {
                const isExpanded = expandedTicket === ticket.id;
                const isOpen = ticket.status === "OPEN";

                return (
                  <div
                    key={ticket.id}
                    className="glass-light rounded-xl overflow-hidden transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                  >
                    {/* Ticket Header */}
                    <button
                      onClick={() =>
                        setExpandedTicket(isExpanded ? null : ticket.id)
                      }
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isOpen ? "bg-amber-400 animate-pulse-soft" : "bg-emerald-400"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-white font-medium text-sm truncate">
                              {ticket.subject}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                isOpen
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1 truncate">
                            {ticket.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock className="w-3 h-3" />
                          {formatDate(ticket.createdAt)}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-slate-700/30 animate-fade-in">
                        {/* Date on mobile */}
                        <div className="sm:hidden flex items-center gap-1.5 text-slate-500 text-xs mt-3 mb-3">
                          <Clock className="w-3 h-3" />
                          {formatDate(ticket.createdAt)}
                        </div>

                        {/* Your Message */}
                        <div className="mt-4">
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                            Your Message
                          </p>
                          <div className="bg-slate-800/40 rounded-lg p-4 border-l-2 border-slate-600">
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {ticket.message}
                            </p>
                          </div>
                        </div>

                        {/* Admin Reply */}
                        {ticket.status === "RESOLVED" && ticket.adminReply && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-apex-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3" />
                              Support Response
                            </p>
                            <div className="bg-apex-950/40 rounded-lg p-4 border-l-2 border-apex-500/50 border border-apex-500/10">
                              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                {ticket.adminReply}
                              </p>
                              <p className="text-apex-400/60 text-xs mt-3 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Resolved by Interzenex Microfinance Support Team
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Pending note for open tickets */}
                        {isOpen && (
                          <div className="mt-4 flex items-center gap-2 text-amber-400/70 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Awaiting response from our support team. Average
                              response time: 2-4 hours.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
