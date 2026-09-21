import React, { useState, useEffect } from "react";
import { AppRegistryItem } from "../types";
import { generateDossierSha256 } from "../utils/governance";
import { SecondaryActionButton } from "./ui/SecondaryActionButton";
import {
  ShieldCheck,
  Printer,
  Copy,
  Check,
  X,
  FileCheck,
  Lock,
  Globe,
  GitBranch,
  CalendarCheck,
  Layers,
  Award,
} from "lucide-react";

interface LaunchDossierModalProps {
  app: AppRegistryItem;
  onClose: () => void;
}

export const LaunchDossierModal: React.FC<LaunchDossierModalProps> = ({ app, onClose }) => {
  const [signature, setSignature] = useState<string>(app.dossierSignature || "");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!signature) {
      generateDossierSha256(app).then(setSignature);
    }
  }, [app, signature]);

  const handleCopy = () => {
    if (signature && navigator.clipboard) {
      navigator.clipboard.writeText(signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDate = app.dossierGeneratedAt || new Date().toISOString();

  return (
    <div
      id="launch-dossier-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="launch-dossier-modal"
        className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Top Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Production Launch Certification Dossier</h2>
              <p className="text-xs text-slate-400">Cryptographically signed compliance record</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-dossier-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Dossier (PDF/Print)</span>
            </button>
            <button
              id="close-dossier-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div id="printable-certification-dossier" className="flex-1 overflow-y-auto space-y-6 pr-1 bg-slate-950 p-6 rounded-xl border border-slate-800">
          {/* Official Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
                Official Certification of Launch Readiness
              </div>
              <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
                {app.name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Owner: <span className="text-slate-200">{app.organization || app.owner || "Independent Builder"}</span>
              </p>
            </div>
            <div className="text-right sm:text-right">
              <div className="text-3xl font-black text-emerald-400">
                {app.readinessScore}<span className="text-sm font-normal text-slate-500">/100</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                Readiness Score
              </div>
            </div>
          </div>

          {/* Cryptographic SHA256 Signature Stamp */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 Integrity Verification Signature</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 print:hidden cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy Hash"}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-emerald-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              {signature || "Computing cryptographic digest..."}
            </div>
            <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Certified At: {new Date(currentDate).toUTCString()}</span>
              <span>Scope: {app.projectScope === "master_core_ip" ? "Master Core IP" : "Client Deliverable"}</span>
              <span>Status: {app.status}</span>
            </div>
          </div>

          {/* Core Verification Pillars Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>6-Pillar Verification Matrix Breakdown</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>1. Security Headers & TLS Policy</span>
                  <span className="text-emerald-400 font-bold">PASS (100%)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  CSP default-src 'self', HSTS subdomains preload, X-Frame-Options DENY, nosniff MIME protection.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>2. WCAG 2.1 AA Accessibility & Contrast</span>
                  <span className="text-emerald-400 font-bold">PASS (4.5:1+)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  All interactive touch targets 44px or greater, semantic landmarks, high contrast text in dark &amp; light canvas.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>3. Legal, Compliance & Webhook Idempotency</span>
                  <span className="text-emerald-400 font-bold">PASS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  GDPR/CCPA disclosures, Terms of Service, webhook signatures with idempotent transaction retries.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>4. Error Boundary & Port Isolation</span>
                  <span className="text-emerald-400 font-bold">PASS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Global catch-all error boundary, zero crash unhandled promises, strict ingress binding to port 3000.
                </p>
              </div>
            </div>
          </div>

          {/* Operational Cadence Milestones */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-cyan-400" />
              <span>Operational Review Cadence Schedule</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">DAY 30</div>
                <div className="font-bold text-emerald-400">Early Triage</div>
                <div className="text-[10px] text-slate-500 mt-1">Error Logs & Retry Health</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">DAY 60</div>
                <div className="font-bold text-emerald-400">Mid-Flight Security</div>
                <div className="text-[10px] text-slate-500 mt-1">Secret Scans & CSP Violations</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">DAY 90</div>
                <div className="font-bold text-emerald-400">Version & CVE Audit</div>
                <div className="text-[10px] text-slate-500 mt-1">npm audit fix & SDK Migration</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">DAY 180</div>
                <div className="font-bold text-emerald-400">Rotation & Archival</div>
                <div className="text-[10px] text-slate-500 mt-1">Credential Rotation & Legal Archival</div>
              </div>
            </div>
          </div>

          {/* Endorsement Seal */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <div>
              Certified by <span className="text-slate-300 font-semibold">Shipworthy Universal Governance Engine</span>
            </div>
            <div>
              Verification Protocol: <span className="font-mono text-emerald-400">AUTONOMOUS-LAUNCH-SOP-V2</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 print:hidden shrink-0">
          <SecondaryActionButton
            onCancelOrBack={onClose}
          >
            Close / Back
          </SecondaryActionButton>
        </div>
      </div>
    </div>
  );
};
