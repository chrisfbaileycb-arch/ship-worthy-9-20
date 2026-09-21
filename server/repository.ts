import fs from "fs";
import path from "path";
import { Pool } from "pg";
import type { Firestore } from "firebase-admin/firestore";
import { serverConfig } from "./config";
import { getFirestoreDb, getFirebaseStatus } from "./firebase";

export interface StoredAuditEvent {
  id: string;
  requestId: string;
  userIdentifier: string;
  sessionId?: string | null;
  action: string;
  route: string;
  targetResource?: string | null;
  outcome: "SUCCESS" | "FAILURE" | "BLOCKED" | "ERROR";
  statusCode: number;
  ipAddressHash?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StoredAuthorizationEvent {
  id: string;
  clearanceId: string;
  eventType: "ATTEMPT" | "GRANTED" | "REVOKED" | "EXPIRED" | "FAILED";
  projectName?: string;
  scope?: string;
  success: boolean;
  reason?: string;
  sessionId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface StoredDefenseScan {
  id: string;
  decision: "ALLOWED" | "BLOCKED" | "REQUIRES_AUTHORIZATION" | "ERROR";
  category: string;
  ruleTriggered: string;
  sanitizedReason: string;
  authorizationStatus: string;
  contentFingerprint?: string;
  sessionId?: string | null;
  createdAt: string;
}

export interface StoredDiscernment {
  id: string;
  title: string;
  sourceType: string;
  sourceUrl?: string | null;
  evidenceIndex: string;
  overallScore: number | null;
  summary: string;
  claimsCount: number;
  claimsData: any[];
  sandboxPlan: any;
  sessionId?: string | null;
  createdAt: string;
}

export interface StoredTestRun {
  id: string;
  runType: "DEPLOYMENT_READINESS" | "SYNTHETIC_PERSONA" | "SECURITY_INTEGRITY";
  suiteName: string;
  status: "NOT_RUN" | "PASSED" | "FAILED" | "SKIPPED" | "INCOMPLETE";
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  durationMs: number;
  evidence: Record<string, any>;
  sessionId?: string | null;
  createdAt: string;
}

export interface DataRepository {
  saveAuditEvent(event: StoredAuditEvent): Promise<void>;
  getAuditEvents(limit?: number, offset?: number): Promise<StoredAuditEvent[]>;
  saveAuthorizationEvent(event: StoredAuthorizationEvent): Promise<void>;
  saveDefenseScan(scan: StoredDefenseScan): Promise<void>;
  saveDiscernmentReport(report: StoredDiscernment): Promise<void>;
  saveTestRun(testRun: StoredTestRun): Promise<void>;
  getLatestTestRuns(limit?: number): Promise<StoredTestRun[]>;
  checkHealth(): Promise<{ isConnected: boolean; engine: string; latencyMs: number; error?: string }>;
  healthCheck(): Promise<{ healthy: boolean; mode: string; latencyMs: number; error?: string }>;
  close(): Promise<void>;
}

// ─── Local JSON Persistent Store Fallback ───────────────────────────────────
class LocalFileRepository implements DataRepository {
  private dataDir: string;
  private filePath: string;
  private data: {
    auditEvents: StoredAuditEvent[];
    authorizationEvents: StoredAuthorizationEvent[];
    defenseScans: StoredDefenseScan[];
    discernmentReports: StoredDiscernment[];
    testRuns: StoredTestRun[];
  };

  constructor() {
    this.dataDir = path.join(process.cwd(), ".data");
    this.filePath = path.join(this.dataDir, "persistence.json");
    this.data = {
      auditEvents: [],
      authorizationEvents: [],
      defenseScans: [],
      discernmentReports: [],
      testRuns: [],
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = {
          auditEvents: Array.isArray(parsed.auditEvents) ? parsed.auditEvents : [],
          authorizationEvents: Array.isArray(parsed.authorizationEvents) ? parsed.authorizationEvents : [],
          defenseScans: Array.isArray(parsed.defenseScans) ? parsed.defenseScans : [],
          discernmentReports: Array.isArray(parsed.discernmentReports) ? parsed.discernmentReports : [],
          testRuns: Array.isArray(parsed.testRuns) ? parsed.testRuns : [],
        };
      } else {
        this.persist();
      }
    } catch (err) {
      console.warn("[1WithOut Persistence] Error initializing local persistent file:", err);
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("[1WithOut Persistence] Failed to write local persistent file:", err);
    }
  }

  async saveAuditEvent(event: StoredAuditEvent): Promise<void> {
    this.data.auditEvents.unshift(event);
    if (this.data.auditEvents.length > 2000) {
      this.data.auditEvents.length = 2000;
    }
    this.persist();
  }

  async getAuditEvents(limit: number = 50, offset: number = 0): Promise<StoredAuditEvent[]> {
    return this.data.auditEvents.slice(offset, offset + limit);
  }

  async saveAuthorizationEvent(event: StoredAuthorizationEvent): Promise<void> {
    this.data.authorizationEvents.unshift(event);
    if (this.data.authorizationEvents.length > 500) {
      this.data.authorizationEvents.length = 500;
    }
    this.persist();
  }

  async saveDefenseScan(scan: StoredDefenseScan): Promise<void> {
    this.data.defenseScans.unshift(scan);
    if (this.data.defenseScans.length > 1000) {
      this.data.defenseScans.length = 1000;
    }
    this.persist();
  }

  async saveDiscernmentReport(report: StoredDiscernment): Promise<void> {
    this.data.discernmentReports.unshift(report);
    if (this.data.discernmentReports.length > 500) {
      this.data.discernmentReports.length = 500;
    }
    this.persist();
  }

  async saveTestRun(testRun: StoredTestRun): Promise<void> {
    this.data.testRuns.unshift(testRun);
    if (this.data.testRuns.length > 200) {
      this.data.testRuns.length = 200;
    }
    this.persist();
  }

  async getLatestTestRuns(limit: number = 10): Promise<StoredTestRun[]> {
    return this.data.testRuns.slice(0, limit);
  }

  async checkHealth(): Promise<{ isConnected: boolean; engine: string; latencyMs: number; error?: string }> {
    const t0 = performance.now();
    const canWrite = fs.existsSync(this.dataDir);
    const latency = Math.round(performance.now() - t0);
    return {
      isConnected: canWrite,
      engine: "resilient-local-persistence",
      latencyMs: latency,
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; mode: string; latencyMs: number; error?: string }> {
    const health = await this.checkHealth();
    return {
      healthy: health.isConnected,
      mode: "local-persistent-json",
      latencyMs: health.latencyMs,
      error: health.error,
    };
  }

  async close(): Promise<void> {
    this.persist();
  }
}

// ─── Cloud Firestore Data Repository (Primary Managed Backend) ─────────────
export class FirestoreRepository implements DataRepository {
  private db: Firestore;
  private fallback: LocalFileRepository;

  constructor(db: Firestore) {
    this.db = db;
    this.fallback = new LocalFileRepository();
  }

  async saveAuditEvent(event: StoredAuditEvent): Promise<void> {
    await this.fallback.saveAuditEvent(event);
    try {
      await this.db.collection("audit_logs").doc(event.id).set({
        ...event,
        timestamp: new Date(event.createdAt).getTime(),
      });
    } catch (err) {
      console.warn("[1WithOut Firestore] Failed to persist audit event (persisted locally):", err);
    }
  }

  async getAuditEvents(limit: number = 50, offset: number = 0): Promise<StoredAuditEvent[]> {
    try {
      const snap = await this.db
        .collection("audit_logs")
        .orderBy("createdAt", "desc")
        .limit(limit + offset)
        .get();

      if (!snap.empty) {
        const all = snap.docs.map((doc) => doc.data() as StoredAuditEvent);
        return all.slice(offset, offset + limit);
      }
    } catch (err) {
      console.warn("[1WithOut Firestore] Error fetching audit logs from Firestore, reading from fallback:", err);
    }
    return this.fallback.getAuditEvents(limit, offset);
  }

  async saveAuthorizationEvent(event: StoredAuthorizationEvent): Promise<void> {
    await this.fallback.saveAuthorizationEvent(event);
    try {
      await this.db.collection("authorization_events").doc(event.id).set(event);
    } catch (err) {
      console.warn("[1WithOut Firestore] Failed to persist authorization event:", err);
    }
  }

  async saveDefenseScan(scan: StoredDefenseScan): Promise<void> {
    await this.fallback.saveDefenseScan(scan);
    try {
      await this.db.collection("defense_scans").doc(scan.id).set(scan);
    } catch (err) {
      console.warn("[1WithOut Firestore] Failed to persist defense scan:", err);
    }
  }

  async saveDiscernmentReport(report: StoredDiscernment): Promise<void> {
    await this.fallback.saveDiscernmentReport(report);
    try {
      await this.db.collection("discernment_reports").doc(report.id).set(report);
    } catch (err) {
      console.warn("[1WithOut Firestore] Failed to persist discernment report:", err);
    }
  }

  async saveTestRun(testRun: StoredTestRun): Promise<void> {
    await this.fallback.saveTestRun(testRun);
    try {
      await this.db.collection("readiness_history").doc(testRun.id).set(testRun);
    } catch (err) {
      console.warn("[1WithOut Firestore] Failed to persist test run to readiness_history:", err);
    }
  }

  async getLatestTestRuns(limit: number = 10): Promise<StoredTestRun[]> {
    try {
      const snap = await this.db
        .collection("readiness_history")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StoredTestRun);
      }
    } catch (err) {
      console.warn("[1WithOut Firestore] Failed to query readiness history, using fallback:", err);
    }
    return this.fallback.getLatestTestRuns(limit);
  }

  async checkHealth(): Promise<{ isConnected: boolean; engine: string; latencyMs: number; error?: string }> {
    const t0 = performance.now();
    try {
      await this.db.collection("_health").doc("ping").get();
      const latency = Math.round(performance.now() - t0);
      return {
        isConnected: true,
        engine: "cloud-firestore-admin",
        latencyMs: latency,
      };
    } catch (err: any) {
      const latency = Math.round(performance.now() - t0);
      return {
        isConnected: false,
        engine: "cloud-firestore-admin",
        latencyMs: latency,
        error: err.message || "Firestore connection check failed",
      };
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; mode: string; latencyMs: number; error?: string }> {
    const health = await this.checkHealth();
    return {
      healthy: health.isConnected,
      mode: health.isConnected ? "firestore-managed" : "fallback-local-json",
      latencyMs: health.latencyMs,
      error: health.error,
    };
  }

  async close(): Promise<void> {
    await this.fallback.close();
  }
}

// ─── OPTIONAL SQL ADAPTER: PostgreSQL Data Repository ───────────────────────
class PostgresRepository implements DataRepository {
  private pool: Pool;
  private fallback: LocalFileRepository;
  private initialized: boolean = false;

  constructor(databaseUrl: string) {
    this.fallback = new LocalFileRepository();
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
    });
  }

  private async ensureTables(): Promise<void> {
    if (this.initialized) return;
    try {
      const client = await this.pool.connect();
      try {
        await client.query(`
          create table if not exists audit_events (
            id text primary key,
            request_id text not null,
            user_identifier text not null default 'anonymous',
            session_id text,
            action text not null,
            route text not null,
            target_resource text,
            outcome text not null,
            status_code integer not null,
            ip_address_hash text,
            metadata jsonb not null default '{}'::jsonb,
            created_at timestamptz not null default now()
          );

          create table if not exists authorization_events (
            id text primary key,
            clearance_id text not null,
            event_type text not null,
            project_name text,
            scope text,
            success boolean not null default false,
            reason text,
            session_id text,
            expires_at timestamptz,
            created_at timestamptz not null default now()
          );

          create table if not exists defense_scans (
            id text primary key,
            decision text not null,
            category text not null,
            rule_triggered text not null,
            sanitized_reason text not null,
            authorization_status text not null default 'UNAUTHORIZED',
            content_fingerprint text,
            session_id text,
            created_at timestamptz not null default now()
          );

          create table if not exists test_runs (
            id text primary key,
            run_type text not null,
            suite_name text not null,
            status text not null,
            total_tests integer not null default 0,
            passed_tests integer not null default 0,
            failed_tests integer not null default 0,
            skipped_tests integer not null default 0,
            duration_ms integer not null default 0,
            evidence jsonb not null default '{}'::jsonb,
            session_id text,
            created_at timestamptz not null default now()
          );
        `);
        this.initialized = true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn("[1WithOut Postgres] Table initialization warning (will retry on operations):", err);
    }
  }

  async saveAuditEvent(event: StoredAuditEvent): Promise<void> {
    // Always mirror to fallback for resilience
    await this.fallback.saveAuditEvent(event);
    try {
      await this.ensureTables();
      await this.pool.query(
        `insert into audit_events 
          (id, request_id, user_identifier, session_id, action, route, target_resource, outcome, status_code, ip_address_hash, metadata, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          event.id,
          event.requestId,
          event.userIdentifier,
          event.sessionId || null,
          event.action,
          event.route,
          event.targetResource || null,
          event.outcome,
          event.statusCode,
          event.ipAddressHash || null,
          JSON.stringify(event.metadata || {}),
          event.createdAt,
        ]
      );
    } catch (err) {
      console.error("[1WithOut Postgres] Failed to save audit event to PostgreSQL:", err);
    }
  }

  async getAuditEvents(limit: number = 50, offset: number = 0): Promise<StoredAuditEvent[]> {
    try {
      await this.ensureTables();
      const res = await this.pool.query(
        `select id, request_id as "requestId", user_identifier as "userIdentifier",
                session_id as "sessionId", action, route, target_resource as "targetResource",
                outcome, status_code as "statusCode", ip_address_hash as "ipAddressHash",
                metadata, created_at as "createdAt"
         from audit_events
         order by created_at desc
         limit $1 offset $2`,
        [limit, offset]
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          ...r,
          metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata,
        }));
      }
    } catch (err) {
      console.warn("[1WithOut Postgres] Failed to read audit events from Postgres, reading from fallback:", err);
    }
    return this.fallback.getAuditEvents(limit, offset);
  }

  async saveAuthorizationEvent(event: StoredAuthorizationEvent): Promise<void> {
    await this.fallback.saveAuthorizationEvent(event);
    try {
      await this.ensureTables();
      await this.pool.query(
        `insert into authorization_events 
          (id, clearance_id, event_type, project_name, scope, success, reason, session_id, expires_at, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          event.id,
          event.clearanceId,
          event.eventType,
          event.projectName || null,
          event.scope || null,
          event.success,
          event.reason || null,
          event.sessionId || null,
          event.expiresAt || null,
          event.createdAt,
        ]
      );
    } catch (err) {
      console.error("[1WithOut Postgres] Failed to save authorization event to Postgres:", err);
    }
  }

  async saveDefenseScan(scan: StoredDefenseScan): Promise<void> {
    await this.fallback.saveDefenseScan(scan);
    try {
      await this.ensureTables();
      await this.pool.query(
        `insert into defense_scans 
          (id, decision, category, rule_triggered, sanitized_reason, authorization_status, content_fingerprint, session_id, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          scan.id,
          scan.decision,
          scan.category,
          scan.ruleTriggered,
          scan.sanitizedReason,
          scan.authorizationStatus,
          scan.contentFingerprint || null,
          scan.sessionId || null,
          scan.createdAt,
        ]
      );
    } catch (err) {
      console.error("[1WithOut Postgres] Failed to save defense scan to Postgres:", err);
    }
  }

  async saveDiscernmentReport(report: StoredDiscernment): Promise<void> {
    await this.fallback.saveDiscernmentReport(report);
  }

  async saveTestRun(testRun: StoredTestRun): Promise<void> {
    await this.fallback.saveTestRun(testRun);
    try {
      await this.ensureTables();
      await this.pool.query(
        `insert into test_runs 
          (id, run_type, suite_name, status, total_tests, passed_tests, failed_tests, skipped_tests, duration_ms, evidence, session_id, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          testRun.id,
          testRun.runType,
          testRun.suiteName,
          testRun.status,
          testRun.totalTests,
          testRun.passedTests,
          testRun.failedTests,
          testRun.skippedTests,
          testRun.durationMs,
          JSON.stringify(testRun.evidence || {}),
          testRun.sessionId || null,
          testRun.createdAt,
        ]
      );
    } catch (err) {
      console.error("[1WithOut Postgres] Failed to save test run to Postgres:", err);
    }
  }

  async getLatestTestRuns(limit: number = 10): Promise<StoredTestRun[]> {
    try {
      await this.ensureTables();
      const res = await this.pool.query(
        `select id, run_type as "runType", suite_name as "suiteName", status,
                total_tests as "totalTests", passed_tests as "passedTests",
                failed_tests as "failedTests", skipped_tests as "skippedTests",
                duration_ms as "durationMs", evidence, session_id as "sessionId",
                created_at as "createdAt"
         from test_runs
         order by created_at desc
         limit $1`,
        [limit]
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          ...r,
          evidence: typeof r.evidence === "string" ? JSON.parse(r.evidence) : r.evidence,
        }));
      }
    } catch (err) {
      console.warn("[1WithOut Postgres] Failed to query test runs from Postgres:", err);
    }
    return this.fallback.getLatestTestRuns(limit);
  }

  async checkHealth(): Promise<{ isConnected: boolean; engine: string; latencyMs: number; error?: string }> {
    const t0 = performance.now();
    try {
      const client = await this.pool.connect();
      try {
        await client.query("select 1 as ping");
        const latency = Math.round(performance.now() - t0);
        return {
          isConnected: true,
          engine: "postgresql",
          latencyMs: latency,
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - t0);
      return {
        isConnected: false,
        engine: "postgresql",
        latencyMs: latency,
        error: err.message || "PostgreSQL connection failed",
      };
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; mode: string; latencyMs: number; error?: string }> {
    const health = await this.checkHealth();
    return {
      healthy: health.isConnected,
      mode: health.isConnected ? "postgresql-pooled" : "fallback-local-json",
      latencyMs: health.latencyMs,
      error: health.error,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
    await this.fallback.close();
  }
}

// ─── Dynamic Unified Repository Proxy ───────────────────────────────────────
class DynamicRepositoryProxy implements DataRepository {
  private firestoreRepo: FirestoreRepository | null = null;
  private postgresRepo: PostgresRepository | null = null;
  private localRepo: LocalFileRepository = new LocalFileRepository();

  private getDelegate(): DataRepository {
    const db = getFirestoreDb();
    if (db) {
      if (!this.firestoreRepo) {
        this.firestoreRepo = new FirestoreRepository(db);
      }
      return this.firestoreRepo;
    }
    if (serverConfig.databaseUrl && serverConfig.databaseUrl.trim()) {
      if (!this.postgresRepo) {
        this.postgresRepo = new PostgresRepository(serverConfig.databaseUrl.trim());
      }
      return this.postgresRepo;
    }
    if (!serverConfig.allowLocalPersistenceFallback && process.env.NODE_ENV === "production") {
      throw new Error("Local persistence fallback is prohibited in production when ALLOW_LOCAL_PERSISTENCE_FALLBACK=false.");
    }
    return this.localRepo;
  }

  async saveAuditEvent(event: StoredAuditEvent): Promise<void> {
    return this.getDelegate().saveAuditEvent(event);
  }
  async getAuditEvents(limit: number = 50, offset: number = 0): Promise<StoredAuditEvent[]> {
    return this.getDelegate().getAuditEvents(limit, offset);
  }
  async saveAuthorizationEvent(event: StoredAuthorizationEvent): Promise<void> {
    return this.getDelegate().saveAuthorizationEvent(event);
  }
  async saveDefenseScan(scan: StoredDefenseScan): Promise<void> {
    return this.getDelegate().saveDefenseScan(scan);
  }
  async saveDiscernmentReport(report: StoredDiscernment): Promise<void> {
    return this.getDelegate().saveDiscernmentReport(report);
  }
  async saveTestRun(run: StoredTestRun): Promise<void> {
    return this.getDelegate().saveTestRun(run);
  }
  async getLatestTestRuns(limit: number = 10): Promise<StoredTestRun[]> {
    return this.getDelegate().getLatestTestRuns(limit);
  }
  async checkHealth(): Promise<{ isConnected: boolean; engine: string; latencyMs: number; error?: string }> {
    return this.getDelegate().checkHealth();
  }
  async healthCheck(): Promise<{ healthy: boolean; mode: string; latencyMs: number; error?: string }> {
    return this.getDelegate().healthCheck();
  }
  async close(): Promise<void> {
    if (this.postgresRepo) await this.postgresRepo.close();
    await this.localRepo.close();
  }
}

// ─── Repository Factory ─────────────────────────────────────────────────────
export function createDataRepository(): DataRepository {
  return new DynamicRepositoryProxy();
}

export const repository = createDataRepository();
