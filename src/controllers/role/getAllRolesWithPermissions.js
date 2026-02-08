"use strict";

const { Role, Permission } = require("../../models");

module.exports.validate = async (req, res, next) => {
  return next();
};

module.exports.invoke = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "name", "method", "resource"],
          through: { attributes: [] },
        },
      ],
      order: [
        ["name", "ASC"],
        [{ model: Permission, as: "permissions" }, "name", "ASC"],
      ],
    });

    res.send({
      status: 200,
      data: {
        roles,
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
