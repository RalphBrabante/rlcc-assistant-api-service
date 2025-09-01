"use strict";
const { TitheType } = require("../../models");

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
    const titheTypes = await TitheType.findAndCountAll({
      where: {
        isActive: true,
      },
      //   limit: parseInt(limit),
      //   offset,
    });

    res.send({
      status: 200,
      titheTypes,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
