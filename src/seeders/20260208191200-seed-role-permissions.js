"use strict";

const ROLE_PERMISSION_MAP = {
  ADMINISTRATOR: [
    "read_all_users",
    "create_user",
    "update_user",
    "get_user",
    "read_all_tithe_types",
    "create_tithe_types",
    "delete_tithe_types",
    "get_tithe_type",
    "create_tithe",
    "delete_tithe",
    "update_tithe",
    "read_all_tithe",
    "read_own_tithe",
    "get_all_group",
    "join_group",
    "create_group",
    "update_group",
    "assign_user_to_group",
    "delete_group",
    "read_own_group",
    "read_all_groups",
    "create_group_topic",
    "read_group_topics",
    "read_all_group_topics",
    "delete_group_topic",
    "create_bug_report",
  ],
  SUPERUSER: [
    "read_all_users",
    "create_user",
    "update_user",
    "get_user",
    "read_all_tithe_types",
    "create_tithe_types",
    "delete_tithe_types",
    "get_tithe_type",
    "create_tithe",
    "delete_tithe",
    "update_tithe",
    "read_all_tithe",
    "read_own_tithe",
    "get_all_group",
    "join_group",
    "create_group",
    "update_group",
    "assign_user_to_group",
    "delete_group",
    "read_own_group",
    "read_all_groups",
    "create_group_topic",
    "read_group_topics",
    "read_all_group_topics",
    "delete_group_topic",
    "create_bug_report",
  ],
  ENCODER: [
    "read_all_users",
    "get_user",
    "read_all_tithe_types",
    "get_tithe_type",
    "create_tithe",
    "delete_tithe",
    "update_tithe",
    "read_all_tithe",
    "read_own_tithe",
    "get_all_group",
    "create_group_topic",
    "join_group",
    "read_own_group",
    "read_all_groups",
    "read_group_topics",
    "create_bug_report",
  ],
  ACCOUNTANT: [
    "read_all_users",
    "get_user",
    "read_all_tithe_types",
    "get_tithe_type",
    "read_all_tithe",
    "read_own_tithe",
    "get_all_group",
    "create_group_topic",
    "read_own_group",
    "read_all_groups",
    "read_group_topics",
    "create_bug_report",
  ],
  ENDUSER: [
    "get_user",
    "read_own_tithe",
    "read_own_group",
    "create_group_topic",
    "join_group",
    "read_group_topics",
    "create_bug_report",
  ],
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const managedRoleNames = Object.keys(ROLE_PERMISSION_MAP);

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, name FROM `Roles` WHERE `name` IN (:managedRoleNames)",
      { replacements: { managedRoleNames } }
    );
    const roleIdByName = new Map(roles.map((role) => [role.name, role.id]));

    const neededMethods = [
      ...new Set(Object.values(ROLE_PERMISSION_MAP).flat()),
    ];
    const [permissions] = await queryInterface.sequelize.query(
      "SELECT id, method FROM `Permissions` WHERE `method` IN (:neededMethods)",
      { replacements: { neededMethods } }
    );
    const permissionIdByMethod = new Map(
      permissions.map((permission) => [permission.method, permission.id])
    );

    const managedRoleIds = managedRoleNames
      .map((name) => roleIdByName.get(name))
      .filter(Boolean);

    if (!managedRoleIds.length) return;

    await queryInterface.bulkDelete(
      "RolePermissions",
      {
        roleId: managedRoleIds,
      },
      {}
    );

    const rows = [];
    for (const [roleName, methods] of Object.entries(ROLE_PERMISSION_MAP)) {
      const roleId = roleIdByName.get(roleName);
      if (!roleId) continue;

      for (const method of methods) {
        const permissionId = permissionIdByMethod.get(method);
        if (!permissionId) continue;
        rows.push({
          roleId,
          permissionId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (rows.length) {
      await queryInterface.bulkInsert("RolePermissions", rows);
    }
  },

  async down(queryInterface, Sequelize) {
    const managedRoleNames = Object.keys(ROLE_PERMISSION_MAP);
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM `Roles` WHERE `name` IN (:managedRoleNames)",
      { replacements: { managedRoleNames } }
    );
    const managedRoleIds = roles.map((role) => role.id);

    if (!managedRoleIds.length) return;

    await queryInterface.bulkDelete(
      "RolePermissions",
      {
        roleId: managedRoleIds,
      },
      {}
    );
  },
};
