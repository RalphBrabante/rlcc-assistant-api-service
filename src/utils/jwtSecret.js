"use strict";

function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || "").trim();
  if (!secret) {
    throw new Error("JWT_SECRET is required.");
  }

  if (secret.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be at least 32 characters in production.");
  }

  return secret;
}

module.exports = {
  getJwtSecret,
};
