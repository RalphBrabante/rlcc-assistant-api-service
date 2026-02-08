"use strict";

const { BugReport, User, Role, Sequelize } = require("../../models");
const { getBooleanConfig } = require("../../utils/runtimeConfiguration");
const emailBugReportNotification = require("../../utils/emailBugReportNotification");
const { Op } = Sequelize;
const PRIVILEGED_ROLE_NAMES = ["SUPERUSER", "ADMINISTRATOR", "ADMINSTRATOR"];

const ALLOWED_SCOPES = new Set(["client", "server"]);
const ALLOWED_SEVERITIES = new Set(["low", "medium", "high", "critical"]);

module.exports.validate = async (req, res, next) => {
  const bugReport = req.body?.bugReport || {};

  const title = String(bugReport.title || "").trim();
  const description = String(bugReport.description || "").trim();
  const scope = String(bugReport.scope || "client").trim().toLowerCase();
  const severity = String(bugReport.severity || "medium").trim().toLowerCase();
  const pageUrlRaw = bugReport.pageUrl == null ? "" : String(bugReport.pageUrl).trim();

  if (!title) {
    return next({ status: 400, message: "Title is required." });
  }

  if (title.length > 160) {
    return next({ status: 400, message: "Title must be 160 characters or fewer." });
  }

  if (!description) {
    return next({ status: 400, message: "Description is required." });
  }

  if (description.length > 5000) {
    return next({ status: 400, message: "Description must be 5000 characters or fewer." });
  }

  if (!ALLOWED_SCOPES.has(scope)) {
    return next({
      status: 400,
      message: "Scope must be either 'client' or 'server'.",
    });
  }

  if (!ALLOWED_SEVERITIES.has(severity)) {
    return next({
      status: 400,
      message: "Severity must be one of: low, medium, high, critical.",
    });
  }

  let pageUrl = null;
  if (pageUrlRaw) {
    try {
      const parsed = new URL(pageUrlRaw);
      pageUrl = parsed.toString();
    } catch (error) {
      return next({
        status: 400,
        message: "pageUrl must be a valid absolute URL.",
      });
    }

    if (pageUrl.length > 500) {
      return next({
        status: 400,
        message: "pageUrl must be 500 characters or fewer.",
      });
    }
  }

  res.locals.bugReportPayload = {
    title,
    description,
    pageUrl,
    scope,
    severity,
  };

  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { user, bugReportPayload } = res.locals;

  try {
    const bugReport = await BugReport.create({
      userId: user.id,
      title: bugReportPayload.title,
      description: bugReportPayload.description,
      pageUrl: bugReportPayload.pageUrl,
      scope: bugReportPayload.scope,
      severity: bugReportPayload.severity,
      status: "open",
    });

    const createdBugReport = await BugReport.findByPk(bugReport.id, {
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
    });

    const devModeEnabled = await getBooleanConfig("dev_mode", false);
    if (!devModeEnabled) {
      let adminAndSuperUsers = await User.findAll({
        where: {
          [Op.or]: [{ isActive: true }, { isActive: null }],
        },
        attributes: ["id", "firstName", "lastName", "emailAddress"],
        include: [
          {
            model: Role,
            as: "roles",
            attributes: ["id", "name"],
            through: { attributes: [] },
            where: {
              name: {
                [Op.in]: PRIVILEGED_ROLE_NAMES,
              },
            },
            required: true,
          },
        ],
      });

      if (!adminAndSuperUsers.length) {
        adminAndSuperUsers = await User.findAll({
          attributes: ["id", "firstName", "lastName", "emailAddress"],
          include: [
            {
              model: Role,
              as: "roles",
              attributes: ["id", "name"],
              through: { attributes: [] },
              where: {
                name: {
                  [Op.in]: PRIVILEGED_ROLE_NAMES,
                },
              },
              required: true,
            },
          ],
        });
      }

      const seenAddresses = new Set();
      const reporterName = createdBugReport?.reporter
        ? `${createdBugReport.reporter.firstName} ${createdBugReport.reporter.lastName}`.trim()
        : `User #${user.id}`;
      const sendPromises = [];

      for (const recipient of adminAndSuperUsers) {
        const emailAddress = String(recipient.emailAddress || "").trim().toLowerCase();
        if (!emailAddress || seenAddresses.has(emailAddress)) {
          continue;
        }
        seenAddresses.add(emailAddress);

        sendPromises.push(
          emailBugReportNotification({
          recipientName: `${recipient.firstName || ""} ${recipient.lastName || ""}`.trim() || "Team Member",
          to: emailAddress,
          report: createdBugReport,
          reporterName,
          transporter: req.transporter,
          })
        );
      }

      if (sendPromises.length) {
        await Promise.allSettled(sendPromises);
      }
    }

    res.send({
      status: 201,
      bugReport: createdBugReport,
      message: "Bug report submitted successfully.",
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
