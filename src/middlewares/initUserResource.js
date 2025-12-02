const { User } = require("../models");
module.exports = async (req, res, next) => {
  const { id, userId } = req.params;

  try {
    const lookupId = userId || id;

    const user = await User.findByPk(lookupId);

    if (!user) {
      return next({
        status: 404,
        message: "User not found.",
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
