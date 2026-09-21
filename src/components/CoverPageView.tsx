import React, { useState } from "react";
import {
  Zap,
  Bot,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
  Globe,
  Palette,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
} from "lucide-react";

interface CoverPageViewProps {
  onEnterStudio: () => void;
  onOpenCopilot: (prompt?: string) => void;
  onViewCertification: () => void;
}

export const CoverPageView: React.FC<CoverPageViewProps> = ({
  onEnterStudio,
  onOpenCopilot,
  onViewCertification,
}) => {
  const [teaserPrompt, setTeaserPrompt] = useState<string>("Spotify Lo-Fi Sample Generator & Audio Kit");
  const [activeTeaserDomain, setActiveTeaserDomain] = useState<string>("audiokit.io");
  const [activePalette, setActivePalette] = useState<{ name: string; hex: string; role: string }[]>([
    { name: "Forest", hex: "#166534", role: "Primary Accent" },
    { name: "Sage", hex: "#86efac", role: "Secondary Light" },
    { name: "Linen", hex: "#f8fafc", role: "Surface Base" },
    { name: "Charcoal", hex: "#0f172a", role: "Deep Typography" },
  ]);

  const presetTeasers = [
    {
      label: "Spotify Audio Kit",
      prompt: "Spotify Lo-Fi Sample Generator & Audio Kit",
      domain: "audiokit.io",
      category: "Digital Audio & Music",
      price: "$39.00",
      palette: [
        { name: "Emerald", hex: "#059669", role: "Primary" },
        { name: "Mint", hex: "#6ee7b7", role: "Secondary" },
        { name: "Ivory", hex: "#fafafa", role: "Background" },
        { name: "Slate", hex: "#0f172a", role: "Body" },
      ],
    },
    {
      label: "PWA Security Sentinel",
      prompt: "Enterprise Defense-of-Break Zero Trust Sentinel",
      domain: "sentinelpass.dev",
      category: "Security & Micro-SaaS",
      price: "$149.00",
      palette: [
        { name: "Indigo", hex: "#4338ca", role: "Primary" },
        { name: "Sky", hex: "#7dd3fc", role: "Secondary" },
        { name: "Pearl", hex: "#f8fafc", role: "Background" },
        { name: "Dark Slate", hex: "#020617", role: "Body" },
      ],
    },
    {
      label: "VibeCoding Micro-SaaS",
      prompt: "Autonomous Prompt-to-Storefront Synthesis Engine",
      domain: "vibecraft.app",
      category: "Developer Tools",
      price: "$79.00",
      palette: [
        { name: "Amber", hex: "#d97706", role: "Primary" },
        { name: "Gold", hex: "#fde047", role: "Secondary" },
        { name: "Cream", hex: "#fffbeb", role: "Background" },
        { name: "Onyx", hex: "#18181b", role: "Body" },
      ],
    },
  ];

  const handleSelectPreset = (item: typeof presetTeasers[0]) => {
    setTeaserPrompt(item.prompt);
    setActiveTeaserDomain(item.domain);
    setActivePalette(item.palette);
  };

  return (
    <div id="cover-page-root" className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#FAF9F6] to-[#F5F4F0]">
        {/* Subtle background ambient ring */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Next-Generation OPC Architecture & VibeCoding Operating System</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            From Instant Prompt to <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy underline-offset-8">Production PWA</span> in Minutes
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A unified suite integrating real-time WHOIS domain discovery, autonomous Nova copilot synthesis, and 1WithOut 6-Pillar empirical testing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="hero-enter-studio-btn"
              type="button"
              onClick={onEnterStudio}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-700/10 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>Enter Launchpad Studio</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>

            <button
              id="hero-open-copilot-btn"
              type="button"
              onClick={() => onOpenCopilot()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-slate-600" />
              <span>Launch Nova Copilot</span>
            </button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Configuration Needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>WHOIS Live Registrar API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Shopify & Stripe Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Empirical 6-Pillar QA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* LIVE PREVIEW TEASER (Interactive Prompt-to-Product Generator) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Synthesis Engine</span>
              <h2 className="text-lg font-bold text-slate-900">Type Any Digital Product Concept</h2>
            </div>
            {/* Quick preset chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {presetTeasers.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    teaserPrompt === preset.prompt
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive input box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="teaser-prompt-input"
              type="text"
              value={teaserPrompt}
              onChange={(e) => setTeaserPrompt(e.target.value)}
              placeholder="e.g. Spotify Sample Sound Kit, Next.js Notion Template, AI Prompt Toolkit..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-36 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => onOpenCopilot(teaserPrompt)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Build with Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Real-time preview card matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* 1. Live Domain Matched */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  WHOIS Domain Match
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">AVAILABLE</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{activeTeaserDomain}</div>
                <p className="text-xs text-slate-500 mt-0.5">$12.00 / yr • Cloudflare Registrar Fast-Path</p>
              </div>
              <div className="text-xs text-slate-600 font-medium pt-1">
                SEO Authority: <span className="font-bold text-emerald-700">96/100</span> (High Keyword Match)
              </div>
            </div>

            {/* 2. Color Palette Tokens */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-600" />
                  OKLCH Design Tokens
                </span>
                <span className="text-[10px] font-mono text-slate-400">WCAG AA 4.5:1</span>
              </div>
              <div className="flex items-center gap-2">
                {activePalette.map((c) => (
                  <div key={c.name} className="flex-1 text-center space-y-1">
                    <div className="h-9 rounded-lg border border-slate-300 shadow-xs" style={{ backgroundColor: c.hex }} />
                    <span className="text-[10px] text-slate-500 block font-mono leading-tight">{c.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Accessible high-contrast palette ready for Tailwind CSS.</p>
            </div>

            {/* 3. PWA Launch Spec */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-cyan-600" />
                  PWA Artifact Spec
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">READY</span>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 line-clamp-1">{teaserPrompt}</div>
                <div className="text-xs text-slate-500 mt-0.5">MCP Protocol • AGENTS.md workflow scaffold</div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono font-semibold text-emerald-700">Port 3000 Ingress</span>
                <button
                  type="button"
                  onClick={() => onOpenCopilot(teaserPrompt)}
                  className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open in Copilot</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4 CORE FEATURE HIGHLIGHTS */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">End-to-End Architecture</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Four Pillars of the 1WithOut Engine</h2>
          <p className="text-sm text-slate-600">
            Engineered for founders, vibe-coders, and creators who need speed without sacrificing technical rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Brand & Domain Finder */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-5 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Globe className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                1. Brand & WHOIS Domain Studio
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transform rough concepts into verified, available domains. Real-time WHOIS status checks across .com, .io, .dev, and .app with instant registrar price checks and SEO ranking estimates.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live registrar routing (Cloudflare, Namecheap, Vercel)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>OKLCH design system tokens & typography scales</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={onEnterStudio}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Domain Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Executable Skill Builder */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-5 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                2. Executable Skill Builder
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Extract actionable patterns, audit directives, and empirical QA rules directly into portable Markdown skill specifications with deterministic YAML frontmatter.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated claims discernment and truth-testing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Standardized SKILL.md packaging and schema export</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={onViewCertification}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore Skill Builder & QA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Autonomous Nova Copilot */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-5 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                3. Autonomous Nova Copilot
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Natural language vibe-coding agent powered by MCP (Model Context Protocol). Live split-pane workspace with real-time code synthesis and interactive UI component visualizer.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live artifact code generation & live component preview</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated AGENTS.md & tool-calling protocols</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenCopilot()}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Nova Agent Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 4: 1WithOut Shipworthy QA */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-5 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                4. 1WithOut 6-Pillar Certification
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empirical testing sandbox with container CPU/RAM limits, automated Axe-Core™ WCAG 2.1 AA accessibility scans, Playwright persona simulation, and Defense-of-Break security gates.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero-tolerance defense-of-break gate with passkey protection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant downloadable PDF audit flight report</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={onViewCertification}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Run 6-Pillar Flight Certification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FINAL CALL TO ACTION */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Ready for Immediate Deployment</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Launch Your Product Studio Today
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to synthesize brands, verify domains, sell digital goods, and certify application quality.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onEnterStudio}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
            >
              Launch Console Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
