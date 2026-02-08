"use strict";
const { GroupMessage } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const message = req.body?.message || {};
  const content = typeof message.content === "string" ? message.content.trim() : "";
  const type = typeof message.type === "string" ? message.type.trim().toLowerCase() : "text";

  if (!content) {
    return next({
      status: 400,
      message: "Message content is required.",
    });
  }

  if (content.length > 5000) {
    return next({
      status: 400,
      message: "Message content must not exceed 5000 characters.",
    });
  }

  const allowedTypes = ["text"];
  if (!allowedTypes.includes(type)) {
    return next({
      status: 400,
      message: "Unsupported message type.",
    });
  }

  res.locals.newMessagePayload = {
    content,
    type,
  };
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { group, user, newMessagePayload } = res.locals;

  try {
    const message = await GroupMessage.create({
      groupId: group.id,
      senderId: user.id,
      content: newMessagePayload.content,
      type: newMessagePayload.type,
    });

    res.send({
      status: 201,
      data: {
        message,
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
