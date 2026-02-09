// routes/index.js
const express = require("express");
const router = express.Router();

const getServerStatus = require("../controllers/configuration/getServerStatus");
const getPublicRuntimeSettings = require("../controllers/configuration/getPublicRuntimeSettings");
const updateServerConfigurations = require("../controllers/configuration/updateServerConfigurations");

const authenticate = require("../middlewares/authenticate");
const requireAdminOrSuperUser = require("../middlewares/requireAdminOrSuperUser");

const { cacheRead, invalidateCache } = require("../middlewares/cacheMiddleware");

router.get(
  "/public",
  cacheRead("configurations-public"),
  getPublicRuntimeSettings.validate,
  getPublicRuntimeSettings.invoke
);

router.get(
  "",
  authenticate,
  cacheRead("configurations"),
  getServerStatus.validate,
  getServerStatus.invoke
);

router.patch(
  "",
  authenticate,
  requireAdminOrSuperUser,
  invalidateCache(["configurations", "configurations-public"]),
  updateServerConfigurations.validate,
  updateServerConfigurations.invoke
);

module.exports = router;
