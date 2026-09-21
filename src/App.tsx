import React, { useState, useEffect } from "react";
import {
  TabType,
  ActiveTab,
  AppRegistryItem,
  SecurityClearance,
} from "./types";
import { SAMPLE_SCENARIOS } from "./data/samples";
import { buildDefaultCadence } from "./utils/governance";
import { useRegistryApps } from "./utils/persistence";
import { Navbar } from "./components/Navbar";
import { OverviewView } from "./components/OverviewView";
import { DiscernView } from "./components/DiscernView";
import { RegistryView } from "./components/RegistryView";
import { PreFlightAuditView } from "./components/PreFlightAuditView";
import { ShipworthyRunnerView } from "./components/ShipworthyRunnerView";
import { DefenseGateView } from "./components/DefenseGateView";
import { AuditHistoryView } from "./components/AuditHistoryView";
import { SkillBuilderView } from "./components/SkillBuilderView";
import { NovaAgentWorkspaceView } from "./components/NovaAgentWorkspaceView";
import { OpcLaunchpadView } from "./components/OpcLaunchpadView";
import { CommercialLicenseModal } from "./components/CommercialLicenseModal";
import { ShieldCheck, Cpu, SlidersHorizontal, Award } from "lucide-react";

export function App() {
  // Active Tab defaults to 'registry' (Fleet Matrix & Lifecycle Board as primary landing)
  const [activeTab, setActiveTab] = useState<TabType>("registry");

  // Sub-mode for QA Matrix: 6-Pillar Pre-Flight Studio vs Shipworthy Isolated Sandbox Runner
  const [qaMatrixMode, setQaMatrixMode] = useState<"studio" | "runner">("studio");

  // Security Clearance for Defense-of-Break Gate (Passcode access)
  const [securityClearance, setSecurityClearance] = useState<SecurityClearance | null>(null);

  // Nova Agent prompt handoff
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string>("");

  // Cross-component state transfers
  const [discernInitialContent, setDiscernInitialContent] = useState<string>("");
  const [discernInitialSourceType, setDiscernInitialSourceType] = useState<any>("text");
  const [discernInitialSourceUrl, setDiscernInitialSourceUrl] = useState<string>("");

  const [skillInitialContent, setSkillInitialContent] = useState<string>("");
  const [skillInitialName, setSkillInitialName] = useState<string>("");

  // Pre-Flight Audit initial state for cross-component triggers
  const [auditInitialAppName, setAuditInitialAppName] = useState<string>("1WithOut Master PWA Engine");
  const [auditInitialLiveUrl, setAuditInitialLiveUrl] = useState<string>("https://1without.io");
  const [auditInitialRepoUrl, setAuditInitialRepoUrl] = useState<string>("https://github.com/chrisfbaileycb-arch/shipworthy-core.git");
  const [auditInitialStackDesc, setAuditInitialStackDesc] = useState<string>(
    "React 18, Vite, Tailwind CSS, Express TypeScript server, Port 3000 Ingress, Gemini 3.8 Flash server-side integration, and Defense-of-Break sentinel."
  );

  // Commercial Governance Licensing ($29 / 6-Month Pass flat rate)
  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState<boolean>(false);
  const [isCommercialActive, setIsCommercialActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("1without_commercial_pass_active");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("1without_commercial_pass_active", isCommercialActive ? "true" : "false");
  }, [isCommercialActive]);

  useEffect(() => {
    const handleCustomNav = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("1without_navigate_tab", handleCustomNav);
    return () => window.removeEventListener("1without_navigate_tab", handleCustomNav);
  }, []);

  // App Lifecycle Registry state connected reactively to persistence.ts
  const {
    apps: registryApps,
    addApp: handleAddApp,
    updateApp: handleUpdateApp,
    removeApp: handleRemoveApp,
  } = useRegistryApps();

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_SCENARIOS.find((s) => s.id === sampleId);
    if (!sample) return;

    if (sample.suggestedMode === "build_skill") {
      setSkillInitialContent(sample.fullContent);
      setSkillInitialName(sample.title);
      setActiveTab("skills");
    } else {
      setDiscernInitialContent(sample.fullContent);
      setDiscernInitialSourceType(sample.sourceType);
      setDiscernInitialSourceUrl(sample.sourceUrl || "");
      setActiveTab("discern");
    }
  };

  const handleSendToSkillBuilder = (text: string, title: string) => {
    setSkillInitialContent(text);
    setSkillInitialName(`Executable Skill: ${title.replace(/^Audit:\s*|^Remediation Directives:\s*/i, "")}`);
    setActiveTab("skills");
  };

  const handleSelectAppForAudit = (app: AppRegistryItem) => {
    setAuditInitialAppName(app.name);
    if (app.liveUrl) setAuditInitialLiveUrl(app.liveUrl);
    if (app.repoUrl) setAuditInitialRepoUrl(app.repoUrl);
    if (app.description) setAuditInitialStackDesc(app.description);
    setActiveTab("qa-matrix");
    setQaMatrixMode("studio");
  };

  // Dark canvas for verification matrix and security views
  const isTechnicalDarkMode =
    activeTab !== "cover" &&
    activeTab !== "launchpad";

  return (
    <div
      id="shipworthy-root-app"
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isTechnicalDarkMode
          ? "bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950"
          : "bg-[#FAF9F6] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900"
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        securityClearance={securityClearance}
        onOpenDefenseGate={() => setActiveTab("defense-gate")}
        isCommercialActive={isCommercialActive}
        onOpenCommercialModal={() => setIsCommercialModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main id="main-content-view" className="flex-1">
        {/* VIEW 1: OVERVIEW / MISSION CONTROL */}
        {(activeTab === "overview" || activeTab === "cover") && (
          <OverviewView
            onNavigate={(tab) => {
              if (tab === "shipworthy" || tab === "audit") {
                setActiveTab("qa-matrix");
              } else if (tab === "registry") {
                setActiveTab("registry");
              } else if (tab === "defense") {
                setActiveTab("defense-gate");
              } else {
                setActiveTab(tab);
              }
            }}
            onSelectSample={handleSelectSample}
            securityClearance={securityClearance}
            apps={registryApps}
            onAddApp={handleAddApp}
            onUpdateApp={handleUpdateApp}
            onRemoveApp={handleRemoveApp}
            onSelectAppForAudit={handleSelectAppForAudit}
          />
        )}

        {/* VIEW 2: DISCERN / TROPE BUSTER & PITCH HOLE-TESTING */}
        {activeTab === "discern" && (
          <DiscernView
            initialContent={discernInitialContent}
            initialSourceType={discernInitialSourceType}
            initialSourceUrl={discernInitialSourceUrl}
            onSendToSkillBuilder={handleSendToSkillBuilder}
            securityClearance={securityClearance}
            onOpenDefenseModal={() => setActiveTab("defense-gate")}
          />
        )}

        {/* VIEW 3: FLEET MATRIX / APP REGISTRY & 3-PHASE LIFECYCLE BOARD */}
        {(activeTab === "clearance" || activeTab === "registry") && (
          <RegistryView
            apps={registryApps}
            onAddApp={handleAddApp}
            onUpdateApp={handleUpdateApp}
            onRemoveApp={handleRemoveApp}
            onSelectAppForAudit={handleSelectAppForAudit}
            onNavigate={setActiveTab}
          />
        )}

        {/* VIEW 4: QA-MATRIX / 6-PILLAR QA INSPECTION & SHIPWORTHY RUNNER */}
        {(activeTab === "qa-matrix" || activeTab === "audit" || activeTab === "shipworthy") && (
          <div className="space-y-4">
            {/* Sub-tab switcher between Studio and Runner */}
            <div className="max-w-7xl mx-auto px-4 pt-4 flex items-center justify-between gap-4">
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setQaMatrixMode("studio")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    qaMatrixMode === "studio"
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>6-Pillar Audit Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQaMatrixMode("runner")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    qaMatrixMode === "runner"
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Shipworthy Sandbox Runner</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline-flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                <span>Dual Engine: Empirical Rule Scanner + Persona Execution</span>
              </span>
            </div>

            {qaMatrixMode === "studio" ? (
              <PreFlightAuditView
                initialAppName={auditInitialAppName}
                initialLiveUrl={auditInitialLiveUrl}
                initialRepoUrl={auditInitialRepoUrl}
                initialStackDesc={auditInitialStackDesc}
                onSendToSkillBuilder={handleSendToSkillBuilder}
                onSaveToRegistry={(audit) => {
                  const today = new Date().toISOString().split("T")[0];
                  const newApp: AppRegistryItem = {
                    id: `app-${Date.now()}`,
                    name: audit.appName,
                    description: audit.stackDescription || "Audited Autonomous Application",
                    organization: "Autonomous Workspace",
                    owner: "Lead Architect",
                    projectScope: "master_core_ip",
                    lifecyclePhase: audit.launchReadinessScore >= 90 ? "deployed_monitored" : "ready_for_deployment",
                    liveUrl: audit.liveUrl,
                    repoUrl: audit.repoUrl,
                    environment: "Production",
                    launchDate: today,
                    readinessScore: audit.launchReadinessScore,
                    status: audit.launchReadinessScore >= 90 ? "Live & Healthy" : "Pre-Flight Pending",
                    daysSinceLaunch: 0,
                    cadenceStatus: {
                      day30Completed: false,
                      day90Completed: false,
                      day180Completed: false,
                    },
                    cadenceScheduleDetailed: buildDefaultCadence(today),
                    lastAuditId: audit.id,
                    activeAlertsCount: audit.launchReadinessScore < 90 ? 1 : 0,
                  };
                  handleAddApp(newApp);
                  setActiveTab("clearance");
                }}
              />
            ) : (
              <ShipworthyRunnerView
                onSendToSkillBuilder={handleSendToSkillBuilder}
                onNavigateToAudit={(appName, liveUrl, repoUrl) => {
                  setAuditInitialAppName(appName);
                  setAuditInitialLiveUrl(liveUrl);
                  setAuditInitialRepoUrl(repoUrl);
                  setQaMatrixMode("studio");
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 5: DEFENSE-GATE / SAFE-STATE & TENANT ISOLATION CHECKS */}
        {(activeTab === "defense-gate" || activeTab === "defense") && (
          <DefenseGateView
            securityClearance={securityClearance}
            onClearanceUpdated={(clearance) => setSecurityClearance(clearance)}
          />
        )}

        {/* VIEW 6: AUDIT-HISTORY / VERIFIED LOGS & PDF REPORTS & DIFF COMPARISON */}
        {activeTab === "audit-history" && (
          <AuditHistoryView
            onNavigateToMatrix={() => {
              setActiveTab("qa-matrix");
              setQaMatrixMode("studio");
            }}
          />
        )}

        {/* ANCILLARY WORKSPACES */}
        {activeTab === "skills" && (
          <SkillBuilderView
            initialContent={skillInitialContent}
            initialSkillName={skillInitialName}
            securityClearance={securityClearance}
            onOpenDefenseModal={() => setActiveTab("defense-gate")}
          />
        )}

        {activeTab === "agent_workspace" && (
          <NovaAgentWorkspaceView
            initialPrompt={agentInitialPrompt}
            onNavigateToCertification={() => setActiveTab("qa-matrix")}
          />
        )}

        {activeTab === "launchpad" && (
          <OpcLaunchpadView
            onNavigateToAgentWorkspace={(prompt) => {
              if (prompt) setAgentInitialPrompt(prompt);
              setActiveTab("agent_workspace");
            }}
            onNavigateToCertification={() => setActiveTab("qa-matrix")}
          />
        )}
      </main>

      {/* Unified Verification Footer */}
      <footer
        className={`py-8 text-center text-xs transition-colors duration-200 border-t ${
          isTechnicalDarkMode
            ? "border-slate-900 bg-slate-950 text-slate-500"
            : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isTechnicalDarkMode ? "text-slate-300" : "text-slate-700"}`}>
              1WithOut • Universal Production Launch & Governance Command Center
            </span>
            <span>•</span>
            <span
              onClick={() => setIsCommercialModalOpen(true)}
              className="cursor-pointer hover:underline text-emerald-400 font-semibold"
            >
              Commercial Pass: {isCommercialActive ? "Active ($29/6-mo)" : "Public Scanner Mode"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap justify-center">
            <span>Dynamic Ingestion Engine</span>
            <span>•</span>
            <span>3-Phase Lifecycle Governance</span>
            <span>•</span>
            <span>Live Security Inspection</span>
            <span>•</span>
            <span>30/60/90/180-Day Cadence</span>
            <span>•</span>
            <span>6-Pillar QA Matrix</span>
            <span>•</span>
            <span>Dossier Export</span>
          </div>
        </div>
      </footer>

      {/* Commercial Governance Licensing Modal */}
      <CommercialLicenseModal
        isOpen={isCommercialModalOpen}
        onClose={() => setIsCommercialModalOpen(false)}
        isCommercialActive={isCommercialActive}
        onToggleCommercialStatus={setIsCommercialActive}
      />
    </div>
  );
}

export default App;
