const { User, Tithe, TitheType } = require("../../models");
const tithetype = require("../../models/tithetype");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { tithe: deltaTithe } = req.body;
  const { tithe } = res.locals;

  try {
    
    tithe.set(deltaTithe);

    await tithe.save();

    res.send({
      status: 200,
      id: tithe,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
