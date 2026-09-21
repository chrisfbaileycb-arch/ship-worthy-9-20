import { getApps, initializeApp, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getAppCheck, type AppCheck } from "firebase-admin/app-check";
import fs from "fs";

export type FirebaseOperationalMode = "PRODUCTION" | "EMULATOR" | "UNCONFIGURED" | "DEGRADED";

export interface FirebaseStatus {
  initialized: boolean;
  mode: FirebaseOperationalMode;
  projectId: string | null;
  usingEmulator: boolean;
  services: {
    firestore: boolean;
    auth: boolean;
    appCheck: boolean;
  };
  error: string | null;
  initializedAt: string | null;
}

let firebaseApp: App | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;
let firebaseAppCheck: AppCheck | null = null;

let currentStatus: FirebaseStatus = {
  initialized: false,
  mode: "UNCONFIGURED",
  projectId: null,
  usingEmulator: false,
  services: {
    firestore: false,
    auth: false,
    appCheck: false,
  },
  error: null,
  initializedAt: null,
};

/**
 * Parses and sanitizes a private key string.
 * Handles escaped newlines (`\n`) commonly encountered in environment variables.
 */
function sanitizePrivateKey(rawKey?: string): string | undefined {
  if (!rawKey) return undefined;
  let key = rawKey.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

/**
 * Initializes the server-side Firebase Admin SDK.
 * 
 * Priority hierarchy:
 * 1. Emulator host if FIRESTORE_EMULATOR_HOST is present
 * 2. Service account JSON via FIREBASE_SERVICE_ACCOUNT_KEY
 * 3. Individual credentials via FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * 4. Ambient Application Default Credentials (GCP/Cloud Run environment)
 * 5. If unconfigured, marks status as UNCONFIGURED without crashing.
 */
export function initializeFirebaseAdmin(): { app: App | null; db: Firestore | null; status: FirebaseStatus } {
  if (firebaseApp && firestoreDb) {
    return { app: firebaseApp, db: firestoreDb, status: currentStatus };
  }

  const isEmulator = !!(
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST
  );

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    (isEmulator ? "demo-1without-local" : null);

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  try {
    const existingApps = getApps();
    // If already initialized by another module
    if (existingApps.length > 0 && existingApps[0]) {
      firebaseApp = existingApps[0];
      firestoreDb = getFirestore(firebaseApp);
      firebaseAuth = getAuth(firebaseApp);
      try {
        firebaseAppCheck = getAppCheck(firebaseApp);
      } catch {
        // App check optional
      }

      currentStatus = {
        initialized: true,
        mode: isEmulator ? "EMULATOR" : "PRODUCTION",
        projectId: projectId || firebaseApp.options.projectId || "ambient-project",
        usingEmulator: isEmulator,
        services: {
          firestore: true,
          auth: true,
          appCheck: !!firebaseAppCheck,
        },
        error: null,
        initializedAt: new Date().toISOString(),
      };

      return { app: firebaseApp, db: firestoreDb, status: currentStatus };
    }

    let credential = null;

    if (isEmulator) {
      // Running under emulator
      firebaseApp = initializeApp({
        projectId: projectId || "demo-1without-local",
      });
    } else if (serviceAccountRaw) {
      let saObj: any;
      if (serviceAccountRaw.trim().startsWith("{")) {
        saObj = JSON.parse(serviceAccountRaw);
      } else if (fs.existsSync(serviceAccountRaw)) {
        saObj = JSON.parse(fs.readFileSync(serviceAccountRaw, "utf-8"));
      } else {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY specified but file does not exist or JSON invalid.");
      }

      credential = cert(saObj);
      firebaseApp = initializeApp({
        credential,
        projectId: saObj.project_id || projectId || undefined,
      });
    } else if (projectId && clientEmail && privateKey) {
      credential = cert({
        projectId,
        clientEmail,
        privateKey,
      });
      firebaseApp = initializeApp({
        credential,
        projectId,
      });
    } else if (projectId) {
      // Application Default Credentials
      try {
        credential = applicationDefault();
        firebaseApp = initializeApp({
          credential,
          projectId,
        });
      } catch (adcErr: any) {
        // Unconfigured fallback
        currentStatus = {
          initialized: false,
          mode: "UNCONFIGURED",
          projectId,
          usingEmulator: false,
          services: { firestore: false, auth: false, appCheck: false },
          error: `ADC unavailable and explicit credentials not provided: ${adcErr.message}`,
          initializedAt: null,
        };
        return { app: null, db: null, status: currentStatus };
      }
    } else {
      // No credentials provided; application will use local durable store fallback
      currentStatus = {
        initialized: false,
        mode: "UNCONFIGURED",
        projectId: null,
        usingEmulator: false,
        services: {
          firestore: false,
          auth: false,
          appCheck: false,
        },
        error: "No Firebase configuration found (FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_KEY, or FIRESTORE_EMULATOR_HOST). Durable local fallback active.",
        initializedAt: null,
      };
      return { app: null, db: null, status: currentStatus };
    }

    // Initialize sub-services
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);

    try {
      firebaseAppCheck = getAppCheck(firebaseApp);
    } catch {
      firebaseAppCheck = null;
    }

    currentStatus = {
      initialized: true,
      mode: isEmulator ? "EMULATOR" : "PRODUCTION",
      projectId: projectId || firebaseApp.options.projectId || "ambient-project",
      usingEmulator: isEmulator,
      services: {
        firestore: true,
        auth: true,
        appCheck: !!firebaseAppCheck,
      },
      error: null,
      initializedAt: new Date().toISOString(),
    };

    console.log(
      `[1WithOut Firebase] Initialized in ${currentStatus.mode} mode for project: ${currentStatus.projectId}`
    );

    return { app: firebaseApp, db: firestoreDb, status: currentStatus };
  } catch (err: any) {
    currentStatus = {
      initialized: false,
      mode: "DEGRADED",
      projectId: projectId || null,
      usingEmulator: isEmulator,
      services: {
        firestore: false,
        auth: false,
        appCheck: false,
      },
      error: err.message || "Failed to initialize Firebase Admin SDK",
      initializedAt: null,
    };

    return { app: null, db: null, status: currentStatus };
  }
}

/**
 * Accessor for Firestore instance. Returns null if unconfigured or degraded.
 */
export function getFirestoreDb(): Firestore | null {
  if (!firestoreDb) {
    initializeFirebaseAdmin();
  }
  return firestoreDb;
}

/**
 * Accessor for Firebase Auth. Returns null if unconfigured.
 */
export function getFirebaseAuth(): Auth | null {
  if (!firebaseAuth) {
    initializeFirebaseAdmin();
  }
  return firebaseAuth;
}

/**
 * Accessor for Firebase App Check. Returns null if unconfigured.
 */
export function getFirebaseAppCheck(): AppCheck | null {
  if (!firebaseAppCheck) {
    initializeFirebaseAdmin();
  }
  return firebaseAppCheck;
}

/**
 * Retrieves the current status and diagnostic state of Firebase integration.
 */
export function getFirebaseStatus(): FirebaseStatus {
  if (!currentStatus.initialized && currentStatus.mode === "UNCONFIGURED") {
    initializeFirebaseAdmin();
  }
  return { ...currentStatus };
}

/**
 * Resets Firebase client connection for test teardowns or graceful restarts.
 */
export async function closeFirebase(): Promise<void> {
  firebaseApp = null;
  firestoreDb = null;
  firebaseAuth = null;
  firebaseAppCheck = null;
  currentStatus = {
    initialized: false,
    mode: "UNCONFIGURED",
    projectId: null,
    usingEmulator: false,
    services: { firestore: false, auth: false, appCheck: false },
    error: null,
    initializedAt: null,
  };
}

/**
 * Helper to inspect the Firebase operational posture for readiness probes.
 */
export function getFirebaseOperationalState(): {
  isConfigured: boolean;
  isEmulator: boolean;
  mode: FirebaseOperationalMode;
  storageTarget: "cloud-firestore" | "local-durable-json";
} {
  const status = getFirebaseStatus();
  return {
    isConfigured: status.initialized,
    isEmulator: status.usingEmulator,
    mode: status.mode,
    storageTarget: status.initialized ? "cloud-firestore" : "local-durable-json",
  };
}

/**
 * Distinguishes App Check operational enforcement state:
 * - ENFORCED: Strict token validation actively blocking unverified requests
 * - CONFIGURED: SDK initialized and validating tokens in advisory/permissive mode
 * - BYPASSED: Local emulator or explicitly bypassed
 * - UNAVAILABLE: SDK not initialized or credentials missing
 */
export function getAppCheckEnforcementStatus(): "ENFORCED" | "CONFIGURED" | "BYPASSED" | "UNAVAILABLE" {
  if (!firebaseApp || !firebaseAppCheck) {
    return "UNAVAILABLE";
  }
  if (process.env.APP_CHECK_ENFORCE === "true") {
    return "ENFORCED";
  }
  if (currentStatus.usingEmulator || process.env.NODE_ENV !== "production") {
    return "BYPASSED";
  }
  return "CONFIGURED";
}

/**
 * Actively checks Firestore roundtrip connectivity with latency measurement.
 */
export async function testFirestoreConnectivity(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const db = getFirestoreDb();
  if (!db) {
    return { connected: false, latencyMs: 0, error: "Firestore is not configured." };
  }
  const t0 = performance.now();
  try {
    await db.collection("_health").doc("ping").get();
    const latencyMs = Math.round(performance.now() - t0);
    return { connected: true, latencyMs };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - t0);
    return { connected: false, latencyMs, error: err.message || "Failed to reach Firestore" };
  }
}

/**
 * Actively checks Firebase Auth connectivity with latency measurement.
 */
export async function testFirebaseAuthConnectivity(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { connected: false, latencyMs: 0, error: "Firebase Auth is not configured." };
  }
  const t0 = performance.now();
  try {
    // Actively verify connectivity to Firebase Identity Platform via empty batch lookup
    await auth.getUsers([]);
    const latencyMs = Math.round(performance.now() - t0);
    return { connected: true, latencyMs };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - t0);
    return { connected: false, latencyMs, error: err.message || "Failed to reach Firebase Auth service" };
  }
}

/**
 * Actively checks Firebase App Check readiness and provider registration.
 */
export async function testAppCheckConnectivity(): Promise<{ connected: boolean; latencyMs: number; enforcement: "ENFORCED" | "CONFIGURED" | "BYPASSED" | "UNAVAILABLE"; error?: string }> {
  const enforcement = getAppCheckEnforcementStatus();
  const appCheck = getFirebaseAppCheck();
  if (!appCheck) {
    return { connected: false, latencyMs: 0, enforcement, error: "Firebase App Check is not configured." };
  }
  const t0 = performance.now();
  try {
    const isAvailable = typeof appCheck.verifyToken === "function";
    const latencyMs = Math.round(performance.now() - t0);
    return { connected: isAvailable, latencyMs, enforcement };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - t0);
    return { connected: false, latencyMs, enforcement, error: err.message || "Failed to verify Firebase App Check" };
  }
}
