"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EventUsers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userId",
        },
      },
      eventId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Events",
          key: "eventId",
        },
      },

      role: {
        type: Sequelize.ENUM("attendee", "organizer", "speaker", "admin"),
        defaultValue: "attendee",
      },

      status: {
        type: Sequelize.ENUM(
          "invited",
          "going",
          "interested",
          "declined",
          "checked_in"
        ),
        defaultValue: "invited",
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      checkedInAt: {
        type: Sequelize.DATE,
      },

      checkedOutAt: {
        type: Sequelize.DATE,
      },

      checkInMethod: {
        type: Sequelize.STRING, // or ENUM
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
    await queryInterface.dropTable("EventUsers");
  },
};
