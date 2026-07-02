"use client";

import { useState } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import {
  CreditCard,
  Snowflake,
  Sun,
  Globe,
  Plane,
  Shield,
  Wifi,
  ChevronRight,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function CardsPage() {
  const user = useAuthUser();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [internationalUsage, setInternationalUsage] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(2000);
  const [showCvv, setShowCvv] = useState(false);
  const [requestingCard, setRequestingCard] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const cardData = {
    number: "**** **** **** 4532",
    fullNumber: "5234 8901 2345 4532",
    holder: user?.name || "Card Holder",
    expiry: "09/28",
    cvv: "847",
    type: "VISA",
    cardType: "Platinum Debit",
  };

  const handleRequestCard = () => {
    setRequestingCard(true);
    setTimeout(() => {
      setRequestingCard(false);
      setRequestSuccess(true);
      setTimeout(() => setRequestSuccess(false), 4000);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="glass rounded-2xl p-8 text-center">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading card details...</p>
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
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            Card Management
          </h1>
          <p className="text-slate-400 ml-[52px]">
            View, manage, and control your banking cards
          </p>
        </div>

        {/* Card Display Section */}
        <div className="glass rounded-2xl p-6 sm:p-8 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {cardData.cardType}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isFrozen
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {isFrozen ? "FROZEN" : "ACTIVE"}
            </span>
          </div>

          {/* 3D Card */}
          <div className="flex justify-center mb-8">
            <div
              className="relative w-full max-w-[420px] cursor-pointer"
              style={{ perspective: "1200px" }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className="relative w-full aspect-[1.6/1] transition-transform duration-700"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front of Card */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900" />

                  {/* Pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 20px,
                        rgba(255,255,255,0.1) 20px,
                        rgba(255,255,255,0.1) 21px
                      )`,
                    }}
                  />

                  {/* Glossy sheen */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)",
                    }}
                  />

                  {/* Accent gradient strip */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-apex-500 via-emerald-400 to-apex-600" />

                  {/* Card Content - Front */}
                  <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-between">
                    {/* Top Row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] tracking-[0.3em] text-slate-400 uppercase font-medium">
                          Interzenex Microfinance
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">
                          {cardData.cardType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-slate-400 rotate-90" />
                      </div>
                    </div>

                    {/* Chip */}
                    <div className="my-2">
                      <div className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-300/80 to-amber-500/60 border border-amber-400/30 flex items-center justify-center">
                        <div className="w-8 h-6 rounded-sm border border-amber-400/40 grid grid-cols-2 grid-rows-2 gap-[1px]">
                          <div className="bg-amber-400/30 rounded-tl-sm" />
                          <div className="bg-amber-400/20 rounded-tr-sm" />
                          <div className="bg-amber-400/20 rounded-bl-sm" />
                          <div className="bg-amber-400/30 rounded-br-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div>
                      <p className="text-xl sm:text-2xl font-mono text-white tracking-[0.15em] mb-4">
                        {cardData.number}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] tracking-wider text-slate-500 uppercase mb-0.5">
                          Card Holder
                        </p>
                        <p className="text-sm font-medium text-slate-200 tracking-wide uppercase">
                          {cardData.holder}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] tracking-wider text-slate-500 uppercase mb-0.5">
                          Expires
                        </p>
                        <p className="text-sm font-medium text-slate-200">
                          {cardData.expiry}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white italic tracking-widest">
                          {cardData.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Frozen overlay */}
                  {isFrozen && (
                    <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-20">
                      <div className="text-center">
                        <Snowflake className="w-10 h-10 text-blue-300 mx-auto mb-2 animate-pulse-soft" />
                        <p className="text-blue-200 text-sm font-semibold">
                          Card Frozen
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back of Card */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800" />

                  {/* Pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 15px,
                        rgba(255,255,255,0.08) 15px,
                        rgba(255,255,255,0.08) 16px
                      )`,
                    }}
                  />

                  {/* Glossy sheen */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(225deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
                    }}
                  />

                  {/* Back Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Magnetic Strip */}
                    <div className="mt-8 h-12 bg-slate-950/80 w-full" />

                    {/* Signature Strip + CVV */}
                    <div className="px-6 sm:px-8 mt-5 flex items-center gap-4">
                      <div className="flex-1 h-10 bg-slate-200/90 rounded-sm flex items-center px-3">
                        <div className="flex-1">
                          <div className="h-[1px] bg-slate-400/50 mb-1.5" />
                          <div className="h-[1px] bg-slate-400/50 mb-1.5" />
                          <div className="h-[1px] bg-slate-400/50" />
                        </div>
                      </div>
                      <div className="bg-white rounded-sm px-4 py-2 flex items-center gap-2">
                        <span className="text-slate-800 font-mono text-lg font-bold tracking-wider">
                          {showCvv ? cardData.cvv : "***"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCvv(!showCvv);
                          }}
                          className="text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          {showCvv ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Bank Info */}
                    <div className="mt-auto px-6 sm:px-8 pb-6 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] text-slate-500 leading-relaxed max-w-[200px]">
                          This card is property of Interzenex Microfinance. If found, please
                          return to the nearest branch or call customer support.
                        </p>
                      </div>
                      <div className="text-right">
                        <Lock className="w-4 h-4 text-slate-500 ml-auto mb-1" />
                        <p className="text-[8px] text-slate-500">
                          Secured by Interzenex
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Click hint */}
              <p className="text-center text-slate-500 text-xs mt-4">
                Click card to {isFlipped ? "see front" : "reveal back"}
              </p>
            </div>
          </div>
        </div>

        {/* Card Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Freeze / Unfreeze */}
          <div
            className="glass rounded-2xl p-6 card-hover animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center gap-3 mb-4">
              {isFrozen ? (
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Snowflake className="w-5 h-5 text-blue-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-emerald-400" />
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold">
                  {isFrozen ? "Unfreeze Card" : "Freeze Card"}
                </h3>
                <p className="text-slate-400 text-xs">
                  {isFrozen
                    ? "Re-enable all card transactions"
                    : "Temporarily disable all card transactions"}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => setIsFrozen(!isFrozen)}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                isFrozen
                  ? "bg-blue-500 focus:ring-blue-500"
                  : "bg-slate-600 focus:ring-slate-500"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center ${
                  isFrozen ? "left-9" : "left-1"
                }`}
              >
                {isFrozen ? (
                  <Snowflake className="w-3 h-3 text-blue-500" />
                ) : (
                  <Sun className="w-3 h-3 text-slate-400" />
                )}
              </div>
            </button>
          </div>

          {/* International Usage */}
          <div
            className="glass rounded-2xl p-6 card-hover animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  internationalUsage ? "bg-purple-500/20" : "bg-slate-600/20"
                }`}
              >
                {internationalUsage ? (
                  <Globe className="w-5 h-5 text-purple-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  International Usage
                </h3>
                <p className="text-slate-400 text-xs">
                  {internationalUsage
                    ? "Card enabled for international transactions"
                    : "International transactions disabled"}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInternationalUsage(!internationalUsage)}
                className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  internationalUsage
                    ? "bg-purple-500 focus:ring-purple-500"
                    : "bg-slate-600 focus:ring-slate-500"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center ${
                    internationalUsage ? "left-9" : "left-1"
                  }`}
                >
                  {internationalUsage ? (
                    <Plane className="w-3 h-3 text-purple-500" />
                  ) : (
                    <Globe className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </button>
              {internationalUsage && (
                <span className="text-[10px] text-slate-500">
                  Active in 180+ countries
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Daily Limit Slider */}
        <div
          className="glass rounded-2xl p-6 mb-6 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Daily Spending Limit</h3>
              <p className="text-slate-400 text-xs">
                Set maximum daily card spending amount
              </p>
            </div>
          </div>

          {/* Amount Display */}
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-white">
              ${dailyLimit.toLocaleString()}
              <span className="text-lg text-slate-500 font-normal">.00</span>
            </p>
            <p className="text-slate-500 text-sm mt-1">per day</p>
          </div>

          {/* Slider */}
          <div className="relative mb-4">
            <input
              type="range"
              min="100"
              max="25000"
              step="100"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${
                  ((dailyLimit - 100) / (25000 - 100)) * 100
                }%, #334155 ${
                  ((dailyLimit - 100) / (25000 - 100)) * 100
                }%, #334155 100%)`,
              }}
            />
          </div>

          {/* Slider Labels */}
          <div className="flex justify-between text-xs text-slate-500">
            <span>$100</span>
            <span>$5,000</span>
            <span>$10,000</span>
            <span>$15,000</span>
            <span>$25,000</span>
          </div>

          {/* Quick Select */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[500, 1000, 2000, 5000, 10000].map((amount) => (
              <button
                key={amount}
                onClick={() => setDailyLimit(amount)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  dailyLimit === amount
                    ? "bg-apex-600 text-white shadow-lg shadow-apex-600/25"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                ${amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Card Security Info */}
        <div
          className="glass rounded-2xl p-6 mb-6 animate-slide-up"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Security Features</h3>
              <p className="text-slate-400 text-xs">
                Your card is protected with advanced security
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "3D Secure",
                desc: "Online transaction verification",
                active: true,
              },
              {
                label: "Fraud Detection",
                desc: "AI-powered monitoring",
                active: true,
              },
              {
                label: "Instant Alerts",
                desc: "Real-time notifications",
                active: true,
              },
            ].map((feature) => (
              <div
                key={feature.label}
                className="glass-light rounded-xl p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {feature.label}
                  </p>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request New Card */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            onClick={handleRequestCard}
            disabled={requestingCard}
            className="w-full glass rounded-2xl p-6 text-left group hover:border-apex-500/30 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-apex-500 to-apex-700 flex items-center justify-center btn-shine">
                  {requestingCard ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {requestingCard
                      ? "Processing Request..."
                      : "Request New Card"}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Order a replacement or additional card
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-apex-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </button>

          {/* Success Message */}
          {requestSuccess && (
            <div className="mt-4 glass rounded-xl p-4 border border-emerald-500/30 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-emerald-400 font-medium text-sm">
                  Card request submitted successfully!
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Your new card will arrive within 5-7 business days.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* Custom range slider styles */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #15803d);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.4),
            0 0 20px rgba(34, 197, 94, 0.2);
          transition: box-shadow 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.6),
            0 0 30px rgba(34, 197, 94, 0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #15803d);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
        }
      `}</style>
    </div>
  );
}
