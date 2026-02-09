const { User, Role, Sequelize } = require("../../models");
const { Op } = Sequelize;

module.exports.validate = async (req, res, next) => {
  const queryText = String(req.query?.q || req.query?.name || "").trim();
  const page = Number.parseInt(String(req.query?.page || "1"), 10);
  const limit = Number.parseInt(String(req.query?.limit || "25"), 10);

  if (!Number.isInteger(page) || page < 1) {
    return next({
      status: 400,
      message: "page must be a positive integer.",
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next({
      status: 400,
      message: "limit must be an integer between 1 and 100.",
    });
  }

  if (queryText.length > 120) {
    return next({
      status: 400,
      message: "query must be 120 characters or fewer.",
    });
  }

  res.locals.filters = {
    queryText,
    page,
    limit,
  };

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { queryText, page, limit } = res.locals.filters;
  const offset = (page - 1) * limit;

  try {
    const where = { isActive: true };
    if (queryText) {
      const numericQuery = Number.parseInt(queryText, 10);
      const whereOr = [
        { firstName: { [Op.like]: `%${queryText}%` } },
        { lastName: { [Op.like]: `%${queryText}%` } },
        { emailAddress: { [Op.like]: `%${queryText}%` } },
        Sequelize.where(
          Sequelize.fn("concat", Sequelize.col("firstName"), " ", Sequelize.col("lastName")),
          { [Op.like]: `%${queryText}%` }
        ),
        Sequelize.where(Sequelize.cast(Sequelize.col("pcoId"), "char"), {
          [Op.like]: `%${queryText}%`,
        }),
      ];

      if (Number.isInteger(numericQuery) && numericQuery > 0) {
        whereOr.push({ id: numericQuery });
        whereOr.push({ pcoId: numericQuery });
      }

      where[Op.or] = whereOr;
    }

    const users = await User.findAndCountAll({
      where,
      distinct: true,
      limit,
      offset,
      attributes: ["id", "firstName", "lastName", "emailAddress", "pcoId"],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
      ],
      order: [
        ["firstName", "ASC"],
        ["lastName", "ASC"],
      ],
    });

    res.send({
      status: 200,
      data: users,
    });
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }

  next();
};
