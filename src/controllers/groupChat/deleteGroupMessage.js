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
  const { groupMessage, group } = res.locals;

  try {
    const deletedId = groupMessage.id;
    await groupMessage.destroy();

    const io = req.app.get("io");
    io?.to(`group-chat:${group.id}`).emit("group-chat:message-deleted", {
      groupId: group.id,
      messageId: deletedId,
    });

    res.send({
      status: 200,
      data: {
        id: deletedId,
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
