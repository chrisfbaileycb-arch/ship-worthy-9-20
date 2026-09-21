import { AppAuditReport, AxeAuditSummary } from "../types";

export interface EmailAuditPayload {
  recipientEmail: string;
  recipientName: string;
  recipientRole?: string;
  subject: string;
  customNotes?: string;
  report: AppAuditReport;
  axeSummary?: AxeAuditSummary | null;
  includePdfAttachment?: boolean;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId: string;
  sentAt: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  readinessScore: number;
  status: "delivered" | "failed";
  attachmentName?: string;
  pillarBreakdown: Array<{ pillar: string; score: number; failedChecks: number }>;
  wcagScore?: number;
  deliveryLog: string[];
}

/**
 * Mock email delivery service that dispatches 6-pillar findings & Axe-Core accessibility
 * telemetry to the designated project lead or engineering stakeholder.
 */
export async function sendAuditReportEmail(
  payload: EmailAuditPayload
): Promise<EmailDeliveryResult> {
  // Simulate network transport and mail server transaction
  await new Promise((resolve) => setTimeout(resolve, 1100));

  if (!payload.recipientEmail || !payload.recipientEmail.includes("@")) {
    throw new Error("Invalid recipient email address provided.");
  }

  const messageId = `msg_audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const sentAt = new Date().toISOString();

  const pillarBreakdown = payload.report.pillars.map((p) => ({
    pillar: p.name,
    score: p.score,
    failedChecks: p.checks.filter((c) => c.status === "FAILED").length,
  }));

  const attachmentName = payload.includePdfAttachment
    ? `${payload.report.appName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_preflight_audit.pdf`
    : undefined;

  const deliveryLog = [
    `[${new Date().toLocaleTimeString()}] Connected to mock SMTP relay mail.1without.io:587`,
    `[${new Date().toLocaleTimeString()}] Authenticated as launch-matrix-bot@1without.io`,
    `[${new Date().toLocaleTimeString()}] Rendering 6-pillar HTML executive summary (${payload.report.launchReadinessScore}/100 Readiness)`,
    payload.includePdfAttachment
      ? `[${new Date().toLocaleTimeString()}] Attached binary payload: ${attachmentName}`
      : `[${new Date().toLocaleTimeString()}] PDF attachment skipped by sender`,
    payload.axeSummary
      ? `[${new Date().toLocaleTimeString()}] Included Axe-Core accessibility telemetry (${payload.axeSummary.wcagComplianceScore}% WCAG AA)`
      : `[${new Date().toLocaleTimeString()}] Axe-Core telemetry not attached`,
    `[${new Date().toLocaleTimeString()}] 250 OK: Message ${messageId} accepted for delivery to ${payload.recipientEmail}`,
  ];

  return {
    success: true,
    messageId,
    sentAt,
    recipientEmail: payload.recipientEmail,
    recipientName: payload.recipientName,
    subject: payload.subject,
    readinessScore: payload.report.launchReadinessScore,
    status: "delivered",
    attachmentName,
    pillarBreakdown,
    wcagScore: payload.axeSummary?.wcagComplianceScore,
    deliveryLog,
  };
}
