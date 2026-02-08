"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BugReports", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      pageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      scope: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "client",
      },
      severity: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "medium",
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "open",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("BugReports");
  },
};
