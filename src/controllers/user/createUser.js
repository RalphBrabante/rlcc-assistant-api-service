const { User } = require("../../models");
const bcrypt = require("bcrypt");

module.exports.validate = async (req, res, next) => {
  const { user } = req.body;

  res.locals.user = user;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;

  try {
    user.password = await bcrypt.hash(user.password, 10);

    const newUser = await User.create(user);

    return res.send({
      status: 200,
      data: newUser,
    });
  } catch (error) {
    return next({
      status: 200,
      message: error,
    });
  }
};
