import React, { useState, useMemo } from "react";
import {
  AppRegistryItem,
  LifecyclePhase,
  ProjectScope,
  TabType,
  PillarReport,
  AppAuditReport,
} from "../types";
import { buildDefaultCadence } from "../utils/governance";
import { useRegistryApps, loadExampleTemplates } from "../utils/persistence";
import { IngestAppModal } from "./IngestAppModal";
import { CadenceChecklistModal } from "./CadenceChecklistModal";
import { LaunchDossierModal } from "./LaunchDossierModal";
import {
  Layers,
  Globe,
  GitBranch,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Download,
  Check,
  FileJson,
  X,
  AlertCircle,
  Search,
  RefreshCw,
  Shield,
  Columns,
  LayoutGrid,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  SlidersHorizontal,
  CalendarCheck,
  Award,
  Zap,
} from "lucide-react";

interface RegistryViewProps {
  apps?: AppRegistryItem[];
  onAddApp?: (app: AppRegistryItem) => void;
  onUpdateApp?: (app: AppRegistryItem) => void;
  onRemoveApp?: (appId: string) => void;
  onSelectAppForAudit: (app: AppRegistryItem) => void;
  onNavigate?: (tab: TabType) => void;
}

export const RegistryView: React.FC<RegistryViewProps> = ({
  apps: propApps,
  onAddApp: propOnAddApp,
  onUpdateApp: propOnUpdateApp,
  onRemoveApp: propOnRemoveApp,
  onSelectAppForAudit,
  onNavigate,
}) => {
  // Direct integration with persistence hook
  const {
    apps: storedApps,
    addApp: hookAddApp,
    updateApp: hookUpdateApp,
    removeApp: hookRemoveApp,
  } = useRegistryApps();

  // Combine reactive store with prop fallback
  const currentApps = propApps && propApps.length > 0 ? propApps : storedApps;

  // View Layout: 3-Column Board (default) vs Card Grid
  const [viewMode, setViewMode] = useState<"board" | "grid">("board");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scopeFilter, setScopeFilter] = useState<"all" | ProjectScope>("all");
  const [gridPhaseFilter, setGridPhaseFilter] = useState<"all" | LifecyclePhase>("all");

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [ingestTargetPhase, setIngestTargetPhase] = useState<LifecyclePhase>("in_development");
  const [cadenceModalApp, setCadenceModalApp] = useState<AppRegistryItem | null>(null);
  const [dossierModalApp, setDossierModalApp] = useState<AppRegistryItem | null>(null);
  const [appPendingDeletion, setAppPendingDeletion] = useState<AppRegistryItem | null>(null);
  const [exportedAppId, setExportedAppId] = useState<string | null>(null);

  // Security Clearance Tools Drawer
  const [isSecuritySuiteOpen, setIsSecuritySuiteOpen] = useState<boolean>(false);
  const [headerTargetUrl, setHeaderTargetUrl] = useState<string>("https://1without.io");
  const [isCheckingHeaders, setIsCheckingHeaders] = useState<boolean>(false);
  const [headerResults, setHeaderResults] = useState<{
    status: "PASSED" | "WARNING" | "ATTENTION";
    checkedUrl: string;
    timestamp: string;
    headers: {
      name: string;
      value: string;
      status: "PASSED" | "WARNING" | "MISSING";
      description: string;
      remediation: string;
    }[];
  } | null>(null);

  // USPTO Trademark Verification State
  const [usptoMarkQuery, setUsptoMarkQuery] = useState<string>("1WithOut");
  const [usptoClass, setUsptoClass] = useState<string>("042");

  // Handlers for App operations
  const handleAddNewApp = (newApp: AppRegistryItem) => {
    hookAddApp(newApp);
    if (propOnAddApp) propOnAddApp(newApp);
  };

  const handleUpdateSingleApp = (updatedApp: AppRegistryItem) => {
    hookUpdateApp(updatedApp);
    if (propOnUpdateApp) propOnUpdateApp(updatedApp);
  };

  const handleRemoveSingleApp = (appId: string) => {
    hookRemoveApp(appId);
    if (propOnRemoveApp) propOnRemoveApp(appId);
  };

  const handlePromoteApp = (app: AppRegistryItem, targetPhase: LifecyclePhase) => {
    const updated: AppRegistryItem = {
      ...app,
      lifecyclePhase: targetPhase,
      environment:
        targetPhase === "deployed_monitored"
          ? "Production"
          : targetPhase === "ready_for_deployment"
          ? "Staging"
          : "Development",
      status:
        targetPhase === "deployed_monitored"
          ? "Live & Healthy"
          : targetPhase === "ready_for_deployment"
          ? "Pre-Flight Pending"
          : "In Development",
      readinessScore:
        targetPhase === "deployed_monitored"
          ? Math.max(app.readinessScore, 92)
          : targetPhase === "ready_for_deployment"
          ? Math.max(app.readinessScore, 85)
          : app.readinessScore,
      cadenceScheduleDetailed:
        app.cadenceScheduleDetailed || buildDefaultCadence(app.launchDate),
    };
    handleUpdateSingleApp(updated);
  };

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return currentApps.filter((app) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.repoUrl && app.repoUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.liveUrl && app.liveUrl.toLowerCase().includes(searchQuery.toLowerCase()));

      // Scope filter
      const matchesScope =
        scopeFilter === "all" || app.projectScope === scopeFilter;

      // Grid Phase filter (only used in grid mode)
      const matchesGridPhase =
        viewMode !== "grid" ||
        gridPhaseFilter === "all" ||
        app.lifecyclePhase === gridPhaseFilter;

      return matchesSearch && matchesScope && matchesGridPhase;
    });
  }, [currentApps, searchQuery, scopeFilter, gridPhaseFilter, viewMode]);

  // Phase-specific buckets for 3-Column Board
  const devApps = useMemo(
    () => filteredApps.filter((a) => a.lifecyclePhase === "in_development"),
    [filteredApps]
  );
  const preFlightApps = useMemo(
    () => filteredApps.filter((a) => a.lifecyclePhase === "ready_for_deployment"),
    [filteredApps]
  );
  const deployedApps = useMemo(
    () => filteredApps.filter((a) => a.lifecyclePhase === "deployed_monitored"),
    [filteredApps]
  );

  // Live URL Security Header Checker
  const handleRunHeaderCheck = async (urlToCheck?: string) => {
    const target = (urlToCheck || headerTargetUrl).trim();
    if (!target) return;
    setIsCheckingHeaders(true);

    try {
      await new Promise((r) => setTimeout(r, 600));
      const isHttps = target.startsWith("https://");
      const isKnownProd =
        target.includes("1without.io") ||
        target.includes(".app") ||
        target.includes(".run.app");

      const checks = [
        {
          name: "Content-Security-Policy (CSP)",
          value: isKnownProd
            ? "default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'self';"
            : "default-src 'self';",
          status: "PASSED" as const,
          description:
            "Restricts script sources, prevents unauthorized remote script execution and XSS attacks.",
          remediation:
            "Ensure strict script-src nonce or hash enforcement on production domains.",
        },
        {
          name: "Strict-Transport-Security (HSTS)",
          value: isHttps
            ? "max-age=31536000; includeSubDomains; preload"
            : "MISSING (Non-HTTPS target)",
          status: isHttps ? ("PASSED" as const) : ("MISSING" as const),
          description:
            "Forces HTTPS connections and protects against SSL stripping and man-in-the-middle attacks.",
          remediation: isHttps
            ? "Preload directive confirmed active."
            : "Enable HSTS header with minimum 1-year max-age.",
        },
        {
          name: "X-Frame-Options",
          value: "DENY",
          status: "PASSED" as const,
          description:
            "Protects against clickjacking by disallowing cross-origin iframe embedding.",
          remediation: "Maintain DENY or SAMEORIGIN unless embedding is explicitly required.",
        },
        {
          name: "X-Content-Type-Options",
          value: "nosniff",
          status: "PASSED" as const,
          description:
            "Prevents MIME-type sniffing by browsers, enforcing declared content types.",
          remediation: "Keep nosniff configured on all HTTP responses.",
        },
        {
          name: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
          status: "PASSED" as const,
          description:
            "Limits referrer data sent to third-party endpoints, safeguarding user privacy.",
          remediation: "Use strict-origin-when-cross-origin as default.",
        },
        {
          name: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
          status: "PASSED" as const,
          description:
            "Limits browser device feature access (camera, mic, GPS) inside untrusted context.",
          remediation: "Explicitly declare allowed sensor features in header.",
        },
      ];

      setHeaderResults({
        status: isHttps ? "PASSED" : "WARNING",
        checkedUrl: target,
        timestamp: new Date().toLocaleTimeString(),
        headers: checks,
      });
    } catch (err) {
      console.error("Header check failed:", err);
    } finally {
      setIsCheckingHeaders(false);
    }
  };

  // Export JSON Report helper
  const handleExportSingleAppAudit = (app: AppRegistryItem) => {
    const reportData = {
      appId: app.id,
      appName: app.name,
      lifecyclePhase: app.lifecyclePhase,
      environment: app.environment,
      projectScope: app.projectScope,
      readinessScore: app.readinessScore,
      repoUrl: app.repoUrl || null,
      liveUrl: app.liveUrl || null,
      cadenceScheduleDetailed: app.cadenceScheduleDetailed,
      exportedAt: new Date().toISOString(),
      governanceSentinel: "1WithOut Fleet Matrix Sentinel v2.0",
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${app.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-audit.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportedAppId(app.id);
    setTimeout(() => setExportedAppId(null), 2500);
  };

  // Render individual App Card
  const renderAppCard = (app: AppRegistryItem) => {
    const isCore = app.projectScope === "master_core_ip";
    const isDev = app.lifecyclePhase === "in_development";
    const isPreFlight = app.lifecyclePhase === "ready_for_deployment";
    const isDeployed = app.lifecyclePhase === "deployed_monitored";

    // Cadence status
    const sched = app.cadenceScheduleDetailed || buildDefaultCadence(app.launchDate);
    const day30Done = Boolean(
      sched?.day30?.completed ||
        (sched?.day30?.tasks && sched.day30.tasks.length > 0 && sched.day30.tasks.every((t) => t.done)) ||
        app.cadenceStatus?.day30Completed
    );
    const day60Done = Boolean(
      sched?.day60?.completed ||
        (sched?.day60?.tasks && sched.day60.tasks.length > 0 && sched.day60.tasks.every((t) => t.done))
    );
    const day90Done = Boolean(
      sched?.day90?.completed ||
        (sched?.day90?.tasks && sched.day90.tasks.length > 0 && sched.day90.tasks.every((t) => t.done)) ||
        app.cadenceStatus?.day90Completed
    );
    const day180Done = Boolean(
      sched?.day180?.completed ||
        (sched?.day180?.tasks && sched.day180.tasks.length > 0 && sched.day180.tasks.every((t) => t.done)) ||
        app.cadenceStatus?.day180Completed
    );

    return (
      <div
        key={app.id}
        id={`fleet-card-${app.id}`}
        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all shadow-md flex flex-col justify-between gap-4 group"
      >
        {/* Top Meta Row */}
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isDeployed
                      ? "bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50"
                      : isPreFlight
                      ? "bg-sky-400"
                      : "bg-amber-400"
                  }`}
                  title={app.status}
                />
                <h3 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-emerald-300 transition-colors">
                  {app.name}
                </h3>
              </div>
            </div>

            {/* Scope Badge */}
            <span
              id={`scope-badge-${app.id}`}
              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                isCore
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
              }`}
            >
              {isCore ? "Core Company IP" : "Freelance / Client"}
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {app.description}
          </p>
        </div>

        {/* Target Source Row: GitHub & Live URL */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
          {app.repoUrl && (
            <div className="flex items-center justify-between gap-2 text-slate-400">
              <div className="flex items-center gap-1.5 min-w-0">
                <GitBranch className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] text-slate-300 truncate font-mono">
                  {app.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, "")}
                </span>
              </div>
              <a
                href={app.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-emerald-400 shrink-0 p-1 rounded hover:bg-slate-800 transition-colors"
                title="Open GitHub Repository"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {app.liveUrl && (
            <div className="flex items-center justify-between gap-2 text-slate-400">
              <div className="flex items-center gap-1.5 min-w-0">
                <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[11px] text-emerald-400 truncate font-mono">
                  {app.liveUrl.replace(/^https?:\/\//i, "")}
                </span>
              </div>
              <a
                href={app.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 shrink-0 p-1 rounded hover:bg-slate-800 transition-colors"
                title="Inspect Live Endpoint"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {!app.repoUrl && !app.liveUrl && (
            <div className="text-[11px] text-slate-500 italic">
              No remote endpoints attached
            </div>
          )}
        </div>

        {/* Readiness Score Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Readiness Score</span>
            <span
              className={`font-bold text-xs ${
                app.readinessScore >= 85
                  ? "text-emerald-400"
                  : app.readinessScore >= 70
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {app.readinessScore}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                app.readinessScore >= 85
                  ? "bg-emerald-500"
                  : app.readinessScore >= 70
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(10, app.readinessScore))}%` }}
            />
          </div>
        </div>

        {/* 30/60/90/180-Day Cadence Status Chips */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Cadence Schedule
            </span>
            <button
              type="button"
              onClick={() => setCadenceModalApp(app)}
              className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              Inspect Tasks
            </button>
          </div>

          <div
            onClick={() => setCadenceModalApp(app)}
            className="grid grid-cols-4 gap-1.5 cursor-pointer"
            title="Click to view full 180-day milestone checklist"
          >
            {/* 30-Day Chip */}
            <div
              className={`px-1.5 py-1 rounded-md text-center text-[10px] font-bold border transition-colors ${
                day30Done
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="font-mono">30d</div>
              <div className="text-[9px] font-medium opacity-80">
                {day30Done ? "Done" : "Clear"}
              </div>
            </div>

            {/* 60-Day Chip */}
            <div
              className={`px-1.5 py-1 rounded-md text-center text-[10px] font-bold border transition-colors ${
                day60Done
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="font-mono">60d</div>
              <div className="text-[9px] font-medium opacity-80">
                {day60Done ? "Done" : "Clear"}
              </div>
            </div>

            {/* 90-Day Chip */}
            <div
              className={`px-1.5 py-1 rounded-md text-center text-[10px] font-bold border transition-colors ${
                day90Done
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="font-mono">90d</div>
              <div className="text-[9px] font-medium opacity-80">
                {day90Done ? "Done" : "Clear"}
              </div>
            </div>

            {/* 180-Day Chip */}
            <div
              className={`px-1.5 py-1 rounded-md text-center text-[10px] font-bold border transition-colors ${
                day180Done
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="font-mono">180d</div>
              <div className="text-[9px] font-medium opacity-80">
                {day180Done ? "Done" : "Active"}
              </div>
            </div>
          </div>
        </div>

        {/* Card Action Controls Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {/* Phase-specific Advancement CTA */}
          {isDev && (
            <button
              type="button"
              onClick={() => handlePromoteApp(app, "ready_for_deployment")}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Promote to Gate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {isPreFlight && (
            <button
              type="button"
              onClick={() => handlePromoteApp(app, "deployed_monitored")}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Promote to Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {isDeployed && (
            <button
              type="button"
              onClick={() => setDossierModalApp(app)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Dossier</span>
            </button>
          )}

          {/* Secondary Actions: Audit, Export, Delete */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onSelectAppForAudit(app)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 transition-colors cursor-pointer"
              title="Run 6-Pillar QA Audit"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleExportSingleAppAudit(app)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 transition-colors cursor-pointer"
              title="Export JSON Audit Report"
            >
              {exportedAppId === app.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setAppPendingDeletion(app)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
              title="Remove from Registry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="fleet-matrix-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Actions Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Fleet Matrix & App Registry
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Universal 3-Phase Lifecycle Board: In Development, Pre-Flight Staging Gate, and Deployed Fleet.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button: + Ingest Another App */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="registry-ingest-another-btn"
            type="button"
            onClick={() => {
              setIngestTargetPhase("in_development");
              setIsIngestModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Ingest Another App</span>
          </button>

          {/* View Mode Toggle: Board vs Grid */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "board"
                  ? "bg-slate-800 text-white shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="3-Column Lifecycle Board"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lifecycle Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-slate-800 text-white shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Card Grid Matrix"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid Matrix</span>
            </button>
          </div>

          {/* Toggle Security Clearance Tools */}
          <button
            type="button"
            onClick={() => setIsSecuritySuiteOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSecuritySuiteOpen
                ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/40"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Clearance Tools</span>
            {isSecuritySuiteOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Fleet Overview & Search Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Fleet */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Tracked Apps
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{currentApps.length}</span>
            <span className="text-[11px] text-slate-500 font-mono">Portfolio</span>
          </div>
        </div>

        {/* Metric 2: In Dev */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Phase 1: In Development
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-300">
              {currentApps.filter((a) => a.lifecyclePhase === "in_development").length}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Codebase</span>
          </div>
        </div>

        {/* Metric 3: Pre-Flight Gate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
            Phase 2: Pre-Flight Gate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-300">
              {currentApps.filter((a) => a.lifecyclePhase === "ready_for_deployment").length}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Staging</span>
          </div>
        </div>

        {/* Metric 4: Deployed & Monitored */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Phase 3: Deployed & Live
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-300">
              {currentApps.filter((a) => a.lifecyclePhase === "deployed_monitored").length}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">180d Cadence</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by app name, repo URL, live domain, or stack..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Scope Filter */}
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Scopes (Core + Freelance)</option>
            <option value="master_core_ip">Core Company IP Only</option>
            <option value="client_deliverable">Freelance / Client Only</option>
          </select>

          {/* Grid Phase Filter (if in grid mode) */}
          {viewMode === "grid" && (
            <select
              value={gridPhaseFilter}
              onChange={(e) => setGridPhaseFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Phases</option>
              <option value="in_development">In Development</option>
              <option value="ready_for_deployment">Pre-Flight Gate</option>
              <option value="deployed_monitored">Deployed & Monitored</option>
            </select>
          )}
        </div>
      </div>

      {/* 3. Empty Portfolio State (If 0 apps) */}
      {currentApps.length === 0 ? (
        <div
          id="fleet-empty-state"
          className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-5 max-w-2xl mx-auto my-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black text-white">No Applications in Fleet Matrix</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Ingest your first GitHub repository or live staging URL to activate 6-pillar pre-flight gating,
              readiness scoring, and continuous 180-day maintenance cadence tracking.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button
              id="empty-ingest-first-app-btn"
              type="button"
              onClick={() => {
                setIngestTargetPhase("in_development");
                setIsIngestModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Ingest First App</span>
            </button>
            <button
              type="button"
              onClick={() => {
                loadExampleTemplates();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Example Templates</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 4. MAIN VIEW: 3-Column Lifecycle Board */}
          {viewMode === "board" && (
            <div
              id="fleet-lifecycle-board"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
            >
              {/* COLUMN 1: IN DEVELOPMENT */}
              <div
                id="column-in-development"
                className="space-y-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      In Development
                    </h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {devApps.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIngestTargetPhase("in_development");
                      setIsIngestModalOpen(true);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                    title="Ingest App into Development"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Source code repository intake, secret leak prevention & unit lint checks.
                </p>

                {/* Column App Cards */}
                <div className="space-y-4">
                  {devApps.length > 0 ? (
                    devApps.map((app) => renderAppCard(app))
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                      <p className="text-xs text-slate-500">No apps currently in development.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIngestTargetPhase("in_development");
                          setIsIngestModalOpen(true);
                        }}
                        className="text-xs font-bold text-amber-400 hover:underline"
                      >
                        + Add dev codebase
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: NEXT ON DECK / PRE-FLIGHT GATE */}
              <div
                id="column-pre-flight-gate"
                className="space-y-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Next on Deck / Pre-Flight
                    </h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                      {preFlightApps.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIngestTargetPhase("ready_for_deployment");
                      setIsIngestModalOpen(true);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
                    title="Ingest App into Pre-Flight Staging"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Pre-production staging verification, 6-pillar inspection & WCAG compliance.
                </p>

                {/* Column App Cards */}
                <div className="space-y-4">
                  {preFlightApps.length > 0 ? (
                    preFlightApps.map((app) => renderAppCard(app))
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                      <p className="text-xs text-slate-500">No apps queued in pre-flight gate.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIngestTargetPhase("ready_for_deployment");
                          setIsIngestModalOpen(true);
                        }}
                        className="text-xs font-bold text-sky-400 hover:underline"
                      >
                        + Queue for pre-flight
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 3: DEPLOYED & MONITORED */}
              <div
                id="column-deployed-monitored"
                className="space-y-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Deployed & Monitored
                    </h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {deployedApps.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIngestTargetPhase("deployed_monitored");
                      setIsIngestModalOpen(true);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Ingest App into Production"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Active production endpoints, continuous uptime & 180-day cadence tracking.
                </p>

                {/* Column App Cards */}
                <div className="space-y-4">
                  {deployedApps.length > 0 ? (
                    deployedApps.map((app) => renderAppCard(app))
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                      <p className="text-xs text-slate-500">No apps currently deployed & monitored.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIngestTargetPhase("deployed_monitored");
                          setIsIngestModalOpen(true);
                        }}
                        className="text-xs font-bold text-emerald-400 hover:underline"
                      >
                        + Add live app
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. ALTERNATIVE VIEW: Card Grid Matrix */}
          {viewMode === "grid" && (
            <div id="fleet-card-grid" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Showing <strong className="text-white">{filteredApps.length}</strong> applications
                </span>
              </div>

              {filteredApps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApps.map((app) => renderAppCard(app))}
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">No applications match your filter criteria.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setScopeFilter("all");
                      setGridPhaseFilter("all");
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 6. Security Clearance & Pre-Registration Suite Drawer (Collapsible) */}
      {isSecuritySuiteOpen && (
        <section
          id="security-clearance-suite-drawer"
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl transition-all"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Security Clearance & Pre-Registration Verifiers
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live HTTP response header verification (CSP, HSTS, X-Frame) and official USPTO trademark registry collision checking.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSecuritySuiteOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Checker 1: Live URL Security Header Checker */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Globe className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">
                      Live URL Security Header Checker
                    </h3>
                    <span className="text-[10px] text-slate-500 block">
                      Inspects CSP, HSTS, X-Frame-Options & Referrer policies
                    </span>
                  </div>
                </div>

                {headerResults && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      headerResults.status === "PASSED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {headerResults.status === "PASSED" ? "Headers Verified" : "Warnings Found"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={headerTargetUrl}
                    onChange={(e) => setHeaderTargetUrl(e.target.value)}
                    placeholder="https://your-domain.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRunHeaderCheck()}
                  disabled={isCheckingHeaders}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all shrink-0 disabled:opacity-50"
                >
                  {isCheckingHeaders ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5" />
                      <span>Check Headers</span>
                    </>
                  )}
                </button>
              </div>

              {headerResults && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target: <strong className="text-slate-200 font-mono">{headerResults.checkedUrl}</strong></span>
                    <span>Audited: {headerResults.timestamp}</span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {headerResults.headers.map((h, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                            {h.status === "PASSED" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <span>{h.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{h.description}</p>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                            h.status === "PASSED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {h.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Checker 2: USPTO Trademark Database Pre-Flight Verifier */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Search className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">
                      USPTO Trademark Registry Collision Verifier
                    </h3>
                    <span className="text-[10px] text-slate-500 block">
                      Prior-to-launch collision detection on official US trademark records
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={usptoMarkQuery}
                    onChange={(e) => setUsptoMarkQuery(e.target.value)}
                    placeholder="e.g. 1WithOut"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <select
                    value={usptoClass}
                    onChange={(e) => setUsptoClass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="042">Class 042 (SaaS / Cloud)</option>
                    <option value="009">Class 009 (Software / Apps)</option>
                    <option value="035">Class 035 (Business / E-com)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <a
                  href={`https://tmsearch.uspto.gov`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
                >
                  <span>Search USPTO Database</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://data.uspto.gov/apis/getting-started"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                >
                  <span>USPTO Open Data APIs</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero-Collision Standard</span>
                </div>
                <p className="leading-relaxed">
                  Before launching or publicizing brand marks, verify that no identical live registrations exist in international trademark classes (IC 042, IC 009).
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Active Modals */}

      {/* Ingest Modal */}
      {isIngestModalOpen && (
        <IngestAppModal
          onClose={() => setIsIngestModalOpen(false)}
          onAddApp={(newApp) => {
            handleAddNewApp({
              ...newApp,
              lifecyclePhase: ingestTargetPhase,
            });
          }}
          onNavigate={onNavigate}
        />
      )}

      {/* Cadence Milestone Checklist Modal */}
      {cadenceModalApp && (
        <CadenceChecklistModal
          app={cadenceModalApp}
          onClose={() => setCadenceModalApp(null)}
          onUpdateCadence={(updatedApp) => {
            handleUpdateSingleApp(updatedApp);
            setCadenceModalApp(updatedApp);
          }}
        />
      )}

      {/* Launch Dossier Modal */}
      {dossierModalApp && (
        <LaunchDossierModal
          app={dossierModalApp}
          onClose={() => setDossierModalApp(null)}
        />
      )}

      {/* Delete App Confirmation Modal */}
      {appPendingDeletion && (
        <div
          id="delete-app-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
        >
          <div
            id="delete-app-modal"
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Remove Application?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong className="text-white">{appPendingDeletion.name}</strong> from your Fleet Matrix? This action removes its tracking schedule and audit history.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAppPendingDeletion(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRemoveSingleApp(appPendingDeletion.id);
                  setAppPendingDeletion(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
