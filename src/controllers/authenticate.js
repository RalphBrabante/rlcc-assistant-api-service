"use strict";
const { User, Sequelize } = require("../../models");
const { Op } = Sequelize;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.validate = async (req, res, next) => {
  const { credentials } = req.body;

  if (!credentials) {
    return next({
      status: 400,
      message: "Credentials is required.",
    });
  }

  if (!credentials.username) {
    return next({
      status: 400,
      message: "Username or email is required",
    });
  }

  if (!credentials.password) {
    return next({
      status: 400,
      message: "Password is required",
    });
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username: credentials.username },
        { emailAddress: credentials.username },
      ],
    },
    attributes: ["id", "username", "password"],
  });

  if (!user) {
    return next({
      status: 404,
      message: "User not found.",
    });
  }

  res.locals.user = user;
  res.locals.password = credentials.password;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user, password } = res.locals;

  try {
    //check if password is the same as db password

    const passwordMatched = await bcrypt.compare(password, user.password);

    //check if password is valid
    if (!passwordMatched) {
      return next({
        status: 404,
        message: "Invalid Password",
      });
    }

    //create token
    let token;

    await (async () => {
      token = jwt.sign({ user }, "secretKey", { expiresIn: "1 hour" });
    })();

    //save token in database
    await user.createToken({ token });

    res.send({
      status: 200,
      data: { user, token },
    });

    next();
  } catch (error) {
    return next({
      status: 404,
      message: error.message,
    });
  }
};