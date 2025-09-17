"use strict";
const { User, Group, Sequelize } = require("../../models");
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
  const { keyword } = req.query;

  try {
    const users = await User.findAll({
      include: [
        {
          model: Group,
          as: "assignedGroup",
          through: { attributes: [] }, // hide join table columns
          required: false, // LEFT JOIN instead of INNER
        },
      ],
      where: {
        "$assignedGroup.id$": null, // no linked group
        name: {
          [Op.like]: `%${keyword}%`, // match members with "john" in their name
        },
      },
    });

    res.send({
      status: 200,
      users,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
