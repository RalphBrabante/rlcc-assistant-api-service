"use strict";

const crypto = require("crypto");
const { Op } = require("sequelize");
const { User, PasswordResetToken } = require("../../models");
const { buildPasswordResetEmail } = require("../../utils/passwordResetEmailTemplate");

const DEFAULT_SUCCESS_MESSAGE =
  "If an account with that email exists, a reset link has been sent.";

module.exports.validate = async (req, res, next) => {
  const emailAddress = String(req.body?.emailAddress || "").trim().toLowerCase();
  if (!emailAddress) {
    return next({
      status: 400,
      message: "Email address is required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailAddress)) {
    return next({
      status: 400,
      message: "Invalid email address.",
    });
  }

  res.locals.emailAddress = emailAddress;
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { emailAddress } = res.locals;

  try {
    const user = await User.findOne({
      where: { emailAddress, isActive: true },
      attributes: ["id", "emailAddress", "firstName"],
    });

    if (user) {
      if (!req.transporter) {
        return next({
          status: 500,
          message:
            "Password reset email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
        });
      }

      await PasswordResetToken.update(
        { consumedAt: new Date() },
        {
          where: {
            userId: user.id,
            consumedAt: { [Op.is]: null },
          },
        }
      );

      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await PasswordResetToken.create({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      const webUrl = String(process.env.CLIENT_BASE_URL || "http://localhost").replace(/\/+$/, "");
      const resetLink = `${webUrl}/login/reset-password?token=${rawToken}`;
      const logoUrl = String(
        process.env.APP_LOGO_URL || `${webUrl}/rlcc-logo.png`
      ).trim();
      const supportEmail = String(process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || "").trim();
      const { html, text } = buildPasswordResetEmail({
        firstName: user.firstName || "User",
        resetLink,
        logoUrl,
        supportEmail,
      });

      try {
        await req.transporter.sendMail({
          from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER ||
            "noreply@rlcc-assistant.local",
          to: user.emailAddress,
          subject: "RLCC Assistant Password Reset",
          html,
          text,
        });
      } catch (mailError) {
        console.error(
          "forgotPassword mail error:",
          mailError.message,
          mailError.code || "",
          mailError.responseCode || "",
          mailError.response || ""
        );
        return next({
          status: 500,
          message: "Unable to send password reset email right now. Please try again later.",
        });
      }
    }

    res.send({
      status: 200,
      message: DEFAULT_SUCCESS_MESSAGE,
    });
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
