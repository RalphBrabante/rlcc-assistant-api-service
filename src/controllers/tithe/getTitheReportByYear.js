"use strict";
const { Tithe, sequelize, Sequelize } = require("../../models");
const { Op } = Sequelize;

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { year } = req.query;

  try {
    // Aggregate sums by month for the given year
    const monthlyTotals = await Tithe.findAll({
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("dateReceived")), "month"],
        [sequelize.fn("SUM", sequelize.col("amount")), "total"],
      ],
      where: {
        isActive: true,
        [Op.and]: [
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("dateReceived")),
            year || new Date().getFullYear()
          ),
        ],
      },
      group: [sequelize.fn("MONTH", sequelize.col("dateReceived"))],
      raw: true,
    });

    // Build array of 12 months, filling missing months with 0
    const result = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyTotals.find((m) => parseInt(m.month) === i + 1);
      return monthData ? parseFloat(monthData.total) : 0;
    });

    res.send({
      status: 200,
      data: result, // [Jan, Feb, ..., Dec]
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
