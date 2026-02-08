"use strict";

const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const requireAdminOrSuperUser = require("../middlewares/requireAdminOrSuperUser");
const createBugReport = require("../controllers/bugReport/createBugReport");
const getBugReports = require("../controllers/bugReport/getBugReports");
const updateBugReportStatus = require("../controllers/bugReport/updateBugReportStatus");
const getBugReportById = require("../controllers/bugReport/getBugReportById");

router.post(
  "",
  authenticate,
  createBugReport.validate,
  createBugReport.invoke
);

router.get(
  "",
  authenticate,
  requireAdminOrSuperUser,
  getBugReports.validate,
  getBugReports.invoke
);

router.patch(
  "/:id/status",
  authenticate,
  requireAdminOrSuperUser,
  updateBugReportStatus.validate,
  updateBugReportStatus.invoke
);

router.get(
  "/:id",
  authenticate,
  requireAdminOrSuperUser,
  getBugReportById.validate,
  getBugReportById.invoke
);

module.exports = router;
