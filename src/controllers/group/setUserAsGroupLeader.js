const { GroupUsers } = require("../../models");
module.exports.validate = async (req, res, next) => {
  const { userId } = req.params;
  const { group } = res.locals;

  try {
    const isUserAssignedToGroup = await GroupUsers.findOne({
      where: { groupId: group.id, userId },
    });

    if (!isUserAssignedToGroup) {
      throw new Error("This user isn't assigned to this group yet.");
    }

    if (!group.leaderId) {
      if (group.leaderId === userId) {
        throw new Error("This user is already the leader of this group.");
      }
    } else {
      if (group.leaderId === userId) {
        throw new Error("You are already the leader of this group.");
      }

      if (group.leaderId) {
        throw new Error("This group already has its leader.");
      }
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
  const { userId } = req.params;
  const { group } = res.locals;

  try {
    group.set({
      leaderId: userId,
    });

    await group.save();

    res.sendStatus(204);
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
