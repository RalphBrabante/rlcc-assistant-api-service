function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseBody(body) {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch (error) {
    return body;
  }
}

function normalizeSuccessPayload(payload, code) {
  if (!isPlainObject(payload)) {
    return { code, data: payload };
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "code") &&
    Object.prototype.hasOwnProperty.call(payload, "data") &&
    Object.keys(payload).every((key) => ["code", "data", "message", "meta"].includes(key))
  ) {
    return payload;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "data")) {
    const out = { code, data: payload.data };
    if (payload.meta !== undefined) out.meta = payload.meta;
    if (payload.message !== undefined) out.message = payload.message;
    return out;
  }

  const raw = { ...payload };
  delete raw.status;
  delete raw.code;
  delete raw.message;
  delete raw.stack;

  const data = Object.keys(raw).length ? raw : null;
  const out = { code, data };
  if (payload.message !== undefined) out.message = payload.message;
  return out;
}

function normalizeErrorPayload(payload, code) {
  if (isPlainObject(payload)) {
    const out = {
      code: Number(payload.code || payload.status || code || 500),
      message: payload.message || "Internal Server Error",
    };
    if (payload.details !== undefined) out.details = payload.details;
    if (payload.stack !== undefined && process.env.NODE_ENV === "development") {
      out.stack = payload.stack;
    }
    return out;
  }

  return {
    code: Number(code || 500),
    message: typeof payload === "string" ? payload : "Internal Server Error",
  };
}

module.exports = (req, res, next) => {
  const originalSend = res.send.bind(res);

  const wrap = (body) => {
    const parsed = parseBody(body);
    const code = Number(res.statusCode || 200);

    if (code >= 400) {
      return normalizeErrorPayload(parsed, code);
    }

    return normalizeSuccessPayload(parsed, code);
  };

  const sendWrapped = (body) => {
    const wrapped = wrap(body);
    res.set("Content-Type", "application/json; charset=utf-8");
    return originalSend(JSON.stringify(wrapped));
  };

  res.json = sendWrapped;
  res.send = sendWrapped;

  next();
};
