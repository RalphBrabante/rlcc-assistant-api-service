"use strict";

const { GroupTopic } = require("../models");

module.exports = async (req, res, next) => {
  const topicId = Number(req.params.topicId);
  const groupId = Number(req.params.id);

  if (!Number.isInteger(topicId) || topicId < 1) {
    return next({
      status: 400,
      message: "Invalid topic id.",
    });
  }

  try {
    const topic = await GroupTopic.findByPk(topicId);

    if (!topic || !topic.isActive) {
      return next({
        status: 404,
        message: "Topic not found.",
      });
    }

    if (Number(topic.groupId) !== groupId) {
      return next({
        status: 400,
        message: "Topic does not belong to this circle.",
      });
    }

    res.locals.topic = topic;
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
