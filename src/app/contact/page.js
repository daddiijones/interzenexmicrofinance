"use client";

import { useState } from "react";
import InfoLayout from "@/components/InfoLayout";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: "Email Support",
    value: "support@interzenexmicrofinance.online",
    detail: "We reply within 24 hours",
    href: "mailto:support@interzenexmicrofinance.online",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (800) 429-7386",
    detail: "Mon–Fri, 9am–6pm EST",
    href: "tel:+18004297386",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "350 Fifth Avenue, New York, NY 10118",
    detail: "United States",
    href: null,
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "24 / 7 Online Support",
    detail: "Phone support Mon–Fri",
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function update(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // In production this would POST to a contact API
    setSent(true);
  }

  const inputClass =
    "w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-apex-500/40 focus:border-apex-500/40 transition-all";

  return (
    <InfoLayout
      title="Contact Us"
      subtitle="Have a question, concern, or need help? We're always happy to hear from you."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-6">Get in touch</h2>
          {CONTACT_METHODS.map((c) => {
            const Icon = c.icon;
            const inner = (
              <div className="glass rounded-2xl p-5 flex items-start gap-4 group transition-all hover:border-apex-500/20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apex-500/20 to-emerald-500/20 flex items-center justify-center shrink-0 group-hover:from-apex-500/30 group-hover:to-emerald-500/30 transition-colors">
                  <Icon className="w-5 h-5 text-apex-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{c.label}</p>
                  <p className="text-sm font-semibold text-slate-100">{c.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.detail}</p>
                </div>
              </div>
            );
            return c.href ? (
              <a key={c.label} href={c.href} className="block">{inner}</a>
            ) : (
              <div key={c.label}>{inner}</div>
            );
          })}
        </div>

        {/* Contact form */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Send a message</h2>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Message sent!</h3>
              <p className="text-slate-400 text-sm max-w-xs">
                Thank you for reaching out. Our support team will reply to{" "}
                <span className="text-slate-300">{form.email}</span> within 24 hours.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="mt-2 text-xs text-apex-400 hover:text-apex-300 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
                  <input type="text" required placeholder="John Doe" value={form.name} onChange={update("name")} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Email Address</label>
                  <input type="email" required placeholder="you@example.com" value={form.email} onChange={update("email")} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Subject</label>
                <input type="text" required placeholder="How can we help?" value={form.subject} onChange={update("subject")} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Message</label>
                <textarea required rows={5} placeholder="Tell us more about your query…" value={form.message} onChange={update("message")} className={`${inputClass} resize-none`} />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-apex-600 to-emerald-500 text-white font-semibold hover:from-apex-500 hover:to-emerald-400 transition-all btn-shine flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
              <p className="text-center text-xs text-slate-600">
                Or email us directly at{" "}
                <a href="mailto:support@interzenexmicrofinance.online" className="text-apex-400 hover:text-apex-300 transition-colors">
                  support@interzenexmicrofinance.online
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </InfoLayout>
  );
}
