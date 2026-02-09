"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { User, PasswordResetToken } = require("../../models");

function hasStrongPassword(value) {
  if (value.length < 8 || value.length > 100) return false;
  if (!/[a-z]/.test(value)) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;
  return true;
}

module.exports.validate = async (req, res, next) => {
  const token = String(req.body?.token || "").trim();
  const password = String(req.body?.password || "");
  const confirmPassword = String(req.body?.confirmPassword || "");

  if (!token) {
    return next({ status: 400, message: "Reset token is required." });
  }
  if (!password) {
    return next({ status: 400, message: "Password is required." });
  }
  if (password !== confirmPassword) {
    return next({ status: 400, message: "Password confirmation does not match." });
  }
  if (!hasStrongPassword(password)) {
    return next({
      status: 400,
      message:
        "Password must be 8-100 chars and include uppercase, lowercase, number, and special character.",
    });
  }

  res.locals.resetPayload = { token, password };
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { token, password } = res.locals.resetPayload;

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetToken = await PasswordResetToken.findOne({
      where: {
        tokenHash,
        consumedAt: { [Op.is]: null },
        expiresAt: { [Op.gt]: new Date() },
      },
      attributes: ["id", "userId"],
    });

    if (!resetToken) {
      return next({ status: 400, message: "Reset token is invalid or expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update(
      { password: hashedPassword, failedLoginAttempts: 0, lockedAt: null },
      {
        where: { id: resetToken.userId },
      }
    );

    await PasswordResetToken.update(
      { consumedAt: new Date() },
      {
        where: {
          userId: resetToken.userId,
          consumedAt: { [Op.is]: null },
        },
      }
    );

    res.send({
      status: 200,
      message: "Password has been reset successfully.",
    });
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
