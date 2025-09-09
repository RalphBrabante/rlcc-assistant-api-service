"use strict";
const { Group } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const { user } = res.locals;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { limit, page } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const tithes = await Group.findAndCountAll({
      limit: parseInt(limit),
      offset,
      where: {
        isActive: true,
      },
    });

    res.send({
      status: 200,
      tithes,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
