"use strict";

const { BugReport, User, Sequelize } = require("../../models");
const { Op } = Sequelize;

const ALLOWED_STATUSES = new Set(["open", "in_progress", "resolved", "rejected"]);

module.exports.validate = async (req, res, next) => {
  const page = Number.parseInt(String(req.query?.page || "1"), 10);
  const limit = Number.parseInt(String(req.query?.limit || "20"), 10);
  const status = String(req.query?.status || "all").trim().toLowerCase();
  const q = String(req.query?.q || "").trim();

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

  if (status !== "all" && !ALLOWED_STATUSES.has(status)) {
    return next({
      status: 400,
      message: "Invalid status filter.",
    });
  }

  if (q.length > 120) {
    return next({
      status: 400,
      message: "Search query must be 120 characters or fewer.",
    });
  }

  res.locals.queryOptions = {
    page,
    limit,
    status,
    q,
  };

  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { page, limit, status, q } = res.locals.queryOptions;

  try {
    const where = {};

    if (status !== "all") {
      where.status = status;
    }

    if (q) {
      const parsedId = Number.parseInt(q, 10);
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];

      if (Number.isInteger(parsedId) && parsedId > 0) {
        where[Op.or].push({ id: parsedId });
      }
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await BugReport.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    res.send({
      status: 200,
      data: {
        bugReports: rows,
      },
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
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
