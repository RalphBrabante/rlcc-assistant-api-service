const { GroupUsers } = require("../../models");
module.exports.validate = async (req, res, next) => {
  const { userId } = req.params;
  const { group } = res.locals;
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId) || parsedUserId < 1) {
    return next({
      status: 400,
      message: "Invalid userId parameter.",
    });
  }

  try {
    const isUserAssignedToGroup = await GroupUsers.findOne({
      where: { groupId: group.id, userId: parsedUserId },
      attributes: ["id"],
    });

    if (!isUserAssignedToGroup) {
      return next({
        status: 403,
        message: "This user isn't assigned to this group yet.",
      });
    }

    if (group.leaderId === parsedUserId) {
      return next({
        status: 409,
        message: "This user is already the administrator of this group.",
      });
    }

    res.locals.targetLeaderId = parsedUserId;
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { group } = res.locals;
  const { targetLeaderId } = res.locals;

  try {
    group.set({
      leaderId: targetLeaderId,
    });

    await group.save();

    res.send({
      status: 200,
      data: {
        id: group.id,
        leaderId: group.leaderId,
      },
    });
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
