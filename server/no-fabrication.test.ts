import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Shipworthy's one rule is that nothing is reported that was not actually found. These tests read the
// source and fail if the habits that broke that rule come back: invented telemetry, canned reports
// handed out when a model call is missing or fails, and a model key held by the server.

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const server = read("../server.ts");

function routeBlock(source: string, route: string): string {
  const start = source.indexOf(`app.post("${route}"`);
  expect(start, `route ${route} should exist`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf("\n});\n", start) + 5);
}

describe("the server fabricates nothing", () => {
  it("has no random numbers standing in for measurements", () => {
    expect(server).not.toMatch(/Math\.random/);
  });

  it("has no canned report generators", () => {
    expect(server).not.toMatch(/generateLocal\w+/);
  });

  it("holds no model key of its own", () => {
    for (const file of ["../server.ts", "./config.ts", "./readiness.ts"]) {
      expect(read(file), file).not.toMatch(/process\.env\.(GEMINI_API_KEY|API_KEY)\b/);
    }
  });

  it.each(["/api/discern", "/api/claims/analyze", "/api/skills/build", "/api/audit/scan", "/api/pipeline/process"])(
    "%s runs on the visitor's key and refuses without one",
    (route) => {
      const block = routeBlock(server, route);
      expect(block).toContain("geminiClientFor(req)");
      expect(block).toContain("rejectMissingKey(res)");
      expect(block).toContain("rejectModelFailure(res, geminiErr)");
    }
  );

  it("answers the old sandbox, persona and report endpoints with 501 and nothing else", () => {
    expect(server).not.toMatch(/app\.(get|post|put|delete)\("\/api\/shipworthy/);
    expect(server).toMatch(/app\.all\("\/api\/shipworthy\/\*splat"[\s\S]{0,200}status\(501\)/);
  });

  it("no longer serves the six-pillar scan that ignored its target", () => {
    expect(server).not.toContain("/api/audit/six-pillar");
  });
});

describe("the client fabricates nothing", () => {
  it("has no invented sandbox, persona or flight-report results", () => {
    const engine = read("../src/services/shipworthyEngine.ts");
    expect(engine).not.toMatch(/Math\.random|createOfflineHeuristic|provisionSandbox|runPersonaInSandbox/);
  });

  it("does not swap a failed analysis for an offline stand-in", () => {
    const api = read("../src/services/api.ts");
    for (const name of ["runOfflineHeuristicDiscernment", "runOfflineHeuristicSkillBuild", "runOfflineHeuristicPreFlightScan", "runOfflineHeuristicPipeline"]) {
      expect(api, name).not.toContain(name);
    }
  });

  it("gives a model call real time to finish", () => {
    const api = read("../src/services/api.ts");
    expect(api).not.toMatch(/abort\(\), 3000\)/);
  });
});
