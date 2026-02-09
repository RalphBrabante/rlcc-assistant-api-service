"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("GroupTopicComments", "parentCommentId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "GroupTopicComments",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("GroupTopicComments", "parentCommentId");
  },
};
