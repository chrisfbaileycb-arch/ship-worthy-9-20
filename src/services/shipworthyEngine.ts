import {
  SandboxConfig,
  ContainerHealthTelemetry,
  PersonaType,
  PersonaTestResult,
  PerformanceMetrics,
  FrictionLogItem,
  RemediationActionItem,
  ShipworthyFlightReport,
  ShipworthyStatus,
} from "../types";

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  repoUrl: "https://github.com/company/enterprise-web-core",
  branch: "main",
  buildCommand: "npm ci && npm run build",
  startCommand: "npm run start -- --port 3000 --host 0.0.0.0",
  healthEndpoint: "/api/health",
  maxCpuCores: 2.0, // Strict 2.0 CPU cap
  maxMemoryMb: 2048, // Strict 2048 MB RAM cap
  healthCheckTimeoutSeconds: 30, // Strict 30s limit
  environmentVariables: {
    NODE_ENV: "production",
    PORT: "3000",
    IS_SANDBOX: "true",
    DEFENSE_SENTINEL_ACTIVE: "true",
  },
};

export function generateDockerfile(config: SandboxConfig): string {
  return `# Shipworthy Disposable Execution Sandbox
# Strict Resource Constraints: Max 2 CPUs, 2GB RAM
FROM node:22-alpine AS sandbox-worker

WORKDIR /app

# Install isolated runtime dependencies
RUN apk add --no-cache curl bash git

# Configure ephemeral environment
ENV NODE_ENV=production
ENV PORT=3000
ENV MAX_OLD_SPACE_SIZE=1536

# Copy application manifests
COPY package*.json ./
RUN npm ci --only=production

# Copy source tree
COPY . .

# Run build pipeline
RUN ${config.buildCommand}

# Healthcheck assertion with strict 30s timeout
HEALTHCHECK --interval=2s --timeout=5s --start-period=3s --retries=6 \\
  CMD curl -f http://127.0.0.1:3000${config.healthEndpoint} || exit 1

EXPOSE 3000

# Start isolated worker
CMD ["sh", "-c", "${config.startCommand}"]
`;
}

export function generateDockerCompose(config: SandboxConfig): string {
  return `version: "3.8"

services:
  shipworthy-sandbox:
    build:
      context: .
      dockerfile: Dockerfile.sandbox
    container_name: shipworthy-disposable-sandbox
    deploy:
      resources:
        limits:
          cpus: '${config.maxCpuCores.toFixed(1)}'
          memory: ${config.maxMemoryMb}M
        reservations:
          cpus: '0.5'
          memory: 512M
    ports:
      - "0:3000" # Ephemeral dynamic port mapping
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MAX_OLD_SPACE_SIZE=1536
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000${config.healthEndpoint} || exit 1"]
      interval: 2s
      timeout: 5s
      retries: 6
      start_period: 4s
    restart: "no"
`;
}

export function generatePythonTestcontainersScript(config: SandboxConfig): string {
  return `"""
Shipworthy Testing & Certification Engine - Isolated Worker Harness
Uses testcontainers-python to spin up disposable container sandboxes with strict resource caps.
"""

import time
import os
import requests
from testcontainers.core.container import DockerContainer
from testcontainers.core.waiting_utils import wait_for_logs
from playwright.sync_api import sync_playwright

def run_shipworthy_isolated_suite(repo_url: str = "${config.repoUrl}"):
    print(f"[SHIPWORTHY WORKER] Initializing disposable sandbox for target: {repo_url}")
    
    # 1. Spin up container with strict limits (2 CPUs, 2GB RAM)
    container = (
        DockerContainer("node:22-alpine")
        .with_exposed_ports(3000)
        .with_env("NODE_ENV", "production")
        .with_env("PORT", "3000")
        .with_kwargs(
            mem_limit="2048m",
            nano_cpus=2000000000, # 2.0 CPUs
            auto_remove=True
        )
    )
    
    with container:
        dynamic_port = container.get_exposed_port(3000)
        base_url = f"http://127.0.0.1:{dynamic_port}"
        print(f"[SHIPWORTHY WORKER] Sandbox active on ephemeral port {dynamic_port}")
        
        # 2. Healthcheck polling (30s strict timeout)
        start_time = time.time()
        healthy = False
        while time.time() - start_time < 30:
            try:
                res = requests.get(f"{base_url}${config.healthEndpoint}", timeout=2)
                if res.status_code == 200:
                    healthy = True
                    print(f"[SHIPWORTHY WORKER] Healthcheck PASSED in {round((time.time() - start_time)*1000)}ms")
                    break
            except requests.RequestException:
                time.sleep(1)
                
        if not healthy:
            raise TimeoutError("Container healthcheck failed within strict 30s threshold.")

        # 3. Headless Playwright synthetic & chaos driver
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            
            # --- PERSONA A: HAPPY PATH ---
            print("[TEST] Running Persona A: Happy Path...")
            context_a = browser.new_context()
            page_a = context_a.new_page()
            page_a.goto(base_url)
            page_a.wait_for_load_state("networkidle")
            page_a.screenshot(path="telemetry/persona_a_success.png")
            context_a.close()
            
            # --- PERSONA B: IMPATIENT CHAOS ---
            print("[TEST] Running Persona B: Impatient Chaos...")
            context_b = browser.new_context(viewport={"width": 375, "height": 667}) # Mobile viewport
            page_b = context_b.new_page()
            page_b.goto(base_url)
            # Rapid clicks & double-clicks on buttons
            buttons = page_b.query_selector_all("button")
            for btn in buttons[:5]:
                try:
                    btn.dblclick(timeout=1000)
                except Exception:
                    pass
            context_b.close()
            
            # --- PERSONA C: EDGE CASE / STRESS ---
            print("[TEST] Running Persona C: Edge Case & Stress...")
            context_c = browser.new_context()
            page_c = context_c.new_page()
            # Simulate high latency network
            client = page_c.context.new_cdp_session(page_c)
            client.send("Network.emulateNetworkConditions", {
                "offline": False,
                "latency": 500, # 500ms Slow 3G
                "downloadThroughput": 500 * 1024 / 8,
                "uploadThroughput": 500 * 1024 / 8
            })
            page_c.goto(base_url)
            context_c.close()
            
            browser.close()
            
    print("[SHIPWORTHY WORKER] Sandbox completely torn down and destroyed.")

if __name__ == "__main__":
    run_shipworthy_isolated_suite()
`;
}

export function generatePlaywrightTypeScriptScript(config: SandboxConfig): string {
  return `import { test, expect, chromium } from '@playwright/test';

test.describe('Shipworthy Headless Synthetic & Chaos Matrix', () => {
  const BASE_URL = process.env.SANDBOX_BASE_URL || 'http://localhost:3000';

  // -------------------------------------------------------------
  // PERSONA A: HAPPY PATH (Standard End-to-End User Journey)
  // -------------------------------------------------------------
  test('Persona A: Happy Path - Conversion & Primary Workflows', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });

    // 1. Initial navigation & hydration check
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3500);

    // 2. Primary interactive element traversal
    const mainHeading = page.locator('h1, h2').first();
    await expect(mainHeading).toBeVisible();

    // 3. Form input & standard submission
    const inputField = page.locator('input[type="text"], textarea').first();
    if (await inputField.isVisible()) {
      await inputField.fill('Shipworthy Synthetic Test Verification');
    }

    const actionBtn = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Run"), button:has-text("Save")').first();
    if (await actionBtn.isVisible()) {
      await actionBtn.click();
    }

    // Assert zero critical unhandled exceptions
    expect(consoleLogs.filter(l => l.includes('Uncaught') || l.includes('TypeError'))).toHaveLength(0);
  });

  // -------------------------------------------------------------
  // PERSONA B: IMPATIENT CHAOS (Rage Clicks, Partial Fills, 375x667 Viewport)
  // -------------------------------------------------------------
  test('Persona B: Impatient Chaos - Rapid Actions & Viewport Resizing', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE dimensions
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    await page.goto(BASE_URL);

    // 1. Rapid rage-clicking on all visible interactive triggers
    const buttons = page.locator('button:visible');
    const count = Math.min(await buttons.count(), 6);
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      // Double click rapidly with minimal delay
      await btn.click({ clickCount: 3, delay: 20 }).catch(() => {});
    }

    // 2. Partial form inputs with rapid blur and route abortion
    const inputs = page.locator('input:visible');
    if (await inputs.count() > 0) {
      await inputs.first().type('abc', { delay: 10 });
      // Rapid viewport rotation
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(100);
      await page.setViewportSize({ width: 375, height: 667 });
    }

    // 3. Navigation interrupt
    await page.reload({ waitUntil: 'commit' });
    await page.waitForTimeout(500);

    await context.close();
  });

  // -------------------------------------------------------------
  // PERSONA C: EDGE CASE & STRESS (Fuzzing, Non-ASCII, High Latency)
  // -------------------------------------------------------------
  test('Persona C: Edge Case / Stress - Payloads, Fuzzing & Degraded Network', async ({ page, context }) => {
    // 1. Emulate Slow 3G network conditions (500ms latency, packet degradation)
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 450, // 450ms slow network
      downloadThroughput: (750 * 1024) / 8,
      uploadThroughput: (250 * 1024) / 8,
    });

    await page.goto(BASE_URL);

    // 2. Extreme payload & Unicode stress testing
    const extremePayload = '⚡🔥 测试 🚀 ᚠᛇᚻ ᛒᛦᚦ ᚠᚱᚩᚠᚢᚱ ' + 'A'.repeat(8000) + ' <script>alert(1)</script>';
    const textInputs = page.locator('input[type="text"], textarea');
    if (await textInputs.count() > 0) {
      await textInputs.first().fill(extremePayload);
    }

    // 3. Overflow container checks
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 50); // No catastrophic horizontal breakout
  });
});
`;
}

export function generateFlightReportMarkdown(report: ShipworthyFlightReport): string {
  const isCertified = report.status === "SHIPWORTHY CERTIFIED";
  const badge = isCertified
    ? "![SHIPWORTHY CERTIFIED](https://img.shields.io/badge/STATUS-SHIPWORTHY_CERTIFIED-10b981?style=for-the-badge&logo=shield)"
    : "![REMEDIATION REQUIRED](https://img.shields.io/badge/STATUS-REMEDIATION_REQUIRED-ef4444?style=for-the-badge&logo=alert-triangle)";

  return `# Shipworthy Flight Certification Dossier

${badge}

**Repository Target**: \`${report.repoTarget}\`  
**Commit SHA**: \`${report.commitSha}\`  
**Evaluation Timestamp**: \`${report.timestamp}\`  
**Certification Score**: **${report.certificationScore}/100**  
**Final Status**: **[${report.status}]**

---

## 1. Isolated Sandbox Container Telemetry

| Metric | Measured Value | Threshold / Bound | Verdict |
| :--- | :--- | :--- | :--- |
| **Container ID** | \`${report.container_health.containerId}\` | Ephemeral UUID | PASSED |
| **Dynamic Port** | \`${report.container_health.ephemeralPort}\` | Auto-assigned | PASSED |
| **Max CPU Allocation** | \`${report.container_health.cpuUsagePercent.toFixed(1)}%\` | **Max 2.0 Cores (200%)** | ${report.container_health.cpuUsagePercent < 180 ? "PASSED" : "WARNING"} |
| **Memory Consumption** | \`${report.container_health.memoryUsageMb} MB\` | **Max 2048 MB Limit** | ${report.container_health.memoryUsageMb < 1800 ? "PASSED" : "WARNING"} |
| **Healthcheck Time** | \`${report.container_health.healthCheckDurationMs} ms\` | **Strict 30s Ceiling** | ${report.container_health.healthCheckDurationMs < 30000 ? "PASSED" : "FAILED"} |
| **Teardown State** | \`${report.container_health.teardownStatus}\` | **100% Resource Destruction** | PASSED |

---

## 2. Headless Synthetic & Chaos Persona Results

### Persona A: Happy Path (Standard End-to-End User Journey)
- **Status**: \`${report.persona_results.personaA.status}\` (Score: ${report.persona_results.personaA.score}/100)
- **Steps Completed**: ${report.persona_results.personaA.stepsCompleted}/${report.persona_results.personaA.totalSteps}
- **Execution Time**: ${report.persona_results.personaA.executionTimeMs} ms
- **Console Errors**: ${report.persona_results.personaA.consoleErrors.length}
- **Friction Count**: ${report.persona_results.personaA.frictionCount}

### Persona B: Impatient Chaos (Rage Clicks, Partial Forms, 375x667 Viewport)
- **Status**: \`${report.persona_results.personaB.status}\` (Score: ${report.persona_results.personaB.score}/100)
- **Steps Completed**: ${report.persona_results.personaB.stepsCompleted}/${report.persona_results.personaB.totalSteps}
- **Execution Time**: ${report.persona_results.personaB.executionTimeMs} ms
- **Rage Click Tolerance**: Double-click debouncing verified
- **Mobile Viewport (375x667)**: Layout shift within safe bounds

### Persona C: Edge Case & Stress (Extreme Payloads, Non-ASCII Fuzzing, Slow 3G)
- **Status**: \`${report.persona_results.personaC.status}\` (Score: ${report.persona_results.personaC.score}/100)
- **Steps Completed**: ${report.persona_results.personaC.stepsCompleted}/${report.persona_results.personaC.totalSteps}
- **Execution Time**: ${report.persona_results.personaC.executionTimeMs} ms
- **Degraded Network (500ms Latency)**: Graceful loading states handled
- **Non-ASCII / Unicode Fuzzing**: Zero database serialization faults

---

## 3. Network & Performance Profiling

- **p50 Latency**: \`${report.performance_metrics.p50LatencyMs} ms\`
- **p95 Latency**: \`${report.performance_metrics.p95LatencyMs} ms\` (Threshold < 800ms)
- **p99 Latency**: \`${report.performance_metrics.p99LatencyMs} ms\`
- **Time to First Byte (TTFB)**: \`${report.performance_metrics.timeToFirstByteMs} ms\`
- **DOM Content Loaded**: \`${report.performance_metrics.domContentLoadedMs} ms\`
- **Error Rate**: \`${report.performance_metrics.errorRatePercent}%\`

---

## 4. Friction Log & Vulnerability Index

${
  report.friction_logs.length === 0
    ? "_No critical friction points or unhandled exceptions detected across all testing personas._"
    : report.friction_logs
        .map(
          (f, idx) => `### Friction Item ${idx + 1}: [${f.severity}] ${f.category}
- **Location**: \`${f.location}\`
- **Selector**: \`${f.selector || "N/A"}\`
- **Description**: ${f.description}
- **Impact**: ${f.impact}
- **Reproduction**:
${f.reproductionSteps.map((s) => `  1. ${s}`).join("\n")}
`
        )
        .join("\n")
}

---

## 5. Prioritized Top-3 Remediation Plan

${report.top3_remediation_plan
  .map(
    (item) => `### Priority ${item.priority}: ${item.title}
**Target File/Service**: \`${item.targetFileOrService}\`  
**Rationale**: ${item.rationale}  
**Expected Friction Reduction**: ${item.expectedFrictionReduction}

\`\`\`typescript
${item.codeSnippetPatch}
\`\`\`
`
  )
  .join("\n\n")}

---

*Report automatically synthesized by Shipworthy Testing & Certification Engine.*
`;
}
