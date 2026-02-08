"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const safeRemoveConstraint = async (table, constraintName) => {
      try {
        await queryInterface.removeConstraint(table, constraintName);
      } catch (e) {}
    };

    const safeAddIndex = async (table, fields, options) => {
      try {
        await queryInterface.addIndex(table, fields, options);
      } catch (e) {}
    };

    const safeAddConstraint = async (table, options) => {
      try {
        await queryInterface.addConstraint(table, options);
      } catch (e) {}
    };

    // Normalize EventUsers foreign keys (old migration referenced non-existent columns)
    const eventUserFkRefs = await queryInterface.getForeignKeyReferencesForTable(
      "EventUsers"
    );

    for (const fk of eventUserFkRefs) {
      if (fk.columnName === "userId" || fk.columnName === "eventId") {
        if (fk.constraintName) {
          await safeRemoveConstraint("EventUsers", fk.constraintName);
        }
      }
    }

    await queryInterface.changeColumn("EventUsers", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn("EventUsers", "eventId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await safeAddConstraint("EventUsers", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_event_users_user_id",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await safeAddConstraint("EventUsers", {
      fields: ["eventId"],
      type: "foreign key",
      name: "fk_event_users_event_id",
      references: {
        table: "Events",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Align Tithe FK nullability/actions with existing DB behavior
    await queryInterface.changeColumn("Tithes", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    await queryInterface.changeColumn("Tithes", "memberId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Enforce uniqueness on join tables and pcoId
    await safeAddIndex("UserRoles", ["userId", "roleId"], {
      unique: true,
      name: "user_role_unique_index",
    });
    await safeAddIndex("RolePermissions", ["roleId", "permissionId"], {
      unique: true,
      name: "role_permission_unique_index",
    });
    await safeAddIndex("EventUsers", ["eventId", "userId"], {
      unique: true,
      name: "event_user_unique_index",
    });
    await safeAddIndex("Users", ["pcoId"], {
      unique: true,
      name: "users_pco_id_unique_index",
    });
  },

  async down(queryInterface, Sequelize) {
    const safeRemoveIndex = async (table, indexName) => {
      try {
        await queryInterface.removeIndex(table, indexName);
      } catch (e) {}
    };

    const safeRemoveConstraint = async (table, constraintName) => {
      try {
        await queryInterface.removeConstraint(table, constraintName);
      } catch (e) {}
    };

    await safeRemoveIndex("Users", "users_pco_id_unique_index");
    await safeRemoveIndex("EventUsers", "event_user_unique_index");
    await safeRemoveIndex("RolePermissions", "role_permission_unique_index");
    await safeRemoveIndex("UserRoles", "user_role_unique_index");

    await safeRemoveConstraint("EventUsers", "fk_event_users_event_id");
    await safeRemoveConstraint("EventUsers", "fk_event_users_user_id");

    // best-effort rollback of Tithes shape
    await queryInterface.changeColumn("Tithes", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    });
    await queryInterface.changeColumn("Tithes", "memberId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    });
  },
};
