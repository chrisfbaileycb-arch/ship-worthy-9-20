import React, { useState, useEffect, useRef } from "react";
import axe, { AxeResults, Result as AxeRuleResult } from "axe-core";
import {
  AppAuditReport,
  PillarId,
  CheckStatus,
  AxeAuditSummary,
  AxeViolationItem,
} from "../types";
import { runPreFlightScan } from "../services/api";
import { generateAuditPdfReport } from "../services/pdfGenerator";
import { saveAuditToHistory } from "../services/auditHistoryService";
import { CircularProgressIndicator } from "./CircularProgressIndicator";
import { EmailReportModal } from "./EmailReportModal";
import { AuditComparisonModal } from "./AuditComparisonModal";
import {
  ShieldCheck,
  Server,
  Scale,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
  CheckSquare,
  Square,
  Activity,
  Layers,
  FileCode,
  Globe,
  Sliders,
  CalendarCheck,
  Eye,
  Zap,
  ArrowRight,
  Download,
  FileText,
  Mail,
  GitCompare,
} from "lucide-react";

export const PILLAR_PHASES = [
  {
    id: "security" as PillarId,
    index: 1,
    name: "Security & API Keys",
    shortName: "Security",
    threshold: 16,
    icon: ShieldCheck,
    action: "Auditing server-side proxy routes, secret environment variables, and client bundle isolation...",
  },
  {
    id: "infra" as PillarId,
    index: 2,
    name: "Cloud Ingress & Ports",
    shortName: "Ingress",
    threshold: 33,
    icon: Server,
    action: "Verifying 0.0.0.0 host binding, ingress reverse proxy compatibility, and single-port routing...",
  },
  {
    id: "legal" as PillarId,
    index: 3,
    name: "Billing & Disclosures",
    shortName: "Legal/Billing",
    threshold: 50,
    icon: Scale,
    action: "Evaluating Stripe payment credentials, refund policies, billing disclosures, and legal consent...",
  },
  {
    id: "claims" as PillarId,
    index: 4,
    name: "Marketing Copy",
    shortName: "Marketing",
    threshold: 66,
    icon: FileCode,
    action: "Scanning user-facing promises, feature parity, AI capability claims, and scope boundaries...",
  },
  {
    id: "qa" as PillarId,
    index: 5,
    name: "Interface QA & Touch",
    shortName: "QA",
    threshold: 83,
    icon: Activity,
    action: "Validating responsive viewports, 44px touch targets, error states, and DOM interaction hooks...",
  },
  {
    id: "maintenance" as PillarId,
    index: 6,
    name: "180-Day Cadence",
    shortName: "Maintenance",
    threshold: 100,
    icon: CalendarCheck,
    action: "Synthesizing 30-day, 90-day, and 180-day dependency upgrades and operational maintenance plans...",
  },
];

interface PreFlightAuditViewProps {
  initialAppName?: string;
  initialLiveUrl?: string;
  initialRepoUrl?: string;
  initialStackDesc?: string;
  onSaveToRegistry?: (audit: AppAuditReport) => void;
  onSendToSkillBuilder?: (text: string, title: string) => void;
}

export const PreFlightAuditView: React.FC<PreFlightAuditViewProps> = ({
  initialAppName = "1WithOut Master PWA Engine",
  initialLiveUrl = "https://1without.io",
  initialRepoUrl = "https://github.com/1without/master-engine",
  initialStackDesc = "React PWA with Vite, Tailwind CSS, Express TypeScript server, Port 3000 Ingress, Gemini 3.7 Flash server-side integration, Stripe Checkout, and Defense-of-Break sentinel.",
  onSaveToRegistry,
  onSendToSkillBuilder,
}) => {
  const [appName, setAppName] = useState<string>(initialAppName);
  const [liveUrl, setLiveUrl] = useState<string>(initialLiveUrl);
  const [repoUrl, setRepoUrl] = useState<string>(initialRepoUrl);
  const [stackDescription, setStackDescription] = useState<string>(initialStackDesc);
  const [codeSnippets] = useState<string>(
    `// Sample manifest & server snippet
{
  "name": "1WithOut",
  "display": "standalone",
  "theme_color": "#020617",
  "background_color": "#020617"
}
`
  );

  // Sync props if changed
  useEffect(() => {
    if (initialAppName) setAppName(initialAppName);
  }, [initialAppName]);

  useEffect(() => {
    if (initialLiveUrl) setLiveUrl(initialLiveUrl);
  }, [initialLiveUrl]);

  useEffect(() => {
    if (initialRepoUrl) setRepoUrl(initialRepoUrl);
  }, [initialRepoUrl]);

  useEffect(() => {
    if (initialStackDesc) setStackDescription(initialStackDesc);
  }, [initialStackDesc]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const progressIntervalRef = useRef<any>(null);

  const [report, setReport] = useState<AppAuditReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<PillarId>("security");
  const [copiedPatchId, setCopiedPatchId] = useState<string | null>(null);

  // Manual interactive verification check state
  const [manualChecks, setManualChecks] = useState<{ [checkId: string]: boolean }>({});

  // Axe-Core Automated Accessibility State
  const [isAxeScanning, setIsAxeScanning] = useState<boolean>(false);
  const [axeSummary, setAxeSummary] = useState<AxeAuditSummary | null>(null);
  const [axeScanTarget, setAxeScanTarget] = useState<"live_dom" | "custom_snippet">("live_dom");
  const [customHtmlSnippet, setCustomHtmlSnippet] = useState<string>(
    `<header role="banner" class="bg-slate-900 text-white p-4">
  <h1 class="text-xl font-bold">Audited PWA Application</h1>
  <nav aria-label="Main Navigation">
    <button class="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded" aria-label="Open Workspace">Open Workspace</button>
  </nav>
</header>
<main id="main-content" class="p-6">
  <form aria-labelledby="form-title" class="space-y-3">
    <h2 id="form-title" class="text-lg">Subscription Details</h2>
    <label for="email-field" class="block text-sm text-slate-300">Work Email</label>
    <input id="email-field" type="email" aria-required="true" class="border p-2 bg-slate-950 text-white" />
    <button type="submit" class="bg-blue-600 text-white px-4 py-2" aria-label="Confirm Purchase">Subscribe</button>
  </form>
</main>`
  );
  const [axeCategoryFilter, setAxeCategoryFilter] = useState<"all" | "color-contrast" | "aria" | "labels" | "landmarks" | "structure">("all");
  const [axeImpactFilter, setAxeImpactFilter] = useState<"all" | "critical" | "serious" | "moderate" | "minor">("all");
  const [axeError, setAxeError] = useState<string | null>(null);
  const [telemetryExported, setTelemetryExported] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleExportAuditReport = async () => {
    let targetReport = report;

    // If report has not been generated yet, automatically run scan first with animated progress
    if (!targetReport) {
      if (!appName.trim()) {
        setErrorMsg("Please enter an Application Name to generate the report.");
        return;
      }
      setIsLoading(true);
      setErrorMsg(null);
      setScanProgress(6);
      setCurrentPhaseIndex(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 94) return 94;
          const next = Math.min(94, prev + Math.random() * 8 + 4);
          const phaseIdx = PILLAR_PHASES.findIndex((p) => next <= p.threshold);
          if (phaseIdx !== -1) setCurrentPhaseIndex(phaseIdx);
          else setCurrentPhaseIndex(PILLAR_PHASES.length - 1);
          return next;
        });
      }, 160);

      try {
        targetReport = await runPreFlightScan(
          appName,
          stackDescription,
          liveUrl,
          repoUrl,
          codeSnippets
        );

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setScanProgress(100);
        setCurrentPhaseIndex(PILLAR_PHASES.length - 1);
        setReport(targetReport);
      } catch (err: any) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        console.error(err);
        setErrorMsg(err.message || "Failed to complete pre-flight scan before PDF generation.");
        setIsLoading(false);
        setScanProgress(0);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (!targetReport) return;

    setIsExportingPdf(true);
    try {
      generateAuditPdfReport({
        report: targetReport,
        axeSummary,
        manualChecks,
        auditorName: "1WithOut Automated Launch Matrix & Axe-Core Engine",
      });
      setPdfSuccessToast(true);
      setTimeout(() => setPdfSuccessToast(false), 3500);
    } catch (err) {
      console.error("Failed to generate PDF audit report:", err);
      setErrorMsg("Failed to generate PDF report. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenEmailReport = async () => {
    let targetReport = report;

    // If report has not been generated yet, automatically run scan first before opening email modal
    if (!targetReport) {
      if (!appName.trim()) {
        setErrorMsg("Please enter an Application Name to generate and email the audit findings.");
        return;
      }
      setIsLoading(true);
      setErrorMsg(null);
      setScanProgress(6);
      setCurrentPhaseIndex(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 94) return 94;
          const next = Math.min(94, prev + Math.random() * 8 + 4);
          const phaseIdx = PILLAR_PHASES.findIndex((p) => next <= p.threshold);
          if (phaseIdx !== -1) setCurrentPhaseIndex(phaseIdx);
          else setCurrentPhaseIndex(PILLAR_PHASES.length - 1);
          return next;
        });
      }, 160);

      try {
        targetReport = await runPreFlightScan(
          appName,
          stackDescription,
          liveUrl,
          repoUrl,
          codeSnippets
        );

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setScanProgress(100);
        setCurrentPhaseIndex(PILLAR_PHASES.length - 1);
        setReport(targetReport);
        setIsEmailModalOpen(true);
      } catch (err: any) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        console.error(err);
        setErrorMsg(err.message || "Failed to complete pre-flight scan before emailing report.");
        setIsLoading(false);
        setScanProgress(0);
        return;
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEmailModalOpen(true);
    }
  };

  const handleOpenComparison = async () => {
    let targetReport = report;

    // If report has not been generated yet, automatically run scan first before opening comparison modal
    if (!targetReport) {
      if (!appName.trim()) {
        setErrorMsg("Please enter an Application Name to generate and compare audit findings.");
        return;
      }
      setIsLoading(true);
      setErrorMsg(null);
      setScanProgress(6);
      setCurrentPhaseIndex(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 94) return 94;
          const next = Math.min(94, prev + Math.random() * 8 + 4);
          const phaseIdx = PILLAR_PHASES.findIndex((p) => next <= p.threshold);
          if (phaseIdx !== -1) setCurrentPhaseIndex(phaseIdx);
          else setCurrentPhaseIndex(PILLAR_PHASES.length - 1);
          return next;
        });
      }, 160);

      try {
        targetReport = await runPreFlightScan(
          appName,
          stackDescription,
          liveUrl,
          repoUrl,
          codeSnippets
        );

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setScanProgress(100);
        setCurrentPhaseIndex(PILLAR_PHASES.length - 1);
        setReport(targetReport);
        saveAuditToHistory(targetReport);
        setIsCompareModalOpen(true);
      } catch (err: any) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        console.error(err);
        setErrorMsg(err.message || "Failed to complete pre-flight scan before comparison.");
        setIsLoading(false);
        setScanProgress(0);
        return;
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsCompareModalOpen(true);
    }
  };

  const generateRemediationSnippet = (v: AxeRuleResult): string => {
    if (v.id.includes("color-contrast")) {
      return `/* WCAG 2.1 AA Compliant Contrast Ratio (>= 4.5:1) */
.accessible-contrast {
  color: #f8fafc; /* high-contrast foreground text */
  background-color: #020617; /* deep neutral background */
}`;
    }
    if (v.id === "button-name") {
      return `<!-- Provide accessible name via aria-label or inner text -->
<button type="button" aria-label="Descriptive action name" class="...">
  <Icon aria-hidden="true" />
  <span class="sr-only">Descriptive action name</span>
</button>`;
    }
    if (v.id === "link-name") {
      return `<!-- Descriptive hyperlink with accessible destination -->
<a href="/target" aria-label="Navigate to documentation" class="...">
  <span>Documentation & Guides</span>
</a>`;
    }
    if (v.id === "label" || v.id === "aria-input-field-name") {
      return `<!-- Explicit label association for screen readers -->
<label htmlFor="target-input-id" class="text-xs text-slate-300">Field Label</label>
<input id="target-input-id" type="text" aria-required="true" aria-describedby="field-help" />
<span id="field-help" class="text-[11px] text-slate-400">Helper description</span>`;
    }
    if (v.id.startsWith("aria-") || v.id.includes("role")) {
      return `<!-- Valid WAI-ARIA 1.2 landmark and role pattern -->
<div role="region" aria-labelledby="section-heading-id" class="...">
  <h3 id="section-heading-id" class="text-sm font-bold">Section Title</h3>
  <!-- Content -->
</div>`;
    }
    if (v.id === "image-alt") {
      return `<!-- Meaningful alt text for assistive tech -->
<img src="/asset.png" alt="Descriptive visual overview of application architecture" />`;
    }
    if (v.id === "landmark-one-main" || v.id === "region") {
      return `<!-- Semantic HTML5 landmark structure -->
<main id="main-content" role="main" class="min-h-screen">
  <!-- Primary application content -->
</main>`;
    }
    return `<!-- Recommended WAI-ARIA 2.1 AA Pattern -->
<div role="region" aria-label="${v.help}">
  <!-- Accessible markup -->
</div>`;
  };

  const runAxeAccessibilityScan = async (mode: "live_dom" | "custom_snippet") => {
    setIsAxeScanning(true);
    setAxeError(null);
    setTelemetryExported(false);

    try {
      let targetNode: HTMLElement | Document =
        document.getElementById("preflight-audit-view") || document.body;
      let cleanup = () => {};

      if (mode === "custom_snippet" && customHtmlSnippet.trim()) {
        const sandbox = document.createElement("div");
        sandbox.id = "axe-eval-sandbox";
        sandbox.style.position = "absolute";
        sandbox.style.left = "-9999px";
        sandbox.style.top = "-9999px";
        sandbox.style.width = "1024px";
        sandbox.style.height = "768px";
        sandbox.innerHTML = customHtmlSnippet;
        document.body.appendChild(sandbox);
        targetNode = sandbox;
        cleanup = () => {
          if (document.body.contains(sandbox)) {
            document.body.removeChild(sandbox);
          }
        };
      }

      const results: AxeResults = await axe.run(targetNode, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
        },
      });

      cleanup();

      const mappedViolations: AxeViolationItem[] = results.violations.map((v) => {
        let cat: AxeViolationItem["category"] = "other";
        if (v.id.includes("color-contrast")) cat = "color-contrast";
        else if (v.id.startsWith("aria-") || v.id.includes("role") || v.id.includes("aria")) cat = "aria";
        else if (v.id.includes("name") || v.id.includes("label") || v.id.includes("alt")) cat = "labels";
        else if (v.id.includes("landmark") || v.id.includes("region") || v.id.includes("bypass")) cat = "landmarks";
        else if (v.id.includes("heading") || v.id.includes("list") || v.id.includes("table")) cat = "structure";

        return {
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          tags: v.tags,
          nodes: v.nodes.map((n) => ({
            html: n.html,
            target: n.target.map((t) => (typeof t === "string" ? t : JSON.stringify(t))),
            failureSummary: n.failureSummary,
          })),
          category: cat,
          remediationSnippet: generateRemediationSnippet(v),
        };
      });

      const ariaCount = mappedViolations.filter((v) => v.category === "aria").length;
      const contrastCount = mappedViolations.filter((v) => v.category === "color-contrast").length;
      const critical = mappedViolations.filter((v) => v.impact === "critical").length;
      const serious = mappedViolations.filter((v) => v.impact === "serious").length;
      const moderate = mappedViolations.filter((v) => v.impact === "moderate").length;
      const minor = mappedViolations.filter((v) => v.impact === "minor").length;

      const deductions = critical * 20 + serious * 12 + moderate * 6 + minor * 2;
      const complianceScore = Math.max(15, 100 - deductions);

      setAxeSummary({
        timestamp: new Date().toISOString(),
        targetScanned: mode === "live_dom" ? `${appName} Live Workspace DOM` : `${appName} Custom HTML/PWA Snippet`,
        violationsCount: mappedViolations.length,
        passesCount: results.passes.length,
        incompleteCount: results.incomplete.length,
        inapplicableCount: results.inapplicable.length,
        ariaViolationsCount: ariaCount,
        contrastViolationsCount: contrastCount,
        violations: mappedViolations,
        wcagComplianceScore: mappedViolations.length === 0 ? 100 : complianceScore,
      });
    } catch (err: any) {
      console.error("Axe-core scan execution failure:", err);
      setAxeError(err.message || "Axe-core accessibility audit failed.");
    } finally {
      setIsAxeScanning(false);
    }
  };

  const handleExportA11yToSkillBuilder = () => {
    if (!axeSummary) return;

    const telemetryMarkdown = `# Accessibility & ARIA Remediation Telemetry Package
**Target Application**: ${appName}
**Live URL**: ${liveUrl || "N/A"}
**WCAG AA Compliance Score**: ${axeSummary.wcagComplianceScore}/100
**Total Axe-Core Violations**: ${axeSummary.violationsCount} (ARIA: ${axeSummary.ariaViolationsCount}, Contrast: ${axeSummary.contrastViolationsCount})
**Total Passed Rules**: ${axeSummary.passesCount} | **Incomplete/Manual**: ${axeSummary.incompleteCount}

## Accessibility Remediation Directives:
${
  axeSummary.violations.length === 0
    ? `* All automated Axe-core WCAG 2.1 AA assertions passed with zero violations.`
    : axeSummary.violations
        .map(
          (v, i) => `### Directive ${i + 1}: Fix ${v.id.toUpperCase()} (${(v.impact || "MODERATE").toUpperCase()})
- **Rule & Help**: ${v.help} — ${v.description}
- **Category**: ${v.category}
- **WCAG Tags**: ${v.tags.join(", ")}
- **Help URL**: ${v.helpUrl}
- **Affected Elements / Target Selectors**:
${v.nodes.map((n) => `  * Selector: \`${n.target.join(" > ")}\`\n    HTML: \`${n.html}\``).join("\n")}
- **Recommended Remediation Patch**:
\`\`\`html
${v.remediationSnippet || "<!-- Apply accessible attributes -->"}
\`\`\`
`
        )
        .join("\n")
}

## Automated Playwright A11y Regression Test Template:
\`\`\`typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('A11y & ARIA Automated Matrix', () => {
  test('Verify WCAG 2.1 AA Compliance with zero violations', async ({ page }) => {
    await page.goto('${liveUrl || "http://localhost:3000"}');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
\`\`\`
`;

    if (onSendToSkillBuilder) {
      onSendToSkillBuilder(telemetryMarkdown, `Accessibility & ARIA Fixes: ${appName}`);
      setTelemetryExported(true);
    }
  };

  const handleRunScan = async () => {
    if (!appName.trim()) {
      setErrorMsg("Please provide an application name.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setScanProgress(6);
    setCurrentPhaseIndex(0);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Incremental progress through each of the 6 pillars
    progressIntervalRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 94) return 94; // Pause near completion until preflight payload returns
        const next = Math.min(94, prev + Math.random() * 8 + 4);
        const phaseIdx = PILLAR_PHASES.findIndex((p) => next <= p.threshold);
        if (phaseIdx !== -1) setCurrentPhaseIndex(phaseIdx);
        else setCurrentPhaseIndex(PILLAR_PHASES.length - 1);
        return next;
      });
    }, 160);

    try {
      const result = await runPreFlightScan(
        appName,
        stackDescription,
        liveUrl,
        repoUrl,
        codeSnippets
      );

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setScanProgress(100);
      setCurrentPhaseIndex(PILLAR_PHASES.length - 1);

      // Short delay for visual smoothness at 100%
      setTimeout(() => {
        setReport(result);
        saveAuditToHistory(result);
        setIsLoading(false);
      }, 400);
    } catch (err: any) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      console.error(err);
      setErrorMsg(err.message || "Failed to complete pre-flight launch matrix scan.");
      setIsLoading(false);
      setScanProgress(0);
    }
  };

  const toggleManualCheck = (checkId: string) => {
    setManualChecks((prev) => ({
      ...prev,
      [checkId]: !prev[checkId],
    }));
  };

  const copyPatch = (patch: string, checkId: string) => {
    navigator.clipboard.writeText(patch);
    setCopiedPatchId(checkId);
    setTimeout(() => setCopiedPatchId(null), 2000);
  };

  const getStatusIcon = (status: CheckStatus, isCheckedManually: boolean) => {
    if (isCheckedManually) {
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
    switch (status) {
      case "PASSED":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case "NOT_APPLICABLE":
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPillarIcon = (pillarId: PillarId) => {
    switch (pillarId) {
      case "security":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "infra":
        return <Server className="w-4 h-4 text-cyan-600" />;
      case "legal":
        return <Scale className="w-4 h-4 text-amber-600" />;
      case "claims":
        return <FileCode className="w-4 h-4 text-rose-600" />;
      case "qa":
        return <Activity className="w-4 h-4 text-teal-600" />;
      case "maintenance":
        return <CalendarCheck className="w-4 h-4 text-indigo-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  const activePillarReport = report?.pillars.find((p) => p.pillarId === selectedPillar);

  // Filtered axe violations
  const filteredAxeViolations = (axeSummary?.violations || []).filter((v) => {
    if (axeCategoryFilter !== "all" && v.category !== axeCategoryFilter) return false;
    if (axeImpactFilter !== "all" && v.impact !== axeImpactFilter) return false;
    return true;
  });

  return (
    <div id="preflight-audit-view" className="space-y-8 py-8 max-w-6xl mx-auto px-4 sm:px-6 pb-24 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Launch Certification & QA Framework</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            6-Pillar Production Launch Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Empirical verification across Security, Cloud Ingress, Billing/Legal, Marketing Copy, Interface QA & Automated Axe-Core Accessibility.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* PRIMARY 'EXPORT AUDIT REPORT' BUTTON */}
          <button
            id="export-audit-report-top-btn"
            type="button"
            onClick={handleExportAuditReport}
            disabled={isExportingPdf || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 hover:border-slate-400 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Generate and download a professional PDF summary of the 6-pillar findings"
          >
            {isExportingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Exporting PDF...</span>
              </>
            ) : pdfSuccessToast ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Audit Report Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export Audit Report (PDF)</span>
              </>
            )}
          </button>

          {/* EMAIL REPORT BUTTON NEXT TO EXPORT */}
          <button
            id="email-audit-report-top-btn"
            type="button"
            onClick={handleOpenEmailReport}
            disabled={isLoading || isExportingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 hover:border-slate-400 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Email findings & executive verification dossier to project lead"
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Email Report</span>
          </button>

          {/* COMPARE AUDITS BUTTON */}
          <button
            id="compare-audits-top-btn"
            type="button"
            onClick={handleOpenComparison}
            disabled={isLoading || isExportingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 hover:border-slate-400 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Compare current audit results with a previous audit session side-by-side"
          >
            <GitCompare className="w-4 h-4 text-emerald-600" />
            <span>Compare Audits</span>
          </button>

          {/* RUN 6-PILLAR SCAN BUTTON */}
          <button
            id="preflight-scan-trigger-btn"
            type="button"
            onClick={handleRunScan}
            disabled={isLoading || isExportingPdf}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <CircularProgressIndicator
                  progress={scanProgress}
                  size={20}
                  strokeWidth={3}
                  showPercentageText={false}
                  colorVariant="emerald"
                />
                <span>Analyzing 6 Pillars ({Math.round(scanProgress)}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run 6-Pillar Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6-Pillar Real-Time Analysis Progress Panel (Visible while scanning) */}
      {isLoading && (
        <div
          id="preflight-analysis-progress-panel"
          className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden"
        >
          {/* Subtle background atmospheric glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Circular Progress Indicator with live percentage and rotating active pillar icon */}
              <div className="relative shrink-0">
                <CircularProgressIndicator
                  progress={scanProgress}
                  size={108}
                  strokeWidth={9}
                  sublabel="ANALYSIS"
                  activePillarIcon={
                    PILLAR_PHASES[currentPhaseIndex] ? (
                      React.createElement(PILLAR_PHASES[currentPhaseIndex].icon, {
                        className: "w-5 h-5 text-emerald-600",
                      })
                    ) : undefined
                  }
                />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              {/* Status and Active Phase Details */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Real-Time 6-Pillar Analysis
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Pillar {currentPhaseIndex + 1} of 6
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {PILLAR_PHASES[currentPhaseIndex]?.name || "Evaluating Production Matrix..."}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {PILLAR_PHASES[currentPhaseIndex]?.action || "Analyzing target application architecture..."}
                </p>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 text-left shrink-0">
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Scanned Target</div>
                <div className="text-xs font-bold text-slate-900 truncate max-w-[160px] font-mono mt-0.5">{appName || "PWA Engine"}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status</div>
                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{Math.round(scanProgress)}% Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Pillar Milestone Track */}
          <div className="pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {PILLAR_PHASES.map((phase, idx) => {
                const isCompleted = scanProgress > phase.threshold || scanProgress >= 100;
                const isCurrent = currentPhaseIndex === idx && !isCompleted;
                const IconComponent = phase.icon;

                return (
                  <div
                    key={phase.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                      isCompleted
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                        : isCurrent
                        ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-xs"
                        : "bg-slate-50 border-slate-200/70 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : isCurrent
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-400">P{phase.index}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold truncate">{phase.shortName}</div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {isCompleted ? "Verified" : isCurrent ? "Auditing..." : "Queued"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Target Application Metadata & Config */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600" />
          Target App Architecture & Endpoints
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Application Name
            </label>
            <input
              type="text"
              id="audit-app-name-input"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. 1WithOut Master PWA"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Live Preview / Production URL
            </label>
            <div className="relative">
              <input
                type="text"
                id="audit-live-url-input"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://your-app.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white outline-none font-mono"
              />
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Repository URL (GitHub / GitLab)
            </label>
            <input
              type="text"
              id="audit-repo-url-input"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Stack Description & Environment Architecture
          </label>
          <input
            type="text"
            id="audit-stack-desc-input"
            value={stackDescription}
            onChange={(e) => setStackDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white outline-none"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Axe-Core Automated Accessibility & ARIA Engine Section */}
      <div
        id="axe-core-audit-card"
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Axe-Core™ Automated Accessibility & ARIA Engine
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                  WCAG 2.1 AA
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Evaluates color contrast ratios, ARIA landmarks & roles, form label bindings, and button accessibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                id="axe-target-live-btn"
                type="button"
                onClick={() => setAxeScanTarget("live_dom")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  axeScanTarget === "live_dom"
                    ? "bg-white text-teal-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Live UI Workspace DOM
              </button>
              <button
                id="axe-target-snippet-btn"
                type="button"
                onClick={() => setAxeScanTarget("custom_snippet")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  axeScanTarget === "custom_snippet"
                    ? "bg-white text-teal-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Custom HTML/PWA Snippet
              </button>
            </div>

            <button
              id="run-axe-scan-btn"
              type="button"
              onClick={() => runAxeAccessibilityScan(axeScanTarget)}
              disabled={isAxeScanning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {isAxeScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing DOM...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Run Axe-Core Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Snippet Input Box (if custom snippet selected) */}
        {axeScanTarget === "custom_snippet" && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
              <span>Target HTML / Component DOM Tree to Evaluate:</span>
              <span className="text-[11px] font-mono text-slate-500">Evaluates in isolated sandbox</span>
            </div>
            <textarea
              id="axe-custom-html-input"
              rows={4}
              value={customHtmlSnippet}
              onChange={(e) => setCustomHtmlSnippet(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 font-mono text-xs rounded-xl p-3 focus:ring-2 focus:ring-teal-500/30 outline-none resize-y"
              placeholder="Paste application HTML or component DOM snippet..."
            />
          </div>
        )}

        {axeError && (
          <p className="text-xs text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">
            {axeError}
          </p>
        )}

        {/* Axe-Core Scorecard & Summary */}
        {axeSummary && (
          <div id="axe-results-container" className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Score */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-teal-800 font-mono">
                  {axeSummary.wcagComplianceScore}%
                </span>
                <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider mt-0.5">
                  WCAG Score
                </span>
              </div>

              {/* Total Violations */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black font-mono ${axeSummary.violationsCount === 0 ? "text-emerald-700" : "text-rose-600"}`}>
                  {axeSummary.violationsCount}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  Violations
                </span>
              </div>

              {/* ARIA Violations */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-amber-700 font-mono">
                  {axeSummary.ariaViolationsCount}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  ARIA Rules
                </span>
              </div>

              {/* Contrast Issues */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-cyan-700 font-mono">
                  {axeSummary.contrastViolationsCount}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  Color Contrast
                </span>
              </div>

              {/* Passed Rules */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  {axeSummary.passesCount}
                </span>
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mt-0.5">
                  Passed Checks
                </span>
              </div>

              {/* Incomplete */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-600 font-mono">
                  {axeSummary.incompleteCount}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  Manual Review
                </span>
              </div>
            </div>

            {/* Filter Bar & Export Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase">Category:</span>
                {(["all", "aria", "color-contrast", "labels", "landmarks", "structure"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAxeCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                      axeCategoryFilter === cat
                        ? "bg-white text-teal-800 border border-slate-200 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {cat === "all" ? "All Rules" : cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {onSendToSkillBuilder && (
                <button
                  id="export-a11y-telemetry-btn"
                  type="button"
                  onClick={handleExportA11yToSkillBuilder}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors shrink-0"
                  title="Export telemetry directives to Agent Skill Builder"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>
                    {telemetryExported ? "Sent to Skill Builder!" : "Export Telemetry to Skill Builder"}
                  </span>
                </button>
              )}
            </div>

            {/* Violations List */}
            {filteredAxeViolations.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900">
                  Zero Accessibility Violations Detected
                </h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  The scanned target satisfies all automated WCAG 2.1 AA color contrast ratios, ARIA semantic landmarks, and button accessibility rules.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAxeViolations.map((v, idx) => {
                  const impactColor =
                    v.impact === "critical"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : v.impact === "serious"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-teal-50 text-teal-800 border-teal-200";

                  return (
                    <div
                      key={`${v.id}-${idx}`}
                      id={`axe-violation-${v.id}-${idx}`}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${impactColor}`}>
                            {v.impact || "moderate"}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {v.id}
                          </span>
                          <span className="text-xs text-slate-600">
                            — {v.help}
                          </span>
                        </div>

                        <a
                          href={v.helpUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 font-mono font-bold"
                        >
                          <span>Deque Docs</span>
                          <Globe className="w-3 h-3" />
                        </a>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {v.description}
                      </p>

                      {/* Nodes & Target Selectors */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          Affected Element Nodes ({v.nodes.length}):
                        </span>
                        {v.nodes.slice(0, 3).map((node, nIdx) => (
                          <div
                            key={nIdx}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono space-y-1"
                          >
                            <div className="text-teal-700 font-bold truncate">
                              Target: {node.target.join(" > ")}
                            </div>
                            <div className="text-slate-600 truncate bg-slate-50 p-1.5 rounded border border-slate-200/80">
                              {node.html}
                            </div>
                            {node.failureSummary && (
                              <div className="text-rose-600 text-[10px] font-sans font-medium">
                                {node.failureSummary}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Remediation Snippet */}
                      {v.remediationSnippet && (
                        <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="text-emerald-400 font-bold">Recommended Accessible Fix:</span>
                            <button
                              type="button"
                              onClick={() => copyPatch(v.remediationSnippet!, `axe-${v.id}-${idx}`)}
                              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedPatchId === `axe-${v.id}-${idx}` ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Fix</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto p-1">
                            {v.remediationSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit Matrix Report View */}
      {report && (
        <div id="preflight-matrix-results" className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Readiness Scorecard */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Matrix Clearance: {report.status}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {report.appName} Launch Verification
              </h2>
              <p className="text-xs text-slate-600 max-w-xl mt-1">
                6-pillar evaluation completed with real-time remediation patches and automated 180-day operational cadence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
              <div className="flex items-center gap-3.5 sm:pr-4 sm:border-r sm:border-slate-200">
                <CircularProgressIndicator
                  progress={report.launchReadinessScore}
                  size={64}
                  strokeWidth={6}
                  showPercentageText={true}
                  colorVariant={
                    report.launchReadinessScore >= 80
                      ? "emerald"
                      : report.launchReadinessScore >= 60
                      ? "teal"
                      : "cyan"
                  }
                />
                <div>
                  <div className="text-xl font-extrabold text-slate-900 leading-tight">
                    {report.launchReadinessScore}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Readiness Score</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* SECONDARY PROMINENT 'EXPORT AUDIT REPORT' BUTTON IN RESULTS */}
                <button
                  id="export-audit-report-card-btn"
                  type="button"
                  onClick={handleExportAuditReport}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all disabled:opacity-50"
                  title="Download structured PDF verification report"
                >
                  {isExportingPdf ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting PDF...</span>
                    </>
                  ) : pdfSuccessToast ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>PDF Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Audit Report</span>
                    </>
                  )}
                </button>

                {/* EMAIL REPORT BUTTON IN RESULTS SCORECARD */}
                <button
                  id="email-audit-report-card-btn"
                  type="button"
                  onClick={handleOpenEmailReport}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  title="Send audit findings to project lead via mock email service"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Email Report</span>
                </button>

                {/* COMPARE AUDITS BUTTON IN RESULTS SCORECARD */}
                <button
                  id="compare-audits-card-btn"
                  type="button"
                  onClick={handleOpenComparison}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  title="Compare current findings with previous audit runs side-by-side"
                >
                  <GitCompare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Compare Audits</span>
                </button>

                {onSaveToRegistry && (
                  <button
                    id="save-to-registry-btn"
                    type="button"
                    onClick={() => onSaveToRegistry(report)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Save to Registry
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 6 Pillar Nav Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {report.pillars.map((p) => {
              const isSelected = selectedPillar === p.pillarId;
              const failedCount = p.checks.filter((c) => c.status === "FAILED" && !manualChecks[c.id]).length;
              return (
                <button
                  key={p.pillarId}
                  id={`pillar-tab-${p.pillarId}`}
                  type="button"
                  onClick={() => setSelectedPillar(p.pillarId)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-start gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-emerald-600 text-slate-900 shadow-sm ring-1 ring-emerald-600"
                      : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {getPillarIcon(p.pillarId)}
                    <span className="text-xs font-extrabold text-slate-900">
                      {p.score}%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate w-full text-left">
                    {p.name.split(" ")[0]}
                  </span>
                  {failedCount > 0 && (
                    <span className="text-[10px] text-rose-600 font-bold">
                      {failedCount} Issue{failedCount > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Pillar Details & Checks */}
          {activePillarReport && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                    {getPillarIcon(activePillarReport.pillarId)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {activePillarReport.name}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {activePillarReport.summary}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  Pillar Score: {activePillarReport.score}/100
                </div>
              </div>

              {/* Individual Verification Items */}
              <div className="space-y-4">
                {activePillarReport.checks.map((chk) => {
                  const isChecked = !!manualChecks[chk.id];
                  return (
                    <div
                      key={chk.id}
                      id={`check-item-${chk.id}`}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleManualCheck(chk.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                            title="Toggle manual sign-off"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-900">
                                {chk.name}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] font-bold">
                                {getStatusIcon(chk.status, isChecked)}
                                <span
                                  className={
                                    isChecked || chk.status === "PASSED"
                                      ? "text-emerald-700"
                                      : chk.status === "WARNING"
                                      ? "text-amber-700"
                                      : "text-rose-600"
                                  }
                                >
                                  {isChecked ? "VERIFIED (MANUAL)" : chk.status}
                                </span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {chk.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation & Code Patch */}
                      <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                        <p className="text-[11px] text-slate-700 font-medium">
                          <strong className="text-slate-900">Fix / Verification:</strong> {chk.recommendedFix}
                        </p>

                        {chk.patchCode && (
                          <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span className="text-emerald-400 font-bold">Recommended Code / Config Patch:</span>
                              <button
                                type="button"
                                onClick={() => copyPatch(chk.patchCode!, chk.id)}
                                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedPatchId === chk.id ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Patch</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto">
                              {chk.patchCode}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 180-Day Automated Cadence Roadmap */}
          {report.cadenceSchedule && (
            <div id="cadence-roadmap-card" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Post-Launch 180-Day Maintenance & Evolution Cadence
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 30-Day */}
                <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-900">Day 30: Early Triage</span>
                    <span className="text-[10px] font-mono text-cyan-800 bg-white px-2 py-0.5 rounded border border-cyan-200 font-bold">
                      Month 1
                    </span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc leading-relaxed">
                    {report.cadenceSchedule.day30Tasks.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* 90-Day */}
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900">Day 90: Upgrade & Review</span>
                    <span className="text-[10px] font-mono text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200 font-bold">
                      Month 3
                    </span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc leading-relaxed">
                    {report.cadenceSchedule.day90Tasks.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* 180-Day */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">Day 180: Security & Archival</span>
                    <span className="text-[10px] font-mono text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200 font-bold">
                      Month 6
                    </span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc leading-relaxed">
                    {report.cadenceSchedule.day180Tasks.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Report Modal Dialog */}
      {report && (
        <EmailReportModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          report={report}
          axeSummary={axeSummary}
        />
      )}

      {/* Side-by-Side Audit Comparison Modal Dialog */}
      {report && (
        <AuditComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          currentReport={report}
          axeSummary={axeSummary}
        />
      )}
    </div>
  );
};
