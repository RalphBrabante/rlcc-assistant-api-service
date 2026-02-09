"use strict";
const jwt = require("jsonwebtoken");
const { Token } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

function extractBearerToken(authorization = "") {
  const [scheme, value] = authorization.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !value) return null;
  return value;
}

module.exports = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next({ status: 401, message: "Access token required." });
    }

    const dbToken = await Token.findOne({
      where: { token },
      attributes: ["id"],
    });

    if (!dbToken) {
      return next({ status: 401, message: "Access token invalid." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const permissions = Array.isArray(decoded.permissions)
      ? [...new Set(decoded.permissions)]
      : [];
    const roles = Array.isArray(decoded.roles) ? [...new Set(decoded.roles)] : [];

    res.locals.user = {
      id: decoded.id,
      name: decoded.name,
      permissions,
      permissionSet: new Set(permissions),
      roles,
    };
    res.locals.authUser = res.locals.user;
    res.locals.authToken = token;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next({ status: 401, message: "Token expired." });
    }

    if (error.name === "JsonWebTokenError") {
      return next({ status: 401, message: "Invalid token." });
    }

    return next(error);
  }
};
