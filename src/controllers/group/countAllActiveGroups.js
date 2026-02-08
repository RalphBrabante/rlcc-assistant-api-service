const { Group, GroupUsers, Sequelize } = require("../../models");
const { Op } = Sequelize;

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const permissionSet =
    user?.permissionSet instanceof Set
      ? user.permissionSet
      : new Set(Array.isArray(user?.permissions) ? user.permissions : []);
  const hasGlobalGroupAccess = permissionSet.has("get_all_group");

  const where = {
    isActive: true,
  };

  if (!hasGlobalGroupAccess) {
    const memberships = await GroupUsers.findAll({
      where: { userId: user?.id || 0 },
      attributes: ["groupId"],
    });
    const memberGroupIds = memberships.map((membership) => membership.groupId);

    where[Op.or] = [
      { userId: user?.id || 0 },
      { leaderId: user?.id || 0 },
      { id: { [Op.in]: memberGroupIds.length ? memberGroupIds : [0] } },
    ];
  }

  const circles = await Group.findAndCountAll({
    where,
    attributes: ["id", "name"],
  });

  res.send({
    status: 200,
    count: circles.count,
  });

  next();
};
