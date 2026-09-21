import React from "react";
import { TabType, SecurityClearance } from "../types";
import { PRICING_TIERS, SAMPLE_SCENARIOS } from "../data/samples";
import {
  ShieldCheck,
  Cpu,
  Flame,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  Zap,
  Terminal,
  Activity,
  CalendarCheck,
  Check,
  ShieldAlert,
} from "lucide-react";

interface OverviewViewProps {
  onNavigate: (tab: TabType) => void;
  onSelectSample: (sampleId: string) => void;
  onSelectTier: (tierId: string) => void;
  securityClearance?: SecurityClearance | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onSelectSample,
  onSelectTier,
  securityClearance,
}) => {
  return (
    <div id="overview-view-container" className="space-y-16 py-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section id="overview-hero-section" className="relative text-center max-w-4xl mx-auto pt-6 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>1WithOut Master Architecture: Knowledge-to-Execution & PWA Lifecycle</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Discern Claims. <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Build 5-10 Step Skills.</span> Verify PWA Launches.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          1WithOut turns untrusted marketing claims, video tutorials, books, PDFs, and SOPs into empirical evidence audits and atomic 5-to-10 directive autonomous agent skills — fortified by zero-tolerance Defense-of-Break protections and the 6-pillar launch verification matrix.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <button
            id="hero-cta-shipworthy-btn"
            onClick={() => onNavigate("shipworthy")}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Shipworthy QA Runner</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-cta-discern-btn"
            onClick={() => onNavigate("discern")}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Claims Audit</span>
          </button>

          <button
            id="hero-cta-skills-btn"
            onClick={() => onNavigate("skills")}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Build 5-10 Step Skill</span>
          </button>

          <button
            id="hero-cta-audit-btn"
            onClick={() => onNavigate("audit")}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>6-Pillar Matrix</span>
          </button>

          <button
            id="hero-cta-defense-btn"
            onClick={() => onNavigate("defense")}
            className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-rose-500/30 text-rose-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            {securityClearance?.isCleared ? (
              <>
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>Passcode Cleared</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Defense Gate</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 4 Core Pillars of 1WithOut */}
      <section id="pipeline-architecture-section" className="max-w-6xl mx-auto">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-emerald-400" />
                The 1WithOut 4-Pillar Core Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Deconstructs untrusted knowledge into strict empirical evidence, structured agent directives, verified PWA manifests, and post-launch cadence schedules.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Defense-of-Break Active • Zero-Tolerance PII</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Pillar 1: Claims Discernment */}
            <div
              id="arch-card-discern"
              onClick={() => onNavigate("discern")}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 font-bold text-xs">
                01
              </div>
              <h3 className="font-bold text-slate-200 text-sm group-hover:text-amber-400 transition-colors">
                Claims Discernment
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Evidence grading, citation checking, compliant rewrites & de-risked $25 sandbox tests.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
                <span>Evaluate Evidence</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pillar 2: 6-Pillar Matrix */}
            <div
              id="arch-card-matrix"
              onClick={() => onNavigate("audit")}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 font-bold text-xs">
                02
              </div>
              <h3 className="font-bold text-slate-200 text-sm group-hover:text-emerald-400 transition-colors">
                6-Pillar Launch Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Security, Cloud Ingress, Billing/Legal, Marketing Copy, Interface QA & 180-Day Cadence.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-medium">
                <span>Run Matrix Scan</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pillar 3: Agent Skill Builder */}
            <div
              id="arch-card-skill"
              onClick={() => onNavigate("skills")}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 font-bold text-xs">
                03
              </div>
              <h3 className="font-bold text-slate-200 text-sm group-hover:text-cyan-400 transition-colors">
                Agent Skill Builder
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Compiles 5 to 10 executable agent directives with specialized role voting & Playwright scripts.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-cyan-400/90 font-medium">
                <span>Build Directives</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pillar 4: App Lifecycle & Staging */}
            <div
              id="arch-card-lifecycle"
              onClick={() => onNavigate("registry")}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 font-bold text-xs">
                04
              </div>
              <h3 className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">
                App Lifecycle & Registry
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Multi-environment registry, staging audits, and continuous 30d/90d/180d automated maintenance.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-indigo-400/90 font-medium">
                <span>Track Applications</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 1-Click Samples & Allowlisted Projects */}
      <section id="sample-scenarios-section" className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Standard & Allowlisted Project Blueprints
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select any real-world blueprint to load through 1WithOut. Notice how sensitive corporate legal files trigger Defense-of-Break passcode verification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_SCENARIOS.map((sample) => (
            <div
              key={sample.id}
              id={`sample-card-${sample.id}`}
              onClick={() => onSelectSample(sample.id)}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    sample.isRestrictedSample
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}>
                    {sample.isRestrictedSample ? "Allowlist Passcode Protected" : sample.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono capitalize">
                    {sample.sourceType}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {sample.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {sample.snippet}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  Mode: {sample.suggestedMode.replace(/_/g, " ")}
                </span>
                <span className="font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Ingest into 1WithOut <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The 6 Pillars Scorecard Blueprint */}
      <section id="six-pillars-overview-section" className="max-w-6xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white">
              The 6-Pillar Launch Verification Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every production release is validated against empirical engineering gates, strict security barriers, and continuous 180-day review cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1. Security & Defense Sentinel</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero client secret leaks, CSP headers, 14-day token revocation, and real-time defense-of-break screening.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>2. Infrastructure & Ingress</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Strict container binding (0.0.0.0:3000), database connection pooling limits, and crash-proof error logging.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>3. Legal & Billing Idempotency</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Stripe webhook signature validation, GDPR user data export/deletion routes, and allowlisted corporate checks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>4. Marketing & Claims Audit</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Factual landing copy, transparent pricing terms, and elimination of unprovable financial promises.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>5. Interface & PWA Manifest</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Standalone PWA installability, touch targets &gt;=44px, and WCAG 2.1 AA text contrast across dark and light themes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <CalendarCheck className="w-4 h-4 text-indigo-400" />
                <span>6. 180-Day Maintenance Cadence</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automated 30-Day error review, 90-Day dependency upgrade check, and 180-Day secret rotation schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Commercialization Tiers */}
      <section id="pricing-tiers-section" className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-white">
            Monetization & Commercial Plans
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Start free with browser-based audits, or unlock high-capacity AI discernment, 5-10 directive skill compilation, and multi-app lifecycle registry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              id={`pricing-card-${tier.id}`}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all ${
                tier.popular
                  ? "bg-slate-900 border-2 border-emerald-500/80 shadow-xl shadow-emerald-500/10 relative"
                  : "bg-slate-900/70 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                  {tier.badge}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-100">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs text-slate-400">{tier.period}</span>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {tier.description}
                </p>

                <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <button
                  id={`tier-select-btn-${tier.id}`}
                  onClick={() => onSelectTier(tier.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tier.popular
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  {tier.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
