"use strict";
const { Group, GroupUsers, User } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const { user } = res.locals;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { id } = req.params;

  try {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const hasGlobalGroupAccess =
      roles.includes("SUPERUSER") || roles.includes("ADMINISTRATOR");

    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: "groupMembers",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    if (!group) {
      return next({
        status: 404,
        message: "Group not found.",
      });
    }

    if (!hasGlobalGroupAccess) {
      const membership = await GroupUsers.findOne({
        where: {
          groupId: group.id,
          userId: user?.id || 0,
        },
        attributes: ["id"],
      });

      if (!membership) {
        return next({
          status: 403,
          message: "Forbidden. You are not assigned to this group.",
        });
      }
    }

    res.send({
      status: 200,
      group,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
