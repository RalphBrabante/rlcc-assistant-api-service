"use strict";
const { User, Tithe, TitheType, Sequelize } = require("../../models");
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
  const dateReceivedFrom = String(req.query?.dateReceivedFrom || "").trim();
  const dateReceivedTo = String(req.query?.dateReceivedTo || "").trim();

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
  const parsedDateReceivedFrom = dateReceivedFrom ? new Date(dateReceivedFrom) : null;
  const parsedDateReceivedTo = dateReceivedTo ? new Date(dateReceivedTo) : null;

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

  if (dateReceivedFrom && Number.isNaN(parsedDateReceivedFrom?.getTime())) {
    return next({
      status: 400,
      message: "dateReceivedFrom must be a valid date.",
    });
  }

  if (dateReceivedTo && Number.isNaN(parsedDateReceivedTo?.getTime())) {
    return next({
      status: 400,
      message: "dateReceivedTo must be a valid date.",
    });
  }

  if (
    parsedDateReceivedFrom &&
    parsedDateReceivedTo &&
    parsedDateReceivedFrom > parsedDateReceivedTo
  ) {
    return next({
      status: 400,
      message: "dateReceivedFrom must be on or before dateReceivedTo.",
    });
  }

  if (parsedDateReceivedTo) {
    parsedDateReceivedTo.setHours(23, 59, 59, 999);
  }

  res.locals.filters = {
    limit,
    page,
    name,
    status,
    encodedBy,
    createdFrom: parsedCreatedFrom,
    createdTo: parsedCreatedTo,
    dateReceivedFrom: parsedDateReceivedFrom,
    dateReceivedTo: parsedDateReceivedTo,
  };

  next();
};

module.exports.invoke = async (req, res, next) => {
  const {
    limit,
    page,
    name,
    status,
    encodedBy,
    createdFrom,
    createdTo,
    dateReceivedFrom,
    dateReceivedTo,
  } = res.locals.filters;
  const offset = (page - 1) * limit;

  try {
    const where = {};
    const andConditions = [];

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (name) {
      const parsedId = Number.parseInt(name, 10);
      const nameOrConditions = [
        Sequelize.where(
          Sequelize.fn(
            "concat",
            Sequelize.col("giver.firstName"),
            " ",
            Sequelize.col("giver.lastName")
          ),
          { [Op.like]: `%${name}%` }
        ),
        { "$giver.firstName$": { [Op.like]: `%${name}%` } },
        { "$giver.lastName$": { [Op.like]: `%${name}%` } },
        { "$giver.emailAddress$": { [Op.like]: `%${name}%` } },
        { "$titheType.name$": { [Op.like]: `%${name}%` } },
      ];

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

    if (dateReceivedFrom || dateReceivedTo) {
      const dateReceivedRange = {};
      if (dateReceivedFrom) {
        dateReceivedRange[Op.gte] = dateReceivedFrom;
      }
      if (dateReceivedTo) {
        dateReceivedRange[Op.lte] = dateReceivedTo;
      }
      andConditions.push({ dateReceived: dateReceivedRange });
    }

    if (andConditions.length) {
      where[Op.and] = andConditions;
    }

    let encoderWhere;
    if (encodedBy) {
      const parsedEncoderId = Number.parseInt(encodedBy, 10);
      const encoderOrConditions = [
        { firstName: { [Op.like]: `%${encodedBy}%` } },
        { lastName: { [Op.like]: `%${encodedBy}%` } },
        { emailAddress: { [Op.like]: `%${encodedBy}%` } },
        Sequelize.where(
          Sequelize.fn(
            "concat",
            Sequelize.col("encoder.firstName"),
            " ",
            Sequelize.col("encoder.lastName")
          ),
          { [Op.like]: `%${encodedBy}%` }
        ),
      ];
      if (Number.isInteger(parsedEncoderId) && parsedEncoderId > 0) {
        encoderOrConditions.push({ id: parsedEncoderId });
      }
      encoderWhere = { [Op.or]: encoderOrConditions };
    }

    const tithes = await Tithe.findAndCountAll({
      limit,
      offset,
      order: [["id", "DESC"]],
      where,
      distinct: true,
      subQuery: false,
      include: [
        {
          model: User,
          as: "encoder",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
          where: encoderWhere,
          required: Boolean(encoderWhere),
        },
        {
          model: User,
          as: "giver",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
        {
          model: TitheType,
          as: "titheType",
          attributes: ["id", "name"],
        },
      ],
    });

    res.send({
      status: 200,
      tithes,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
