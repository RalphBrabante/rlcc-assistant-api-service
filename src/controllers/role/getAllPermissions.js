"use strict";

const { Permission } = require("../../models");

module.exports.validate = async (req, res, next) => {
  return next();
};

module.exports.invoke = async (req, res, next) => {
  try {
    const permissions = await Permission.findAll({
      attributes: ["id", "name", "method", "resource"],
      order: [["name", "ASC"]],
    });

    res.send({
      status: 200,
      data: {
        permissions,
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
