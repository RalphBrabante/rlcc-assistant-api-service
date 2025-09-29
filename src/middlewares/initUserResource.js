const { User } = require("../models");
module.exports = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return next({
        status: 404,
        message: "Tithe not found.",
      });
    }

    res.locals.user = user;

    next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
