"use strict";

const { GroupUsers } = require("../models");

module.exports = async (req, res, next) => {
  const { user, group } = res.locals;

  if (!user || !group) {
    return next({
      status: 401,
      message: "Unauthorized.",
    });
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const isPrivileged = roles.includes("SUPERUSER") || roles.includes("ADMINISTRATOR");

  if (isPrivileged) {
    return next();
  }

  try {
    const membership = await GroupUsers.findOne({
      where: {
        groupId: group.id,
        userId: user.id,
      },
      attributes: ["id"],
    });

    if (!membership) {
      return next({
        status: 403,
        message:
          "Forbidden. Only circle members, administrators, or superusers can comment on topics.",
      });
    }

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
