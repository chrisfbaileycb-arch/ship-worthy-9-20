import fs from "fs";
import path from "path";
import { getFirestoreDb } from "./firebase";
import { hashSecret, generateSecureToken, serverConfig } from "./config";

export interface DurableSession {
  sessionId: string;
  sessionIdHash?: string;
  user: string;
  role: "operator" | "admin" | "auditor";
  createdAt: number | string;
  issuedAt: string;
  expiresAt: number;
  csrfToken: string;
  revoked: boolean;
  lastActivity: number;
  lastActivityAt?: string;
  updatedAt?: string;
}

export interface DurableClearance {
  clearanceId: string;
  tokenHash: string; // SHA-256 hash of clearance token
  projectName: string;
  authorizedScope: string;
  issuedAt: string;
  expiresAt: string;
  revoked: boolean;
  operatorId?: string | null;
  authorizationEventId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DurableRateLimitRecord {
  key: string;
  count: number;
  resetAt: number;
  updatedAt: string;
}

export type StorageBackendType = "FIRESTORE" | "LOCAL_DURABLE_DISK" | "REJECTED_PROD_FALLBACK";

// ─── Local JSON Persistence Helpers ──────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), ".data");

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const fullPath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fullPath)) return fallback;
    const raw = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const fullPath = path.join(DATA_DIR, filename);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(`[1WithOut Storage] Failed to write ${filename}:`, err);
  }
}

// ─── 1. DURABLE OPERATOR SESSION STORE ───────────────────────────────────────
export class DurableSessionStore {
  // Non-authoritative local cache for instant read-through and local fallback
  private localSessions: Map<string, DurableSession> = new Map();
  private readonly filename = "durable_sessions.json";

  constructor() {
    this.loadFromDisk();
  }

  public loadFromDisk(): void {
    const list = readJsonFile<DurableSession[]>(this.filename, []);
    this.localSessions.clear();
    const now = Date.now();
    for (const item of list) {
      if (item.expiresAt > now && !item.revoked) {
        this.localSessions.set(item.sessionId, item);
      }
    }
  }

  private saveToDisk(): void {
    writeJsonFile(this.filename, Array.from(this.localSessions.values()));
  }

  public clearLocalCache(): void {
    this.localSessions.clear();
  }

  async createSession(
    user: string,
    role: "operator" | "admin" | "auditor" = "operator",
    durationMs: number = 8 * 60 * 60 * 1000
  ): Promise<DurableSession> {
    const now = Date.now();
    const sessionId = generateSecureToken(32);
    const sessionIdHash = hashSecret(sessionId);
    const csrfToken = generateSecureToken(16);
    const nowIso = new Date(now).toISOString();

    const session: DurableSession = {
      sessionId,
      sessionIdHash,
      user: user.trim(),
      role,
      createdAt: nowIso,
      issuedAt: nowIso,
      expiresAt: now + durationMs,
      csrfToken,
      revoked: false,
      lastActivity: now,
      lastActivityAt: nowIso,
      updatedAt: nowIso,
    };

    // 1. Persist to Firestore as canonical source of truth when configured
    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("sessions").doc(sessionId).set(session);
      } catch (err) {
        console.warn("[1WithOut SessionStore] Firestore write error (falling back to disk):", err);
      }
    } else {
      // If Firestore is unconfigured in strict production, check fallback allowance
      if (!serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
        throw new Error("Cannot create session: Firestore unconfigured and local fallback is prohibited in production.");
      }
    }

    // 2. Mirror to local disk and cache for resilience
    this.localSessions.set(sessionId, session);
    this.saveToDisk();

    return session;
  }

  async getSession(sessionId?: string): Promise<DurableSession | null> {
    if (!sessionId || typeof sessionId !== "string") return null;
    const cleanId = sessionId.trim();
    if (!cleanId) return null;
    const now = Date.now();

    // 1. Query Firestore first as canonical source of truth
    const db = getFirestoreDb();
    if (db) {
      try {
        const snap = await db.collection("sessions").doc(cleanId).get();
        if (snap.exists) {
          const s = snap.data() as DurableSession;
          // Check revoked status
          if (s.revoked) {
            this.localSessions.delete(cleanId);
            return null;
          }
          // Check expiration
          if (s.expiresAt <= now) {
            this.localSessions.delete(cleanId);
            return null;
          }
          // Periodically update last activity in background
          if (now - (s.lastActivity || 0) > 60000) {
            db.collection("sessions")
              .doc(cleanId)
              .update({
                lastActivity: now,
                lastActivityAt: new Date(now).toISOString(),
                updatedAt: new Date(now).toISOString(),
              })
              .catch(() => {});
          }
          // Keep local cache synced with canonical data
          this.localSessions.set(cleanId, s);
          return s;
        } else {
          // Document does not exist in Firestore
          this.localSessions.delete(cleanId);
          return null;
        }
      } catch (err) {
        console.warn("[1WithOut SessionStore] Firestore query failed, evaluating fallback:", err);
      }
    }

    // 2. Fail safe in strict production if local fallback is disallowed
    if (!db && !serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
      console.error("[1WithOut SessionStore] Strict production mode: Local session fallback prohibited without Firestore.");
      return null;
    }

    // 3. Fallback to local durable cache
    const cached = this.localSessions.get(cleanId);
    if (!cached) {
      // Re-read disk in case another process updated it
      this.loadFromDisk();
      const rechecked = this.localSessions.get(cleanId);
      if (!rechecked) return null;
      if (rechecked.expiresAt <= now || rechecked.revoked) {
        this.localSessions.delete(cleanId);
        this.saveToDisk();
        return null;
      }
      return rechecked;
    }

    if (cached.expiresAt <= now || cached.revoked) {
      this.localSessions.delete(cleanId);
      this.saveToDisk();
      return null;
    }

    cached.lastActivity = now;
    return cached;
  }

  async revokeSession(sessionId: string): Promise<void> {
    if (!sessionId) return;
    const cleanId = sessionId.trim();
    const nowIso = new Date().toISOString();

    // 1. Update Firestore immediately so all instances see the revocation
    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("sessions").doc(cleanId).update({
          revoked: true,
          updatedAt: nowIso,
        });
      } catch (err) {
        console.warn("[1WithOut SessionStore] Firestore session revocation warning:", err);
      }
    }

    // 2. Invalidate local cache and disk
    const cached = this.localSessions.get(cleanId);
    if (cached) {
      cached.revoked = true;
      this.localSessions.delete(cleanId);
      this.saveToDisk();
    }
  }

  async cleanExpired(): Promise<number> {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, s] of this.localSessions.entries()) {
      if (s.expiresAt <= now || s.revoked) {
        this.localSessions.delete(id);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this.saveToDisk();
    }
    return cleaned;
  }

  async checkHealth(): Promise<{ healthy: boolean; backend: StorageBackendType; latencyMs: number; error?: string }> {
    const t0 = performance.now();
    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("sessions").limit(1).get();
        return {
          healthy: true,
          backend: "FIRESTORE",
          latencyMs: Math.round(performance.now() - t0),
        };
      } catch (err: any) {
        return {
          healthy: false,
          backend: "FIRESTORE",
          latencyMs: Math.round(performance.now() - t0),
          error: err.message,
        };
      }
    }

    if (!serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
      return {
        healthy: false,
        backend: "REJECTED_PROD_FALLBACK",
        latencyMs: 0,
        error: "Firestore unconfigured and ALLOW_LOCAL_PERSISTENCE_FALLBACK=false in production.",
      };
    }

    const diskHealthy = fs.existsSync(DATA_DIR);
    return {
      healthy: diskHealthy,
      backend: "LOCAL_DURABLE_DISK",
      latencyMs: Math.round(performance.now() - t0),
    };
  }
}

// ─── 2. DURABLE DEFENSE CLEARANCE STORE ──────────────────────────────────────
export class DurableClearanceStore {
  // Non-authoritative local cache for fast lookup
  private localClearances: Map<string, DurableClearance> = new Map();
  private readonly filename = "durable_clearances.json";

  constructor() {
    this.loadFromDisk();
  }

  public loadFromDisk(): void {
    const list = readJsonFile<DurableClearance[]>(this.filename, []);
    this.localClearances.clear();
    const now = Date.now();
    for (const item of list) {
      if (new Date(item.expiresAt).getTime() > now && !item.revoked) {
        this.localClearances.set(item.tokenHash, item);
      }
    }
  }

  private saveToDisk(): void {
    writeJsonFile(this.filename, Array.from(this.localClearances.values()));
  }

  public clearLocalCache(): void {
    this.localClearances.clear();
  }

  async issueClearance(params: {
    projectName: string;
    scope: string;
    durationMs?: number;
    operatorId?: string | null;
    authorizationEventId?: string | null;
  }): Promise<{ clearance: DurableClearance; rawToken: string }> {
    const now = Date.now();
    const duration = params.durationMs || 8 * 60 * 60 * 1000; // 8 hours
    const rawToken = generateSecureToken(32);
    const tokenHash = hashSecret(rawToken);
    const clearanceId = `clr-${generateSecureToken(8)}`;
    const nowIso = new Date(now).toISOString();
    const expiresAt = new Date(now + duration).toISOString();

    const clearance: DurableClearance = {
      clearanceId,
      tokenHash,
      projectName: params.projectName,
      authorizedScope: params.scope,
      issuedAt: nowIso,
      expiresAt,
      revoked: false,
      operatorId: params.operatorId || null,
      authorizationEventId: params.authorizationEventId || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 1. Persist to Firestore as canonical source of truth (keyed by tokenHash so raw token is NEVER persisted)
    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("clearances").doc(tokenHash).set(clearance);
      } catch (err) {
        console.warn("[1WithOut ClearanceStore] Firestore write error (saving locally):", err);
      }
    } else {
      if (!serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
        throw new Error("Cannot issue clearance: Firestore unconfigured and local fallback is prohibited in production.");
      }
    }

    // 2. Persist locally to disk cache
    this.localClearances.set(tokenHash, clearance);
    this.saveToDisk();

    return { clearance, rawToken };
  }

  async validateClearance(rawToken?: string): Promise<DurableClearance | null> {
    if (!rawToken || typeof rawToken !== "string") return null;
    const tokenHash = hashSecret(rawToken.trim());
    const now = Date.now();

    // 1. Check Firestore first as canonical store
    const db = getFirestoreDb();
    if (db) {
      try {
        const snap = await db.collection("clearances").doc(tokenHash).get();
        if (snap.exists) {
          const clr = snap.data() as DurableClearance;
          if (clr.revoked) {
            this.localClearances.delete(tokenHash);
            return null;
          }
          if (new Date(clr.expiresAt).getTime() <= now) {
            this.localClearances.delete(tokenHash);
            return null;
          }
          this.localClearances.set(tokenHash, clr);
          return clr;
        } else {
          this.localClearances.delete(tokenHash);
          return null;
        }
      } catch (err) {
        console.warn("[1WithOut ClearanceStore] Firestore query failed, evaluating fallback:", err);
      }
    }

    // 2. Fail safe if fallback prohibited in production
    if (!db && !serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
      console.error("[1WithOut ClearanceStore] Strict production mode: Local clearance fallback prohibited without Firestore.");
      return null;
    }

    // 3. Fallback to local cache
    const cached = this.localClearances.get(tokenHash);
    if (!cached) {
      this.loadFromDisk();
      const rechecked = this.localClearances.get(tokenHash);
      if (!rechecked) return null;
      if (new Date(rechecked.expiresAt).getTime() <= now || rechecked.revoked) {
        this.localClearances.delete(tokenHash);
        this.saveToDisk();
        return null;
      }
      return rechecked;
    }

    if (new Date(cached.expiresAt).getTime() <= now || cached.revoked) {
      this.localClearances.delete(tokenHash);
      this.saveToDisk();
      return null;
    }

    return cached;
  }

  async revokeClearance(identifier: string): Promise<void> {
    if (!identifier) return;
    let targetHash: string | null = null;

    if (this.localClearances.has(identifier)) {
      targetHash = identifier;
    } else {
      const computedHash = hashSecret(identifier.trim());
      if (this.localClearances.has(computedHash)) {
        targetHash = computedHash;
      } else {
        // Match by clearanceId
        for (const [hash, c] of this.localClearances.entries()) {
          if (c.clearanceId === identifier.trim()) {
            targetHash = hash;
            break;
          }
        }
        if (!targetHash) {
          targetHash = computedHash;
        }
      }
    }

    const nowIso = new Date().toISOString();

    // 1. Update Firestore immediately
    const db = getFirestoreDb();
    if (db && targetHash) {
      try {
        await db.collection("clearances").doc(targetHash).update({
          revoked: true,
          updatedAt: nowIso,
        });
      } catch (err) {
        console.warn("[1WithOut ClearanceStore] Firestore clearance revocation warning:", err);
      }
    }

    // 2. Invalidate local cache and save disk
    if (targetHash) {
      const c = this.localClearances.get(targetHash);
      if (c) c.revoked = true;
      this.localClearances.delete(targetHash);
      this.saveToDisk();
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; backend: StorageBackendType; latencyMs: number; error?: string }> {
    const t0 = performance.now();
    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("clearances").limit(1).get();
        return {
          healthy: true,
          backend: "FIRESTORE",
          latencyMs: Math.round(performance.now() - t0),
        };
      } catch (err: any) {
        return {
          healthy: false,
          backend: "FIRESTORE",
          latencyMs: Math.round(performance.now() - t0),
          error: err.message,
        };
      }
    }

    if (!serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
      return {
        healthy: false,
        backend: "REJECTED_PROD_FALLBACK",
        latencyMs: 0,
        error: "Firestore unconfigured and ALLOW_LOCAL_PERSISTENCE_FALLBACK=false in production.",
      };
    }

    return {
      healthy: fs.existsSync(DATA_DIR),
      backend: "LOCAL_DURABLE_DISK",
      latencyMs: Math.round(performance.now() - t0),
    };
  }
}

// ─── 3. DISTRIBUTED RATE LIMITER STORE ──────────────────────────────────────
export class DurableRateLimiterStore {
  // Non-authoritative local cache for fallback
  private localCounters: Map<string, DurableRateLimitRecord> = new Map();
  private readonly filename = "durable_rate_limits.json";

  constructor() {
    this.loadFromDisk();
  }

  public loadFromDisk(): void {
    const list = readJsonFile<DurableRateLimitRecord[]>(this.filename, []);
    this.localCounters.clear();
    const now = Date.now();
    for (const item of list) {
      if (item.resetAt > now) {
        this.localCounters.set(item.key, item);
      }
    }
  }

  private saveToDisk(): void {
    writeJsonFile(this.filename, Array.from(this.localCounters.values()));
  }

  public clearLocalCache(): void {
    this.localCounters.clear();
  }

  /**
   * Atomic check and increment for a rate limit key.
   * Multi-instance safe across horizontal replicas via Firestore transactions.
   */
  async checkAndIncrement(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number; count: number; currentCount: number }> {
    const now = Date.now();
    const safeKey = key.replace(/[^a-zA-Z0-9_:-]/g, "_");

    // 1. Distributed atomic transaction in Firestore
    const db = getFirestoreDb();
    if (db) {
      try {
        const docRef = db.collection("rate_limits").doc(safeKey);
        const result = await db.runTransaction(async (t) => {
          const snap = await t.get(docRef);
          if (!snap.exists) {
            const newRecord: DurableRateLimitRecord = {
              key: safeKey,
              count: 1,
              resetAt: now + windowMs,
              updatedAt: new Date(now).toISOString(),
            };
            t.set(docRef, newRecord);
            return {
              allowed: true,
              remaining: Math.max(0, limit - 1),
              resetAt: newRecord.resetAt,
              count: 1,
              currentCount: 1,
            };
          }

          const data = snap.data() as DurableRateLimitRecord;
          if (data.resetAt <= now) {
            // Window has expired, start fresh atomic cycle
            const fresh: DurableRateLimitRecord = {
              key: safeKey,
              count: 1,
              resetAt: now + windowMs,
              updatedAt: new Date(now).toISOString(),
            };
            t.set(docRef, fresh);
            return {
              allowed: true,
              remaining: Math.max(0, limit - 1),
              resetAt: fresh.resetAt,
              count: 1,
              currentCount: 1,
            };
          }

          const newCount = (data.count || 0) + 1;
          t.update(docRef, { count: newCount, updatedAt: new Date(now).toISOString() });
          return {
            allowed: newCount <= limit,
            remaining: Math.max(0, limit - newCount),
            resetAt: data.resetAt,
            count: newCount,
            currentCount: newCount,
          };
        });

        // Mirror to local cache for fast reference
        this.localCounters.set(safeKey, {
          key: safeKey,
          count: result.count,
          resetAt: result.resetAt,
          updatedAt: new Date(now).toISOString(),
        });

        return result;
      } catch (err) {
        console.warn("[1WithOut RateLimiter] Firestore transaction failed, evaluating fallback:", err);
      }
    }

    // 2. Strict production check
    if (!db && !serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
      console.error("[1WithOut RateLimiter] Strict production mode: Local rate limiter fallback prohibited without Firestore.");
      // Fail closed: reject request to protect against unmetered attacks
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + windowMs,
        count: limit + 1,
        currentCount: limit + 1,
      };
    }

    // 3. Local disk fallback
    this.loadFromDisk();
    let record = this.localCounters.get(safeKey);
    if (!record || record.resetAt <= now) {
      record = {
        key: safeKey,
        count: 1,
        resetAt: now + windowMs,
        updatedAt: new Date(now).toISOString(),
      };
      this.localCounters.set(safeKey, record);
      this.saveToDisk();
      return {
        allowed: true,
        remaining: Math.max(0, limit - 1),
        resetAt: record.resetAt,
        count: 1,
        currentCount: 1,
      };
    }

    record.count += 1;
    record.updatedAt = new Date(now).toISOString();
    this.saveToDisk();

    return {
      allowed: record.count <= limit,
      remaining: Math.max(0, limit - record.count),
      resetAt: record.resetAt,
      count: record.count,
      currentCount: record.count,
    };
  }

  async recordFailedAttempt(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const res = await this.checkAndIncrement(key, 99999, windowMs);
    return { count: res.count, resetAt: res.resetAt };
  }

  async resetLimit(key: string): Promise<void> {
    const safeKey = key.replace(/[^a-zA-Z0-9_:-]/g, "_");
    this.localCounters.delete(safeKey);
    this.saveToDisk();

    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("rate_limits").doc(safeKey).delete();
      } catch (err) {
        console.warn("[1WithOut RateLimiter] Firestore reset warning:", err);
      }
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; backend: StorageBackendType; latencyMs: number; error?: string }> {
    const t0 = performance.now();
    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("rate_limits").limit(1).get();
        return {
          healthy: true,
          backend: "FIRESTORE",
          latencyMs: Math.round(performance.now() - t0),
        };
      } catch (err: any) {
        return {
          healthy: false,
          backend: "FIRESTORE",
          latencyMs: Math.round(performance.now() - t0),
          error: err.message,
        };
      }
    }

    if (!serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
      return {
        healthy: false,
        backend: "REJECTED_PROD_FALLBACK",
        latencyMs: 0,
        error: "Firestore unconfigured and ALLOW_LOCAL_PERSISTENCE_FALLBACK=false in production.",
      };
    }

    return {
      healthy: fs.existsSync(DATA_DIR),
      backend: "LOCAL_DURABLE_DISK",
      latencyMs: Math.round(performance.now() - t0),
    };
  }
}

// Canonical Shared Singletons
export const durableSessionStore = new DurableSessionStore();
export const durableClearanceStore = new DurableClearanceStore();
export const durableRateLimiterStore = new DurableRateLimiterStore();
