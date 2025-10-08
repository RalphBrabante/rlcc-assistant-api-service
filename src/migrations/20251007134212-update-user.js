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

    await queryInterface.changeColumn("Users", "emailAddress", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true, // 👈 ensures uniqueness at the DB level
    });

    await queryInterface.addColumn("Users", "pcoId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "isActive",
    });

    await queryInterface.addColumn("Users", "nickName", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "pcoId",
    });

    await queryInterface.addColumn("Users", "gender", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "nickName",
    });

    await queryInterface.addColumn("Users", "anniversary", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "gender",
    });

    await queryInterface.addColumn("Users", "avatar", {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: "anniversary",
    });

    await queryInterface.addColumn("Users", "birthDate", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "avatar",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.changeColumn("Users", "emailAddress", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // 👈 ensures uniqueness at the DB level
    });
    
    await queryInterface.removeColumn("Users", "pcoId");
    await queryInterface.removeColumn("Users", "nickName");
    await queryInterface.removeColumn("Users", "gender");
    await queryInterface.removeColumn("Users", "anniversary");
    await queryInterface.removeColumn("Users", "avatar");
    await queryInterface.removeColumn("Users", "birthDate");
  },
};
