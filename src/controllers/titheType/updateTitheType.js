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
  const { titheType: deltaTitheType } = req.body;

  try {
    
    titheType.set(deltaTitheType);

    await titheType.save();

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
