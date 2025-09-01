// routes/index.js
const express = require("express");
const router = express.Router();

const createTithe = require("../controllers/tithe/createTithe");
const deleteTithe = require("../controllers/tithe/deleteTithe");
const updateTithe = require("../controllers/tithe/updateTithe");
const getAllTitheTypesAndCount = require("../controllers/titheType/getAllTitheTypesAndCount");
const authenticate = require("../middlewares/authenticate");

const authorize = require("../middlewares/authorize");

router.get(
  "",
  authenticate,
  authorize(["read_all_tithe_types"]),
  getAllTitheTypesAndCount.validate,
  getAllTitheTypesAndCount.invoke
);

module.exports = router;
