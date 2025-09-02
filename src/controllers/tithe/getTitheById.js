"use strict";
const { User, Tithe, TitheType } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const { user } = res.locals;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { id } = req.params;

  try {
    const tithe = await Tithe.findByPk(id, {
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

    const r = user.roles.includes("SUPERUSER");

    if (
      !user.roles.includes("SUPERUSER") &&
      !user.roles.includes("ADMINISTRATOR") &&
      !user.roles.includes("ACCOUNTANT")
    ) {
      if (user.id !== tithe.memberId) {
        return next({
          status: 403,
          message: "You are not allowed to view other member's tithe.",
        });
      }
    }

    if (!tithe) {
      return next({
        status: 404,
        message: "Tithe not found.",
      });
    }

    res.send({
      status: 200,
      tithe,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
