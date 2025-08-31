"use strict";
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token,'secretKey', (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user payload to request object
    res.locals.user = {id:user.id, permissions:user.permissions};
    next();
  });

};