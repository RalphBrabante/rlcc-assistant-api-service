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

  try {
    if (group.userId === user.id || group.leaderId === user.id) {
      return next();
    }

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
        message: "Forbidden. You are not assigned to this group.",
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
