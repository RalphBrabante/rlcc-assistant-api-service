"use strict";

const bcrypt = require("bcrypt");
const e = require("express");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { user: deltaUser } = req.body;

  try {



    if (deltaUser.password) {
      deltaUser.password = await bcrypt.hash(deltaUser.password, 10);
    } else {
      delete deltaUser.password;
    }

    delete deltaUser.confirmPassword;
    user.set(deltaUser);

    await user.save();

    res.send({
      status: 200,
      id: user.id,
    });

    next();
  } catch (error) {
    return next({
      status: 520,
      message: error.message,
    });
  }
};
