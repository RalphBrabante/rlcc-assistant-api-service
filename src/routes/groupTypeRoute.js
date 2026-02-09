const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const { cacheRead, invalidateCache } = require("../middlewares/cacheMiddleware");

const getAllGroupTypes = require("../controllers/groupType/getAllGroupTypes");
const createGroupType = require("../controllers/groupType/createGroupType");
const deleteGroupType = require("../controllers/groupType/deleteGroupType");

router.get(
  "",
  authenticate,
  authorize(["get_all_group", "read_own_group", "read_all_groups"]),
  cacheRead("group-types"),
  getAllGroupTypes.validate,
  getAllGroupTypes.invoke
);

router.post(
  "",
  authenticate,
  authorize(["update_group"]),
  invalidateCache(["group-types"]),
  createGroupType.validate,
  createGroupType.invoke
);

router.delete(
  "/:id",
  authenticate,
  authorize(["update_group"]),
  invalidateCache(["group-types"]),
  deleteGroupType.validate,
  deleteGroupType.invoke
);

module.exports = router;
