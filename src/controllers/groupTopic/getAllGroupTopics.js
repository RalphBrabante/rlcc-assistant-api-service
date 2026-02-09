"use strict";

const { GroupTopic, Group, GroupTopicComment, User } = require("../../models");

module.exports.validate = async (req, res, next) => {
  return next();
};

module.exports.invoke = async (req, res, next) => {
  try {
    const topics = await GroupTopic.findAll({
      where: { isActive: true },
      include: [
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "leaderId"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
        {
          model: GroupTopicComment,
          as: "comments",
          where: { isActive: true, parentCommentId: null },
          required: false,
          separate: true,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "creator",
              attributes: ["id", "firstName", "lastName", "avatar"],
            },
            {
              model: GroupTopicComment,
              as: "replies",
              where: { isActive: true },
              required: false,
              separate: true,
              order: [["createdAt", "DESC"]],
              include: [
                {
                  model: User,
                  as: "creator",
                  attributes: ["id", "firstName", "lastName", "avatar"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.send({
      status: 200,
      topics,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
