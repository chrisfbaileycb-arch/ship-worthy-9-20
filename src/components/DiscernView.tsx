import React, { useState } from "react";
import {
  IntakeModality,
  ProcessingMode,
  DiscernmentReport,
  ClaimClassification,
  SecurityClearance,
  DefenseScanResult,
} from "../types";
import { SAMPLE_SCENARIOS } from "../data/samples";
import { runDiscernmentAudit, scanDefenseSafety } from "../services/api";
import {
  Flame,
  Globe,
  Video,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  CheckCircle,
  Copy,
  ArrowRight,
  RefreshCw,
  Cpu,
  Clock,
  DollarSign,
  Ban,
  Check,
  ShieldAlert,
  BookOpen,
  Layers,
  Upload,
} from "lucide-react";

interface DiscernViewProps {
  initialContent?: string;
  initialSourceType?: IntakeModality;
  initialSourceUrl?: string;
  initialMode?: ProcessingMode;
  onSendToSkillBuilder: (text: string, title: string) => void;
  securityClearance?: SecurityClearance | null;
  onOpenDefenseModal?: () => void;
}

export const DiscernView: React.FC<DiscernViewProps> = ({
  initialContent = "",
  initialSourceType = "text",
  initialSourceUrl = "",
  initialMode = "evaluate",
  onSendToSkillBuilder,
  securityClearance,
  onOpenDefenseModal,
}) => {
  const [modality, setModality] = useState<IntakeModality>(initialSourceType);
  const [mode, setMode] = useState<ProcessingMode>(initialMode);
  const [sourceUrl, setSourceUrl] = useState<string>(initialSourceUrl);
  const [content, setContent] = useState<string>(initialContent || SAMPLE_SCENARIOS[1].fullContent);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<DiscernmentReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [defenseWarning, setDefenseWarning] = useState<DefenseScanResult | null>(null);

  React.useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  React.useEffect(() => {
    if (initialSourceType) {
      setModality(initialSourceType);
    }
  }, [initialSourceType]);

  React.useEffect(() => {
    if (initialSourceUrl) {
      setSourceUrl(initialSourceUrl);
    }
  }, [initialSourceUrl]);

  const handleRunAudit = async () => {
    if (!content.trim()) {
      setErrorMsg("Please provide content, video script, or document text to evaluate.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setDefenseWarning(null);

    try {
      // 1. Run client-side / server pre-scan
      const defense = await scanDefenseSafety(content);
      if (defense.isBlocked && !securityClearance?.isCleared) {
        setDefenseWarning(defense);
        setErrorMsg("DEFENSE-OF-BREAK LOCK: " + defense.reason);
        setIsLoading(false);
        return;
      }

      const result = await runDiscernmentAudit(
        content,
        modality,
        sourceUrl,
        mode,
        securityClearance?.passcodeUsed
      );
      setReport(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to complete discernment analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
        setModality("document_pdf");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadPreset = (scenarioId: string) => {
    const scenario = SAMPLE_SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      setContent(scenario.fullContent);
      setModality(scenario.sourceType);
      setSourceUrl(scenario.sourceUrl || "");
      setMode(scenario.suggestedMode);
      setReport(null);
      setErrorMsg(null);
      setDefenseWarning(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuoteId(id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  const getClassificationBadge = (classification: ClaimClassification) => {
    switch (classification) {
      case "Supported by Evidence":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "Reasonable but Unverified":
        return {
          bg: "bg-teal-500/10 text-teal-400 border-teal-500/30",
          icon: <HelpCircle className="w-3.5 h-3.5 text-teal-400" />,
        };
      case "Missing Material Context / Prerequisites":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case "Conflicting Evidence":
        return {
          bg: "bg-orange-500/10 text-orange-400 border-orange-500/30",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
        };
      case "Outcome Appears Atypical":
        return {
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: <TrendingDown className="w-3.5 h-3.5 text-rose-400" />,
        };
      case "Unable to Determine":
      default:
        return {
          bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  return (
    <div id="discernment-engine-view" className="space-y-10 py-6 max-w-6xl mx-auto px-4 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              1WithOut Universal Ingestion & Claims Discernment
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirical evidence grading and citation checks. Eliminates false promises, isolates viable steps, and designs low-budget $25 sandbox tests.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Load Blueprint:</span>
          <select
            id="preset-scenario-dropdown"
            onChange={(e) => handleLoadPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
            defaultValue="sample-claims-crypto"
          >
            {SAMPLE_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Configuration Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Modality & Processing Mode Switchers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Intake Modality */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Ingestion Modality (PWA / App / Web / PDF / Book / Video / Text)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => setModality("text")}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  modality === "text"
                    ? "bg-slate-800 border-emerald-500 text-emerald-400 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text / Copy</span>
              </button>

              <button
                type="button"
                onClick={() => setModality("video_url")}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  modality === "video_url"
                    ? "bg-slate-800 border-emerald-500 text-emerald-400 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Script</span>
              </button>

              <button
                type="button"
                onClick={() => setModality("webpage_url")}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  modality === "webpage_url"
                    ? "bg-slate-800 border-emerald-500 text-emerald-400 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website</span>
              </button>

              <button
                type="button"
                onClick={() => setModality("document_pdf")}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  modality === "document_pdf"
                    ? "bg-slate-800 border-emerald-500 text-emerald-400 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Doc</span>
              </button>

              <button
                type="button"
                onClick={() => setModality("book_chapter")}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  modality === "book_chapter"
                    ? "bg-slate-800 border-emerald-500 text-emerald-400 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Book / Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setModality("pwa_source")}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  modality === "pwa_source"
                    ? "bg-slate-800 border-emerald-500 text-emerald-400 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>PWA Source</span>
              </button>
            </div>
          </div>

          {/* Processing Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Pipeline Target Mode
            </label>
            <select
              id="processing-mode-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as ProcessingMode)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="evaluate">Evaluate: Claims & Opportunity Discernment Audit</option>
              <option value="teach">Teach: Step-by-Step Human Course & Knowledge Checks</option>
              <option value="operationalize">Operationalize: Actionable Blueprint & Architecture</option>
              <option value="build_skill">Build Skill: 5-to-10 Directive Agent Package</option>
              <option value="evaluate_and_build">Evaluate + Build: Discern First; Generate Skills from Supported Steps</option>
            </select>
          </div>
        </div>

        {/* Source URL Field if applicable */}
        {(modality === "video_url" || modality === "webpage_url") && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Source URL
            </label>
            <input
              type="text"
              id="source-url-input"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://example.com/landing"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>
        )}

        {/* File Drop & Upload Bar */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer border border-slate-700 transition-colors">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload File (PDF / TXT / MD / JSON)</span>
            <input
              type="file"
              accept=".txt,.md,.json,.pdf,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-[11px] text-slate-400">
            or paste raw instructions, video transcripts, or book content directly below
          </span>
        </div>

        {/* Content / Transcript Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Source Content / Video Transcript / Instructions
            </label>
            <span className="text-[11px] text-slate-400">
              {content.length} characters
            </span>
          </div>
          <textarea
            id="source-content-textarea"
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste tutorial script, landing page copy, marketing claims, or standard operating procedure..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-2xl p-3.5 focus:ring-1 focus:ring-emerald-500 outline-none font-mono leading-relaxed"
          />
        </div>

        {/* Defense Warning Box if triggered */}
        {defenseWarning && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-2 text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>DEFENSE-OF-BREAK BARRIER: {defenseWarning.reason}</span>
              </div>
              {defenseWarning.allowlistedProjectEligible && (
                <button
                  type="button"
                  onClick={onOpenDefenseModal}
                  className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                >
                  Enter Passcode
                </button>
              )}
            </div>
            <p className="text-slate-300 text-[11px]">
              {defenseWarning.suggestedAction}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {errorMsg ? (
            <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
          ) : (
            <span className="text-xs text-slate-400">
              Audited by 1WithOut Gemini 3.7 Flash engine with citation checks
            </span>
          )}

          <button
            id="run-discernment-audit-btn"
            onClick={handleRunAudit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Empirical Evidence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Discernment Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Report Results View */}
      {report && (
        <div id="discernment-report-output" className="space-y-8 animate-in fade-in duration-300">
          {/* Summary & Scorecard Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {report.sourceType.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Executive Discernment Evaluation
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {report.summary}
              </p>
            </div>

            {/* Score pill */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shrink-0">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white">
                  {report.overallScore}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Evidence Score</p>
              </div>

              <div className="h-10 w-[1px] bg-slate-800" />

              <div>
                <span className="text-xs font-semibold text-emerald-400 block">
                  {report.evidenceIndex}
                </span>
                <span className="text-[11px] text-slate-400">
                  {report.claims.length} Extracted Claims
                </span>
              </div>
            </div>
          </div>

          {/* Claims Table / Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Claim-by-Claim Citation & Feasibility Analysis
              </h3>
              <span className="text-xs text-slate-400">
                Non-accusatory truth evaluation
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {report.claims.map((claim, index) => {
                const badge = getClassificationBadge(claim.classification);
                return (
                  <div
                    key={claim.id || index}
                    id={`claim-card-${index}`}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                          {badge.icon}
                          <span>{claim.classification}</span>
                        </span>
                        <span className="text-xs font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          Heuristic: {claim.heuristicConcern}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(claim.saferRewrite, claim.id)}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedQuoteId === claim.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Rewrite</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Original Quote */}
                    <div className="bg-slate-950/80 rounded-xl p-3 border-l-2 border-slate-700">
                      <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-1">
                        Verbatim Source Passage:
                      </p>
                      <p className="text-xs text-slate-200 italic font-mono">
                        "{claim.quotedText}"
                      </p>
                    </div>

                    {/* Evidence Reasoning */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-300">
                        Evidence-Based Findings:
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {claim.evidenceReasoning}
                      </p>
                    </div>

                    {/* Missing Prerequisites */}
                    {claim.prerequisitesMissing && claim.prerequisitesMissing.length > 0 && (
                      <div className="space-y-1 bg-amber-950/20 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Missing Context & Hidden Prerequisites:
                        </p>
                        <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                          {claim.prerequisitesMissing.map((pre, pIdx) => (
                            <li key={pIdx}>{pre}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Safer Compliant Rewrite */}
                    <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
                      <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Safer, Factually Grounded Rewrite:
                      </p>
                      <p className="text-xs text-emerald-200 mt-1 font-medium leading-relaxed">
                        "{claim.saferRewrite}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* De-Risked Real-World Test Plan */}
          {report.sandboxTestPlan && (
            <div id="sandbox-test-plan-box" className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Actionable Safeguard
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {report.sandboxTestPlan.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hypothesis: {report.sandboxTestPlan.hypothesis}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Budget: {report.sandboxTestPlan.budgetLimit}</span>
                  </div>
                  <div className="h-4 w-[1px] bg-slate-800" />
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Window: {report.sandboxTestPlan.timeframe}</span>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Sandbox Execution Steps:
                </p>
                <div className="space-y-2">
                  {report.sandboxTestPlan.steps.map((st, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span className="leading-relaxed">{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kill Criteria vs Success Signal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                  <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" />
                    Explicit Stop / Kill Signals:
                  </p>
                  <ul className="text-xs text-rose-200/90 space-y-1.5 pl-4 list-disc leading-relaxed">
                    {report.sandboxTestPlan.killCriteria.map((kc, kIdx) => (
                      <li key={kIdx}>{kc}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Validated Success Signal:
                  </p>
                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                    {report.sandboxTestPlan.successSignal}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
            <button
              id="send-to-skill-builder-btn"
              onClick={() => onSendToSkillBuilder(content, report.title)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Convert Viable Steps to 5-10 Step Skill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
