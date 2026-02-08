"use strict";

const { GroupTopic, User } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const title = String(req.body?.topic?.title || "").trim();
  const descriptionRaw = req.body?.topic?.description;
  const description = descriptionRaw == null ? null : String(descriptionRaw).trim();

  if (!title) {
    return next({
      status: 400,
      message: "Topic title is required.",
    });
  }

  if (title.length > 120) {
    return next({
      status: 400,
      message: "Topic title must be 120 characters or fewer.",
    });
  }

  if (description && description.length > 2000) {
    return next({
      status: 400,
      message: "Topic description must be 2000 characters or fewer.",
    });
  }

  res.locals.topicPayload = {
    title,
    description: description || null,
  };

  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { group, user, topicPayload } = res.locals;

  try {
    const topic = await GroupTopic.create({
      groupId: group.id,
      createdBy: user.id,
      title: topicPayload.title,
      description: topicPayload.description,
      isActive: true,
    });

    const loadedTopic = await GroupTopic.findByPk(topic.id, {
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
      topic: loadedTopic,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
