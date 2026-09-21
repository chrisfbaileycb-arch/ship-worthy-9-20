import React, { useState } from "react";
import { AppAuditReport, AxeAuditSummary } from "../types";
import { sendAuditReportEmail, EmailDeliveryResult } from "../services/emailService";
import {
  Mail,
  Send,
  CheckCircle,
  X,
  RefreshCw,
  FileText,
  User,
  ShieldCheck,
  Paperclip,
  Check,
  AlertCircle,
  Clock,
  Terminal,
} from "lucide-react";

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AppAuditReport;
  axeSummary?: AxeAuditSummary | null;
  defaultProjectLeadEmail?: string;
  defaultProjectLeadName?: string;
}

const PRESET_LEADS = [
  {
    role: "Project Lead / Engineering Director",
    name: "Alex Vance",
    email: "lead-architect@1without.io",
  },
  {
    role: "Staff Security Architect",
    name: "Elena Rostova",
    email: "security-lead@1without.io",
  },
  {
    role: "Head of Product & QA",
    name: "Marcus Sterling",
    email: "qa-director@1without.io",
  },
];

export const EmailReportModal: React.FC<EmailReportModalProps> = ({
  isOpen,
  onClose,
  report,
  axeSummary,
  defaultProjectLeadEmail = "lead-architect@1without.io",
  defaultProjectLeadName = "Alex Vance",
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>(defaultProjectLeadEmail);
  const [recipientName, setRecipientName] = useState<string>(defaultProjectLeadName);
  const [recipientRole, setRecipientRole] = useState<string>("Project Lead");
  const [subject, setSubject] = useState<string>(
    `[Launch Audit] ${report.appName} — 6-Pillar Readiness Score: ${report.launchReadinessScore}/100`
  );
  const [customNotes, setCustomNotes] = useState<string>(
    `Hi ${defaultProjectLeadName},\n\nPlease review the attached 6-Pillar Pre-Flight Audit and automated verification matrix for ${report.appName}. Readiness clearance is currently at ${report.launchReadinessScore}%.\n\nKey remediation directives and compliance findings are included below.`
  );
  const [includePdfAttachment, setIncludePdfAttachment] = useState<boolean>(true);

  const [isSending, setIsSending] = useState<boolean>(false);
  const [deliveryResult, setDeliveryResult] = useState<EmailDeliveryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeliveryLogs, setShowDeliveryLogs] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_LEADS[0]) => {
    setRecipientName(preset.name);
    setRecipientEmail(preset.email);
    setRecipientRole(preset.role);
    setCustomNotes(
      `Hi ${preset.name},\n\nPlease review the attached 6-Pillar Pre-Flight Audit for ${report.appName}. Readiness clearance is currently at ${report.launchReadinessScore}%.`
    );
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes("@")) {
      setErrorMsg("Please provide a valid recipient email address.");
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    try {
      const result = await sendAuditReportEmail({
        recipientEmail,
        recipientName,
        recipientRole,
        subject,
        customNotes,
        report,
        axeSummary,
        includePdfAttachment,
      });
      setDeliveryResult(result);
    } catch (err: any) {
      console.error("Mock email send failure:", err);
      setErrorMsg(err.message || "Failed to dispatch audit report email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 id="email-modal-title" className="text-base font-bold text-slate-900">
                Email Audit Report to Project Lead
              </h2>
              <p className="text-xs text-slate-500">
                Mock dispatch service delivering findings, scores & PDF dossier.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {deliveryResult ? (
            /* Success Receipt View */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900">
                  Audit Report Dispatched Successfully!
                </h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  The executive launch verification package was sent to{" "}
                  <strong className="font-semibold">{deliveryResult.recipientName}</strong> (
                  <span className="font-mono">{deliveryResult.recipientEmail}</span>).
                </p>
              </div>

              {/* Delivery Metadata Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Message ID</span>
                    <span className="font-mono text-slate-800 font-bold">{deliveryResult.messageId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Timestamp</span>
                    <span className="text-slate-800">{new Date(deliveryResult.sentAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Subject Line</span>
                    <span className="text-slate-800 font-medium truncate block">{deliveryResult.subject}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Attachment</span>
                    <span className="text-slate-800 font-mono flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-emerald-600" />
                      {deliveryResult.attachmentName || "None"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Status: 250 OK (Delivered)
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Readiness: {deliveryResult.readinessScore}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeliveryLogs(!showDeliveryLogs)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>{showDeliveryLogs ? "Hide SMTP Logs" : "View SMTP Logs"}</span>
                  </button>
                </div>

                {showDeliveryLogs && (
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-1 overflow-x-auto">
                    {deliveryResult.deliveryLog.map((log, idx) => (
                      <div key={idx} className="text-emerald-400">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Email Configuration Form */
            <form onSubmit={handleSendEmail} className="space-y-5">
              {/* Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Quick Select Stakeholder / Lead:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_LEADS.map((preset) => {
                    const isSelected = recipientEmail === preset.email;
                    return (
                      <button
                        key={preset.email}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        <div className="font-bold text-slate-900 truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{preset.role}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Project Lead Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="email-lead-name-input"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white outline-none"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Recipient Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email-lead-email-input"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="lead@company.com"
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white outline-none font-mono"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  id="email-subject-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white outline-none"
                />
              </div>

              {/* Message Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Executive Briefing / Custom Notes
                </label>
                <textarea
                  id="email-custom-notes-input"
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white outline-none resize-y"
                  placeholder="Add notes for the project lead..."
                />
              </div>

              {/* Attachment Toggle & Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={includePdfAttachment}
                    onChange={(e) => setIncludePdfAttachment(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attach compiled 6-pillar PDF dossier ({report.appName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_preflight_audit.pdf)</span>
                  </span>
                </label>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-emerald-700">Included In Email:</span>
                  <span>6 Pillars ({report.pillars.length})</span>
                  <span>•</span>
                  <span>Readiness Score ({report.launchReadinessScore}%)</span>
                  {axeSummary && (
                    <>
                      <span>•</span>
                      <span>Axe-Core WCAG ({axeSummary.wcagComplianceScore}%)</span>
                    </>
                  )}
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </p>
              )}

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="send-audit-email-submit-btn"
                  disabled={isSending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to Project Lead...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Report to Lead</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer when in success state */}
        {deliveryResult && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setDeliveryResult(null)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Send to Another Stakeholder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
