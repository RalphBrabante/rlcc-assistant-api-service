"use strict";
const { GroupUsers } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const { group, user, authUser } = res.locals;
  const { userId } = req.params;
  const parsedUserId = Number(userId);
  const actorId = Number(authUser?.id || user?.id || 0);

  if (!Number.isInteger(parsedUserId) || parsedUserId < 1) {
    return next({
      status: 400,
      message: "Invalid userId parameter.",
    });
  }

  if (actorId === parsedUserId) {
    return next({
      status: 403,
      message: "You cannot remove yourself from this circle.",
    });
  }

  try {
    const membership = await GroupUsers.findOne({
      where: {
        groupId: group.id,
        userId: parsedUserId,
      },
    });

    if (!membership) {
      return next({
        status: 404,
        message: "User is not assigned to this group.",
      });
    }

    res.locals.groupMembership = membership;
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { group } = res.locals;
  const { userId } = req.params;

  try {
    await GroupUsers.destroy({
      where: {
        groupId: group.id,
        userId,
      },
    });

    if (group.leaderId === Number(userId)) {
      group.set({ leaderId: null });
      await group.save();
    }

    res.send({
      status: 200,
      data: {
        groupId: group.id,
        userId: Number(userId),
        removed: true,
      },
    });
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
