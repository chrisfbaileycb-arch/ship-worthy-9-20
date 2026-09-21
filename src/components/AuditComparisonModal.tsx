import React, { useState, useMemo } from "react";
import { AppAuditReport, AxeAuditSummary, CheckStatus } from "../types";
import {
  AuditComparisonDiff,
  computeAuditDiff,
  getAuditHistory,
  CheckDiffItem,
} from "../services/auditHistoryService";
import { CircularProgressIndicator } from "./CircularProgressIndicator";
import {
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  ShieldCheck,
  Server,
  Scale,
  FileCode,
  Activity,
  CalendarCheck,
  Filter,
  Copy,
  Check,
  Download,
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Sparkles,
} from "lucide-react";

interface AuditComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReport: AppAuditReport;
  axeSummary?: AxeAuditSummary | null;
  onSaveSnapshot?: (report: AppAuditReport) => void;
}

export const AuditComparisonModal: React.FC<AuditComparisonModalProps> = ({
  isOpen,
  onClose,
  currentReport,
  axeSummary,
}) => {
  const [historyList] = useState<AppAuditReport[]>(() => {
    const list = getAuditHistory();
    // Filter out currentReport id so we don't compare the identical session against itself by default
    return list.filter((item) => item.id !== currentReport.id);
  });

  const [selectedBaselineId, setSelectedBaselineId] = useState<string>(() => {
    const list = getAuditHistory().filter((item) => item.id !== currentReport.id);
    return list.length > 0 ? list[0].id : "";
  });

  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>("all");
  const [selectedChangeTypeFilter, setSelectedChangeTypeFilter] = useState<
    "all" | "improved" | "regressed" | "unresolved_issue" | "maintained_passed"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const baselineReport = useMemo(() => {
    const all = getAuditHistory();
    return all.find((item) => item.id === selectedBaselineId) || all[0];
  }, [selectedBaselineId]);

  const diff: AuditComparisonDiff = useMemo(() => {
    if (!baselineReport) {
      return computeAuditDiff(currentReport, currentReport);
    }
    return computeAuditDiff(baselineReport, currentReport);
  }, [baselineReport, currentReport]);

  const filteredChecks = useMemo(() => {
    return diff.checkDiffs.filter((item) => {
      if (selectedPillarFilter !== "all" && item.pillarId !== selectedPillarFilter) {
        return false;
      }
      if (selectedChangeTypeFilter !== "all" && item.changeType !== selectedChangeTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.checkName.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchPillar = item.pillarName.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchPillar) return false;
      }
      return true;
    });
  }, [diff.checkDiffs, selectedPillarFilter, selectedChangeTypeFilter, searchQuery]);

  if (!isOpen) return null;

  const getPillarIcon = (pillarId: string) => {
    switch (pillarId) {
      case "security":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "infra":
        return <Server className="w-4 h-4 text-blue-600" />;
      case "legal":
        return <Scale className="w-4 h-4 text-purple-600" />;
      case "claims":
        return <FileCode className="w-4 h-4 text-amber-600" />;
      case "qa":
        return <Activity className="w-4 h-4 text-teal-600" />;
      case "maintenance":
        return <CalendarCheck className="w-4 h-4 text-indigo-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>Passed</span>
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            <span>Warning</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            <span>N/A</span>
          </span>
        );
    }
  };

  const handleCopyMarkdownSummary = () => {
    const lines = [
      `# 📊 Pre-Flight Launch Health Comparison Diff`,
      `**Target Application:** ${currentReport.appName}`,
      `**Baseline Session:** ${baselineReport.appName} (${new Date(baselineReport.createdAt).toLocaleDateString()}) — Readiness: ${baselineReport.launchReadinessScore}/100`,
      `**Current Session:** ${currentReport.appName} (${new Date(currentReport.createdAt).toLocaleDateString()}) — Readiness: ${currentReport.launchReadinessScore}/100`,
      `**Readiness Delta:** ${diff.scoreDelta >= 0 ? `+${diff.scoreDelta}%` : `${diff.scoreDelta}%`} (${diff.trendLabel})`,
      `**Matrix Transition:** ${diff.statusTransition.from} ➔ ${diff.statusTransition.to}`,
      ``,
      `### 🏆 Executive Health Metrics`,
      `- ✨ **Resolved / Improved Checks:** ${diff.totalImprovedChecks}`,
      `- ⚠️ **Regressed Checks:** ${diff.totalRegressedChecks}`,
      `- 🔴 **Unresolved Issues:** ${diff.totalUnresolvedIssues}`,
      `- ✅ **Maintained Stable Checks:** ${diff.totalMaintainedPassed}`,
      ``,
      `### 🏛️ 6-Pillar Score Deltas`,
    ];

    diff.pillarDiffs.forEach((p) => {
      const deltaSign = p.scoreDelta >= 0 ? `+${p.scoreDelta}%` : `${p.scoreDelta}%`;
      lines.push(
        `- **${p.pillarName}:** ${p.baselineScore}% ➔ ${p.currentScore}% (${deltaSign}) [${p.improvedChecksCount} fixed, ${p.regressedChecksCount} regressed]`
      );
    });

    lines.push(``);
    lines.push(`### 🔍 Key Resolved & Changed Checks`);
    diff.checkDiffs
      .filter((c) => c.changeType === "improved" || c.changeType === "regressed")
      .forEach((c) => {
        const icon = c.changeType === "improved" ? "✨ [RESOLVED]" : "⚠️ [REGRESSION]";
        lines.push(`- ${icon} **${c.checkName}** (${c.pillarName}): ${c.baselineStatus} ➔ ${c.currentStatus}`);
        lines.push(`  *Detail:* ${c.description}`);
      });

    navigator.clipboard.writeText(lines.join("\n"));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-comparison-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="audit-comparison-title" className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Side-by-Side Audit Session Comparison</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Health Diff
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Track regressions, verified remediation patches, and readiness progression across audit runs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdownSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Copy Markdown comparison summary for PR review"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied Diff!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy PR Diff</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Session Selectors (Side-by-Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Baseline Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Baseline / Prior Audit Session</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-600">
                  {baselineReport ? `${baselineReport.launchReadinessScore}/100 Score` : ""}
                </span>
              </div>

              <select
                id="baseline-session-select"
                value={selectedBaselineId}
                onChange={(e) => setSelectedBaselineId(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                {historyList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.appName} — {new Date(item.createdAt).toLocaleDateString()} ({item.launchReadinessScore}% Score - {item.status})
                  </option>
                ))}
              </select>

              {baselineReport && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Status: <strong className="text-slate-700">{baselineReport.status}</strong></span>
                  <span>Recorded: {new Date(baselineReport.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Right: Current Session */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Current Active Audit Session</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-700">
                  {currentReport.launchReadinessScore}/100 Score
                </span>
              </div>

              <div className="bg-white border border-emerald-300 text-slate-900 text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="truncate">{currentReport.appName} (Latest Verification)</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Status: <strong className="text-emerald-800">{currentReport.status}</strong></span>
                <span>Scanned: {new Date(currentReport.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Executive Health Progression Banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="relative shrink-0">
                <CircularProgressIndicator
                  progress={currentReport.launchReadinessScore}
                  size={80}
                  strokeWidth={7}
                  showPercentageText={true}
                  colorVariant={
                    diff.scoreDelta >= 0 ? "emerald" : "cyan"
                  }
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      diff.scoreDelta > 0
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : diff.scoreDelta < 0
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {diff.scoreDelta > 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                    ) : diff.scoreDelta < 0 ? (
                      <ArrowDownRight className="w-3 h-3 text-rose-700" />
                    ) : (
                      <Minus className="w-3 h-3 text-slate-500" />
                    )}
                    <span>
                      {diff.scoreDelta >= 0 ? `+${diff.scoreDelta}%` : `${diff.scoreDelta}%`} Readiness Delta
                    </span>
                  </span>

                  <span className="text-xs font-bold text-slate-500">
                    ({baselineReport?.launchReadinessScore}% ➔ {currentReport.launchReadinessScore}%)
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {diff.trendLabel}
                </h3>
                <p className="text-xs text-slate-600">
                  Matrix clearance moved from <strong className="font-semibold text-slate-800">{diff.statusTransition.from}</strong> to{" "}
                  <strong className="font-semibold text-emerald-700">{diff.statusTransition.to}</strong>.
                </p>
              </div>
            </div>

            {/* Health Metrics Summary Pill Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto shrink-0">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-base font-extrabold text-emerald-800">
                  +{diff.totalImprovedChecks}
                </div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Resolved
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <div className="text-base font-extrabold text-rose-800">
                  {diff.totalRegressedChecks}
                </div>
                <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Regressions
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-base font-extrabold text-amber-800">
                  {diff.totalUnresolvedIssues}
                </div>
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  Unresolved
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-base font-extrabold text-slate-700">
                  {diff.totalMaintainedPassed}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Stable
                </div>
              </div>
            </div>
          </div>

          {/* 6-Pillar Progression Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>6-Pillar Health Score Delta</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Click any pillar to filter checks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {diff.pillarDiffs.map((p) => {
                const isSelected = selectedPillarFilter === p.pillarId;
                const isPositive = p.scoreDelta > 0;
                const isNegative = p.scoreDelta < 0;

                return (
                  <button
                    key={p.pillarId}
                    type="button"
                    onClick={() =>
                      setSelectedPillarFilter(isSelected ? "all" : p.pillarId)
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                          {getPillarIcon(p.pillarId)}
                        </div>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {p.pillarName.split(" ")[0]}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                          isPositive
                            ? "bg-emerald-100 text-emerald-800"
                            : isNegative
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {p.scoreDelta}%
                      </span>
                    </div>

                    {/* Progress Bar Comparison */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          {p.baselineScore}% ➔ <strong className="text-slate-900">{p.currentScore}%</strong>
                        </span>
                        <span className="text-[10px]">
                          {p.improvedChecksCount > 0 && (
                            <span className="text-emerald-700 font-semibold mr-1">
                              +{p.improvedChecksCount} fix
                            </span>
                          )}
                          {p.regressedChecksCount > 0 && (
                            <span className="text-rose-700 font-semibold">
                              -{p.regressedChecksCount} reg
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-slate-400 h-full transition-all"
                          style={{ width: `${Math.min(100, p.baselineScore)}%` }}
                          title={`Baseline: ${p.baselineScore}%`}
                        />
                        {isPositive && (
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${p.scoreDelta}%` }}
                            title={`Delta: +${p.scoreDelta}%`}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Check-by-Check Diff Matrix */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedChangeTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedChangeTypeFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Checks ({diff.checkDiffs.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChangeTypeFilter("improved")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedChangeTypeFilter === "improved"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Improvements ({diff.totalImprovedChecks})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChangeTypeFilter("regressed")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedChangeTypeFilter === "regressed"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Regressions ({diff.totalRegressedChecks})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChangeTypeFilter("unresolved_issue")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedChangeTypeFilter === "unresolved_issue"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <span>Unresolved ({diff.totalUnresolvedIssues})</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter check title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                />
              </div>
            </div>

            {/* Check Diff Rows */}
            <div className="space-y-2.5">
              {filteredChecks.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No checks found matching current filters.
                </div>
              ) : (
                filteredChecks.map((chk) => {
                  const isImproved = chk.changeType === "improved";
                  const isRegressed = chk.changeType === "regressed";
                  const isUnresolved = chk.changeType === "unresolved_issue";

                  return (
                    <div
                      key={chk.checkId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isImproved
                          ? "bg-emerald-50/50 border-emerald-200/90 shadow-2xs"
                          : isRegressed
                          ? "bg-rose-50/60 border-rose-200/90 shadow-2xs"
                          : isUnresolved
                          ? "bg-amber-50/30 border-amber-200"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0 mt-0.5">
                            {getPillarIcon(chk.pillarId)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-xs font-bold text-slate-900">
                                {chk.checkName}
                              </h5>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({chk.pillarName})
                              </span>
                              {isImproved && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ✨ Resolved / Fixed
                                </span>
                              )}
                              {isRegressed && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                  ⚠️ Regression
                                </span>
                              )}
                              {isUnresolved && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  🔴 Still Open
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                              {chk.description}
                            </p>
                          </div>
                        </div>

                        {/* Side-by-Side Status Transition Box */}
                        <div className="flex items-center gap-2 shrink-0 bg-white/90 p-2 rounded-xl border border-slate-200/80">
                          <div className="text-center">
                            <span className="block text-[9px] uppercase font-bold text-slate-400">Baseline</span>
                            {getStatusBadge(chk.baselineStatus)}
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="text-center">
                            <span className="block text-[9px] uppercase font-bold text-emerald-600">Current</span>
                            {getStatusBadge(chk.currentStatus)}
                          </div>
                        </div>
                      </div>

                      {chk.recommendedFix && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5">
                          <strong className="text-slate-700">Directive:</strong>
                          <span>{chk.recommendedFix}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Comparing <strong className="text-slate-800">{baselineReport?.appName}</strong> vs{" "}
            <strong className="text-emerald-700">{currentReport.appName}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
