// routes/index.js
const express = require("express");
const router = express.Router();

const createTithe = require("../controllers/tithe/createTithe");
const deleteTithe = require("../controllers/tithe/deleteTithe");
const updateTithe = require("../controllers/tithe/updateTithe");
const getAllTitheAndCount = require("../controllers/tithe/getAllTitheAndCount");

const initTitheResource = require("../middlewares/initTitheResource");

router.post("", createTithe.validate, createTithe.invoke);

router.patch(
  "/:id",
  initTitheResource,
  deleteTithe.validate,
  deleteTithe.invoke
);

router.patch(
  "/update/:id",
  initTitheResource,
  updateTithe.validate,
  updateTithe.invoke
);

router.get(
  "",
  getAllTitheAndCount.validate,
  getAllTitheAndCount.invoke
);

module.exports = router;
