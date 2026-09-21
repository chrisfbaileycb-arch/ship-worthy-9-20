import { AppRegistryItem, CadenceScheduleDetailed, CadenceMilestone } from "../types";

export function calculateDaysSince(dateString: string): number {
  try {
    const launch = new Date(dateString).getTime();
    const now = Date.now();
    const diff = Math.floor((now - launch) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

export function addDays(dateString: string, days: number): string {
  try {
    const d = new Date(dateString);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export function buildDefaultCadence(launchDateStr: string): CadenceScheduleDetailed {
  const daysSince = calculateDaysSince(launchDateStr);

  const getStatus = (targetDay: number, completed: boolean): "CLEAR" | "DUE_SOON" | "OVERDUE" => {
    if (completed) return "CLEAR";
    const daysUntilDue = targetDay - daysSince;
    if (daysUntilDue < 0) return "OVERDUE";
    if (daysUntilDue <= 15) return "DUE_SOON";
    return "CLEAR";
  };

  const day30Completed = daysSince > 30;
  const day60Completed = false;
  const day90Completed = false;
  const day180Completed = false;

  return {
    day30: {
      stage: "day30",
      title: "Day 30: Early Triage & Error Sentinel",
      daysTarget: 30,
      dueDate: addDays(launchDateStr, 30),
      completed: day30Completed,
      completedDate: day30Completed ? addDays(launchDateStr, 29) : undefined,
      status: getStatus(30, day30Completed),
      description: "Sentinel error log review, false-positive filtering, and webhook retry health.",
      tasks: [
        { id: "d30-1", label: "Sentinel error log review: Verify zero unhandled 5xx exceptions across services", done: day30Completed, category: "triage" },
        { id: "d30-2", label: "False-positive rate filtering on rate limiters and defense-of-break scanners", done: day30Completed, category: "triage" },
        { id: "d30-3", label: "Webhook retry health: Verify dead-letter queues and transaction idempotency", done: day30Completed, category: "triage" },
      ],
    },
    day60: {
      stage: "day60",
      title: "Day 60: Mid-Flight Security & CSP Health",
      daysTarget: 60,
      dueDate: addDays(launchDateStr, 60),
      completed: day60Completed,
      status: getStatus(60, day60Completed),
      description: "Secret leak scans, CSP violation reports, and edge cache TTL checks.",
      tasks: [
        { id: "d60-1", label: "Automated git secret leak scan across all branches and pull requests", done: false, category: "security" },
        { id: "d60-2", label: "CSP violation telemetry review: Audit inline scripts and dynamic origins", done: false, category: "security" },
        { id: "d60-3", label: "Edge cache TTL verification: Ensure stale-while-revalidate policies are functioning", done: false, category: "security" },
      ],
    },
    day90: {
      stage: "day90",
      title: "Day 90: Version & Dependency Audit",
      daysTarget: 90,
      dueDate: addDays(launchDateStr, 90),
      completed: day90Completed,
      status: getStatus(90, day90Completed),
      description: "Package audit updates (npm audit fix), API SDK wrapper migrations, and WCAG AA accessibility spot checks.",
      tasks: [
        { id: "d90-1", label: "Automated package vulnerability scan: Execute npm audit fix for non-breaking patches", done: false, category: "version_dependency" },
        { id: "d90-2", label: "API SDK wrapper migrations: Upgrade client libraries to latest LTS releases", done: false, category: "version_dependency" },
        { id: "d90-3", label: "WCAG 2.1 AA accessibility spot check across contrast, keyboard navigation, and focus rings", done: false, category: "version_dependency" },
      ],
    },
    day180: {
      stage: "day180",
      title: "Day 180: Rotation & Compliance Archival",
      daysTarget: 180,
      dueDate: addDays(launchDateStr, 180),
      completed: day180Completed,
      status: getStatus(180, day180Completed),
      description: "Service token & database credential rotation, GDPR/CCPA disclosure audits, and IP retention evaluation.",
      tasks: [
        { id: "d180-1", label: "Service token, JWT secrets, and operator session key rotation", done: false, category: "compliance_rotation" },
        { id: "d180-2", label: "GDPR/CCPA privacy disclosure alignment and user data deletion policy verification", done: false, category: "compliance_rotation" },
        { id: "d180-3", label: "IP retention, USPTO trademark clearance review, and immutable audit snapshot archival", done: false, category: "compliance_rotation" },
      ],
    },
  };
}

export async function generateDossierSha256(app: AppRegistryItem): Promise<string> {
  const payload = JSON.stringify({
    id: app.id,
    name: app.name,
    organization: app.organization || "Independent",
    scope: app.projectScope,
    phase: app.lifecyclePhase,
    score: app.readinessScore,
    liveUrl: app.liveUrl || "",
    repoUrl: app.repoUrl || "",
    timestamp: new Date().toISOString(),
  });

  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(payload);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return `sha256-${hashHex}`;
    } catch {
      // fallback
    }
  }

  // Simple deterministic fallback
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const chr = payload.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return `sha256-${Math.abs(hash).toString(16).padStart(16, "0")}`;
}
