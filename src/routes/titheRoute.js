// routes/index.js
const express = require("express");
const router = express.Router();

const createTithe = require("../controllers/tithe/createTithe");
const createTitheInBulk = require("../controllers/tithe/createTitheInBulk");
const deleteTithe = require("../controllers/tithe/deleteTithe");
const updateTithe = require("../controllers/tithe/updateTithe");
const getAllTitheAndCount = require("../controllers/tithe/getAllTitheAndCount");
const getUserTitheAndCount = require("../controllers/tithe/getUserTitheAndCount");
const getTitheById = require("../controllers/tithe/getTitheById");
const getTitheReportByYear = require("../controllers/tithe/getTitheReportByYear");
const getTitheReportByUserAndYear = require("../controllers/tithe/getTitheReportByUserAndYear");

const authenticate = require("../middlewares/authenticate");
const initTitheResource = require("../middlewares/initTitheResource");
const authorize = require("../middlewares/authorize");
const { cacheRead, invalidateCache } = require("../middlewares/cacheMiddleware");

router.post(
  "",
  authenticate,
  authorize(["create_tithe"]),
  invalidateCache(["tithes"]),
  createTithe.validate,
  createTithe.invoke
);

router.post(
  "/bulk-create",
  authenticate,
  authorize(["create_tithe"]),
  invalidateCache(["tithes"]),
  createTitheInBulk.validate,
  createTitheInBulk.invoke
);

router.patch(
  "/:id",
  authenticate,
  authorize(["delete_tithe"]),
  initTitheResource,
  invalidateCache(["tithes"]),
  deleteTithe.validate,
  deleteTithe.invoke
);

router.patch(
  "/update/:id",
  authenticate,
  authorize(["update_tithe"]),
  initTitheResource,
  invalidateCache(["tithes"]),
  updateTithe.validate,
  updateTithe.invoke
);

router.get(
  "",
  authenticate,
  authorize(["read_all_tithe"]),
  cacheRead("tithes"),
  getAllTitheAndCount.validate,
  getAllTitheAndCount.invoke
);

router.get(
  "/user",
  authenticate,
  authorize(["read_own_tithe"]),
  cacheRead("tithes"),
  getUserTitheAndCount.validate,
  getUserTitheAndCount.invoke
);

router.get(
  "/report",
  authenticate,
  authorize(["read_all_tithe"]),
  cacheRead("tithes"),
  getTitheReportByYear.validate,
  getTitheReportByYear.invoke
);

router.get(
  "/report/user",
  authenticate,
  authorize(["read_own_tithe"]),
  cacheRead("tithes"),
  getTitheReportByUserAndYear.validate,
  getTitheReportByUserAndYear.invoke
);

router.get(
  "/:id",
  authenticate,
  authorize(["read_own_tithe"]),
  cacheRead("tithes"),
  getTitheById.validate,
  getTitheById.invoke
);

module.exports = router;
