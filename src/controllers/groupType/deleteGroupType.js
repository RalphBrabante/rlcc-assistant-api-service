"use strict";

const { Group, GroupType } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return next({
      status: 400,
      message: "Invalid circle type id.",
    });
  }

  try {
    const groupType = await GroupType.findByPk(id);
    if (!groupType) {
      return next({
        status: 404,
        message: "Circle type not found.",
      });
    }

    const usedCount = await Group.count({ where: { groupTypeId: id, isActive: true } });
    if (usedCount > 0) {
      return next({
        status: 400,
        message: "Cannot delete a circle type that is currently used by active circles.",
      });
    }

    res.locals.groupType = groupType;
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { groupType } = res.locals;

  try {
    await groupType.destroy();

    res.send({
      status: 200,
      id: groupType.id,
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
