"use strict";
const { TitheType } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { titheType } = res.locals;

  try {
    await titheType.destroy();

    res.send({
      status: 200,
      id: titheType.id,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
