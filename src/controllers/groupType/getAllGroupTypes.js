"use strict";

const { GroupType } = require("../../models");

module.exports.validate = async (req, res, next) => next();

module.exports.invoke = async (req, res, next) => {
  try {
    const groupTypes = await GroupType.findAll({
      order: [["name", "ASC"]],
    });

    res.send({
      status: 200,
      groupTypes,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
