"use strict";

const { GroupTopicComment } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const { topic, user } = res.locals;
  const commentId = Number(req.params.commentId);

  if (!Number.isInteger(commentId) || commentId < 1) {
    return next({
      status: 400,
      message: "Invalid comment id.",
    });
  }

  try {
    const comment = await GroupTopicComment.findOne({
      where: {
        id: commentId,
        groupTopicId: topic.id,
        isActive: true,
      },
    });

    if (!comment) {
      return next({
        status: 404,
        message: "Comment not found.",
      });
    }

    if (Number(comment.createdBy) !== Number(user.id)) {
      return next({
        status: 403,
        message: "Forbidden. You can only delete your own comments.",
      });
    }

    const hasActiveReplies = await GroupTopicComment.count({
      where: {
        parentCommentId: comment.id,
        isActive: true,
      },
    });

    if (hasActiveReplies > 0) {
      return next({
        status: 400,
        message: "You cannot delete this comment because it already has replies.",
      });
    }

    res.locals.targetComment = comment;
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { targetComment } = res.locals;

  try {
    targetComment.isActive = false;
    await targetComment.save();

    res.send({
      status: 200,
      id: targetComment.id,
      deleted: true,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
