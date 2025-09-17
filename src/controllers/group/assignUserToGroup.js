const { GroupUsers } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {

  const { data } = req.body;

  try {
    const assignedGroup = await GroupUsers.bulkCreate(data, {
      validate: true,
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
