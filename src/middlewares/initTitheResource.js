const { Tithe } = require("../models");
module.exports = async (req, res, next) => {
  const { id } = req.params;

  try {
    const tithe = await Tithe.findByPk(id);

    if (!tithe) {
      return next({
        status: 404,
        message: "Tithe not found.",
      });
    }

    res.locals.tithe = tithe;

    next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
