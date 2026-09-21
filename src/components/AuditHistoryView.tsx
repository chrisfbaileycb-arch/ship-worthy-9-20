import React, { useState, useMemo } from "react";
import { AppAuditReport, AxeAuditSummary } from "../types";
import {
  getAuditHistory,
  deleteAuditFromHistory,
  DEFAULT_BASELINE_AUDITS,
} from "../services/auditHistoryService";
import { AuditComparisonModal } from "./AuditComparisonModal";
import { generateAuditPdfReport } from "../services/pdfGenerator";
import {
  History,
  GitCompare,
  Download,
  FileText,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check,
  Search,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";

interface AuditHistoryViewProps {
  onNavigateToMatrix?: () => void;
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({
  onNavigateToMatrix,
}) => {
  const [history, setHistory] = useState<AppAuditReport[]>(() => getAuditHistory());
  const [selectedReport, setSelectedReport] = useState<AppAuditReport | null>(() => {
    const list = getAuditHistory();
    return list.length > 0 ? list[0] : null;
  });
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const refreshHistory = () => {
    const updated = getAuditHistory();
    setHistory(updated);
    if (!selectedReport && updated.length > 0) {
      setSelectedReport(updated[0]);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remove this audit record from local history?")) {
      const remaining = deleteAuditFromHistory(id);
      setHistory(remaining);
      if (selectedReport?.id === id) {
        setSelectedReport(remaining.length > 0 ? remaining[0] : null);
      }
    }
  };

  const handleExportPdf = (report: AppAuditReport, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsExportingPdf(true);
    try {
      generateAuditPdfReport({
        report,
        auditorName: "1WithOut Automated Launch Matrix & Verification Engine",
      });
    } catch (err) {
      console.error("Failed to generate PDF audit report:", err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 800);
    }
  };

  const handleExportJson = (report: AppAuditReport, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.appName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_audit_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = (report: AppAuditReport, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const md = `# 1WithOut Launch Verification Report: ${report.appName}
**Generated**: ${new Date(report.createdAt).toLocaleString()}
**Launch Readiness Score**: ${report.launchReadinessScore}/100 (${report.status})
**Target Environment**: ${report.liveUrl || "Local Container"}
**Repository**: ${report.repoUrl || "N/A"}

## 6-Pillar Summary
${report.pillars.map((p) => `- **${p.name}**: ${p.score}/100 — ${p.summary}`).join("\n")}

## Detailed Pillar Findings
${report.pillars
  .map(
    (p) => `### ${p.name} (Score: ${p.score}/100)
${p.checks.map((c) => `- [${c.status}] **${c.name}**: ${c.description}\n  *Remediation*: ${c.recommendedFix}`).join("\n")}
`
  )
  .join("\n")}
`;
    navigator.clipboard.writeText(md);
    setCopiedId(report.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        item.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.liveUrl && item.liveUrl.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [history, searchQuery, filterStatus]);

  const activeReport = selectedReport || (history.length > 0 ? history[0] : null);

  return (
    <div id="audit-history-view" className="space-y-8 py-6 max-w-7xl mx-auto px-4 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Verified Audit History & Report Exporter
            </h1>
            <span className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-semibold text-cyan-400">
              <span>{history.length} Saved Records</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirical audit trail, baseline-to-session diff comparisons, and formal PDF/JSON verification exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {activeReport && (
            <>
              <button
                id="audit-history-compare-btn"
                type="button"
                onClick={() => setIsComparisonOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-all shadow-sm"
              >
                <GitCompare className="w-4 h-4 text-emerald-400" />
                <span>Compare Sessions (Diff)</span>
              </button>

              <button
                id="audit-history-export-pdf-btn"
                type="button"
                onClick={() => handleExportPdf(activeReport)}
                disabled={isExportingPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPdf ? "Compiling PDF..." : "Export PDF Dossier"}</span>
              </button>
            </>
          )}

          {onNavigateToMatrix && (
            <button
              id="audit-history-run-new-btn"
              type="button"
              onClick={onNavigateToMatrix}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Run New QA Matrix</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Historical List & Filters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                Audit Registry
              </span>
              <span>{filteredHistory.length} of {history.length}</span>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by app name or URL..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="SHIPWORTHY">Shipworthy</option>
                <option value="CONDITIONAL">Conditional</option>
                <option value="LAUNCH_BLOCKED">Blocked</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No audit reports match your search query.
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const isSelected = activeReport?.id === item.id;
                  const isHealthy = item.launchReadinessScore >= 85;
                  const isBlocked = item.status === "LAUNCH_BLOCKED" || item.launchReadinessScore < 60;

                  return (
                    <div
                      key={item.id}
                      id={`audit-history-item-${item.id}`}
                      onClick={() => setSelectedReport(item)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-800/90 border-cyan-500/60 shadow-md shadow-cyan-950/20"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-200">
                              {item.appName}
                            </h3>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                isHealthy
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : isBlocked
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className={`px-2 py-1 rounded-lg text-xs font-bold font-mono ${
                              isHealthy
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                                : isBlocked
                                ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                                : "bg-amber-950/80 text-amber-300 border border-amber-800"
                            }`}
                          >
                            {item.launchReadinessScore}%
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item.id, e)}
                            title="Delete this audit record"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Pillar Mini-Bar */}
                      <div className="grid grid-cols-6 gap-1 mt-3 pt-2 border-t border-slate-800/60">
                        {item.pillars.slice(0, 6).map((pil, idx) => (
                          <div key={idx} className="text-center" title={`${pil.name}: ${pil.score}%`}>
                            <div className="text-[8px] text-slate-500 truncate">{pil.pillarId.slice(0, 3).toUpperCase()}</div>
                            <div
                              className={`h-1.5 rounded-full mt-0.5 ${
                                pil.score >= 85
                                  ? "bg-emerald-400"
                                  : pil.score >= 60
                                  ? "bg-amber-400"
                                  : "bg-rose-500"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Report Overview & Direct Exporter */}
        <div className="lg:col-span-7 space-y-4">
          {activeReport ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              {/* Target Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {activeReport.appName}
                    </h2>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        activeReport.launchReadinessScore >= 85
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : activeReport.launchReadinessScore < 60
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {activeReport.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    ID: {activeReport.id} • Verified {new Date(activeReport.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleExportPdf(activeReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportJson(activeReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                    <span>JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportMarkdown(activeReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedId === activeReport.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{copiedId === activeReport.id ? "Copied!" : "Markdown"}</span>
                  </button>
                </div>
              </div>

              {/* Score & Endpoints Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Launch Readiness Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white">
                      {activeReport.launchReadinessScore}%
                    </span>
                    <span className="text-xs text-slate-400">/ 100 max</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Target Live URL
                  </span>
                  <div className="mt-1 text-xs text-slate-200 font-mono truncate">
                    {activeReport.liveUrl ? (
                      <a
                        href={activeReport.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{activeReport.liveUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-500">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Target Repository
                  </span>
                  <div className="mt-1 text-xs text-slate-200 font-mono truncate">
                    {activeReport.repoUrl ? (
                      <a
                        href={activeReport.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{activeReport.repoUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-500">Local Container</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 6-Pillar Detailed Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  6-Pillar Audit Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeReport.pillars.map((pillar) => (
                    <div
                      key={pillar.pillarId}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          {pillar.name}
                        </span>
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            pillar.score >= 85
                              ? "text-emerald-400 bg-emerald-500/10"
                              : pillar.score >= 60
                              ? "text-amber-400 bg-amber-500/10"
                              : "text-rose-400 bg-rose-500/10"
                          }`}
                        >
                          {pillar.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {pillar.summary}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>{pillar.checks.length} checks performed</span>
                        <span>•</span>
                        <span className="text-emerald-400">
                          {pillar.checks.filter((c) => c.status === "PASSED").length} passed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-Launch Cadence */}
              {activeReport.cadenceSchedule && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Review Cadence Plan (30d / 90d / 180d)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="font-bold text-cyan-400 block text-[11px]">30-Day Checklist</span>
                      <ul className="text-[11px] text-slate-400 list-disc list-inside mt-1 space-y-0.5">
                        {activeReport.cadenceSchedule.day30Tasks.slice(0, 2).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="font-bold text-amber-400 block text-[11px]">90-Day Security</span>
                      <ul className="text-[11px] text-slate-400 list-disc list-inside mt-1 space-y-0.5">
                        {activeReport.cadenceSchedule.day90Tasks.slice(0, 2).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="font-bold text-emerald-400 block text-[11px]">180-Day Architecture</span>
                      <ul className="text-[11px] text-slate-400 list-disc list-inside mt-1 space-y-0.5">
                        {activeReport.cadenceSchedule.day180Tasks.slice(0, 2).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No Audit Sessions Found
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Run an empirical verification scan in the 6-Pillar QA Matrix to record structured audit snapshots and launch comparisons.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Audit Comparison Modal */}
      {activeReport && (
        <AuditComparisonModal
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          currentReport={activeReport}
        />
      )}
    </div>
  );
};
