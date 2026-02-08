"use strict";
const { GroupMessage, User } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const limit = Number(req.query.limit || 30);
  const page = Number(req.query.page || 1);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next({
      status: 400,
      message: "Limit must be an integer between 1 and 100.",
    });
  }

  if (!Number.isInteger(page) || page < 1) {
    return next({
      status: 400,
      message: "Page must be a positive integer.",
    });
  }

  res.locals.pagination = { limit, page };
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { group } = res.locals;
  const { limit, page } = res.locals.pagination;
  const offset = (page - 1) * limit;

  try {
    const messages = await GroupMessage.findAndCountAll({
      where: { groupId: group.id },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.send({
      status: 200,
      data: {
        groupId: group.id,
        messages,
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
