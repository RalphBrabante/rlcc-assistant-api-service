"use strict";
const { User, Tithe, TitheType } = require("../../models");
const tithetype = require("../../models/tithetype");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const { user } = res.locals;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { limit, page } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const tithes = await Tithe.findAndCountAll({
      limit: parseInt(limit),
      offset,
      order: [["id", "DESC"]],
      where: {
        isActive: true,
      },
      include: [
        {
          model: User,
          as: "encoder",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
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
