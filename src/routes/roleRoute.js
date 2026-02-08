"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const requireSuperUser = require("../middlewares/requireSuperUser");
const getAllRolesWithPermissions = require("../controllers/role/getAllRolesWithPermissions");
const getAllPermissions = require("../controllers/role/getAllPermissions");
const createRole = require("../controllers/role/createRole");
const updateRolePermissions = require("../controllers/role/updateRolePermissions");
const deleteRole = require("../controllers/role/deleteRole");

router.get(
  "",
  authenticate,
  requireSuperUser,
  getAllRolesWithPermissions.validate,
  getAllRolesWithPermissions.invoke
);

router.get(
  "/permissions",
  authenticate,
  requireSuperUser,
  getAllPermissions.validate,
  getAllPermissions.invoke
);

router.post(
  "",
  authenticate,
  requireSuperUser,
  createRole.validate,
  createRole.invoke
);

router.patch(
  "/:id/permissions",
  authenticate,
  requireSuperUser,
  updateRolePermissions.validate,
  updateRolePermissions.invoke
);

router.delete(
  "/:id",
  authenticate,
  requireSuperUser,
  deleteRole.validate,
  deleteRole.invoke
);

module.exports = router;
