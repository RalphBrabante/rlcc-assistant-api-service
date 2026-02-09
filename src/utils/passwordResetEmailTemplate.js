"use strict";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPasswordResetEmail(options = {}) {
  const {
    firstName = "User",
    resetLink = "",
    logoUrl = "",
    supportEmail = "",
  } = options;

  const safeName = escapeHtml(firstName);
  const safeLink = escapeHtml(resetLink);
  const safeLogo = escapeHtml(logoUrl);
  const safeSupport = escapeHtml(supportEmail);

  const html = `
  <div style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:linear-gradient(135deg,#0b5ed7 0%,#198754 100%);padding:20px;text-align:center;">
                ${
                  safeLogo
                    ? `<img src="${safeLogo}" alt="RLCC" style="height:56px;width:auto;display:block;margin:0 auto 10px;" />`
                    : ""
                }
                <div style="color:#ffffff;font-size:22px;font-weight:700;">RLCC Assistant</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;color:#1f2937;">
                <h2 style="margin:0 0 12px 0;font-size:22px;">Password Reset Request</h2>
                <p style="margin:0 0 14px 0;line-height:1.6;">Hi ${safeName},</p>
                <p style="margin:0 0 18px 0;line-height:1.6;">
                  We received a request to reset your password. Click the button below to set a new one.
                </p>
                <p style="text-align:center;margin:0 0 18px 0;">
                  <a href="${safeLink}" style="display:inline-block;background:#0d6efd;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
                    Reset Password
                  </a>
                </p>
                <p style="margin:0 0 10px 0;color:#6b7280;line-height:1.5;">
                  This link expires in <strong>30 minutes</strong>. If you did not request this, you can ignore this email.
                </p>
                <p style="margin:0;color:#6b7280;line-height:1.5;">
                  If the button does not work, copy and paste this URL:
                </p>
                <p style="margin:8px 0 0 0;word-break:break-all;">
                  <a href="${safeLink}" style="color:#0d6efd;">${safeLink}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;">
                RLCC Assistant Security Notification
                ${
                  safeSupport
                    ? `<br/>Need help? Contact: <a href="mailto:${safeSupport}" style="color:#0d6efd;">${safeSupport}</a>`
                    : ""
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  const text = [
    "RLCC Assistant Password Reset",
    "",
    `Hi ${firstName},`,
    "We received a request to reset your password.",
    `Reset link: ${resetLink}`,
    "This link expires in 30 minutes.",
  ].join("\n");

  return { html, text };
}

module.exports = {
  buildPasswordResetEmail,
};

