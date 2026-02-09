"use strict";

const jwt = require("jsonwebtoken");
const { Token, Group, GroupUsers } = require("../models");
const { getJwtSecret } = require("../utils/jwtSecret");

const JWT_SECRET = getJwtSecret();

function getTokenFromSocket(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return authToken;

  const header = socket.handshake?.headers?.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() === "bearer" && token) return token;

  return null;
}

async function hasGroupAccess(user, groupId) {
  if (!user?.id || !groupId) return false;

  const group = await Group.findByPk(groupId, {
    attributes: ["id", "userId", "leaderId"],
  });
  if (!group) return false;

  if (group.userId === user.id || group.leaderId === user.id) {
    return true;
  }

  const membership = await GroupUsers.findOne({
    where: { groupId, userId: user.id },
    attributes: ["id"],
  });

  return Boolean(membership);
}

function setupGroupChatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);
      if (!token) return next(new Error("Unauthorized"));

      const dbToken = await Token.findOne({
        where: { token },
        attributes: ["id"],
      });
      if (!dbToken) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = {
        id: decoded.id,
        name: decoded.name,
        permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
      };

      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);
    const eventBuckets = new Map();

    function isEventRateLimited(eventName, windowMs = 10_000, max = 15) {
      const now = Date.now();
      const bucket = eventBuckets.get(eventName);
      if (!bucket || now - bucket.windowStart >= windowMs) {
        eventBuckets.set(eventName, { windowStart: now, count: 1 });
        return false;
      }

      bucket.count += 1;
      return bucket.count > max;
    }

    socket.on("join-group-chat", async ({ groupId }, callback) => {
      try {
        if (isEventRateLimited("join-group-chat")) {
          callback?.({ ok: false, message: "Too many requests." });
          return;
        }

        const normalizedGroupId = Number(groupId);
        if (!Number.isInteger(normalizedGroupId) || normalizedGroupId < 1) {
          callback?.({ ok: false, message: "Invalid group id." });
          return;
        }

        const allowed = await hasGroupAccess(socket.user, normalizedGroupId);
        if (!allowed) {
          callback?.({ ok: false, message: "Forbidden." });
          return;
        }

        await socket.join(`group-chat:${normalizedGroupId}`);
        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: "Unable to join chat room." });
      }
    });

    socket.on("leave-group-chat", async ({ groupId }) => {
      if (isEventRateLimited("leave-group-chat")) return;
      const normalizedGroupId = Number(groupId);
      if (!Number.isInteger(normalizedGroupId) || normalizedGroupId < 1) return;
      await socket.leave(`group-chat:${normalizedGroupId}`);
    });
  });
}

module.exports = {
  setupGroupChatSocket,
};
