"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addIndex("GroupUsers", ["userId", "groupId"], {
      unique: true,
      name: "user_group_unique_index",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // In MySQL, FK constraints may rely on this composite index.
    // Add fallback non-unique FK indexes first, then remove the unique one.
    try {
      await queryInterface.addIndex("GroupUsers", ["userId"], {
        name: "group_users_user_id_idx",
      });
    } catch (e) {}

    try {
      await queryInterface.addIndex("GroupUsers", ["groupId"], {
        name: "group_users_group_id_idx",
      });
    } catch (e) {}

    await queryInterface.removeIndex("GroupUsers", "user_group_unique_index");
  },
};
