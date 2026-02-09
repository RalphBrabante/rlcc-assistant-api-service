"use strict";

function createRateLimiter(options = {}) {
  const {
    windowMs = 60_000,
    max = 120,
    keyGenerator = (req) => req.ip || req.socket?.remoteAddress || "unknown",
    message = "Too many requests. Please try again later.",
  } = options;

  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = String(keyGenerator(req) || "unknown");
    const existing = buckets.get(key);

    if (!existing || now - existing.windowStart >= windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return next();
    }

    existing.count += 1;
    if (existing.count > max) {
      const retryAfterSec = Math.ceil((windowMs - (now - existing.windowStart)) / 1000);
      res.setHeader("Retry-After", String(Math.max(retryAfterSec, 1)));
      return next({
        status: 429,
        message,
      });
    }

    return next();
  };
}

module.exports = {
  createRateLimiter,
};
