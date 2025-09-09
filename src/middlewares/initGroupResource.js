const { Group } = require("../models");
module.exports = async (req, res, next) => {
  const { id } = req.params;

  try {
    const group = await Group.findByPk(id);

    if (!group) {
      return next({
        status: 404,
        message: "Group not found.",
      });
    }

    res.locals.group = group;

    next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
