// Suggested active tab lineup in Navbar.tsx
export type ActiveTab =
  | "overview"       // Mission control & target endpoints
  | "discern"        // Trope Buster / YouTube & Pitch Hole-Testing
  | "clearance"      // URL Security Audit & USPTO Trademark verification
  | "qa-matrix"      // 6-Pillar QA Inspection
  | "defense-gate"   // Safe-State & Tenant Isolation checks
  | "audit-history"; // Verified logs & PDF reports

export type TabType =
  | ActiveTab
  | "cover"
  | "launchpad"
  | "agent_workspace"
  | "shipworthy"
  | "skills"
  | "audit"
  | "registry"
  | "defense";

// -------------------------------------------------------------
// OPC LAUNCHPAD & DOMAIN STUDIO DATA TYPES
// -------------------------------------------------------------
export interface DomainSuggestion {
  domain: string;
  tld: string;
  pricePerYear: number;
  isAvailable: boolean;
  whoisStatus: "AVAILABLE" | "REGISTERED" | "PREMIUM";
  registrarBadge: "Cloudflare" | "Namecheap" | "Google Domains" | "Vercel";
  seoScore: number;
  fitReason: string;
}

export interface BrandKit {
  brandName: string;
  tagline: string;
  valueProposition: string;
  targetAudience: string;
  voiceTone: string;
  primaryOklchColor: string;
  secondaryOklchColor: string;
  neutralBgColor: string;
  typographyHeading: string;
  typographyBody: string;
  elevatorPitch: string;
}

// -------------------------------------------------------------
// NOVA AGENT CHAT & ARTIFACT TYPES (MCP & AGENTS.md)
// -------------------------------------------------------------
export type AgentMessageType = "user" | "assistant" | "system" | "tool_call" | "tool_result";

export interface NovaToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  result?: Record<string, any> | string;
  status: "executing" | "completed" | "failed";
}

export interface NovaArtifact {
  id: string;
  title: string;
  type: "code" | "landing_page" | "markdown_report" | "json_schema" | "live_preview";
  content: string;
  language?: string;
  createdAt: string;
}

export interface NovaChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  toolCalls?: NovaToolCall[];
  artifactIds?: string[];
  streaming?: boolean;
}

// -------------------------------------------------------------
// SHIPWORTHY TESTING & CERTIFICATION ENGINE TYPES
// -------------------------------------------------------------
export type SandboxState =
  | "idle"
  | "cloning"
  | "building"
  | "health_checking"
  | "running"
  | "testing"
  | "tearing_down"
  | "destroyed"
  | "failed";

export interface SandboxConfig {
  repoUrl: string;
  branch: string;
  buildCommand: string;
  startCommand: string;
  healthEndpoint: string;
  maxCpuCores: number; // max 2.0
  maxMemoryMb: number; // max 2048 MB
  healthCheckTimeoutSeconds: number; // strictly 30s
  environmentVariables: Record<string, string>;
}

export interface ContainerHealthTelemetry {
  containerId: string;
  ephemeralPort: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  maxMemoryMb: number;
  healthCheckDurationMs: number;
  uptimeSeconds: number;
  isHealthy: boolean;
  teardownStatus: "ACTIVE" | "DESTROYED_CLEAN" | "TEARDOWN_FAILED";
}

export type PersonaType =
  | "PERSONA_A_HAPPY_PATH"
  | "PERSONA_B_IMPATIENT_CHAOS"
  | "PERSONA_C_EDGE_CASE_STRESS";

export interface PersonaStepExecution {
  stepId: string;
  action: string;
  selector?: string;
  target?: string;
  durationMs: number;
  status: "PASSED" | "FAILED" | "INTERRUPTED" | "SKIPPED";
  errorDetails?: string;
  screenshotUrl?: string;
  domSnapshot?: string;
}

export interface PersonaTestResult {
  persona: PersonaType;
  title: string;
  description: string;
  status: "PASSED" | "FAILED" | "WARNING";
  score: number; // 0 - 100
  stepsCompleted: number;
  totalSteps: number;
  executionTimeMs: number;
  frictionCount: number;
  consoleErrors: Array<{ timestamp: string; message: string; source?: string }>;
  networkLatenciesMs: number[];
  httpStatusCodes: Record<string, number>;
  steps: PersonaStepExecution[];
}

export interface PerformanceMetrics {
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  timeToFirstByteMs: number;
  domContentLoadedMs: number;
  totalRequests: number;
  failedRequests: number;
  errorRatePercent: number;
}

export interface FrictionLogItem {
  id: string;
  persona: PersonaType;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "RAGE_CLICK_UNRESPONSIVE" | "RACE_CONDITION" | "PAYLOAD_OVERFLOW" | "NETWORK_TIMEOUT" | "LAYOUT_SHIFT_MOBILE" | "UNHANDLED_EXCEPTION";
  location: string;
  selector?: string;
  description: string;
  reproductionSteps: string[];
  impact: string;
}

export interface RemediationActionItem {
  priority: 1 | 2 | 3;
  title: string;
  targetFileOrService: string;
  rationale: string;
  codeSnippetPatch: string;
  expectedFrictionReduction: string;
}

export type ShipworthyStatus = "SHIPWORTHY CERTIFIED" | "REMEDIATION REQUIRED";

export interface ShipworthyFlightReport {
  id: string;
  repoTarget: string;
  commitSha: string;
  timestamp: string;
  status: ShipworthyStatus;
  certificationScore: number; // 0 - 100
  container_health: ContainerHealthTelemetry;
  persona_results: {
    personaA: PersonaTestResult;
    personaB: PersonaTestResult;
    personaC: PersonaTestResult;
  };
  performance_metrics: PerformanceMetrics;
  friction_logs: FrictionLogItem[];
  top3_remediation_plan: RemediationActionItem[];
  flightReportMarkdown: string;
  playwrightScriptTs: string;
  playwrightScriptPy: string;
  dockerSandboxSpec: string;
}

export type IntakeModality = "text" | "video_url" | "webpage_url" | "document_pdf" | "pwa_source" | "book_chapter";

export type ProcessingMode = "evaluate" | "teach" | "operationalize" | "build_skill" | "evaluate_and_build";

export type ClaimClassification =
  | "Supported by Evidence"
  | "Reasonable but Unverified"
  | "Missing Material Context / Prerequisites"
  | "Conflicting Evidence"
  | "Outcome Appears Atypical"
  | "Unable to Determine";

export interface ClaimEvaluation {
  id: string;
  quotedText: string;
  classification: ClaimClassification;
  heuristicConcern: string;
  evidenceReasoning: string;
  prerequisitesMissing?: string[];
  saferRewrite: string;
}

export interface SandboxTestPlan {
  title: string;
  budgetLimit: string;
  timeframe: string;
  hypothesis: string;
  steps: string[];
  killCriteria: string[];
  successSignal: string;
}

export interface DiscernmentReport {
  id: string;
  title: string;
  sourceType: IntakeModality;
  sourceUrl?: string;
  summary: string;
  overallScore: number;
  evidenceIndex: string;
  claims: ClaimEvaluation[];
  sandboxTestPlan: SandboxTestPlan;
  createdAt: string;
}

export type ActionType =
  | "browser_action"
  | "api_action"
  | "human_action"
  | "decision_gate"
  | "verification"
  | "stop_condition";

export type AgentRoleType =
  | "DOM_BROWSER_AGENT"
  | "API_ORCHESTRATOR"
  | "HUMAN_GATEKEEPER"
  | "SCHEMA_VERIFIER"
  | "SECURITY_SENTINEL"
  | "PWA_WORKER_ENGINE";

export interface WorkflowStep {
  id: string;
  order: number; // strictly 1 to 10
  title: string;
  actionType: ActionType;
  assignedAgentRole: AgentRoleType;
  agentCapabilitySummary: string;
  instruction: string;
  target: string;
  parameters?: string;
  errorHandling: string;
  verificationCheck: string;
  rollbackAction?: string;
}

export interface AgentSkillPackage {
  id: string;
  skillName: string;
  description: string;
  version: string;
  targetPlatform: string;
  sourceModality: IntakeModality;
  directivesCount: number; // 5 to 10
  dependencies: string[];
  steps: WorkflowStep[];
  skillMarkdown: string;
  playwrightScript: string;
  toolDefinitionsJson: string;
  pwaManifestJson?: string;
  createdAt: string;
}

export type PillarId = "security" | "infra" | "legal" | "claims" | "qa" | "maintenance";

export type CheckStatus = "PASSED" | "WARNING" | "FAILED" | "NOT_APPLICABLE";

export interface VerificationCheck {
  id: string;
  name: string;
  status: CheckStatus;
  description: string;
  recommendedFix: string;
  patchCode?: string;
  isCustomManualChecked?: boolean;
}

export interface PillarReport {
  pillarId: PillarId;
  name: string;
  score: number;
  summary: string;
  checks: VerificationCheck[];
}

export interface CadenceSchedule {
  day30Tasks: string[];
  day90Tasks: string[];
  day180Tasks: string[];
}

export interface AxeViolationNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

export interface AxeViolationItem {
  id: string;
  impact?: "minor" | "moderate" | "serious" | "critical" | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeViolationNode[];
  category: "color-contrast" | "aria" | "labels" | "landmarks" | "structure" | "other";
  remediationSnippet?: string;
}

export interface AxeAuditSummary {
  timestamp: string;
  targetScanned: string;
  violationsCount: number;
  passesCount: number;
  incompleteCount: number;
  inapplicableCount: number;
  ariaViolationsCount: number;
  contrastViolationsCount: number;
  violations: AxeViolationItem[];
  wcagComplianceScore: number;
}

export interface AppAuditReport {
  id: string;
  appName: string;
  liveUrl?: string;
  repoUrl?: string;
  stackDescription?: string;
  launchReadinessScore: number;
  status: "READY_TO_SHIP" | "NEEDS_ATTENTION" | "LAUNCH_BLOCKED";
  pillars: PillarReport[];
  cadenceSchedule: CadenceSchedule;
  createdAt: string;
}

export interface AppRegistryItem {
  id: string;
  name: string;
  description: string;
  repoUrl?: string;
  liveUrl?: string;
  environment: "Production" | "Staging" | "Development";
  launchDate: string;
  readinessScore: number;
  status: "Live & Healthy" | "Maintenance Due" | "Pre-Flight Pending" | "Critical Alert";
  daysSinceLaunch: number;
  cadenceStatus: {
    day30Completed: boolean;
    day90Completed: boolean;
    day180Completed: boolean;
  };
  lastAuditId?: string;
  activeAlertsCount: number;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
}

// Defense-of-Break Protection Types
export type RestrictedCategory = "PERSONAL_DATA_PII" | "HEALTH_MEDICAL" | "UNAUTHORIZED_LEGAL" | "NONE";

export interface DefenseScanResult {
  isBlocked: boolean;
  category: RestrictedCategory;
  reason: string;
  detectedSnippets: string[];
  allowlistedProjectEligible: boolean; // e.g. legitimate Bankruptcy Restructuring or Corporate Archival
  suggestedAction: string;
}

export interface SecurityClearance {
  isCleared: boolean;
  clearanceId?: string;
  clearanceToken?: string;
  projectName?: string;
  timestamp?: string;
  expiresAt?: string;
  authorizedScope?: string;
  passcodeUsed?: string; // deprecated - secrets are never returned in responses
}

export interface AuditEventItem {
  id: string;
  requestId: string;
  userIdentifier: string;
  action: string;
  route: string;
  targetResource?: string | null;
  outcome: "SUCCESS" | "FAILURE" | "BLOCKED" | "ERROR";
  statusCode: number;
  ipAddressHash?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ReadinessCheckItem {
  id: string;
  name: string;
  category: "HEALTH" | "PERSISTENCE" | "CONFIG" | "SECURITY" | "AI_INTEGRATION";
  status: "NOT_RUN" | "PASSED" | "FAILED" | "SKIPPED";
  evidence: string;
  durationMs: number;
  details?: Record<string, any>;
}

export interface ReadinessSuiteItem {
  suiteId: string;
  timestamp: string;
  status: "PASSED" | "FAILED" | "INCOMPLETE";
  checks: ReadinessCheckItem[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

export type DependencyReadinessState = "VERIFIED" | "CONFIGURED" | "DEGRADED" | "FAILED";

export interface DependencyStatusItem {
  status: DependencyReadinessState;
  verified: boolean;
  mode?: string;
  backend?: string;
  latencyMs?: number;
  error?: string | null;
  enforcement?: string;
  details?: Record<string, any>;
}

export interface SubsystemReadinessReport {
  status: "READY" | "DEGRADED" | "FAILED";
  timestamp: string;
  summary: {
    totalDependencies: number;
    verified: number;
    configured: number;
    degraded: number;
    failed: number;
  };
  subsystems: {
    firebaseAdmin: DependencyStatusItem;
    firestore: DependencyStatusItem;
    firebaseAuth: DependencyStatusItem;
    firebaseAppCheck: DependencyStatusItem;
    sessionPersistence: DependencyStatusItem;
    clearancePersistence: DependencyStatusItem;
    rateLimitPersistence: DependencyStatusItem;
    auditPersistence: DependencyStatusItem;
    gemini: DependencyStatusItem;
    [key: string]: DependencyStatusItem;
  };
}

