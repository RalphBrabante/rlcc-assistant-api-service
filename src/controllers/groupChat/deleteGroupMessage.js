"use strict";
const { GroupMessage } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const { group, user } = res.locals;
  const messageId = Number(req.params.messageId);

  if (!Number.isInteger(messageId) || messageId < 1) {
    return next({
      status: 400,
      message: "Invalid message id.",
    });
  }

  try {
    const message = await GroupMessage.findOne({
      where: {
        id: messageId,
        groupId: group.id,
      },
    });

    if (!message) {
      return next({
        status: 404,
        message: "Message not found.",
      });
    }

    const canModerate =
      Array.isArray(user.permissions) &&
      (user.permissions.includes("read_all_groups") ||
        user.permissions.includes("update_group") ||
        user.permissions.includes("delete_group"));

    if (message.senderId !== user.id && !canModerate) {
      return next({
        status: 403,
        message: "Forbidden. You can only delete your own messages.",
      });
    }

    res.locals.groupMessage = message;
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { groupMessage } = res.locals;

  try {
    await groupMessage.destroy();

    res.send({
      status: 200,
      data: {
        id: groupMessage.id,
        deleted: true,
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
