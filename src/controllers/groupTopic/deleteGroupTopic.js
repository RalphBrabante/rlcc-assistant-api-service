"use strict";

module.exports.validate = async (req, res, next) => {
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { topic } = res.locals;

  try {
    topic.isActive = false;
    await topic.save();

    res.send({
      status: 200,
      id: topic.id,
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
