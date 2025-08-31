// routes/index.js
const express = require("express");
const router = express.Router();

const createTithe = require("../controllers/tithe/createTithe");
const deleteTithe = require("../controllers/tithe/deleteTithe");
const updateTithe = require("../controllers/tithe/updateTithe");
const getAllTitheAndCount = require("../controllers/tithe/getAllTitheAndCount");
const authenticate = require("../middlewares/authenticate");

const initTitheResource = require("../middlewares/initTitheResource");
const authorize = require("../middlewares/authorize");

router.post(
  "",
  authenticate,
  authorize(["create_tithe"]),
  createTithe.validate,
  createTithe.invoke
);

router.patch(
  "/:id",
  authenticate,
  authorize(["update_tithe"]),
  initTitheResource,
  deleteTithe.validate,
  deleteTithe.invoke
);

router.patch(
  "/update/:id",
  authenticate,
  authorize(["update_tithe"]),
  initTitheResource,
  updateTithe.validate,
  updateTithe.invoke
);

router.get(
  "",
  authenticate,
  authorize(["read_all_tithe"]),
  getAllTitheAndCount.validate,
  getAllTitheAndCount.invoke
);

module.exports = router;
