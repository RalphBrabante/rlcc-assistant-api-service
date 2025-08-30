const { User, Tithe, TitheType } = require("../../models");
const tithetype = require("../../models/tithetype");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  try {
    const tithes = await Tithe.findAndCountAll();

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
