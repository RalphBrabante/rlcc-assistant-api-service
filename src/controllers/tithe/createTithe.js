const { Tithe, TitheType, User } = require("../../models");
const tithetype = require("../../models/tithetype");

const emailTitheDetails = require("../../utils/emailTitheDetails");

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
    const tithe = await Tithe.create({
      amount,
      titheTypeId,
      userId: user.id,
      memberId,
      dateReceived,
    });

    // reload with associations
    await tithe.reload({
      include: [
        { model: TitheType, as: "titheType", attributes: ["id", "name"] },
        {
          model: User,
          as: "giver",
          attributes: ["id", "firstName", "emailAddress"],
        },
      ],
    });

    emailTitheDetails(
      tithe.giver.firstName,
      tithe.giver.emailAddress,
      tithe.amount,
      tithe.titheType.name,
      tithe.createdAt,
      req.transporter
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
