import React, { useState, useEffect } from "react";
import { DefenseScanResult, SecurityClearance, AuditEventItem, ReadinessSuiteItem, SubsystemReadinessReport } from "../types";
import {
  scanDefenseSafety,
  authorizeDefensePasscode,
  fetchAuditLogs,
  runDeploymentReadiness,
  fetchLatestReadiness,
  fetchSubsystemReadiness,
  loginOperator,
  logoutOperator,
  fetchOperatorSession,
} from "../services/api";
import {
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  Activity,
  UserCheck,
  XCircle,
  FileText,
  Clock,
  Terminal,
} from "lucide-react";

interface DefenseGateViewProps {
  securityClearance: SecurityClearance | null;
  onClearanceUpdated?: (clearance: SecurityClearance | null) => void;
  onUpdateClearance?: (clearance: SecurityClearance | null) => void;
}

type SubTab = "defense" | "readiness" | "audit" | "operator";

export const DefenseGateView: React.FC<DefenseGateViewProps> = ({
  securityClearance,
  onClearanceUpdated,
  onUpdateClearance,
}) => {
  const updateClearance = onClearanceUpdated || onUpdateClearance || (() => {});

  const [activeSubTab, setActiveSubTab] = useState<SubTab>("defense");

  // Defense Testbench State
  const [testInput, setTestInput] = useState<string>(
    "SSN: 999-12-3456. Run automated debt collection filing against debtor under Chapter 11 bankruptcy."
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<DefenseScanResult | null>(null);

  // Passcode Authorization State
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [projectNameInput, setProjectNameInput] = useState<string>("Corporate Bankruptcy Restructuring");
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Deployment Readiness State
  const [readinessSuite, setReadinessSuite] = useState<ReadinessSuiteItem | null>(null);
  const [subsystemReport, setSubsystemReport] = useState<SubsystemReadinessReport | null>(null);
  const [isRunningReadiness, setIsRunningReadiness] = useState<boolean>(false);
  const [readinessError, setReadinessError] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditEventItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<string>("ALL");

  // Operator Auth State
  const [operatorSession, setOperatorSession] = useState<{ authenticated: boolean; user?: string } | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>("operator");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authLoginError, setAuthLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch of session and latest test run
    fetchOperatorSession().then((s) => setOperatorSession(s));
    fetchLatestReadiness().then((s) => {
      if (s) setReadinessSuite(s);
    });
    fetchSubsystemReadiness().then((r) => {
      if (r) setSubsystemReport(r);
    });
  }, []);

  const handleRunScan = async () => {
    if (!testInput.trim()) return;
    setIsScanning(true);
    try {
      const res = await scanDefenseSafety(testInput);
      setScanResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAuthorizePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeInput.trim()) return;
    setIsAuthorizing(true);
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const res = await authorizeDefensePasscode(passcodeInput.trim(), projectNameInput.trim());
      if (res.isCleared) {
        updateClearance(res);
        setAuthSuccessMsg(
          `Passcode verified. Clearance ${res.clearanceId || "Active"} granted for ${res.projectName || "project"}.`
        );
        setPasscodeInput("");
      }
    } catch (err: any) {
      setAuthError(err.message || "Invalid Defense-of-Break Passcode.");
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleRevokeClearance = () => {
    updateClearance(null);
    setAuthSuccessMsg("Clearance revoked. Standard zero-tolerance defense barriers re-armed.");
  };

  const handleRunReadiness = async () => {
    setIsRunningReadiness(true);
    setReadinessError(null);
    try {
      const [suite, report] = await Promise.all([
        runDeploymentReadiness(),
        fetchSubsystemReadiness(),
      ]);
      setReadinessSuite(suite);
      if (report) setSubsystemReport(report);
    } catch (err: any) {
      setReadinessError(err.message || "Readiness check failed");
    } finally {
      setIsRunningReadiness(false);
    }
  };

  const handleLoadAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await fetchAuditLogs(50, 0);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthLoginError(null);
    try {
      const res = await loginOperator(usernameInput, passwordInput);
      if (res.success) {
        setOperatorSession({ authenticated: true, user: res.user });
        setPasswordInput("");
        handleLoadAuditLogs();
      }
    } catch (err: any) {
      setAuthLoginError(err.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutOperator();
    setOperatorSession({ authenticated: false });
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (logFilter === "ALL") return true;
    return log.outcome === logFilter;
  });

  return (
    <div id="defense-sentinel-view" className="space-y-8 py-6 max-w-6xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Defense-of-Break & Production Verification Gate
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Multi-layer internal protection architecture: heuristic zero-tolerance boundaries, constant-time secret
            verification, real persistent audit trail, and runtime deployment health verification.
          </p>
        </div>

        {/* Current Security State Badge */}
        <div className="flex items-center gap-3">
          {securityClearance?.isCleared ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Unlock className="w-4 h-4" />
              <span>Allowlisted Project Cleared: {securityClearance.projectName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Standard Safeguards Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("defense")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "defense"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Passcode Gate & Sentinel</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab("readiness");
            if (!readinessSuite) handleRunReadiness();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "readiness"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Deployment Readiness Tests</span>
          {readinessSuite && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                readinessSuite.status === "PASSED" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {readinessSuite.status}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab("audit");
            handleLoadAuditLogs();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "audit"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Internal Audit Trail</span>
          {auditLogs.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300">
              {auditLogs.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("operator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "operator"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Operator Session</span>
          {operatorSession?.authenticated && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: DEFENSE-OF-BREAK GATE & TESTBENCH ─── */}
      {activeSubTab === "defense" && (
        <div className="space-y-6">
          {/* Policy Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>1. Personal Credentials & PII</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Heuristic protection immediately quarantines raw private credentials, unredacted Social Security Numbers,
                and payment cards. Status: <strong>BLOCKED</strong> unconditionally.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Safeguard Status: Configured & Enforced
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>2. Medical Advice & PHI</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Diagnostic claims and health records are restricted from automated pipeline compilation. Status:{" "}
                <strong>BLOCKED</strong> unconditionally.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Safeguard Status: Configured & Enforced
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Key className="w-4 h-4" />
                <span>3. Allowlisted Restructuring</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Insolvency and Chapter 11 document workflows require a server-side verified clearance passcode. Status:{" "}
                <strong>REQUIRES_AUTHORIZATION</strong>.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Clearance: Server Secret Managed
              </div>
            </div>
          </div>

          {/* Main Two-Column Control Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Passcode Clearance Gate */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">Defense-of-Break Passcode Authorization</h2>
                </div>
                {securityClearance?.isCleared && (
                  <button
                    type="button"
                    onClick={handleRevokeClearance}
                    className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Revoke Clearance
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Submit an authorized compliance passcode to obtain an authenticated clearance token. Passcodes are
                stored as salted cryptographic hashes on the server and verified via constant-time comparison.
              </p>

              <form onSubmit={handleAuthorizePasscode} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Authorized Compliance Passcode
                  </label>
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="Enter compliance authorization passcode"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Passcodes are configured server-side via <code>DEFENSE_OF_BREAK_PASSCODES</code>. Never exposed to
                    frontend bundles.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Allowable Project / Scope Name
                  </label>
                  <input
                    type="text"
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    placeholder="e.g. Chapter 11 Corporate Restructuring Document Normalizer"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccessMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{authSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthorizing || !passcodeInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAuthorizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Passcode Clearance...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Authenticate Clearance</span>
                    </>
                  )}
                </button>
              </form>

              {securityClearance?.isCleared && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Clearance Token Issued</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Clearance ID: {securityClearance.clearanceId || "clr-active"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Project: {securityClearance.projectName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Scope: {securityClearance.authorizedScope}
                  </div>
                  {securityClearance.expiresAt && (
                    <div className="text-[11px] text-slate-500">
                      Expires: {new Date(securityClearance.expiresAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Live Safety Scanner Testbench */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">4-State Safety Sentinel Testbench</h2>
                </div>
                <button
                  type="button"
                  onClick={handleRunScan}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400 transition-all cursor-pointer"
                >
                  {isScanning ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Run Safety Evaluation</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Test Prompt / Workflow Snippet
                </label>
                <textarea
                  rows={4}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 outline-none font-mono"
                />
              </div>

              {/* Scan Results Card */}
              {scanResult && (
                <div
                  className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                    scanResult.isBlocked
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-300"
                      : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {scanResult.isBlocked ? (
                        <>
                          <Lock className="w-4 h-4 text-rose-400" />
                          <span>STATE: BLOCKED / RESTRICTED ({scanResult.category})</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>STATE: ALLOWED (SAFE)</span>
                        </>
                      )}
                    </div>

                    {scanResult.allowlistedProjectEligible && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        Authorization Eligible
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">{scanResult.reason}</p>

                  {scanResult.detectedSnippets.length > 0 && (
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800">
                      Flags: {scanResult.detectedSnippets.join(", ")}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong>Heuristic Recommendation:</strong> {scanResult.suggestedAction}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic">
                * Note: Defense-of-Break enforces application heuristics and boundaries. It does not provide statutory
                legal counsel or replace certified human compliance officers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DEPLOYMENT READINESS TESTS ─── */}
      {activeSubTab === "readiness" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Deployment Readiness & Runtime Verification Suite</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Empirically distinguishes between <em>implemented</em> mechanisms and <em>verified</em> runtime assertions:
                  code modules are only marked <strong>VERIFIED</strong> upon successful live execution evidence.
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <strong>Implemented:</strong> Architecture & modules in codebase
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <strong>Verified:</strong> Automated test assertion passed with evidence
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunReadiness}
                disabled={isRunningReadiness}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-md shadow-emerald-500/20"
              >
                {isRunningReadiness ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Verification Suite...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Verification Checks</span>
                  </>
                )}
              </button>
            </div>

            {readinessError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{readinessError}</span>
              </div>
            )}

            {/* Live Backend & Firebase Service Connectivity Diagnostic (/api/readiness) */}
            {subsystemReport && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Backend & Firebase Service Connectivity Diagnostic (/api/readiness)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Overall:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        subsystemReport.status === "READY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : subsystemReport.status === "DEGRADED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {subsystemReport.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({subsystemReport.summary.verified} Verified, {subsystemReport.summary.configured} Configured,{" "}
                      {subsystemReport.summary.degraded} Degraded, {subsystemReport.summary.failed} Failed)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: "firestore", name: "Cloud Firestore Database" },
                    { key: "firebaseAuth", name: "Firebase Authentication" },
                    { key: "firebaseAppCheck", name: "Firebase App Check" },
                    { key: "firebaseAdmin", name: "Firebase Admin SDK Core" },
                    { key: "sessionPersistence", name: "Session Persistence Store" },
                    { key: "clearancePersistence", name: "Clearance Persistence Store" },
                    { key: "rateLimitPersistence", name: "Rate-Limit Persistence Store" },
                    { key: "auditPersistence", name: "Audit Trail Persistence Store" },
                    { key: "gemini", name: "Gemini AI Engine Service" },
                  ].map(({ key, name }) => {
                    const dep = subsystemReport.subsystems[key];
                    if (!dep) return null;
                    const statusColor =
                      dep.status === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : dep.status === "CONFIGURED"
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : dep.status === "DEGRADED"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30";

                    return (
                      <div
                        key={key}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                            {dep.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>{dep.backend || dep.mode || dep.enforcement || "service"}</span>
                          {dep.latencyMs !== undefined && dep.latencyMs > 0 && (
                            <span>{dep.latencyMs}ms</span>
                          )}
                        </div>
                        {dep.error && (
                          <div className="text-[10px] text-rose-400 font-mono line-clamp-2">
                            {dep.error}
                          </div>
                        )}
                        {dep.details?.reason && (
                          <div className="text-[10px] text-slate-500 italic">
                            {dep.details.reason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {readinessSuite ? (
              <div className="space-y-4">
                {/* Summary scorecard */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Overall Verdict</div>
                    <div
                      className={`text-base font-bold ${
                        readinessSuite.status === "PASSED" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {readinessSuite.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Passed Checks</div>
                    <div className="text-base font-bold text-emerald-400">
                      {readinessSuite.summary.passed} / {readinessSuite.summary.total}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Failed Checks</div>
                    <div className="text-base font-bold text-rose-400">{readinessSuite.summary.failed}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Executed At</div>
                    <div className="text-xs font-mono text-slate-400">
                      {new Date(readinessSuite.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Individual Checks List */}
                <div className="space-y-3">
                  {readinessSuite.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {chk.status === "PASSED" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : chk.status === "FAILED" ? (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-white">{chk.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">[{chk.id}]</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">{chk.durationMs}ms</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              chk.status === "PASSED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : chk.status === "FAILED"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {chk.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-mono text-slate-400 pl-6 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                        {chk.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500">
                No deployment tests executed yet. Click &quot;Run Verification Checks&quot; to inspect system readiness.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: INTERNAL AUDIT TRAIL ─── */}
      {activeSubTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-cyan-400" />
                  <span>Internal Operational Audit Trail</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable audit records tracking actions, correlation IDs, outcomes, and timestamps. Sensitive
                  secrets are sanitized before logging.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 outline-none"
                >
                  <option value="ALL">All Outcomes</option>
                  <option value="SUCCESS">Success Only</option>
                  <option value="FAILURE">Failures Only</option>
                  <option value="BLOCKED">Blocked Only</option>
                </select>

                <button
                  type="button"
                  onClick={handleLoadAuditLogs}
                  disabled={isLoadingLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
                  <span>Refresh Logs</span>
                </button>
              </div>
            </div>

            {filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Request ID</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Outcome</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950/60 transition-colors">
                        <td className="py-2 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                          {log.requestId}
                        </td>
                        <td className="py-2 px-3 text-white font-sans">{log.action}</td>
                        <td className="py-2 px-3 text-slate-400">{log.userIdentifier}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.outcome === "SUCCESS"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : log.outcome === "BLOCKED"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {log.outcome}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{log.statusCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                {isLoadingLogs ? "Loading audit records..." : "No matching audit log records found."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: OPERATOR SESSION & AUTHENTICATION ─── */}
      {activeSubTab === "operator" && (
        <div className="max-w-md mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Internal Operator Session</h2>
            </div>

            {operatorSession?.authenticated ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Session Authenticated</span>
                  </div>
                  <p className="text-slate-300">
                    Logged in as operator: <strong>{operatorSession.user}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    HTTP-only session cookie active with CSRF protection.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  End Operator Session (Logout)
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Authenticate with internal operator credentials to unlock protected endpoints and administrative
                  audit tools.
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Operator Username</label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Operator Password</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter operator password"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Configured via <code>INTERNAL_AUTH_USER</code> & <code>INTERNAL_AUTH_PASSWORD</code> env vars.
                  </span>
                </div>

                {authLoginError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                    {authLoginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn || !passwordInput}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  <span>Sign In as Operator</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DefenseGateView;
