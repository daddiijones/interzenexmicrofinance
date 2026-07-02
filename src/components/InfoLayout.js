import Link from "next/link";
import { Shield, Zap, ArrowLeft } from "lucide-react";

export default function InfoLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-apex-500/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-apex-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-apex-500/25">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold gradient-text">Interzenex Microfinance</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="gradient-text">{title}</span>
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4 text-center">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} interzenexmicrofinance.online · All rights reserved
        </p>
      </footer>
    </div>
  );
}
