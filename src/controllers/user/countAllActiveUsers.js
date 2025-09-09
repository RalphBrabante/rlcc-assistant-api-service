const { User, Role, Permission, Sequelize } = require("../../models");
const { Op } = Sequelize;
const bcrypt = require("bcrypt");

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {

  const users = await User.findAndCountAll({
    where: {
      isActive: true,
    },
    attributes: ["id", "firstName", "lastName", "emailAddress"],
  });

  res.send({
    status: 200,
    count: users.count,
  });

  next();
};
