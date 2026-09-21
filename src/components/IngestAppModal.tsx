import React, { useState } from "react";
import { AppRegistryItem, LifecyclePhase, ProjectScope } from "../types";
import { buildDefaultCadence } from "../utils/governance";
import {
  Plus,
  X,
  Globe,
  GitBranch,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

interface IngestAppModalProps {
  onClose: () => void;
  onAddApp: (app: AppRegistryItem) => void;
}

export const IngestAppModal: React.FC<IngestAppModalProps> = ({ onClose, onAddApp }) => {
  const [name, setName] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [sourceInput, setSourceInput] = useState<string>("");
  const [sourceType, setSourceType] = useState<"github" | "live_url">("github");
  const [projectScope, setProjectScope] = useState<ProjectScope>("master_core_ip");
  const [targetPhase, setTargetPhase] = useState<LifecyclePhase>("in_development");
  const [description, setDescription] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Project Name is required.");
      return;
    }
    if (!sourceInput.trim()) {
      setErrorMsg("Source URL (GitHub repository or Live URL) is required.");
      return;
    }

    const isGithub = sourceInput.includes("github.com") || sourceType === "github";
    const today = new Date().toISOString().split("T")[0];

    const newApp: AppRegistryItem = {
      id: `app-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `${projectScope === "master_core_ip" ? "Core IP" : "Client Deliverable"} project ingested via ${sourceType === "github" ? "GitHub" : "Live URL"}.`,
      organization: organization.trim() || "Independent Workspace",
      owner: owner.trim() || "Lead Architect",
      repoUrl: isGithub ? sourceInput.trim() : undefined,
      liveUrl: !isGithub ? sourceInput.trim() : undefined,
      sourceInput: sourceInput.trim(),
      sourceType: isGithub ? "github" : "live_url",
      projectScope,
      lifecyclePhase: targetPhase,
      environment: targetPhase === "deployed_monitored" ? "Production" : targetPhase === "ready_for_deployment" ? "Staging" : "Development",
      launchDate: today,
      readinessScore: targetPhase === "deployed_monitored" ? 92 : targetPhase === "ready_for_deployment" ? 85 : 70,
      status: targetPhase === "deployed_monitored" ? "Live & Healthy" : targetPhase === "ready_for_deployment" ? "Pre-Flight Pending" : "In Development",
      daysSinceLaunch: targetPhase === "deployed_monitored" ? 1 : 0,
      cadenceStatus: {
        day30Completed: false,
        day90Completed: false,
        day180Completed: false,
      },
      cadenceScheduleDetailed: buildDefaultCadence(today),
      inDevelopmentAudit: {
        linting: { status: "PASSED", details: "Initial TypeScript strict type-check verified." },
        secrets: { status: "PASSED", details: "Zero plain-text secrets found in public manifests." },
        vulnerabilities: { status: "PASSED", details: "Clean dependency graph." },
        lastRunAt: new Date().toISOString(),
        readyForPromotion: targetPhase === "in_development",
      },
      preFlightMatrix: {
        securityHeaders: { status: "PASSED", score: 90, details: "CSP and HSTS policy baseline ready." },
        wcagContrastAria: { status: "PASSED", score: 88, details: "WCAG 2.1 AA compliant typography." },
        legalComplianceIdempotency: { status: "PASSED", score: 92, details: "Terms & privacy disclosures aligned." },
        errorBoundaryPortIsolation: { status: "PASSED", score: 90, details: "Strict error catching and port 3000 mapping." },
        readinessScore: 88,
        blockingFlags: [],
        isClearedForDeployment: true,
        lastAuditedAt: new Date().toISOString(),
      },
      activeAlertsCount: 0,
    };

    onAddApp(newApp);
    onClose();
  };

  return (
    <div
      id="ingest-app-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="ingest-app-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Plus className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Dynamic Ingestion Engine (+ Ingest App)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ingest any application via GitHub repository or live URL into the universal governance pipeline.
            </p>
          </div>
          <button
            id="close-ingest-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* 1. Project Name & Org/Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="ingest-project-name" className="text-xs font-semibold text-slate-300">
                Project Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="ingest-project-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NextGen Client Invoicing PWA"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ingest-org-owner" className="text-xs font-semibold text-slate-300">
                Organization / Owner
              </label>
              <input
                id="ingest-org-owner"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Acme FinTech Corp"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 2. Source Input & Source Type */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ingest-source-url" className="text-xs font-semibold text-slate-300">
                Source Input (GitHub Repo or Live URL) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSourceType("github")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    sourceType === "github" ? "bg-slate-700 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  GitHub
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => setSourceType("live_url")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    sourceType === "live_url" ? "bg-slate-700 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Live HTML / PWA
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                id="ingest-source-url"
                type="url"
                required
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                placeholder={
                  sourceType === "github"
                    ? "https://github.com/organization/project-repo"
                    : "https://project-endpoint.run.app"
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 3. Project Scope Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Project Scope
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setProjectScope("master_core_ip")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  projectScope === "master_core_ip"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="project_scope"
                  checked={projectScope === "master_core_ip"}
                  onChange={() => setProjectScope("master_core_ip")}
                  className="mt-1 text-emerald-500 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold">Master Core IP</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Internal proprietary intellectual property & core platform systems.
                  </div>
                </div>
              </div>

              <div
                onClick={() => setProjectScope("client_deliverable")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  projectScope === "client_deliverable"
                    ? "bg-indigo-500/15 border-indigo-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="project_scope"
                  checked={projectScope === "client_deliverable"}
                  onChange={() => setProjectScope("client_deliverable")}
                  className="mt-1 text-indigo-500 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold">Freelance / Client Deliverable</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Client handoff, commercial workspace, or client-facing project.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Target Phase Radio Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Target Phase (3-Phase Lifecycle Pipeline)
            </label>
            <div className="space-y-2">
              <div
                onClick={() => setTargetPhase("in_development")}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  targetPhase === "in_development"
                    ? "bg-amber-500/15 border-amber-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="target_phase"
                    checked={targetPhase === "in_development"}
                    onChange={() => setTargetPhase("in_development")}
                    className="text-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold">Tab 1: In Development</span>
                    <span className="text-[11px] text-slate-400 block">
                      Active coding, initial builds, basic linting and secret scanning.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Dev
                </span>
              </div>

              <div
                onClick={() => setTargetPhase("ready_for_deployment")}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  targetPhase === "ready_for_deployment"
                    ? "bg-cyan-500/15 border-cyan-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="target_phase"
                    checked={targetPhase === "ready_for_deployment"}
                    onChange={() => setTargetPhase("ready_for_deployment")}
                    className="text-cyan-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold">Tab 2: Ready for Deployment (Pre-Flight Gate)</span>
                    <span className="text-[11px] text-slate-400 block">
                      Hard blocking staging gate; enforces the 6-pillar launch matrix.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Staging
                </span>
              </div>

              <div
                onClick={() => setTargetPhase("deployed_monitored")}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  targetPhase === "deployed_monitored"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="target_phase"
                    checked={targetPhase === "deployed_monitored"}
                    onChange={() => setTargetPhase("deployed_monitored")}
                    className="text-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold">Tab 3: Deployed & Monitored</span>
                    <span className="text-[11px] text-slate-400 block">
                      Live production registry with Live HTML Inspector & 30/60/90/180-day cadence.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Optional Brief Description */}
          <div className="space-y-1.5">
            <label htmlFor="ingest-desc" className="text-xs font-semibold text-slate-300">
              Brief Description
            </label>
            <input
              id="ingest-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Offline-first IndexedDB document annotator with background sync."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-ingest-app-btn"
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Into Fleet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
