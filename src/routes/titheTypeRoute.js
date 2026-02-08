// routes/index.js
const express = require("express");
const router = express.Router();

const getAllTitheTypesAndCount = require("../controllers/titheType/getAllTitheTypesAndCount");
const createTitheType = require("../controllers/titheType/createTitheType");
const deleteTitheType = require("../controllers/titheType/deleteTitheType");
const updateTitheType = require("../controllers/titheType/updateTitheType");
const getTitheTypeById = require("../controllers/titheType/getTitheTypeById");
const authenticate = require("../middlewares/authenticate");

const authorize = require("../middlewares/authorize");
const initTitheTypeResource = require("../middlewares/initTitheTypeResource");
const { cacheRead, invalidateCache } = require("../middlewares/cacheMiddleware");

router.get(
  "",
  authenticate,
  authorize(["read_all_tithe_types"]),
  cacheRead("tithe-types"),
  getAllTitheTypesAndCount.validate,
  getAllTitheTypesAndCount.invoke
);

router.post(
  "",
  authenticate,
  authorize(["create_tithe_types"]),
  invalidateCache(["tithe-types", "tithes"]),
  createTitheType.validate,
  createTitheType.invoke
);

router.delete(
  "/:id",
  authenticate,
  authorize(["delete_tithe_types"]),
  initTitheTypeResource,
  invalidateCache(["tithe-types", "tithes"]),
  deleteTitheType.validate,
  deleteTitheType.invoke
);

router.patch(
  "/:id",
  authenticate,
  authorize(["delete_tithe_types"]),
  initTitheTypeResource,
  invalidateCache(["tithe-types", "tithes"]),
  updateTitheType.validate,
  updateTitheType.invoke
);

router.get(
  "/:id",
  authenticate,
  authorize(["get_tithe_type"]),
  initTitheTypeResource,
  cacheRead("tithe-types"),
  getTitheTypeById.validate,
  getTitheTypeById.invoke
);

module.exports = router;
