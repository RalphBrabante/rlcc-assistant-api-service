"use strict";
const { TitheType } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { titheType } = req.body;

  try {
    const newTitheType = await TitheType.create(titheType);

    res.send({
      status: 200,
      newTitheType,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
