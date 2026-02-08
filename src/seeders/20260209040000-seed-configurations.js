"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const defaults = [
      { name: "maintenance_mode", value: "false" },
      { name: "dev_mode", value: "false" },
    ];

    const [existing] = await queryInterface.sequelize.query(
      "SELECT name FROM `Configurations` WHERE name IN (:names)",
      { replacements: { names: defaults.map((config) => config.name) } }
    );
    const existingNames = new Set(existing.map((config) => config.name));

    const missing = defaults
      .filter((config) => !existingNames.has(config.name))
      .map((config) => ({
        ...config,
        createdAt: now,
        updatedAt: now,
      }));

    if (missing.length) {
      await queryInterface.bulkInsert("Configurations", missing);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Configurations",
      { name: ["maintenance_mode", "dev_mode"] },
      {}
    );
  },
};
