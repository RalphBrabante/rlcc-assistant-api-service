"use strict";

const PERMISSIONS = [
  { method: "read_all_users", name: "Read All Users", resource: "users" },
  { method: "create_user", name: "Create User", resource: "user" },
  { method: "update_user", name: "Update User", resource: "user" },
  { method: "get_user", name: "Get User", resource: "user" },
  {
    method: "read_all_tithe_types",
    name: "Read All Tithe Types",
    resource: "tithe_types",
  },
  {
    method: "create_tithe_types",
    name: "Create Tithe Types",
    resource: "tithe_types",
  },
  {
    method: "delete_tithe_types",
    name: "Delete Tithe Types",
    resource: "tithe_types",
  },
  { method: "get_tithe_type", name: "Get Tithe Type", resource: "tithe_type" },
  { method: "create_tithe", name: "Create Tithe", resource: "tithe" },
  { method: "delete_tithe", name: "Delete Tithe", resource: "tithe" },
  { method: "update_tithe", name: "Update Tithe", resource: "tithe" },
  { method: "read_all_tithe", name: "Read All Tithe", resource: "tithe" },
  { method: "read_own_tithe", name: "Read Own Tithe", resource: "tithe" },
  { method: "get_all_group", name: "Get All Group", resource: "group" },
  { method: "join_group", name: "Join Group", resource: "group" },
  { method: "create_group", name: "Create Group", resource: "group" },
  { method: "update_group", name: "Update Group", resource: "group" },
  {
    method: "assign_user_to_group",
    name: "Assign User To Group",
    resource: "group",
  },
  { method: "delete_group", name: "Delete Group", resource: "group" },
  { method: "read_own_group", name: "Read Own Group", resource: "group" },
  { method: "read_all_groups", name: "Read All Groups", resource: "group" },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const methods = PERMISSIONS.map((permission) => permission.method);

    const [existingPermissions] = await queryInterface.sequelize.query(
      "SELECT method FROM `Permissions` WHERE method IN (:methods)",
      { replacements: { methods } }
    );
    const existingMethodSet = new Set(
      existingPermissions.map((permission) => permission.method)
    );

    const missingPermissions = PERMISSIONS.filter(
      (permission) => !existingMethodSet.has(permission.method)
    ).map((permission) => ({
      ...permission,
      createdAt: now,
      updatedAt: now,
    }));

    if (missingPermissions.length) {
      await queryInterface.bulkInsert("Permissions", missingPermissions);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Permissions",
      {
        method: PERMISSIONS.map((permission) => permission.method),
      },
      {}
    );
  },
};
