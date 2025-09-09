const { GroupUsers } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { userId, groupId } = req.params;

  try {
    const assignedGroup = await GroupUsers.create({
      userId,
      groupId,
    });

    res.send({
      status: 200,
      group: assignedGroup,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
