const { GroupUsers } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const { group, user } = res.locals;

  // check if the user is already assigned

  try {
    const groupOfUser = await GroupUsers.findOne({
      where: { userId: user.id, groupId: group.id },
    });

    if (groupOfUser) {
      return next({
        status: 401,
        message: "This user is already a member of this group.",
      });
    }

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { user, group } = res.locals;

  try {
    const assignedGroup = await GroupUsers.create({
      userId: user.id,
      groupId: group.id,
    });

    res.send({
      status: 200,
      groupId: group.id
    });
  } catch (error) {
    return next({
      status: 520,
      message: error.message,
    });
  }
};
