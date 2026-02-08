"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const requiredRoles = [
      "ADMINISTRATOR",
      "SUPERUSER",
      "ENCODER",
      "ACCOUNTANT",
      "ENDUSER",
    ];

    const permissionMethods = [
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
    ];

    const rolePermissionMap = {
      SUPERUSER: permissionMethods,
      ADMINISTRATOR: permissionMethods,
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
        "read_own_group",
        "read_all_groups",
        "join_group",
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

    const roleAliasMap = {
      ADMIN: "ADMINISTRATOR",
      MEMBER: "ENDUSER",
      USER: "ENDUSER",
    };

    const [existingRolesBefore] = await queryInterface.sequelize.query(
      "SELECT id, name FROM `Roles`"
    );
    const existingRoleNameSet = new Set(existingRolesBefore.map((r) => r.name));

    const missingRoles = requiredRoles
      .filter((name) => !existingRoleNameSet.has(name))
      .map((name) => ({ name, createdAt: now, updatedAt: now }));

    if (missingRoles.length) {
      await queryInterface.bulkInsert("Roles", missingRoles);
    }

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, name FROM `Roles`"
    );
    const roleIdByName = new Map(roles.map((r) => [r.name, r.id]));

    for (const [fromRole, toRole] of Object.entries(roleAliasMap)) {
      const fromRoleId = roleIdByName.get(fromRole);
      const toRoleId = roleIdByName.get(toRole);
      if (!fromRoleId || !toRoleId) continue;

      await queryInterface.sequelize.query(
        "UPDATE `UserRoles` SET `roleId` = :toRoleId WHERE `roleId` = :fromRoleId",
        {
          replacements: { fromRoleId, toRoleId },
        }
      );
    }

    const endUserRoleId = roleIdByName.get("ENDUSER");
    if (!endUserRoleId) {
      throw new Error("ENDUSER role could not be created.");
    }

    const requiredRoleIdSet = new Set(
      requiredRoles.map((roleName) => roleIdByName.get(roleName))
    );
    const extraRoleIds = roles
      .filter((r) => !requiredRoleIdSet.has(r.id))
      .map((r) => r.id);

    if (extraRoleIds.length) {
      await queryInterface.sequelize.query(
        "UPDATE `UserRoles` SET `roleId` = :endUserRoleId WHERE `roleId` IN (:extraRoleIds)",
        {
          replacements: { endUserRoleId, extraRoleIds },
        }
      );
    }

    await queryInterface.sequelize.query(
      "DELETE ur1 FROM `UserRoles` ur1 INNER JOIN `UserRoles` ur2 ON ur1.`userId` = ur2.`userId` AND ur1.`roleId` = ur2.`roleId` AND ur1.`id` > ur2.`id`"
    );

    const [existingPermissionsBefore] = await queryInterface.sequelize.query(
      "SELECT id, method FROM `Permissions`"
    );
    const existingPermissionMethodSet = new Set(
      existingPermissionsBefore.map((p) => p.method)
    );

    const missingPermissions = permissionMethods
      .filter((method) => !existingPermissionMethodSet.has(method))
      .map((method) => ({
        name: method
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        method,
        resource: method.split("_").slice(-1)[0],
        createdAt: now,
        updatedAt: now,
      }));

    if (missingPermissions.length) {
      await queryInterface.bulkInsert("Permissions", missingPermissions);
    }

    const [permissions] = await queryInterface.sequelize.query(
      "SELECT id, method FROM `Permissions`"
    );
    const permissionIdByMethod = new Map(permissions.map((p) => [p.method, p.id]));

    await queryInterface.bulkDelete("RolePermissions", null, {});

    const rolePermissionRows = [];
    for (const [roleName, methods] of Object.entries(rolePermissionMap)) {
      const roleId = roleIdByName.get(roleName);
      if (!roleId) continue;
      for (const method of methods) {
        const permissionId = permissionIdByMethod.get(method);
        if (!permissionId) continue;
        rolePermissionRows.push({
          roleId,
          permissionId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (rolePermissionRows.length) {
      await queryInterface.bulkInsert("RolePermissions", rolePermissionRows);
    }

    const [users] = await queryInterface.sequelize.query("SELECT id FROM `Users`");
    const [userRoles] = await queryInterface.sequelize.query(
      "SELECT userId FROM `UserRoles`"
    );
    const usersWithRole = new Set(userRoles.map((ur) => ur.userId));
    const missingUserRoles = users
      .filter((u) => !usersWithRole.has(u.id))
      .map((u) => ({
        userId: u.id,
        roleId: endUserRoleId,
        createdAt: now,
        updatedAt: now,
      }));

    if (missingUserRoles.length) {
      await queryInterface.bulkInsert("UserRoles", missingUserRoles);
    }

    if (extraRoleIds.length) {
      await queryInterface.sequelize.query(
        "DELETE FROM `Roles` WHERE `id` IN (:extraRoleIds)",
        {
          replacements: { extraRoleIds },
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Not safely reversible: this seeder normalizes production role data.
    return Promise.resolve();
  },
};
