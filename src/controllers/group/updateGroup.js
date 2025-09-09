const { Group } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { group: deltaGroup } = req.body;
  const { group } = res.locals;

  try {
    group.set(deltaGroup);

    await group.save();

    res.send({
      status: 200,
      id: group,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
