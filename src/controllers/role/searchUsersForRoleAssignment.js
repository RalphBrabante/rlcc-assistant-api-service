"use strict";

const { User, Role, Sequelize } = require("../../models");
const { Op } = Sequelize;

module.exports.validate = async (req, res, next) => {
  const q = String(req.query?.q || "").trim();

  if (!q) {
    res.locals.query = "";
    return next();
  }

  if (q.length > 80) {
    return next({
      status: 400,
      message: "Search query is too long.",
    });
  }

  res.locals.query = q;
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const q = res.locals.query || "";

  try {
    if (!q) {
      res.send({
        status: 200,
        data: {
          users: [],
        },
      });
      return next();
    }

    const numericQuery = Number(q);
    const whereOr = [
      { firstName: { [Op.like]: `%${q}%` } },
      { lastName: { [Op.like]: `%${q}%` } },
      { emailAddress: { [Op.like]: `%${q}%` } },
      Sequelize.where(
        Sequelize.fn("concat", Sequelize.col("firstName"), " ", Sequelize.col("lastName")),
        { [Op.like]: `%${q}%` }
      ),
      Sequelize.where(Sequelize.cast(Sequelize.col("pcoId"), "char"), {
        [Op.like]: `%${q}%`,
      }),
    ];

    if (Number.isInteger(numericQuery) && numericQuery > 0) {
      whereOr.push({ id: numericQuery });
      whereOr.push({ pcoId: numericQuery });
    }

    const users = await User.findAll({
      where: {
        isActive: true,
        [Op.or]: whereOr,
      },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "emailAddress",
        "pcoId",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      order: [
        ["firstName", "ASC"],
        ["lastName", "ASC"],
        [{ model: Role, as: "roles" }, "name", "ASC"],
      ],
      limit: 25,
    });

    res.send({
      status: 200,
      data: {
        users,
      },
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
