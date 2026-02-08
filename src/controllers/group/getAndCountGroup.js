"use strict";
const { Group, GroupUsers, Sequelize } = require("../../models");
const { Op } = Sequelize;

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const { user } = res.locals;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { limit, page } = req.query;

  const parsedLimit = Number.parseInt(limit, 10) || 10;
  const parsedPage = Number.parseInt(page, 10) || 1;
  const offset = (parsedPage - 1) * parsedLimit;

  try {
    const permissionSet =
      user?.permissionSet instanceof Set
        ? user.permissionSet
        : new Set(Array.isArray(user?.permissions) ? user.permissions : []);
    const hasGlobalGroupAccess = permissionSet.has("get_all_group");

    const where = { isActive: true };
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

    const groups = await Group.findAndCountAll({
      limit: parsedLimit,
      offset,
      where,
    });

    res.send({
      status: 200,
      groups,
    });

    next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
