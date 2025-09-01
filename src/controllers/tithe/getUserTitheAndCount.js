const { User, Tithe, TitheType } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const { user } = res.locals;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  try {
    const tithes = await Tithe.findAndCountAll({
      where: {
        memberId: user.id,
      },
      order: [
        ["dateReceived", "DESC"],
        ["id", "DESC"],
      ],

      include: [
        {
          model: User,
          as: "encoder",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
        {
          model: User,
          as: "giver",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
        {
          model: TitheType,
          as: "titheType",
          attributes: ["id", "name"],
        },
      ],
    });

    res.send({
      status: 200,
      tithes,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
