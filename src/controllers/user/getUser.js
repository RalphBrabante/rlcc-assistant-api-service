const { User, Role, Permission } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    include: {
      model: Role,
      attributes: ["id", "name"],
      as: "roles",
      through: { attributes: [] },
      include: {
        model: Permission,
        as: "permissions",
        attributes: ["id", "method"],
        through: { attributes: [] },
      },
    },
  });

  res.send({
    status: 200,
    data: user,
  });

  res.locals.user = user;

  next();
};

module.exports.invoke = async (req, res, next) => {
  next();
};
