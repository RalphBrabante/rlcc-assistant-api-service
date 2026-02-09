"use strict";

const { GroupTopicComment, User } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const { topic } = res.locals;
  const commentId = Number(req.params.commentId);
  const comment = String(req.body?.topicComment?.comment || "").trim();

  if (!Number.isInteger(commentId) || commentId < 1) {
    return next({
      status: 400,
      message: "Invalid comment id.",
    });
  }

  if (!comment) {
    return next({
      status: 400,
      message: "Reply is required.",
    });
  }

  if (comment.length > 1000) {
    return next({
      status: 400,
      message: "Reply must be 1000 characters or fewer.",
    });
  }

  try {
    const parentComment = await GroupTopicComment.findOne({
      where: {
        id: commentId,
        groupTopicId: topic.id,
        isActive: true,
      },
      attributes: ["id", "groupTopicId"],
    });

    if (!parentComment) {
      return next({
        status: 404,
        message: "Comment not found.",
      });
    }

    res.locals.replyPayload = {
      comment,
      parentCommentId: commentId,
    };

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { topic, user, replyPayload } = res.locals;

  try {
    const reply = await GroupTopicComment.create({
      groupTopicId: topic.id,
      createdBy: user.id,
      comment: replyPayload.comment,
      parentCommentId: replyPayload.parentCommentId,
      isActive: true,
    });

    const loadedReply = await GroupTopicComment.findByPk(reply.id, {
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
      topicComment: loadedReply,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
