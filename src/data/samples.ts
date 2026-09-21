import { AppRegistryItem, PricingTier, IntakeModality, ProcessingMode } from "../types";

export interface SampleScenario {
  id: string;
  title: string;
  category: string;
  sourceType: IntakeModality;
  sourceUrl?: string;
  snippet: string;
  fullContent: string;
  suggestedMode: ProcessingMode;
  isRestrictedSample?: boolean;
  allowlistType?: string;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: "sample-pwa-sync",
    title: "Offline-First PWA Background Sync & IndexedDB Service Worker",
    category: "PWA Lifecycle & Agent Skill",
    sourceType: "pwa_source",
    snippet: "Complete 7-step SOP for configuring offline IndexedDB mutations, Service Worker background sync queues, and optimistic UI updates.",
    suggestedMode: "build_skill",
    fullContent: `# Standard Operating Procedure: Offline-First PWA Sync Engine

## Objective
Enable seamless offline mutations in a Progressive Web Application with background sync registration, IndexedDB conflict resolution, and Push notification receipts.

## Step-by-Step Execution Sequence:
1. Register Service Worker at '/sw.js' with scope '/' and verify navigator.serviceWorker.controller is active.
2. Initialize client-side IndexedDB store 'outbox_mutations' with auto-incrementing keyPath 'id' and timestamp index.
3. Intercept offline POST/PUT form submissions, serialize payload into IndexedDB outbox, and update UI state optimistically.
4. Register background sync tag 'sync-outbox-mutations' via window.SyncManager when network connectivity status changes to offline.
5. In Service Worker 'sync' event handler, drain 'outbox_mutations' queue sequentially by sending batch POST requests to '/api/v1/sync/batch'.
6. Verify server responds with HTTP 200 and array of committed transaction IDs; remove confirmed items from IndexedDB outbox.
7. PostMessage 'SYNC_COMPLETE' event to all active window clients and display toast notification verifying cloud state convergence.`,
  },
  {
    id: "sample-claims-crypto",
    title: "Autonomous 'Zero-Risk' $5,000/Day Trading Bot Claims Audit",
    category: "Claims Discernment & Evidence Audit",
    sourceType: "video_url",
    sourceUrl: "https://youtube.com/watch?v=sample-trading-bot-claim",
    snippet: "High-yield video script claiming $5,000/day automated profits with 99.8% win rate and zero risk using free algorithmic prompts.",
    suggestedMode: "evaluate",
    fullContent: `What is up builders! Today I am breaking down how anyone can generate $5,000 a day in completely passive revenue using this unreleased AI quantitative trading strategy.

Step 1: Download this free browser script and connect your wallet or exchange API key with full trading and withdrawal permissions.
Step 2: The neural model analyzes 10,000 micro-fluctuations per second and guarantees a 99.8% win rate on all arbitrage pairs.
Step 3: You have zero downside risk because the smart contract instantly reverses any losing trade before execution finishes on the blockchain.
Step 4: You do not need any capital reserve or risk management strategy; even with a $25 starting balance, compounding creates $150,000 in 30 days.
Step 5: Just leave the tab open in your browser 24/7 and withdraw profits every evening straight to your checking account.`,
  },
  {
    id: "sample-bankruptcy-allowlist",
    title: "Chapter 11 Corporate Restructuring Document Normalizer (Allowlisted Project)",
    category: "Corporate Legal / Allowlisted Project",
    sourceType: "document_pdf",
    snippet: "Approved corporate bankruptcy debt schedule extraction & UCC lien cross-referencing SOP requiring Defense-of-Break passcode clearance.",
    suggestedMode: "build_skill",
    isRestrictedSample: true,
    allowlistType: "Corporate Bankruptcy Filing & Restructuring Protocol",
    fullContent: `# Allowlisted Corporate Procedure: Chapter 11 Schedule E/F Debt Normalizer

## Authorization Note
CONFIDENTIAL CORPORATE COMPLIANCE DOCUMENT. Requires Defense-of-Break Passcode Clearance for processing.

## Procedure Directives:
1. Validate incoming court docket PDF against PACER/CourtListener electronic court record schema.
2. Redact all debtor Social Security Numbers, employer tax identification numbers, and non-party individual identifiers using 1WithOut Privacy Scrubber.
3. Extract Schedule E (Creditors Holding Unsecured Priority Claims) and Schedule F (Unsecured Nonpriority Claims) tables into structured JSON schemas.
4. Cross-reference creditor claim amounts against state UCC-1 lien filings to verify perfection status and collateral description.
5. Compute aggregate priority vs nonpriority exposure, flag disputed or unliquidated claims, and calculate estimated distribution waterfall percentages.
6. Generate formatted Chapter 11 disclosure statement exhibit table and compile validation audit hash for attorney review.`,
  },
  {
    id: "sample-saas-matrix",
    title: "Production PWA SaaS Launch Checklist & 180-Day Cadence",
    category: "PWA Lifecycle & Pre-Flight Matrix",
    sourceType: "webpage_url",
    sourceUrl: "https://docs.1without.io/blueprints/pwa-launch-matrix",
    snippet: "Full 6-pillar launch verification matrix: Web app manifest, service worker caching, Stripe idempotency, WCAG AA, and 180-day maintenance cadence.",
    suggestedMode: "operationalize",
    fullContent: `# 1WithOut Production PWA Launch Architecture Blueprint

## Architectural Baseline:
- **Client Architecture**: React PWA, Tailwind CSS, Motion UI, Web App Manifest (standalone display, theme-color #020617).
- **Service Worker**: Cache-First for static assets, Network-First for API with IndexedDB fallback queue.
- **Backend API**: Express TypeScript server, reverse proxy port 3000 ingress, PostgreSQL connection pool limit 10.
- **Billing & Legal**: Stripe Checkout with raw signature verification, GDPR data export/deletion routes, compliant Privacy Policy.

## 6-Pillar Launch Verification Requirements:
1. Security & Identity: CSP headers configured, zero client secret leaks, 14-day token revocation, Defense-of-Break sentinel active.
2. Infrastructure & Cloud: Port 3000 container ingress, database connection pooling, graceful unhandled rejection logging.
3. Legal, Compliance & Billing: Stripe customer portal, tax calculation, clear ToS & Privacy disclosure, no misleading claims.
4. Marketing, Copy & Claims: Factual value proposition, elimination of unprovable financial promises, transparent pricing.
5. Interface & QA: Standalone PWA installability, touch targets >=44px, WCAG 2.1 AA contrast ratio across dark/light mode.
6. Post-Launch Cadence: 30-day early error triage, 90-day dependency update, 180-day security & credential rotation.`,
  },
];

export const INITIAL_REGISTRY_APPS: AppRegistryItem[] = [
  {
    id: "app-1",
    name: "1WithOut Master PWA Engine",
    description: "Universal Knowledge-to-Execution & PWA Lifecycle Platform with Claims Discernment, 5-10 Step Skill Builder, and Defense-of-Break Sentinel.",
    organization: "1WithOut Core Systems",
    owner: "chrisfbailey.CB@gmail.com",
    liveUrl: "https://1without.io",
    repoUrl: "https://github.com/1without/master-engine",
    sourceInput: "https://github.com/1without/master-engine",
    sourceType: "both",
    projectScope: "master_core_ip",
    lifecyclePhase: "deployed_monitored",
    environment: "Production",
    launchDate: "2026-08-01",
    readinessScore: 98,
    status: "Live & Healthy",
    daysSinceLaunch: 50,
    cadenceStatus: {
      day30Completed: true,
      day90Completed: false,
      day180Completed: false,
    },
    cadenceScheduleDetailed: {
      day30: {
        stage: "day30",
        title: "Day 30: Early Triage & Error Sentinel",
        daysTarget: 30,
        dueDate: "2026-08-31",
        completed: true,
        completedDate: "2026-08-30",
        status: "CLEAR",
        description: "Sentinel error log review, false-positive filtering, and webhook retry health.",
        tasks: [
          { id: "d30-1", label: "Sentinel error log review and 0 unhandled exception verification", done: true, category: "triage" },
          { id: "d30-2", label: "False-positive rate filtering on rate limits and defense scanner", done: true, category: "triage" },
          { id: "d30-3", label: "Webhook retry queue latency and idempotency checks", done: true, category: "triage" },
        ],
      },
      day60: {
        stage: "day60",
        title: "Day 60: Mid-Flight Security & CSP Health",
        daysTarget: 60,
        dueDate: "2026-09-30",
        completed: false,
        status: "DUE_SOON",
        description: "Secret leak scans, CSP violation reports, and edge cache TTL checks.",
        tasks: [
          { id: "d60-1", label: "Automated git secret leak scan and env audits across branches", done: true, category: "security" },
          { id: "d60-2", label: "CSP violation telemetry review and script-src nonces validation", done: false, category: "security" },
          { id: "d60-3", label: "Edge cache TTL verification and stale-while-revalidate audit", done: false, category: "security" },
        ],
      },
      day90: {
        stage: "day90",
        title: "Day 90: Version & Dependency Audit",
        daysTarget: 90,
        dueDate: "2026-10-30",
        completed: false,
        status: "CLEAR",
        description: "Package audit updates (npm audit fix), API SDK wrapper migrations, and WCAG AA accessibility spot checks.",
        tasks: [
          { id: "d90-1", label: "Automated dependency CVE scan and npm audit updates", done: false, category: "version_dependency" },
          { id: "d90-2", label: "Gemini SDK and cloud API wrapper upgrade checks", done: false, category: "version_dependency" },
          { id: "d90-3", label: "Automated WCAG 2.1 AA accessibility contrast spot-check", done: false, category: "version_dependency" },
        ],
      },
      day180: {
        stage: "day180",
        title: "Day 180: Rotation & Compliance Archival",
        daysTarget: 180,
        dueDate: "2027-01-28",
        completed: false,
        status: "CLEAR",
        description: "Service token & database credential rotation, GDPR/CCPA disclosure audits, and IP retention evaluation.",
        tasks: [
          { id: "d180-1", label: "Service token and operator session secret key rotation", done: false, category: "compliance_rotation" },
          { id: "d180-2", label: "GDPR/CCPA privacy notice alignment and data deletion audit", done: false, category: "compliance_rotation" },
          { id: "d180-3", label: "IP retention, trademark clearance and long-term backup snapshot", done: false, category: "compliance_rotation" },
        ],
      },
    },
    liveInspection: {
      target: "https://1without.io",
      checkedAt: "2026-09-20T19:45:00Z",
      status: "PASSED",
      overallScore: 98,
      headers: [
        { name: "Content-Security-Policy (CSP)", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'self';", status: "PASSED", description: "Restricts script and iframe execution origins.", remediation: "Active." },
        { name: "Strict-Transport-Security (HSTS)", value: "max-age=31536000; includeSubDomains; preload", status: "PASSED", description: "Enforces TLS encryption over HTTPS.", remediation: "Active." },
        { name: "X-Frame-Options", value: "DENY", status: "PASSED", description: "Anti-clickjacking restriction.", remediation: "Active." },
        { name: "X-Content-Type-Options", value: "nosniff", status: "PASSED", description: "Prevents MIME-type confusion.", remediation: "Active." },
        { name: "Referrer-Policy", value: "strict-origin-when-cross-origin", status: "PASSED", description: "Protects privacy of outbound referrals.", remediation: "Active." },
        { name: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()", status: "PASSED", description: "Restricts unneeded browser sensors.", remediation: "Active." },
      ],
      domInspection: {
        framework: "React 18 / Vite PWA",
        pwaManifestDetected: true,
        manifestUrl: "/manifest.webmanifest",
        serviceWorkerDetected: true,
        metaTagsCount: 14,
        scriptsCount: 3,
        externalDependencies: ["fonts.googleapis.com", "esm.sh"],
      },
      recommendations: ["Target complies with all production security standards and WCAG 2.1 AA mandates."],
    },
    dossierSignature: "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    dossierGeneratedAt: "2026-09-20T19:46:00Z",
    activeAlertsCount: 0,
  },
  {
    id: "app-2",
    name: "Starlight Client Billing Portal",
    description: "Freelance client invoicing portal with Stripe Checkout idempotency and client download access.",
    organization: "Apex Freelance Solutions",
    owner: "sarah.architect@apex.io",
    liveUrl: "https://billing-portal-staging.run.app",
    repoUrl: "https://github.com/apex-creative/starlight-billing",
    sourceInput: "https://billing-portal-staging.run.app",
    sourceType: "both",
    projectScope: "client_deliverable",
    lifecyclePhase: "ready_for_deployment",
    environment: "Staging",
    launchDate: "2026-09-18",
    readinessScore: 88,
    status: "Pre-Flight Pending",
    daysSinceLaunch: 2,
    cadenceStatus: {
      day30Completed: false,
      day90Completed: false,
      day180Completed: false,
    },
    preFlightMatrix: {
      securityHeaders: { status: "PASSED", score: 92, details: "CSP and HSTS active; frame-ancestors set to self." },
      wcagContrastAria: { status: "WARNING", score: 82, details: "Form input labels need explicit aria-describedby for error states." },
      legalComplianceIdempotency: { status: "PASSED", score: 95, details: "Stripe signature validation verified with idempotency keys." },
      errorBoundaryPortIsolation: { status: "PASSED", score: 90, details: "Server binds strictly to 0.0.0.0:3000 with global uncaught error boundaries." },
      readinessScore: 88,
      blockingFlags: [],
      isClearedForDeployment: true,
      lastAuditedAt: "2026-09-20T18:30:00Z",
    },
    activeAlertsCount: 0,
  },
  {
    id: "app-3",
    name: "PulseHealth Vital Metrics PWA",
    description: "Multi-tenant offline biometric tracking PWA with Web Crypto encryption and background sync.",
    organization: "BioSync Innovations LLC",
    owner: "dev@biosync.health",
    repoUrl: "https://github.com/biosync/pulse-health-pwa",
    sourceInput: "https://github.com/biosync/pulse-health-pwa",
    sourceType: "github",
    projectScope: "master_core_ip",
    lifecyclePhase: "in_development",
    environment: "Development",
    launchDate: "2026-09-12",
    readinessScore: 74,
    status: "In Development",
    daysSinceLaunch: 8,
    cadenceStatus: {
      day30Completed: false,
      day90Completed: false,
      day180Completed: false,
    },
    inDevelopmentAudit: {
      linting: { status: "PASSED", details: "Zero TypeScript compile errors, strict null checks enforced." },
      secrets: { status: "PASSED", details: "No API keys or JWT private secrets committed in client repository." },
      vulnerabilities: { status: "WARNING", details: "1 moderate severity vulnerability in development bundler sub-dependency; patch available via npm audit fix." },
      lastRunAt: "2026-09-20T17:15:00Z",
      readyForPromotion: true,
    },
    activeAlertsCount: 1,
  },
  {
    id: "app-4",
    name: "DocuSync Offline Annotator",
    description: "Offline-first IndexedDB document annotator with background Service Worker sync queues.",
    organization: "1WithOut Ecosystem",
    owner: "chrisfbailey.CB@gmail.com",
    liveUrl: "https://docusync.app",
    repoUrl: "https://github.com/1without/docusync-pwa",
    sourceInput: "https://docusync.app",
    sourceType: "both",
    projectScope: "master_core_ip",
    lifecyclePhase: "deployed_monitored",
    environment: "Production",
    launchDate: "2026-07-10",
    readinessScore: 92,
    status: "Maintenance Due",
    daysSinceLaunch: 72,
    cadenceStatus: {
      day30Completed: true,
      day90Completed: false,
      day180Completed: false,
    },
    cadenceScheduleDetailed: {
      day30: {
        stage: "day30",
        title: "Day 30: Early Triage & Error Sentinel",
        daysTarget: 30,
        dueDate: "2026-08-09",
        completed: true,
        completedDate: "2026-08-08",
        status: "CLEAR",
        description: "Sentinel error log review, false-positive filtering, and webhook retry health.",
        tasks: [
          { id: "d30-1", label: "Sentinel error log review and 0 unhandled exception verification", done: true, category: "triage" },
          { id: "d30-2", label: "IndexedDB transaction error telemetry inspection", done: true, category: "triage" },
        ],
      },
      day60: {
        stage: "day60",
        title: "Day 60: Mid-Flight Security & CSP Health",
        daysTarget: 60,
        dueDate: "2026-09-08",
        completed: true,
        completedDate: "2026-09-07",
        status: "CLEAR",
        description: "Secret leak scans, CSP violation reports, and edge cache TTL checks.",
        tasks: [
          { id: "d60-1", label: "Service Worker cache storage quota check", done: true, category: "security" },
          { id: "d60-2", label: "CSP violation telemetry review", done: true, category: "security" },
        ],
      },
      day90: {
        stage: "day90",
        title: "Day 90: Version & Dependency Audit",
        daysTarget: 90,
        dueDate: "2026-10-08",
        completed: false,
        status: "DUE_SOON",
        description: "Package audit updates (npm audit fix), API SDK wrapper migrations, and WCAG AA accessibility spot checks.",
        tasks: [
          { id: "d90-1", label: "npm audit fix for IndexedDB library", done: false, category: "version_dependency" },
          { id: "d90-2", label: "Audit color contrast on document preview pane", done: false, category: "version_dependency" },
        ],
      },
      day180: {
        stage: "day180",
        title: "Day 180: Rotation & Compliance Archival",
        daysTarget: 180,
        dueDate: "2027-01-06",
        completed: false,
        status: "CLEAR",
        description: "Service token & database credential rotation, GDPR/CCPA disclosure audits, and IP retention evaluation.",
        tasks: [
          { id: "d180-1", label: "Rotate encryption salt and operator access keys", done: false, category: "compliance_rotation" },
          { id: "d180-2", label: "Review user document retention policy", done: false, category: "compliance_rotation" },
        ],
      },
    },
    activeAlertsCount: 1,
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Starter",
    price: "$0",
    period: "Forever Free",
    description: "Essential local browser audits, claims scan samples, and standard pre-flight checklist.",
    features: [
      "Unlimited client-side pre-flight checks",
      "Basic claims discernment summaries",
      "Standard sample templates & SOPs",
      "Community skill definitions",
      "Single-app local registry tracking",
      "Defense-of-Break safety scanner",
    ],
    buttonText: "Current Plan",
  },
  {
    id: "deep-review",
    name: "Deep Review",
    price: "$12",
    period: "One-time pass",
    description: "Single comprehensive AI deep claims scan, video transcript ingestion, and client-ready audit report.",
    badge: "Pay As You Go",
    features: [
      "1x Full Multimodal AI Claims Scan (Video/Doc/URL)",
      "Non-accusatory citation & evidence report",
      "De-risked 48-Hour Sandbox Experiment Plan",
      "Compliant copy & claim rewrite generator",
      "High-res PDF & Markdown audit export",
      "PWA Manifest & Service Worker validator",
    ],
    buttonText: "Get Deep Review",
  },
  {
    id: "pro",
    name: "Builder Pro",
    price: "$19",
    period: "/ month",
    popular: true,
    badge: "Most Popular",
    description: "For active builders creating PWAs, validating opportunities, and building 5-10 directive agent skills.",
    features: [
      "Unlimited AI Claims & Opportunity Discernment",
      "5-10 Directive Agent Skill Builder with Capability Roles",
      "Playwright TypeScript test script generator",
      "Full 6-Pillar Launch Verification Matrix",
      "Up to 5 apps tracked with automated 30/90/180d alerts",
      "Allowlisted Project Defense-of-Break Passcode Gate",
    ],
    buttonText: "Upgrade to Pro",
  },
  {
    id: "studio",
    name: "Studio / Agency",
    price: "$49",
    period: "/ month",
    badge: "Enterprise Grade",
    description: "For teams, studios, and agencies managing client applications and complex autonomous pipelines.",
    features: [
      "Unlimited Apps & Projects in Lifecycle Registry",
      "Multi-format export (Playwright, LM Studio, Claude SKILL.md)",
      "Client-ready branded white-label PDF audit reports",
      "Automated Maintenance Cadence Webhooks & Reminders",
      "Priority Gemini 3.7 API processing queues",
      "Team collaboration & shared skill repositories",
    ],
    buttonText: "Start Studio Hub",
  },
];
