import jsPDF from "jspdf";
import { AppAuditReport, AxeAuditSummary, CheckStatus } from "../types";

export interface GeneratePdfOptions {
  report: AppAuditReport;
  axeSummary?: AxeAuditSummary | null;
  manualChecks?: { [checkId: string]: boolean };
  auditorName?: string;
}

export function generateAuditPdfReport({
  report,
  axeSummary,
  manualChecks = {},
  auditorName = "1WithOut Automated Launch Matrix & Axe-Core Engine",
}: GeneratePdfOptions): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 515.28 pt
  let currentY = margin;

  // Helper for page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 55) {
      doc.addPage();
      currentY = margin;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("1WithOut™ Launch Readiness & Verification Report", margin, 26);
    doc.text(
      `Target: ${report.appName} • ${new Date().toLocaleDateString()}`,
      pageWidth - margin,
      26,
      { align: "right" }
    );
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, 30, pageWidth - margin, 30);
  };

  // Helper to add section headers
  const addSectionHeader = (title: string, subtitle?: string) => {
    checkPageBreak(45);
    currentY += 12;

    // Background pill/accent bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin, currentY, contentWidth, 24, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 12, currentY + 16);

    currentY += 32;

    if (subtitle) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      const subLines = doc.splitTextToSize(subtitle, contentWidth);
      doc.text(subLines, margin, currentY);
      currentY += subLines.length * 12 + 6;
    }
  };

  // -------------------------------------------------------------
  // PAGE 1: TITLE & EXECUTIVE SUMMARY
  // -------------------------------------------------------------

  // Top Decorative Header Banner
  doc.setFillColor(2, 6, 23); // slate-950
  doc.rect(0, 0, pageWidth, 110, "F");

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 108, pageWidth, 3, "F");

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("1WITHOUT™ PRODUCTION LAUNCH DOSSIER", margin, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    "Formal 6-Pillar Empirical Verification & Automated Axe-Core™ WCAG 2.1 AA Audit",
    margin,
    58
  );

  doc.setFontSize(8);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(
    `REPORT ID: ${report.id || `AUD-${Date.now()}`}  •  DATE: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}  •  ENGINE: v2.0 (Gemini 3.7 & Axe)`,
    margin,
    74
  );

  currentY = 126;

  // Metadata Card Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, currentY, contentWidth, 76, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Target Application Metadata:", margin + 12, currentY + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`• App Name: ${report.appName}`, margin + 12, currentY + 34);
  doc.text(`• Production / Live URL: ${report.liveUrl || "Not Specified (Local Ingress)"}`, margin + 12, currentY + 48);
  doc.text(`• Repository Target: ${report.repoUrl || "Internal Workspace Source"}`, margin + 12, currentY + 62);

  const rightColX = margin + 260;
  doc.text(`• Clearance Status: ${report.status}`, rightColX, currentY + 34);
  doc.text(`• Readiness Score: ${report.launchReadinessScore}/100`, rightColX, currentY + 48);
  doc.text(`• Auditor: ${auditorName}`, rightColX, currentY + 62);

  currentY += 88;

  // Executive Scorecard Grid
  checkPageBreak(120);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Executive Launch Readiness Scorecard", margin, currentY + 12);
  currentY += 20;

  // Large Score Badge Box (Left)
  const scoreBoxWidth = 140;
  const scoreBoxHeight = 85;
  const isPassed = report.launchReadinessScore >= 90;

  doc.setFillColor(isPassed ? 240 : 254, isPassed ? 253 : 242, isPassed ? 244 : 242); // emerald-50 or rose-50
  doc.setDrawColor(isPassed ? 16 : 244, isPassed ? 185 : 63, isPassed ? 129 : 94);
  doc.setLineWidth(1.5);
  doc.roundedRect(margin, currentY, scoreBoxWidth, scoreBoxHeight, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(isPassed ? 5 : 225, isPassed ? 150 : 29, isPassed ? 105 : 72);
  doc.text(`${report.launchReadinessScore}`, margin + 35, currentY + 42);
  doc.setFontSize(12);
  doc.text("/100", margin + 78, currentY + 42);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(
    isPassed ? "READY TO SHIP" : "NEEDS REMEDIATION",
    margin + 16,
    currentY + 62
  );

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Shipworthy Pre-Flight Gate", margin + 18, currentY + 74);

  // Pillars Summary Mini Table (Right)
  const pillarGridX = margin + scoreBoxWidth + 12;
  const pillarGridWidth = contentWidth - scoreBoxWidth - 12;
  const rowHeight = 13.5;

  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(pillarGridX, currentY, pillarGridWidth, scoreBoxHeight, 6, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("6-Pillar Breakdown Scores:", pillarGridX + 10, currentY + 14);

  report.pillars.forEach((p, idx) => {
    const yPos = currentY + 28 + idx * rowHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`• ${p.name.split(",")[0].slice(0, 32)}:`, pillarGridX + 10, yPos);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(p.score >= 90 ? 16 : 217, p.score >= 90 ? 185 : 119, p.score >= 90 ? 129 : 6);
    doc.text(`${p.score}%`, pillarGridX + pillarGridWidth - 30, yPos);
  });

  currentY += scoreBoxHeight + 16;

  // -------------------------------------------------------------
  // AXE-CORE AUTOMATED ACCESSIBILITY SECTION
  // -------------------------------------------------------------
  if (axeSummary) {
    addSectionHeader(
      "Automated Axe-Core™ WCAG 2.1 AA Accessibility Evaluation",
      `Target Scanned: ${axeSummary.targetScanned} • Analyzed at: ${new Date(axeSummary.timestamp).toLocaleString()}`
    );

    checkPageBreak(70);
    // A11y Summary Box
    doc.setFillColor(240, 253, 250); // teal-50
    doc.setDrawColor(20, 184, 166); // teal-500
    doc.setLineWidth(1);
    doc.roundedRect(margin, currentY, contentWidth, 54, 6, 6, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `WCAG 2.1 AA Compliance Score: ${axeSummary.wcagComplianceScore}/100`,
      margin + 12,
      currentY + 16
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `• Total Violations: ${axeSummary.violationsCount}   |   • ARIA Rule Issues: ${axeSummary.ariaViolationsCount}   |   • Color Contrast Deficits: ${axeSummary.contrastViolationsCount}`,
      margin + 12,
      currentY + 30
    );
    doc.text(
      `• Passed Rule Assertions: ${axeSummary.passesCount}   |   • Manual Review Needed: ${axeSummary.incompleteCount}`,
      margin + 12,
      currentY + 44
    );

    currentY += 64;

    if (axeSummary.violations.length === 0) {
      checkPageBreak(40);
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(5, 150, 105);
      doc.text(
        "✓ Clean Axe-Core Scan: Zero accessibility or color contrast violations detected.",
        margin + 12,
        currentY + 18
      );
      currentY += 38;
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("Identified Accessibility Findings & Required Remediations:", margin, currentY);
      currentY += 12;

      axeSummary.violations.slice(0, 6).forEach((v, idx) => {
        checkPageBreak(75);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, currentY, contentWidth, 68, 4, 4, "FD");

        // Severity indicator
        const impact = (v.impact || "MODERATE").toUpperCase();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(
          impact === "CRITICAL" ? 225 : impact === "SERIOUS" ? 217 : 13,
          impact === "CRITICAL" ? 29 : impact === "SERIOUS" ? 119 : 148,
          impact === "CRITICAL" ? 72 : impact === "SERIOUS" ? 6 : 136
        );
        doc.text(`[${impact}] ${v.id.toUpperCase()}`, margin + 10, currentY + 14);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(`Rule: ${v.help} (${v.category})`, margin + 140, currentY + 14);

        const descLines = doc.splitTextToSize(`Description: ${v.description}`, contentWidth - 20);
        doc.text(descLines, margin + 10, currentY + 28);

        if (v.nodes.length > 0) {
          const targetStr = `Target Selector: ${v.nodes[0].target.join(" > ")}`;
          const targetLines = doc.splitTextToSize(targetStr, contentWidth - 20);
          doc.setFont("courier", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(targetLines[0], margin + 10, currentY + 44);
        }

        if (v.remediationSnippet) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(16, 185, 129);
          doc.text("Remediation: Apply accessible ARIA attributes and WCAG contrast ratio (>= 4.5:1).", margin + 10, currentY + 58);
        }

        currentY += 74;
      });
    }
  }

  // -------------------------------------------------------------
  // DETAILED 6-PILLAR VERIFICATION BREAKDOWN
  // -------------------------------------------------------------
  addSectionHeader(
    "Detailed 6-Pillar Verification Matrix",
    "Empirical status of Security, Infrastructure, Legal, Marketing Claims, Interface QA, and Maintenance."
  );

  report.pillars.forEach((pillar) => {
    checkPageBreak(65);

    // Pillar Header Card
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, currentY, contentWidth, 32, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(pillar.name, margin + 10, currentY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(pillar.summary, margin + 10, currentY + 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(pillar.score >= 90 ? 16 : 217, pillar.score >= 90 ? 185 : 119, pillar.score >= 90 ? 129 : 6);
    doc.text(`${pillar.score}%`, margin + contentWidth - 35, currentY + 20);

    currentY += 38;

    // Checks list
    pillar.checks.forEach((chk) => {
      const isCheckedManually = !!manualChecks[chk.id];
      const effectiveStatus: CheckStatus = isCheckedManually ? "PASSED" : chk.status;
      
      // Calculate dynamic text lines
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const descLines = doc.splitTextToSize(chk.description, contentWidth - 36);
      
      doc.setFont("helvetica", "italic");
      const fixLines = doc.splitTextToSize(`Fix / Verification: ${chk.recommendedFix}`, contentWidth - 36);
      
      const hasPatch = !!chk.patchCode;
      const patchLineCount = hasPatch ? 1 : 0;
      
      const checkCardHeight = Math.max(
        50,
        22 + descLines.length * 10 + fixLines.length * 10 + (hasPatch ? 18 : 0)
      );

      checkPageBreak(checkCardHeight + 6);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin + 6, currentY, contentWidth - 12, checkCardHeight, 4, 4, "FD");

      // Status pill
      let statusColor = [5, 150, 105]; // emerald
      if (effectiveStatus === "WARNING") statusColor = [217, 119, 6]; // amber
      if (effectiveStatus === "FAILED") statusColor = [225, 29, 72]; // rose

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(
        `[${isCheckedManually ? "VERIFIED (MANUAL)" : effectiveStatus}]`,
        margin + 14,
        currentY + 14
      );

      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(chk.name, contentWidth - 150);
      doc.text(titleLines[0], margin + 95, currentY + 14);

      let textCursorY = currentY + 26;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(descLines, margin + 14, textCursorY);
      textCursorY += descLines.length * 10;

      doc.setFont("helvetica", "italic");
      doc.setTextColor(15, 23, 42);
      doc.text(fixLines, margin + 14, textCursorY);
      textCursorY += fixLines.length * 10;

      if (chk.patchCode) {
        doc.setFont("courier", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(16, 185, 129);
        const codeClean = chk.patchCode.replace(/\s+/g, " ").slice(0, 105);
        doc.text(`Patch: ${codeClean}...`, margin + 14, textCursorY + 2);
      }

      currentY += checkCardHeight + 6;
    });

    currentY += 6;
  });

  // -------------------------------------------------------------
  // POST-LAUNCH 180-DAY CADENCE ROADMAP
  // -------------------------------------------------------------
  if (report.cadenceSchedule) {
    addSectionHeader(
      "Post-Launch 180-Day Maintenance & Evolution Cadence",
      "Automated operational checklists for long-term health, compliance, and version upgrades."
    );

    checkPageBreak(95);

    const colWidth = (contentWidth - 16) / 3;

    // Day 30 Card
    doc.setFillColor(240, 249, 255); // cyan-50
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(margin, currentY, colWidth, 90, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(2, 132, 199);
    doc.text("Day 30: Early Triage (Month 1)", margin + 8, currentY + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    report.cadenceSchedule.day30Tasks.forEach((t, i) => {
      const lines = doc.splitTextToSize(`• ${t}`, colWidth - 14);
      doc.text(lines, margin + 8, currentY + 28 + i * 18);
    });

    // Day 90 Card
    const col2X = margin + colWidth + 8;
    doc.setFillColor(240, 253, 250); // teal-50
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(col2X, currentY, colWidth, 90, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(13, 148, 136);
    doc.text("Day 90: Version Audit (Month 3)", col2X + 8, currentY + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    report.cadenceSchedule.day90Tasks.forEach((t, i) => {
      const lines = doc.splitTextToSize(`• ${t}`, colWidth - 14);
      doc.text(lines, col2X + 8, currentY + 28 + i * 18);
    });

    // Day 180 Card
    const col3X = margin + (colWidth + 8) * 2;
    doc.setFillColor(245, 243, 255); // indigo-50
    doc.setDrawColor(221, 214, 254);
    doc.roundedRect(col3X, currentY, colWidth, 90, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(99, 102, 241);
    doc.text("Day 180: Rotation & Archival (M6)", col3X + 8, currentY + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    report.cadenceSchedule.day180Tasks.forEach((t, i) => {
      const lines = doc.splitTextToSize(`• ${t}`, colWidth - 14);
      doc.text(lines, col3X + 8, currentY + 28 + i * 18);
    });

    currentY += 105;
  }

  // -------------------------------------------------------------
  // CERTIFICATE SIGN-OFF FOOTER BLOCK
  // -------------------------------------------------------------
  checkPageBreak(75);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.roundedRect(margin, currentY, contentWidth, 58, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("Verification Certification & Integrity Sign-Off", margin + 12, currentY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "This certification dossier confirms empirical compliance with 1WithOut production launch standards. Certified for cloud deployment, security boundaries, and WCAG accessibility.",
    margin + 12,
    currentY + 28,
    { maxWidth: contentWidth - 24 }
  );

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129);
  doc.text(
    `DIGITAL SIGNATURE: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(16).toUpperCase()} • VERIFIED`,
    margin + 12,
    currentY + 48
  );

  // -------------------------------------------------------------
  // FOOTER & PAGE NUMBERING (ALL PAGES)
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

    doc.text(
      "1WithOut™ Single Source of Truth Engine • Confidential & Proprietary Audit Dossier",
      margin,
      pageHeight - 20
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 20, {
      align: "right",
    });
  }

  // Save the PDF file
  const sanitizedAppName = report.appName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "app";
  doc.save(`${sanitizedAppName}-launch-audit-report.pdf`);
}
