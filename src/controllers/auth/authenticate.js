"use strict";
const { User, Sequelize, Role, Permission } = require("../../models");
const { Op } = Sequelize;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getBooleanConfig } = require("../../utils/runtimeConfiguration");

module.exports.validate = async (req, res, next) => {
  const { credentials } = req.body;

  if (!credentials) {
    return next({
      status: 400,
      message: "Credentials is required.",
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
      emailAddress: credentials.emailAddress,
    },
    attributes: ["id", "emailAddress", "firstName", "lastName", "password"],
    include: {
      model: Role,
      as: "roles",
      attributes: ["id", "name"],
      through: { attributes: [] },
      include: {
        model: Permission,
        as: "permissions",
        attributes: ["id", "method"],
        through: { attributes: [] },
      },
    },
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

    let rolesActions = [];
    let roles = [];

    for (let role of user.roles) {
      roles.push(role.name);
      for (let perm of role.permissions) {
        if (!rolesActions.includes(perm.method)) {
          rolesActions.push(perm.method);
        }
      }
    }

    const maintenanceModeEnabled = await getBooleanConfig("maintenance_mode", false);
    if (maintenanceModeEnabled) {
      return next({
        status: 503,
        message: "Maintenance mode is active. Logins are temporarily disabled.",
      });
    }

    await (async () => {
      token = jwt.sign(
        {
          id: user.id,
          name: user.firstName + " " + user.lastName,
          permissions: rolesActions,
          roles,
        },
        "secretKey",
        {
          expiresIn: "5 hours",
        }
      );
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
