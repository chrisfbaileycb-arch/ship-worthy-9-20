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
    liveUrl: "https://1without.io",
    repoUrl: "https://github.com/1without/master-engine",
    environment: "Production",
    launchDate: "2026-08-01",
    readinessScore: 96,
    status: "Live & Healthy",
    daysSinceLaunch: 19,
    cadenceStatus: {
      day30Completed: false,
      day90Completed: false,
      day180Completed: false,
    },
    activeAlertsCount: 0,
  },
  {
    id: "app-2",
    name: "DocuSync Offline PWA",
    description: "Offline-first IndexedDB document annotator with background Service Worker sync queues.",
    liveUrl: "https://docusync.app",
    repoUrl: "https://github.com/1without/docusync-pwa",
    environment: "Production",
    launchDate: "2026-07-10",
    readinessScore: 91,
    status: "Maintenance Due",
    daysSinceLaunch: 41,
    cadenceStatus: {
      day30Completed: true,
      day90Completed: false,
      day180Completed: false,
    },
    activeAlertsCount: 1,
  },
  {
    id: "app-3",
    name: "ChapterRestructure Gateway",
    description: "Allowlisted corporate bankruptcy and debt schedule normalizer with strict defense-of-break passkey controls.",
    liveUrl: "https://restructure.internal",
    repoUrl: "https://github.com/1without/restructure-node",
    environment: "Staging",
    launchDate: "2026-08-16",
    readinessScore: 84,
    status: "Pre-Flight Pending",
    daysSinceLaunch: 4,
    cadenceStatus: {
      day30Completed: false,
      day90Completed: false,
      day180Completed: false,
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
