const { User, Tithe, TitheType } = require("../../models");
const tithetype = require("../../models/tithetype");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  try {
    const user = await User.findByPk(1, {
      attributes: ["id"],
    });

    user.createTithe({
      amount: 25.22,
      titheTypeId: 1,
      dateReceived: new Date(),
    });

    await user.reload({
      attributes: ["id"],
      include: [
        {
          model: Tithe,
          as: "tithes",
          attributes: ["id", "amount", "titheTypeId"],
          limit: 1,
          order: [["id", "DESC"]],
          include: [{ model: TitheType, as: "titheType" }],
        },
      ],
    });

    res.send({
      status: 200,
      user,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
