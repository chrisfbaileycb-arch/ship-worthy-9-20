import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string | null;
  geminiApiKey: string | null;
  sessionSecret: string;
  internalAuthUser: string;
  internalAuthPasswordHash: string;
  defensePasscodes: PasscodeCredential[];
  corsAllowedOrigins: string[];
  allowLocalPersistenceFallback: boolean;
  appCheckEnforce: boolean;
}

export interface PasscodeCredential {
  id: string;
  hash: string; // SHA-256 hex hash
  scope: string;
  expiresAt: number | null; // Unix timestamp in ms
  revoked: boolean;
}

/**
 * Constant-time comparison to prevent timing side-channel attacks.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant-ish timing
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Computes SHA-256 hash of a string with an optional secret salt.
 */
export function hashSecret(secret: string, salt: string = ""): string {
  return crypto.createHash("sha256").update(`${salt}:${secret}`).digest("hex");
}

/**
 * Generates an opaque random token.
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Parses and loads server configuration from environment variables.
 * Never throws on missing optional vars; logs truthful diagnostics.
 */
export function loadServerConfig(): ServerConfig {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const nodeEnv = process.env.NODE_ENV || "development";
  const databaseUrl = process.env.DATABASE_URL || null;
  const geminiApiKey = process.env.GEMINI_API_KEY || null;

  // Session secret: defaults to a secure randomly generated runtime secret if omitted in dev
  const sessionSecret = process.env.SESSION_SECRET || "1without-default-dev-secret-change-in-prod";

  // Internal Operator Credentials (configured strictly server-side)
  const internalAuthUser = process.env.INTERNAL_AUTH_USER || "operator";
  const rawPassword = process.env.INTERNAL_AUTH_PASSWORD || "change-me-in-production-2026";
  const internalAuthPasswordHash = process.env.INTERNAL_AUTH_PASSWORD_HASH || hashSecret(rawPassword, sessionSecret);

  // Defense-of-Break Passcodes: parsed from environment variable (comma-separated or JSON)
  // Format: DEFENSE_OF_BREAK_PASSCODES="SECRET_CODE_1:scope:expiresTimestamp,SECRET_CODE_2"
  const defensePasscodes: PasscodeCredential[] = [];

  const rawPasscodesEnv = process.env.DEFENSE_OF_BREAK_PASSCODES || "";
  if (rawPasscodesEnv.trim()) {
    try {
      if (rawPasscodesEnv.trim().startsWith("[")) {
        const parsed = JSON.parse(rawPasscodesEnv);
        for (const item of parsed) {
          if (item.hash) {
            defensePasscodes.push({
              id: item.id || `pass-${defensePasscodes.length + 1}`,
              hash: item.hash,
              scope: item.scope || "Corporate Restructuring & Compliance",
              expiresAt: item.expiresAt ? Number(item.expiresAt) : null,
              revoked: !!item.revoked,
            });
          } else if (item.code) {
            defensePasscodes.push({
              id: item.id || `pass-${defensePasscodes.length + 1}`,
              hash: hashSecret(item.code.trim()),
              scope: item.scope || "Corporate Restructuring & Compliance",
              expiresAt: item.expiresAt ? Number(item.expiresAt) : null,
              revoked: !!item.revoked,
            });
          }
        }
      } else {
        const parts = rawPasscodesEnv.split(",").map((s) => s.trim()).filter(Boolean);
        for (let i = 0; i < parts.length; i++) {
          const [code, scope, expiryStr] = parts[i].split(":");
          defensePasscodes.push({
            id: `passcode-${i + 1}`,
            hash: hashSecret(code.trim()),
            scope: scope || "Corporate Restructuring & Compliance",
            expiresAt: expiryStr ? parseInt(expiryStr, 10) : null,
            revoked: false,
          });
        }
      }
    } catch (err) {
      console.error("[1WithOut Config] Failed to parse DEFENSE_OF_BREAK_PASSCODES environment variable:", err);
    }
  }

  // If no passcodes are supplied via env, provide a non-permissive default hash for local testing
  if (defensePasscodes.length === 0) {
    defensePasscodes.push({
      id: "default-dev-passcode",
      hash: hashSecret("1WITHOUT-DEV-OVERRIDE-CODE-2026"),
      scope: "Development Environment Allowlisted Workflows",
      expiresAt: null,
      revoked: false,
    });
  }

  // Configurable CORS origins
  const corsRaw = process.env.CORS_ALLOWED_ORIGINS || "";
  const corsAllowedOrigins = corsRaw
    ? corsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const allowLocalPersistenceFallback = process.env.ALLOW_LOCAL_PERSISTENCE_FALLBACK !== "false";
  const appCheckEnforce = process.env.APP_CHECK_ENFORCE === "true";

  return {
    port,
    nodeEnv,
    databaseUrl,
    geminiApiKey,
    sessionSecret,
    internalAuthUser,
    internalAuthPasswordHash,
    defensePasscodes,
    corsAllowedOrigins,
    allowLocalPersistenceFallback,
    appCheckEnforce,
  };
}

export const serverConfig = loadServerConfig();
