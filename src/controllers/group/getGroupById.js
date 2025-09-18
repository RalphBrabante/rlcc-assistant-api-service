"use strict";
const { Group, User } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const { user } = res.locals;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { id } = req.params;

  try {
    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: "groupMembers",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    if (!group) {
      return next({
        status: 404,
        message: "Group not found.",
      });
    }

    res.send({
      status: 200,
      group,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
