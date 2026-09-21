import React, { useState } from "react";
import {
  AgentSkillPackage,
  IntakeModality,
  WorkflowStep,
  ActionType,
  AgentRoleType,
  SecurityClearance,
  DefenseScanResult,
} from "../types";
import { SAMPLE_SCENARIOS } from "../data/samples";
import { buildAgentSkill, scanDefenseSafety } from "../services/api";
import {
  Cpu,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Layers,
  Terminal,
  ShieldCheck,
  AlertCircle,
  FileCode,
  Globe,
  Sliders,
  ShieldAlert,
  Code,
  BookOpen,
} from "lucide-react";

interface SkillBuilderViewProps {
  initialContent?: string;
  initialSkillName?: string;
  securityClearance?: SecurityClearance | null;
  onOpenDefenseModal?: () => void;
}

export const SkillBuilderView: React.FC<SkillBuilderViewProps> = ({
  initialContent = "",
  initialSkillName = "",
  securityClearance,
  onOpenDefenseModal,
}) => {
  const [skillName, setSkillName] = useState<string>(
    initialSkillName || "PWA Offline-First Sync & Mutation Engine"
  );
  const [modality, setModality] = useState<IntakeModality>("pwa_source");
  const [targetPlatform, setTargetPlatform] = useState<string>("universal");
  const [tutorialContent, setTutorialContent] = useState<string>(
    initialContent || SAMPLE_SCENARIOS[0].fullContent
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [skillPackage, setSkillPackage] = useState<AgentSkillPackage | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [defenseWarning, setDefenseWarning] = useState<DefenseScanResult | null>(null);

  const [activeCodeTab, setActiveCodeTab] = useState<"markdown" | "playwright" | "tools" | "manifest">("markdown");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialContent) {
      setTutorialContent(initialContent);
    }
  }, [initialContent]);

  React.useEffect(() => {
    if (initialSkillName) {
      setSkillName(initialSkillName);
    }
  }, [initialSkillName]);

  const handleBuildSkill = async () => {
    if (!tutorialContent.trim()) {
      setErrorMsg("Please provide SOP, tutorial steps, or technical guidelines to operationalize.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setDefenseWarning(null);

    try {
      // Defense Check
      const defense = await scanDefenseSafety(tutorialContent);
      if (defense.isBlocked && !securityClearance?.isCleared) {
        setDefenseWarning(defense);
        setErrorMsg("DEFENSE-OF-BREAK BARRIER: " + defense.reason);
        setIsLoading(false);
        return;
      }

      const result = await buildAgentSkill(
        tutorialContent,
        skillName,
        targetPlatform,
        modality,
        securityClearance?.passcodeUsed
      );
      setSkillPackage(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to compile agent skill package.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (actionType: ActionType) => {
    switch (actionType) {
      case "browser_action":
        return { bg: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "Browser Action" };
      case "api_action":
        return { bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", label: "API Call" };
      case "decision_gate":
        return { bg: "bg-amber-500/10 text-amber-400 border-amber-500/30", label: "Decision Gate" };
      case "verification":
        return { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", label: "Verification" };
      case "human_action":
        return { bg: "bg-purple-500/10 text-purple-400 border-purple-500/30", label: "Human Gate" };
      default:
        return { bg: "bg-slate-500/10 text-slate-400 border-slate-500/30", label: "Step" };
    }
  };

  const getRoleBadge = (role: AgentRoleType) => {
    switch (role) {
      case "DOM_BROWSER_AGENT":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "API_ORCHESTRATOR":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      case "SECURITY_SENTINEL":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "SCHEMA_VERIFIER":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "PWA_WORKER_ENGINE":
        return "text-teal-400 bg-teal-500/10 border-teal-500/20";
      case "HUMAN_GATEKEEPER":
      default:
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    }
  };

  return (
    <div id="skill-builder-view" className="space-y-10 py-6 max-w-6xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              5-to-10 Directive Agent Skill Builder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Converts tutorials, books, PDFs, and SOPs into atomic executable skills with role-based voting (DOM Browser, API, Schema Verifier, Security Sentinel, Human Gatekeeper) and Playwright automation scripts.
          </p>
        </div>

        {/* Load sample preset */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Load Blueprint:</span>
          <select
            onChange={(e) => {
              const s = SAMPLE_SCENARIOS.find((sc) => sc.id === e.target.value);
              if (s) {
                setTutorialContent(s.fullContent);
                setSkillName(s.title);
                setModality(s.sourceType);
                setSkillPackage(null);
                setErrorMsg(null);
                setDefenseWarning(null);
              }
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
            defaultValue="sample-pwa-sync"
          >
            {SAMPLE_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Workspace */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Skill Package Name
            </label>
            <input
              type="text"
              id="skill-name-input"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Offline-First PWA Sync Engine"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Source Modality
            </label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as IntakeModality)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="pwa_source">PWA Code / Manifest Source</option>
              <option value="text">Text / Markdown SOP</option>
              <option value="document_pdf">PDF Document / Whitepaper</option>
              <option value="book_chapter">Book Chapter / Guide</option>
              <option value="video_url">Video Tutorial Transcript</option>
              <option value="webpage_url">Web Documentation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target Agent Runtime
            </label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="universal">Universal (Playwright + JSON Tools + SKILL.md)</option>
              <option value="playwright">Playwright Node/TypeScript Automation</option>
              <option value="anthropic_claude">Claude Computer Use / SKILL.md</option>
              <option value="pwa_service_worker">PWA Service Worker Engine</option>
            </select>
          </div>
        </div>

        {/* Source Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Source SOP, Tutorial, or Process Directives
            </label>
            <span className="text-[11px] text-slate-400">
              {tutorialContent.length} characters
            </span>
          </div>
          <textarea
            id="skill-source-content-textarea"
            rows={8}
            value={tutorialContent}
            onChange={(e) => setTutorialContent(e.target.value)}
            placeholder="Paste procedure steps, SOP guidelines, code patterns, or tool execution instructions..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-2xl p-3.5 focus:ring-1 focus:ring-emerald-500 outline-none font-mono leading-relaxed"
          />
        </div>

        {/* Defense Warning */}
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

        {/* Submit Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {errorMsg ? (
            <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
          ) : (
            <span className="text-xs text-slate-400">
              Generates 5-to-10 atomic steps, assigned agent capability roles, and executable code
            </span>
          )}

          <button
            id="compile-agent-skill-btn"
            onClick={handleBuildSkill}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Compiling 5-10 Directives...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compile Agent Skill Package</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Compiled Skill Output */}
      {skillPackage && (
        <div id="skill-package-output" className="space-y-8 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {skillPackage.directivesCount} DIRECTIVES
                </span>
                <span className="text-xs font-mono text-slate-400">
                  v{skillPackage.version}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {skillPackage.skillName}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {skillPackage.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    skillPackage.skillMarkdown,
                    `${skillPackage.skillName.toLowerCase().replace(/\s+/g, "_")}.md`,
                    "text/markdown"
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download SKILL.md</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    skillPackage.playwrightScript,
                    `test_${skillPackage.skillName.toLowerCase().replace(/\s+/g, "_")}.spec.ts`,
                    "text/typescript"
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Playwright Spec</span>
              </button>
            </div>
          </div>

          {/* 5 to 10 Directives Ordered Step Cards */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Executable 5-to-10 Step Workflow Sequence
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {skillPackage.steps.map((step, idx) => {
                const actionBadge = getActionBadge(step.actionType);
                const roleBadge = getRoleBadge(step.assignedAgentRole);
                return (
                  <div
                    key={step.id || idx}
                    id={`skill-step-${idx}`}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                          {step.order || idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-100">
                          {step.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${actionBadge.bg}`}>
                          {actionBadge.label}
                        </span>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${roleBadge}`}>
                          {step.assignedAgentRole}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                      <strong>Directive:</strong> {step.instruction}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Target / Endpoint:
                        </span>
                        <span className="text-slate-200 font-mono text-[11px] truncate block">
                          {step.target}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Verification Check:
                        </span>
                        <span className="text-emerald-400 text-[11px] block">
                          {step.verificationCheck}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Error Handling:
                        </span>
                        <span className="text-amber-300 text-[11px] block">
                          {step.errorHandling}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Code Viewer Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("markdown")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeCodeTab === "markdown"
                      ? "bg-slate-800 text-cyan-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  SKILL.md Spec
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCodeTab("playwright")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeCodeTab === "playwright"
                      ? "bg-slate-800 text-emerald-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Playwright Automation
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCodeTab("tools")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeCodeTab === "tools"
                      ? "bg-slate-800 text-amber-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Tool Declarations (JSON)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCodeTab("manifest")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeCodeTab === "manifest"
                      ? "bg-slate-800 text-indigo-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  PWA Manifest & Sync
                </button>
              </div>

              {/* Copy Current Tab */}
              <button
                type="button"
                onClick={() => {
                  const contentToCopy =
                    activeCodeTab === "markdown"
                      ? skillPackage.skillMarkdown
                      : activeCodeTab === "playwright"
                      ? skillPackage.playwrightScript
                      : activeCodeTab === "tools"
                      ? skillPackage.toolDefinitionsJson
                      : skillPackage.pwaManifestJson || "";
                  copyCode(contentToCopy, activeCodeTab);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
              >
                {copiedKey === activeCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Output Window */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-x-auto max-h-96">
              <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                {activeCodeTab === "markdown" && skillPackage.skillMarkdown}
                {activeCodeTab === "playwright" && skillPackage.playwrightScript}
                {activeCodeTab === "tools" && skillPackage.toolDefinitionsJson}
                {activeCodeTab === "manifest" && (skillPackage.pwaManifestJson || `// PWA Web App Manifest
{
  "name": "${skillPackage.skillName}",
  "short_name": "1WithOut",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#020617",
  "theme_color": "#020617",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}`)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
