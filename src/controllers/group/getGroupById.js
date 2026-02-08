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
    const permissionSet =
      user?.permissionSet instanceof Set
        ? user.permissionSet
        : new Set(Array.isArray(user?.permissions) ? user.permissions : []);
    const hasGlobalGroupAccess =
      permissionSet.has("read_all_groups") || permissionSet.has("get_all_group");

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
      const isOwnerOrLeader = group.userId === user?.id || group.leaderId === user?.id;
      const membership = await GroupUsers.findOne({
        where: {
          groupId: group.id,
          userId: user?.id || 0,
        },
        attributes: ["id"],
      });

      if (!isOwnerOrLeader && !membership) {
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
