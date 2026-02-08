"use strict";

const { Role } = require("../../models");

module.exports.validate = async (req, res, next) => {
  return next();
};

module.exports.invoke = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
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
