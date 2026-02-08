"use strict";

const { BugReport, User } = require("../../models");

const ALLOWED_STATUSES = new Set(["open", "in_progress", "resolved", "rejected"]);

module.exports.validate = async (req, res, next) => {
  const id = Number.parseInt(String(req.params?.id || ""), 10);
  const status = String(req.body?.bugReport?.status || "")
    .trim()
    .toLowerCase();

  if (!Number.isInteger(id) || id < 1) {
    return next({
      status: 400,
      message: "Invalid bug report id.",
    });
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return next({
      status: 400,
      message: "Invalid status. Allowed values: open, in_progress, resolved, rejected.",
    });
  }

  const bugReport = await BugReport.findByPk(id);

  if (!bugReport) {
    return next({
      status: 404,
      message: "Bug report not found.",
    });
  }

  res.locals.bugReport = bugReport;
  res.locals.nextStatus = status;

  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { bugReport, nextStatus } = res.locals;

  try {
    bugReport.status = nextStatus;
    await bugReport.save();

    const updated = await BugReport.findByPk(bugReport.id, {
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
    });

    res.send({
      status: 200,
      data: {
        bugReport: updated,
      },
      message: "Bug report status updated.",
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
