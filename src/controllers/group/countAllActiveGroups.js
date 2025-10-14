const { Group } = require("../../models");

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const circles = await Group.findAndCountAll({
    where: {
      isActive: true,
    },
    attributes: ["id", "name"],
  });

  res.send({
    status: 200,
    count: circles.count,
  });

  next();
};
