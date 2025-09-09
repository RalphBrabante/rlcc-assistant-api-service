"use strict";
const jwt = require("jsonwebtoken");
const { Token } = require("../models");
module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const dbToken = await Token.findOne({
    where: {
      token,
    },
  });

  if (!dbToken) {
    return next({ status: 401, message: "Access token invalid." });
  }
  jwt.verify(token, "secretKey", (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user payload to request object
    res.locals.user = {
      id: user.id,
      name: user.name,
      permissions: user.permissions,
      roles: user.roles,
    };
    next();
  });
};
