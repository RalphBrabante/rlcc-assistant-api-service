"use strict";

const fs = require("fs");
const path = require("path");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = function emailBugReportNotification({
  recipientName,
  to,
  report,
  reporterName,
  transporter,
}) {
  if (!to || !transporter || !report) {
    return;
  }

  const templatePath = path.resolve(
    __dirname,
    "../email-templates/bugReportNotification.html"
  );

  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const submittedAt = new Date(report.createdAt || Date.now()).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const replacements = {
    recipientName: escapeHtml(recipientName || "Team Member"),
    reportId: escapeHtml(report.id),
    reportTitle: escapeHtml(report.title),
    reportScope: escapeHtml(report.scope),
    reportSeverity: escapeHtml(report.severity),
    reportStatus: escapeHtml(report.status),
    reporterName: escapeHtml(reporterName || "Unknown Reporter"),
    pageUrl: escapeHtml(report.pageUrl || "Not provided"),
    reportDescription: escapeHtml(report.description),
    submittedAt: escapeHtml(submittedAt),
  };

  for (const [key, value] of Object.entries(replacements)) {
    htmlTemplate = htmlTemplate.replaceAll(`{{${key}}}`, value);
  }

  const mailOptions = {
    from: '"RLCC Assistant" <test@sysgage.com>',
    to,
    subject: `[RLCC] New Bug Report #${report.id}: ${report.title}`,
    text: `Hello ${recipientName || "Team Member"},\n\nA new bug report was submitted.\nReport ID: ${report.id}\nTitle: ${report.title}\nScope: ${report.scope}\nSeverity: ${report.severity}\nStatus: ${report.status}\nReported By: ${reporterName || "Unknown Reporter"}\nSubmitted At: ${submittedAt}\nPage URL: ${report.pageUrl || "Not provided"}\n\nDescription:\n${report.description}`,
    html: htmlTemplate,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Error sending bug report notification:", error);
    }
  });
};
