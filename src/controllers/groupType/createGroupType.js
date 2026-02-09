"use strict";

const { GroupType } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const name = String(req.body?.groupType?.name || "").trim();

  if (!name) {
    return next({
      status: 400,
      message: "Circle type name is required.",
    });
  }

  if (name.length > 120) {
    return next({
      status: 400,
      message: "Circle type name must be 120 characters or fewer.",
    });
  }

  try {
    const existing = await GroupType.findOne({
      where: { name },
      attributes: ["id"],
    });

    if (existing) {
      return next({
        status: 400,
        message: "Circle type already exists.",
      });
    }

    res.locals.groupTypePayload = { name };
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { groupTypePayload } = res.locals;

  try {
    const groupType = await GroupType.create(groupTypePayload);

    res.send({
      status: 200,
      groupType,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
