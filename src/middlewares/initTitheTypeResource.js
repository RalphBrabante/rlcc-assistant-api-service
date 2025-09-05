const { TitheType } = require("../models");
module.exports = async (req, res, next) => {
  const { id } = req.params;

  try {
    const titheType = await TitheType.findByPk(id);

    if (!titheType) {
      return next({
        status: 404,
        message: "Tithe Type not found.",
      });
    }

    res.locals.titheType = titheType;

    next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
