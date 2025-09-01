const { Tithe, TitheType } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { amount, memberId, titheTypeId, dateReceived } = req.body.tithe;
  try {
    const tithe = await Tithe.create(
      {
        amount,
        titheTypeId,
        userId: user.id,
        memberId,
        dateReceived,
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
