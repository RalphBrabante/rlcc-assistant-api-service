const { Tithe, TitheType } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  try {
    const tithe = await Tithe.create(
      {
        amount: 25.22,
        titheTypeId: 1,
        userId: user.id,
        dateReceived: new Date(),
      },
      {
        include: [{ model: TitheType, as: "titheType" }],
      }
    );

    res.send({
      status: 200,
      tithe,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
