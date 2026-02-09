"use strict";

const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const requireAdminOrSuperUser = require("../middlewares/requireAdminOrSuperUser");
const createBugReport = require("../controllers/bugReport/createBugReport");
const getBugReports = require("../controllers/bugReport/getBugReports");
const updateBugReportStatus = require("../controllers/bugReport/updateBugReportStatus");
const getBugReportById = require("../controllers/bugReport/getBugReportById");
const { cacheRead, invalidateCache } = require("../middlewares/cacheMiddleware");

router.post(
  "",
  authenticate,
  invalidateCache(["bug-reports"]),
  createBugReport.validate,
  createBugReport.invoke
);

router.get(
  "",
  authenticate,
  requireAdminOrSuperUser,
  cacheRead("bug-reports"),
  getBugReports.validate,
  getBugReports.invoke
);

router.patch(
  "/:id/status",
  authenticate,
  requireAdminOrSuperUser,
  invalidateCache(["bug-reports"]),
  updateBugReportStatus.validate,
  updateBugReportStatus.invoke
);

router.get(
  "/:id",
  authenticate,
  requireAdminOrSuperUser,
  cacheRead("bug-reports"),
  getBugReportById.validate,
  getBugReportById.invoke
);

module.exports = router;
