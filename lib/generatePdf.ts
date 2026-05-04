import type { NoticeAnalysis } from "./types";

type RGB = [number, number, number];

const C: Record<string, RGB> = {
  primary:   [0,   53,  95],
  secondary: [0,   105, 113],
  error:     [186, 26,  26],
  dark:      [13,  28,  47],
  muted:     [66,  71,  79],
  border:    [194, 199, 209],
  white:     [255, 255, 255],
  bgBlue:    [239, 244, 255],
  bgRed:     [255, 218, 214],
};

const URGENCY_COLORS: Record<string, RGB> = {
  critical: [186, 26,  26],
  high:     [180, 83,  9],
  medium:   [15,  76,  129],
  low:      [0,   105, 113],
};

const URGENCY_LABELS: Record<string, string> = {
  critical: "CRITICAL — IMMEDIATE ACTION REQUIRED",
  high:     "HIGH RISK — ACT SOON",
  medium:   "IMPORTANT — ACTION REQUIRED",
  low:      "LOW PRIORITY — REVIEW WHEN POSSIBLE",
};

export async function downloadActionPlan(analysis: NoticeAnalysis): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48;
  const contentW = pageW - M * 2;
  let y = M;

  const fill = (rgb: RGB) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  const color = (rgb: RGB) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  const stroke = (rgb: RGB) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  const wrap = (text: string, maxW = contentW) => doc.splitTextToSize(text, maxW) as string[];

  function checkBreak(needed: number) {
    if (y + needed > pageH - M) {
      doc.addPage();
      y = M;
    }
  }

  function sectionHeader(title: string) {
    checkBreak(90);
    y += 18;
    fill(C.bgBlue);
    doc.rect(M, y, contentW, 30, "F");
    fill(C.primary);
    doc.rect(M, y, 4, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    color(C.primary);
    doc.text(title, M + 14, y + 20);
    y += 48;
  }

  fill(C.primary);
  doc.rect(M, y, contentW, 52, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  color(C.white);
  doc.text("NoticeShield", M + 14, y + 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Action Plan & Resource Guide", M + 14, y + 38);
  doc.setFontSize(9);
  doc.text(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    pageW - M - 2, y + 38, { align: "right" }
  );
  y += 66;

  const urgencyRgb = URGENCY_COLORS[analysis.urgency] ?? C.primary;
  fill(urgencyRgb);
  doc.roundedRect(M, y, contentW, 32, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  color(C.white);
  const bannerText =
    (URGENCY_LABELS[analysis.urgency] ?? "ACTION REQUIRED") +
    (analysis.deadline ? `   |   Deadline: ${analysis.deadline}` : "");
  doc.text(bannerText, pageW / 2, y + 21, { align: "center" });
  y += 46;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  color(C.dark);
  doc.text(analysis.noticeTypeLabel, M, y);
  y += 26;
  if (analysis.locationLabel) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    color(C.muted);
    doc.text(`Location: ${analysis.locationLabel}`, M, y);
    y += 16;
  }
  y += 10;

  sectionHeader("Key Details");
  const colW = (contentW - 12) / 2;
  [
    { label: "DEADLINE",    value: analysis.deadline ?? "See original notice" },
    { label: "NOTICE TYPE", value: analysis.noticeTypeLabel },
  ].forEach((item, i) => {
    const x = M + i * (colW + 12);
    fill(C.bgBlue);
    doc.rect(x, y, colW, 42, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    color(C.muted);
    doc.text(item.label, x + 10, y + 13);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    color(C.dark);
    const valLines = wrap(item.value, colW - 20);
    doc.text(valLines[0] ?? item.value, x + 10, y + 30);
  });
  y += 54;

  sectionHeader("What This Means");
  const summaryLines = wrap(analysis.summary);
  checkBreak(summaryLines.length * 14 + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  color(C.muted);
  doc.text(summaryLines, M, y);
  y += summaryLines.length * 14 + 10;

  sectionHeader("Risk If Ignored");
  const riskLines = wrap(analysis.riskIfIgnored, contentW - 24);
  const riskBoxH = riskLines.length * 13 + 24;
  checkBreak(riskBoxH + 8);
  fill(C.bgRed);
  doc.rect(M, y, contentW, riskBoxH, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  color(C.error);
  doc.text(riskLines, M + 12, y + 16);
  y += riskBoxH + 10;

  sectionHeader("Required Steps");
  analysis.nextSteps.forEach((step, i) => {
    const stepLines = wrap(step, contentW - 32);
    const stepH = stepLines.length * 14 + 16;
    checkBreak(stepH);

    fill(C.primary);
    doc.circle(M + 9, y + 9, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    color(C.white);
    doc.text(`${i + 1}`, M + 9, y + 12, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    color(C.dark);
    doc.text(stepLines, M + 24, y + 12);
    y += stepH;
  });
  y += 4;

  if (analysis.suggestedMessage) {
    sectionHeader("Suggested Message to Send");
    const msgLines = wrap(analysis.suggestedMessage, contentW - 24);
    const msgBoxH = msgLines.length * 13 + 28;
    checkBreak(msgBoxH + 20);
    fill(C.bgBlue);
    doc.rect(M, y, contentW, msgBoxH, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    color(C.dark);
    doc.text(msgLines, M + 12, y + 16);
    y += msgBoxH + 6;
    doc.setFontSize(9);
    color(C.muted);
    doc.text("Replace [brackets] with your information before sending.", M, y);
    y += 16;
  }

  if (analysis.localResources?.length) {
    sectionHeader("Local Help & Resources");
    analysis.localResources.forEach((r) => {
      const detailLines = wrap(r.detail, contentW - 16);
      checkBreak(detailLines.length * 13 + 32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      color(C.primary);
      doc.text(r.label, M, y);
      y += 14;
      if (r.url) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        color(C.secondary);
        doc.text(r.url, M + 8, y);
        y += 12;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      color(C.muted);
      doc.text(detailLines, M + 8, y);
      y += detailLines.length * 13 + 10;
    });
  }

  sectionHeader("Important Disclaimer");
  const disclaimerLines = wrap(analysis.disclaimer, contentW - 24);
  const disclaimerBoxH = disclaimerLines.length * 12 + 20;
  checkBreak(disclaimerBoxH + 8);
  fill(C.bgBlue);
  doc.rect(M, y, contentW, disclaimerBoxH, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  color(C.muted);
  doc.text(disclaimerLines, M + 12, y + 14);
  y += disclaimerBoxH + 10;

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    stroke(C.border);
    doc.setLineWidth(0.5);
    doc.line(M, pageH - 32, pageW - M, pageH - 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    color(C.muted);
    doc.text(
      "NoticeShield Action Plan  |  Verify all deadlines and details with the original notice and issuing agency",
      M, pageH - 18
    );
    doc.text(`Page ${p} of ${totalPages}`, pageW - M, pageH - 18, { align: "right" });
  }

  const slug = analysis.noticeType.replace(/_/g, "-");
  const date = new Date().toISOString().slice(0, 10);
  doc.save(`NoticeShield-${slug}-${date}.pdf`);
}
