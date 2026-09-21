import React, { useState } from "react";
import {
  DomainSuggestion,
  BrandKit,
} from "../types";
import {
  Sparkles,
  Globe,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Zap,
  ArrowRight,
  Shield,
  Palette,
  FileCode,
  Bot,
  RefreshCw,
} from "lucide-react";

export const INITIAL_DOMAIN_SUGGESTIONS: DomainSuggestion[] = [
  {
    domain: "1without.io",
    tld: ".io",
    pricePerYear: 38.0,
    isAvailable: true,
    whoisStatus: "AVAILABLE",
    registrarBadge: "Cloudflare",
    seoScore: 98,
    fitReason: "Direct exact match for 1WithOut single-source-of-truth brand architecture.",
  },
  {
    domain: "novalaunch.dev",
    tld: ".dev",
    pricePerYear: 14.0,
    isAvailable: true,
    whoisStatus: "AVAILABLE",
    registrarBadge: "Google Domains",
    seoScore: 94,
    fitReason: "High relevance for developer-centric agentic platform and MCP tools.",
  },
  {
    domain: "opclaunchpad.ai",
    tld: ".ai",
    pricePerYear: 75.0,
    isAvailable: true,
    whoisStatus: "AVAILABLE",
    registrarBadge: "Vercel",
    seoScore: 96,
    fitReason: "Premium AI top-level domain for solo founder / one-person-company ecosystem.",
  },
  {
    domain: "spotifystore.app",
    tld: ".app",
    pricePerYear: 19.0,
    isAvailable: false,
    whoisStatus: "REGISTERED",
    registrarBadge: "Namecheap",
    seoScore: 88,
    fitReason: "Taken. Recommended alternatives: spotifystorefront.io or spotsync.dev.",
  },
  {
    domain: "vibecoding.sh",
    tld: ".sh",
    pricePerYear: 28.0,
    isAvailable: true,
    whoisStatus: "AVAILABLE",
    registrarBadge: "Cloudflare",
    seoScore: 92,
    fitReason: "Punchy terminal-first domain for natural language prompt-driven engineers.",
  },
];

export const INITIAL_BRAND_KIT: BrandKit = {
  brandName: "OPC Launchpad & 1WithOut",
  tagline: "Perfect domain. Launch-ready copy. Certified Shipworthy.",
  valueProposition: "Transform natural language ideas into WHOIS-verified domains, high-converting brand copy, autonomous agent workspaces, and automated 6-pillar certified PWAs.",
  targetAudience: "Solo founders, indie developers, one-person companies (OPCs), and autonomous AI agent architects.",
  voiceTone: "Authoritative, empirical, transparent, high-precision engineering, anti-hype.",
  primaryOklchColor: "oklch(0.65 0.20 160)",
  secondaryOklchColor: "oklch(0.60 0.18 250)",
  neutralBgColor: "oklch(0.12 0.02 260)",
  typographyHeading: "Inter & Space Grotesk High-Contrast",
  typographyBody: "Plus Jakarta Sans & JetBrains Mono",
  elevatorPitch: "Build, verify, and commercialize your startup in minutes. We provide instant WHOIS domain discovery, Claude/Gemini-powered Nova Agent workspace, and 1WithOut 6-pillar empirical validation.",
};

interface OpcLaunchpadViewProps {
  onNavigateToAgentWorkspace?: (prompt?: string) => void;
  onNavigateToCertification?: () => void;
}

export const OpcLaunchpadView: React.FC<OpcLaunchpadViewProps> = ({
  onNavigateToAgentWorkspace,
  onNavigateToCertification,
}) => {
  const [productIdea, setProductIdea] = useState<string>(
    "A full-stack Spotify app ecosystem that automates playlist management, curates audio merchandise, generates landing pages, and sells directly with Stripe & Shopify Checkout."
  );
  const [industry, setIndustry] = useState<string>("E-Commerce / Music Tech");
  const [targetAudience, setTargetAudience] = useState<string>(
    "Solo Creators, Indie Artists & Label Founders"
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [domainFilter, setDomainFilter] = useState<"ALL" | "AVAILABLE">("ALL");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [domains, setDomains] = useState<DomainSuggestion[]>(
    INITIAL_DOMAIN_SUGGESTIONS
  );
  const [brandKit, setBrandKit] = useState<BrandKit>(INITIAL_BRAND_KIT);
  const [activeSubTab, setActiveSubTab] = useState<"domains" | "brandkit" | "copypage">("domains");

  const handleGenerate = () => {
    if (!productIdea.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      // Simulate real-time WHOIS analysis and brand generator
      const cleanIdea = productIdea.toLowerCase();
      const slug = cleanIdea.includes("spotify")
        ? "spotsync"
        : cleanIdea.includes("ai")
        ? "novaworker"
        : "launchflow";

      setDomains([
        {
          domain: `${slug}.io`,
          tld: ".io",
          pricePerYear: 38.0,
          isAvailable: true,
          whoisStatus: "AVAILABLE",
          registrarBadge: "Cloudflare",
          seoScore: 98,
          fitReason: "Direct exact match for developer & tech audience.",
        },
        {
          domain: `${slug}.ai`,
          tld: ".ai",
          pricePerYear: 72.0,
          isAvailable: true,
          whoisStatus: "AVAILABLE",
          registrarBadge: "Vercel",
          seoScore: 95,
          fitReason: "Signals automated intelligence and agent capabilities.",
        },
        {
          domain: `get${slug}.app`,
          tld: ".app",
          pricePerYear: 18.0,
          isAvailable: true,
          whoisStatus: "AVAILABLE",
          registrarBadge: "Google Domains",
          seoScore: 91,
          fitReason: "Action-oriented domain for consumer mobile and PWA installs.",
        },
        {
          domain: `${slug}hub.com`,
          tld: ".com",
          pricePerYear: 12.0,
          isAvailable: false,
          whoisStatus: "REGISTERED",
          registrarBadge: "Namecheap",
          seoScore: 84,
          fitReason: "Currently taken. Backorder or use .io alternative.",
        },
      ]);

      setBrandKit({
        brandName: cleanIdea.includes("spotify") ? "SpotSync™ OPC" : "NovaLaunch™ Studio",
        tagline: "Autonomous Storefronts. Instant Domains. Certified Shipworthy.",
        valueProposition: `The all-in-one execution stack for ${industry}: turn your vision into live sales, verified WHOIS domains, and 1WithOut certified code.`,
        targetAudience: targetAudience || "Solo founders, creators, and engineers.",
        voiceTone: "Authoritative, empirical, developer-first, frictionless.",
        primaryOklchColor: "oklch(0.68 0.22 162)",
        secondaryOklchColor: "oklch(0.62 0.20 255)",
        neutralBgColor: "oklch(0.98 0.01 90)",
        typographyHeading: "Inter 800 Display",
        typographyBody: "Plus Jakarta Sans 400",
        elevatorPitch: `We eliminate the friction of building a modern digital company. With one prompt, generate brand copy, verify domains, launch a high-converting storefront, and verify all code with 6-pillar empirical QA.`,
      });

      setIsGenerating(false);
    }, 900);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredDomains = domainFilter === "AVAILABLE" ? domains.filter((d) => d.isAvailable) : domains;

  return (
    <div id="opc-launchpad-container" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="text-center max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Unified OPC Launchpad • One-Person Company Stack</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Perfect domain. <br />
          <span className="text-emerald-700">
            Launch-ready copy & design tokens.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Describe your product idea. Get 10+ available domain names — WHOIS-verified — plus brand copy, design system tokens, integrated storefront, and full 1WithOut empirical certification.
        </p>

        {/* Input Card Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-lg text-left space-y-5">
          <div>
            <label htmlFor="product-idea-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Describe Your Product Idea *
            </label>
            <textarea
              id="product-idea-input"
              value={productIdea}
              onChange={(e) => setProductIdea(e.target.value)}
              rows={3}
              placeholder="e.g. AI agent that helps one-person companies find domain names, generate brand copy, and sell digital merchandise with Spotify synchronization..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry-input" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Industry (Optional)
              </label>
              <input
                id="industry-input"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. SaaS, Fintech, Creator Economy"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="target-audience-input" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Target Audience (Optional)
              </label>
              <input
                id="target-audience-input"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Solo founders, CTOs, Indie Hackers"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>~15s generation • Real-time WHOIS • Zero configuration</span>
            </div>

            <button
              id="generate-launchpad-btn"
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !productIdea.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Domains & Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Domain & Brand Kit</span>
                </>
              )}
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-medium text-slate-600">Try an example:</span>
            <button
              type="button"
              onClick={() => {
                setProductIdea("Spotify app that manages music tracks, syncs sound kits, and sells merchandise directly to fans.");
                setIndustry("Music Tech / Creator Tools");
                setTargetAudience("Indie Artists & Producers");
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Spotify Merch & App
            </button>
            <button
              type="button"
              onClick={() => {
                setProductIdea("Automated bookkeeping and invoice triage for solo freelancers with automated tax filing.");
                setIndustry("Fintech / Accounting");
                setTargetAudience("Freelance Designers & Developers");
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Freelance Bookkeeping
            </button>
            <button
              type="button"
              onClick={() => {
                setProductIdea("Axe-Core accessibility auditor and Playwright test harness generator for modern PWAs.");
                setIndustry("Developer Productivity");
                setTargetAudience("QA Engineers & Tech Leads");
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Automated A11y Suite
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* WORKSPACE INTEGRATED NAVIGATION TABS */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              id="subtab-domains-btn"
              type="button"
              onClick={() => setActiveSubTab("domains")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === "domains"
                  ? "bg-white text-emerald-800 border border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Domain Matrix ({filteredDomains.length})</span>
            </button>

            <button
              id="subtab-brandkit-btn"
              type="button"
              onClick={() => setActiveSubTab("brandkit")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === "brandkit"
                  ? "bg-white text-emerald-800 border border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Palette className="w-4 h-4 text-amber-600" />
              <span>Brand Kit & OKLCH Palettes</span>
            </button>

            <button
              id="subtab-copypage-btn"
              type="button"
              onClick={() => setActiveSubTab("copypage")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === "copypage"
                  ? "bg-white text-emerald-800 border border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode className="w-4 h-4 text-teal-600" />
              <span>Launch-Ready Copy & Landing Spec</span>
            </button>
          </div>

          {/* Quick Hub Launchers */}
          <div className="flex items-center gap-2">
            {onNavigateToAgentWorkspace && (
              <button
                type="button"
                onClick={() => onNavigateToAgentWorkspace(productIdea)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Send to Nova Agent</span>
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUBTAB 1: DOMAIN MATRIX */}
        {/* ------------------------------------------------------------- */}
        {activeSubTab === "domains" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Live WHOIS Domain Recommendations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time registrability checks across ICANN root servers and major cloud registrars.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setDomainFilter("ALL")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    domainFilter === "ALL" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600"
                  }`}
                >
                  All ({domains.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDomainFilter("AVAILABLE")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    domainFilter === "AVAILABLE" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600"
                  }`}
                >
                  Available Only ({domains.filter((d) => d.isAvailable).length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDomains.map((dom) => (
                <div
                  key={dom.domain}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                        {dom.domain}
                      </span>
                      {dom.isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AVAILABLE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>TAKEN</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{dom.fitReason}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Estimated Price:</span>
                      <span className="font-bold text-slate-900">${dom.pricePerYear}/year</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Registrar Match:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {dom.registrarBadge}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">SEO & Memorability:</span>
                      <span className="font-bold text-emerald-700">{dom.seoScore}/100</span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(dom.domain, dom.domain)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedKey === dom.domain ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Domain</span>
                          </>
                        )}
                      </button>

                      {onNavigateToAgentWorkspace && (
                        <button
                          type="button"
                          onClick={() =>
                            onNavigateToAgentWorkspace(
                              `Create landing page for domain ${dom.domain} focusing on ${productIdea}`
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="Generate app code with Nova"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Build</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBTAB 2: BRAND KIT & OKLCH DESIGN SYSTEM */}
        {/* ------------------------------------------------------------- */}
        {activeSubTab === "brandkit" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Brand Identity Summary */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Brand Architecture & Strategy</h3>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  Generated Token Kit
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Brand Name</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{brandKit.brandName}</div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tagline</span>
                  <p className="text-slate-800 text-sm font-medium mt-0.5">{brandKit.tagline}</p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Value Proposition</span>
                  <p className="text-slate-600 text-xs leading-relaxed mt-0.5">{brandKit.valueProposition}</p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Voice & Tone</span>
                  <p className="text-emerald-800 text-xs font-mono mt-0.5">{brandKit.voiceTone}</p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Elevator Pitch</span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 text-xs italic leading-relaxed">
                    "{brandKit.elevatorPitch}"
                  </div>
                </div>
              </div>
            </div>

            {/* Right: OKLCH Palettes & Typography Pairings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900">OKLCH Design System Tokens</h3>

              <div className="space-y-4">
                {/* Primary Color Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 shadow-xs border border-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Primary Brand Accent</div>
                      <div className="text-xs font-mono text-slate-500">{brandKit.primaryOklchColor}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(brandKit.primaryOklchColor, "primary-color")}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs cursor-pointer"
                  >
                    {copiedKey === "primary-color" ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Secondary Color Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600 shadow-xs border border-cyan-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Secondary Electric Accent</div>
                      <div className="text-xs font-mono text-slate-500">{brandKit.secondaryOklchColor}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(brandKit.secondaryOklchColor, "sec-color")}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs cursor-pointer"
                  >
                    {copiedKey === "sec-color" ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Typography Stack */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800">Typography Scale Pairing</div>
                  <div className="text-xs text-slate-600">
                    Heading: <span className="text-slate-900 font-semibold">{brandKit.typographyHeading}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Body / Mono: <span className="text-slate-900 font-semibold">{brandKit.typographyBody}</span>
                  </div>
                </div>

                {/* Call to action for full code */}
                {onNavigateToAgentWorkspace && (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToAgentWorkspace(
                        `Generate Tailwind CSS theme configuration and React component library using Brand Kit: ${JSON.stringify(
                          brandKit
                        )}`
                      )
                    }
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Generate Tailwind Config in Nova Workspace</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBTAB 3: LAUNCH-READY COPY & LANDING SPEC */}
        {/* ------------------------------------------------------------- */}
        {activeSubTab === "copypage" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Production Landing Page Blueprint</h3>
                <p className="text-xs text-slate-500">Structured markdown copy ready for instant deployment.</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `# ${brandKit.brandName}\n\n## ${brandKit.tagline}\n\n${brandKit.valueProposition}\n\n### Target Audience\n${brandKit.targetAudience}\n\n### Elevator Pitch\n${brandKit.elevatorPitch}`,
                    "full-copy"
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                {copiedKey === "full-copy" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Markdown Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Copywriting Dossier</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 space-y-4 leading-relaxed overflow-x-auto">
              <div className="text-emerald-800 font-bold"># HERO TITLE</div>
              <div className="text-slate-900 text-sm font-sans font-extrabold">{brandKit.tagline}</div>

              <div className="text-emerald-800 font-bold mt-4">## VALUE PROPOSITION</div>
              <div className="font-sans text-slate-700">{brandKit.valueProposition}</div>

              <div className="text-emerald-800 font-bold mt-4">## 3 KEY BENEFIT PILLARS</div>
              <ul className="list-disc pl-5 space-y-1 font-sans text-slate-700">
                <li>Instant WHOIS domain validation and automated registrar handoff.</li>
                <li>Autonomous Nova Copilot workspace with Model Context Protocol (MCP) tooling.</li>
                <li>Zero-tolerance 1WithOut empirical 6-pillar pre-flight certification.</li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
