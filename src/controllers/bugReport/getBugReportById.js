"use strict";

const { BugReport, User } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const id = Number.parseInt(String(req.params?.id || ""), 10);

  if (!Number.isInteger(id) || id < 1) {
    return next({
      status: 400,
      message: "Invalid bug report id.",
    });
  }

  res.locals.bugReportId = id;
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const id = res.locals.bugReportId;

  try {
    const bugReport = await BugReport.findByPk(id, {
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
    });

    if (!bugReport) {
      return next({
        status: 404,
        message: "Bug report not found.",
      });
    }

    res.send({
      status: 200,
      data: {
        bugReport,
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
