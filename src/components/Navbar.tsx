import React from "react";
import { TabType, ActiveTab, SecurityClearance } from "../types";
import {
  Zap,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Home,
  Layers,
  History,
  CheckCircle2,
  CreditCard,
  Award,
} from "lucide-react";

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  securityClearance?: SecurityClearance | null;
  onOpenDefenseModal?: () => void;
  onOpenDefenseGate?: () => void;
  isCommercialActive?: boolean;
  onOpenCommercialModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  securityClearance,
  onOpenDefenseModal,
  onOpenDefenseGate,
  isCommercialActive = true,
  onOpenCommercialModal,
}) => {
  const openDefense = onOpenDefenseGate || onOpenDefenseModal || (() => setActiveTab("defense-gate"));

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    {
      id: "registry",
      label: "Fleet Registry",
      icon: Layers,
      description: "3-Phase Lifecycle Board & Portfolio Matrix",
    },
    {
      id: "overview",
      label: "Mission Control",
      icon: Home,
      description: "Governance endpoints & SOP pipeline",
    },
    {
      id: "discern",
      label: "Discern",
      icon: Sparkles,
      description: "Trope Buster / YouTube & Pitch Hole-Testing",
    },
    {
      id: "qa-matrix",
      label: "QA Matrix",
      icon: ShieldCheck,
      description: "6-Pillar QA Inspection",
    },
    {
      id: "defense-gate",
      label: "Defense Gate",
      icon: ShieldAlert,
      description: "Safe-State & Tenant Isolation checks",
    },
    {
      id: "audit-history",
      label: "Audit History",
      icon: History,
      description: "Verified logs & PDF reports",
    },
  ];

  return (
    <header
      id="governance-hub-header"
      className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200/90 text-slate-900 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="brand-logo-container"
            onClick={() => setActiveTab("registry")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  1WithOut
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Governance Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Universal Production Launch & Governance Command Center
              </p>
            </div>
          </div>

          {/* Center Nav Tabs - 6 Pillars Lineup */}
          <nav id="main-navigation-tabs" className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === "overview" && activeTab === "cover") ||
                (item.id === "qa-matrix" && (activeTab === "audit" || activeTab === "shipworthy")) ||
                ((item.id === "registry" || item.id === "clearance") && (activeTab === "registry" || activeTab === "clearance")) ||
                (item.id === "defense-gate" && activeTab === "defense");

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    if (item.id === "defense-gate") {
                      openDefense();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  title={item.description}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? item.id === "defense-gate"
                        ? "bg-white text-rose-800 shadow-xs border border-slate-200/80 font-bold"
                        : "bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? item.id === "defense-gate"
                          ? "text-rose-600"
                          : "text-emerald-700"
                        : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Commercial Licensing Pass Status Button */}
            {onOpenCommercialModal && (
              <button
                id="commercial-license-nav-btn"
                type="button"
                onClick={onOpenCommercialModal}
                title="Manage Commercial Governance Access & Licensing ($29/6-mo flat)"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 shadow-2xs"
              >
                <Award className={`w-3.5 h-3.5 ${isCommercialActive ? "text-emerald-600" : "text-slate-500"}`} />
                <span>
                  {isCommercialActive ? (
                    <>
                      <span className="font-bold text-emerald-700">Commercial Pass</span>
                      <span className="text-[10px] text-slate-500 ml-1">($29/6-mo)</span>
                    </>
                  ) : (
                    <>Public Mode</>
                  )}
                </span>
              </button>
            )}

            {/* Defense status indicator */}
            <button
              id="defense-status-pill-btn"
              type="button"
              onClick={openDefense}
              title="Defense-of-Break Protection Status"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                securityClearance?.isCleared
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
              }`}
            >
              {securityClearance?.isCleared ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Passkey Cleared</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Defense Active</span>
                </>
              )}
            </button>

            {/* Run QA CTA */}
            <button
              id="header-run-qa-btn"
              type="button"
              onClick={() => setActiveTab("qa-matrix")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Run QA Matrix</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden items-center justify-between gap-1 py-2 overflow-x-auto border-t border-slate-200 scrollbar-none">
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === "overview" && activeTab === "cover") ||
              (item.id === "qa-matrix" && (activeTab === "audit" || activeTab === "shipworthy")) ||
              ((item.id === "registry" || item.id === "clearance") && (activeTab === "registry" || activeTab === "clearance")) ||
              (item.id === "defense-gate" && activeTab === "defense");

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "defense-gate") {
                    openDefense();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive ? "bg-emerald-50 text-emerald-800 font-bold" : "text-slate-600"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
