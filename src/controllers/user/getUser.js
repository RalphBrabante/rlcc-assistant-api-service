const e = require("express");
const { User, Role, Permission } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const { id } = req.params;
  const { user: loggedInUser } = res.locals;

  try {
    const user = await User.findByPk(id, {
      include: {
        model: Role,
        attributes: ["id", "name"],
        as: "roles",
        through: { attributes: [] },
        include: {
          model: Permission,
          as: "permissions",
          attributes: ["id", "method"],
          through: { attributes: [] },
        },
      },
    });

    if (user.id === loggedInUser.id) {
      res.locals.user = user;
    } else {
      next({
        status: 401,
        message: "You are not allowed to load other people's resources.",
      });
    }

    next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;

  res.send({
    status: 200,
    data: user,
  });

  next();
};
