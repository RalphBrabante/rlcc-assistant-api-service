"use strict";

const { createRateLimiter } = require("./rateLimit");

const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const email = String(req.body?.credentials?.emailAddress || "").trim().toLowerCase();
    return `${ip}|${email}`;
  },
  message: "Too many login attempts. Please try again later.",
});

module.exports = loginRateLimit;
