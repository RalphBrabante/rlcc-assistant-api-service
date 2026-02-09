"use strict";

const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const output = {};
    for (const [key, nested] of Object.entries(value)) {
      if (BLOCKED_KEYS.has(key)) continue;
      output[key] = sanitizeValue(nested);
    }
    return output;
  }

  if (typeof value === "string") {
    return value.replace(/\u0000/g, "");
  }

  return value;
}

function overwriteObject(target, source) {
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  for (const [key, value] of Object.entries(source)) {
    target[key] = value;
  }
}

module.exports = (req, res, next) => {
  req.body = sanitizeValue(req.body);

  if (req.query && typeof req.query === "object") {
    overwriteObject(req.query, sanitizeValue(req.query));
  }

  if (req.params && typeof req.params === "object") {
    overwriteObject(req.params, sanitizeValue(req.params));
  }

  return next();
};
