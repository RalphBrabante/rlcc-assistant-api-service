"use strict";
const { Token } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next({
      status: 400,
      message: "Token is required.",
    });
  }

  res.locals.token = token;
  next();
};

module.exports.invoke = async (req, res, next) => {

  const { token } = res.locals

  try {
    await Token.destroy({
      where: {
        token,
      },
    });

    res.send({
      status: 201,
    });

    next();
  } catch (error) {
    await Token.destroy({ where: { token } });

    return next({
      status: 404,
      message: error.message,
    });
  }
};
