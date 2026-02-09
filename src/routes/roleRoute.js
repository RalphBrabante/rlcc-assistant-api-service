"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const requireAdminOrSuperUser = require("../middlewares/requireAdminOrSuperUser");
const getAllRolesWithPermissions = require("../controllers/role/getAllRolesWithPermissions");
const getAllPermissions = require("../controllers/role/getAllPermissions");
const createRole = require("../controllers/role/createRole");
const updateRolePermissions = require("../controllers/role/updateRolePermissions");
const deleteRole = require("../controllers/role/deleteRole");
const getAssignableRoles = require("../controllers/role/getAssignableRoles");
const searchUsersForRoleAssignment = require("../controllers/role/searchUsersForRoleAssignment");
const updateUserRoles = require("../controllers/role/updateUserRoles");

router.get(
  "/assignable",
  authenticate,
  requireAdminOrSuperUser,
  getAssignableRoles.validate,
  getAssignableRoles.invoke
);

router.get(
  "/user-roles/users/search",
  authenticate,
  requireAdminOrSuperUser,
  searchUsersForRoleAssignment.validate,
  searchUsersForRoleAssignment.invoke
);

router.patch(
  "/user-roles/users/:userId",
  authenticate,
  requireAdminOrSuperUser,
  updateUserRoles.validate,
  updateUserRoles.invoke
);

router.get(
  "",
  authenticate,
  requireAdminOrSuperUser,
  getAllRolesWithPermissions.validate,
  getAllRolesWithPermissions.invoke
);

router.get(
  "/permissions",
  authenticate,
  requireAdminOrSuperUser,
  getAllPermissions.validate,
  getAllPermissions.invoke
);

router.post(
  "",
  authenticate,
  requireAdminOrSuperUser,
  createRole.validate,
  createRole.invoke
);

router.patch(
  "/:id/permissions",
  authenticate,
  requireAdminOrSuperUser,
  updateRolePermissions.validate,
  updateRolePermissions.invoke
);

router.delete(
  "/:id",
  authenticate,
  requireAdminOrSuperUser,
  deleteRole.validate,
  deleteRole.invoke
);

module.exports = router;
