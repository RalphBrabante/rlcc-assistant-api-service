"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [rows] = await queryInterface.sequelize.query(
      `
      SELECT id, name, updatedAt
      FROM Configurations
      ORDER BY name ASC, updatedAt DESC, id DESC
      `
    );

    const keepByName = new Map();
    const duplicateIds = [];

    for (const row of rows) {
      if (!keepByName.has(row.name)) {
        keepByName.set(row.name, row.id);
      } else {
        duplicateIds.push(row.id);
      }
    }

    if (duplicateIds.length > 0) {
      await queryInterface.bulkDelete(
        "Configurations",
        {
          id: duplicateIds,
        },
        {}
      );
    }

    await queryInterface.addConstraint("Configurations", {
      fields: ["name"],
      type: "unique",
      name: "unique_configurations_name",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "Configurations",
      "unique_configurations_name"
    );
  },
};
