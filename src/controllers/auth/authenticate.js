"use strict";
const { User, Role, Permission } = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../../utils/jwtSecret");
const { getBooleanConfig } = require("../../utils/runtimeConfiguration");
const DUMMY_PASSWORD_HASH =
  "$2b$10$QgqdM9m5rxSLF9mfJLB3j.WSYIEr7g8xY8gPf4f9QWJfbVrIUQ8s2";

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

  res.locals.user = user;
  res.locals.password = credentials.password;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user, password } = res.locals;

  try {
    const comparedHash = user?.password || DUMMY_PASSWORD_HASH;
    const passwordMatched = await bcrypt.compare(password, comparedHash);

    if (!user || !passwordMatched) {
      return next({
        status: 401,
        message: "Invalid email or password.",
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
        getJwtSecret(),
        {
          expiresIn: "5 hours",
        }
      );
    })();

    //save token in database
    await user.createToken({ token });

    const safeUser = user.get({ plain: true });
    delete safeUser.password;

    res.send({
      status: 200,
      data: { user: safeUser, token },
    });

    next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
