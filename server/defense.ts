import crypto from "crypto";
import { repository } from "./repository";
import { validateClearanceToken } from "./security";

export type DefenseDecision = "ALLOWED" | "BLOCKED" | "REQUIRES_AUTHORIZATION" | "ERROR";

export interface DefenseRule {
  id: string;
  name: string;
  category: "CREDENTIAL_LEAK" | "ZERO_TOLERANCE_PII" | "RESTRICTED_LEGAL" | "BENIGN_AUDIT";
  pattern: RegExp;
  decision: DefenseDecision;
  description: string;
  allowlistedBypassAllowed: boolean;
}

// Transparent application safeguard rules (heuristic boundaries)
export const DEFENSE_RULES: DefenseRule[] = [
  // 1. Raw Secrets & Keys (Zero Tolerance - BLOCKED)
  {
    id: "RULE-SEC-01",
    name: "Private Key Block",
    category: "CREDENTIAL_LEAK",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    decision: "BLOCKED",
    description: "Detected raw private key block in payload. Rejection is unconditional.",
    allowlistedBypassAllowed: false,
  },
  {
    id: "RULE-SEC-02",
    name: "Live Cloud Secret Key",
    category: "CREDENTIAL_LEAK",
    pattern: /\b(?:sk_live_[0-9a-zA-Z]{16,}|AKIA[0-9A-Z]{16})\b/,
    decision: "BLOCKED",
    description: "Detected live credential pattern. Rejection is unconditional.",
    allowlistedBypassAllowed: false,
  },
  // 2. Sensitive Personal Data / PHI (Zero Tolerance - BLOCKED)
  {
    id: "RULE-PII-01",
    name: "Social Security / Tax ID Pattern",
    category: "ZERO_TOLERANCE_PII",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/,
    decision: "BLOCKED",
    description: "Detected unmasked SSN/TIN format. Personal identity data is strictly prohibited.",
    allowlistedBypassAllowed: false,
  },
  {
    id: "RULE-PII-02",
    name: "Credit Card Primary Account Number",
    category: "ZERO_TOLERANCE_PII",
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/,
    decision: "BLOCKED",
    description: "Detected payment card PAN pattern. Rejection is unconditional.",
    allowlistedBypassAllowed: false,
  },
  {
    id: "RULE-MED-01",
    name: "Medical Records & Diagnostic Claims",
    category: "ZERO_TOLERANCE_PII",
    pattern: /\b(?:diagnose patient|prescribe medication|medical diagnosis|patient health record|phi record|cure cancer|fda secret cure)\b/i,
    decision: "BLOCKED",
    description: "Diagnostic claims and patient health records are restricted from automated pipeline compilation.",
    allowlistedBypassAllowed: false,
  },
  // 3. Corporate Restructuring & Insolvency Operations (Requires Authorization)
  {
    id: "RULE-LEG-01",
    name: "Bankruptcy Asset Restructuring & Chapter 11 Operations",
    category: "RESTRICTED_LEGAL",
    pattern: /(?:bankruptcy|chapter\s*11|chapter\s*7|insolvency|debtor-in-possession|liquidation\s*trust|creditor\s*committee)/i,
    decision: "REQUIRES_AUTHORIZATION",
    description: "Insolvency and debt restructuring workflows require verified internal Defense-of-Break compliance clearance.",
    allowlistedBypassAllowed: true,
  },
  {
    id: "RULE-LEG-02",
    name: "Pre-Packaged Reorganization Plan Processing",
    category: "RESTRICTED_LEGAL",
    pattern: /(?:restructuring\s*support\s*agreement|cramdown\s*plan|disclosure\s*statement\s*filing|proof\s*of\s*claim\s*batch)/i,
    decision: "REQUIRES_AUTHORIZATION",
    description: "Filing and claim aggregation requires operator compliance authorization.",
    allowlistedBypassAllowed: true,
  },
];

export interface DefenseEvaluationResult {
  decision: DefenseDecision;
  category: string;
  ruleTriggered: string;
  sanitizedReason: string;
  detectedSnippets: string[];
  allowlistedProjectEligible: boolean;
  suggestedAction: string;
  disclaimer: string;
  authorizationStatus: "AUTHORIZED" | "UNAUTHORIZED" | "NOT_REQUIRED";
}

/**
 * Evaluates content against transparent heuristic safeguards.
 */
export async function evaluateDefenseSafety(
  content: string,
  clearanceToken?: string,
  sessionId?: string | null
): Promise<DefenseEvaluationResult> {
  const disclaimer =
    "Defense-of-Break enforces application-level safeguards and heuristic boundaries. It does not provide statutory legal advice or guarantee regulatory compliance.";

  if (typeof content !== "string" || !content.trim()) {
    return {
      decision: "ALLOWED",
      category: "BENIGN_AUDIT",
      ruleTriggered: "NONE",
      sanitizedReason: "Empty payload evaluated as benign.",
      detectedSnippets: [],
      allowlistedProjectEligible: false,
      suggestedAction: "Provide project specification or audit text.",
      disclaimer,
      authorizationStatus: "NOT_REQUIRED",
    };
  }

  // Check clearance token validity
  const validClearance = await validateClearanceToken(clearanceToken);

  // Check rules in order of priority (BLOCKED first, then REQUIRES_AUTHORIZATION)
  for (const rule of DEFENSE_RULES) {
    const match = content.match(rule.pattern);
    if (match) {
      const snippet = match[0].length > 30 ? match[0].substring(0, 30) + "..." : match[0];
      const maskedSnippet = snippet.replace(/./g, (c, idx) => (idx < 3 || idx > snippet.length - 3 ? c : "*"));

      // Zero Tolerance: BLOCKED unconditionally
      if (rule.decision === "BLOCKED") {
        const result: DefenseEvaluationResult = {
          decision: "BLOCKED",
          category: rule.category,
          ruleTriggered: rule.name,
          sanitizedReason: rule.description,
          detectedSnippets: [maskedSnippet],
          allowlistedProjectEligible: false,
          suggestedAction: "Remove sensitive credentials or personal identity data immediately.",
          disclaimer,
          authorizationStatus: "UNAUTHORIZED",
        };

        // Record scan event
        await repository.saveDefenseScan({
          id: `scan-${crypto.randomBytes(8).toString("hex")}`,
          decision: "BLOCKED",
          category: rule.category,
          ruleTriggered: rule.name,
          sanitizedReason: rule.description,
          authorizationStatus: "UNAUTHORIZED",
          sessionId: sessionId || null,
          createdAt: new Date().toISOString(),
        });

        return result;
      }

      // Requires Authorization
      if (rule.decision === "REQUIRES_AUTHORIZATION") {
        const isAuthorized = !!validClearance && validClearance.isCleared;

        const result: DefenseEvaluationResult = {
          decision: isAuthorized ? "ALLOWED" : "REQUIRES_AUTHORIZATION",
          category: rule.category,
          ruleTriggered: rule.name,
          sanitizedReason: isAuthorized
            ? `${rule.description} [Clearance Verified: ${validClearance.clearanceId} - Scope: ${validClearance.authorizedScope}]`
            : rule.description,
          detectedSnippets: [maskedSnippet],
          allowlistedProjectEligible: true,
          suggestedAction: isAuthorized
            ? "Compliance clearance verified. Processing authorized."
            : "Enter an administrator-issued compliance passcode into the Defense Gate to obtain a secure clearance token.",
          disclaimer,
          authorizationStatus: isAuthorized ? "AUTHORIZED" : "UNAUTHORIZED",
        };

        await repository.saveDefenseScan({
          id: `scan-${crypto.randomBytes(8).toString("hex")}`,
          decision: isAuthorized ? "ALLOWED" : "REQUIRES_AUTHORIZATION",
          category: rule.category,
          ruleTriggered: rule.name,
          sanitizedReason: result.sanitizedReason,
          authorizationStatus: isAuthorized ? "AUTHORIZED" : "UNAUTHORIZED",
          sessionId: sessionId || null,
          createdAt: new Date().toISOString(),
        });

        return result;
      }
    }
  }

  // All rules passed
  return {
    decision: "ALLOWED",
    category: "BENIGN_AUDIT",
    ruleTriggered: "ALL_SAFEGUARDS_PASSED",
    sanitizedReason: "All heuristic application safeguards passed without restriction.",
    detectedSnippets: [],
    allowlistedProjectEligible: false,
    suggestedAction: "Proceed with standard pipeline execution.",
    disclaimer,
    authorizationStatus: "NOT_REQUIRED",
  };
}
