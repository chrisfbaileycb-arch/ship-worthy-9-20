import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { repository, StoredAuditEvent } from "./repository";

/**
 * Sanitizes metadata to strictly filter out secrets, passcodes, and raw tokens.
 */
export function sanitizeMetadata(meta: any): Record<string, any> {
  if (!meta || typeof meta !== "object") return {};
  const cleaned: Record<string, any> = {};

  const sensitiveKeys = new Set([
    "passcode",
    "password",
    "secret",
    "token",
    "authorization",
    "cookie",
    "api_key",
    "apikey",
    "gemini_api_key",
    "privatekey",
  ]);

  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (
      sensitiveKeys.has(lowerKey) ||
      lowerKey.includes("passcode") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token") ||
      lowerKey.includes("password") ||
      lowerKey.includes("api_key") ||
      lowerKey.includes("apikey") ||
      lowerKey.endsWith("_key") ||
      lowerKey.startsWith("key_")
    ) {
      cleaned[key] = "[REDACTED_SECRET]";
    } else if (typeof value === "object" && value !== null) {
      cleaned[key] = sanitizeMetadata(value);
    } else if (typeof value === "string" && value.length > 200) {
      cleaned[key] = value.substring(0, 200) + "... [truncated]";
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Records an immutable audit log entry.
 */
export async function recordAuditEvent(params: {
  requestId: string;
  userIdentifier?: string;
  sessionId?: string | null;
  action: string;
  route: string;
  targetResource?: string | null;
  outcome: "SUCCESS" | "FAILURE" | "BLOCKED" | "ERROR";
  statusCode: number;
  clientIp?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const ipHash = params.clientIp
      ? crypto.createHash("sha256").update(params.clientIp).digest("hex").substring(0, 16)
      : "unknown";

    const safeSessionIdentifier = params.sessionId
      ? `sess-${crypto.createHash("sha256").update(params.sessionId).digest("hex").substring(0, 12)}`
      : null;

    const event: StoredAuditEvent = {
      id: `audit-${crypto.randomBytes(8).toString("hex")}`,
      requestId: params.requestId,
      userIdentifier: params.userIdentifier || "anonymous",
      sessionId: safeSessionIdentifier,
      action: params.action,
      route: params.route,
      targetResource: params.targetResource || null,
      outcome: params.outcome,
      statusCode: params.statusCode,
      ipAddressHash: ipHash,
      metadata: sanitizeMetadata(params.metadata || {}),
      createdAt: new Date().toISOString(),
    };

    await repository.saveAuditEvent(event);
  } catch (err) {
    console.error("[1WithOut Audit] Failed to record audit log:", err);
  }
}

/**
 * Express middleware to automatically record audit entries for API endpoints.
 */
export function auditTrailMiddleware(req: Request, res: Response, next: NextFunction) {
  const t0 = Date.now();
  const requestId = (req as any).id || `req-${crypto.randomBytes(6).toString("hex")}`;
  (req as any).id = requestId;
  res.setHeader("X-Request-Id", requestId);

  // Hook into response finish
  res.on("finish", () => {
    // Only audit /api/ endpoints
    if (!req.path.startsWith("/api/")) return;

    // Skip high-frequency health checks from polluting audit logs unless failed
    if (req.path === "/api/health" && res.statusCode === 200) return;

    const durationMs = Date.now() - t0;
    const session = (req as any).session;
    const user = (req as any).user || (session ? session.user : "anonymous");

    let outcome: "SUCCESS" | "FAILURE" | "BLOCKED" | "ERROR" = "SUCCESS";
    if (res.statusCode >= 500) outcome = "ERROR";
    else if (res.statusCode === 403 || res.statusCode === 429) outcome = "BLOCKED";
    else if (res.statusCode >= 400) outcome = "FAILURE";

    recordAuditEvent({
      requestId,
      userIdentifier: user,
      sessionId: session?.sessionId || null,
      action: `${req.method} ${req.baseUrl || req.path}`,
      route: req.path,
      statusCode: res.statusCode,
      outcome,
      clientIp: req.ip || req.socket.remoteAddress,
      metadata: {
        durationMs,
        userAgent: req.headers["user-agent"] ? String(req.headers["user-agent"]).substring(0, 100) : "unknown",
        query: sanitizeMetadata(req.query),
      },
    });
  });

  next();
}
