const { Group } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { group } = req.body;

  const { user } = res.locals;

  try {
    const newGroup = await Group.create({
      name: group.name,
      userId: user.id,
    });

    res.send({
      status: 200,
      group: newGroup,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
