import { AppAuditReport, PillarReport, CheckStatus, VerificationCheck } from "../types";

export interface CheckDiffItem {
  checkId: string;
  checkName: string;
  pillarId: string;
  pillarName: string;
  baselineStatus: CheckStatus;
  currentStatus: CheckStatus;
  changeType: "improved" | "regressed" | "unresolved_issue" | "maintained_passed" | "new_check";
  description: string;
  recommendedFix?: string;
  patchCode?: string;
}

export interface PillarDiffItem {
  pillarId: string;
  pillarName: string;
  baselineScore: number;
  currentScore: number;
  scoreDelta: number;
  status: "improved" | "regressed" | "unchanged";
  improvedChecksCount: number;
  regressedChecksCount: number;
  totalChecks: number;
}

export interface AuditComparisonDiff {
  baselineReport: AppAuditReport;
  currentReport: AppAuditReport;
  scoreDelta: number;
  overallTrend: "significant_improvement" | "moderate_improvement" | "neutral" | "regression" | "critical_regression";
  trendLabel: string;
  statusTransition: {
    from: string;
    to: string;
  };
  totalImprovedChecks: number;
  totalRegressedChecks: number;
  totalUnresolvedIssues: number;
  totalMaintainedPassed: number;
  pillarDiffs: PillarDiffItem[];
  checkDiffs: CheckDiffItem[];
}

const STORAGE_KEY = "1without_audit_session_history";

/**
 * Seed historical baseline audits for realistic comparison if history is empty
 */
export const DEFAULT_BASELINE_AUDITS: AppAuditReport[] = [
  {
    id: "audit-baseline-v1-0",
    appName: "1WithOut Master PWA Engine",
    liveUrl: "https://1without.io",
    repoUrl: "https://github.com/1without/master-engine",
    stackDescription: "Initial alpha build: React client without server isolation or port ingress guards.",
    launchReadinessScore: 48,
    status: "LAUNCH_BLOCKED",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    cadenceSchedule: {
      day30Tasks: ["Review early crash logs", "Check unhandled exceptions"],
      day90Tasks: ["Audit NPM dependencies"],
      day180Tasks: ["Rotate credentials"],
    },
    pillars: [
      {
        pillarId: "security",
        name: "Security, Identity & Defense-of-Break",
        score: 40,
        summary: "High risk: Secret keys exposed in client bundle, missing server-side proxy routes.",
        checks: [
          {
            id: "sec-1",
            name: "Client-Side Secret Isolation",
            status: "FAILED",
            description: "Private API tokens and Stripe credentials were bundled directly in client bundle.",
            recommendedFix: "Keep sensitive keys behind server-side /api/* proxy endpoints.",
          },
          {
            id: "sec-2",
            name: "Defense-of-Break Protection",
            status: "WARNING",
            description: "Restricted data scanner was in passive observation mode without blocking.",
            recommendedFix: "Enforce strict passcode gate for sensitive legal documents.",
          },
          {
            id: "sec-3",
            name: "CSP & Sanitization Directives",
            status: "PASSED",
            description: "DOMPurify and Content Security Policy headers active.",
            recommendedFix: "Maintain standard CSP nonce policies.",
          },
        ],
      },
      {
        pillarId: "infra",
        name: "Cloud Ingress & Container Port Binding",
        score: 50,
        summary: "Port 3000 binding unverified and missing reverse proxy routing.",
        checks: [
          {
            id: "inf-1",
            name: "Single-Port 3000 Ingress Routing",
            status: "FAILED",
            description: "Server attempted binding to secondary port 5173, breaking container ingress.",
            recommendedFix: "Enforce port 3000 exclusively behind nginx reverse proxy.",
          },
          {
            id: "inf-2",
            name: "0.0.0.0 Network Host Binding",
            status: "PASSED",
            description: "Express server bound to 0.0.0.0 for external container routing.",
            recommendedFix: "Ensure listen(PORT, '0.0.0.0') is preserved.",
          },
          {
            id: "inf-3",
            name: "Production Build Artifact Bundling",
            status: "WARNING",
            description: "Unoptimized server bundling causing slow container cold-start.",
            recommendedFix: "Use esbuild CommonJS bundling in dist/server.cjs.",
          },
        ],
      },
      {
        pillarId: "legal",
        name: "Legal, Billing & Compliance",
        score: 45,
        summary: "Unconfigured Stripe customer portal and missing refund terms.",
        checks: [
          {
            id: "leg-1",
            name: "Stripe Webhook Idempotency",
            status: "FAILED",
            description: "Raw webhook signatures were not verified on checkout events.",
            recommendedFix: "Implement express.raw({ type: 'application/json' }) before parsing.",
          },
          {
            id: "leg-2",
            name: "Refund & Cancellation Disclosures",
            status: "WARNING",
            description: "No explicit 14-day refund window stated in checkout modal.",
            recommendedFix: "Display transparent billing terms before payment capture.",
          },
          {
            id: "leg-3",
            name: "GDPR Data Erasure Protocol",
            status: "PASSED",
            description: "Compliant user deletion endpoints available.",
            recommendedFix: "Preserve data isolation and purge queues.",
          },
        ],
      },
      {
        pillarId: "claims",
        name: "Marketing Copy & Empirical Claims",
        score: 55,
        summary: "Exaggerated ROI promises detected in sample landing page copy.",
        checks: [
          {
            id: "clm-1",
            name: "Fact-Checked Value Propositions",
            status: "WARNING",
            description: "Headlines claimed '100% automated guaranteed revenue' without empirical test.",
            recommendedFix: "Frame claims strictly against demonstrable engineering baselines.",
          },
          {
            id: "clm-2",
            name: "Anti-Slop Visual Copy",
            status: "PASSED",
            description: "Eliminated buzzwords like 'supercharge' and 'revolutionary'.",
            recommendedFix: "Maintain grounded, professional architectural terminology.",
          },
          {
            id: "clm-3",
            name: "Transparent Pricing Breakdown",
            status: "FAILED",
            description: "Hidden platform fee not disclosed on pricing tier cards.",
            recommendedFix: "Publish all recurring and per-seat fees transparently.",
          },
        ],
      },
      {
        pillarId: "qa",
        name: "Interface Quality & Mobile Touch",
        score: 40,
        summary: "Failing touch target dimensions and contrast violations.",
        checks: [
          {
            id: "qa-1",
            name: "44px Minimum Touch Targets",
            status: "FAILED",
            description: "Navigation icons measured 28px, failing mobile touch standards.",
            recommendedFix: "Ensure all interactive tap areas measure at least 44x44px.",
          },
          {
            id: "qa-2",
            name: "WCAG 2.1 AA Color Contrast",
            status: "FAILED",
            description: "Low-contrast gray text on dark cards measured 2.8:1.",
            recommendedFix: "Ensure contrast ratio >= 4.5:1 for body copy.",
          },
          {
            id: "qa-3",
            name: "Non-Blocking Error UI Boundaries",
            status: "PASSED",
            description: "React Error Boundaries prevent app-wide blank screens.",
            recommendedFix: "Maintain graceful fallback cards on network failures.",
          },
        ],
      },
      {
        pillarId: "maintenance",
        name: "180-Day Operational Cadence",
        score: 60,
        summary: "Partial maintenance schedule without automated reminder webhooks.",
        checks: [
          {
            id: "mnt-1",
            name: "30-Day Early Error Triage SOP",
            status: "PASSED",
            description: "Checklist for logging triage defined.",
            recommendedFix: "Schedule weekly review of error logs.",
          },
          {
            id: "mnt-2",
            name: "90-Day Dependency & Security Patching",
            status: "WARNING",
            description: "No automated Dependabot or lockfile vulnerability scanning.",
            recommendedFix: "Implement quarterly automated dependency audits.",
          },
          {
            id: "mnt-3",
            name: "180-Day Credential & Secret Rotation",
            status: "FAILED",
            description: "Missing automated reminder for webhook and API key rotation.",
            recommendedFix: "Establish bi-annual secret rotation calendar.",
          },
        ],
      },
    ],
  },
  {
    id: "audit-sprint-rc1",
    appName: "1WithOut Master PWA Engine",
    liveUrl: "https://1without.io",
    repoUrl: "https://github.com/1without/master-engine",
    stackDescription: "Release Candidate 1: Ingress configured, server-side secret isolation completed.",
    launchReadinessScore: 72,
    status: "NEEDS_ATTENTION",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    cadenceSchedule: {
      day30Tasks: ["Review early crash logs", "Check unhandled exceptions", "Audit real-time metrics"],
      day90Tasks: ["Audit NPM dependencies", "Check database indices"],
      day180Tasks: ["Rotate credentials", "Pen-test sandbox ingress"],
    },
    pillars: [
      {
        pillarId: "security",
        name: "Security, Identity & Defense-of-Break",
        score: 85,
        summary: "Security hardened: Secret proxy routes active, Defense-of-Break passcode verified.",
        checks: [
          {
            id: "sec-1",
            name: "Client-Side Secret Isolation",
            status: "PASSED",
            description: "Zero API keys in client bundles. Proxy endpoints active.",
            recommendedFix: "Keep sensitive keys behind server-side /api/* proxy endpoints.",
          },
          {
            id: "sec-2",
            name: "Defense-of-Break Protection",
            status: "PASSED",
            description: "Passcode verification system actively protecting sensitive scopes.",
            recommendedFix: "Preserve strict passcode gating.",
          },
          {
            id: "sec-3",
            name: "CSP & Sanitization Directives",
            status: "PASSED",
            description: "DOMPurify and Content Security Policy headers active.",
            recommendedFix: "Maintain standard CSP nonce policies.",
          },
        ],
      },
      {
        pillarId: "infra",
        name: "Cloud Ingress & Container Port Binding",
        score: 80,
        summary: "Port 3000 ingress verified, fast cold starts.",
        checks: [
          {
            id: "inf-1",
            name: "Single-Port 3000 Ingress Routing",
            status: "PASSED",
            description: "App routes cleanly through single port 3000.",
            recommendedFix: "Preserve single port 3000 ingress configuration.",
          },
          {
            id: "inf-2",
            name: "0.0.0.0 Network Host Binding",
            status: "PASSED",
            description: "Bound to 0.0.0.0 for external container routing.",
            recommendedFix: "Maintain 0.0.0.0 host binding.",
          },
          {
            id: "inf-3",
            name: "Production Build Artifact Bundling",
            status: "WARNING",
            description: "Bundle size could be optimized with code-splitting.",
            recommendedFix: "Use dynamic imports for heavy chart libraries.",
          },
        ],
      },
      {
        pillarId: "legal",
        name: "Legal, Billing & Compliance",
        score: 70,
        summary: "Stripe idempotency fixed, refund policy published.",
        checks: [
          {
            id: "leg-1",
            name: "Stripe Webhook Idempotency",
            status: "PASSED",
            description: "Raw signatures verified on checkout events.",
            recommendedFix: "Maintain webhook signature validation.",
          },
          {
            id: "leg-2",
            name: "Refund & Cancellation Disclosures",
            status: "PASSED",
            description: "Clear refund terms displayed on checkout.",
            recommendedFix: "Preserve transparent billing terms.",
          },
          {
            id: "leg-3",
            name: "GDPR Data Erasure Protocol",
            status: "WARNING",
            description: "Automated export queue pending worker setup.",
            recommendedFix: "Wire background task for bulk ZIP archive export.",
          },
        ],
      },
      {
        pillarId: "claims",
        name: "Marketing Copy & Empirical Claims",
        score: 75,
        summary: "Empirical claims normalized.",
        checks: [
          {
            id: "clm-1",
            name: "Fact-Checked Value Propositions",
            status: "PASSED",
            description: "Grounded technical descriptions without wild financial promises.",
            recommendedFix: "Continue factual verification.",
          },
          {
            id: "clm-2",
            name: "Anti-Slop Visual Copy",
            status: "PASSED",
            description: "Clean professional typography and copy.",
            recommendedFix: "Maintain grounded tone.",
          },
          {
            id: "clm-3",
            name: "Transparent Pricing Breakdown",
            status: "WARNING",
            description: "Tier comparison matrix needs minor mobile alignment fix.",
            recommendedFix: "Ensure pricing cards fit single-column mobile viewports.",
          },
        ],
      },
      {
        pillarId: "qa",
        name: "Interface Quality & Mobile Touch",
        score: 60,
        summary: "Touch targets updated to 44px, remaining contrast issues on tags.",
        checks: [
          {
            id: "qa-1",
            name: "44px Minimum Touch Targets",
            status: "PASSED",
            description: "All interactive buttons measure >=44px.",
            recommendedFix: "Preserve 44px touch targets.",
          },
          {
            id: "qa-2",
            name: "WCAG 2.1 AA Color Contrast",
            status: "WARNING",
            description: "Subtle tag badges have 3.9:1 contrast ratio (target 4.5:1).",
            recommendedFix: "Darken text to slate-800 on emerald-50 tags.",
          },
          {
            id: "qa-3",
            name: "Non-Blocking Error UI Boundaries",
            status: "PASSED",
            description: "Error boundary handlers active.",
            recommendedFix: "Maintain boundary coverage.",
          },
        ],
      },
      {
        pillarId: "maintenance",
        name: "180-Day Operational Cadence",
        score: 75,
        summary: "Operational SOPs documented.",
        checks: [
          {
            id: "mnt-1",
            name: "30-Day Early Error Triage SOP",
            status: "PASSED",
            description: "Weekly triage calendar in place.",
            recommendedFix: "Continue scheduled triage.",
          },
          {
            id: "mnt-2",
            name: "90-Day Dependency & Security Patching",
            status: "PASSED",
            description: "Quarterly audit reminder active.",
            recommendedFix: "Preserve dependency review schedule.",
          },
          {
            id: "mnt-3",
            name: "180-Day Credential & Secret Rotation",
            status: "WARNING",
            description: "Manual reminder in calendar rather than automated dispatch.",
            recommendedFix: "Automate bi-annual secret rotation notifications.",
          },
        ],
      },
    ],
  },
];

/**
 * Load all historical audit sessions from local storage (or seed with baselines)
 */
export function getAuditHistory(): AppAuditReport[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load audit history from storage:", e);
  }
  return DEFAULT_BASELINE_AUDITS;
}

/**
 * Save an audit report to session history
 */
export function saveAuditToHistory(report: AppAuditReport): AppAuditReport[] {
  try {
    const history = getAuditHistory();
    // Filter out if duplicate ID exists
    const updated = [
      report,
      ...history.filter((item) => item.id !== report.id && item.appName === report.appName),
      ...history.filter((item) => item.appName !== report.appName),
    ].slice(0, 20); // Keep last 20

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save audit to history:", e);
    return [report, ...DEFAULT_BASELINE_AUDITS];
  }
}

/**
 * Delete an audit report from session history
 */
export function deleteAuditFromHistory(id: string): AppAuditReport[] {
  try {
    const history = getAuditHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete audit from history:", e);
    return [];
  }
}

/**
 * Compute side-by-side diff between baseline and current audit report
 */
export function computeAuditDiff(
  baseline: AppAuditReport,
  current: AppAuditReport
): AuditComparisonDiff {
  const scoreDelta = current.launchReadinessScore - baseline.launchReadinessScore;

  let overallTrend: AuditComparisonDiff["overallTrend"] = "neutral";
  let trendLabel = "Health Maintained (No Change)";

  if (scoreDelta >= 15) {
    overallTrend = "significant_improvement";
    trendLabel = "Significant App Health Improvement";
  } else if (scoreDelta > 0) {
    overallTrend = "moderate_improvement";
    trendLabel = "Moderate Health Progress";
  } else if (scoreDelta <= -15) {
    overallTrend = "critical_regression";
    trendLabel = "Critical Health Regression Detected";
  } else if (scoreDelta < 0) {
    overallTrend = "regression";
    trendLabel = "Health Regression Detected";
  }

  // Compute pillar diffs
  const pillarDiffs: PillarDiffItem[] = current.pillars.map((curPillar) => {
    const basePillar = baseline.pillars.find((p) => p.pillarId === curPillar.pillarId);
    const baselineScore = basePillar ? basePillar.score : 0;
    const pillarDelta = curPillar.score - baselineScore;

    let status: "improved" | "regressed" | "unchanged" = "unchanged";
    if (pillarDelta > 0) status = "improved";
    else if (pillarDelta < 0) status = "regressed";

    let improvedCount = 0;
    let regressedCount = 0;

    curPillar.checks.forEach((chk) => {
      const baseChk = basePillar?.checks.find((bc) => bc.id === chk.id || bc.name === chk.name);
      if (baseChk) {
        if (
          (baseChk.status === "FAILED" || baseChk.status === "WARNING") &&
          chk.status === "PASSED"
        ) {
          improvedCount++;
        } else if (
          baseChk.status === "PASSED" &&
          (chk.status === "FAILED" || chk.status === "WARNING")
        ) {
          regressedCount++;
        }
      }
    });

    return {
      pillarId: curPillar.pillarId,
      pillarName: curPillar.name,
      baselineScore,
      currentScore: curPillar.score,
      scoreDelta: pillarDelta,
      status,
      improvedChecksCount: improvedCount,
      regressedChecksCount: regressedCount,
      totalChecks: curPillar.checks.length,
    };
  });

  // Compute check diffs
  const checkDiffs: CheckDiffItem[] = [];
  let totalImprovedChecks = 0;
  let totalRegressedChecks = 0;
  let totalUnresolvedIssues = 0;
  let totalMaintainedPassed = 0;

  current.pillars.forEach((curPillar) => {
    const basePillar = baseline.pillars.find((p) => p.pillarId === curPillar.pillarId);

    curPillar.checks.forEach((chk) => {
      const baseChk = basePillar?.checks.find((bc) => bc.id === chk.id || bc.name === chk.name);
      const baselineStatus: CheckStatus = baseChk ? baseChk.status : "NOT_APPLICABLE";
      const currentStatus: CheckStatus = chk.status;

      let changeType: CheckDiffItem["changeType"] = "maintained_passed";

      if (!baseChk) {
        changeType = "new_check";
      } else if (
        (baselineStatus === "FAILED" || baselineStatus === "WARNING") &&
        currentStatus === "PASSED"
      ) {
        changeType = "improved";
        totalImprovedChecks++;
      } else if (
        baselineStatus === "PASSED" &&
        (currentStatus === "FAILED" || currentStatus === "WARNING")
      ) {
        changeType = "regressed";
        totalRegressedChecks++;
      } else if (
        (baselineStatus === "FAILED" || baselineStatus === "WARNING") &&
        (currentStatus === "FAILED" || currentStatus === "WARNING")
      ) {
        changeType = "unresolved_issue";
        totalUnresolvedIssues++;
      } else {
        changeType = "maintained_passed";
        totalMaintainedPassed++;
      }

      checkDiffs.push({
        checkId: chk.id,
        checkName: chk.name,
        pillarId: curPillar.pillarId,
        pillarName: curPillar.name,
        baselineStatus,
        currentStatus,
        changeType,
        description: chk.description,
        recommendedFix: chk.recommendedFix,
        patchCode: chk.patchCode,
      });
    });
  });

  return {
    baselineReport: baseline,
    currentReport: current,
    scoreDelta,
    overallTrend,
    trendLabel,
    statusTransition: {
      from: baseline.status,
      to: current.status,
    },
    totalImprovedChecks,
    totalRegressedChecks,
    totalUnresolvedIssues,
    totalMaintainedPassed,
    pillarDiffs,
    checkDiffs,
  };
}
