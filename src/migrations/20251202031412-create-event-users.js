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
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Events",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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

    await queryInterface.addIndex("EventUsers", ["eventId", "userId"], {
      unique: true,
      name: "event_user_unique_index",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("EventUsers");
  },
};
