"use strict";
const { Group, GroupType, GroupUsers, User, Sequelize } = require("../../models");
const { Op } = Sequelize;

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const limit = Number.parseInt(String(req.query?.limit || "10"), 10);
  const page = Number.parseInt(String(req.query?.page || "1"), 10);
  const name = String(req.query?.name || "").trim();
  const status = String(req.query?.status || "active").trim().toLowerCase();
  const encodedBy = String(req.query?.encodedBy || "").trim();
  const createdFrom = String(req.query?.createdFrom || "").trim();
  const createdTo = String(req.query?.createdTo || "").trim();

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next({
      status: 400,
      message: "limit must be an integer between 1 and 100.",
    });
  }

  if (!Number.isInteger(page) || page < 1) {
    return next({
      status: 400,
      message: "page must be a positive integer.",
    });
  }

  if (name.length > 120) {
    return next({
      status: 400,
      message: "name filter must be 120 characters or fewer.",
    });
  }

  if (encodedBy.length > 120) {
    return next({
      status: 400,
      message: "encodedBy filter must be 120 characters or fewer.",
    });
  }

  if (!["all", "active", "inactive"].includes(status)) {
    return next({
      status: 400,
      message: "status must be one of: all, active, inactive.",
    });
  }

  const parsedCreatedFrom = createdFrom ? new Date(createdFrom) : null;
  const parsedCreatedTo = createdTo ? new Date(createdTo) : null;

  if (createdFrom && Number.isNaN(parsedCreatedFrom?.getTime())) {
    return next({
      status: 400,
      message: "createdFrom must be a valid date.",
    });
  }

  if (createdTo && Number.isNaN(parsedCreatedTo?.getTime())) {
    return next({
      status: 400,
      message: "createdTo must be a valid date.",
    });
  }

  if (parsedCreatedFrom && parsedCreatedTo && parsedCreatedFrom > parsedCreatedTo) {
    return next({
      status: 400,
      message: "createdFrom must be on or before createdTo.",
    });
  }

  if (parsedCreatedTo) {
    parsedCreatedTo.setHours(23, 59, 59, 999);
  }

  res.locals.filters = {
    limit,
    page,
    name,
    status,
    encodedBy,
    createdFrom: parsedCreatedFrom,
    createdTo: parsedCreatedTo,
  };

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { limit, page, name, status, encodedBy, createdFrom, createdTo } = res.locals.filters;
  const offset = (page - 1) * limit;

  try {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const hasGlobalGroupAccess =
      roles.includes("SUPERUSER") || roles.includes("ADMINISTRATOR");

    const where = {};
    const andConditions = [];

    if (status === "active") {
      andConditions.push({ isActive: true });
    } else if (status === "inactive") {
      andConditions.push({ isActive: false });
    }

    if (name) {
      const parsedId = Number.parseInt(name, 10);
      const nameOrConditions = [{ name: { [Op.like]: `%${name}%` } }];
      if (Number.isInteger(parsedId) && parsedId > 0) {
        nameOrConditions.push({ id: parsedId });
      }
      andConditions.push({ [Op.or]: nameOrConditions });
    }

    if (createdFrom || createdTo) {
      const createdAtRange = {};
      if (createdFrom) {
        createdAtRange[Op.gte] = createdFrom;
      }
      if (createdTo) {
        createdAtRange[Op.lte] = createdTo;
      }
      andConditions.push({ createdAt: createdAtRange });
    }

    if (andConditions.length) {
      where[Op.and] = andConditions;
    }

    if (!hasGlobalGroupAccess) {
      const memberships = await GroupUsers.findAll({
        where: { userId: user?.id || 0 },
        attributes: ["groupId"],
      });
      const memberGroupIds = memberships.map((membership) => membership.groupId);

      const membershipAccess = {
        id: { [Op.in]: memberGroupIds.length ? memberGroupIds : [0] },
      };

      if (!where[Op.and]) {
        where[Op.and] = [];
      }
      where[Op.and].push(membershipAccess);
    }

    let creatorWhere;
    if (encodedBy) {
      const parsedCreatorId = Number.parseInt(encodedBy, 10);
      const creatorOrConditions = [
        { firstName: { [Op.like]: `%${encodedBy}%` } },
        { lastName: { [Op.like]: `%${encodedBy}%` } },
        { emailAddress: { [Op.like]: `%${encodedBy}%` } },
        Sequelize.where(
          Sequelize.fn(
            "concat",
            Sequelize.col("creator.firstName"),
            " ",
            Sequelize.col("creator.lastName")
          ),
          { [Op.like]: `%${encodedBy}%` }
        ),
      ];
      if (Number.isInteger(parsedCreatorId) && parsedCreatorId > 0) {
        creatorOrConditions.push({ id: parsedCreatorId });
      }
      creatorWhere = { [Op.or]: creatorOrConditions };
    }

    const groups = await Group.findAndCountAll({
      limit,
      offset,
      where,
      distinct: true,
      subQuery: false,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
          where: creatorWhere,
          required: Boolean(creatorWhere),
        },
        {
          model: GroupType,
          as: "groupType",
          attributes: ["id", "name"],
          required: false,
        },
      ],
      order: [["id", "DESC"]],
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
