// routes/index.js
const express = require("express");
const router = express.Router();
const createGroup = require("../controllers/group/createGroup");
const assignUserToGroup = require("../controllers/group/assignUserToGroup");
const getAndCountGroup = require("../controllers/group/getAndCountGroup");
const countAllActiveGroups = require("../controllers/group/countAllActiveGroups");
const getGroupById = require("../controllers/group/getGroupById");
const updateGroup = require("../controllers/group/updateGroup");
const deleteGroup = require("../controllers/group/deleteGroup");
const getUnassignedUsers = require("../controllers/group/getUnassignedUsers");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const initGroupResource = require("../middlewares/initGroupResource");

router.get(
  "",
  authenticate,
  authorize(["get_all_group"]),
  getAndCountGroup.validate,
  getAndCountGroup.invoke
);

router.get(
  "/unassigned-users",
  authenticate,
  authorize(["get_all_group"]),
  getUnassignedUsers.validate,
  getUnassignedUsers.invoke
);

router.patch(
  "/:id",
  authenticate,
  authorize(["update_group"]),
  initGroupResource,
  updateGroup.validate,
  updateGroup.invoke
);

router.post(
  "",
  authenticate,
  authorize(["create_group"]),
  createGroup.validate,
  createGroup.invoke
);

router.post(
  "/assign",
  authenticate,
  authorize(["assign_user_to_group"]),
  assignUserToGroup.validate,
  assignUserToGroup.invoke
);

router.get(
  "/count",
  authenticate,
  authorize(["get_all_group"]),
  countAllActiveGroups.validate,
  countAllActiveGroups.invoke
);

router.delete(
  "/:id",
  authenticate,
  authorize(["delete_group"]),
  initGroupResource,
  deleteGroup.validate,
  deleteGroup.invoke
);

router.get(
  "/:id",
  authenticate,
  authorize(["read_own_group", "read_all_groups"]),
  getGroupById.validate,
  getGroupById.invoke
);

module.exports = router;
