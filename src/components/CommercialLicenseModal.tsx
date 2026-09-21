import React, { useState } from "react";
import { SecondaryActionButton } from "./ui/SecondaryActionButton";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Bell,
  RefreshCw,
  X,
  Lock,
  Unlock,
  Check,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

interface CommercialLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCommercialActive: boolean;
  onToggleCommercialStatus: (active: boolean) => void;
}

export const CommercialLicenseModal: React.FC<CommercialLicenseModalProps> = ({
  isOpen,
  onClose,
  isCommercialActive,
  onToggleCommercialStatus,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"public" | "commercial">(
    isCommercialActive ? "commercial" : "public"
  );
  const [notificationEmail, setNotificationEmail] = useState<string>("dev@1without.io");
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(true);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleActivatePass = () => {
    onToggleCommercialStatus(true);
    setSelectedPlan("commercial");
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1200);
  };

  const handleSwitchToPublic = () => {
    onToggleCommercialStatus(false);
    setSelectedPlan("public");
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="commercial-license-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="commercial-license-modal"
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Commercial Access & Governance Licensing
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Flat-rate governance hub access for developers, agencies, and builders. Transparent flat pricing with zero per-user lock-ins.
            </p>
          </div>
          <button
            id="close-commercial-license-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save confirmation toast */}
        {saveToast && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Licensing tier preference saved. Dashboard privileges updated.</span>
          </div>
        )}

        {/* Current Active Badge */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isCommercialActive ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"
              }`}
            />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Current Environment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isCommercialActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {isCommercialActive ? "Commercial Access Active" : "Public / Visitor Mode"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isCommercialActive
                  ? "Unlimited project portfolio tracking, full dossier generation, and 180-day automated review cadence active."
                  : "On-demand single URL scanner mode. Upgrade to track multi-repo fleets."}
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
            Pass ID: <span className="text-slate-200">CAP-2026-8849</span>
          </div>
        </div>

        {/* 2-Tier Comparison Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          {/* Plan 1: Public / Visitor Mode */}
          <div
            onClick={() => setSelectedPlan("public")}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 cursor-pointer ${
              selectedPlan === "public"
                ? "bg-slate-950/80 border-cyan-500/50 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/40"
                : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                  Public / Visitor Mode
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                  Free Forever
                </span>
              </div>

              <div className="mt-2">
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400 ml-1">/ on-demand</span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Single-target instantaneous pre-flight scan for any live web app or PWA without registration.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Free on-demand 6-Pillar Instant Scan for any single URL</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Live HTTP Security Header Inspection (CSP, HSTS, XFO)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Basic DOM & Web App Manifest detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Immediate remediation instruction directives</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSwitchToPublic();
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                !isCommercialActive
                  ? "bg-slate-800 text-slate-300 border-slate-700"
                  : "bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/30"
              }`}
            >
              {!isCommercialActive ? "Currently Selected" : "Use Free Scanner Mode"}
            </button>
          </div>

          {/* Plan 2: Commercial Access Pass */}
          <div
            onClick={() => setSelectedPlan("commercial")}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 cursor-pointer relative ${
              selectedPlan === "commercial"
                ? "bg-slate-950/90 border-emerald-500/60 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
              Single-Source Governance
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  Commercial Access Pass
                </span>
              </div>

              <div className="mt-2">
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-xs text-slate-400 ml-1">/ 6-Month Pass</span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Flat-rate semi-annual tool for developers, agencies, and builders. Automatic 14-day renewal notice with simple cancel anytime.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-semibold">Unlimited projects</span> in 3-Phase Lifecycle Registry
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Dual-track GitHub Repositories & Live Web addresses</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Full Launch Certification Dossier with SHA256 integrity signature</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automated 30 / 60 / 90 / 180-Day Maintenance Cadence Engine</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Media & Claims Discernment Engine ("Trope Buster")</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Defense-of-Break Passcode Isolation Gate for protected IP</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleActivatePass();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors cursor-pointer shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5"
            >
              {isCommercialActive ? "Commercial Pass Active (Refresh)" : "Activate Commercial Pass ($29 / 6-Mo)"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cadence Notification & Renewal Settings */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>14-Day Cadence & Renewal Notification Dispatcher</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
              <input
                type="checkbox"
                checked={notificationEnabled}
                onChange={(e) => setNotificationEnabled(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="operator@yourcompany.com"
              disabled={!notificationEnabled}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                setSaveToast(true);
                setTimeout(() => setSaveToast(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
            >
              Save Notification Target
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            Dispatches automated alerts 14 days prior to semi-annual pass renewal and upon 30/60/90/180-day operational review deadlines. No unsolicited marketing emails.
          </p>
        </div>

        {/* Modal Action Bar with WCAG AA Secondary Action */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <SecondaryActionButton
            onCancelOrBack={onClose}
          >
            Cancel / Back
          </SecondaryActionButton>
        </div>
      </div>
    </div>
  );
};
