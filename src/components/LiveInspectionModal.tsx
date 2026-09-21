import React, { useState } from "react";
import { LiveInspectionReport } from "../types";
import { inspectLiveTarget } from "../services/api";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Code2,
  RefreshCw,
  X,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

interface LiveInspectionModalProps {
  initialUrl?: string;
  onClose: () => void;
  onSaveReport?: (report: LiveInspectionReport) => void;
}

export const LiveInspectionModal: React.FC<LiveInspectionModalProps> = ({
  initialUrl = "https://1without.io",
  onClose,
  onSaveReport,
}) => {
  const [targetUrl, setTargetUrl] = useState<string>(initialUrl);
  const [rawHtml, setRawHtml] = useState<string>("");
  const [inputType, setInputType] = useState<"url" | "html">("url");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<LiveInspectionReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runInspection = async () => {
    if (inputType === "url" && !targetUrl.trim()) return;
    if (inputType === "html" && !rawHtml.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await inspectLiveTarget({
        targetUrl: inputType === "url" ? targetUrl.trim() : undefined,
        rawHtml: inputType === "html" ? rawHtml : undefined,
      });
      setReport(data);
      if (onSaveReport) {
        onSaveReport(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Inspection failed. Check network connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="live-inspection-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="live-inspection-modal"
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Vendor-Agnostic Live HTML & Security Detector
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Automated HTTP header verification, DOM script audits, PWA manifest detection, and tailored remediation directives.
            </p>
          </div>
          <button
            id="close-live-inspection-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Controls */}
        <div className="space-y-4 shrink-0">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputType("url")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                inputType === "url"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live URL Target</span>
            </button>
            <button
              type="button"
              onClick={() => setInputType("html")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                inputType === "html"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw HTML Bundle</span>
            </button>
          </div>

          {inputType === "url" ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="live-inspection-url-input"
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://your-production-app.run.app"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                id="run-live-inspection-btn"
                type="button"
                onClick={runInspection}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inspecting Headers...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Inspect Target</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                id="live-inspection-html-input"
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                rows={5}
                placeholder="Paste raw index.html markup here to inspect meta tags, scripts, and service worker declarations..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                id="run-html-inspection-btn"
                type="button"
                onClick={runInspection}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Parsing DOM Markup...</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-4 h-4" />
                    <span>Analyze HTML DOM</span>
                  </>
                )}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Inspection Report Display */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {!report && !isLoading && (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs sm:text-sm">
              Enter a live URL or paste HTML to perform an automated header and DOM security inspection.
            </div>
          )}

          {report && (
            <div className="space-y-6">
              {/* Scorecard Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Score</div>
                    <div className="text-2xl font-black text-white mt-1">{report.overallScore}/100</div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      report.status === "PASSED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : report.status === "WARNING"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {report.status}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Framework Detected</div>
                  <div className="text-sm font-semibold text-cyan-300 mt-1.5 truncate">
                    {report.domInspection.framework}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PWA Manifest</div>
                  <div className="text-sm font-semibold mt-1.5 flex items-center gap-1.5">
                    {report.domInspection.pwaManifestDetected ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Detected
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missing
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service Worker</div>
                  <div className="text-sm font-semibold mt-1.5 flex items-center gap-1.5">
                    {report.domInspection.serviceWorkerDetected ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Cache
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Not Registered
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1. Header Audit Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>HTTP Security Headers Audit</span>
                </h3>
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Security Header</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Detected Value</th>
                        <th className="p-3">Remediation Directive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono">
                      {report.headers.map((h, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-slate-200">{h.name}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                h.status === "PASSED"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : h.status === "WARNING"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 max-w-xs truncate text-[11px]">
                            {h.value}
                          </td>
                          <td className="p-3 text-slate-400 font-sans text-[11px] leading-relaxed">
                            {h.remediation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. DOM & Script Inspection */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>DOM & Dependency Inspection</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Meta Tags Detected:</span>
                    <span className="font-bold text-slate-200 ml-2">{report.domInspection.metaTagsCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Script Tags:</span>
                    <span className="font-bold text-slate-200 ml-2">{report.domInspection.scriptsCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">PWA Manifest Link:</span>
                    <span className="font-mono text-emerald-400 ml-2 truncate inline-block max-w-[120px]">
                      {report.domInspection.manifestUrl || "None"}
                    </span>
                  </div>
                  {report.domInspection.externalDependencies.length > 0 && (
                    <div className="sm:col-span-3 pt-2 border-t border-slate-900">
                      <span className="text-slate-400 block mb-1">External Origins Connected:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.domInspection.externalDependencies.map((dep, dIdx) => (
                          <span
                            key={dIdx}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Tailored Security Recommendations */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Tailored Security & Remediation Directives</span>
                </h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  {report.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                      <span className="font-mono text-[11px]">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <div className="text-xs text-slate-400">
            {report?.checkedAt ? `Audited at ${new Date(report.checkedAt).toLocaleTimeString()}` : "Ready to inspect target"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
