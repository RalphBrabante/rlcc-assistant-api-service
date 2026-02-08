"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const roles = ["ADMIN", "SUPERUSER", "ENCODER", "ACCOUNTANT", "ENDUSER"];

    const [existingRoles] = await queryInterface.sequelize.query(
      "SELECT name FROM `Roles` WHERE name IN (:roles)",
      { replacements: { roles } }
    );
    const existingNameSet = new Set(existingRoles.map((role) => role.name));

    const missingRoles = roles
      .filter((name) => !existingNameSet.has(name))
      .map((name) => ({
        name,
        createdAt: now,
        updatedAt: now,
      }));

    if (missingRoles.length) {
      await queryInterface.bulkInsert("Roles", missingRoles);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Roles",
      {
        name: ["ADMIN", "SUPERUSER", "ENCODER", "ACCOUNTANT", "ENDUSER"],
      },
      {}
    );
  },
};
