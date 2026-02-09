"use strict";

const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const { Permission, Role, Token, User } = require("../models");
const { getJwtSecret } = require("./jwtSecret");

const JWT_SECRET = getJwtSecret();

async function loadUserWithClaims(userId) {
  return User.findByPk(userId, {
    attributes: ["id", "firstName", "lastName"],
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["id", "name"],
        through: { attributes: [] },
        include: [
          {
            model: Permission,
            as: "permissions",
            attributes: ["id", "method"],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });
}

function buildClaims(user) {
  const permissions = [];
  const roles = [];

  for (const role of user.roles || []) {
    roles.push(role.name);
    for (const permission of role.permissions || []) {
      if (!permissions.includes(permission.method)) {
        permissions.push(permission.method);
      }
    }
  }

  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    permissions,
    roles,
  };
}

async function rotateUserToken(userId, options = {}) {
  const { io, reason = "claims_updated" } = options;
  const user = await loadUserWithClaims(userId);
  if (!user) {
    return null;
  }

  const token = jwt.sign(buildClaims(user), JWT_SECRET, {
    expiresIn: "5 hours",
    jwtid: randomUUID(),
  });

  await Token.destroy({ where: { userId } });
  await Token.create({ userId, token });

  if (io) {
    io.to(`user:${userId}`).emit("auth:token-updated", {
      token,
      userId,
      reason,
    });
  }

  return token;
}

module.exports = {
  rotateUserToken,
  loadUserWithClaims,
};
