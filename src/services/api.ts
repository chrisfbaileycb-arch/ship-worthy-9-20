import {
  DiscernmentReport,
  AgentSkillPackage,
  AppAuditReport,
  IntakeModality,
  ProcessingMode,
  DefenseScanResult,
  SecurityClearance,
  AuditEventItem,
  ReadinessSuiteItem,
} from "../types";

export interface PipelineResult {
  title: string;
  mode: string;
  overview: string;
  keyTakeaways: string[];
  sections: {
    heading: string;
    content: string;
    actionItems?: string[];
  }[];
  safetyWarnings?: string[];
  executionChecklist: string[];
}

export async function scanDefenseSafety(content: string): Promise<DefenseScanResult> {
  const res = await fetch("/api/defense/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Defense scan failed with status ${res.status}`);
  }

  return await res.json();
}

export async function authorizeDefensePasscode(
  passcode: string,
  projectName?: string,
  scope?: string
): Promise<SecurityClearance> {
  const res = await fetch("/api/defense/authorize-passcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode, projectName, scope }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Defense-of-Break Passcode authorization failed.");
  }

  return await res.json();
}

export async function runDiscernmentAudit(
  content: string,
  inputType: IntakeModality,
  sourceUrl?: string,
  mode: ProcessingMode = "evaluate",
  securityPasscode?: string
): Promise<DiscernmentReport> {
  const res = await fetch("/api/discern", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, inputType, sourceUrl, mode, securityPasscode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Discernment failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    ...data,
    id: `audit-${Date.now()}`,
    title: sourceUrl ? `Audit: ${sourceUrl}` : "Opportunity Discernment Report",
    sourceType: inputType,
    sourceUrl,
    createdAt: new Date().toISOString(),
  };
}

export async function buildAgentSkill(
  tutorialContent: string,
  skillName: string,
  targetPlatform: string = "universal",
  sourceModality: IntakeModality = "text",
  securityPasscode?: string
): Promise<AgentSkillPackage> {
  const res = await fetch("/api/skills/build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tutorialContent,
      skillName,
      targetPlatform,
      sourceModality,
      securityPasscode,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Skill generation failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    ...data,
    id: `skill-${Date.now()}`,
    targetPlatform,
    sourceModality,
    createdAt: new Date().toISOString(),
  };
}

export async function runPreFlightScan(
  appName: string,
  stackDescription?: string,
  liveUrl?: string,
  repoUrl?: string,
  codeSnippets?: string
): Promise<AppAuditReport> {
  const res = await fetch("/api/audit/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appName, stackDescription, liveUrl, repoUrl, codeSnippets }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Pre-flight scan failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    ...data,
    id: `scan-${Date.now()}`,
    liveUrl,
    repoUrl,
    stackDescription,
    createdAt: new Date().toISOString(),
  };
}

export async function processPipeline(
  mode: ProcessingMode,
  rawContent: string,
  inputType: IntakeModality,
  title?: string
): Promise<PipelineResult> {
  const res = await fetch("/api/pipeline/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, rawContent, inputType, title }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Pipeline failed with status ${res.status}`);
  }

  return await res.json();
}

const SESSION_ID_KEY = "1without_operator_session_id";
const LOGGED_OUT_KEY = "1without_explicitly_logged_out";

export function getStoredOperatorSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_ID_KEY);
  } catch {
    return null;
  }
}

export function setStoredOperatorSessionId(sessionId: string | null): void {
  try {
    if (sessionId) {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      sessionStorage.removeItem(LOGGED_OUT_KEY);
    } else {
      localStorage.removeItem(SESSION_ID_KEY);
    }
  } catch {
    // Ignore storage unavailability
  }
}

function getOperatorHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const sessionId = getStoredOperatorSessionId();
  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }
  return headers;
}

export async function fetchAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditEventItem[]> {
  const headers = getOperatorHeaders();
  const res = await fetch(`/api/admin/audit-logs?limit=${limit}&offset=${offset}`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  // Track session ID header if returned by server
  const returnedSessionId = res.headers.get("x-session-id");
  if (returnedSessionId) {
    setStoredOperatorSessionId(returnedSessionId);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch audit logs (${res.status})`);
  }

  const data = await res.json();
  return data.events || [];
}

export async function runDeploymentReadiness(): Promise<ReadinessSuiteItem> {
  const res = await fetch("/api/admin/readiness/run", {
    method: "POST",
    credentials: "include",
    headers: getOperatorHeaders(),
  });

  const returnedSessionId = res.headers.get("x-session-id");
  if (returnedSessionId) {
    setStoredOperatorSessionId(returnedSessionId);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Readiness test failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.suite;
}

export async function fetchLatestReadiness(): Promise<ReadinessSuiteItem | null> {
  const res = await fetch("/api/admin/readiness/latest", {
    method: "GET",
    credentials: "include",
    headers: getOperatorHeaders(),
  });

  const returnedSessionId = res.headers.get("x-session-id");
  if (returnedSessionId) {
    setStoredOperatorSessionId(returnedSessionId);
  }

  if (!res.ok) return null;
  const data = await res.json();
  return data.suite || null;
}

export async function loginOperator(
  username: string,
  password: string
): Promise<{ success: boolean; user?: string; sessionId?: string; error?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }

  const data = await res.json();
  if (data.sessionId) {
    setStoredOperatorSessionId(data.sessionId);
  }
  return data;
}

export async function logoutOperator(): Promise<void> {
  try {
    sessionStorage.setItem(LOGGED_OUT_KEY, "true");
  } catch {}
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: getOperatorHeaders(),
  });
  setStoredOperatorSessionId(null);
}

export async function fetchOperatorSession(): Promise<{ authenticated: boolean; user?: string; sessionId?: string } | null> {
  try {
    const headers = getOperatorHeaders();
    if (sessionStorage.getItem(LOGGED_OUT_KEY) === "true") {
      headers["x-logged-out"] = "true";
    }
    const res = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      headers,
    });
    if (!res.ok) return { authenticated: false };
    const data = await res.json();
    if (data.authenticated && data.sessionId) {
      setStoredOperatorSessionId(data.sessionId);
    }
    return data;
  } catch {
    return { authenticated: false };
  }
}

export async function fetchSubsystemReadiness(): Promise<import("../types").SubsystemReadinessReport | null> {
  try {
    const res = await fetch("/api/readiness", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    // Even on 503 (FAILED status), the JSON payload is returned with detailed diagnostics
    return await res.json();
  } catch {
    return null;
  }
}

export async function inspectLiveTarget(params: {
  targetUrl?: string;
  rawHtml?: string;
}): Promise<import("../types").LiveInspectionReport> {
  const res = await fetch("/api/inspect/live-target", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Live target inspection failed (${res.status})`);
  }

  return await res.json();
}


