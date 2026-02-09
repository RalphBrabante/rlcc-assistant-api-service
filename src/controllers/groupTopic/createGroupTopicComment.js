"use strict";

const { GroupTopicComment, User } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const comment = String(req.body?.topicComment?.comment || "").trim();

  if (!comment) {
    return next({
      status: 400,
      message: "Comment is required.",
    });
  }

  if (comment.length > 1000) {
    return next({
      status: 400,
      message: "Comment must be 1000 characters or fewer.",
    });
  }

  res.locals.topicCommentPayload = { comment };
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { topic, user, topicCommentPayload } = res.locals;

  try {
    const comment = await GroupTopicComment.create({
      groupTopicId: topic.id,
      createdBy: user.id,
      comment: topicCommentPayload.comment,
      parentCommentId: null,
      isActive: true,
    });

    const loadedComment = await GroupTopicComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
      ],
    });

    res.send({
      status: 200,
      topicComment: loadedComment,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
